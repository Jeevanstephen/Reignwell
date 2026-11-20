const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/blood  — latest values for each marker
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT b1.* FROM blood_markers b1
    INNER JOIN (
      SELECT marker, MAX(test_date) AS latest FROM blood_markers WHERE user_id=? GROUP BY marker
    ) b2 ON b1.marker = b2.marker AND b1.test_date = b2.latest AND b1.user_id=?
    ORDER BY b1.marker
  `).all(req.userId, req.userId);
  res.json(rows);
});

// GET /api/blood/:marker/history
router.get('/:marker/history', (req, res) => {
  const rows = db.prepare(
    'SELECT test_date, value, unit, status FROM blood_markers WHERE user_id=? AND marker=? ORDER BY test_date'
  ).all(req.userId, req.params.marker);
  res.json(rows);
});

// POST /api/blood  — log one or more markers
router.post('/', (req, res) => {
  const entries = Array.isArray(req.body) ? req.body : [req.body];
  const insert = db.prepare(
    'INSERT INTO blood_markers (user_id, test_date, marker, value, unit, status) VALUES (?,?,?,?,?,?)'
  );
  const insertMany = db.transaction(items => items.map(e => {
    if (!e.test_date || !e.marker || e.value == null || !e.unit) throw new Error('test_date, marker, value, unit required');
    const { lastInsertRowid } = insert.run(req.userId, e.test_date, e.marker, e.value, e.unit, e.status || deriveStatus(e.marker, e.value));
    return db.prepare('SELECT * FROM blood_markers WHERE id=?').get(lastInsertRowid);
  }));
  try {
    res.status(201).json(insertMany(entries));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/blood/:id
router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM blood_markers WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM blood_markers WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// Reference ranges for common markers
const ranges = {
  'Vitamin D': { low: 20, optimal: 50, high: 100, unit: 'ng/mL' },
  'B12':        { low: 200, optimal: 400, high: 900, unit: 'pg/mL' },
  'Folate':     { low: 5, optimal: 10, high: 20, unit: 'ng/mL' },
  'Ferritin':   { low: 12, optimal: 50, high: 150, unit: 'ng/mL' },
  'Iron':       { low: 60, optimal: 100, high: 170, unit: 'µg/dL' },
  'Magnesium':  { low: 1.7, optimal: 2.0, high: 2.5, unit: 'mg/dL' },
  'Zinc':       { low: 60, optimal: 90, high: 130, unit: 'µg/dL' },
  'TSH':        { low: 0.4, optimal: 2.0, high: 4.0, unit: 'mIU/L' },
  'HbA1c':      { low: 0, optimal: 5.0, high: 5.7, unit: '%' },
  'CRP':        { low: 0, optimal: 0.5, high: 3.0, unit: 'mg/L' },
};

function deriveStatus(marker, value) {
  const r = ranges[marker];
  if (!r) return 'normal';
  if (value < r.low) return 'low';
  if (value > r.high) return 'high';
  if (value >= r.optimal) return 'optimal';
  return 'normal';
}

// GET /api/blood/ranges  — reference ranges
router.get('/ranges', (req, res) => res.json(ranges));

module.exports = router;

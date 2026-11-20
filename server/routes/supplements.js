const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/supplements
router.get('/', (req, res) => {
  const supps = db.prepare('SELECT * FROM supplements WHERE user_id=? ORDER BY timing, name').all(req.userId);
  const today = new Date().toISOString().slice(0, 10);
  const taken = db.prepare('SELECT supplement_id FROM supplement_logs WHERE user_id=? AND date=? AND taken=1').all(req.userId, today);
  const takenIds = new Set(taken.map(r => r.supplement_id));
  res.json(supps.map(s => ({ ...s, taken_today: takenIds.has(s.id) })));
});

// POST /api/supplements  — add new
router.post('/', (req, res) => {
  const { name, dose, timing } = req.body;
  if (!name || !dose) return res.status(400).json({ error: 'name and dose required' });
  const { lastInsertRowid } = db.prepare('INSERT INTO supplements (user_id, name, dose, timing) VALUES (?,?,?,?)').run(req.userId, name, dose, timing || 'morning');
  res.status(201).json(db.prepare('SELECT * FROM supplements WHERE id=?').get(lastInsertRowid));
});

// PATCH /api/supplements/:id/toggle  — mark taken today
router.patch('/:id/toggle', (req, res) => {
  const supp = db.prepare('SELECT id FROM supplements WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!supp) return res.status(404).json({ error: 'Not found' });

  const today = new Date().toISOString().slice(0, 10);
  const existing = db.prepare('SELECT id, taken FROM supplement_logs WHERE user_id=? AND supplement_id=? AND date=?').get(req.userId, req.params.id, today);

  if (existing) {
    const newTaken = existing.taken ? 0 : 1;
    db.prepare('UPDATE supplement_logs SET taken=? WHERE id=?').run(newTaken, existing.id);
    res.json({ taken: !!newTaken });
  } else {
    db.prepare('INSERT INTO supplement_logs (user_id, supplement_id, date, taken) VALUES (?,?,?,1)').run(req.userId, req.params.id, today);
    res.json({ taken: true });
  }
});

// DELETE /api/supplements/:id
router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM supplements WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM supplements WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// GET /api/supplements/streak  — daily adherence for last 30 days
router.get('/streak', (req, res) => {
  const rows = db.prepare(`
    SELECT date, COUNT(*) FILTER (WHERE taken=1) AS taken_count,
           COUNT(*) AS total_count
    FROM supplement_logs sl
    JOIN supplements s ON s.id = sl.supplement_id
    WHERE sl.user_id=? AND date >= date('now','-30 days')
    GROUP BY date ORDER BY date
  `).all(req.userId);
  res.json(rows);
});

module.exports = router;

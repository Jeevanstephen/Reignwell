const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/weight?days=30
router.get('/', (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 365);
  const rows = db.prepare(`
    SELECT date, weight_kg FROM weight_logs
    WHERE user_id=? AND date >= date('now','-${days} days')
    ORDER BY date
  `).all(req.userId);
  res.json(rows);
});

// POST /api/weight
router.post('/', (req, res) => {
  const { date, weight_kg } = req.body;
  if (!date || weight_kg == null) return res.status(400).json({ error: 'date and weight_kg required' });
  if (weight_kg < 20 || weight_kg > 500) return res.status(400).json({ error: 'Invalid weight' });

  const existing = db.prepare('SELECT id FROM weight_logs WHERE user_id=? AND date=?').get(req.userId, date);
  if (existing) {
    db.prepare('UPDATE weight_logs SET weight_kg=? WHERE id=?').run(weight_kg, existing.id);
  } else {
    db.prepare('INSERT INTO weight_logs (user_id, date, weight_kg) VALUES (?,?,?)').run(req.userId, date, weight_kg);
  }
  res.json({ date, weight_kg });
});

module.exports = router;

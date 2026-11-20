const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/food?date=YYYY-MM-DD
router.get('/', (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const logs = db.prepare('SELECT * FROM food_logs WHERE user_id=? AND date=? ORDER BY logged_at').all(req.userId, date);
  const user = db.prepare('SELECT goal_kcal, goal_protein, goal_carbs, goal_fat FROM users WHERE id=?').get(req.userId);

  const totals = logs.reduce((acc, r) => ({
    kcal: acc.kcal + r.kcal,
    protein_g: acc.protein_g + r.protein_g,
    carbs_g: acc.carbs_g + r.carbs_g,
    fat_g: acc.fat_g + r.fat_g,
  }), { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  res.json({ date, logs, totals, goals: user });
});

// POST /api/food
router.post('/', (req, res) => {
  const { date, meal, food_name, emoji, kcal, protein_g, carbs_g, fat_g, portion } = req.body;
  if (!date || !meal || !food_name || kcal == null) return res.status(400).json({ error: 'date, meal, food_name, kcal required' });

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO food_logs (user_id, date, meal, food_name, emoji, kcal, protein_g, carbs_g, fat_g, portion) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(req.userId, date, meal, food_name, emoji || '🍽️', kcal, protein_g || 0, carbs_g || 0, fat_g || 0, portion || 'm');

  res.status(201).json(db.prepare('SELECT * FROM food_logs WHERE id=?').get(lastInsertRowid));
});

// DELETE /api/food/:id
router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM food_logs WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM food_logs WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// GET /api/food/history?days=7  — daily kcal totals for sparkline
router.get('/history', (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 7, 90);
  const rows = db.prepare(`
    SELECT date, SUM(kcal) AS kcal, SUM(protein_g) AS protein_g, SUM(carbs_g) AS carbs_g, SUM(fat_g) AS fat_g
    FROM food_logs WHERE user_id=? AND date >= date('now','-${days} days')
    GROUP BY date ORDER BY date
  `).all(req.userId);
  res.json(rows);
});

module.exports = router;

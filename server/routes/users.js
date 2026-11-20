const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  ).run(name, email.toLowerCase(), hash);

  // Seed default supplements for new user
  const defaultSupps = [
    { name: 'Vitamin D3', dose: '2000 IU', timing: 'morning' },
    { name: 'Magnesium Glycinate', dose: '400mg', timing: 'evening' },
    { name: 'Folate (5-MTHF)', dose: '800mcg', timing: 'morning' },
    { name: 'Omega-3 Fish Oil', dose: '1000mg', timing: 'morning' },
    { name: 'B-Complex', dose: '1 capsule', timing: 'morning' },
  ];
  const ins = db.prepare('INSERT INTO supplements (user_id, name, dose, timing) VALUES (?, ?, ?, ?)');
  defaultSupps.forEach(s => ins.run(lastInsertRowid, s.name, s.dose, s.timing));

  const token = signToken(lastInsertRowid);
  const user = db.prepare('SELECT id, name, email, goal_kcal, goal_protein, goal_carbs, goal_fat FROM users WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user.id);
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, goal_kcal, goal_protein, goal_carbs, goal_fat, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PATCH /api/auth/goals
router.patch('/goals', requireAuth, (req, res) => {
  const { goal_kcal, goal_protein, goal_carbs, goal_fat } = req.body;
  db.prepare('UPDATE users SET goal_kcal=COALESCE(?,goal_kcal), goal_protein=COALESCE(?,goal_protein), goal_carbs=COALESCE(?,goal_carbs), goal_fat=COALESCE(?,goal_fat) WHERE id=?')
    .run(goal_kcal, goal_protein, goal_carbs, goal_fat, req.userId);
  const user = db.prepare('SELECT id, name, email, goal_kcal, goal_protein, goal_carbs, goal_fat FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});

module.exports = router;

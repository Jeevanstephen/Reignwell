const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'reignwell-dev-secret-change-in-prod';

function signToken(userId) {
  return jwt.sign({ userId }, SECRET, { expiresIn: '30d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(header.slice(7), SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { signToken, requireAuth };

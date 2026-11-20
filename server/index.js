const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, '../web')));

// API routes
app.use('/api/auth', require('./routes/users'));
app.use('/api/food', require('./routes/food'));
app.use('/api/blood', require('./routes/blood'));
app.use('/api/supplements', require('./routes/supplements'));
app.use('/api/weight', require('./routes/weight'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// SPA fallback
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../web/index.html')));

app.listen(PORT, () => console.log(`ReignWell API running on http://localhost:${PORT}`));

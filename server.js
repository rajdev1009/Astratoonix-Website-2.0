// server.js — AstraToonix v3
require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const cors       = require('cors');
const connectDB  = require('./config/db');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

// ── Database ────────────────────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── REST Routes ─────────────────────────────────────────────────
app.use('/api/content',   require('./routes/content'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));

// Expose io to routes (for future use)
app.set('io', io);

// ── Socket.io — Real-time live count ────────────────────────────
let liveCount = 0;

io.on('connection', (socket) => {
  liveCount++;
  // Broadcast updated count to ALL clients including admin panel
  io.emit('liveCount', liveCount);

  socket.on('disconnect', () => {
    liveCount = Math.max(0, liveCount - 1);
    io.emit('liveCount', liveCount);
  });
});

// HTTP fallback for live count (for polling if socket unavailable)
app.get('/api/live', (req, res) => res.json({ count: liveCount }));

// ── Serve Frontend ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 AstraToonix v3 on port ${PORT}`));

// routes/users.js
const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const User      = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// ── Helper: Live Update Sender (नया फीचर) ─────────────────────────
function emitUpdate(req, user) {
  if (user && req.app.get('io')) {
    req.app.get('io').emit('userUpdate', _safeUser(user));
  }
}

// ── REGISTER ──────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user   = new User({ email: email.toLowerCase(), password: hashed });
    await user.save();
    res.json({ success: true, user: _safeUser(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── LOGIN ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user)  return res.status(400).json({ error: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ error: 'Account blocked. Contact admin.' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Wrong password' });
    user.loginTime = new Date();
    await user.save();
    res.json({ success: true, user: _safeUser(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── LOGOUT ────────────────────────────────────────────────────────
router.post('/logout', (req, res) => res.json({ success: true }));

// ── GET ALL USERS (admin) ─────────────────────────────────────────
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    const enriched = users.map(u => ({ ...u.toObject(), status: u.getStatus() }));
    res.json({ users: enriched });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GRANT VIP — Days Based ────────────────────────────────────────
// Body: { email, days: 30 }
router.patch('/grant-days', adminAuth, async (req, res) => {
  try {
    const { email, days } = req.body;
    const d = parseInt(days) || 30;
    const expiry = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
    const user = await User.findOneAndUpdate(
      { email: email?.toLowerCase() },
      { isPremium: true, isForever: false, planExpiry: expiry, isBlocked: false, vipGrantedAt: new Date() },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found: ' + email });
    emitUpdate(req, user); // <-- Live Update
    res.json({ success: true, expiry });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GRANT VIP — Lifetime ──────────────────────────────────────────
// Body: { email }
router.patch('/grant-lifetime', adminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate(
      { email: email?.toLowerCase() },
      { isPremium: true, isForever: true, planExpiry: null, isBlocked: false, vipGrantedAt: new Date() },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found: ' + email });
    emitUpdate(req, user); // <-- Live Update
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GRANT VIP by ID (Days) ────────────────────────────────────────
router.patch('/:id/grant-days', adminAuth, async (req, res) => {
  try {
    const d      = parseInt(req.body.days) || 30;
    const expiry = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
    const user = await User.findByIdAndUpdate(req.params.id,
      { isPremium: true, isForever: false, planExpiry: expiry, vipGrantedAt: new Date(), isBlocked: false },
      { new: true }
    );
    emitUpdate(req, user); // <-- Live Update
    res.json({ success: true, expiry });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GRANT VIP by ID (Lifetime) ────────────────────────────────────
router.patch('/:id/grant-lifetime', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { isPremium: true, isForever: true, planExpiry: null, vipGrantedAt: new Date(), isBlocked: false },
      { new: true }
    );
    emitUpdate(req, user); // <-- Live Update
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── REVOKE VIP (by email or ID) ───────────────────────────────────
router.patch('/revoke/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { isPremium: false, isForever: false, planExpiry: null },
      { new: true }
    );
    emitUpdate(req, user); // <-- Live Update
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── BLOCK / UNBLOCK ───────────────────────────────────────────────
router.patch('/:id/block', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;
    await user.save();
    emitUpdate(req, user); // <-- Live Update
    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SET TRIAL ─────────────────────────────────────────────────────
router.patch('/:id/trial', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, 
      { isTrial: true, isPremium: false, isForever: false },
      { new: true }
    );
    emitUpdate(req, user); // <-- Live Update
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── MASTER RESET (wipe all users) ────────────────────────────────
router.delete('/reset-all', adminAuth, async (req, res) => {
  try {
    const { pass1, pass2, confirmText } = req.body;
    if (pass1 !== process.env.ACTION_PASSWORD_1) return res.status(403).json({ error: 'Wrong Action Password 1' });
    if (pass2 !== process.env.ACTION_PASSWORD_2) return res.status(403).json({ error: 'Wrong Action Password 2' });
    if (confirmText !== process.env.RESET_CONFIRM_TEXT) return res.status(403).json({ error: 'Wrong confirm text. Type: DELETE ALL' });
    await User.deleteMany({});
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Helper: safe user object (no password) ────────────────────────
function _safeUser(u) {
  return {
    _id:          u._id,
    email:        u.email,
    isPremium:    u.isPremium,
    isForever:    u.isForever,
    isTrial:      u.isTrial,
    isBlocked:    u.isBlocked,
    planExpiry:   u.planExpiry,
    vipGrantedAt: u.vipGrantedAt,
    status:       u.getStatus()
  };
}

module.exports = router;

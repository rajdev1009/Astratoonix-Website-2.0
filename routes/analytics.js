// routes/analytics.js
const express   = require('express');
const router    = express.Router();
const SearchLog = require('../models/SearchLog');
const adminAuth = require('../middleware/adminAuth');

// GET top search queries (admin)
router.get('/searches', adminAuth, async (req, res) => {
  try {
    const logs = await SearchLog.find().sort({ count: -1 }).limit(50);
    res.json({ logs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE a search log entry
router.delete('/searches/:id', adminAuth, async (req, res) => {
  try {
    await SearchLog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Clear all search logs
router.delete('/searches', adminAuth, async (req, res) => {
  try {
    await SearchLog.deleteMany({});
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

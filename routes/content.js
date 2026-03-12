// routes/content.js
const express   = require('express');
const router    = express.Router();
const Movie     = require('../models/Movie');
const Series    = require('../models/Series');
const SearchLog = require('../models/SearchLog');
const adminAuth = require('../middleware/adminAuth');

// ── GET all content (hidden excluded for public) ──────────────────
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.headers['x-admin-token'] === process.env.ADMIN_PASSWORD;
    const filter  = isAdmin ? {} : { isHidden: false };
    const movies  = await Movie.find(filter).sort({ createdAt: -1 });
    const series  = await Series.find(filter).sort({ createdAt: -1 });
    res.json({ movies, series });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SEARCH (logs queries) ─────────────────────────────────────────
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    if (q.length >= 2) {
      // Upsert search log — count how many times searched
      await SearchLog.findOneAndUpdate(
        { query: q.toLowerCase() },
        { $inc: { count: 1 }, lastSearched: new Date() },
        { upsert: true }
      );
    }
    const regex  = new RegExp(q, 'i');
    const movies = await Movie.find({ title: regex, isHidden: false });
    const series = await Series.find({ title: regex, isHidden: false });
    res.json({ movies, series });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ADD Movie ─────────────────────────────────────────────────────
router.post('/movies', adminAuth, async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.json({ success: true, movie });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── EDIT Movie ────────────────────────────────────────────────────
router.patch('/movies/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, movie });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── TOGGLE Hide Movie ─────────────────────────────────────────────
router.patch('/movies/:id/hide', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    movie.isHidden = !movie.isHidden;
    await movie.save();
    res.json({ success: true, isHidden: movie.isHidden });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE Movie ──────────────────────────────────────────────────
router.delete('/movies/:id', adminAuth, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ADD Series ────────────────────────────────────────────────────
router.post('/series', adminAuth, async (req, res) => {
  try {
    const series = new Series(req.body);
    await series.save();
    res.json({ success: true, series });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── EDIT Series (title/poster) ────────────────────────────────────
router.patch('/series/:id', adminAuth, async (req, res) => {
  try {
    const series = await Series.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, series });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── TOGGLE Hide Series ────────────────────────────────────────────
router.patch('/series/:id/hide', adminAuth, async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    series.isHidden = !series.isHidden;
    await series.save();
    res.json({ success: true, isHidden: series.isHidden });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE Series ─────────────────────────────────────────────────
router.delete('/series/:id', adminAuth, async (req, res) => {
  try {
    await Series.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  number:    { type: Number, required: true },
  poster:    { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  links: {
    p480:  { type: String, default: '' },
    p720:  { type: String, default: '' },
    p1080: { type: String, default: '' },
    p4k:   { type: String, default: '' }
  }
});

const seriesSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  poster:   { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  type:     { type: String, default: 'series' },
  episodes: [episodeSchema]
}, { timestamps: true });

module.exports = mongoose.model('Series', seriesSchema);

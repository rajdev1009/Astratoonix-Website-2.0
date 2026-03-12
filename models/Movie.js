const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  poster:    { type: String, required: true },
  backdrop:  { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  isHidden:  { type: Boolean, default: false },
  type:      { type: String, default: 'movie' },
  links: {
    p480:  { type: String, default: '' },
    p720:  { type: String, default: '' },
    p1080: { type: String, default: '' },
    p4k:   { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);

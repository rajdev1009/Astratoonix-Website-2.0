const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  query:        { type: String, required: true, trim: true, lowercase: true },
  count:        { type: Number, default: 1 },
  lastSearched: { type: Date,   default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SearchLog', searchLogSchema);

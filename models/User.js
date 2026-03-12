const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true },

  // Premium
  isPremium:    { type: Boolean, default: false },
  isForever:    { type: Boolean, default: false },  // Lifetime VIP
  planExpiry:   { type: Date,    default: null },    // Days-based expiry date
  vipGrantedAt: { type: Date,    default: null },

  // Account flags
  isBlocked:    { type: Boolean, default: false },  // Block login
  isTrial:      { type: Boolean, default: false },  // Trial user

  loginTime:    { type: Date, default: Date.now }
}, { timestamps: true });

// Helper method: get current status label
userSchema.methods.getStatus = function () {
  if (this.isBlocked)                    return 'blocked';
  if (this.isForever)                    return 'lifetime';
  if (this.isPremium && this.planExpiry) {
    return new Date() < this.planExpiry  ? 'active' : 'expired';
  }
  if (this.isTrial)                      return 'trial';
  return 'free';
};

// FIX: 'astratoonix_users' नाम की बिल्कुल नई और साफ कलेक्शन बनेगी
module.exports = mongoose.model('User', userSchema, 'astratoonix_users');

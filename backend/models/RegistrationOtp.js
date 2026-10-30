
const mongoose = require('mongoose');

const registrationOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  otpHash: {
    type: String,
    required: true
  },
  pendingUser: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  resendCount: {
    type: Number,
    default: 0
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RegistrationOTP', registrationOTPSchema);

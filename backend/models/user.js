const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  specialty: { type: String, trim: true },
  experience: { type: Number, min: 0 },
  qualification: { type: String, trim: true, default: '' },
  consultationFee: { type: Number, min: 0, default: 500 },
  image: { type: String, trim: true, default: '' },
  profileImage: { type: String, trim: true, default: '' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  experience: { type: String, default: '' },
  message: { type: String, default: '', maxlength: 2000 },
  resume: { filename: String, originalName: String, mimeType: String, size: Number },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'], default: 'Pending' }
}, { timestamps: true });
module.exports = mongoose.model('CareerApplication', schema);

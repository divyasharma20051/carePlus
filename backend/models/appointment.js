const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  patientName: { type: String, required: true, trim: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  phone: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1, status: 1 });
module.exports = mongoose.model('Appointment', appointmentSchema);

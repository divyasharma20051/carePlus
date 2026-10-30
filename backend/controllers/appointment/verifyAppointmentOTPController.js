const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.verifyAppointmentOTP = asyncHandler(async (req,res) => {
  const pending = req.session.pendingAppointment; const userOtp = String(req.body.otp || '').trim();
  if (!pending || Date.now() - pending.createdAt > 10 * 60 * 1000) { delete req.session.pendingAppointment; return res.status(400).json({message:'Verification expired. Please submit the appointment form again.'}); }
  if (userOtp !== pending.otp) return res.status(400).json({message:'Incorrect verification code. Please try again.'});
  const appointment = await Appointment.create({ patient:req.session.user?._id, patientName:req.session.user?.name || pending.patientName || 'Guest', phone:pending.phone, appointmentDate:pending.appointmentDate, timeSlot:pending.timeSlot, reason:pending.reason, doctor:pending.doctor || undefined });
  delete req.session.pendingAppointment;
  req.session.lastAppointmentId = String(appointment._id);
  res.status(201).json({message:'Appointment request booked successfully.', appointment});
});

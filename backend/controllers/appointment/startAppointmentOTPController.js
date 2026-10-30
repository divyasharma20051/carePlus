const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.startAppointmentOTP = asyncHandler(async (req,res) => {
  const { phone, appointmentDate, timeSlot, reason, patientName, doctor } = req.body;
  if (!/^\d{10}$/.test(String(phone || ''))) return res.status(400).json({message:'Enter a valid 10-digit phone number.'});
  if (!appointmentDate || !timeSlot || !String(reason || '').trim()) return res.status(400).json({message:'Date, time slot and reason are required.'});
  const date = new Date(appointmentDate);
  if (Number.isNaN(date.getTime()) || date < new Date(new Date().toDateString())) return res.status(400).json({message:'Choose a valid future date.'});
  if (doctor && !(await User.findOne({_id:doctor,role:'doctor',isVerified:true}))) return res.status(400).json({message:'Please choose an approved doctor.'});
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  req.session.pendingAppointment = { phone:String(phone), appointmentDate:date, timeSlot, reason:String(reason).trim(), patientName:String(patientName || req.session.user?.name || 'Guest'), doctor:doctor || null, otp, createdAt:Date.now() };
  console.log(`CarePlus appointment verification OTP for ${phone}: ${otp} (development only)`);
  res.json({message:'Verification code generated. For local development, check the backend terminal.', developmentOtp: process.env.NODE_ENV === 'production' ? undefined : otp});
});

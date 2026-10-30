const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.cancelAppointment = asyncHandler(async (req,res) => {
  const appt=await Appointment.findById(req.params.id); if(!appt) return res.status(404).json({message:'Appointment not found.'});
  const user=req.session.user;
  const owns=(user.role==='admin') || (user.role==='patient' && appt.patient && String(appt.patient)===String(user._id)) || (user.role==='doctor' && appt.doctor && String(appt.doctor)===String(user._id));
  if(!owns) return res.status(403).json({message:'You cannot change this appointment.'});
  appt.status = req.body.status && ['Confirmed','Cancelled','Completed','Pending'].includes(req.body.status) && user.role!=='patient' ? req.body.status : 'Cancelled';
  await appt.save(); res.json({message:'Appointment updated.',appointment:appt});
});

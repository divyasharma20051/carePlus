const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.myAppointments = asyncHandler(async (req,res) => {
  const user=req.session.user; let filter={};
  if(user.role==='patient') filter.patient=user._id;
  if(user.role==='doctor') filter.doctor=user._id;
  const appointments=await Appointment.find(filter).populate('doctor','name specialty').populate('patient','name email').sort({appointmentDate:-1,createdAt:-1});
  res.json({appointments});
});

const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.updateAppointmentStatus = asyncHandler(async(req,res)=>{const {status}=req.body;if(!['Pending','Confirmed','Cancelled','Completed'].includes(status))return res.status(400).json({message:'Invalid appointment status.'});const filter={_id:req.params.id};if(req.session.user.role==='doctor')filter.doctor=req.session.user._id;const a=await Appointment.findOneAndUpdate(filter,{status},{new:true}).populate('doctor','name specialty').populate('patient','name email');if(!a)return res.status(404).json({message:'Appointment not found or not assigned to this doctor.'});res.json({message:'Appointment status updated.',appointment:a});});

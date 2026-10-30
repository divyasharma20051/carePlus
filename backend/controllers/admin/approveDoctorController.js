const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.approveDoctor = asyncHandler(async(req,res)=>
    {const u=await User.findOneAndUpdate({_id:req.params.id,role:'doctor'},{isVerified:true},{new:true}).select('-password');
if(!u)return res.status(404).json({message:'Doctor not found.'});
res.json({message:'Doctor approved.',user:u});});

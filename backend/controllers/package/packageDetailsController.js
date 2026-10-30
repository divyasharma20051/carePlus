const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.packageDetails = asyncHandler(async(req,res)=>{const p=await Package.findById(req.params.id);if(!p)return res.status(404).json({message:'Health package not found.'});res.json({package:p});});

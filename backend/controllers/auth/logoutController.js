const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.logout = (req,res) => req.session.destroy(err => 
    { if (err) return res.status(500).json({message:'Could not log out.'});
     res.clearCookie('careplus.sid'); res.json({message:'Logged out.'}); });

const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.career = (req,res)=>res.json(
    {message:'Careers at CarePlus',intro:'We value talent, competency, learning and growth.',roles:[{title:'Doctors',description:'Join our clinical team.'},{title:'Nursing',description:'Deliver compassionate patient care.'},{title:'Paramedical',description:'Support diagnostics and treatment.'},{title:'Support Staff',description:'Help our hospital teams run smoothly.'}],contact:'Contact your local hospital HR team for current openings.'});

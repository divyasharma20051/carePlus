const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.submitEnquiry = asyncHandler(async (req, res) => {
    const { name, email, location, department } = req.body;
    if (!String(name || '').trim() || !/^\S+@\S+\.\S+$/.test(String(email || ''))) return res.status(400).json({ message: 'Enter your name and a valid email.' }); const enquiry = await Enquiry.create({ name: String(name).trim(), email: String(email).trim().toLowerCase(), location, department }); sendEmail(enquiry.email, enquiry.name, enquiry.location, enquiry.department, enquiry._id).catch(e => console.error('Email notification failed:', e.message)); res.status(201).json({ message: 'Thanks! Your enquiry has been received.', enquiryId: enquiry._id });
});

const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.login = asyncHandler(async (req,res) => {
  const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
  if (user.role === 'doctor' && !user.isVerified) return res.status(403).json({ message: 'Your doctor account is waiting for admin approval.' });
  req.session.user = publicUser(user);
  res.json({ message: 'Logged in successfully.', user: req.session.user });
});

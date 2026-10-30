const fs = require('fs');
const path = require('path');
const CareerApplication = require('../../models/CareerApplication');

exports.applyCareer = async (req, res) => {
  try {
    const { name, email, phone, position, experience = '', message = '' } = req.body || {};
    if (!String(name || '').trim() || !String(email || '').trim() || !String(phone || '').trim() || !String(position || '').trim()) {
      if (req.resumeFile) fs.rmSync(path.join(__dirname, '../../uploads/resumes', req.resumeFile.filename), { force: true });
      return res.status(400).json({ message: 'Name, email, phone and position are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Please enter a valid email address.' });
    const application = await CareerApplication.create({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), position: position.trim(), experience, message, resume: req.resumeFile || undefined });
    return res.status(201).json({ message: 'Your career application has been submitted successfully.', applicationId: application._id });
  } catch (error) {
    console.error('Career application error:', error.message);
    if (req.resumeFile) fs.rmSync(path.join(__dirname, '../../uploads/resumes', req.resumeFile.filename), { force: true });
    return res.status(500).json({ message: 'Unable to submit your application. Please try again.' });
  }
};

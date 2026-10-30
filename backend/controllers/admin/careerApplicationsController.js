const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const CareerApplication = require('../../models/CareerApplication');

exports.listCareerApplications = async (req, res) => {
  try { res.json({ applications: await CareerApplication.find().sort({ createdAt: -1 }).lean() }); }
  catch { res.status(500).json({ message: 'Unable to load career applications.' }); }
};
exports.updateCareerApplication = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid application ID.' });
    const status = req.body?.status;
    if (!['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid application status.' });
    const application = await CareerApplication.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    res.json({ message: 'Application status updated.', application });
  } catch { res.status(500).json({ message: 'Unable to update application.' }); }
};
exports.downloadCareerResume = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid application ID.' });
    const application = await CareerApplication.findById(req.params.id).lean();
    if (!application?.resume?.filename) return res.status(404).json({ message: 'No resume attached to this application.' });
    const file = path.join(__dirname, '../../uploads/resumes', path.basename(application.resume.filename));
    if (!fs.existsSync(file)) return res.status(404).json({ message: 'Resume file is no longer available.' });
    res.download(file, path.basename(application.resume.originalName || 'resume'));
  } catch { res.status(500).json({ message: 'Unable to download resume.' }); }
};

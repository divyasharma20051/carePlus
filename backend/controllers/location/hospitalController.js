const mongoose = require('mongoose');
const Hospital = require('../../models/Hospital');

exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load hospitals.' });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const { name, location, address = '', image = '', rating = 4.5, phone = '' } = req.body;
    if (!String(name || '').trim() || !String(location || '').trim()) return res.status(400).json({ message: 'Hospital name and location are required.' });
    const hospital = await Hospital.create({ name: String(name).trim(), location: String(location).trim(), address, image, rating, phone });
    res.status(201).json({ message: 'Hospital added successfully.', hospital });
  } catch (error) { res.status(400).json({ message: error.message || 'Failed to add hospital.' }); }
};

exports.updateHospital = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid hospital ID.' });
    const allowed = ['name', 'location', 'address', 'image', 'rating', 'phone', 'isActive'];
    const update = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found.' });
    res.json({ message: 'Hospital updated successfully.', hospital });
  } catch (error) { res.status(400).json({ message: error.message || 'Unable to update hospital.' }); }
};

exports.deleteHospital = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid hospital ID.' });
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found.' });
    res.json({ message: 'Hospital deleted successfully.' });
  } catch (error) { res.status(400).json({ message: 'Unable to delete hospital.' }); }
};

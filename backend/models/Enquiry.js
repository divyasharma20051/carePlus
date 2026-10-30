const mongoose = require('mongoose');
const enquirySchema = new mongoose.Schema({ name: { type: String, required: true },
     email: { type: String, required: true }, location: String, department: String, createdAt: { type: Date, default: Date.now } });
module.exports = mongoose.model('Enquiry', enquirySchema);

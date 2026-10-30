const mongoose = require('mongoose');
const packageSchema = new mongoose.Schema({ packageName: String, price: Number, tests: [String], category: String, gender: String });
module.exports = mongoose.model('Package', packageSchema);

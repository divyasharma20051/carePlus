const User = require('../../models/user');
const { asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

// Public doctor cards are sourced only from approved doctor accounts in MongoDB.
exports.listDoctors = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const filter = { role: 'doctor', isVerified: true };
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: regex }, { specialty: regex }];
  }
  const doctors = await User.find(filter)
    .select('name specialty experience qualification consultationFee image profileImage isVerified createdAt')
    .sort({ createdAt: -1 }).lean();
  res.json({ doctors: doctors.map(d => ({ ...d, image: d.image || d.profileImage || '' })) });
});

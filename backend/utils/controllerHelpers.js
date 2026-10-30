const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, specialty: u.specialty || '', experience: u.experience || 0, isVerified: !!u.isVerified, createdAt: u.createdAt });
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
module.exports = { publicUser, asyncHandler, escapeRegex };

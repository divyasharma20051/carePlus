function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: 'Please log in to continue.' });
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session?.user) return res.status(401).json({ message: 'Please log in to continue.' });
    if (!roles.includes(req.session.user.role)) return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    next();
  };
}
module.exports = { requireAuth, requireRole };

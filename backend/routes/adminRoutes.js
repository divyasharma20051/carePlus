const router = require('express').Router();
const c = require('../controllers/apiController');
const { requireRole } = require('../middleware/authMiddleware');
router.get('/admin/dashboard', requireRole('admin'), c.adminDashboard);
router.patch('/admin/doctors/:id/approve', requireRole('admin'), c.approveDoctor);
router.delete('/admin/users/:id', requireRole('admin'), c.deleteUser);
router.patch('/admin/appointments/:id', requireRole('admin'), c.updateAppointmentStatus);
module.exports = router;

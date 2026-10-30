const router = require('express').Router();
const c = require('../controllers/apiController');
const { requireRole } = require('../middleware/authMiddleware');
router.get('/doctors', c.listDoctors);
router.patch('/doctor/appointments/:id', requireRole('doctor'), c.updateAppointmentStatus);
module.exports = router;

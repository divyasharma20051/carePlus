const router = require('express').Router();
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'CarePlus API' }));
for (const route of [
  require('./authRoutes'),
  require('./doctorRoutes'),
  require('./appointmentRoutes'),
  require('./adminRoutes'),
  require('./packageRoutes'),
  require('./enquiryRoutes'),
  require('./locationRoutes'),
  require('./careerRoutes'),
  require('./paymentRoutes')
]) {
  router.use(route);
}
module.exports = router;

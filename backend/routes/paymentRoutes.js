const router = require('express').Router();
const payment = require('../controllers/paymentController');
router.post('/payments/appointment/order', payment.createAppointmentPaymentOrder);
router.post('/payments/appointment/verify', payment.verifyAppointmentPayment);
module.exports = router;

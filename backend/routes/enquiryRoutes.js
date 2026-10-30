const router = require('express').Router();
const c = require('../controllers/apiController');
router.post('/enquiries', c.submitEnquiry);
module.exports = router;

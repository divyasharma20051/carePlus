const router = require('express').Router();
const c = require('../controllers/apiController');
router.get('/packages', c.listPackages);
router.get('/packages/:id', c.packageDetails);
module.exports = router;

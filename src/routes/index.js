const router = require('express').Router();


router.use('/role', require('./roles.route'));
router.use('/user', require('./user.route'));

module.exports = router;
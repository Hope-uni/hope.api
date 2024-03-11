const router = require('express').Router();


router.use('/role', require('./roles.route'));
router.use('/user', require('./user.route'));
router.use('/auth', require('./auth.route'));

module.exports = router;
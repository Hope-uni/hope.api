const router = require('express').Router();


router.use('/role', require('./roles.route'));

module.exports = router;
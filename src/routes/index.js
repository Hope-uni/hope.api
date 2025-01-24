const router = require('express').Router();


router.use('/role', require('./roles.route'));
router.use('/user', require('./user.route'));
router.use('/auth', require('./auth.route'));
router. use('/therapist', require('./therapist.route'));
router.use('/tutor', require('./tutor.route'));
router.use('/patient', require('./patient.route'));
router.use('/category', require('./category.route'));
router.use('/pictogram', require('./pictogram.route'));
router.use('/patientPictogram', require('./patientPictograms.route'));
router.use('/phase', require('./phase.route'));

module.exports = router;
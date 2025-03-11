const router = require('express').Router();
const {
  addPatientObservation
} = require('@controllers/observations.controller');
const {
  verifyToken,
  rolePermissions
} = require('@middlewares');
const {
  SUPERADMIN_ROLE,
  ADMIN_ROLE,
  THERAPIST_ROLE
} = require('../constants/role.constant');

router.post('/id-patient', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE], ['crear observaciones']), addPatientObservation);

module.exports = router;

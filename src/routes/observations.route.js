const router = require('express').Router();
const {
  addPatientObservation
} = require('@controllers/observations.controller');
const {
  verifyToken,
  rolePermissions
} = require('@middlewares');
const {
  roleConstants: { ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE },
  permissionsConstants: {
    ADD_OBSERVATION
  }
} = require('@constants');

router.post('/id-patient', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE], [ADD_OBSERVATION]), addPatientObservation);

module.exports = router;

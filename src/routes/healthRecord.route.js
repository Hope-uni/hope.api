const router = require('express').Router();
const {
  changeMonochrome
} = require('@controllers/healthRecord.controller');
const {
  verifyToken,
  rolePermissions
} = require('@middlewares');
const {
  roleConstants: { ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE },
  permissionsConstants: {
    UPDATE_PATIENT
  }
} = require('@constants');

router.patch('/change-monochrome/:id', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE],[UPDATE_PATIENT]), changeMonochrome);

module.exports = router;

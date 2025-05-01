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
    CHANGE_MONOCHROME
  }
} = require('@constants');

router.patch('/change-monochrome/:id', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE],[CHANGE_MONOCHROME]), changeMonochrome);

module.exports = router;

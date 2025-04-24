const router = require('express').Router();
const {
  allTeaDegrees
} = require('@controllers/teaDegree.controller');
const {
  verifyToken,
  rolePermissions,
} = require('@middlewares');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE },
  permissionsConstants: {
    LIST_TEA_DEGREE
  }
} = require('@constants');



router.get('', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[LIST_TEA_DEGREE]), allTeaDegrees);


module.exports = router;

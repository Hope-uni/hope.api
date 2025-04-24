const router = require('express').Router();
const {
  login,
  forgotPassword,
  resetPassword,
  me,
  getRefreshToken,
  removeToken,
  changePassword,
  changePasswordPatient
} = require('@controllers/auth.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');
const {
  roleConstants: { ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE, THERAPIST_ROLE, PATIENT_ROLE },
  permissionsConstants: {
    CHANGE_PASSWORD_ASSIGNED_PATIENT,
    GET_PROFILE
  }
} = require('@constants');


router.put('/:id', verifyToken, rolePermissions([
  ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE
],[CHANGE_PASSWORD_ASSIGNED_PATIENT]) ,changePasswordPatient);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', verifyToken ,resetPassword);

router.post('/change-password', verifyToken ,changePassword);


router.get('/me', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE, THERAPIST_ROLE, PATIENT_ROLE],[GET_PROFILE]), me);

router.post('/newToken', getRefreshToken);

router.post('/removeToken', removeToken);

module.exports = router;

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



router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', verifyToken ,resetPassword);

router.post('/change-password', verifyToken ,changePassword);

router.put('/:id', verifyToken, rolePermissions([
  'Superadmin',
  'Admin',
  'Tutor'
],[]) ,changePasswordPatient);

router.get('/me', verifyToken,me);

router.post('/newToken', getRefreshToken);

router.post('/removeToken', removeToken);

module.exports = router;
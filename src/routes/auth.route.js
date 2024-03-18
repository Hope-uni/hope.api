const router = require('express').Router();
const {
  login,
  forgotPassword,
  resetPassword,
  me,
  getRefreshToken,
  removeToken,
} = require('@controllers/auth.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');



router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', verifyToken ,resetPassword);

router.get('/me', verifyToken, rolePermissions(['Superadmin'],['']) ,me);

router.post('/newToken', getRefreshToken);

router.post('/removeToken', removeToken);

module.exports = router;
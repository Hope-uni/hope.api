const router = require('express').Router();
const {
  changeMonochrome
} = require('@controllers/healthRecord.controller');
const {
  verifyToken,
  rolePermissions
} = require('@middlewares');


router.patch('/change-monochrome/:id', verifyToken, rolePermissions(['Superadmin','Admin', 'Tutor'],['modificar paciente-tutor']), changeMonochrome);

module.exports = router;

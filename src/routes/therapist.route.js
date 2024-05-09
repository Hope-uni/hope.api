const router = require('express').Router();
const {
  all,
  findTherapist,
  createTherapist,
  updateTherapist,
  removeTherapist
} = require('@controllers/therapist.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');



router.get('/', verifyToken, rolePermissions(['Superadmin','Admin'],['listar terapeutas']), all);

router.get('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['buscar terapeutas']), findTherapist);

router.post('/', verifyToken, rolePermissions(['Superadmin','Admin'],['crear terapeutas']), createTherapist);

router.put('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['actualizar terapeutas']), updateTherapist);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['borrar terapeutas']), removeTherapist);

module.exports = router;
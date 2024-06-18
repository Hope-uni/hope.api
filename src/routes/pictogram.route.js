const router = require('express').Router();
const {
  all,
  findOne,
  create,
  update,
  removePictogram
} = require('@controllers/pictogram.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');

router.get('/', verifyToken, rolePermissions(['Superadmin', 'Admin','Terapeuta','Tutor'],['listar pictogramas']), all);
router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin','Terapeuta','Tutor'],['buscar pictogramas']), findOne);

router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin'],['listar pictogramas']), create);

router.put('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['actualizar pictogramas']), update);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['borrar pictogramas']), removePictogram);


module.exports = router;
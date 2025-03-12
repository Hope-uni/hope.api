const router = require('express').Router();
const {
  all,
  create,
  update,
  findOne,
  remove
} = require('@controllers/category.controller');
const { verifyToken, rolePermissions } = require('../middlewares/index');


router.get('/', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta', 'Tutor'],['listar categorias']), all);
router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['buscar categorias']), findOne);

router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin'],['crear categorias']), create);

router.put('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['actualizar categorias']), update);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['borrar categorias']), remove);


module.exports = router;

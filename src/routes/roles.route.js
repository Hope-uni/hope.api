const router = require('express').Router();
const {
  all,
  findOne,
  create,
  update,
  deleteRole
} = require('@controllers/roles.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');

router.get('/',verifyToken, rolePermissions(['Superadmin','Admin'],['listar roles']), all);

router.get('/:id',verifyToken, rolePermissions(['Superadmin','Admin'],['buscar roles']), findOne);

router.post('/',verifyToken, rolePermissions(['Superadmin','Admin'],['crear roles']), create);

router.put('/:id',verifyToken, rolePermissions(['Superadmin','Admin'],['actualizar roles']), update);

router.delete('/:id',verifyToken, rolePermissions(['Superadmin','Admin'],['borrar roles']), deleteRole);

module.exports = router;
const router = require('express').Router();
const {
  all,
  findOne,
  create,
  update,
  deleteRole
} = require('@controllers/roles.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');

router.get('/',verifyToken, rolePermissions(['Superadmin'],['listar roles']), all);

router.get('/:id',verifyToken, rolePermissions(['Superadmin'],['listar roles']), findOne);

router.post('/',verifyToken, rolePermissions(['Superadmin'],['listar roles']), create);

router.put('/:id',verifyToken, rolePermissions(['Superadmin'],['listar roles']), update);

router.delete('/:id',verifyToken, rolePermissions(['Superadmin'],['listar roles']), deleteRole);

module.exports = router;
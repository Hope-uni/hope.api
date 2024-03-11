const router = require('express').Router();
const {
  all,
  findUser,
  create,
  update,
  removeUser,
} = require('@controllers/user.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('/', verifyToken, rolePermissions(['Superadmin'],['listar usuarios']), verifyToken, all);

router.get('/:id', verifyToken, rolePermissions(['Superadmin'],['buscar usuarios']), findUser);

router.post('/', verifyToken, rolePermissions(['Superadmin'],['crear usuarios']) ,create);

router.put('/:id', verifyToken, rolePermissions(['Superadmin'],['actualizar usuarios']), update);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin'],['borrar usuarios']), removeUser);

module.exports = router;
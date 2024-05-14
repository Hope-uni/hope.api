const router = require('express').Router();
const {
  all,
  findUser,
  create,
  update,
  removeUser,
  addRolesUser,
  removeRolesUser
} = require('@controllers/user.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('/', verifyToken, rolePermissions(['Superadmin','Admin'],['listar usuarios']), verifyToken, all);

router.get('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['buscar usuarios']), findUser);

router.post('/', verifyToken, rolePermissions(['Superadmin','Admin'],['crear usuarios']) ,create);

router.put('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['actualizar usuarios']), update);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['borrar usuarios']), removeUser);

router.post('/addRole', verifyToken, rolePermissions(['Superadmin','Admin'],[' ']), addRolesUser);

router.post('/removeRole', verifyToken, rolePermissions(['Superadmin','Admin'],[' ']), removeRolesUser);

module.exports = router;
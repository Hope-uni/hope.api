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
const { verifyToken, rolePermissions } = require('@middlewares');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE },
  permissionsConstants: {
    LIST_USER,
    GET_USER,
    CREATE_USER,
    UPDATE_USER,
    DELETE_USER
  }
} = require('../constants');


router.get('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[LIST_USER]), verifyToken, all);

router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[GET_USER]), findUser);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_USER]) ,create);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[UPDATE_USER]), update);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_USER]), removeUser);

router.post('/addRole', verifyToken, rolePermissions([SUPERADMIN_ROLE]), addRolesUser);

router.post('/removeRole', verifyToken, rolePermissions([SUPERADMIN_ROLE]), removeRolesUser);

module.exports = router;

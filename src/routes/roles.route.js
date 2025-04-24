const router = require('express').Router();
const {
  all,
  findOne,
  create,
  update,
  deleteRole
} = require('@controllers/roles.controller');
const { verifyToken, rolePermissions } = require('@middlewares');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE },
  permissionsConstants: {
    LIST_ROLE,
    GET_ROLE,
    SEARCH_ROLE,
    CREATE_ROLE,
    UPDATE_ROLE,
    DELETE_ROLE
  }
} = require('@constants');

router.get('/',verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[LIST_ROLE]), all);

router.get('/:id',verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[GET_ROLE, SEARCH_ROLE]), findOne);

router.post('/',verifyToken, rolePermissions([SUPERADMIN_ROLE],[CREATE_ROLE]), create);

router.put('/:id',verifyToken, rolePermissions([SUPERADMIN_ROLE],[UPDATE_ROLE]), update);

router.delete('/:id',verifyToken, rolePermissions([SUPERADMIN_ROLE],[DELETE_ROLE]), deleteRole);

module.exports = router;

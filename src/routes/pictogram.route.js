const router = require('express').Router();
const {
  all,
  findOne,
  create,
  update,
  removePictogram
} = require('@controllers/pictogram.controller');
const { verifyToken, rolePermissions } = require('@middlewares');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE },
  permissionsConstants: {
    LIST_PICTOGRAM,
    GET_PICTOGRAM,
    CREATE_PICTOGRAM,
    UPDATE_PICTOGRAM,
    DELETE_PICTOGRAM
  }
} = require('@constants');

router.get('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[LIST_PICTOGRAM]), all);
router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[GET_PICTOGRAM]), findOne);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_PICTOGRAM]), create);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[UPDATE_PICTOGRAM]), update);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_PICTOGRAM]), removePictogram);


module.exports = router;

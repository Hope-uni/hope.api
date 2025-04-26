const router = require('express').Router();
const {
  all,
  create,
  update,
  findOne,
  remove
} = require('@controllers/category.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');
const {
  roleConstants: { ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE, THERAPIST_ROLE, PATIENT_ROLE },
  permissionsConstants: {
    LIST_CATEGORY,
    GET_CATEGORY,
    CREATE_CATEGORY,
    UPDATE_CATEGORY,
    DELETE_CATEGORY
  }
} = require('@constants');


router.get('/', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE, THERAPIST_ROLE, PATIENT_ROLE],[LIST_CATEGORY]), all);
router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[GET_CATEGORY]), findOne);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_CATEGORY]), create);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[UPDATE_CATEGORY]), update);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_CATEGORY]), remove);


module.exports = router;

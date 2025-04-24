const router = require('express').Router();
const {
  all,
  find,
  create,
  update,
  deleteAchievement,
  assign,
  unassign
} = require('@controllers/achievements.controller');
const {
  verifyToken,
  rolePermissions
} = require('@middlewares');
const {
  roleConstants: {
    ADMIN_ROLE,
    SUPERADMIN_ROLE,
    THERAPIST_ROLE,
  },
  permissionsConstants: {
    LIST_ACHIEVEMENT,
    CREATE_ACHIEVEMENT,
    UPDATE_ACHIEVEMENT,
    DELETE_ACHIEVEMENT,
    ASSIGN_ACHIEVEMENT,
    UNASSIGN_ACHIEVEMENT,
    GET_ACHIEVEMENT,
  },
} = require('@constants');



router.get('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[LIST_ACHIEVEMENT]), all);
router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[GET_ACHIEVEMENT]), find);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_ACHIEVEMENT]), create);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[UPDATE_ACHIEVEMENT]), update);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_ACHIEVEMENT]), deleteAchievement);

router.post('/assign-achievement', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[ASSIGN_ACHIEVEMENT]), assign);
router.post('/unassign-achievement', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE], [UNASSIGN_ACHIEVEMENT]), unassign);


module.exports = router;

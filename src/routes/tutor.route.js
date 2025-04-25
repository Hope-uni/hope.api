const router = require('express').Router();
const {
  allTutors,
  findTutor,
  createTutor,
  update,
  removeTutor,
  allPatientsTutor
} = require('@controllers/tutor.controller');
const { verifyToken, rolePermissions } = require('@middlewares');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE },
  permissionsConstants: {
    LIST_TUTOR,
    GET_TUTOR,
    CREATE_TUTOR,
    UPDATE_TUTOR,
    DELETE_TUTOR,
    LIST_ASSIGNED_PATIENT,
    UPDATE_PROFILE
  }
} = require('@constants');


router.get('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[LIST_TUTOR]), allTutors);
router.get('/patients', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[LIST_ASSIGNED_PATIENT]), allPatientsTutor);
router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[GET_TUTOR]), findTutor);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_TUTOR]), createTutor);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[UPDATE_TUTOR, UPDATE_PROFILE]), update);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_TUTOR]), removeTutor);


module.exports = router;

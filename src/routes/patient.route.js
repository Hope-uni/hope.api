const router = require('express').Router();
const {
  all,
  createPatient,
  findPatient,
  updatePatient,
  removePatient,
  allPatientsWithoutTherapist,
  allPatientsAvailableForActivities,
  changeTherapist
} = require('@controllers/patient.controller');
const { verifyToken, rolePermissions } = require('@middlewares');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE, TUTOR_ROLE },
  permissionsConstants: {
    LIST_PATIENT,
    LIST_ASSIGNED_PATIENT,
    GET_PATIENT,
    CREATE_PATIENT,
    UPDATE_PATIENT,
    DELETE_PATIENT
  }
} = require('@constants');


router.get('/', verifyToken, rolePermissions(['Superadmin','Admin'],[LIST_PATIENT]), all);
router.get('/patients-therapist', verifyToken, rolePermissions([SUPERADMIN_ROLE,ADMIN_ROLE]), allPatientsWithoutTherapist);
router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE, TUTOR_ROLE],[GET_PATIENT]), findPatient);
router.get('/availableForActivity/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE, ],[LIST_ASSIGNED_PATIENT]), allPatientsAvailableForActivities);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_PATIENT]), createPatient);

router.patch('/change-therapist/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[UPDATE_PATIENT]), changeTherapist);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[UPDATE_PATIENT]), updatePatient);


router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_PATIENT]), removePatient);

module.exports = router;

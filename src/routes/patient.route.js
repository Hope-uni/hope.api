const router = require('express').Router();
const multer = require('multer');
const {
  all,
  createPatient,
  findPatient,
  updatePatient,
  removePatient,
  allPatientsWithoutTherapist,
  allPatientsAvailableForActivities,
  changeTherapist,
  assignTherapist
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
    DELETE_PATIENT,
    ASSIGN_THERAPIST,
    CHANGE_THERAPIST,
  }
} = require('../constants');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyToken, rolePermissions(['Superadmin','Admin'],[LIST_PATIENT]), all);
router.get('/patients-therapist', verifyToken, rolePermissions([SUPERADMIN_ROLE,ADMIN_ROLE], [LIST_PATIENT]), allPatientsWithoutTherapist);
router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE, TUTOR_ROLE],[GET_PATIENT]), findPatient);
router.get('/availableForActivity/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE, ],[LIST_ASSIGNED_PATIENT]), allPatientsAvailableForActivities);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_PATIENT]), upload.single('imageFile'), createPatient);
router.post('/assignTherapist', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[ASSIGN_THERAPIST]), assignTherapist);

router.patch('/change-therapist/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CHANGE_THERAPIST]), changeTherapist);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[UPDATE_PATIENT]), upload.single('imageFile'), updatePatient);



router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_PATIENT]), removePatient);

module.exports = router;

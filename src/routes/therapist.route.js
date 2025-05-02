const router = require('express').Router();
const multer = require('multer');
const {
  all,
  findTherapist,
  createTherapist,
  updateTherapist,
  removeTherapist,
  allPatientsTherapist
} = require('@controllers/therapist.controller');
const { verifyToken, rolePermissions } = require('@middlewares');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE },
  permissionsConstants: {
    LIST_ASSIGNED_PATIENT,
    LIST_THERAPIST,
    GET_THERAPIST,
    CREATE_THERAPIST,
    DELETE_THERAPIST,
    UPDATE_PROFILE,
    UPDATE_THERAPIST
  }
} = require('@constants');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[LIST_THERAPIST]), all);

router.get('/patients', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE], [LIST_ASSIGNED_PATIENT]), allPatientsTherapist);

router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[GET_THERAPIST]), findTherapist);


router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_THERAPIST]), upload.single('imageFile'), createTherapist);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[UPDATE_PROFILE,UPDATE_THERAPIST]), upload.single('imageFile'), updateTherapist);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_THERAPIST]), removeTherapist);

module.exports = router;

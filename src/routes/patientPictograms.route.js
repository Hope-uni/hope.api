const multer = require('multer');
const router = require('express').Router();
const {
  all,
  allCustomPictograms,
  create,
  update,
  removePatientPictogram
} = require('@controllers/patientPictograms.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE, PATIENT_ROLE },
  permissionsConstants: {
    LIST_CUSTOM_PICTOGRAM,
    LIST_PICTOGRAM,
    CREATE_CUSTOM_PICTOGRAM,
    UPDATE_CUSTOM_PICTOGRAM,
    DELETE_CUSTOM_PICTOGRAM
  }
} = require('@constants');


const upload = multer({ storage: multer.memoryStorage() });


router.get('/', verifyToken, rolePermissions([PATIENT_ROLE],[LIST_CUSTOM_PICTOGRAM]), verifyToken, all);

router.get('/patient-pictograms/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[LIST_PICTOGRAM]), allCustomPictograms);

router.post('/', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[CREATE_CUSTOM_PICTOGRAM]), upload.single('imageFile'), create);

router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[UPDATE_CUSTOM_PICTOGRAM]), upload.single('imageFile'), update);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, TUTOR_ROLE],[DELETE_CUSTOM_PICTOGRAM]), removePatientPictogram);

module.exports = router;

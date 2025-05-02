const router = require('express').Router();
const multer = require('multer');
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


const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, TUTOR_ROLE, THERAPIST_ROLE, PATIENT_ROLE],[LIST_CATEGORY]), all);
router.get('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[GET_CATEGORY]), findOne);

router.post('/',
  verifyToken,
  rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[CREATE_CATEGORY]),
  upload.single('imageFile'),
  create);

router.put('/:id',
  verifyToken,
  rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[UPDATE_CATEGORY]),
  upload.single('imageFile'),
  update);

router.delete('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[DELETE_CATEGORY]), remove);


module.exports = router;

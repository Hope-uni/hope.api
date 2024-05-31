const router = require('express').Router();
const {
  all,
  create,
  update,
  removePatientPictogram
} = require('@controllers/patientPictogram.controller');
const { verifyToken } = require('@middlewares/index');


router.get('/', verifyToken, all);

router.post('/', verifyToken, create);

router.put('/:id', verifyToken, update);

router.delete('/:id', verifyToken, removePatientPictogram);



module.exports = router;
const router = require('express').Router();
const {
  all,
  findPatient,
  createPatient,
  updatePatient,
  removePatient
} = require('@controllers/patient.controller');

router.get('/', all);

router.get('/:id', findPatient);

router.post('/', createPatient);

router.put('/:id', updatePatient);

router.delete('/:id', removePatient);

module.exports = router;
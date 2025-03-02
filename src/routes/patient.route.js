const router = require('express').Router();
const {
  all,
  createPatient,
  findPatient,
  updatePatient,
  removePatient,
  allPatientsWithoutTherapist
} = require('@controllers/patient.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('/', verifyToken, rolePermissions(['Superadmin','Admin'],['listar pacientes']), all);
router.get('/patients-therapist', verifyToken, rolePermissions(['Superadmin','Admin']), allPatientsWithoutTherapist);
router.get('/:id', verifyToken, rolePermissions(['Superadmin','Admin','Terapeuta'],['buscar pacientes']), findPatient);

router.post('/', verifyToken, rolePermissions(['Superadmin','Admin'],['crear pacientes']), createPatient);

router.put('/:id', verifyToken, rolePermissions(
  ['Superadmin','Admin','Terapeuta', 'Tutor'],
  ['actualizar pacientes','modificar paciente-tutor','modificar paciente-terapeuta']
), updatePatient);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['borrar pacientes']), removePatient);

module.exports = router;

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


router.get('/', verifyToken, rolePermissions(['Superadmin','Admin'],['listar pacientes']), all);
router.get('/patients-therapist', verifyToken, rolePermissions(['Superadmin','Admin']), allPatientsWithoutTherapist);
router.get('/:id', verifyToken, rolePermissions(['Superadmin','Admin','Terapeuta', 'Tutor'],['buscar pacientes']), findPatient);
router.get('/availableForActivity/:id', verifyToken, rolePermissions(['Superadmin','Admin','Terapeuta'],['listar pacientes']), allPatientsAvailableForActivities);

router.post('/', verifyToken, rolePermissions(['Superadmin','Admin'],['crear pacientes']), createPatient);

router.patch('/change-therapist/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['actualizar pacientes']), changeTherapist);

router.put('/:id', verifyToken, rolePermissions(
  ['Superadmin','Admin', 'Tutor'],
  ['actualizar pacientes','modificar paciente-tutor','modificar paciente-terapeuta']
), updatePatient);


router.delete('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['borrar pacientes']), removePatient);

module.exports = router;

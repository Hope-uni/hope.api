const router = require('express').Router();
const {
  all,
  findTherapist,
  createTherapist,
  updateTherapist,
  removeTherapist,
  assignPatient,
  allPatientsTherapist
} = require('@controllers/therapist.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');



router.get('/', verifyToken, rolePermissions(['Superadmin','Admin'],['listar terapeutas']), all);

router.get('/patients', verifyToken, rolePermissions(['Superadmin','Admin','Terapeuta'], ['listar pacientes']), allPatientsTherapist);

router.get('/:id', verifyToken, rolePermissions(['Superadmin','Admin', 'something'],['buscar terapeutas']), findTherapist);


router.post('/', verifyToken, rolePermissions(['Superadmin','Admin'],['crear terapeutas']), createTherapist);

router.post('/assignPatient', verifyToken, rolePermissions(['Superadmin','Admin']), assignPatient);

router.put('/:id', verifyToken, rolePermissions(['Superadmin','Admin','Terapeuta'],['actualizar terapeutas', 'actualizar perfil']), updateTherapist);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['borrar terapeutas']), removeTherapist);

module.exports = router;
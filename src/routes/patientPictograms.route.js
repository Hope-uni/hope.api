const router = require('express').Router();
const {
  all,
  allCustomPictograms,
  create,
  update,
  removePatientPictogram
} = require('@controllers/patientPictogram.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin','Tutor', 'Paciente'],['listar pictogramas-personalizados']), verifyToken, all);

router.get('/patient-pictograms/:id', verifyToken, rolePermissions(['Superadmin', 'Admin','Tutor'],['listar pictogramas-personalizados']), verifyToken, allCustomPictograms);

router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin','Tutor'],['crear pictogramas-personalizados']), create);

router.put('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin','Tutor'],['actualizar pictogramas-personalizados']), update);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin','Tutor'],['borrar pictogramas-personalizados']), removePatientPictogram);

module.exports = router;

const router = require('express').Router();
const  {
  allPhases,
  udpatePhase,
  patientPhaseShifting
} = require('@controllers/phase.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('', verifyToken, rolePermissions(['Admin','Superadmin'],['listar fases']), allPhases);

router.put('/:patientId', verifyToken, rolePermissions(['Admin','Superadmin', 'Terapeuta'],['modificar paciente-terapeuta']), patientPhaseShifting );

router.put('/:id', verifyToken, rolePermissions(['Admin', 'Superadmin'],['actualizar fase']), udpatePhase);


module.exports = router;

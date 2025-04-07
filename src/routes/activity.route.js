const router = require('express').Router();
const {
  allActivities,
  createActivity,
  assignActivity,
  findActivity,
  checkActivityPatient,
  unAssignActivity,
  deleteActivity,
  currentPatientActivity,
} = require('@controllers/activity.controller');
const { verifyToken, rolePermissions } = require('@middlewares');


router.get('/', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['listar actividades']), allActivities);
router.get('/current-activity', verifyToken, rolePermissions(['Paciente'],['listar actividades']), currentPatientActivity);
router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['buscar actividades']), findActivity);

router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['crear actividades']), createActivity);
router.post('/assign', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['asignar-actividad']), assignActivity);
router.post('/unassign', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['desasignar-actividad']), unAssignActivity);
router.post('/check', verifyToken, rolePermissions(['Paciente'],['verify-activity-answer']), checkActivityPatient);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['borrar actividades']), deleteActivity);

module.exports = router;

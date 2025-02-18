const router = require('express').Router();
const {
  allActivities,
  createActivity,
  assignActivity,
  findActivity,
  checkActivityPatient,
  unAssignActivity,
  deleteActivity,
  updateActivity,
  reAssignActivity,
} = require('@controllers/activity.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('/', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['listar actividades']), allActivities);
router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['buscar actividades']), findActivity);

router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['crear actividades']), createActivity);
router.post('/assign', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['asignar actividades']), assignActivity);
router.post('/unassign', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['desasignar actividades']), unAssignActivity);
router.post('/check', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Paciente'],['verificar respuesta de actividades']), checkActivityPatient);
router.post('/reassign', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['reasignar actividades']), reAssignActivity);

router.put('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['actualizar actividades']), updateActivity);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['borrar actividades']), deleteActivity);	

module.exports = router;
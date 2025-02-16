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


router.get('/', verifyToken, rolePermissions(['Superadmin', 'Admin'],['listar actividades']), allActivities);
router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['buscar actividades']), findActivity);

router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin'],['crear actividades']), createActivity);
router.post('/assign', verifyToken, rolePermissions(['Superadmin', 'Admin'],['asignar actividades']), assignActivity);
router.post('/unassign', verifyToken, rolePermissions(['Superadmin', 'Admin'],['desasignar actividades']), unAssignActivity);
router.post('/check', verifyToken, rolePermissions(['Superadmin', 'Admin'],['verificar respuesta de actividades']), checkActivityPatient);
router.post('/reassign', verifyToken, rolePermissions(['Superadmin', 'Admin'],['reasignar actividades']), reAssignActivity);

router.put('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['actualizar actividades']), updateActivity);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['borrar actividades']), deleteActivity);

module.exports = router;
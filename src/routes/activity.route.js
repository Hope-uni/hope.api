const router = require('express').Router();
const {
  allActivities,
  createActivity,
  assignActivity,
  findActivity,
} = require('@controllers/activity.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('/', verifyToken, rolePermissions(['Superadmin', 'Admin'],['listar actividades']), allActivities);
router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin'],['crear actividades']), createActivity);
router.post('/assign', verifyToken, rolePermissions(['Superadmin', 'Admin'],['asignar actividades']), assignActivity);
router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['buscar actividades']), findActivity);

module.exports = router;
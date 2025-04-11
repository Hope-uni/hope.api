const router = require('express').Router();
const {
  all,
  find,
  create,
  update,
  deleteAchievement,
  assign
} = require('../controllers/achievements.controller');
const {
  verifyToken,
  rolePermissions
} = require('../middlewares');



router.get('/', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['listar logros']), all);
router.get('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['buscar logros']), find);

router.post('/', verifyToken, rolePermissions(['Superadmin', 'Admin'],['crear logros']), create);

router.put('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['actualizar logros']), update);

router.delete('/:id', verifyToken, rolePermissions(['Superadmin', 'Admin'],['borrar logros']), deleteAchievement);

router.post('/assign', verifyToken, rolePermissions(['Superadmin', 'Admin', 'Terapeuta'],['asignar-logros']), assign);


module.exports = router;
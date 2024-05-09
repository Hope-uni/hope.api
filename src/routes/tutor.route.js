const router = require('express').Router();
const {
  allTutors,
  findTutor,
  createTutor,
  update,
  removeTutor
} = require('@controllers/tutor.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');


router.get('/', verifyToken, rolePermissions(['Superadmin','Admin','Terapeuta'],['listar tutores']), allTutors);
router.get('/:id', verifyToken, rolePermissions(['Superadmin','Admin','Terapeuta'],['buscar tutores']), findTutor);
router.post('/', verifyToken, rolePermissions(['Superadmin','Admin'],['crear tutores']), createTutor);
router.put('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['actualizar tutores']), update);
router.delete('/:id', verifyToken, rolePermissions(['Superadmin','Admin'],['borrar tutores']), removeTutor);


module.exports = router;
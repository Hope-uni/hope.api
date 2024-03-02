const router = require('express').Router();
const {
  all,
  findOne,
  create,
  update,
  deleteRole
} = require('@controllers/roles.controller');

router.get('/', all);

router.get('/:id', findOne);

router.post('/', create);

router.put('/:id', update);

router.delete('/:id', deleteRole);

module.exports = router;
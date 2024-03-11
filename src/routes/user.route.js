const router = require('express').Router();
const {
  all,
  findUser,
  create,
  update,
  removeUser,
} = require('@controllers/user.controller');


router.get('/', all);

router.get('/:id', findUser);

router.post('/', create);

router.put('/:id', update);

router.delete('/:id', removeUser);

module.exports = router;
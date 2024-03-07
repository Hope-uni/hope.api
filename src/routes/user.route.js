const router = require('express').Router();
const {
  all,
  findUser,
} = require('../controllers/user.controller');


router.get('/', all);
router.get('/:id', findUser);

module.exports = router;
const router = require('express').Router();
const {
  allTeaDegrees
} = require('@controllers/teaDegree.controller');
const {
  verifyToken,
} = require('@middlewares/index');



router.get('', verifyToken, allTeaDegrees);


module.exports = router;
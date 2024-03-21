const router = require('express').Router();
const {
  all
} = require('@controllers/therapist.controller');



router.get('/', all);

module.exports = router;
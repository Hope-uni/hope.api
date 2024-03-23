const router = require('express').Router();
const {
  all,
  findTherapist,
  createTherapist,
  updateTherapist,
  removeTherapist
} = require('@controllers/therapist.controller');



router.get('/', all);

router.get('/:id', findTherapist);

router.post('/', createTherapist);

router.put('/:id', updateTherapist);

router.delete('/:id', removeTherapist);

module.exports = router;
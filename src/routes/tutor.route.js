const router = require('express').Router();
const {
  allTutors,
  findTutor,
  createTutor,
  update,
  removeTutor
} = require('../controllers/tutor.controller');


router.get('/', allTutors);
router.get('/:id', findTutor);
router.post('/', createTutor);
router.put('/:id', update);
router.delete('/:id', removeTutor);


module.exports = router;
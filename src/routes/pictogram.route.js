const router = require('express').Router();
const {
  all,
  findOne,
  create,
  update,
  removePictogram
} = require('@controllers/pictogram.controller');

router.get('/', all);
router.get('/:id', findOne);

router.post('/', create);

router.put('/:id', update);

router.delete('/:id', removePictogram);


module.exports = router;
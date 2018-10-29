const express = require('express');
const router = express.Router();
const PetsController = require('./controllers/petsController');

router.get('/pets', PetsController.index);
router.get('/pets/read/:id', PetsController.read);
router.get('/pets/create', PetsController.create);
router.post('/pets', PetsController.add);
router.get('/pets/update/:id', PetsController.update);
router.put('/pets/:id', PetsController.save);
router.delete('/pets/:id', PetsController.destroy);

module.exports = router;
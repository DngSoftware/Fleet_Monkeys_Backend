const express = require('express');
const router = express.Router();
const TrailerController = require('../controllers/trailerController');

router.get('/', TrailerController.getAllTrailers);
router.post('/', TrailerController.createTrailer);
router.get('/:id', TrailerController.getTrailerById);
router.put('/:id', TrailerController.updateTrailer);
router.delete('/:id', TrailerController.deleteTrailer);

module.exports = router;
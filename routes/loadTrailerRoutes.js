const express = require('express');
const router = express.Router();
const LoadTrailerController = require('../controllers/loadTrailerController');

router.get('/', LoadTrailerController.getAllLoadTrailers);
router.get('/:loadTrailerId', LoadTrailerController.getLoadTrailerById);
router.post('/', LoadTrailerController.createLoadTrailer);
router.put('/:loadTrailerId', LoadTrailerController.updateLoadTrailer);
router.delete('/:loadTrailerId', LoadTrailerController.deleteLoadTrailer);

module.exports = router;
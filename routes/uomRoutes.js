const express = require('express');
const router = express.Router();
const UOMController = require('../controllers/uomController');

router.get('/', UOMController.getAllUOMs);
router.post('/', UOMController.createUOM);
router.get('/:id', UOMController.getUOMById);
router.put('/:id', UOMController.updateUOM);
router.delete('/:id', UOMController.deleteUOM);

module.exports = router;
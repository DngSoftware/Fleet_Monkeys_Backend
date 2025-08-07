const express = require('express');
const router = express.Router();
const LoadController = require('../controllers/loadController');

router.get('/', LoadController.getAllLoads); // GET /api/loads
router.post('/', LoadController.createLoad); // POST /api/loads
router.get('/:id', LoadController.getLoadById); // GET /api/loads/:id
router.put('/:id', LoadController.updateLoad); // PUT /api/loads/:id
router.delete('/:id', LoadController.deleteLoad); // DELETE /api/loads/:id

module.exports = router;
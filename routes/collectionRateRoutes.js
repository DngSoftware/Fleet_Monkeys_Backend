const express = require('express');
const router = express.Router();
const CollectionRateController = require('../controllers/collectionRateController');

// Routes for Collection Rate management
router.get('/', CollectionRateController.getAllCollectionRates); // GET /api/collection-rates
router.get('/all', CollectionRateController.getAllCollectionRatesNoPagination); // GET /api/collection-rates/all
router.post('/', CollectionRateController.createCollectionRate); // POST /api/collection-rates
router.get('/:id', CollectionRateController.getCollectionRateById); // GET /api/collection-rates/:id
router.put('/:id', CollectionRateController.updateCollectionRate); // PUT /api/collection-rates/:id
router.delete('/:id', CollectionRateController.deleteCollectionRate); // DELETE /api/collection-rates/:id

module.exports = router;
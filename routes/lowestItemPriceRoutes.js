const express = require('express');
const router = express.Router();
const LowestItemPriceController = require('../controllers/lowestItemPriceController');
const authMiddleware = require('../middleware/authMiddleware');

// Get lowest item prices for a PurchaseRFQID
router.get('/:purchaseRFQId', LowestItemPriceController.getLowestItemPrices);

module.exports = router;
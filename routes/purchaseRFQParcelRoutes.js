const express = require('express');
const router = express.Router();
const PurchaseRFQParcelController = require('../controllers/purchaseRFQParcelController');
const authMiddleware = require('../middleware/authMiddleware');

// Get a single PurchaseRFQParcel by ID
router.get('/:id', PurchaseRFQParcelController.getPurchaseRFQParcel);

// Create a new PurchaseRFQParcel
router.post('/', authMiddleware, PurchaseRFQParcelController.createPurchaseRFQParcel);

// Update a PurchaseRFQParcel
router.put('/:id', authMiddleware, PurchaseRFQParcelController.updatePurchaseRFQParcel);

// Delete a PurchaseRFQParcel
router.delete('/:id', authMiddleware, PurchaseRFQParcelController.deletePurchaseRFQParcel);

module.exports = router;
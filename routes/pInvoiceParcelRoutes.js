const express = require('express');
const router = express.Router();
const PInvoiceParcelController = require('../controllers/pInvoiceParcelController');
const authMiddleware = require('../middleware/authMiddleware');

// Get Purchase Invoice Parcels by PInvoiceParcelID or PInvoiceID
router.get('/', PInvoiceParcelController.getPInvoiceParcels);

// Update a Purchase Invoice Parcel (protected route)
router.put('/:id', authMiddleware, PInvoiceParcelController.updatePInvoiceParcel);

// Delete a Purchase Invoice Parcel (protected route)
router.delete('/:id', authMiddleware, PInvoiceParcelController.deletePInvoiceParcel);

module.exports = router;
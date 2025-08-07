const express = require('express');
const router = express.Router();
const PInvoiceParcelPalletDimensionsController = require('../controllers/pInvoiceParcelPalletDimensionsController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all PInvoiceParcelPalletDimensions (requires read permission)
router.get('/', authMiddleware, PInvoiceParcelPalletDimensionsController.getAllPInvoiceParcelPalletDimensions);

// Get a single PInvoiceParcelPalletDimensions by ID (requires read permission)
router.get('/:id', authMiddleware, PInvoiceParcelPalletDimensionsController.getPInvoiceParcelPalletDimensions);

// Get all PInvoiceParcelPalletDimensions by ParcelID (requires read permission)
router.get('/by-parcel/:parcelId', authMiddleware, PInvoiceParcelPalletDimensionsController.getPInvoiceParcelPalletDimensionsByParcelId);

// Create a new PInvoiceParcelPalletDimensions (requires write permission)
router.post('/', authMiddleware, PInvoiceParcelPalletDimensionsController.createPInvoiceParcelPalletDimensions);

// Update a PInvoiceParcelPalletDimensions (requires update permission)
router.put('/:id', authMiddleware, PInvoiceParcelPalletDimensionsController.updatePInvoiceParcelPalletDimensions);

// Delete a PInvoiceParcelPalletDimensions (requires delete permission)
router.delete('/:id', authMiddleware, PInvoiceParcelPalletDimensionsController.deletePInvoiceParcelPalletDimensions);

module.exports = router;
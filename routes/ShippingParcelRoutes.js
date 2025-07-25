const express = require('express');
const router = express.Router();
const ShippingParcelController = require('../controllers/ShippingParcelController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all ShippingParcels (requires read permission on ShippingParcel table)
router.get('/', authMiddleware, ShippingParcelController.getAllShippingParcels);

// Get a single ShippingParcel by ID (requires read permission on ShippingParcel table)
router.get('/:id', authMiddleware, ShippingParcelController.getShippingParcel);

// Create a new ShippingParcel (requires write permission on ShippingParcel table)
router.post('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('write'), ShippingParcelController.createShippingParcel);

// Update a ShippingParcel (requires update permission on ShippingParcel table)
router.put('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('update'), ShippingParcelController.updateShippingParcel);

// Delete a ShippingParcel (soft delete, requires delete permission on ShippingParcel table)
router.delete('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('delete'), ShippingParcelController.deleteShippingParcel);

// Generate QR code URL for a ShippingParcel (requires read permission on ShippingParcel table)
router.get('/:id/qrcode', authMiddleware, ShippingParcelController.generateQRCode);

module.exports = router;
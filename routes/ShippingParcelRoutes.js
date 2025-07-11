const express = require('express');
const router = express.Router();
const ShippingParcelController = require('../controllers/ShippingParcelController');
const authMiddleware = require('../middleware/authMiddleware');

// Get Shipping Parcels (all or by ParcelID)
router.get('/', authMiddleware, ShippingParcelController.getShippingParcels);

// Get a specific Shipping Parcel by ParcelID
router.get('/:parcelID', authMiddleware, ShippingParcelController.getShippingParcelById);

// Create a Shipping Parcel
router.post('/', authMiddleware, ShippingParcelController.createShippingParcel);

// Update a Shipping Parcel
router.put('/', authMiddleware, ShippingParcelController.updateShippingParcel);

// Delete a Shipping Parcel
router.delete('/', authMiddleware, ShippingParcelController.deleteShippingParcel);

module.exports = router;
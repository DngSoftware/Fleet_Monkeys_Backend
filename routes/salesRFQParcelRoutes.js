const express = require('express');
const router = express.Router();
const SalesRFQParcelController = require('../controllers/salesRFQParcelController');

// Get all Sales RFQ Parcels or filter by SalesRFQID
router.get('/', SalesRFQParcelController.getSalesRFQParcels);

// Get a single Sales RFQ Parcel by ID
router.get('/:id', SalesRFQParcelController.getSalesRFQParcelById);

// Create a new Sales RFQ Parcel
router.post('/', SalesRFQParcelController.createSalesRFQParcel);

// Update a Sales RFQ Parcel
router.put('/:id', SalesRFQParcelController.updateSalesRFQParcel);

// Delete a Sales RFQ Parcel
router.delete('/:id', SalesRFQParcelController.deleteSalesRFQParcel);

module.exports = router;
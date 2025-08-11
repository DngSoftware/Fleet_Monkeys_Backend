const express = require('express');
const router = express.Router();
const SalesOrderParcelController = require('../controllers/salesOrderParcelController');

// Get all Sales Order Parcels
router.get('/', SalesOrderParcelController.getAllSalesOrderParcels);

// Get a single Sales Order Parcel by ID
router.get('/:id', SalesOrderParcelController.getSalesOrderParcelById);

// Update a Sales Order Parcel
router.put('/:id', SalesOrderParcelController.updateSalesOrderParcel);

// Delete a Sales Order Parcel
router.delete('/:id', SalesOrderParcelController.deleteSalesOrderParcel);

module.exports = router;
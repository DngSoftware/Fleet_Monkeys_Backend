const express = require('express');
const router = express.Router();
const SalesQuotationParcelController = require('../controllers/salesQuotationParcelController');

// Get all Sales Quotation Parcels
router.get('/', SalesQuotationParcelController.getAllSalesQuotationParcels);

// Get a single Sales Quotation Parcel by ID
router.get('/:id', SalesQuotationParcelController.getSalesQuotationParcelById);

// Update a Sales Quotation Parcel
router.put('/:id', SalesQuotationParcelController.updateSalesQuotationParcel);

// Delete a Sales Quotation Parcel
router.delete('/:id', SalesQuotationParcelController.deleteSalesQuotationParcel);

module.exports = router;
const express = require('express');
const router = express.Router();
const SupplierQuotationParcelController = require('../controllers/supplierQuotationParcelController');

// Get all Supplier Quotation Parcels by SupplierQuotationID
router.get('/supplierQuotation/:supplierQuotationId', SupplierQuotationParcelController.getAllSupplierQuotationParcelsBySupplierQuotationId);
// Get all Supplier Quotation Parcels
router.get('/', SupplierQuotationParcelController.getAllSupplierQuotationParcels);

// Get a Supplier Quotation Parcel by ID
router.get('/:id', SupplierQuotationParcelController.getSupplierQuotationParcelById);

// Update a Supplier Quotation Parcel
router.put('/:id', SupplierQuotationParcelController.updateSupplierQuotationParcel);

// Delete a Supplier Quotation Parcel
router.delete('/:id', SupplierQuotationParcelController.deleteSupplierQuotationParcel);

module.exports = router;
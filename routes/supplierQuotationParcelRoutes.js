const express = require('express');
const router = express.Router();
const SupplierQuotationParcelController = require('../controllers/supplierQuotationParcelController');

// Get a Supplier Quotation Parcel by ID
router.get('/:id', SupplierQuotationParcelController.getSupplierQuotationParcelById);

// Update a Supplier Quotation Parcel
router.put('/:id', SupplierQuotationParcelController.updateSupplierQuotationParcel);

// Delete a Supplier Quotation Parcel
router.delete('/:id', SupplierQuotationParcelController.deleteSupplierQuotationParcel);

module.exports = router;
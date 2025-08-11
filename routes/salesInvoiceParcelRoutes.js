const express = require('express');
const router = express.Router();
const SalesInvoiceParcelController = require('../controllers/salesInvoiceParcelController');
const authMiddleware = require('../middleware/authMiddleware');

// Get Sales Invoice Parcels by SalesInvoiceParcelID or SalesInvoiceID
router.get('/', SalesInvoiceParcelController.getSalesInvoiceParcels);

// Insert a Sales Invoice Parcel (protected route)
router.post('/', authMiddleware, SalesInvoiceParcelController.insertSalesInvoiceParcel);

// Update a Sales Invoice Parcel (protected route)
router.put('/:id', authMiddleware, SalesInvoiceParcelController.updateSalesInvoiceParcel);

// Delete a Sales Invoice Parcel (protected route)
router.delete('/:id', authMiddleware, SalesInvoiceParcelController.deleteSalesInvoiceParcel);

module.exports = router;
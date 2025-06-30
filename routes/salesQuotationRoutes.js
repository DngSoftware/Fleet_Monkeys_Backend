const express = require('express');
const router = express.Router();
const SalesQuotationController = require('../controllers/salesQuotationController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Sales Quotations
router.get('/', SalesQuotationController.getAllSalesQuotations);

// Create a new Sales Quotation
router.post('/', authMiddleware, SalesQuotationController.createSalesQuotation);

// Get a single Sales Quotation by ID
router.get('/:id', SalesQuotationController.getSalesQuotationById);

// Update a Sales Quotation
router.put('/:id', authMiddleware, SalesQuotationController.updateSalesQuotation);

// Delete a Sales Quotation
router.delete('/:id', authMiddleware, SalesQuotationController.deleteSalesQuotation);

// Approve a Sales Quotation
router.post('/approve', authMiddleware, SalesQuotationController.approveSalesQuotation);

// Get Sales Quotation approval status (requires read permission on Sales Quotation table)
router.get('/:id/approval-status', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), SalesQuotationController.getSalesQuotationApprovalStatus);

module.exports = router;
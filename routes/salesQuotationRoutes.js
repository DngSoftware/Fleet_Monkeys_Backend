const express = require('express');
const router = express.Router();
const SalesQuotationController = require('../controllers/salesQuotationController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Sales Quotations
router.get('/',authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), SalesQuotationController.getAllSalesQuotations);

// Create a new Sales Quotation
router.post('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('write'), SalesQuotationController.createSalesQuotation);

// Get a single Sales Quotation by ID
router.get('/:id',authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), SalesQuotationController.getSalesQuotationById);

// Update a Sales Quotation
router.put('/:id',authMiddleware, tableAccessMiddleware, permissionMiddleware('update'), SalesQuotationController.updateSalesQuotation);

// Delete a Sales Quotation
router.delete('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('delete'), SalesQuotationController.deleteSalesQuotation);

// Approve a Sales Quotation
router.post('/approve', authMiddleware, SalesQuotationController.approveSalesQuotation);

// Get Sales Quotation approval status (requires read permission on Sales Quotation table)
router.get('/:id/approval-status', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), SalesQuotationController.getSalesQuotationApprovalStatus);

module.exports = router;
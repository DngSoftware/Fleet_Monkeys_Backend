const express = require('express');
const router = express.Router();
const SalesInvoiceController = require('../controllers/salesInvoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Sales Invoices
router.get('/', SalesInvoiceController.getAllSalesInvoices);

// Get Sales Invoice by ID
router.get('/:id', SalesInvoiceController.getSalesInvoiceById);

// Create a Sales Invoice (protected route)
router.post('/', authMiddleware, SalesInvoiceController.createSalesInvoice);

// Approve a Sales Invoice (protected route)
router.post('/approve', authMiddleware, SalesInvoiceController.approveSalesInvoice);

// Get Sales Invoice approval status (requires read permission on Sales Invoice table)
router.get('/:id/approval-status', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), SalesInvoiceController.getSalesInvoiceApprovalStatus);



module.exports = router;
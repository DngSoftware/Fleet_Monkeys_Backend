const express = require('express');
const router = express.Router();
const SalesInvoiceApprovalController = require('../controllers/salesInvoiceApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

// Get a specific Sales Invoice approval by SalesInvoiceID and ApproverID
router.get('/:salesInvoiceId/:approverId', SalesInvoiceApprovalController.getSalesInvoiceApproval);

// Get all Sales Invoice approvals (optionally filtered by SalesInvoiceID or ApproverID)
router.get('/', authMiddleware, SalesInvoiceApprovalController.getAllSalesInvoiceApprovals);

// Create a new Sales Invoice approval
router.post('/', authMiddleware, SalesInvoiceApprovalController.createSalesInvoiceApproval);

// Update a Sales Invoice approval
router.put('/:salesInvoiceId/:approverId', authMiddleware, SalesInvoiceApprovalController.updateSalesInvoiceApproval);

// Delete a Sales Invoice approval
router.delete('/:salesInvoiceId/:approverId', authMiddleware, SalesInvoiceApprovalController.deleteSalesInvoiceApproval);

module.exports = router;
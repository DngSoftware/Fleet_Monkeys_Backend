const express = require('express');
const router = express.Router();
const PInvoiceApprovalController = require('../controllers/pInvoiceApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

// Get a specific Purchase Invoice approval by PInvoiceID and ApproverID
router.get('/:pInvoiceId/:approverId', PInvoiceApprovalController.getPInvoiceApproval);

// Get all Purchase Invoice approvals (optionally filtered by PInvoiceID or ApproverID)
router.get('/', authMiddleware, PInvoiceApprovalController.getAllPInvoiceApprovals);

// Create a new Purchase Invoice approval
router.post('/', authMiddleware, PInvoiceApprovalController.createPInvoiceApproval);

// Update a Purchase Invoice approval
router.put('/:pInvoiceId/:approverId', authMiddleware, PInvoiceApprovalController.updatePInvoiceApproval);

// Delete a Purchase Invoice approval
router.delete('/:pInvoiceId/:approverId', authMiddleware, PInvoiceApprovalController.deletePInvoiceApproval);

module.exports = router;
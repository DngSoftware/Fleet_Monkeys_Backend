const express = require('express');
const router = express.Router();
const SalesRFQApprovalController = require('../controllers/salesRFQApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

// Get Sales RFQ approvals (specific SalesRFQID or paginated)
router.get('/', authMiddleware, SalesRFQApprovalController.getSalesRFQApprovals);

// Get a specific Sales RFQ approval by SalesRFQID and ApproverID
router.get('/:salesRFQID/:approverID', authMiddleware, SalesRFQApprovalController.getSalesRFQApprovalById);

// Create a Sales RFQ approval
router.post('/', authMiddleware, SalesRFQApprovalController.createSalesRFQApproval);

// Update a Sales RFQ approval
router.put('/', authMiddleware, SalesRFQApprovalController.updateSalesRFQApproval);

// Delete a Sales RFQ approval
router.delete('/', authMiddleware, SalesRFQApprovalController.deleteSalesRFQApproval);

module.exports = router;
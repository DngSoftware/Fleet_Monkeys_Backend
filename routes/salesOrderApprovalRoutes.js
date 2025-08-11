const express = require('express');
const router = express.Router();
const SalesOrderApprovalController = require('../controllers/salesOrderApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

// Get a specific sales order approval by SalesOrderID and ApproverID
router.get('/:salesOrderId/:approverId', SalesOrderApprovalController.getSalesOrderApproval);

// Get all sales order approvals (optionally filtered by SalesOrderID)
router.get('/', authMiddleware, SalesOrderApprovalController.getAllSalesOrderApprovals);

// Create a new sales order approval
router.post('/', authMiddleware, SalesOrderApprovalController.createSalesOrderApproval);

// Update a sales order approval
router.put('/:salesOrderId/:approverId', authMiddleware, SalesOrderApprovalController.updateSalesOrderApproval);

// Delete a sales order approval
router.delete('/:salesOrderId/:approverId', authMiddleware, SalesOrderApprovalController.deleteSalesOrderApproval);

module.exports = router;
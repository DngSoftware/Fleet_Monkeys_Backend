const express = require('express');
const router = express.Router();
const POApprovalController = require('../controllers/poApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

// Get a specific PO approval by POID and ApproverID
router.get('/:poId/:approverId',  POApprovalController.getPOApproval);

// Get all PO approvals (optionally filtered by POID or ApproverID)
router.get('/', authMiddleware, POApprovalController.getAllPOApprovals);

// Create a new PO approval
router.post('/', authMiddleware, POApprovalController.createPOApproval);

// Update a PO approval
router.put('/:poId/:approverId', authMiddleware, POApprovalController.updatePOApproval);

// Delete a PO approval
router.delete('/:poId/:approverId', authMiddleware, POApprovalController.deletePOApproval);

module.exports = router;
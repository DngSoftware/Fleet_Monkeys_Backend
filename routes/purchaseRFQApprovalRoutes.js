const express = require('express');
const router = express.Router();
const PurchaseRFQApprovalController = require('../controllers/purchaseRFQApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

// Get Purchase RFQ approvals (all, filtered by PurchaseRFQID, or paginated)
router.get('/', authMiddleware, PurchaseRFQApprovalController.getPurchaseRFQApprovals);

// Get a specific Purchase RFQ approval by PurchaseRFQID and ApproverID
router.get('/:purchaseRFQID/:approverID', authMiddleware, PurchaseRFQApprovalController.getPurchaseRFQApprovalById);

// Create a Purchase RFQ approval
router.post('/', authMiddleware, PurchaseRFQApprovalController.createPurchaseRFQApproval);

// Update a Purchase RFQ approval
router.put('/', authMiddleware, PurchaseRFQApprovalController.updatePurchaseRFQApproval);

// Delete a Purchase RFQ approval
router.delete('/', authMiddleware, PurchaseRFQApprovalController.deletePurchaseRFQApproval);

module.exports = router;
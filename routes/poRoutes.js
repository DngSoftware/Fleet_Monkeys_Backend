const express = require('express');
const router = express.Router();
const PurchaseOrderController = require('../controllers/poController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get a single purchase order by ID
router.get('/:id',authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), PurchaseOrderController.getPurchaseOrderById);

// Get all purchase orders (paginated)
router.get('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), PurchaseOrderController.getAllPurchaseOrders);

// Create a new purchase order
router.post('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('write'), PurchaseOrderController.createPurchaseOrder);

router.post('/approve', authMiddleware, PurchaseOrderController.approvePO);

// Get Purchase Order approval status (requires read permission on Purchase Order table)
router.get('/:id/approval-status', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), PurchaseOrderController.getPoApprovalStatus);


module.exports = router;
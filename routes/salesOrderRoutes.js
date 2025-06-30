const express = require('express');
const router = express.Router();
const SalesOrderController = require('../controllers/salesOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get a single sales order by ID
router.get('/:id',  SalesOrderController.getSalesOrderById);

// Get all sales orders (paginated)
router.get('/', SalesOrderController.getAllSalesOrders);

// Create a new sales order
router.post('/', authMiddleware, SalesOrderController.createSalesOrder);

// Update a sales order
router.put('/:id', authMiddleware, SalesOrderController.updateSalesOrder);

// Delete a sales order
router.delete('/:id', authMiddleware, SalesOrderController.deleteSalesOrder);

router.post('/approve', authMiddleware, SalesOrderController.approveSalesOrder);

// Get Sales Order approval status (requires read permission on Sales Order table)
router.get('/:id/approval-status', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), SalesOrderController.getSalesOrderApprovalStatus);



module.exports = router;

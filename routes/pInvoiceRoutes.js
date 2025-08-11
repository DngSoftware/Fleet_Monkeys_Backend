const express = require('express');
const router = express.Router();
const PInvoiceController = require('../controllers/pInvoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Purchase Invoices
router.get('/',authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), PInvoiceController.getAllPInvoices);

// Get a single Purchase Invoice by ID
router.get('/:id',authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), PInvoiceController.getPInvoiceById);

// Create a Purchase Invoice (protected route)
router.post('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('write'), PInvoiceController.createPInvoice);

// Update a Purchase Invoice (protected route)
router.put('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('update'), PInvoiceController.updatePInvoice);

// Delete a Purchase Invoice (protected route)
router.delete('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('delete'), PInvoiceController.deletePInvoice);

router.post('/approve', authMiddleware, PInvoiceController.approvePInvoice);

// Get Purchase Invoice approval status (requires read permission on Purchase Invoice table)
router.get('/:id/approval-status', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), PInvoiceController.getPInvoiceApprovalStatus);




module.exports = router;
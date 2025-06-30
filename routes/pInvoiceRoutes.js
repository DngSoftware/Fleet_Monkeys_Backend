const express = require('express');
const router = express.Router();
const PInvoiceController = require('../controllers/pInvoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Purchase Invoices
router.get('/', PInvoiceController.getAllPInvoices);

// Get a single Purchase Invoice by ID
router.get('/:id', PInvoiceController.getPInvoiceById);

// Create a Purchase Invoice (protected route)
router.post('/', authMiddleware, PInvoiceController.createPInvoice);

// Update a Purchase Invoice (protected route)
router.put('/:id', authMiddleware, PInvoiceController.updatePInvoice);

// Delete a Purchase Invoice (protected route)
router.delete('/:id', authMiddleware, PInvoiceController.deletePInvoice);

router.post('/approve', authMiddleware, PInvoiceController.approvePInvoice);

// Get Purchase Invoice approval status (requires read permission on Purchase Invoice table)
router.get('/:id/approval-status', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), PInvoiceController.getPInvoiceApprovalStatus);




module.exports = router;
const express = require('express');
const router = express.Router();
const PInvoiceAdjustmentController = require('../controllers/pInvoiceAdjustmentController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Adjust a Purchase Invoice (protected route)
router.post(
  '/',
  authMiddleware,
  PInvoiceAdjustmentController.adjustPInvoice
);

module.exports = router;
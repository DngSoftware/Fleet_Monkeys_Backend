const express = require('express');
const router = express.Router();
const SalesQuotationController = require('../controllers/salesQuotationControllerKeyur');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Sales Quotations
router.get('/',authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), SalesQuotationController.getAllSalesQuotations);

// Create a new Sales Quotation
router.post('/', authMiddleware, SalesQuotationController.createSalesQuotation);


module.exports = router;
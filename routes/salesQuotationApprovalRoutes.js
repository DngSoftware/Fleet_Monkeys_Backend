const express = require('express');
const router = express.Router();
const SalesQuotationApprovalController = require('../controllers/salesQuotationApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, SalesQuotationApprovalController.getSalesQuotationApprovals);

router.get('/:salesQuotationID/:approverID', SalesQuotationApprovalController.getSalesQuotationApprovalById);

router.post('/', authMiddleware, SalesQuotationApprovalController.createSalesQuotationApproval);

router.put('/', authMiddleware, SalesQuotationApprovalController.updateSalesQuotationApproval);

router.delete('/', authMiddleware, SalesQuotationApprovalController.deleteSalesQuotationApproval);

module.exports = router;
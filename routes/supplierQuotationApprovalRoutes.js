const express = require('express');
const router = express.Router();
const SupplierQuotationApprovalController = require('../controllers/supplierQuotationApprovalController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, SupplierQuotationApprovalController.getSupplierQuotationApprovals);

router.get('/:supplierQuotationID/:approverID', SupplierQuotationApprovalController.getSupplierQuotationApprovalById);

router.post('/', authMiddleware, SupplierQuotationApprovalController.createSupplierQuotationApproval);

router.put('/', authMiddleware, SupplierQuotationApprovalController.updateSupplierQuotationApproval);

router.delete('/', authMiddleware, SupplierQuotationApprovalController.deleteSupplierQuotationApproval);

module.exports = router;
const express = require('express');
const router = express.Router();
const SalesQuotationController = require('../controllers/salesQuotationController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');

router.get(
  '/',
  authMiddleware,
  tableAccessMiddleware,
  permissionMiddleware('read'),
  SalesQuotationController.getAllSalesQuotations
);

router.get(
  '/:id',
  authMiddleware,
  tableAccessMiddleware,
  permissionMiddleware('read'),
  SalesQuotationController.getSalesQuotationById
);

router.post(
  '/',
  authMiddleware,
  tableAccessMiddleware,
  permissionMiddleware('create'),
  SalesQuotationController.createSalesQuotation
);

router.put(
  '/:id',
  authMiddleware,
  SalesQuotationController.updateSalesQuotation
);

router.delete(
  '/:id',
  authMiddleware,
  tableAccessMiddleware,
  permissionMiddleware('delete'),
  SalesQuotationController.deleteSalesQuotation
);

router.get(
  '/:salesrfqid/parcels',
  authMiddleware,
  SalesQuotationController.getSupplierQuotationParcels
);

module.exports = router;
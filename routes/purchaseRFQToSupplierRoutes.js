const express = require('express');
const router = express.Router();
const PurchaseRFQToSupplierController = require('../controllers/purchaseRFQToSupplierController');

// Get all Purchase RFQs to Suppliers
router.get('/', PurchaseRFQToSupplierController.getAllPurchaseRFQToSuppliers);

module.exports = router;
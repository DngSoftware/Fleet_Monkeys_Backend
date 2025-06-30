const express = require('express');
const router = express.Router();
const { sendRFQToSuppliers } = require('../controllers/sentPurchaseRFQToSuppliersController');

router.post('/send-rfq', sendRFQToSuppliers);

module.exports = router;
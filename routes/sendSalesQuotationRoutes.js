const express = require('express');
const router = express.Router();
const { sendSalesQuotation } = require('../controllers/sendSalesQuotationController');

router.post('/send-sales-quotation', sendSalesQuotation);

module.exports = router;
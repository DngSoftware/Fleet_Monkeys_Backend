const express = require('express');
const router = express.Router();
const { sendSalesInvoice } = require('../controllers/salesInvoiceEmailController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send-sales-invoice', authMiddleware, sendSalesInvoice);

module.exports = router;
const express = require('express');
const router = express.Router();
const ExchangeRateController = require('../controllers/exchangeRateController');

router.post('/populate-currencies', ExchangeRateController.populateCurrencies);
router.post('/get-and-store', ExchangeRateController.getAndStoreExchangeRate);

module.exports = router;
const express = require('express');
const router = express.Router();
const ExchangeRateController = require('../controllers/exchangeRateController');

router.get('/rates', ExchangeRateController.getRates);

module.exports = router;
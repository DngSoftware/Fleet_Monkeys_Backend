const express = require('express');
const router = express.Router();
const ExchangeRateController = require('../controllers/exchangeRateController');

// Get current exchange rates
router.get('/rates', ExchangeRateController.getRates);

// Manual update exchange rates
router.post('/update', ExchangeRateController.updateRates);

// Get scheduler status
router.get('/scheduler/status', ExchangeRateController.getSchedulerStatus);

// Start scheduler (admin endpoint)
router.post('/scheduler/start', ExchangeRateController.startScheduler);

// Stop scheduler (admin endpoint) 
router.post('/scheduler/stop', ExchangeRateController.stopScheduler);

module.exports = router;


// Manual Control Endpoints

// GET /api/exchange-rates/rates - Get current rates
// POST /api/exchange-rates/update - Force immediate update
// GET /api/exchange-rates/scheduler/status - Check scheduler status
// POST /api/exchange-rates/scheduler/start - Start scheduler
// POST /api/exchange-rates/scheduler/stop - Stop scheduler
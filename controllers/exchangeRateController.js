const ExchangeRateModel = require('../models/exchangeRateModel');

class ExchangeRateController {
  async getRates(req, res) {
    try {
      const rates = await ExchangeRateModel.getRates();
      res.status(200).json({
        success: true,
        message: 'Exchange rates retrieved successfully',
        data: rates
      });
    } catch (error) {
      console.error('getRates controller error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }
}

module.exports = new ExchangeRateController();
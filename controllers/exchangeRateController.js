const ExchangeRateModel = require('../models/exchangeRateModel');

class ExchangeRateController {
  async getRates(req, res) {
    try {
      const rates = await ExchangeRateModel.getRates();
      res.json({ success: true, data: rates });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching rates', error: error.message });
    }
  }
}

module.exports = new ExchangeRateController();
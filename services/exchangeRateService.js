const axios = require('axios');
const ExchangeRateModel = require('../models/exchangeRateModel');

class ExchangeRateService {
  async fetchAndUpdateRates() {
    try {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (!apiKey) {
        throw new Error('EXCHANGE_RATE_API_KEY is not defined in environment variables');
      }

      const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
      console.log('API Response:', response.data);

      if (!response.data || !response.data.conversion_rates) {
        throw new Error('Invalid API response: rates data is missing');
      }

      const rates = response.data.conversion_rates;
      await ExchangeRateModel.updateRates(rates, 'USD');
      console.log('Exchange rates updated successfully');
    } catch (error) {
      console.error('fetchAndUpdateRates error:', {
        message: error.message,
        response: error.response ? error.response.data : null,
        stack: error.stack
      });
      throw new Error(`Failed to fetch or update exchange rates: ${error.message}`);
    }
  }
}

module.exports = new ExchangeRateService();
const axios = require('axios');
const ExchangeRateModel = require('../models/exchangeRateModel');

class ExchangeRateService {
  async fetchAndUpdateRates() {
    try {
      // Replace YOUR_API_KEY with your actual API key
      const response = await axios.get('https://v6.exchangerate-api.com/v6/77b2916030994a174c4e1a60/latest/USD');
      console.log('API Response:', response.data); // Debug: Log the full response
      if (!response.data || !response.data.conversion_rates) {
        throw new Error('Invalid API response: rates data is missing');
      }
      const rates = response.data.conversion_rates;
      await ExchangeRateModel.updateRates(rates, 'USD');
      console.log('Exchange rates updated successfully');
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      throw error;
    }
  }
}

module.exports = new ExchangeRateService();
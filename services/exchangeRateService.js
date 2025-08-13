// const axios = require('axios');

// const API_KEY = '0ac52693487ca7c3879a1350'; // Your API key from exchangerate-api.com

// class ExchangeRateService {
//   static async fetchCurrencies() {
//     try {
//       const response = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/codes`);

//       if (response.data.result !== 'success') {
//         throw new Error(response.data.error || 'API response indicates failure');
//       }

//       return response.data.supported_codes.map(([code]) => ({
//         CurrencyName: code,
//       }));
//     } catch (error) {
//       console.error('Error fetching currencies:', error.message, error.response?.data || error);
//       throw new Error('Failed to fetch currencies from API');
//     }
//   }

//   static async fetchExchangeRate(fromCurrency, toCurrency) {
//     try {
//       const response = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`);

//       if (response.data.result !== 'success') {
//         throw new Error(response.data.error || 'API response indicates failure');
//       }

//       const rate = response.data.conversion_rates[toCurrency];
//       if (!rate) {
//         throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
//       }

//       const updateDate = new Date(response.data.time_last_update_utc).toISOString().slice(0, 10);

//       return {
//         rate,
//         date: updateDate,
//       };
//     } catch (error) {
//       console.error(`Error fetching exchange rate for ${fromCurrency} to ${toCurrency}:`, error.message, error.response?.data || error);
//       throw new Error(`Failed to fetch exchange rate: ${error.message}`);
//     }
//   }
// }

// module.exports = ExchangeRateService;
const cron = require('node-cron');
const ExchangeRateService = require('./services/exchangeRateService');
const ExchangeRateModel = require('./models/exchangeRateModel');

// Limited list of common currencies to update (to avoid overwhelming the free plan)
const COMMON_CURRENCIES = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR']; // Add more as needed

const updateExchangeRates = async () => {
  try {
    const currencies = await ExchangeRateModel.getAllCurrencies();
    const baseCurrency = currencies.find(c => c.CurrencyName === 'USD');
    if (!baseCurrency) {
      throw new Error('Base currency USD not found');
    }

    const filteredCurrencies = currencies.filter(c => COMMON_CURRENCIES.includes(c.CurrencyName));

    for (const toCurrency of filteredCurrencies) {
      if (toCurrency.CurrencyID === baseCurrency.CurrencyID) continue;

      try {
        // Check if exchange rate already exists for today
        const existingRate = await ExchangeRateModel.getExchangeRate(
          baseCurrency.CurrencyID,
          toCurrency.CurrencyID,
          new Date().toISOString().slice(0, 10)
        ).catch(() => null);

        if (existingRate) {
          console.log(`Exchange rate for ${baseCurrency.CurrencyName} to ${toCurrency.CurrencyName} already exists for today`);
          continue; // Skip if rate exists
        }

        const { rate, date } = await ExchangeRateService.fetchExchangeRate(
          baseCurrency.CurrencyName,
          toCurrency.CurrencyName
        );

        await ExchangeRateModel.storeExchangeRate(
          baseCurrency.CurrencyID,
          toCurrency.CurrencyID,
          rate,
          date
        );
        console.log(`Updated exchange rate for ${baseCurrency.CurrencyName} to ${toCurrency.CurrencyName}`);
      } catch (err) {
        console.warn(`Skipping ${baseCurrency.CurrencyName} to ${toCurrency.CurrencyName}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
};

cron.schedule('0 * * * *', () => {
  console.log('Running exchange rate update cron job');
  updateExchangeRates();
});

module.exports = { updateExchangeRates };
const ExchangeRateService = require('../services/exchangeRateService');
const ExchangeRateModel = require('../models/exchangeRateModel');

class ExchangeRateController {
  static async populateCurrencies(req, res) {
    try {
      const { createdById = 1 } = req.body;
      if (!Number.isInteger(Number(createdById)) || createdById <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid createdById is required',
          data: null,
        });
      }

      const currencies = await ExchangeRateService.fetchCurrencies();
      const result = await ExchangeRateModel.populateCurrencies(currencies, parseInt(createdById));

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (err) {
      console.error('populateCurrencies error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
      });
    }
  }

  static async getAndStoreExchangeRate(req, res) {
    try {
      const { fromCurrencyId, toCurrencyId } = req.body;

      if (!Number.isInteger(Number(fromCurrencyId)) || fromCurrencyId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid fromCurrencyId is required',
          data: null,
        });
      }
      if (!Number.isInteger(Number(toCurrencyId)) || toCurrencyId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid toCurrencyId is required',
          data: null,
        });
      }

      const currencies = await ExchangeRateModel.getAllCurrencies();
      const fromCurrency = currencies.find(c => c.CurrencyID === parseInt(fromCurrencyId));
      const toCurrency = currencies.find(c => c.CurrencyID === parseInt(toCurrencyId));

      if (!fromCurrency || !toCurrency) {
        return res.status(404).json({
          success: false,
          message: 'One or both currencies not found',
          data: null,
        });
      }

      const { rate, date } = await ExchangeRateService.fetchExchangeRate(
        fromCurrency.CurrencyName,
        toCurrency.CurrencyName
      );

      const result = await ExchangeRateModel.storeExchangeRate(
        fromCurrencyId,
        toCurrencyId,
        rate,
        date
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          exchangeRateId: result.exchangeRateId,
          fromCurrencyId,
          toCurrencyId,
          exchangeRate: rate,
          exchangeRateDate: date,
        },
      });
    } catch (err) {
      console.error('getAndStoreExchangeRate error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
      });
    }
  }
}

module.exports = ExchangeRateController;
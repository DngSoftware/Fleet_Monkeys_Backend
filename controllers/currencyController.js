const CurrencyModel = require('../models/currencyModel');

class CurrencyController {
  // Get all Currencies
  static async getAllCurrencies(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          currencyId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          currencyId: null
        });
      }

      const result = await CurrencyModel.getAllCurrencies({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      res.status(200).json({
        success: true,
        message: 'Currency records retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        },
        currencyId: null
      });
    } catch (err) {
      console.error('Error in getAllCurrencies:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        currencyId: null
      });
    }
  }


  // Create a new Currency
  static async createCurrency(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.currencyName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CurrencyName and CreatedById are required.',
          data: null,
          currencyId: null
        });
      }

      const result = await CurrencyModel.createCurrency(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        currencyId: result.currencyId
      });
    } catch (err) {
      console.error('Error in createCurrency:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        currencyId: null
      });
    }
  }

  // Get a single Currency by ID
  static async getCurrencyById(req, res) {
    try {
      const { id } = req.params;
      const currency = await CurrencyModel.getCurrencyById(parseInt(id));
      if (!currency) {
        return res.status(400).json({
          success: false,
          message: 'Currency not found.',
          data: null,
          currencyId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Currency retrieved successfully.',
        data: currency,
        currencyId: id
      });
    } catch (err) {
      console.error('Error in getCurrencyById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        currencyId: null
      });
    }
  }

  // Update a Currency
  static async updateCurrency(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.currencyName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CurrencyName and CreatedById are required.',
          data: null,
          currencyId: null
        });
      }

      const result = await CurrencyModel.updateCurrency(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        currencyId: id
      });
    } catch (err) {
      console.error('Error in updateCurrency:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        currencyId: null
      });
    }
  }

  // Delete a Currency
  static async deleteCurrency(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body; // Optional, passed as-is

      const result = await CurrencyModel.deleteCurrency(parseInt(id), createdById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        currencyId: id
      });
    } catch (err) {
      console.error('Error in deleteCurrency:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        currencyId: null
      });
    }
  }
}

module.exports = CurrencyController;
const TransactionModel = require('../models/transactionModel');
const poolPromise = require('../config/db.config');

class TransactionController {
   static async createTransaction(req, res) {
    try {
      console.log('Request Body:', req.body);
      console.log('User:', req.user);
      const transactionData = {
        SalesRFQID: req.body.SalesRFQID ? parseInt(req.body.SalesRFQID) : null,
        SupplierID: req.body.SupplierID ? parseInt(req.body.SupplierID) : null,
        TransactionAmount: req.body.TransactionAmount ? parseFloat(req.body.TransactionAmount) : null,
        TransactionDate: req.body.TransactionDate,
        TransactionTypeID: req.body.TransactionTypeID ? parseInt(req.body.TransactionTypeID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || parseInt(req.user.personId),
      };
      console.log('Transaction Data:', transactionData);
      const result = await TransactionModel.createTransaction(transactionData);
      return res.status(result.success ? 201 : 400).json({
        ...result,
        message: result.success ? 'Transaction created successfully.' : result.message,
      });
    } catch (error) {
      console.error('Create Transaction error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        transactionId: null,
      });
    }
  }

  static async updateTransaction(req, res) {
    try {
      console.log('Request Body:', req.body);
      console.log('User:', req.user);
      const transactionData = {
        TransactionID: parseInt(req.params.id),
        SalesRFQID: req.body.SalesRFQID ? parseInt(req.body.SalesRFQID) : null,
        SupplierID: req.body.SupplierID ? parseInt(req.body.SupplierID) : null,
        TransactionAmount: req.body.TransactionAmount ? parseFloat(req.body.TransactionAmount) : null,
        TransactionDate: req.body.TransactionDate,
        TransactionTypeID: req.body.TransactionTypeID ? parseInt(req.body.TransactionTypeID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || parseInt(req.user.personId),
      };
      console.log('Transaction Data:', transactionData);
      const result = await TransactionModel.updateTransaction(transactionData);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        message: result.success ? 'Transaction updated successfully.' : result.message,
      });
    } catch (error) {
      console.error('Update Transaction error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        transactionId: null,
      });
    }
  }

  static async deleteTransaction(req, res) {
    try {
      console.log('Request Params:', req.params);
      console.log('User:', req.user);
      const transactionData = {
        TransactionID: parseInt(req.params.id),
        CreatedByID: parseInt(req.body.CreatedByID) || parseInt(req.user.personId),
      };
      console.log('Transaction Data:', transactionData);
      const result = await TransactionModel.deleteTransaction(transactionData);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        message: result.success ? 'Transaction deleted successfully.' : result.message,
      });
    } catch (error) {
      console.error('Delete Transaction error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        transactionId: null,
      });
    }
  }

  static async getTransaction(req, res) {
    try {
      console.log('Request Params:', req.params);
      const transactionId = parseInt(req.params.id);
      const result = await TransactionModel.getTransaction(transactionId);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        message: result.success ? 'Record retrieved successfully.' : result.message,
      });
    } catch (error) {
      console.error('Get Transaction error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        transactionId: null,
      });
    }
  }
}

module.exports = TransactionController;
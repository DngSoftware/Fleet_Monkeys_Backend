const BankAccountModel = require('../models/bankAccountModel');

class BankAccountController {

 
  // Get all BankAccounts with pagination
  static async getAllBankAccounts(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          bankAccountId: null,
          newBankAccountId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          bankAccountId: null,
          newBankAccountId: null
        });
      }

      const result = await BankAccountModel.getAllBankAccounts({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      res.status(200).json({
        success: true,
        message: 'BankAccounts retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        },
        bankAccountId: null,
        newBankAccountId: null
      });
    } catch (err) {
      console.error('Error in getAllBankAccounts:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        bankAccountId: null,
        newBankAccountId: null
      });
    }
  }
  // Create a new BankAccount
  static async createBankAccount(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.accountName || !data.bankName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'AccountName, BankName, and CreatedByID are required.',
          data: null,
          bankAccountId: null,
          newBankAccountId: null
        });
      }

      const result = await BankAccountModel.createBankAccount(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        bankAccountId: null,
        newBankAccountId: result.newBankAccountId
      });
    } catch (err) {
      console.error('Error in createBankAccount:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        bankAccountId: null,
        newBankAccountId: null
      });
    }
  }

  // Get a single BankAccount by ID
  static async getBankAccountById(req, res) {
    try {
      const { id } = req.params;
      const bankAccount = await BankAccountModel.getBankAccountById(parseInt(id));
      if (!bankAccount) {
        return res.status(404).json({
          success: false,
          message: 'BankAccount not found.',
          data: null,
          bankAccountId: null,
          newBankAccountId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'BankAccount retrieved successfully.',
        data: bankAccount,
        bankAccountId: id,
        newBankAccountId: null
      });
    } catch (err) {
      console.error('Error in getBankAccountById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        bankAccountId: null,
        newBankAccountId: null
      });
    }
  }

  // Update a BankAccount
  static async updateBankAccount(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required.',
          data: null,
          bankAccountId: null,
          newBankAccountId: null
        });
      }

      const result = await BankAccountModel.updateBankAccount(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        bankAccountId: id,
        newBankAccountId: null
      });
    } catch (err) {
      console.error('Error in updateBankAccount:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        bankAccountId: null,
        newBankAccountId: null
      });
    }
  }

  // Delete a BankAccount
  static async deleteBankAccount(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;
      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required.',
          data: null,
          bankAccountId: null,
          newBankAccountId: null
        });
      }

      const result = await BankAccountModel.deleteBankAccount(parseInt(id), createdById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        bankAccountId: id,
        newBankAccountId: null
      });
    } catch (err) {
      console.error('Error in deleteBankAccount:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        bankAccountId: null,
        newBankAccountId: null
      });
    }
  }
}

module.exports = BankAccountController;
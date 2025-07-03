const CustomerModel = require('../models/customerModel');

class CustomerController {
  static async getAllCustomers(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate pagination parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          pagination: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          pagination: null
        });
      }

      // Validate date parameters
      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fromDate format (use YYYY-MM-DD)',
          data: null,
          pagination: null
        });
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid toDate format (use YYYY-MM-DD)',
          data: null,
          pagination: null
        });
      }

      const customers = await CustomerModel.getAllCustomers({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      return res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data: customers.data || [],
        pagination: {
          totalRecords: customers.totalRecords,
          currentPage: customers.currentPage,
          pageSize: customers.pageSize,
          totalPages: customers.totalPages
        }
      });
    } catch (err) {
      console.error('getAllCustomers error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pagination: null
      });
    }
  }

  static async createCustomer(req, res) {
    try {
      const {
        CustomerName,
        CompanyID,
        CustomerEmail,
        ImportCode,
        BillingCurrencyID,
        Website,
        CustomerNotes,
        isInQuickBooks,
        QuickBookAccountID,
        CustomerAddressID,
        CreatedByID
      } = req.body;

      // Validate input
      if (!CustomerName || typeof CustomerName !== 'string' || CustomerName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerName is required',
          data: null,
          customerId: null
        });
      }
      if (!CompanyID || isNaN(parseInt(CompanyID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CompanyID is required',
          data: null,
          customerId: null
        });
      }
      if (!CreatedByID || isNaN(parseInt(CreatedByID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CreatedByID is required',
          data: null,
          customerId: null
        });
      }
      if (CustomerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CustomerEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CustomerEmail format',
          data: null,
          customerId: null
        });
      }
      if (BillingCurrencyID && isNaN(parseInt(BillingCurrencyID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid BillingCurrencyID is required',
          data: null,
          customerId: null
        });
      }
      if (CustomerAddressID && isNaN(parseInt(CustomerAddressID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerAddressID is required',
          data: null,
          customerId: null
        });
      }

      const data = {
        CustomerName: CustomerName.trim(),
        CompanyID: parseInt(CompanyID),
        CustomerEmail: CustomerEmail || null,
        ImportCode: ImportCode || null,
        BillingCurrencyID: BillingCurrencyID ? parseInt(BillingCurrencyID) : null,
        Website: Website || null,
        CustomerNotes: CustomerNotes || null,
        isInQuickBooks: isInQuickBooks ? 1 : 0,
        QuickBookAccountID: QuickBookAccountID || null,
        CustomerAddressID: CustomerAddressID ? parseInt(CustomerAddressID) : null,
        CreatedByID: parseInt(CreatedByID)
      };

      console.log('Creating customer with data:', JSON.stringify(data, null, 2));
      const result = await CustomerModel.createCustomer(data);
      console.log('Create customer result:', JSON.stringify(result, null, 2));

      if (!result || !result.customerId) {
        throw new Error('Failed to create customer: Invalid response from model');
      }

      return res.status(201).json({
        success: true,
        message: result.message || 'Customer created successfully',
        data: data,
        customerId: result.customerId
      });
    } catch (err) {
      console.error('createCustomer error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }

  static async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      const customerId = parseInt(id, 10);
      if (!id || isNaN(customerId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID is required',
          data: null,
          customerId: null
        });
      }

      const customer = await CustomerModel.getCustomerById(customerId);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          data: null,
          customerId: null
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Customer retrieved successfully',
        data: customer,
        customerId: id
      });
    } catch (err) {
      console.error('getCustomerById error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }

  static async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const {
        CustomerName,
        CompanyID,
        CustomerEmail,
        ImportCode,
        BillingCurrencyID,
        Website,
        CustomerNotes,
        isInQuickBooks,
        QuickBookAccountID,
        CustomerAddressID,
        CreatedByID
      } = req.body;

      const customerId = parseInt(id, 10);
      if (!id || isNaN(customerId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID is required',
          data: null,
          customerId: null
        });
      }

      if (!CustomerName || typeof CustomerName !== 'string' || CustomerName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerName is required',
          data: null,
          customerId: null
        });
      }
      if (!CompanyID || isNaN(parseInt(CompanyID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CompanyID is required',
          data: null,
          customerId: null
        });
      }
      if (!CreatedByID || isNaN(parseInt(CreatedByID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CreatedByID is required',
          data: null,
          customerId: null
        });
      }
      if (CustomerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CustomerEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CustomerEmail format',
          data: null,
          customerId: null
        });
      }
      if (BillingCurrencyID && isNaN(parseInt(BillingCurrencyID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid BillingCurrencyID is required',
          data: null,
          customerId: null
        });
      }
      if (CustomerAddressID && isNaN(parseInt(CustomerAddressID))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerAddressID is required',
          data: null,
          customerId: null
        });
      }

      const data = {
        CustomerName: CustomerName.trim(),
        CompanyID: parseInt(CompanyID),
        CustomerEmail: CustomerEmail || null,
        ImportCode: ImportCode || null,
        BillingCurrencyID: BillingCurrencyID ? parseInt(BillingCurrencyID) : null,
        Website: Website || null,
        CustomerNotes: CustomerNotes || null,
        isInQuickBooks: isInQuickBooks ? 1 : 0,
        QuickBookAccountID: QuickBookAccountID || null,
        CustomerAddressID: CustomerAddressID ? parseInt(CustomerAddressID) : null,
        CreatedByID: parseInt(CreatedByID)
      };

      console.log('Updating customer with id:', customerId, 'and data:', JSON.stringify(data, null, 2));
      const result = await CustomerModel.updateCustomer(customerId, data);
      console.log('Update customer result:', JSON.stringify(result, null, 2));

      if (!result) {
        throw new Error('Invalid response from CustomerModel');
      }

      return res.status(200).json({
        success: true,
        message: result.message || 'Customer updated successfully',
        data: null,
        customerId: id
      });
    } catch (err) {
      console.error('updateCustomer error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }

  static async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      const customerId = parseInt(id, 10);
      if (!id || isNaN(customerId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID is required',
          data: null,
          customerId: null
        });
      }

      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CreatedByID is required',
          data: null,
          customerId: null
        });
      }

      console.log('Deleting customer with id:', customerId, 'by createdById:', createdById);
      const result = await CustomerModel.deleteCustomer(customerId, parseInt(createdById));
      console.log('Delete customer result:', JSON.stringify(result, null, 2));

      return res.status(200).json({
        success: true,
        message: result.message || 'Customer deleted successfully',
        data: null,
        customerId: id
      });
    } catch (err) {
      console.error('deleteCustomer error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }
}

module.exports = CustomerController;
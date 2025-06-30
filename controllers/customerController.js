const CustomerModel = require('../models/customerModel');

class CustomerController {
  // Get all Customers with pagination
  static async getAllCustomers(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      const customers = await CustomerModel.getAllCustomers({
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data: customers.data,
        totalRecords: customers.totalRecords
      });
    } catch (err) {
      console.error('getAllCustomers error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }

  // Create a new Customer
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

      // Basic validation
      if (!CustomerName || !CompanyID || !CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'CustomerName, CompanyID, and CreatedByID are required',
          data: null,
          customerId: null
        });
      }

      const result = await CustomerModel.createCustomer({
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
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        customerId: null
      });
    } catch (err) {
      console.error('createCustomer error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }

  // Get a single Customer by ID
  static async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID is required',
          data: null,
          customerId: null
        });
      }

      const customer = await CustomerModel.getCustomerById(parseInt(id));

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          data: null,
          customerId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Customer retrieved successfully',
        data: customer,
        customerId: id
      });
    } catch (err) {
      console.error('getCustomerById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }

  // Update a Customer
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

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CustomerID is required',
          data: null,
          customerId: null
        });
      }

      if (!CustomerName || !CompanyID || !CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'CustomerName, CompanyID, and CreatedByID are required',
          data: null,
          customerId: id
        });
      }

      const result = await CustomerModel.updateCustomer(parseInt(id), {
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
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        customerId: id
      });
    } catch (err) {
      console.error('updateCustomer error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        customerId: null
      });
    }
  }

  // Delete a Customer
  static async deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const { createdById } = req.body;

    // Validate id
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid CustomerID is required',
        data: null,
        customerId: null,
      });
    }

    // Validate createdById
    if (!createdById) {
      return res.status(400).json({
        success: false,
        message: 'CreatedByID is required',
        data: null,
        customerId: id,
      });
    }

    // Log the input parameters for debugging
    console.log('deleteCustomer params:', { id, createdById });

    // Call the model with both id and createdById
    const result = await CustomerModel.deleteCustomer(parseInt(id), createdById);

    // Validate the result
    if (!result || typeof result.message === 'undefined') {
      return res.status(500).json({
        success: false,
        message: 'Invalid response from delete operation',
        data: null,
        customerId: id,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
      customerId: id,
    });
  } catch (err) {
    console.error('deleteCustomer error:', err);
    return res.status(500).json({
      success: false,
      message: `Server error: ${err.message}`,
      data: null,
      customerId: null,
    });
  }
}
}
module.exports = CustomerController;
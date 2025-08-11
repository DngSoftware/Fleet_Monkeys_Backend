const poolPromise = require('../config/db.config');

class CustomerModel {
  static async getAllCustomers({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1 || pageSize > 100) pageSize = 10; // Cap pageSize at 100
      let formattedFromDate = null, formattedToDate = null;

      if (fromDate) {
        formattedFromDate = new Date(fromDate);
        if (isNaN(formattedFromDate)) throw new Error('Invalid fromDate');
      }
      if (toDate) {
        formattedToDate = new Date(toDate);
        if (isNaN(formattedToDate)) throw new Error('Invalid toDate');
      }
      if (formattedFromDate && formattedToDate && formattedFromDate > formattedToDate) {
        throw new Error('fromDate cannot be later than toDate');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null,
        formattedToDate ? formattedToDate.toISOString().split('T')[0] : null
      ];

      // Log query parameters
      console.log('getAllCustomers params:', JSON.stringify(queryParams, null, 2));

      // Call SP_GetAllCustomers
      const [results] = await pool.query(
        'CALL SP_GetAllCustomers(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllCustomers results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('getAllCustomers output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllCustomers');
      }

      if (outParams.StatusCode !== 0) {
        throw new Error(outParams.Message || 'Failed to retrieve customers');
      }

      // Extract totalRecords from the second result set
      const totalRecords = results[1]?.[0]?.TotalRecords || 0;

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllCustomers error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async createCustomer(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null,
        data.CustomerName,
        data.CompanyID,
        data.CustomerEmail,
        data.ImportCode,
        data.BillingCurrencyID,
        data.Website,
        data.CustomerNotes,
        data.isInQuickBooks ? 1 : 0,
        data.QuickBookAccountID,
        data.CustomerAddressID,
        data.CreatedByID
      ];

      // Log query parameters
      console.log('createCustomer params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageCustomer
      const [results] = await pool.query(
        'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('createCustomer results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('createCustomer output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomer');
      }

      if (outParams.StatusCode !== 1) {
        throw new Error(outParams.Message || 'Failed to create Customer');
      }

      // Extract CustomerID from message if available
      const customerIdMatch = outParams.Message.match(/ID: (\d+)/);
      const customerId = customerIdMatch ? parseInt(customerIdMatch[1]) : null;

      return {
        customerId,
        message: outParams.Message
      };
    } catch (err) {
      console.error('createCustomer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getCustomerById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ];

      // Log query parameters
      console.log('getCustomerById params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageCustomer
      const [results] = await pool.query(
        'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getCustomerById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('getCustomerById output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomer');
      }

      if (outParams.StatusCode !== 1) {
        throw new Error(outParams.Message || 'Customer not found');
      }

      return Array.isArray(results[0]) && results[0].length > 0 ? results[0][0] : null;
    } catch (err) {
      console.error('getCustomerById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async updateCustomer(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.CustomerName,
        data.CompanyID,
        data.CustomerEmail,
        data.ImportCode,
        data.BillingCurrencyID,
        data.Website,
        data.CustomerNotes,
        data.isInQuickBooks ? 1 : 0,
        data.QuickBookAccountID,
        data.CustomerAddressID,
        data.CreatedByID
      ];

      // Log query parameters
      console.log('updateCustomer params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageCustomer
      const [results] = await pool.query(
        'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('updateCustomer results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('updateCustomer output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomer');
      }

      if (outParams.StatusCode !== 1) {
        throw new Error(outParams.Message || 'Failed to update Customer');
      }

      return {
        message: outParams.Message
      };
    } catch (err) {
      console.error('updateCustomer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async deleteCustomer(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        createdById
      ];

      // Log query parameters
      console.log('deleteCustomer params:', JSON.stringify(queryParams, null, 2));

      // Call SP_ManageCustomer
      const [results] = await pool.query(
        'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('deleteCustomer results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('deleteCustomer output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomer');
      }

      if (outParams.StatusCode !== 1) {
        throw new Error(outParams.Message || 'Failed to delete Customer');
      }

      return {
        message: outParams.Message
      };
    } catch (err) {
      console.error('deleteCustomer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = CustomerModel;
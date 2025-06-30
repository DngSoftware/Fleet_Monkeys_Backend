const poolPromise = require('../config/db.config');

class CustomerModel {
  // Get paginated Customers
  static async getAllCustomers({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10,
        fromDate ? new Date(fromDate) : null,
        toDate ? new Date(toDate) : null
      ];

      // Log query parameters
      console.log('getAllCustomers params:', queryParams);

      // Call SP_GetAllCustomers
      const [results] = await pool.query(
        'CALL SP_GetAllCustomers(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllCustomers results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');
      
      // Log output
      console.log('getAllCustomers output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllCustomers');
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to retrieve customers');
      }

      return {
        data: results[0] || [],
        totalRecords: null // SP does not return total count
      };
    } catch (err) {
      console.error('getAllCustomers error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Customer
  static async createCustomer(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_CustomerID
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
      console.log('createCustomer params:', queryParams);

      // Call SP_ManageCustomer
      const [results] = await pool.query(
        'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('createCustomer results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('createCustomer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Customer');
      }

      return {
        CustomerID: null, // SP does not return new ID explicitly
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createCustomer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Customer by ID
  static async getCustomerById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_CustomerName
        null, // p_CompanyID
        null, // p_CustomerEmail
        null, // p_ImportCode
        null, // p_BillingCurrencyID
        null, // p_Website
        null, // p_CustomerNotes
        null, // p_IsInQuickBooks
        null, // p_QuickBookAccountID
        null, // p_CustomerAddressID
        null  // p_CreatedByID
      ];

      // Log query parameters
      console.log('getCustomerById params:', queryParams);

      // Call SP_ManageCustomer
      const [results] = await pool.query(
        'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getCustomerById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getCustomerById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Customer not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getCustomerById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Customer
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
      console.log('updateCustomer params:', queryParams);

      // Call SP_ManageCustomer
      const [results] = await pool.query(
        'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('updateCustomer results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateCustomer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCustomer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Customer');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateCustomer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Customer
  static async deleteCustomer(id, createdById) {
  try {
    const pool = await poolPromise;

    const queryParams = [
      'DELETE',
      id,
      null, // p_CustomerName
      null, // p_CompanyID
      null, // p_CustomerEmail
      null, // p_ImportCode
      null, // p_BillingCurrencyID
      null, // p_Website
      null, // p_CustomerNotes
      null, // p_IsInQuickBooks
      null, // p_QuickBookAccountID
      null, // p_CustomerAddressID
      createdById // p_CreatedById
    ];

    // Log query parameters
    console.log('deleteCustomer params:', queryParams);

    // Call SP_ManageCustomer
    const [results] = await pool.query(
      'CALL SP_ManageCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
      queryParams
    );

    // Log results
    console.log('deleteCustomer results:', JSON.stringify(results, null, 2));

    // Fetch output parameters
    const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

    // Log output
    console.log('deleteCustomer output:', JSON.stringify(output, null, 2));

    if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
      throw new Error('Output parameters missing from SP_ManageCustomer');
    }

    if (output[0].p_Result !== 1) {
      throw new Error(output[0].p_Message || 'Failed to delete Customer');
    }

    return {
      message: output[0].p_Message,
    };
  } catch (err) {
    console.error('deleteCustomer error:', err);
    throw new Error(`Database error: ${err.message}`);
  }
}
}

module.exports = CustomerModel;
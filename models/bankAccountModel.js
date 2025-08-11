const poolPromise = require('../config/db.config');

class BankAccountModel {
  static async getAllBankAccounts({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
      formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
      formattedToDate ? formattedToDate.toISOString().split('T')[0] : null
    ];

    // Log query parameters
    console.log('getAllBankAccounts params:', queryParams);

    // Call SP_GetBankAccount
    const [result] = await pool.query(
      'CALL SP_GetBankAccount(?, ?, ?, ?, @p_Result, @p_Message)',
      queryParams
    );

    // Log results
    console.log('getAllBankAccounts results:', JSON.stringify(result, null, 2));

    // Retrieve OUT parameters
    const [[outParams]] = await pool.query('SELECT @p_Result AS Result, @p_Message AS Message');

    // Log output
    console.log('getAllBankAccounts output:', JSON.stringify(outParams, null, 2));

    if (!outParams || typeof outParams.Result === 'undefined') {
      throw new Error('Output parameters missing from SP_GetBankAccount');
    }

    if (outParams.Result !== 1) {
      throw new Error(outParams.Message || 'Failed to retrieve BankAccounts');
    }

    // Extract total count from the second result set
    const totalRecords = result[0][1]?.[0]?.TotalCount || 0;

    return {
      data: result[0][0] || [], // First result set is paginated data
      totalRecords,
      currentPage: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalRecords / pageSize)
    };
  } catch (err) {
    console.error('getAllBankAccounts error:', err);
    throw new Error(`Database error: ${err.message}`);
  }
}
  // Create a new BankAccount
  static async createBankAccount(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_BankAccountID
        data.accountName,
        data.accountType || null,
        data.bankName,
        data.branchCode || null,
        data.iban || null,
        data.ifsc || null,
        data.micra || null,
        data.accountVerified || false,
        data.isDefaultAccount || false,
        data.disabled || false,
        data.createdById
      ];

      // Call sp_ManageBankAccount
      const [result] = await pool.query(
        'CALL sp_ManageBankAccount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      const outParams = result[0][0] || {};

      if (outParams.Result !== 1) {
        throw new Error(outParams.Message || 'Failed to create BankAccount');
      }

      return {
        newBankAccountId: parseInt(outParams.Message.split('ID: ')[1]) || null,
        message: outParams.Message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single BankAccount by ID
  static async getBankAccountById(id) {
    try {
      const pool = await poolPromise;

      // Call sp_ManageBankAccount
      const [result] = await pool.query(
        'CALL sp_ManageBankAccount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['SELECT', id, null, null, null, null, null, null, null, null, null, null, null]
      );

      const outParams = result[1]?.[0] || {};

      if (outParams.Result !== 1 && outParams.Result !== undefined) {
        throw new Error(outParams.Message || 'BankAccount not found');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a BankAccount
  static async updateBankAccount(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.accountName || null,
        data.accountType || null,
        data.bankName || null,
        data.branchCode || null,
        data.iban || null,
        data.ifsc || null,
        data.micra || null,
        data.accountVerified || null,
        data.isDefaultAccount || null,
        data.disabled || null,
        data.createdById
      ];

      // Call sp_ManageBankAccount
      const [result] = await pool.query(
        'CALL sp_ManageBankAccount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      const outParams = result[0][0] || {};

      if (outParams.Result !== 1) {
        throw new Error(outParams.Message || 'Failed to update BankAccount');
      }

      return {
        message: outParams.Message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a BankAccount
  static async deleteBankAccount(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, null, null, null, null, null, null, null, null, null,
        createdById
      ];

      // Call sp_ManageBankAccount
      const [result] = await pool.query(
        'CALL sp_ManageBankAccount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      const outParams = result[0][0] || {};

      if (outParams.Result !== 1) {
        throw new Error(outParams.Message || 'Failed to delete BankAccount');
      }

      return {
        message: outParams.Message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = BankAccountModel;
const poolPromise = require('../config/db.config');

class CurrencyModel {
 // Get paginated Currencies
  static async getAllCurrencies({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
        formattedFromDate ? formattedFromDate.toISOString() : null, // Full ISO format for DATETIME(3)
        formattedToDate ? formattedToDate.toISOString() : null
      ];

      // Log query parameters
      console.log('getAllCurrencies params:', queryParams);

      // Call SP_GetAllCurrencies
      const [results] = await pool.query(
        'CALL SP_GetAllCurrencies(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllCurrencies results:', JSON.stringify(results, null, 2));

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('getAllCurrencies output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllCurrencies');
      }

      if (outParams.StatusCode !== 0) {
        throw new Error(outParams.Message || 'Failed to retrieve Currencies');
      }

      // Extract total count from the second result set
      const totalRecords = results[1]?.[0]?.TotalRecords || 0;

      return {
        data: results[0] || [],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllCurrencies error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Currency
  static async createCurrency(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_CurrencyID
        data.currencyName,
        data.createdById
      ];

      // Call SP_ManageCurrency
      await pool.query(
        'CALL SP_ManageCurrency(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Currency');
      }

      return {
        currencyId: null, // SP does not return new ID
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Currency by ID
  static async getCurrencyById(id) {
    try {
      const pool = await poolPromise;

      // Call SP_ManageCurrency
      const [results] = await pool.query(
        'CALL SP_ManageCurrency(?, ?, ?, ?, @p_Result, @p_Message)',
        ['SELECT', id, null, null]
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Currency not found');
      }

      return results[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Currency
  static async updateCurrency(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.currencyName || null,
        data.createdById
      ];

      // Call SP_ManageCurrency
      await pool.query(
        'CALL SP_ManageCurrency(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Currency');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Currency
  static async deleteCurrency(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_CurrencyName
        createdById || null // p_CreatedByID
      ];

      // Call SP_ManageCurrency
      await pool.query(
        'CALL SP_ManageCurrency(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Currency');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = CurrencyModel;
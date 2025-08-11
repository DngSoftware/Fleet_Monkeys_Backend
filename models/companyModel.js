const poolPromise = require('../config/db.config');

class CompanyModel {
// Get paginated Companies
  static async getAllCompanies({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
      console.log('getAllCompanies params:', queryParams);

      // Call SP_GetAllCompanies
      const [results] = await pool.query(
        'CALL SP_GetAllCompanies(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllCompanies results:', JSON.stringify(results, null, 2));

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('getAllCompanies output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllCompanies');
      }

      if (outParams.StatusCode !== 0) {
        throw new Error(outParams.Message || 'Failed to retrieve Companies');
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
      console.error('getAllCompanies error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
  // Create a new Company
  static async createCompany(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_CompanyID
        data.companyName,
        data.companyTypeId || null,
        data.billingCurrencyId || null,
        data.vatAccount || null,
        data.website || null,
        data.companyNotes || null,
        data.companyAddressId || null,
        data.createdById
      ];

      // Call SP_ManageCompany
      await pool.query(
        'CALL SP_ManageCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Company');
      }

      return {
        companyId: null, // SP does not return new ID
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Company by ID
  static async getCompanyById(id) {
    try {
      const pool = await poolPromise;

      // Call SP_ManageCompany
      const [results] = await pool.query(
        'CALL SP_ManageCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        ['SELECT', id, null, null, null, null, null, null, null, null]
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Company not found');
      }

      return results[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Company
  static async updateCompany(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.companyName || null,
        data.companyTypeId || null,
        data.billingCurrencyId || null,
        data.vatAccount || null,
        data.website || null,
        data.companyNotes || null,
        data.companyAddressId || null,
        data.createdById
      ];

      // Call SP_ManageCompany
      await pool.query(
        'CALL SP_ManageCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Company');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Company
  static async deleteCompany(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_CompanyName
        null, // p_CompanyTypeID
        null, // p_BillingCurrencyID
        null, // p_VAT_Account
        null, // p_Website
        null, // p_CompanyNotes
        null, // p_CompanyAddressID
        createdById || null // p_CreatedByID
      ];

      // Call SP_ManageCompany
      await pool.query(
        'CALL SP_ManageCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Company');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = CompanyModel;
const poolPromise = require('../config/db.config');

class TaxChargesTypeModel {
  static async getAllTaxChargesTypes({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1) pageSize = 10;
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
        formattedFromDate ? formattedFromDate.toISOString() : null,
        formattedToDate ? formattedToDate.toISOString() : null
      ];

      // Log query parameters
      console.log('getAllTaxChargesTypes params:', queryParams);

      // Manually query total count
      const [countResult] = await pool.query(
        `SELECT COUNT(*) AS totalRecords
         FROM dbo_tbltaxchargestype
         WHERE IsDeleted = 0
           AND (? IS NULL OR CreatedDateTime >= ?)
           AND (? IS NULL OR CreatedDateTime <= ?)`,
        [formattedFromDate, formattedFromDate, formattedToDate, formattedToDate]
      );

      const totalRecords = countResult[0].totalRecords || 0;

      // Call SP_GetAllTaxChargesTypes
      const [results] = await pool.query(
        'CALL SP_GetAllTaxChargesTypes(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllTaxChargesTypes results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getAllTaxChargesTypes output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllTaxChargesTypes');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve Tax Charge Types');
      }

      // Extract paginated data
      const taxChargesTypes = results[0] || [];

      return {
        data: taxChargesTypes,
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllTaxChargesTypes error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async createTaxChargesType(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_TaxChargesTypeID
        data.taxChargesType,
        data.defaultCharges,
        data.createdById
      ];

      console.log('createTaxChargesType params:', queryParams);

      await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_TaxChargesTypeID AS p_TaxChargesTypeID');

      console.log('createTaxChargesType output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTaxChargesType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Tax Charge Type');
      }

      return {
        taxChargesTypeId: output[0].p_TaxChargesTypeID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createTaxChargesType error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getTaxChargesTypeById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_TaxChargesType
        null, // p_DefaultCharges
        null  // p_CreatedByID
      ];

      console.log('getTaxChargesTypeById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getTaxChargesTypeById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getTaxChargesTypeById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTaxChargesType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Tax Charge Type not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getTaxChargesTypeById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async updateTaxChargesType(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.taxChargesType,
        data.defaultCharges,
        data.createdById
      ];

      console.log('updateTaxChargesType params:', queryParams);

      await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateTaxChargesType output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTaxChargesType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Tax Charge Type');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateTaxChargesType error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async deleteTaxChargesType(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_TaxChargesType
        null, // p_DefaultCharges
        createdById
      ];

      console.log('deleteTaxChargesType params:', queryParams);

      await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteTaxChargesType output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTaxChargesType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Tax Charge Type');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteTaxChargesType error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = TaxChargesTypeModel;
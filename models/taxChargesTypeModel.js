const poolPromise = require('../config/db.config');

class TaxChargesTypeModel {
  // Get paginated Tax Charge Types
  static async getAllTaxChargesTypes({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
      console.log('getAllTaxChargesTypes params:', queryParams);

      // Call SP_GetAllTaxChargesTypes with session variables for OUT parameters
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

      return {
        data: results[0] || [],
        totalRecords: null // SP does not return total count
      };
    } catch (err) {
      console.error('getAllTaxChargesTypes error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Tax Charge Type
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

      // Log query parameters
      console.log('createTaxChargesType params:', queryParams);

      // Call SP_ManageTaxChargesType with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters, including p_TaxChargesTypeID
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_TaxChargesTypeID AS p_TaxChargesTypeID');

      // Log output
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

  // Get a single Tax Charge Type by ID
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

      // Log query parameters
      console.log('getTaxChargesTypeById params:', queryParams);

      // Call SP_ManageTaxChargesType with session variables for OUT parameters
      const [results] = await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getTaxChargesTypeById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
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

  // Update a Tax Charge Type
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

      // Log query parameters
      console.log('updateTaxChargesType params:', queryParams);

      // Call SP_ManageTaxChargesType with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
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

  // Delete a Tax Charge Type
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

      // Log query parameters
      console.log('deleteTaxChargesType params:', queryParams);

      // Call SP_ManageTaxChargesType with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageTaxChargesType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
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
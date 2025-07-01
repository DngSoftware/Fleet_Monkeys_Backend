const poolPromise = require('../config/db.config');

class FormModel {
  static async getAllForms({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
        formattedFromDate ? formattedFromDate.toISOString() : null, // Full ISO format for DATETIME
        formattedToDate ? formattedToDate.toISOString() : null
      ];

      // Log query parameters
      console.log('getAllForms params:', queryParams);

      // Call SP_GetAllForms
      const [results] = await pool.query(
        'CALL SP_GetAllForms(?, ?, @p_Result, @p_Message)',
        [pageNumber, pageSize]
      );

      // Log results
      console.log('getAllForms results:', JSON.stringify(results, null, 2));

      // Retrieve OUT parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getAllForms output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllForms');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve Forms');
      }

      // Extract paginated data and total count
      const forms = results[0] || [];
      const totalRecords = results[1]?.[0]?.TotalRecords || 0;

      return {
        data: forms,
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllForms error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async createForm(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_FormID
        data.formName,
        data.createdById,
        null, // p_IsDeleted
        null // p_DeletedByID
      ];

      console.log('createForm params:', queryParams);

      await pool.query(
        'CALL SP_ManageForm(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_FormID AS p_FormID');

      console.log('createForm output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageForm');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Form');
      }

      return {
        formId: output[0].p_FormID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createForm error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getFormById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_FormName
        null, // p_CreatedByID
        null, // p_IsDeleted
        null // p_DeletedByID
      ];

      console.log('getFormById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageForm(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getFormById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getFormById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageForm');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Form not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getFormById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async updateForm(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.formName,
        data.createdById,
        data.isDeleted,
        data.deletedById
      ];

      console.log('updateForm params:', queryParams);

      await pool.query(
        'CALL SP_ManageForm(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateForm output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageForm');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Form');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateForm error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async deleteForm(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_FormName
        null, // p_CreatedByID
        null, // p_IsDeleted
        deletedById
      ];

      console.log('deleteForm params:', queryParams);

      await pool.query(
        'CALL SP_ManageForm(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteForm output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageForm');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Form');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteForm error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = FormModel;
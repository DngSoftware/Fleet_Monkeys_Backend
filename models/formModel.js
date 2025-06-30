const poolPromise = require('../config/db.config');

class FormModel {
  static async getAllForms({ pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10
      ];

      console.log('getAllForms params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_GetAllForms(?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllForms results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllForms output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllForms');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve Forms');
      }

      return {
        data: results[0] || [],
        totalRecords: results[1] && results[1][0] ? results[1][0].TotalRecords : 0
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
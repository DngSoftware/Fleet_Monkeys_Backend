const poolPromise = require('../config/db.config');

class FormRoleModel {
  static async getAllFormRoles({ pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10
      ];

      console.log('getAllFormRoles params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_GetAllFormRoles(?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllFormRoles results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllFormRoles output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllFormRoles');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve FormRoles');
      }

      return {
        data: results[0] || [],
        totalRecords: results[1] && results[1][0] ? results[1][0].TotalRecords : 0
      };
    } catch (err) {
      console.error('getAllFormRoles error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async createFormRole(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_FormRoleID
        data.formId,
        data.roleId,
        data.readOnly,
        data.writes,
        null // p_CreatedByID
      ];

      console.log('createFormRole params:', queryParams);

      await pool.query(
        'CALL SP_ManageFormRole(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_FormRoleID AS p_FormRoleID');

      console.log('createFormRole output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRole');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create FormRole');
      }

      return {
        formRoleId: output[0].p_FormRoleID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createFormRole error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getFormRoleById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_FormID
        null, // p_RoleID
        null, // p_ReadOnly
        null, // p_Writes
        null // p_CreatedByID
      ];

      console.log('getFormRoleById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageFormRole(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getFormRoleById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getFormRoleById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRole');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'FormRole not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getFormRoleById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async updateFormRole(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.formId,
        data.roleId,
        data.readOnly,
        data.writes,
        data.createdById
      ];

      console.log('updateFormRole params:', queryParams);

      await pool.query(
        'CALL SP_ManageFormRole(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateFormRole output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRole');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update FormRole');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateFormRole error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async deleteFormRole(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_FormID
        null, // p_RoleID
        null, // p_ReadOnly
        null, // p_Writes
        createdById
      ];

      console.log('deleteFormRole params:', queryParams);

      await pool.query(
        'CALL SP_ManageFormRole(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteFormRole output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRole');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete FormRole');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteFormRole error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = FormRoleModel;

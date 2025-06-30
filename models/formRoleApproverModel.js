const poolPromise = require('../config/db.config');

class FormRoleApproverModel {
  static async getAllFormRoleApprovers({ pageNumber = 1, pageSize = 10, formRoleId = null, userId = null, activeOnly = null, createdBy = null }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10,
        formRoleId,
        userId,
        activeOnly !== null ? (activeOnly ? 1 : 0) : null,
        createdBy
      ];

      console.log('getAllFormRoleApprovers params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_GetAllFormRoleApprovers(?, ?, ?, ?, ?, ?, @p_TotalRecords)',
        queryParams
      );

      console.log('getAllFormRoleApprovers results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_TotalRecords AS p_TotalRecords');

      console.log('getAllFormRoleApprovers output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_TotalRecords === 'undefined') {
        throw new Error('Output parameter missing from SP_GetAllFormRoleApprovers');
      }

      if (output[0].p_TotalRecords === -1) {
        throw new Error('Failed to retrieve FormRoleApprovers');
      }

      return {
        data: results[0] || [],
        totalRecords: output[0].p_TotalRecords
      };
    } catch (err) {
      console.error('getAllFormRoleApprovers error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async createFormRoleApprover(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_FormRoleApproverID
        data.formRoleId,
        data.userId,
        data.activeYN,
        data.createdById
      ];

      console.log('createFormRoleApprover params:', queryParams);

      await pool.query(
        'CALL SP_ManageFormRoleApprover(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_FormRoleApproverID AS p_FormRoleApproverID');

      console.log('createFormRoleApprover output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRoleApprover');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create FormRoleApprover');
      }

      return {
        formRoleApproverId: output[0].p_FormRoleApproverID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createFormRoleApprover error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getFormRoleApproverById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_FormRoleID
        null, // p_UserID
        null, // p_ActiveYN
        null // p_CreatedByID
      ];

      console.log('getFormRoleApproverById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageFormRoleApprover(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getFormRoleApproverById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getFormRoleApproverById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRoleApprover');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'FormRoleApprover not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getFormRoleApproverById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async updateFormRoleApprover(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.formRoleId,
        data.userId,
        data.activeYN,
        data.createdById
      ];

      console.log('updateFormRoleApprover params:', queryParams);

      await pool.query(
        'CALL SP_ManageFormRoleApprover(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_FormRoleApproverID AS p_FormRoleApproverID');

      console.log('updateFormRoleApprover output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRoleApprover');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update FormRoleApprover');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateFormRoleApprover error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async deleteFormRoleApprover(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_FormRoleID
        null, // p_UserID
        null, // p_ActiveYN
        createdById
      ];

      console.log('deleteFormRoleApprover params:', queryParams);

      await pool.query(
        'CALL SP_ManageFormRoleApprover(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteFormRoleApprover output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageFormRoleApprover');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete FormRoleApprover');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteFormRoleApprover error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = FormRoleApproverModel;
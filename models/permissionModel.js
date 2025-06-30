const poolPromise = require('../config/db.config');

class PermissionModel {
  // Get paginated Permissions
  static async getAllPermissions({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10,
        fromDate ? new Date(fromDate) : null,
        toDate ? new Date(toDate) : null
      ];

      // Call SP_GetAllPermissions
      const [results] = await pool.query(
        'CALL SP_GetAllPermissions(?, ?, ?, ?)',
        queryParams
      );

      // Extract paginated data and total count
      const permissions = results[0];
      const totalRecords = results[1][0].TotalRecords;

      return {
        data: permissions,
        totalRecords
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Permission
  static async createPermission(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_PermissionID
        data.permissionName,
        data.createdById,
        null // p_DeletedByID
      ];

      // Call SP_ManagePermission
      await pool.query(
        'CALL SP_ManagePermission(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Permission');
      }

      return {
        permissionId: null, // SP does not return new ID
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Permission by ID
  static async getPermissionById(id) {
    try {
      const pool = await poolPromise;

      // Call SP_ManagePermission
      const [result] = await pool.query(
        'CALL SP_ManagePermission(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        ['SELECT', id, null, null, null]
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Permission not found');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Permission
  static async updatePermission(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.permissionName || null,
        data.createdById,
        null // p_DeletedByID
      ];

      // Call SP_ManagePermission
      await pool.query(
        'CALL SP_ManagePermission(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Permission');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Permission
  static async deletePermission(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_PermissionName
        null, // p_CreatedByID
        deletedById || null // p_DeletedByID
      ];

      // Call SP_ManagePermission
      await pool.query(
        'CALL SP_ManagePermission(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Permission');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = PermissionModel;
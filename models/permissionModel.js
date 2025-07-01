const poolPromise = require('../config/db.config');

class PermissionModel {
  static async getAllPermissions({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
      console.log('getAllPermissions params:', queryParams);

      // Call SP_GetAllPermissions
      const [results] = await pool.query(
        'CALL SP_GetAllPermissions(?, ?, ?, ?)',
        queryParams
      );

      // Log results
      console.log('getAllPermissions results:', JSON.stringify(results, null, 2));

      // Extract paginated data and total count
      const permissions = results[0] || [];
      const totalRecords = results[1]?.[0]?.TotalRecords || 0;

      return {
        data: permissions,
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllPermissions error:', err);
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
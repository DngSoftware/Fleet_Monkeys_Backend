const poolPromise = require('../config/db.config');

class RoleModel {
  // Get all Roles with pagination and filtering
  static async getAllRoles({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null, roleName = null, createdById = null }) {
    try {
      const pool = await poolPromise;

      // Minimal validation (stored procedure handles most validation)
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1) pageSize = 10;

      let formattedFromDate = null, formattedToDate = null;
      if (fromDate) {
        formattedFromDate = new Date(fromDate);
        if (isNaN(formattedFromDate)) throw new Error('Invalid fromDate');
        formattedFromDate = formattedFromDate.toISOString().split('T')[0];
      }
      if (toDate) {
        formattedToDate = new Date(toDate);
        if (isNaN(formattedToDate)) throw new Error('Invalid toDate');
        formattedToDate = formattedToDate.toISOString().split('T')[0];
      }
      if (formattedFromDate && formattedToDate && formattedFromDate > formattedToDate) {
        throw new Error('fromDate cannot be later than toDate');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        formattedFromDate,
        formattedToDate,
        roleName ? roleName.trim() : null,
        createdById ? createdById.toString().trim() : null // Convert to string for VARCHAR(128)
      ];

      console.log('getAllRoles params:', JSON.stringify(queryParams, null, 2));

      // Call the stored procedure
      const [results] = await pool.query(
        'CALL SP_GetAllRoles(?, ?, ?, ?, ?, ?, @p_TotalRecords)',
        queryParams
      );

      console.log('getAllRoles results:', JSON.stringify(results, null, 2));

      // Fetch output parameter
      const [output] = await pool.query('SELECT @p_TotalRecords AS p_TotalRecords');

      console.log('getAllRoles output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_TotalRecords === null) {
        throw new Error(`Invalid output from SP_GetAllRoles: ${JSON.stringify(output)}`);
      }

      if (output[0].p_TotalRecords === -1) {
        throw new Error('Database error occurred in SP_GetAllRoles');
      }

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords: output[0].p_TotalRecords || 0,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil((output[0].p_TotalRecords || 0) / pageSize)
      };
    } catch (err) {
      console.error('getAllRoles error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Role by ID
  static async getRoleById(id) {
    try {
      const pool = await poolPromise;

      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        throw new Error('Valid RoleID is required');
      }

      const queryParams = [
        'SELECT',
        roleId,
        null, // p_rolename
        null, // p_description
        null, // p_createdbyid
        null  // p_deletedbyid
      ];

      console.log('getRoleById params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageRoles(?, ?, ?, ?, ?, ?, @p_newroleid, @p_result, @p_message)',
        queryParams
      );

      console.log('getRoleById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query(
        'SELECT @p_result AS p_result, @p_message AS p_message'
      );

      console.log('getRoleById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_result === null) {
        throw new Error('Invalid output from SP_ManageRoles');
      }

      if (output[0].p_result !== 1 && !output[0].p_message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_message || 'Role not found');
      }

      return Array.isArray(results[0]) && results[0].length > 0 ? results[0][0] : null;
    } catch (err) {
      console.error('getRoleById error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Role
  static async createRole(data) {
    try {
      const pool = await poolPromise;

      // Validate input
      if (!data.roleName || typeof data.roleName !== 'string' || data.roleName.trim() === '') {
        throw new Error('Valid roleName is required');
      }
      if (!data.createdById || isNaN(parseInt(data.createdById))) {
        throw new Error('Valid createdById is required');
      }
      if (data.description && typeof data.description !== 'string') {
        throw new Error('Valid description is required');
      }

      const queryParams = [
        'INSERT',
        null, // p_roleid
        data.roleName.trim(),
        data.description ? data.description.trim() : null,
        parseInt(data.createdById),
        null  // p_deletedbyid
      ];

      console.log('createRole params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageRoles(?, ?, ?, ?, ?, ?, @p_newroleid, @p_result, @p_message)',
        queryParams
      );

      console.log('createRole results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query(
        'SELECT @p_newroleid AS p_newroleid, @p_result AS p_result, @p_message AS p_message'
      );

      console.log('createRole output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_result === null) {
        throw new Error('Invalid output from SP_ManageRoles');
      }

      if (output[0].p_result !== 1 && !output[0].p_message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_message || 'Failed to create role');
      }

      return {
        roleId: output[0].p_newroleid || null,
        message: output[0].p_message || 'Role created successfully'
      };
    } catch (err) {
      console.error('createRole error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Role
  static async updateRole(roleId, data) {
    try {
      const pool = await poolPromise;

      const validatedRoleId = parseInt(roleId, 10);
      if (isNaN(validatedRoleId)) {
        throw new Error('Valid RoleID is required');
      }
      if (!data.roleName || typeof data.roleName !== 'string' || data.roleName.trim() === '') {
        throw new Error('Valid roleName is required');
      }
      if (!data.createdById || isNaN(parseInt(data.createdById))) {
        throw new Error('Valid createdById is required');
      }
      if (data.description && typeof data.description !== 'string') {
        throw new Error('Valid description is required');
      }

      const queryParams = [
        'UPDATE',
        validatedRoleId,
        data.roleName.trim(),
        data.description ? data.description.trim() : null,
        parseInt(data.createdById),
        null  // p_deletedbyid
      ];

      console.log('updateRole params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageRoles(?, ?, ?, ?, ?, ?, @p_newroleid, @p_result, @p_message)',
        queryParams
      );

      console.log('updateRole results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query(
        'SELECT @p_result AS p_result, @p_message AS p_message'
      );

      console.log('updateRole output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_result === null) {
        throw new Error('Invalid output from SP_ManageRoles');
      }

      if (output[0].p_result !== 1 && !output[0].p_message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_message || 'Failed to update role');
      }

      return {
        message: output[0].p_message || 'Role updated successfully'
      };
    } catch (err) {
      console.error('updateRole error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Role
  static async deleteRole(roleId, deletedById) {
    try {
      const pool = await poolPromise;

      const validatedRoleId = parseInt(roleId, 10);
      const validatedDeletedById = parseInt(deletedById, 10);
      if (isNaN(validatedRoleId)) {
        throw new Error('Valid RoleID is required');
      }
      if (isNaN(validatedDeletedById)) {
        throw new Error('Valid deletedById is required');
      }

      const queryParams = [
        'DELETE',
        validatedRoleId,
        null, // p_rolename
        null, // p_description
        null, // p_createdbyid
        validatedDeletedById
      ];

      console.log('deleteRole params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageRoles(?, ?, ?, ?, ?, ?, @p_newroleid, @p_result, @p_message)',
        queryParams
      );

      console.log('deleteRole results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query(
        'SELECT @p_result AS p_result, @p_message AS p_message'
      );

      console.log('deleteRole output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_result === null) {
        throw new Error('Invalid output from SP_ManageRoles');
      }

      if (output[0].p_result !== 1 && !output[0].p_message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_message || 'Failed to delete role');
      }

      return {
        message: output[0].p_message || 'Role deleted successfully'
      };
    } catch (err) {
      console.error('deleteRole error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = RoleModel;
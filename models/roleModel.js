const poolPromise = require('../config/db.config');

class RoleModel {
  // Get all Roles or a single Role by ID
  static async getAllRoles({ roleId = null }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        roleId ? parseInt(roleId) : null,
        null, // p_rolename
        null, // p_description
        null, // p_createdbyid
        null  // p_deletedbyid
      ];

      console.log('getRoles params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageRoles(?, ?, ?, ?, ?, ?, @p_newroleid, @p_result, @p_message)',
        queryParams
      );

      console.log('getRoles results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query(
        'SELECT @p_result AS p_result, @p_message AS p_message'
      );

      console.log('getRoles output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_result === null) {
        throw new Error('Invalid output from SP_ManageRoles');
      }

      if (output[0].p_result !== 1 && !output[0].p_message.toLowerCase().includes('successfully')) {
        throw new Error(output[0].p_message || 'Failed to retrieve roles');
      }

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords: results[0].length
      };
    } catch (err) {
      console.error('getRoles error:', err.stack);
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
const RoleModel = require('../models/roleModel');

class RoleController {
  // Get all Roles with pagination and filtering
  static async getAllRoles(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate, roleName, createdById } = req.query;

      // Validate pagination parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          pagination: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          pagination: null
        });
      }

      // Validate date parameters
      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fromDate format (use YYYY-MM-DD)',
          data: null,
          pagination: null
        });
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid toDate format (use YYYY-MM-DD)',
          data: null,
          pagination: null
        });
      }

      // Validate createdById
      if (createdById && isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid createdById',
          data: null,
          pagination: null
        });
      }

      const roles = await RoleModel.getAllRoles({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null,
        roleName: roleName || null,
        createdById: createdById ? parseInt(createdById) : null
      });

      return res.status(200).json({
        success: true,
        message: 'Roles retrieved successfully',
        data: roles.data || [],
        pagination: {
          totalRecords: roles.totalRecords,
          currentPage: roles.currentPage,
          pageSize: roles.pageSize,
          totalPages: roles.totalPages
        }
      });
    } catch (err) {
      console.error('getAllRoles error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pagination: null
      });
    }
  }

  // Create a new Role
  static async createRole(req, res) {
    try {
      const { roleName, description, createdById } = req.body;

      // Basic validation
      if (!roleName || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'RoleName and CreatedByID are required',
          data: null,
          roleId: null
        });
      }

      const result = await RoleModel.createRole({
        roleName,
        description,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        roleId: result.roleId
      });
    } catch (err) {
      console.error('createRole error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        roleId: null
      });
    }
  }

  // Get a single Role by ID
  static async getRoleById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid RoleID is required',
          data: null,
          roleId: null
        });
      }

      const role = await RoleModel.getRoleById(parseInt(id));

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
          data: null,
          roleId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Role retrieved successfully',
        data: role,
        roleId: id
      });
    } catch (err) {
      console.error('getRoleById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        roleId: null
      });
    }
  }

  // Update a Role
  static async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { roleName, description, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid RoleID is required',
          data: null,
          roleId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          roleId: id
        });
      }

      const result = await RoleModel.updateRole(parseInt(id), {
        roleName,
        description,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        roleId: id
      });
    } catch (err) {
      console.error('updateRole error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        roleId: null
      });
    }
  }

  // Delete a Role
  static async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const { deletedById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid RoleID is required',
          data: null,
          roleId: null
        });
      }

      if (!deletedById) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required',
          data: null,
          roleId: id
        });
      }

      const result = await RoleModel.deleteRole(parseInt(id), deletedById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        roleId: id
      });
    } catch (err) {
      console.error('deleteRole error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        roleId: null
      });
    }
  }
}

module.exports = RoleController;
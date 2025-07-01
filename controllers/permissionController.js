const PermissionModel = require('../models/permissionModel');

class PermissionController {
  static async getAllPermissions(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          permissionId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          permissionId: null
        });
      }

      const result = await PermissionModel.getAllPermissions({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      res.status(200).json({
        success: true,
        message: 'Permission records retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        },
        permissionId: null
      });
    } catch (err) {
      console.error('Error in getAllPermissions:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        permissionId: null
      });
    }
  }

  // Create a new Permission
  static async createPermission(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.permissionName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'PermissionName and CreatedById are required.',
          data: null,
          permissionId: null
        });
      }

      const result = await PermissionModel.createPermission(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        permissionId: result.permissionId
      });
    } catch (err) {
      console.error('Error in createPermission:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        permissionId: null
      });
    }
  }

  // Get a single Permission by ID
  static async getPermissionById(req, res) {
    try {
      const { id } = req.params;
      const permission = await PermissionModel.getPermissionById(parseInt(id));
      if (!permission) {
        return res.status(400).json({
          success: false,
          message: 'Permission not found.',
          data: null,
          permissionId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Permission retrieved successfully.',
        data: permission,
        permissionId: id
      });
    } catch (err) {
      console.error('Error in getPermissionById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        permissionId: null
      });
    }
  }

  // Update a Permission
  static async updatePermission(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedById is required.',
          data: null,
          permissionId: null
        });
      }

      const result = await PermissionModel.updatePermission(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        permissionId: id
      });
    } catch (err) {
      console.error('Error in updatePermission:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        permissionId: null
      });
    }
  }

  // Delete a Permission
  static async deletePermission(req, res) {
    try {
      const { id } = req.params;
      const { deletedById } = req.body; // No validation, pass as-is

      const result = await PermissionModel.deletePermission(parseInt(id), deletedById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        permissionId: id
      });
    } catch (err) {
      console.error('Error in deletePermission:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        permissionId: null
      });
    }
  }
}

module.exports = PermissionController;
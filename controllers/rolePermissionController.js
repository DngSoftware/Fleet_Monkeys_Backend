const RolePermissionModel = require('../models/rolePermissionModel');

class RolePermissionController {
  static async createRolePermission(req, res) {
    try {
      const rolePermissionData = {
        PermissionID: req.body.PermissionID ? parseInt(req.body.PermissionID) : null,
        RoleID: req.body.RoleID ? parseInt(req.body.RoleID) : null,
        AllowRead: req.body.AllowRead != null ? Boolean(req.body.AllowRead) : null,
        AllowWrite: req.body.AllowWrite != null ? Boolean(req.body.AllowWrite) : null,
        AllowUpdate: req.body.AllowUpdate != null ? Boolean(req.body.AllowUpdate) : null,
        AllowDelete: req.body.AllowDelete != null ? Boolean(req.body.AllowDelete) : null,
        PersonID: req.body.PersonID ? parseInt(req.body.PersonID) : null,
        IsMaster: req.body.IsMaster != null ? Boolean(req.body.IsMaster) : null
      };

      const result = await RolePermissionModel.createRolePermission(rolePermissionData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create RolePermission error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleId: null
      });
    }
  }

  static async updateRolePermission(req, res) {
    try {
      const permissionRoleId = parseInt(req.params.id);
      if (isNaN(permissionRoleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PermissionRoleID',
          data: null,
          permissionRoleId: null
        });
      }

      const rolePermissionData = {
        PermissionRoleID: permissionRoleId,
        PermissionID: req.body.PermissionID ? parseInt(req.body.PermissionID) : null,
        RoleID: req.body.RoleID ? parseInt(req.body.RoleID) : null,
        AllowRead: req.body.AllowRead != null ? Boolean(req.body.AllowRead) : null,
        AllowWrite: req.body.AllowWrite != null ? Boolean(req.body.AllowWrite) : null,
        AllowUpdate: req.body.AllowUpdate != null ? Boolean(req.body.AllowUpdate) : null,
        AllowDelete: req.body.AllowDelete != null ? Boolean(req.body.AllowDelete) : null,
        PersonID: req.body.PersonID ? parseInt(req.body.PersonID) : null,
        IsMaster: req.body.IsMaster != null ? Boolean(req.body.IsMaster) : null
      };

      const result = await RolePermissionModel.updateRolePermission(rolePermissionData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update RolePermission error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleId: null
      });
    }
  }

  static async deleteRolePermission(req, res) {
    try {
      const permissionRoleId = parseInt(req.params.id);
      if (isNaN(permissionRoleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PermissionRoleID',
          data: null,
          permissionRoleId: null
        });
      }

      const rolePermissionData = {
        PermissionRoleID: permissionRoleId
      };

      const result = await RolePermissionModel.deleteRolePermission(rolePermissionData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete RolePermission error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleId: null
      });
    }
  }

  static async getRolePermission(req, res) {
    try {
      const permissionRoleId = parseInt(req.params.id);
      if (isNaN(permissionRoleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PermissionRoleID',
          data: null,
          permissionRoleId: null
        });
      }

      const rolePermissionData = {
        PermissionRoleID: permissionRoleId
      };

      const result = await RolePermissionModel.getRolePermission(rolePermissionData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get RolePermission error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleId: null
      });
    }
  }

  static async getAllRolePermissions(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10
      };

      const result = await RolePermissionModel.getAllRolePermissions(paginationData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get All RolePermissions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleId: null
      });
    }
  }
}

module.exports = RolePermissionController;

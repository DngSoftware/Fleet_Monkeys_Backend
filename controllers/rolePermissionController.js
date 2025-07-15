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
        PersonID: req.body.PersonID ? parseInt(req.body.PersonID) : null
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

  static async createBulkRolePermissions(req, res) {
    try {
      const rolePermissionsArray = req.body;
      if (!Array.isArray(rolePermissionsArray)) {
        return res.status(400).json({
          success: false,
          message: 'Request body must be an array of role permission objects',
          data: null,
          permissionRoleIds: []
        });
      }

      const processedPermissions = rolePermissionsArray.map(permission => ({
        PermissionID: permission.PermissionID ? parseInt(permission.PermissionID) : null,
        RoleID: permission.RoleID ? parseInt(permission.RoleID) : null,
        AllowRead: permission.AllowRead != null ? Boolean(permission.AllowRead) : null,
        AllowWrite: permission.AllowWrite != null ? Boolean(permission.AllowWrite) : null,
        AllowUpdate: permission.AllowUpdate != null ? Boolean(permission.AllowUpdate) : null,
        AllowDelete: permission.AllowDelete != null ? Boolean(permission.AllowDelete) : null,
        PersonID: permission.PersonID ? parseInt(permission.PersonID) : null
      }));

      const result = await RolePermissionModel.createBulkRolePermissions(processedPermissions);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create Bulk RolePermissions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        permissionRoleIds: []
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
        PersonID: req.body.PersonID ? parseInt(req.body.PersonID) : null
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

  static async updateRolePermissionsByRoleId(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing RoleID',
          data: null,
          updatedCount: 0
        });
      }

      const permissionData = {
        AllowRead: req.body.AllowRead != null ? Boolean(req.body.AllowRead) : null,
        AllowWrite: req.body.AllowWrite != null ? Boolean(req.body.AllowWrite) : null,
        AllowUpdate: req.body.AllowUpdate != null ? Boolean(req.body.AllowUpdate) : null,
        AllowDelete: req.body.AllowDelete != null ? Boolean(req.body.AllowDelete) : null
      };

      const result = await RolePermissionModel.updateRolePermissionsByRoleId(roleId, permissionData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update RolePermissions by RoleID error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        updatedCount: 0
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
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
        SortBy: req.query.sortBy || 'PermissionRoleID',
        SortOrder: req.query.sortOrder || 'ASC'
      };

      const result = await RolePermissionModel.getAllRolePermissions(paginationData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get All RolePermissions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        permissionRoleId: null
      });
    }
  }

  static async getRolePermissionsByRoleId(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing RoleID',
          data: null,
          totalRecords: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          personCount: 0
        });
      }

      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
        SortBy: req.query.sortBy || 'PermissionRoleID',
        SortOrder: req.query.sortOrder || 'ASC'
      };

      const result = await RolePermissionModel.getRolePermissionsByRoleId(roleId, paginationData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get RolePermissions by RoleID error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        personCount: 0
      });
    }
  }
}

module.exports = RolePermissionController;
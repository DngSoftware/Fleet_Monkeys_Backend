const FormRoleModel = require('../models/formRoleModel');

class FormRoleController {
  static async getAllFormRoles(req, res) {
    try {
      const { pageNumber, pageSize } = req.query;

      const formRoles = await FormRoleModel.getAllFormRoles({
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize)
      });

      return res.status(200).json({
        success: true,
        message: 'FormRoles retrieved successfully',
        data: formRoles.data,
        totalRecords: formRoles.totalRecords
      });
    } catch (err) {
      console.error('getAllFormRoles error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleId: null
      });
    }
  }

  static async createFormRole(req, res) {
    try {
      const { formId, roleId, readOnly, writes } = req.body;

      if (!formId || !roleId || readOnly === undefined || writes === undefined) {
        return res.status(400).json({
          success: false,
          message: 'FormID, RoleID, ReadOnly, and Writes are required',
          data: null,
          formRoleId: null
        });
      }

      const result = await FormRoleModel.createFormRole({
        formId,
        roleId,
        readOnly,
        writes
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        formRoleId: result.formRoleId
      });
    } catch (err) {
      console.error('createFormRole error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleId: null
      });
    }
  }

  static async getFormRoleById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormRoleID is required',
          data: null,
          formRoleId: null
        });
      }

      const formRole = await FormRoleModel.getFormRoleById(parseInt(id));

      if (!formRole) {
        return res.status(404).json({
          success: false,
          message: 'FormRole not found',
          data: null,
          formRoleId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'FormRole retrieved successfully',
        data: formRole,
        formRoleId: id
      });
    } catch (err) {
      console.error('getFormRoleById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleId: null
      });
    }
  }

  static async updateFormRole(req, res) {
    try {
      const { id } = req.params;
      const { formId, roleId, readOnly, writes, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormRoleID is required',
          data: null,
          formRoleId: null
        });
      }

      if (!formId || !roleId || readOnly === undefined || writes === undefined || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'FormID, RoleID, ReadOnly, Writes, and CreatedByID are required',
          data: null,
          formRoleId: id
        });
      }

      const result = await FormRoleModel.updateFormRole(parseInt(id), {
        formId,
        roleId,
        readOnly,
        writes,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        formRoleId: id
      });
    } catch (err) {
      console.error('updateFormRole error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleId: null
      });
    }
  }

  static async deleteFormRole(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormRoleID is required',
          data: null,
          formRoleId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          formRoleId: id
        });
      }

      const result = await FormRoleModel.deleteFormRole(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        formRoleId: id
      });
    } catch (err) {
      console.error('deleteFormRole error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleId: null
      });
    }
  }
}

module.exports = FormRoleController;

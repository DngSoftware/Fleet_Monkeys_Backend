const FormRoleApproverModel = require('../models/formRoleApproverModel');

class FormRoleApproverController {
  static async getAllFormRoleApprovers(req, res) {
    try {
      const { pageNumber, pageSize, formRoleId, userId, activeOnly, createdBy } = req.query;

      const formRoleApprovers = await FormRoleApproverModel.getAllFormRoleApprovers({
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        formRoleId: formRoleId ? parseInt(formRoleId) : null,
        userId: userId ? parseInt(userId) : null,
        activeOnly: activeOnly !== undefined ? Boolean(parseInt(activeOnly)) : null,
        createdBy
      });

      return res.status(200).json({
        success: true,
        message: 'FormRoleApprovers retrieved successfully',
        data: formRoleApprovers.data,
        totalRecords: formRoleApprovers.totalRecords
      });
    } catch (err) {
      console.error('getAllFormRoleApprovers error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleApproverId: null
      });
    }
  }

  static async createFormRoleApprover(req, res) {
    try {
      const { formRoleId, userId, activeYN, createdById } = req.body;

      if (!formRoleId || !userId || activeYN === undefined || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'FormRoleID, UserID, ActiveYN, and CreatedByID are required',
          data: null,
          formRoleApproverId: null
        });
      }

      const result = await FormRoleApproverModel.createFormRoleApprover({
        formRoleId,
        userId,
        activeYN,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        formRoleApproverId: result.formRoleApproverId
      });
    } catch (err) {
      console.error('createFormRoleApprover error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleApproverId: null
      });
    }
  }

  static async getFormRoleApproverById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormRoleApproverID is required',
          data: null,
          formRoleApproverId: null
        });
      }

      const formRoleApprover = await FormRoleApproverModel.getFormRoleApproverById(parseInt(id));

      if (!formRoleApprover) {
        return res.status(404).json({
          success: false,
          message: 'FormRoleApprover not found',
          data: null,
          formRoleApproverId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'FormRoleApprover retrieved successfully',
        data: formRoleApprover,
        formRoleApproverId: id
      });
    } catch (err) {
      console.error('getFormRoleApproverById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleApproverId: null
      });
    }
  }

  static async updateFormRoleApprover(req, res) {
    try {
      const { id } = req.params;
      const { formRoleId, userId, activeYN, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormRoleApproverID is required',
          data: null,
          formRoleApproverId: null
        });
      }

      if (!formRoleId || !userId || activeYN === undefined || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'FormRoleID, UserID, ActiveYN, and CreatedByID are required',
          data: null,
          formRoleApproverId: id
        });
      }

      const result = await FormRoleApproverModel.updateFormRoleApprover(parseInt(id), {
        formRoleId,
        userId,
        activeYN,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        formRoleApproverId: id
      });
    } catch (err) {
      console.error('updateFormRoleApprover error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleApproverId: null
      });
    }
  }

  static async deleteFormRoleApprover(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormRoleApproverID is required',
          data: null,
          formRoleApproverId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          formRoleApproverId: id
        });
      }

      const result = await FormRoleApproverModel.deleteFormRoleApprover(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        formRoleApproverId: id
      });
    } catch (err) {
      console.error('deleteFormRoleApprover error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formRoleApproverId: null
      });
    }
  }
}

module.exports = FormRoleApproverController;
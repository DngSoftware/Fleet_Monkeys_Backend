const FormModel = require('../models/formModel');

class FormController {
  static async getAllForms(req, res) {
    try {
      const { pageNumber, pageSize } = req.query;

      const forms = await FormModel.getAllForms({
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize)
      });

      return res.status(200).json({
        success: true,
        message: 'Forms retrieved successfully',
        data: forms.data,
        totalRecords: forms.totalRecords
      });
    } catch (err) {
      console.error('getAllForms error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formId: null
      });
    }
  }

  static async createForm(req, res) {
    try {
      const { formName, createdById } = req.body;

      if (!formName || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'FormName and CreatedByID are required',
          data: null,
          formId: null
        });
      }

      const result = await FormModel.createForm({
        formName,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        formId: result.formId
      });
    } catch (err) {
      console.error('createForm error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formId: null
      });
    }
  }

  static async getFormById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormID is required',
          data: null,
          formId: null
        });
      }

      const form = await FormModel.getFormById(parseInt(id));

      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found',
          data: null,
          formId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Form retrieved successfully',
        data: form,
        formId: id
      });
    } catch (err) {
      console.error('getFormById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formId: null
      });
    }
  }

  static async updateForm(req, res) {
    try {
      const { id } = req.params;
      const { formName, isDeleted, createdById, deletedById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormID is required',
          data: null,
          formId: null
        });
      }

      if (!formName || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'FormName and CreatedByID are required',
          data: null,
          formId: id
        });
      }

      if (isDeleted && !deletedById) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required when IsDeleted is true',
          data: null,
          formId: id
        });
      }

      const result = await FormModel.updateForm(parseInt(id), {
        formName,
        isDeleted,
        createdById,
        deletedById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        formId: id
      });
    } catch (err) {
      console.error('updateForm error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formId: null
      });
    }
  }

  static async deleteForm(req, res) {
    try {
      const { id } = req.params;
      const { deletedById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid FormID is required',
          data: null,
          formId: null
        });
      }

      if (!deletedById) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required',
          data: null,
          formId: id
        });
      }

      const result = await FormModel.deleteForm(parseInt(id), deletedById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        formId: id
      });
    } catch (err) {
      console.error('deleteForm error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        formId: null
      });
    }
  }
}

module.exports = FormController;
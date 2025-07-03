const UOMModel = require('../models/uomModel');

class UOMController {
  // Get all UOMs with pagination
  static async getAllUOMs(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

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

      const uoms = await UOMModel.getAllUOMs({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      return res.status(200).json({
        success: true,
        message: 'UOMs retrieved successfully',
        data: uoms.data || [],
        pagination: {
          totalRecords: uoms.totalRecords,
          currentPage: uoms.currentPage,
          pageSize: uoms.pageSize,
          totalPages: uoms.totalPages
        }
      });
    } catch (err) {
      console.error('getAllUOMs error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pagination: null
      });
    }
  }

  // Create a new UOM
  static async createUOM(req, res) {
    try {
      const { uom, createdById } = req.body;

      // Basic validation
      if (!uom || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'UOM and CreatedByID are required',
          data: null,
          uomId: null
        });
      }

      const result = await UOMModel.createUOM({
        uom,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        uomId: result.uomId
      });
    } catch (err) {
      console.error('createUOM error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        uomId: null
      });
    }
  }

  // Get a single UOM by ID
  static async getUOMById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid UOMID is required',
          data: null,
          uomId: null
        });
      }

      const uom = await UOMModel.getUOMById(parseInt(id));

      if (!uom) {
        return res.status(404).json({
          success: false,
          message: 'UOM not found',
          data: null,
          uomId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'UOM retrieved successfully',
        data: uom,
        uomId: id
      });
    } catch (err) {
      console.error('getUOMById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        uomId: null
      });
    }
  }

  // Update a UOM
  static async updateUOM(req, res) {
    try {
      const { id } = req.params;
      const { uom, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid UOMID is required',
          data: null,
          uomId: null
        });
      }

      if (!uom || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'UOM and CreatedByID are required',
          data: null,
          uomId: id
        });
      }

      const result = await UOMModel.updateUOM(parseInt(id), {
        uom,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        uomId: id
      });
    } catch (err) {
      console.error('updateUOM error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        uomId: null
      });
    }
  }

  // Delete a UOM
  static async deleteUOM(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid UOMID is required',
          data: null,
          uomId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          uomId: id
        });
      }

      const result = await UOMModel.deleteUOM(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        uomId: id
      });
    } catch (err) {
      console.error('deleteUOM error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        uomId: null
      });
    }
  }
}

module.exports = UOMController;
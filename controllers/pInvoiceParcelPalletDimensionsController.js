const PInvoiceParcelPalletDimensionsModel = require('../models/pInvoiceParcelPalletDimensionsModel');
const poolPromise = require('../config/db.config');

class PInvoiceParcelPalletDimensionsController {
  static async createPInvoiceParcelPalletDimensions(req, res) {
    try {
      console.log('Received POST request body:', JSON.stringify(req.body, null, 2));
      const dimensionData = {
        ActualLength: req.body.ActualLength ? parseFloat(req.body.ActualLength) : null,
        ActualHeight: req.body.ActualHeight ? parseFloat(req.body.ActualHeight) : null,
        ActualWidth: req.body.ActualWidth ? parseFloat(req.body.ActualWidth) : null,
        ActualVolume: req.body.ActualVolume ? parseFloat(req.body.ActualVolume) : null,
        ActualWeight: req.body.ActualWeight ? parseFloat(req.body.ActualWeight) : null,
        SupplierLength: req.body.SupplierLength ? parseFloat(req.body.SupplierLength) : null,
        SupplierHeight: req.body.SupplierHeight ? parseFloat(req.body.SupplierHeight) : null,
        SupplierWidth: req.body.SupplierWidth ? parseFloat(req.body.SupplierWidth) : null,
        SupplierVolume: req.body.SupplierVolume ? parseFloat(req.body.SupplierVolume) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        SupplierWeight: req.body.SupplierWeight ? parseFloat(req.body.SupplierWeight) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };
      console.log('Parsed dimensionData:', JSON.stringify(dimensionData, null, 2));

      const result = await PInvoiceParcelPalletDimensionsModel.createPInvoiceParcelPalletDimensions(dimensionData);
      console.log('Model response:', JSON.stringify(result, null, 2));
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create PInvoiceParcelPalletDimensions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      });
    }
  }

  static async updatePInvoiceParcelPalletDimensions(req, res) {
    try {
      const parcelDimensionId = parseInt(req.params.id);
      if (isNaN(parcelDimensionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelDimensionID',
          data: null,
          parcelDimensionId: null,
          newParcelDimensionId: null,
        });
      }

      const dimensionData = {
        ParcelDimensionID: parcelDimensionId,
        ActualLength: req.body.ActualLength ? parseFloat(req.body.ActualLength) : null,
        ActualHeight: req.body.ActualHeight ? parseFloat(req.body.ActualHeight) : null,
        ActualWidth: req.body.ActualWidth ? parseFloat(req.body.ActualWidth) : null,
        ActualVolume: req.body.ActualVolume ? parseFloat(req.body.ActualVolume) : null,
        ActualWeight: req.body.ActualWeight ? parseFloat(req.body.ActualWeight) : null,
        SupplierLength: req.body.SupplierLength ? parseFloat(req.body.SupplierLength) : null,
        SupplierHeight: req.body.SupplierHeight ? parseFloat(req.body.SupplierHeight) : null,
        SupplierWidth: req.body.SupplierWidth ? parseFloat(req.body.SupplierWidth) : null,
        SupplierVolume: req.body.SupplierVolume ? parseFloat(req.body.SupplierVolume) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        SupplierWeight: req.body.SupplierWeight ? parseFloat(req.body.SupplierWeight) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await PInvoiceParcelPalletDimensionsModel.updatePInvoiceParcelPalletDimensions(dimensionData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update PInvoiceParcelPalletDimensions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      });
    }
  }

  static async deletePInvoiceParcelPalletDimensions(req, res) {
    try {
      const parcelDimensionId = parseInt(req.params.id);
      if (isNaN(parcelDimensionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelDimensionID',
          data: null,
          parcelDimensionId: null,
          newParcelDimensionId: null,
        });
      }

      const dimensionData = {
        ParcelDimensionID: parcelDimensionId,
        DeletedByID: parseInt(req.body.DeletedByID) || req.user.personId,
      };

      const result = await PInvoiceParcelPalletDimensionsModel.deletePInvoiceParcelPalletDimensions(dimensionData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete PInvoiceParcelPalletDimensions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      });
    }
  }

  static async getPInvoiceParcelPalletDimensions(req, res) {
    try {
      const parcelDimensionId = parseInt(req.params.id);
      if (isNaN(parcelDimensionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelDimensionID',
          data: null,
          parcelDimensionId: null,
          newParcelDimensionId: null,
        });
      }

      const dimensionData = {
        ParcelDimensionID: parcelDimensionId,
      };

      const result = await PInvoiceParcelPalletDimensionsModel.getPInvoiceParcelPalletDimensions(dimensionData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get PInvoiceParcelPalletDimensions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      });
    }
  }

  static async getAllPInvoiceParcelPalletDimensions(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
      };

      if (paginationData.PageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          parcelDimensionId: null,
          newParcelDimensionId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          parcelDimensionId: null,
          newParcelDimensionId: null,
        });
      }

      const result = await PInvoiceParcelPalletDimensionsModel.getAllPInvoiceParcelPalletDimensions(paginationData);
      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        data: result.data,
        pagination: {
          pageNumber: paginationData.PageNumber,
          pageSize: paginationData.PageSize,
          totalRecords: result.totalRecords || 0,
          totalPages: Math.ceil(result.totalRecords / paginationData.PageSize),
        },
        parcelDimensionId: null,
        newParcelDimensionId: null,
      });
    } catch (error) {
      console.error('Get All PInvoiceParcelPalletDimensions error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      });
    }
  }
}

module.exports = PInvoiceParcelPalletDimensionsController;
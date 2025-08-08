const ShippingParcelModel = require('../models/ShippingParcelModel');

class ShippingParcelController {
  static async createShippingParcel(req, res) {
    try {
      const parcelData = {
        ParentParcelID: req.body.ParentParcelID ? parseInt(req.body.ParentParcelID) : null,
        PInvoiceID: req.body.PInvoiceID ? parseInt(req.body.PInvoiceID) : null,
        SalesQuotationID: req.body.SalesQuotationID ? parseInt(req.body.SalesQuotationID) : null,
        SupplierID: req.body.SupplierID ? parseInt(req.body.SupplierID) : null,
        ParcelString: req.body.ParcelString,
        ParcelNumber: req.body.ParcelNumber ? parseInt(req.body.ParcelNumber) : null,
        ParcelOutOf: req.body.ParcelOutOf ? parseInt(req.body.ParcelOutOf) : null,
        Type: req.body.Type ? parseInt(req.body.Type) : null,
        IsRepackagedYN: req.body.IsRepackagedYN != null ? Boolean(req.body.IsRepackagedYN) : null,
        ShippingAndHandellingRequirement: req.body.ShippingAndHandellingRequirement,
        Notes: req.body.Notes,
        LoadID: req.body.LoadID ? parseInt(req.body.LoadID) : null,
        LoadTrailerID: req.body.LoadTrailerID ? parseInt(req.body.LoadTrailerID) : null,
        LocalLoadID: req.body.LocalLoadID ? parseInt(req.body.LocalLoadID) : null,
        ParcelDimensionID: req.body.ParcelDimensionID ? parseInt(req.body.ParcelDimensionID) : null,
        QRCodeString: req.body.QRCodeString,
        Volume: req.body.Volume ? parseFloat(req.body.Volume) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        Weight: req.body.Weight ? parseFloat(req.body.Weight) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        ParcelReceivedBy: req.body.ParcelReceivedBy,
        ParcelDeliveredDatetime: req.body.ParcelDeliveredDatetime,
        Signature: req.body.Signature,
        ReceivedYN: req.body.ReceivedYN != null ? Boolean(req.body.ReceivedYN) : null,
        CollectionLoadID: req.body.CollectionLoadID ? parseInt(req.body.CollectionLoadID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
        ChangedBy: req.body.ChangedBy || req.user.username || 'NA',
        OpenDimensionForm: req.body.OpenDimensionForm != null ? Boolean(req.body.OpenDimensionForm) : false,
      };

      if (!parcelData.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          parcelId: null,
          newParcelId: null,
        });
      }

      const result = await ShippingParcelModel.createShippingParcel(parcelData);
      console.log('Create ShippingParcel result:', result);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create ShippingParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
      });
    }
  }

  static async updateShippingParcel(req, res) {
    try {
      const parcelId = parseInt(req.params.id);
      if (isNaN(parcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null,
          parcelId: null,
          newParcelId: null,
        });
      }

      const parcelData = {
        ParcelID: parcelId,
        ParentParcelID: req.body.ParentParcelID ? parseInt(req.body.ParentParcelID) : null,
        PInvoiceID: req.body.PInvoiceID ? parseInt(req.body.PInvoiceID) : null,
        SalesQuotationID: req.body.SalesQuotationID ? parseInt(req.body.SalesQuotationID) : null,
        SupplierID: req.body.SupplierID ? parseInt(req.body.SupplierID) : null,
        ParcelString: req.body.ParcelString,
        ParcelNumber: req.body.ParcelNumber ? parseInt(req.body.ParcelNumber) : null,
        ParcelOutOf: req.body.ParcelOutOf ? parseInt(req.body.ParcelOutOf) : null,
        Type: req.body.Type ? parseInt(req.body.Type) : null,
        IsRepackagedYN: req.body.IsRepackagedYN != null ? Boolean(req.body.IsRepackagedYN) : null,
        ShippingAndHandellingRequirement: req.body.ShippingAndHandellingRequirement,
        Notes: req.body.Notes,
        LoadID: req.body.LoadID ? parseInt(req.body.LoadID) : null,
        LoadTrailerID: req.body.LoadTrailerID ? parseInt(req.body.LoadTrailerID) : null,
        LocalLoadID: req.body.LocalLoadID ? parseInt(req.body.LocalLoadID) : null,
        ParcelDimensionID: req.body.ParcelDimensionID ? parseInt(req.body.ParcelDimensionID) : null,
        QRCodeString: req.body.QRCodeString,
        Volume: req.body.Volume ? parseFloat(req.body.Volume) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        Weight: req.body.Weight ? parseFloat(req.body.Weight) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        ParcelReceivedBy: req.body.ParcelReceivedBy,
        ParcelDeliveredDatetime: req.body.ParcelDeliveredDatetime,
        Signature: req.body.Signature,
        ReceivedYN: req.body.ReceivedYN != null ? Boolean(req.body.ReceivedYN) : null,
        CollectionLoadID: req.body.CollectionLoadID ? parseInt(req.body.CollectionLoadID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
        ChangedBy: req.body.ChangedBy || req.user.username || 'NA',
        OpenDimensionForm: req.body.OpenDimensionForm != null ? Boolean(req.body.OpenDimensionForm) : false,
      };

      if (!parcelData.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          parcelId: parcelId,
          newParcelId: null,
        });
      }

      const result = await ShippingParcelModel.updateShippingParcel(parcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update ShippingParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
      });
    }
  }

  static async deleteShippingParcel(req, res) {
    try {
      const parcelId = parseInt(req.params.id);
      if (isNaN(parcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null,
          parcelId: null,
          newParcelId: null,
        });
      }

      const parcelData = {
        ParcelID: parcelId,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
        ChangedBy: req.body.ChangedBy || req.user.username || 'NA',
      };

      if (!parcelData.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          parcelId: parcelId,
          newParcelId: null,
        });
      }

      const result = await ShippingParcelModel.deleteShippingParcel(parcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete ShippingParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
      });
    }
  }

  static async getShippingParcel(req, res) {
    try {
      const parcelId = parseInt(req.params.id);
      if (isNaN(parcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null,
          parcelId: null,
          newParcelId: null,
        });
      }

      const parcelData = {
        ParcelID: parcelId,
      };

      const result = await ShippingParcelModel.getShippingParcel(parcelData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get ShippingParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
      });
    }
  }

  static async getAllShippingParcels(req, res) {
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
          parcelId: null,
          newParcelId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          parcelId: null,
          newParcelId: null,
        });
      }

      const result = await ShippingParcelModel.getAllShippingParcels(paginationData);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        pagination: {
          pageNumber: paginationData.PageNumber,
          pageSize: paginationData.PageSize,
          totalRecords: result.totalRecords || 0,
          totalPages: Math.ceil(result.totalRecords / paginationData.PageSize),
        },
      });
    } catch (error) {
      console.error('Get All ShippingParcels error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
      });
    }
  }

  static async getShippingParcelsBySalesQuotation(req, res) {
    try {
      const salesQuotationId = parseInt(req.params.salesQuotationId);
      if (isNaN(salesQuotationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesQuotationID',
          data: null,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: null,
          pInvoiceId: null,
          salesRFQId: null,
        });
      }

      const paginationData = {
        SalesQuotationID: salesQuotationId,
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
      };

      if (paginationData.PageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: null,
          salesRFQId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: null,
          salesRFQId: null,
        });
      }

      const result = await ShippingParcelModel.getShippingParcelsBySalesQuotation(paginationData);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        pagination: {
          pageNumber: paginationData.PageNumber,
          pageSize: paginationData.PageSize,
          totalRecords: result.totalRecords || 0,
          totalPages: Math.ceil(result.totalRecords / paginationData.PageSize),
        },
      });
    } catch (error) {
      console.error('Get ShippingParcelsBySalesQuotation error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
        salesQuotationId: req.params.salesQuotationId,
        pInvoiceId: null,
        salesRFQId: null,
      });
    }
  }

  static async getShippingParcelsByPInvoice(req, res) {
    try {
      const pInvoiceId = parseInt(req.params.pInvoiceId);
      const salesQuotationId = parseInt(req.query.salesQuotationId);
      if (isNaN(pInvoiceId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PInvoiceID',
          data: null,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: null,
          salesRFQId: null,
        });
      }
      if (isNaN(salesQuotationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesQuotationID',
          data: null,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: null,
          pInvoiceId: pInvoiceId,
          salesRFQId: null,
        });
      }

      const paginationData = {
        PInvoiceID: pInvoiceId,
        SalesQuotationID: salesQuotationId,
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
      };

      if (paginationData.PageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: pInvoiceId,
          salesRFQId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: pInvoiceId,
          salesRFQId: null,
        });
      }

      const result = await ShippingParcelModel.getShippingParcelsByPInvoice(paginationData);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        pagination: {
          pageNumber: paginationData.PageNumber,
          pageSize: paginationData.PageSize,
          totalRecords: result.totalRecords || 0,
          totalPages: Math.ceil(result.totalRecords / paginationData.PageSize),
        },
      });
    } catch (error) {
      console.error('Get ShippingParcelsByPInvoice error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
        salesQuotationId: req.query.salesQuotationId,
        pInvoiceId: req.params.pInvoiceId,
        salesRFQId: null,
      });
    }
  }

  static async generateQRCode(req, res) {
    try {
      const parcelId = parseInt(req.params.id);
      if (isNaN(parcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null,
          parcelId: null,
          newParcelId: null,
        });
      }

      const parcelData = {
        ParcelID: parcelId,
      };

      const result = await ShippingParcelModel.getShippingParcel(parcelData);
      if (!result.success || !result.data) {
        return res.status(404).json({
          success: false,
          message: 'Shipping parcel not found',
          data: null,
          parcelId: parcelId,
          newParcelId: null,
        });
      }

      const qrCodeString = result.data.QRCodeString;
      if (!qrCodeString) {
        return res.status(400).json({
          success: false,
          message: 'QRCodeString is null or empty',
          data: null,
          parcelId: parcelId,
          newParcelId: null,
        });
      }

      const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeString)}`;
      return res.status(200).json({
        success: true,
        message: 'QR code URL generated successfully',
        data: { qrURL },
        parcelId: parcelId,
        newParcelId: null,
      });
    } catch (error) {
      console.error('Generate QR Code error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        parcelId: null,
        newParcelId: null,
      });
    }
  }
}

module.exports = ShippingParcelController;
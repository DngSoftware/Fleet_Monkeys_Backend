const ShippingParcelModel = require('../models/ShippingParcelModel');

class ShippingParcelController {
  static async createParcel(req, res) {
    try {
      const parcelData = {
        ParentParcelID: parseInt(req.body.ParentParcelID) || null,
        PInvoiceID: parseInt(req.body.PInvoiceID),
        SalesQuotationID: parseInt(req.body.SalesQuotationID),
        SupplierID: parseInt(req.body.SupplierID),
        ParcelString: req.body.ParcelString,
        ParcelNumber: parseInt(req.body.ParcelNumber),
        ParcelOutOf: parseInt(req.body.ParcelOutOf),
        Type: parseInt(req.body.Type),
        IsRepackagedYN: req.body.IsRepackagedYN ? 1 : 0,
        ShippingAndHandellingRequirement: req.body.ShippingAndHandellingRequirement,
        Notes: req.body.Notes,
        LoadID: parseInt(req.body.LoadID) || null,
        LoadTrailerID: parseInt(req.body.LoadTrailerID) || null,
        LocalLoadID: parseInt(req.body.LocalLoadID) || null,
        ParcelDimensionID: parseInt(req.body.ParcelDimensionID) || null,
        QRCodeString: req.body.QRCodeString,
        Volume: parseFloat(req.body.Volume) || null,
        VolumeUOMID: parseInt(req.body.VolumeUOMID) || null,
        Weight: parseFloat(req.body.Weight) || null,
        WeightUOMID: parseInt(req.body.WeightUOMID) || null,
        ParcelReceivedBy: req.body.ParcelReceivedBy,
        ParcelDeliveredDatetime: req.body.ParcelDeliveredDatetime || null
      };

      const result = await ShippingParcelModel.createParcel(parcelData, req.user.personId);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create parcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }

  static async updateParcel(req, res) {
    try {
      const parcelID = parseInt(req.params.parcelID);
      const parcelData = {
        ParentParcelID: parseInt(req.body.ParentParcelID) || null,
        PInvoiceID: parseInt(req.body.PInvoiceID) || null,
        SalesQuotationID: parseInt(req.body.SalesQuotationID) || null,
        SupplierID: parseInt(req.body.SupplierID) || null,
        ParcelString: req.body.ParcelString,
        ParcelNumber: parseInt(req.body.ParcelNumber) || null,
        ParcelOutOf: parseInt(req.body.ParcelOutOf) || null,
        Type: parseInt(req.body.Type) || null,
        IsRepackagedYN: req.body.IsRepackagedYN ? 1 : 0,
        ShippingAndHandellingRequirement: req.body.ShippingAndHandellingRequirement,
        Notes: req.body.Notes,
        LoadID: parseInt(req.body.LoadID) || null,
        LoadTrailerID: parseInt(req.body.LoadTrailerID) || null,
        LocalLoadID: parseInt(req.body.LocalLoadID) || null,
        ParcelDimensionID: parseInt(req.body.ParcelDimensionID) || null,
        QRCodeString: req.body.QRCodeString,
        Volume: parseFloat(req.body.Volume) || null,
        VolumeUOMID: parseInt(req.body.VolumeUOMID) || null,
        Weight: parseFloat(req.body.Weight) || null,
        WeightUOMID: parseInt(req.body.WeightUOMID) || null,
        ParcelReceivedBy: req.body.ParcelReceivedBy,
        ParcelDeliveredDatetime: req.body.ParcelDeliveredDatetime || null
      };

      if (isNaN(parcelID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null
        });
      }

      const result = await ShippingParcelModel.updateParcel(parcelID, parcelData, req.user.personId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update parcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }

  static async getParcel(req, res) {
    try {
      const parcelID = parseInt(req.params.parcelID) || null;
      const result = await ShippingParcelModel.getParcel(parcelID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get parcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }

  static async deleteParcel(req, res) {
    try {
      const parcelID = parseInt(req.params.parcelID);
      if (isNaN(parcelID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null
        });
      }

      const result = await ShippingParcelModel.deleteParcel(parcelID, req.user.personId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete parcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null
      });
    }
  }
}

module.exports = ShippingParcelController;
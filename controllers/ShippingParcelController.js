const ShippingParcelModel = require('../models/ShippingParcelModel');

class ShippingParcelController {
  // Get Shipping Parcels (all or by ParcelID)
  static async getShippingParcels(req, res) {
    try {
      const { parcelID } = req.query;

      if (parcelID && isNaN(parseInt(parcelID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null,
          parcelId: null,
        });
      }

      const result = await ShippingParcelModel.getShippingParcels({
        parcelID: parcelID ? parseInt(parcelID) : null,
      });

      return res.status(result.success ? (result.data.length ? 200 : 404) : 400).json(result);
    } catch (err) {
      console.error('Error in getShippingParcels:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        parcelId: null,
      });
    }
  }

  // Get a specific Shipping Parcel by ParcelID
  static async getShippingParcelById(req, res) {
    try {
      const { parcelID } = req.params;

      if (isNaN(parseInt(parcelID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing ParcelID',
          data: null,
          parcelId: null,
        });
      }

      const result = await ShippingParcelModel.getShippingParcels({
        parcelID: parseInt(parcelID),
      });

      return res.status(result.success ? (result.data.length ? 200 : 404) : 400).json(result);
    } catch (err) {
      console.error('Error in getShippingParcelById:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        parcelId: null,
      });
    }
  }

  // Create a Shipping Parcel
  static async createShippingParcel(req, res) {
    try {
      const {
        ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber,
        ParcelOutOf, Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID,
        LoadTrailerID, LocalLoadID, ParcelDimensionID, QRCodeString, Volume, VolumeUOMID,
        Weight, WeightUOMID, ParcelReceivedBy, ParcelDeliveredDatetime, Signature
      } = req.body;
      const CreatedByID = req.user?.personId;
      const ChangedBy = req.user?.personId.toString();

      if (!req.user || !CreatedByID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          parcelId: null,
        });
      }

      const parcelData = {
        ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber,
        ParcelOutOf, Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID,
        LoadTrailerID, LocalLoadID, ParcelDimensionID, QRCodeString, Volume, VolumeUOMID,
        Weight, WeightUOMID, ParcelReceivedBy, ParcelDeliveredDatetime, Signature,
        CreatedByID, ChangedBy
      };

      const result = await ShippingParcelModel.createShippingParcel(parcelData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createShippingParcel:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        parcelId: null,
      });
    }
  }

  // Update a Shipping Parcel
  static async updateShippingParcel(req, res) {
    try {
      const {
        ParcelID, ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber,
        ParcelOutOf, Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID,
        LoadTrailerID, LocalLoadID, ParcelDimensionID, QRCodeString, Volume, VolumeUOMID,
        Weight, WeightUOMID, ParcelReceivedBy, ParcelDeliveredDatetime, Signature
      } = req.body;
      const ChangedBy = req.user?.personId.toString();

      if (!ParcelID) {
        return res.status(400).json({
          success: false,
          message: 'ParcelID is required',
          data: null,
          parcelId: null,
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          parcelId: null,
        });
      }

      const parcelData = {
        ParcelID, ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber,
        ParcelOutOf, Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID,
        LoadTrailerID, LocalLoadID, ParcelDimensionID, QRCodeString, Volume, VolumeUOMID,
        Weight, WeightUOMID, ParcelReceivedBy, ParcelDeliveredDatetime, Signature,
        ChangedBy
      };

      const result = await ShippingParcelModel.updateShippingParcel(parcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updateShippingParcel:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        parcelId: parcelData.ParcelID,
      });
    }
  }

  // Delete a Shipping Parcel
  static async deleteShippingParcel(req, res) {
    try {
      const { ParcelID } = req.body;
      const ChangedBy = req.user?.personId.toString();

      if (!ParcelID) {
        return res.status(400).json({
          success: false,
          message: 'ParcelID is required',
          data: null,
          parcelId: null,
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          parcelId: null,
        });
      }

      const parcelData = {
        ParcelID: parseInt(ParcelID),
        ChangedBy
      };

      const result = await ShippingParcelModel.deleteShippingParcel(parcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deleteShippingParcel:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        parcelId: parcelData.ParcelID,
      });
    }
  }
}

module.exports = ShippingParcelController;
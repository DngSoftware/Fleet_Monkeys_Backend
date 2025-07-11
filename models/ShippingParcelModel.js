const poolPromise = require('../config/db.config');

class ShippingParcelModel {
  // Get Shipping Parcels (all or by ParcelID)
  static async getShippingParcels({ parcelID = null }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        parcelID ? parseInt(parcelID) : null,
        null, // ParentParcelID
        null, // PInvoiceID
        null, // SalesQuotationID
        null, // SupplierID
        null, // ParcelString
        null, // ParcelNumber
        null, // ParcelOutOf
        null, // Type
        null, // IsRepackagedYN
        null, // ShippingAndHandellingRequirement
        null, // Notes
        null, // LoadID
        null, // LoadTrailerID
        null, // LocalLoadID
        null, // ParcelDimensionID
        null, // QRCodeString
        null, // Volume
        null, // VolumeUOMID
        null, // Weight
        null, // WeightUOMID
        null, // ParcelReceivedBy
        null, // ParcelDeliveredDatetime
        null, // Signature
        null, // CreatedByID
        null  // ChangedBy
      ];

      const [results] = await pool.query(
        `CALL SP_ManageShippingParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
         SELECT @p_Result AS result, @p_Message AS message;`,
        queryParams
      );

      const outParams = results[1][0]; // Second result set contains OUT parameters

      if (outParams.result !== 'SUCCESS') {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve Shipping Parcels',
          data: null,
          parcelId: parcelID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'Shipping Parcel records retrieved successfully.',
        data: results[0] || [],
        parcelId: parcelID,
      };
    } catch (err) {
      console.error('Database error in getShippingParcels:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        parcelId: parcelID,
      };
    }
  }

  // Create a Shipping Parcel
  static async createShippingParcel(parcelData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['CreatedByID'];
      const missingFields = requiredFields.filter(field => !parcelData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          parcelId: null,
        };
      }

      const queryParams = [
        'INSERT',
        null, // ParcelID
        parcelData.ParentParcelID ? parseInt(parcelData.ParentParcelID) : null,
        parcelData.PInvoiceID ? parseInt(parcelData.PInvoiceID) : null,
        parcelData.SalesQuotationID ? parseInt(parcelData.SalesQuotationID) : null,
        parcelData.SupplierID ? parseInt(parcelData.SupplierID) : null,
        parcelData.ParcelString || null,
        parcelData.ParcelNumber ? parseInt(parcelData.ParcelNumber) : null,
        parcelData.ParcelOutOf ? parseInt(parcelData.ParcelOutOf) : null,
        parcelData.Type ? parseInt(parcelData.Type) : null,
        parcelData.IsRepackagedYN != null ? Boolean(parcelData.IsRepackagedYN) : null,
        parcelData.ShippingAndHandellingRequirement || null,
        parcelData.Notes || null,
        parcelData.LoadID ? parseInt(parcelData.LoadID) : null,
        parcelData.LoadTrailerID ? parseInt(parcelData.LoadTrailerID) : null,
        parcelData.LocalLoadID ? parseInt(parcelData.LocalLoadID) : null,
        parcelData.ParcelDimensionID ? parseInt(parcelData.ParcelDimensionID) : null,
        parcelData.QRCodeString || null,
        parcelData.Volume ? parseFloat(parcelData.Volume) : null,
        parcelData.VolumeUOMID ? parseInt(parcelData.VolumeUOMID) : null,
        parcelData.Weight ? parseFloat(parcelData.Weight) : null,
        parcelData.WeightUOMID ? parseInt(parcelData.WeightUOMID) : null,
        parcelData.ParcelReceivedBy || null,
        parcelData.ParcelDeliveredDatetime || null,
        parcelData.Signature || null,
        parseInt(parcelData.CreatedByID),
        parcelData.ChangedBy || null
      ];

      const [results] = await pool.query(
        `CALL SP_ManageShippingParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
         SELECT @p_Result AS result, @p_Message AS message;`,
        queryParams
      );

      const outParams = results[1][0]; // Second result set contains OUT parameters

      if (outParams.result !== 'SUCCESS') {
        return {
          success: false,
          message: outParams.message || 'Failed to create Shipping Parcel',
          data: null,
          parcelId: null,
        };
      }

      return {
        success: true,
        message: outParams.message || 'Shipping Parcel created successfully.',
        data: null,
        parcelId: outParams.message.match(/ParcelID: (\d+)/)?.[1] || null,
      };
    } catch (err) {
      console.error('Database error in createShippingParcel:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        parcelId: null,
      };
    }
  }

  // Update a Shipping Parcel
  static async updateShippingParcel(parcelData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['ParcelID'];
      const missingFields = requiredFields.filter(field => !parcelData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          parcelId: parcelData.ParcelID,
        };
      }

      const queryParams = [
        'UPDATE',
        parseInt(parcelData.ParcelID),
        parcelData.ParentParcelID ? parseInt(parcelData.ParentParcelID) : null,
        parcelData.PInvoiceID ? parseInt(parcelData.PInvoiceID) : null,
        parcelData.SalesQuotationID ? parseInt(parcelData.SalesQuotationID) : null,
        parcelData.SupplierID ? parseInt(parcelData.SupplierID) : null,
        parcelData.ParcelString || null,
        parcelData.ParcelNumber ? parseInt(parcelData.ParcelNumber) : null,
        parcelData.ParcelOutOf ? parseInt(parcelData.ParcelOutOf) : null,
        parcelData.Type ? parseInt(parcelData.Type) : null,
        parcelData.IsRepackagedYN != null ? Boolean(parcelData.IsRepackagedYN) : null,
        parcelData.ShippingAndHandellingRequirement || null,
        parcelData.Notes || null,
        parcelData.LoadID ? parseInt(parcelData.LoadID) : null,
        parcelData.LoadTrailerID ? parseInt(parcelData.LoadTrailerID) : null,
        parcelData.LocalLoadID ? parseInt(parcelData.LocalLoadID) : null,
        parcelData.ParcelDimensionID ? parseInt(parcelData.ParcelDimensionID) : null,
        parcelData.QRCodeString || null,
        parcelData.Volume ? parseFloat(parcelData.Volume) : null,
        parcelData.VolumeUOMID ? parseInt(parcelData.VolumeUOMID) : null,
        parcelData.Weight ? parseFloat(parcelData.Weight) : null,
        parcelData.WeightUOMID ? parseInt(parcelData.WeightUOMID) : null,
        parcelData.ParcelReceivedBy || null,
        parcelData.ParcelDeliveredDatetime || null,
        parcelData.Signature || null,
        null, // CreatedByID
        parcelData.ChangedBy || null
      ];

      const [results] = await pool.query(
        `CALL SP_ManageShippingParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
         SELECT @p_Result AS result, @p_Message AS message;`,
        queryParams
      );

      const outParams = results[1][0]; // Second result set contains OUT parameters

      if (outParams.result !== 'SUCCESS') {
        return {
          success: false,
          message: outParams.message || 'Failed to update Shipping Parcel',
          data: null,
          parcelId: parcelData.ParcelID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'Shipping Parcel updated successfully.',
        data: null,
        parcelId: parcelData.ParcelID,
      };
    } catch (err) {
      console.error('Database error in updateShippingParcel:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        parcelId: parcelData.ParcelID,
      };
    }
  }

  // Delete a Shipping Parcel
  static async deleteShippingParcel(parcelData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['ParcelID', 'ChangedBy'];
      const missingFields = requiredFields.filter(field => !parcelData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          parcelId: parcelData.ParcelID,
        };
      }

      const queryParams = [
        'DELETE',
        parseInt(parcelData.ParcelID),
        null, // ParentParcelID
        null, // PInvoiceID
        null, // SalesQuotationID
        null, // SupplierID
        null, // ParcelString
        null, // ParcelNumber
        null, // ParcelOutOf
        null, // Type
        null, // IsRepackagedYN
        null, // ShippingAndHandellingRequirement
        null, // Notes
        null, // LoadID
        null, // LoadTrailerID
        null, // LocalLoadID
        null, // ParcelDimensionID
        null, // QRCodeString
        null, // Volume
        null, // VolumeUOMID
        null, // Weight
        null, // WeightUOMID
        null, // ParcelReceivedBy
        null, // ParcelDeliveredDatetime
        null, // Signature
        null, // CreatedByID
        parcelData.ChangedBy || null
      ];

      const [results] = await pool.query(
        `CALL SP_ManageShippingParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
         SELECT @p_Result AS result, @p_Message AS message;`,
        queryParams
      );

      const outParams = results[1][0]; // Second result set contains OUT parameters

      if (outParams.result !== 'SUCCESS') {
        return {
          success: false,
          message: outParams.message || 'Failed to delete Shipping Parcel',
          data: null,
          parcelId: parcelData.ParcelID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'Shipping Parcel deleted successfully.',
        data: null,
        parcelId: parcelData.ParcelID,
      };
    } catch (err) {
      console.error('Database error in deleteShippingParcel:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        parcelId: parcelData.ParcelID,
      };
    }
  }
}

module.exports = ShippingParcelModel;
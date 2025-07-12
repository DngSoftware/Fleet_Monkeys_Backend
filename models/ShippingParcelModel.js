const poolPromise = require('../config/db.config');

class ShippingParcelModel {
  static async createParcel(parcelData, userId) {
    try {
      const {
        ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber, ParcelOutOf,
        Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID, LoadTrailerID, LocalLoadID,
        ParcelDimensionID, QRCodeString, Volume, VolumeUOMID, Weight, WeightUOMID, ParcelReceivedBy,
        ParcelDeliveredDatetime
      } = parcelData;

      // Validate required fields
      const requiredFields = ['PInvoiceID', 'SalesQuotationID', 'SupplierID', 'ParcelNumber', 'ParcelOutOf', 'Type'];
      const missingFields = requiredFields.filter(field => parcelData[field] === undefined || parcelData[field] === null);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null
        };
      }

      // Validate string lengths and numeric values
      if (ParcelString && ParcelString.trim() === '') {
        return { success: false, message: 'ParcelString cannot be empty if provided', data: null };
      }
      if (QRCodeString && QRCodeString.trim() === '') {
        return { success: false, message: 'QRCodeString cannot be empty if provided', data: null };
      }
      if (ShippingAndHandellingRequirement && ShippingAndHandellingRequirement.trim() === '') {
        return { success: false, message: 'ShippingAndHandellingRequirement cannot be empty if provided', data: null };
      }
      if (Notes && Notes.trim() === '') {
        return { success: false, message: 'Notes cannot be empty if provided', data: null };
      }
      if (ParcelReceivedBy && ParcelReceivedBy.trim() === '') {
        return { success: false, message: 'ParcelReceivedBy cannot be empty if provided', data: null };
      }
      if (Volume !== undefined && Volume < 0) {
        return { success: false, message: 'Volume cannot be negative', data: null };
      }
      if (Weight !== undefined && Weight < 0) {
        return { success: false, message: 'Weight cannot be negative', data: null };
      }

      const pool = await poolPromise;
      const [result] = await pool.query(
        `CALL SP_ManageShippingParcel(
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message
        )`,
        [
          'INSERT', // p_Action
          null, // p_ParcelID
          ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber, ParcelOutOf,
          Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID, LoadTrailerID, LocalLoadID,
          ParcelDimensionID, QRCodeString, Volume, VolumeUOMID, Weight, WeightUOMID, ParcelReceivedBy,
          ParcelDeliveredDatetime, null, userId, 'API'
        ]
      );

      const [output] = await pool.query('SELECT @p_Result AS Result, @p_Message AS Message');
      const { Result, Message } = output[0];

      if (Result === 'SUCCESS') {
        const [newParcel] = await pool.query(
          `SELECT * FROM dbo_tblshippingparcel WHERE ParcelID = ?`,
          [parseInt(Message.split(': ')[1])]
        );
        return { success: true, message: Message, data: newParcel[0] };
      } else {
        return { success: false, message: Message, data: null };
      }
    } catch (error) {
      console.error('Create parcel error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null
      };
    }
  }

  static async updateParcel(parcelID, parcelData, userId) {
    try {
      const {
        ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber, ParcelOutOf,
        Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID, LoadTrailerID, LocalLoadID,
        ParcelDimensionID, QRCodeString, Volume, VolumeUOMID, Weight, WeightUOMID, ParcelReceivedBy,
        ParcelDeliveredDatetime
      } = parcelData;

      // Validate parcel exists and ownership
      const pool = await poolPromise;
      const [parcelCheck] = await pool.query(
        'SELECT CreatedByID FROM dbo_tblshippingparcel WHERE ParcelID = ?',
        [parseInt(parcelID)]
      );
      if (parcelCheck.length === 0) {
        return { success: false, message: `Parcel with ParcelID ${parcelID} does not exist`, data: null };
      }
      if (parcelCheck[0].CreatedByID !== parseInt(userId)) {
        return { success: false, message: 'You are not authorized to update this parcel', data: null };
      }

      // Validate inputs
      if (ParcelString && ParcelString.trim() === '') {
        return { success: false, message: 'ParcelString cannot be empty if provided', data: null };
      }
      if (QRCodeString && QRCodeString.trim() === '') {
        return { success: false, message: 'QRCodeString cannot be empty if provided', data: null };
      }
      if (ShippingAndHandellingRequirement && ShippingAndHandellingRequirement.trim() === '') {
        return { success: false, message: 'ShippingAndHandellingRequirement cannot be empty if provided', data: null };
      }
      if (Notes && Notes.trim() === '') {
        return { success: false, message: 'Notes cannot be empty if provided', data: null };
      }
      if (ParcelReceivedBy && ParcelReceivedBy.trim() === '') {
        return { success: false, message: 'ParcelReceivedBy cannot be empty if provided', data: null };
      }
      if (Volume !== undefined && Volume < 0) {
        return { success: false, message: 'Volume cannot be negative', data: null };
      }
      if (Weight !== undefined && Weight < 0) {
        return { success: false, message: 'Weight cannot be negative', data: null };
      }

      const [result] = await pool.query(
        `CALL SP_ManageShippingParcel(
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message
        )`,
        [
          'UPDATE', // p_Action
          parcelID, // p_ParcelID
          ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID, ParcelString, ParcelNumber, ParcelOutOf,
          Type, IsRepackagedYN, ShippingAndHandellingRequirement, Notes, LoadID, LoadTrailerID, LocalLoadID,
          ParcelDimensionID, QRCodeString, Volume, VolumeUOMID, Weight, WeightUOMID, ParcelReceivedBy,
          ParcelDeliveredDatetime, null, userId, 'API'
        ]
      );

      const [output] = await pool.query('SELECT @p_Result AS Result, @p_Message AS Message');
      const { Result, Message } = output[0];

      if (Result === 'SUCCESS') {
        const [updatedParcel] = await pool.query(
          `SELECT * FROM dbo_tblshippingparcel WHERE ParcelID = ?`,
          [parseInt(parcelID)]
        );
        return { success: true, message: Message, data: updatedParcel[0] };
      } else {
        return { success: false, message: Message, data: null };
      }
    } catch (error) {
      console.error('Update parcel error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null
      };
    }
  }

  static async getParcel(parcelID) {
    try {
      const pool = await poolPromise;
      const [result] = await pool.query(
        `CALL SP_ManageShippingParcel(
          ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, @p_Result, @p_Message
        )`,
        ['SELECT', parcelID]
      );

      const [output] = await pool.query('SELECT @p_Result AS Result, @p_Message AS Message');
      const { Result, Message } = output[0];

      return {
        success: Result === 'SUCCESS',
        message: Message,
        data: result[0]
      };
    } catch (error) {
      console.error('Get parcel error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null
      };
    }
  }

  static async deleteParcel(parcelID, userId) {
    try {
      // Validate parcel exists and ownership
      const pool = await poolPromise;
      const [parcelCheck] = await pool.query(
        'SELECT CreatedByID FROM dbo_tblshippingparcel WHERE ParcelID = ?',
        [parseInt(parcelID)]
      );
      if (parcelCheck.length === 0) {
        return { success: false, message: `Parcel with ParcelID ${parcelID} does not exist`, data: null };
      }
      if (parcelCheck[0].CreatedByID !== parseInt(userId)) {
        return { success: false, message: 'You are not authorized to delete this parcel', data: null };
      }

      const [result] = await pool.query(
        `CALL SP_ManageShippingParcel(
          ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, @p_Result, @p_Message
        )`,
        ['DELETE', parcelID]
      );

      const [output] = await pool.query('SELECT @p_Result AS Result, @p_Message AS Message');
      const { Result, Message } = output[0];

      return {
        success: Result === 'SUCCESS',
        message: Message,
        data: null
      };
    } catch (error) {
      console.error('Delete parcel error:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null
      };
    }
  }
}

module.exports = ShippingParcelModel;
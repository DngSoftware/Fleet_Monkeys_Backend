const poolPromise = require('../config/db.config');

class SalesRFQParcelModel {
  // Get Sales RFQ Parcels by SalesRFQID or SalesRFQParcelID
  static async getSalesRFQParcels({ salesRFQParcelId = null, salesRFQId = null }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        salesRFQParcelId || null,
        salesRFQId || null,
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CreatedByID
        null, // p_IsDeleted
        null, // p_DeletedDateTime
        null  // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesRFQParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_NewSalesRFQParcelID, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_NewSalesRFQParcelID AS newSalesRFQParcelId, @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        throw new Error(outParams.message || 'Failed to retrieve Sales RFQ Parcels');
      }

      return {
        data: result[0],
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Sales RFQ Parcel by ID
  static async getSalesRFQParcelById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_SalesRFQID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CreatedByID
        null, // p_IsDeleted
        null, // p_DeletedDateTime
        null  // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesRFQParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_NewSalesRFQParcelID, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_NewSalesRFQParcelID AS newSalesRFQParcelId, @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        throw new Error(outParams.message || 'Sales RFQ Parcel not found or deleted');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Sales RFQ Parcel
  static async createSalesRFQParcel(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_SalesRFQParcelID
        data.SalesRFQID,
        data.ItemID,
        data.CertificationID || null,
        data.lineItemNumber || null,
        data.ItemQuantity || null,
        data.UOMID || null,
        data.CreatedByID,
        null, // p_IsDeleted
        null, // p_DeletedDateTime
        null  // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesRFQParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_NewSalesRFQParcelID, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_NewSalesRFQParcelID AS newSalesRFQParcelId, @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        throw new Error(outParams.message || 'Failed to create Sales RFQ Parcel');
      }

      return {
        newSalesRFQParcelId: outParams.newSalesRFQParcelId,
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Sales RFQ Parcel
  static async updateSalesRFQParcel(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.SalesRFQID || null,
        data.ItemID || null,
        data.CertificationID || null,
        data.lineItemNumber || null,
        data.ItemQuantity || null,
        data.UOMID || null,
        data.CreatedByID,
        null, // p_IsDeleted
        null, // p_DeletedDateTime
        null  // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesRFQParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_NewSalesRFQParcelID, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        throw new Error(outParams.message || 'Failed to update Sales RFQ Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Sales RFQ Parcel
  static async deleteSalesRFQParcel(id, DeletedByID) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_SalesRFQID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CreatedByID
        1,    // p_IsDeleted
        new Date(), // p_DeletedDateTime
        DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesRFQParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_NewSalesRFQParcelID, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        throw new Error(outParams.message || 'Failed to delete Sales RFQ Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SalesRFQParcelModel;
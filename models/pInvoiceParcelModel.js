const poolPromise = require('../config/db.config');
const path = require('path');
const fs = require('fs');

class PInvoiceParcelModel {
  // Get Purchase Invoice Parcels by PInvoiceParcelID or PInvoiceID
  static async getPInvoiceParcels({
    pInvoiceParcelId = null,
    pInvoiceId = null
  }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (pInvoiceParcelId && !Number.isInteger(pInvoiceParcelId)) {
        throw new Error('Invalid pInvoiceParcelId: must be an integer');
      }
      if (pInvoiceId && !Number.isInteger(pInvoiceId)) {
        throw new Error('Invalid pInvoiceId: must be an integer');
      }

      const queryParams = [
        'SELECT',
        pInvoiceParcelId || null,
        pInvoiceId || null,
        null, // p_ItemID
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_Rate
        null, // p_Amount
        null, // p_CertificationID
        null, // p_CountryOfOriginID
        null, // p_LineItemNumber
        null, // p_FileName
        null, // p_FileContent
        null // p_UserID
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePInvoiceParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      return {
        data: result[0],
        totalRecords: result[0].length
      };
    } catch (err) {
      const errorMessage = err.sqlState ? 
        `Database error: ${err.message} (SQLSTATE: ${err.sqlState})` : 
        `Database error: ${err.message}`;
      throw new Error(errorMessage);
    }
  }

  // Update a Purchase Invoice Parcel
  static async updatePInvoiceParcel(id, data, userId) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(id)) {
        throw new Error('Invalid pInvoiceParcelId: must be an integer');
      }
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Invalid userId: must be an integer');
      }

      // If fileContent is a path, ensure it exists
      if (data.fileContent) {
        const filePath = path.join(__dirname, '../', data.fileContent);
        if (!fs.existsSync(filePath)) {
          throw new Error('File not found at specified path');
        }
      }

      const queryParams = [
        'UPDATE',
        id,
        data.pInvoiceId || null,
        data.itemId || null,
        data.itemQuantity || null,
        data.uomId || null,
        data.rate || null,
        data.amount || null,
        data.certificationId || null,
        data.countryOfOriginId || null,
        data.lineItemNumber || null,
        data.fileName || null,
        data.fileContent || null,
        userId
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePInvoiceParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      if (result[0][0]?.Status !== 'SUCCESS') {
        throw new Error(result[0][0]?.Message || 'Failed to update Purchase Invoice Parcel');
      }

      return {
        message: result[0][0]?.Message || 'Purchase Invoice Parcel updated successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Purchase Invoice Parcel
  static async deletePInvoiceParcel(id, userId) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(id)) {
        throw new Error('Invalid pInvoiceParcelId: must be an integer');
      }
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Invalid userId: must be an integer');
      }

      // Check for existing file and delete it
      const [existing] = await pool.query(
        'SELECT FileContent FROM PInvoiceParcel WHERE PInvoiceParcelID = ?',
        [id]
      );
      if (existing[0]?.FileContent) {
        const filePath = path.join(__dirname, '../', existing[0].FileContent);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      }

      const queryParams = [
        'DELETE',
        id,
        null, // p_PInvoiceID
        null, // p_ItemID
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_Rate
        null, // p_Amount
        null, // p_CertificationID
        null, // p_CountryOfOriginID
        null, // p_LineItemNumber
        null, // p_FileName
        null, // p_FileContent
        userId
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePInvoiceParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      if (result[0][0]?.Status !== 'SUCCESS') {
        throw new Error(result[0][0]?.Message || 'Failed to delete Purchase Invoice Parcel');
      }

      return {
        message: result[0][0]?.Message || 'Purchase Invoice Parcel deleted successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = PInvoiceParcelModel;
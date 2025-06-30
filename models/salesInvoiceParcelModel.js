const poolPromise = require('../config/db.config');

class SalesInvoiceParcelModel {
  // Get Sales Invoice Parcels by SalesInvoiceParcelID or SalesInvoiceID
  static async getSalesInvoiceParcels({
    salesInvoiceParcelId = null,
    salesInvoiceId = null
  }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (salesInvoiceParcelId && !Number.isInteger(salesInvoiceParcelId)) {
        throw new Error('Invalid salesInvoiceParcelId: must be an integer');
      }
      if (salesInvoiceId && !Number.isInteger(salesInvoiceId)) {
        throw new Error('Invalid salesInvoiceId: must be an integer');
      }

      const queryParams = [
        'SELECT',
        salesInvoiceParcelId || null,
        salesInvoiceId || null,
        null, // p_ItemID
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_Rate
        null, // p_Amount
        null, // p_CertificationID
        null, // p_CountryOfOriginID
        null, // p_FileName
        null, // p_FileContent
        null // p_UserID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesInvoiceParcelDEV(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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

  // Insert a Sales Invoice Parcel
  static async insertSalesInvoiceParcel(data, userId) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Invalid userId: must be an integer');
      }

      const queryParams = [
        'INSERT',
        null, // p_SalesInvoiceParcelID
        data.salesInvoiceId || null,
        data.itemId || null,
        data.itemQuantity || null,
        data.uomId || null,
        data.rate || null,
        data.amount || null,
        data.certificationId || null,
        data.countryOfOriginId || null,
        data.fileName || null,
        data.fileContent || null,
        userId
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesInvoiceParcelDEV(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      if (result[0][0]?.Status !== 'SUCCESS') {
        throw new Error(result[0][0]?.Message || 'Failed to insert Sales Invoice Parcel');
      }

      return {
        salesInvoiceParcelId: result[0][0]?.SalesInvoiceParcelID,
        message: result[0][0]?.Message || 'Sales Invoice Parcel inserted successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Sales Invoice Parcel
  static async updateSalesInvoiceParcel(id, data, userId) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(id)) {
        throw new Error('Invalid salesInvoiceParcelId: must be an integer');
      }
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Invalid userId: must be an integer');
      }

      const queryParams = [
        'UPDATE',
        id,
        data.salesInvoiceId || null,
        data.itemId || null,
        data.itemQuantity || null,
        data.uomId || null,
        data.rate || null,
        data.amount || null,
        data.certificationId || null,
        data.countryOfOriginId || null,
        data.fileName || null,
        data.fileContent || null,
        userId
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesInvoiceParcelDEV(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      if (result[0][0]?.Status !== 'SUCCESS') {
        throw new Error(result[0][0]?.Message || 'Failed to update Sales Invoice Parcel');
      }

      return {
        message: result[0][0]?.Message || 'Sales Invoice Parcel updated successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Sales Invoice Parcel
  static async deleteSalesInvoiceParcel(id, userId) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(id)) {
        throw new Error('Invalid salesInvoiceParcelId: must be an integer');
      }
      if (!userId || !Number.isInteger(userId)) {
        throw new Error('Invalid userId: must be an integer');
      }

      const queryParams = [
        'DELETE',
        id,
        null, // p_SalesInvoiceID
        null, // p_ItemID
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_Rate
        null, // p_Amount
        null, // p_CertificationID
        null, // p_CountryOfOriginID
        null, // p_FileName
        null, // p_FileContent
        userId
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesInvoiceParcelDEV(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      if (result[0][0]?.Status !== 'SUCCESS') {
        throw new Error(result[0][0]?.Message || 'Failed to delete Sales Invoice Parcel');
      }

      return {
        message: result[0][0]?.Message || 'Sales Invoice Parcel deleted successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SalesInvoiceParcelModel;
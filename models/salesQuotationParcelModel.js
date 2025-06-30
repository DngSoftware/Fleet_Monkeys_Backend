const poolPromise = require('../config/db.config');

class SalesQuotationParcelModel {
  // Get all Sales Quotation Parcels
 static async getAllSalesQuotationParcels({
    pageNumber = 1,
    pageSize = 10,
    salesQuotationId = null
  }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw new Error('Invalid pageNumber: must be a positive integer');
      }
      if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new Error('Invalid pageSize: must be a positive integer');
      }
      if (salesQuotationId && !Number.isInteger(salesQuotationId)) {
        throw new Error('Invalid salesQuotationId: must be an integer');
      }

      const queryParams = [
        'SELECT',
        null, // p_SalesQuotationParcelID
        salesQuotationId || null, // p_SalesQuotationID
        null, // p_SupplierQuotationParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CountryOfOriginID
        null, // p_SalesRate
        null, // p_CreatedByID
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        // Check error log for more details
        await new Promise(resolve => setTimeout(resolve, 100));
        const [[errorLog]] = await pool.query(
          'SELECT ErrorMessage, CreatedAt FROM dbo_tblerrorlog ORDER BY CreatedAt DESC LIMIT 1'
        );
        throw new Error(`Stored procedure error: ${errorLog?.ErrorMessage || outParams.message || 'Unknown error'}`);
      }

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


  // Get a single Sales Quotation Parcel by ID
  static async getSalesQuotationParcelById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_SalesQuotationID
        null, // p_SupplierQuotationParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CountryOfOriginID
        null, // p_SalesRate
        null, // p_CreatedByID
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Sales Quotation Parcel not found or deleted');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Sales Quotation Parcel
  static async updateSalesQuotationParcel(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.salesQuotationId || null,
        data.supplierQuotationParcelId || null,
        data.itemId || null,
        data.certificationId || null,
        data.lineItemNumber || null,
        data.itemQuantity || null,
        data.uomId || null,
        data.countryOfOriginId || null,
        data.salesRate || null,
        data.createdById || null,
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Sales Quotation Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Sales Quotation Parcel
  static async deleteSalesQuotationParcel(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_SalesQuotationID
        null, // p_SupplierQuotationParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CountryOfOriginID
        null, // p_SalesRate
        null, // p_CreatedByID
        deletedById // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Sales Quotation Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SalesQuotationParcelModel;
const poolPromise = require('../config/db.config');

class SalesOrderParcelModel {
  // Get all Sales Order Parcels
  static async getAllSalesOrderParcels({
    pageNumber = 1,
    pageSize = 10,
    salesOrderId = null
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
      if (salesOrderId && !Number.isInteger(salesOrderId)) {
        throw new Error('Invalid salesOrderId: must be an integer');
      }

      const queryParams = [
        'SELECT',
        null, // p_SalesOrderParcelID
        salesOrderId || null, // p_SalesOrderID
        null, // p_SalesQuotationParcelID
        null, // p_SupplierQuotationParcelID
        null, // p_ParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_RequiredByDate
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_SalesRate
        null, // p_SalesAmount
        null, // p_CountryOfOriginID
        null // p_ChangedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesOrderParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
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

      // Extract total count from the second result set
      const totalRecords = result[1]?.[0]?.TotalRecords || result[0].length;

      return {
        data: result[0],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      const errorMessage = err.sqlState ? 
        `Database error: ${err.message} (SQLSTATE: ${err.sqlState})` : 
        `Database error: ${err.message}`;
      throw new Error(errorMessage);
    }
  }

  // Get a single Sales Order Parcel by ID
  static async getSalesOrderParcelById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_SalesOrderID
        null, // p_SalesQuotationParcelID
        null, // p_SupplierQuotationParcelID
        null, // p_ParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_RequiredByDate
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_SalesRate
        null, // p_SalesAmount
        null, // p_CountryOfOriginID
        null // p_ChangedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesOrderParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Sales Order Parcel not found or deleted');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Sales Order Parcel
  static async updateSalesOrderParcel(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.salesOrderId || null,
        data.salesQuotationParcelId || null,
        data.supplierQuotationParcelId || null,
        data.parcelId || null,
        data.itemId || null,
        data.certificationId || null,
        data.lineItemNumber || null,
        data.requiredByDate || null,
        data.itemQuantity || null,
        data.uomId || null,
        data.salesRate || null,
        data.salesAmount || null,
        data.countryOfOriginId || null,
        data.changedById || null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesOrderParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Sales Order Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Sales Order Parcel
  static async deleteSalesOrderParcel(id, changedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_SalesOrderID
        null, // p_SalesQuotationParcelID
        null, // p_SupplierQuotationParcelID
        null, // p_ParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_RequiredByDate
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_SalesRate
        null, // p_SalesAmount
        null, // p_CountryOfOriginID
        changedById // p_ChangedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesOrderParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Sales Order Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SalesOrderParcelModel;
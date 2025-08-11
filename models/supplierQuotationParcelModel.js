const poolPromise = require('../config/db.config');

class SupplierQuotationParcelModel {
   // Get all Supplier Quotation Parcels by SupplierQuotationID
  static async getAllSupplierQuotationParcelsBySupplierQuotationId({
    supplierQuotationId,
    pageNumber = 1,
    pageSize = 10,
    fromDate = null,
    toDate = null
  }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(supplierQuotationId) || supplierQuotationId <= 0) {
        throw new Error('Invalid supplierQuotationId: must be a positive integer');
      }
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw new Error('Invalid pageNumber: must be a positive integer');
      }
      if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new Error('Invalid pageSize: must be a positive integer');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        fromDate || null,
        toDate || null
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllSupplierQuotationParcel(?, ?, ?, ?)',
        queryParams
      );

      // Check error log for details if no results
      if (!result[0].length) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const [[errorLog]] = await pool.query(
          'SELECT ErrorMessage, CreatedAt FROM dbo_tblerrorlog ORDER BY CreatedAt DESC LIMIT 1'
        );
        if (errorLog?.ErrorMessage) {
          throw new Error(`Stored procedure error: ${errorLog.ErrorMessage}`);
        }
      }

      // Filter results by SupplierQuotationID
      const filteredData = result[0].filter(parcel => parcel.SupplierQuotationID === supplierQuotationId);

      // Apply pagination to filtered results
      const startIndex = (pageNumber - 1) * pageSize;
      const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

      return {
        data: paginatedData,
        totalRecords: filteredData.length,
        message: 'Supplier Quotation Parcels retrieved successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

   // Get all Supplier Quotation Parcels
  static async getAllSupplierQuotationParcels({
    pageNumber = 1,
    pageSize = 10,
    fromDate = null,
    toDate = null
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

      const queryParams = [
        pageNumber,
        pageSize,
        fromDate || null,
        toDate || null
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllSupplierQuotationParcel(?, ?, ?, ?)',
        queryParams
      );

      // Check error log for details if no output parameters are available
      if (!result[0].length) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const [[errorLog]] = await pool.query(
          'SELECT ErrorMessage, CreatedAt FROM dbo_tblerrorlog ORDER BY CreatedAt DESC LIMIT 1'
        );
        if (errorLog?.ErrorMessage) {
          throw new Error(`Stored procedure error: ${errorLog.ErrorMessage}`);
        }
      }

      return {
        data: result[0],
        totalRecords: result[0].length,
        message: 'Supplier Quotation Parcels retrieved successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
  // Get a Supplier Quotation Parcel by ID
  static async getSupplierQuotationParcelById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Supplier Quotation Parcel not found or deleted');
      }

      return {
        parcel: result[0][0] || null
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Supplier Quotation Parcel
  static async updateSupplierQuotationParcel(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.SupplierQuotationID,
        data.ItemID,
        data.CertificationID,
        data.lineItemNumber,
        data.ItemQuantity,
        data.UOMID,
        data.Rate,
        data.Amount,
        data.CountryOfOriginID,
        data.CreatedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Supplier Quotation Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Supplier Quotation Parcel
  static async deleteSupplierQuotationParcel(id, DeletedByID) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Supplier Quotation Parcel');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SupplierQuotationParcelModel;
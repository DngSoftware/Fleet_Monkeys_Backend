const poolPromise = require('../config/db.config');

class SalesQuotationParcelModel {
  // Create a Sales Quotation Parcel (Commented out since SP doesn't support INSERT)
  /*
  static async createSalesQuotationParcel(data) {
    try {
      const pool = await poolPromise;

      // Validate required fields
      if (!Number.isInteger(data.salesQuotationId) || data.salesQuotationId <= 0) {
        throw new Error('Invalid salesQuotationId: must be a positive integer');
      }
      if (!Number.isInteger(data.itemId) || data.itemId <= 0) {
        throw new Error('Invalid itemId: must be a positive integer');
      }
      if (!Number.isFinite(data.salesRate) || data.salesRate < 0) {
        throw new Error('Invalid salesRate: must be a non-negative number');
      }
      if (!Number.isInteger(data.createdById) || data.createdById <= 0) {
        throw new Error('Invalid createdById: must be a positive integer');
      }

      const queryParams = [
        'INSERT',
        null, // p_SalesQuotationParcelID
        data.salesQuotationId,
        data.supplierQuotationParcelId || null,
        data.parcelId || null,
        data.itemId,
        data.certificationId || null,
        data.lineItemNumber || null,
        data.itemQuantity || null,
        data.uomId || null,
        data.countryOfOriginId || null,
        data.supplierRate || null,
        data.supplierAmount || null,
        data.supplierCurrencyId || null,
        data.exchangeRate || null,
        data.supplierExchangeAmount || null,
        data.localCurrencyId || null,
        data.salesRate,
        data.salesAmount || null,
        data.profit || null,
        data.internationalProcurementAlgorithmId || null,
        data.createdById
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const [[errorLog]] = await pool.query(
          'SELECT ErrorMessage, CreatedAt FROM dbo_tblerrorlog ORDER BY CreatedAt DESC LIMIT 1'
        );
        throw new Error(`Stored procedure error: ${errorLog?.ErrorMessage || outParams.message || 'Unknown error'}`);
      }

      return {
        message: outParams.message,
        salesQuotationParcelId: result[0]?.[0]?.SalesQuotationParcelID || null
      };
    } catch (err) {
      const errorMessage = err.sqlState ? 
        `Database error: ${err.message} (SQLSTATE: ${err.sqlState})` : 
        `Database error: ${err.message}`;
      throw new Error(errorMessage);
    }
  }
  */

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

      // Build the query
      let query = `
        SELECT
          sqp.*,
          i.ItemName,
          u.UOM,
          co.CountryOfOrigin,
          cert.CertificationName
        FROM dbo_tblsalesquotationparcel sqp
        LEFT JOIN dbo_tblitem i ON sqp.ItemID = i.ItemID
        LEFT JOIN dbo_tbluom u ON sqp.UOMID = u.UOMID
        LEFT JOIN dbo_tblcountryoforigin co ON sqp.CountryOfOriginID = co.CountryOfOriginID
        LEFT JOIN dbo_tblcertification cert ON sqp.CertificationID = cert.CertificationID
        WHERE (sqp.IsDeleted = 0 OR sqp.IsDeleted IS NULL)
      `;
      const queryParams = [];

      if (salesQuotationId) {
        query += ' AND sqp.SalesQuotationID = ?';
        queryParams.push(salesQuotationId);
      }

      // Apply pagination
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(pageSize, (pageNumber - 1) * pageSize);

      // Get total records
      let countQuery = 'SELECT COUNT(*) as total FROM dbo_tblsalesquotationparcel WHERE (IsDeleted = 0 OR IsDeleted IS NULL)';
      const countParams = [];
      if (salesQuotationId) {
        countQuery += ' AND SalesQuotationID = ?';
        countParams.push(salesQuotationId);
      }

      const [dataRows] = await pool.query(query, queryParams);
      const [[{ total }]] = await pool.query(countQuery, countParams);

      return {
        data: dataRows,
        totalRecords: total
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

      // Validate parameter
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid id: must be a positive integer');
      }

      const queryParams = [
        'SELECT',
        id,
        null, // p_SalesQuotationID
        null, // p_SupplierQuotationParcelID
        null, // p_ParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CountryOfOriginID
        null, // p_SupplierRate
        null, // p_SupplierAmount
        null, // p_SupplierCurrencyID
        null, // p_ExchangeRate
        null, // p_SupplierExchangeAmount
        null, // p_LocalCurrencyID
        null, // p_SalesRate
        null, // p_SalesAmount
        null, // p_Profit
        null, // p_InternationalProcurementAlgorithmID
        null // p_CreatedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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

 static async updateSalesQuotationParcel(id, data) {
    try {
        const pool = await poolPromise;

        // Validate parameters
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid id: must be a positive integer');
        }
        if (!Number.isInteger(data.createdById) || data.createdById <= 0) {
            throw new Error('Invalid createdById: must be a positive integer');
        }

        const queryParams = [
            'UPDATE',
            id,
            data.salesQuotationId || null,
            data.supplierQuotationParcelId || null,
            data.parcelId || null,
            data.itemId || null,
            data.certificationId || null,
            data.lineItemNumber || null,
            data.itemQuantity || null,
            data.uomId || null,
            data.countryOfOriginId || null,
            data.supplierRate || null,
            data.supplierAmount || null,
            data.supplierCurrencyId || null,
            data.exchangeRate || null,
            data.supplierExchangeAmount || null,
            data.localCurrencyId || null,
            data.salesRate || null,
            data.salesAmount || null,
            data.profit || null,
            data.internationalProcurementAlgorithmId || null,
            data.createdById
        ];

        // Execute the stored procedure with OUT parameters as variables
        await pool.query(
            'SET @p_Result = 0, @p_Message = ""'
        );
        await pool.query(
            'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
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

      // Validate parameters
      if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid id: must be a positive integer');
      }
      if (!Number.isInteger(deletedById) || deletedById <= 0) {
        throw new Error('Invalid deletedById: must be a positive integer');
      }

      const queryParams = [
        'DELETE',
        id,
        null, // p_SalesQuotationID
        null, // p_SupplierQuotationParcelID
        null, // p_ParcelID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_LineItemNumber
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_CountryOfOriginID
        null, // p_SupplierRate
        null, // p_SupplierAmount
        null, // p_SupplierCurrencyID
        null, // p_ExchangeRate
        null, // p_SupplierExchangeAmount
        null, // p_LocalCurrencyID
        null, // p_SalesRate
        null, // p_SalesAmount
        null, // p_Profit
        null, // p_InternationalProcurementAlgorithmID
        deletedById // p_CreatedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
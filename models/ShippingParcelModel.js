const poolPromise = require('../config/db.config');

class ShippingParcelModel {
  static async #executeManageStoredProcedure(action, parcelData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        parcelData.ParcelID ? parseInt(parcelData.ParcelID) : null,
        parcelData.ParentParcelID ? parseInt(parcelData.ParentParcelID) : null,
        parcelData.PInvoiceID ? parseInt(parcelData.PInvoiceID) : null,
        parcelData.SalesQuotationID ? parseInt(parcelData.SalesQuotationID) : null,
        parcelData.SupplierID ? parseInt(parcelData.SupplierID) : null,
        parcelData.ParcelString || null,
        parcelData.ParcelNumber ? parseInt(parcelData.ParcelNumber) : null,
        parcelData.ParcelOutOf ? parseInt(parcelData.ParcelOutOf) : null,
        parcelData.Type ? parseInt(parcelData.Type) : null,
        parcelData.IsRepackagedYN != null ? parcelData.IsRepackagedYN : 0,
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
        parcelData.ParcelDeliveredDatetime ? new Date(parcelData.ParcelDeliveredDatetime) : null,
        parcelData.Signature || null,
        parcelData.ReceivedYN != null ? parcelData.ReceivedYN : 0,
        parcelData.CollectionLoadID ? parseInt(parcelData.CollectionLoadID) : null,
        parcelData.CreatedByID ? parseInt(parcelData.CreatedByID) : null,
        parcelData.ChangedBy || 'NA',
        parcelData.OpenDimensionForm != null ? parcelData.OpenDimensionForm : 0,
      ];

      console.log(`[${new Date().toISOString()}] Executing SP_ManageShippingParcel with ${queryParams.length} params:`, JSON.stringify(queryParams, null, 2));

      const [result] = await pool.query(
        'CALL SP_ManageShippingParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewParcelID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewParcelID AS newParcelID'
      );

      console.log(`[${new Date().toISOString()}] Stored procedure output for ${action}:`, JSON.stringify(outParams, null, 2));

      return {
        success: outParams.result === 'SUCCESS',
        message: outParams.message || (outParams.result === 'SUCCESS' ? `${action} operation completed` : 'Operation failed'),
        data: action === 'SELECT' ? result[0]?.[0] || null : null,
        parcelId: parcelData.ParcelID,
        newParcelId: outParams.newParcelID ? parseInt(outParams.newParcelID) : null,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(parcelData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (!parcelData.CreatedByID) {
        errors.push('CreatedByID is required');
      }

      if (parcelData.ParentParcelID) {
        const [parentCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblshippingparcel WHERE ParcelID = ?',
          [parseInt(parcelData.ParentParcelID)]
        );
        if (parentCheck.length === 0) errors.push(`ParentParcelID ${parcelData.ParentParcelID} does not exist`);
      }
      if (parcelData.PInvoiceID) {
        const [invoiceCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpinvoice WHERE PInvoiceID = ?',
          [parseInt(parcelData.PInvoiceID)]
        );
        if (invoiceCheck.length === 0) errors.push(`PInvoiceID ${parcelData.PInvoiceID} does not exist`);
      }
      if (parcelData.SalesQuotationID) {
        const [quotationCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesquotation WHERE SalesQuotationID = ?',
          [parseInt(parcelData.SalesQuotationID)]
        );
        if (quotationCheck.length === 0) errors.push(`SalesQuotationID ${parcelData.SalesQuotationID} does not exist`);
      }
      if (parcelData.SupplierID) {
        const [supplierCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsupplier WHERE SupplierID = ?',
          [parseInt(parcelData.SupplierID)]
        );
        if (supplierCheck.length === 0) errors.push(`SupplierID ${parcelData.SupplierID} does not exist`);
      }
      if (parcelData.LoadID) {
        const [loadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblload WHERE LoadID = ?',
          [parseInt(parcelData.LoadID)]
        );
        if (loadCheck.length === 0) errors.push(`LoadID ${parcelData.LoadID} does not exist`);
      }
      if (parcelData.LoadTrailerID) {
        const [trailerCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblloadtrailer WHERE LoadTrailerID = ?',
          [parseInt(parcelData.LoadTrailerID)]
        );
        if (trailerCheck.length === 0) errors.push(`LoadTrailerID ${parcelData.LoadTrailerID} does not exist`);
      }
      if (parcelData.LocalLoadID) {
        const [localLoadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbllocalload WHERE LocalLoadID = ?',
          [parseInt(parcelData.LocalLoadID)]
        );
        if (localLoadCheck.length === 0) errors.push(`LocalLoadID ${parcelData.LocalLoadID} does not exist`);
      }
      if (parcelData.ParcelDimensionID) {
        const [dimensionCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpinvoiceparcelpalletdimensions WHERE ParcelDimensionID = ?',
          [parseInt(parcelData.ParcelDimensionID)]
        );
        if (dimensionCheck.length === 0) errors.push(`ParcelDimensionID ${parcelData.ParcelDimensionID} does not exist`);
      }
      if (parcelData.VolumeUOMID) {
        const [volumeUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ?',
          [parseInt(parcelData.VolumeUOMID)]
        );
        if (volumeUOMCheck.length === 0) errors.push(`VolumeUOMID ${parcelData.VolumeUOMID} does not exist`);
      }
      if (parcelData.WeightUOMID) {
        const [weightUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ?',
          [parseInt(parcelData.WeightUOMID)]
        );
        if (weightUOMCheck.length === 0) errors.push(`WeightUOMID ${parcelData.WeightUOMID} does not exist`);
      }
      if (parcelData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(parcelData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${parcelData.CreatedByID} does not exist`);
      }
      if (parcelData.CollectionLoadID) {
        const [collectionLoadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcollectionload WHERE CollectionLoadID = ?',
          [parseInt(parcelData.CollectionLoadID)]
        );
        if (collectionLoadCheck.length === 0) errors.push(`CollectionLoadID ${parcelData.CollectionLoadID} does not exist`);
      }
    }

    if (action === 'DELETE') {
      if (!parcelData.CreatedByID) {
        errors.push('CreatedByID is required');
      }
      if (parcelData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(parcelData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${parcelData.CreatedByID} does not exist`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createShippingParcel(parcelData) {
    const fkErrors = await this.#validateForeignKeys(parcelData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        parcelId: null,
        newParcelId: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', parcelData);
  }

  static async updateShippingParcel(parcelData) {
    if (!parcelData.ParcelID) {
      return {
        success: false,
        message: 'ParcelID is required for UPDATE',
        data: null,
        parcelId: null,
        newParcelId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(parcelData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        parcelId: parcelData.ParcelID,
        newParcelId: null,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', parcelData);
  }

  static async deleteShippingParcel(parcelData) {
    if (!parcelData.ParcelID) {
      return {
        success: false,
        message: 'ParcelID is required for DELETE',
        data: null,
        parcelId: null,
        newParcelId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(parcelData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        parcelId: parcelData.ParcelID,
        newParcelId: null,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', parcelData);
  }

  static async getShippingParcel(parcelData) {
    if (!parcelData.ParcelID) {
      return {
        success: false,
        message: 'ParcelID is required for SELECT',
        data: null,
        parcelId: null,
        newParcelId: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', parcelData);
  }

  static async getAllShippingParcels(paginationData) {
    try {
      const pool = await poolPromise;

      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;
      if (pageNumber < 1) throw new Error('PageNumber must be greater than 0');
      if (pageSize < 1 || pageSize > 100) throw new Error('PageSize must be between 1 and 100');

      const [result] = await pool.query(
        'SELECT * FROM dbo_tblshippingparcel LIMIT ? OFFSET ?',
        [pageSize, (pageNumber - 1) * pageSize]
      );

      const [[{ totalRecords }]] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblshippingparcel'
      );

      return {
        success: true,
        message: 'Shipping parcels retrieved successfully.',
        data: result || [],
        totalRecords: totalRecords || 0,
        parcelId: null,
        newParcelId: null,
      };
    } catch (error) {
      console.error('Database error in getAllShippingParcels:', error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async getShippingParcelsBySalesQuotation(paginationData) {
    try {
      const pool = await poolPromise;

      const salesQuotationId = parseInt(paginationData.SalesQuotationID);
      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;

      if (isNaN(salesQuotationId)) {
        throw new Error('Invalid SalesQuotationID');
      }
      if (pageNumber < 1) {
        throw new Error('PageNumber must be greater than 0');
      }
      if (pageSize < 1 || pageSize > 100) {
        throw new Error('PageSize must be between 1 and 100');
      }

      const [quotationCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblsalesquotation WHERE SalesQuotationID = ?',
        [salesQuotationId]
      );
      if (quotationCheck.length === 0) {
        return {
          success: false,
          message: `SalesQuotationID ${salesQuotationId} does not exist`,
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
        };
      }

      // Check if a PInvoice exists linked to a SalesOrder with the given SalesQuotationID
      const [invoiceCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblpinvoice pi ' +
        'JOIN dbo_tblsalesorder so ON pi.SalesOrderID = so.SalesOrderID ' +
        'WHERE so.SalesQuotationID = ? LIMIT 1',
        [salesQuotationId]
      );
      if (invoiceCheck.length === 0) {
        return {
          success: false,
          message: `No PInvoice exists for SalesQuotationID ${salesQuotationId}`,
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
        };
      }

      const [result] = await pool.query(
        'SELECT * FROM dbo_tblshippingparcel sp ' +
        'WHERE sp.SalesQuotationID = ? AND sp.PInvoiceID IS NULL LIMIT ? OFFSET ?',
        [salesQuotationId, pageSize, (pageNumber - 1) * pageSize]
      );

      const [[{ totalRecords }]] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblshippingparcel sp ' +
        'WHERE sp.SalesQuotationID = ? AND sp.PInvoiceID IS NULL',
        [salesQuotationId]
      );

      return {
        success: true,
        message: 'Shipping parcels retrieved successfully.',
        data: result || [],
        totalRecords: totalRecords || 0,
        parcelId: null,
        newParcelId: null,
      };
    } catch (error) {
      console.error('Database error in getShippingParcelsBySalesQuotation:', error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async getShippingParcelsByPInvoice(paginationData) {
    try {
      const pool = await poolPromise;

      const pInvoiceId = parseInt(paginationData.PInvoiceID);
      const salesQuotationId = parseInt(paginationData.SalesQuotationID);
      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;

      if (isNaN(pInvoiceId)) {
        throw new Error('Invalid PInvoiceID');
      }
      if (isNaN(salesQuotationId)) {
        throw new Error('Invalid SalesQuotationID');
      }
      if (pageNumber < 1) {
        throw new Error('PageNumber must be greater than 0');
      }
      if (pageSize < 1 || pageSize > 100) {
        throw new Error('PageSize must be between 1 and 100');
      }

      const [invoiceCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblpinvoice pi ' +
        'JOIN dbo_tblsalesorder so ON pi.SalesOrderID = so.SalesOrderID ' +
        'WHERE pi.PInvoiceID = ? AND so.SalesQuotationID = ?',
        [pInvoiceId, salesQuotationId]
      );
      if (invoiceCheck.length === 0) {
        return {
          success: false,
          message: `PInvoiceID ${pInvoiceId} does not exist or is not linked to SalesQuotationID ${salesQuotationId}`,
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
        };
      }

      const [result] = await pool.query(
        'SELECT sp.* FROM dbo_tblshippingparcel sp ' +
        'WHERE sp.PInvoiceID = ? AND sp.SalesQuotationID = ? LIMIT ? OFFSET ?',
        [pInvoiceId, salesQuotationId, pageSize, (pageNumber - 1) * pageSize]
      );

      const [[{ totalRecords }]] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblshippingparcel sp ' +
        'WHERE sp.PInvoiceID = ? AND sp.SalesQuotationID = ?',
        [pInvoiceId, salesQuotationId]
      );

      return {
        success: true,
        message: 'Shipping parcels retrieved successfully.',
        data: result || [],
        totalRecords: totalRecords || 0,
        parcelId: null,
        newParcelId: null,
      };
    } catch (error) {
      console.error('Database error in getShippingParcelsByPInvoice:', error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }
}

module.exports = ShippingParcelModel;
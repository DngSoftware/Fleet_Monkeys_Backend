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
      if (action === 'INSERT' && !parcelData.SalesQuotationID) {
        errors.push('SalesQuotationID is required for INSERT');
      }

      if (parcelData.ParentParcelID) {
        const [parentCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblshippingparcel WHERE ParcelID = ? AND IsDeleted = 0',
          [parseInt(parcelData.ParentParcelID)]
        );
        if (parentCheck.length === 0) errors.push(`ParentParcelID ${parcelData.ParentParcelID} does not exist`);
      }
      if (parcelData.PInvoiceID) {
        const [invoiceCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpinvoice WHERE PInvoiceID = ? AND IsDeleted = 0',
          [parseInt(parcelData.PInvoiceID)]
        );
        if (invoiceCheck.length === 0) errors.push(`PInvoiceID ${parcelData.PInvoiceID} does not exist`);
      }
      if (parcelData.SalesQuotationID) {
        const [quotationCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesquotation WHERE SalesQuotationID = ? AND IsDeleted = 0',
          [parseInt(parcelData.SalesQuotationID)]
        );
        if (quotationCheck.length === 0) errors.push(`SalesQuotationID ${parcelData.SalesQuotationID} does not exist`);
      }
      if (parcelData.SupplierID) {
        const [supplierCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsupplier WHERE SupplierID = ? AND IsDeleted = 0',
          [parseInt(parcelData.SupplierID)]
        );
        if (supplierCheck.length === 0) errors.push(`SupplierID ${parcelData.SupplierID} does not exist`);
      }
      if (parcelData.LoadID) {
        const [loadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblload WHERE LoadID = ? AND IsDeleted = 0',
          [parseInt(parcelData.LoadID)]
        );
        if (loadCheck.length === 0) errors.push(`LoadID ${parcelData.LoadID} does not exist`);
      }
      if (parcelData.LoadTrailerID) {
        const [trailerCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblloadtrailer WHERE LoadTrailerID = ? AND IsDeleted = 0',
          [parseInt(parcelData.LoadTrailerID)]
        );
        if (trailerCheck.length === 0) errors.push(`LoadTrailerID ${parcelData.LoadTrailerID} does not exist`);
      }
      if (parcelData.LocalLoadID) {
        const [localLoadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbllocalload WHERE LocalLoadID = ? AND IsDeleted = 0',
          [parseInt(parcelData.LocalLoadID)]
        );
        if (localLoadCheck.length === 0) errors.push(`LocalLoadID ${parcelData.LocalLoadID} does not exist`);
      }
      if (parcelData.ParcelDimensionID) {
        const [dimensionCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpinvoiceparcelpalletdimensions WHERE ParcelDimensionID = ? AND IsDeleted = 0',
          [parseInt(parcelData.ParcelDimensionID)]
        );
        if (dimensionCheck.length === 0) errors.push(`ParcelDimensionID ${parcelData.ParcelDimensionID} does not exist`);
      }
      if (parcelData.VolumeUOMID) {
        const [volumeUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ? AND IsDeleted = 0',
          [parseInt(parcelData.VolumeUOMID)]
        );
        if (volumeUOMCheck.length === 0) errors.push(`VolumeUOMID ${parcelData.VolumeUOMID} does not exist`);
      }
      if (parcelData.WeightUOMID) {
        const [weightUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ? AND IsDeleted = 0',
          [parseInt(parcelData.WeightUOMID)]
        );
        if (weightUOMCheck.length === 0) errors.push(`WeightUOMID ${parcelData.WeightUOMID} does not exist`);
      }
      if (parcelData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(parcelData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${parcelData.CreatedByID} does not exist`);
      }
      if (parcelData.CollectionLoadID) {
        const [collectionLoadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcollectionload WHERE CollectionLoadID = ? AND IsDeleted = 0',
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
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(parcelData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${parcelData.CreatedByID} does not exist`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createShippingParcel(parcelData) {
    if (parcelData.Volume && parcelData.Volume < 0) {
      return {
        success: false,
        message: 'Volume cannot be negative',
        data: null,
        parcelId: null,
        newParcelId: null,
      };
    }

    if (parcelData.Weight && parcelData.Weight < 0) {
      return {
        success: false,
        message: 'Weight cannot be negative',
        data: null,
        parcelId: null,
        newParcelId: null,
      };
    }

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

    if (parcelData.Volume && parcelData.Volume < 0) {
      return {
        success: false,
        message: 'Volume cannot be negative',
        data: null,
        parcelId: parcelData.ParcelID,
        newParcelId: null,
      };
    }

    if (parcelData.Weight && parcelData.Weight < 0) {
      return {
        success: false,
        message: 'Weight cannot be negative',
        data: null,
        parcelId: parcelData.ParcelID,
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
        `SELECT 
          ParcelID, ParentParcelID, PInvoiceID, SalesQuotationID, SupplierID,
          ParcelString, ParcelNumber, ParcelOutOf, Type, IsRepackagedYN,
          ShippingAndHandellingRequirement, Notes, LoadID, LoadTrailerID,
          LocalLoadID, ParcelDimensionID, QRCodeString, Volume, VolumeUOMID,
          Weight, WeightUOMID, ParcelReceivedBy, ParcelDeliveredDatetime,
          ReceivedYN, CollectionLoadID, CreatedByID, CreatedDateTime, RowVersionColumn
         FROM dbo_tblshippingparcel
         WHERE IsDeleted = 0
         ORDER BY ParcelID
         LIMIT ? OFFSET ?`,
        [pageSize, (pageNumber - 1) * pageSize]
      );

      const [[{ totalRecords }]] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblshippingparcel WHERE IsDeleted = 0'
      );

      const validTotalRecords = totalRecords != null && totalRecords >= 0 ? totalRecords : 0;

      return {
        success: true,
        message: validTotalRecords === 0 ? 'No ShippingParcel records found.' : 'ShippingParcel records retrieved successfully.',
        data: result || [],
        totalRecords: validTotalRecords,
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
        return {
          success: false,
          message: 'Invalid or missing SalesQuotationID',
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: null,
          pInvoiceId: null,
          salesRFQId: null,
        };
      }
      if (pageNumber < 1) {
        return {
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: null,
          salesRFQId: null,
        };
      }
      if (pageSize < 1 || pageSize > 100) {
        return {
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: null,
          salesRFQId: null,
        };
      }

      // Verify SalesQuotationID exists
      const [quotationCheck] = await pool.query(
        'SELECT SalesRFQID FROM dbo_tblsalesquotation WHERE SalesQuotationID = ? AND IsDeleted = 0',
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
          salesQuotationId: salesQuotationId,
          pInvoiceId: null,
          salesRFQId: null,
        };
      }

      const salesRFQId = quotationCheck[0].SalesRFQID;

      // Check for related PInvoice with the same SalesRFQID
      const [invoiceCheck] = await pool.query(
        'SELECT PInvoiceID FROM dbo_tblpinvoice WHERE SalesRFQID = ? AND IsDeleted = 0',
        [salesRFQId]
      );

      const pInvoiceId = invoiceCheck.length > 0 ? invoiceCheck[0].PInvoiceID : null;

      // Fetch parcels linked to SalesQuotationID or related PInvoiceID
      const [result] = await pool.query(
        `SELECT 
          sp.ParcelID, sp.ParentParcelID, sp.PInvoiceID, sp.SalesQuotationID, sp.SupplierID,
          sp.ParcelString, sp.ParcelNumber, sp.ParcelOutOf, sp.Type, sp.IsRepackagedYN,
          sp.ShippingAndHandellingRequirement, sp.Notes, sp.LoadID, sp.LoadTrailerID,
          sp.LocalLoadID, sp.ParcelDimensionID, sp.QRCodeString, sp.Volume, sp.VolumeUOMID,
          sp.Weight, sp.WeightUOMID, sp.ParcelReceivedBy, sp.ParcelDeliveredDatetime,
          sp.ReceivedYN, sp.CollectionLoadID, sp.CreatedByID, sp.CreatedDateTime, sp.RowVersionColumn
         FROM dbo_tblshippingparcel sp
         WHERE sp.IsDeleted = 0
           AND (sp.SalesQuotationID = ? OR sp.PInvoiceID = ?)
         ORDER BY sp.ParcelID
         LIMIT ? OFFSET ?`,
        [salesQuotationId, pInvoiceId || -1, pageSize, (pageNumber - 1) * pageSize]
      );

      const [[{ totalRecords }]] = await pool.query(
        `SELECT COUNT(*) AS totalRecords
         FROM dbo_tblshippingparcel sp
         WHERE sp.IsDeleted = 0
           AND (sp.SalesQuotationID = ? OR sp.PInvoiceID = ?)`,
        [salesQuotationId, pInvoiceId || -1]
      );

      const validTotalRecords = totalRecords != null && totalRecords >= 0 ? totalRecords : 0;

      return {
        success: true,
        message: validTotalRecords === 0 ? 'No ShippingParcel records found for this SalesQuotationID.' : 'ShippingParcel records retrieved successfully.',
        data: result || [],
        totalRecords: validTotalRecords,
        parcelId: null,
        newParcelId: null,
        salesQuotationId: salesQuotationId,
        pInvoiceId: pInvoiceId,
        salesRFQId: salesRFQId,
      };
    } catch (error) {
      console.error('Database error in getShippingParcelsBySalesQuotation:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        parcelId: null,
        newParcelId: null,
        salesQuotationId: paginationData.SalesQuotationID,
        pInvoiceId: null,
        salesRFQId: null,
      };
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
        return {
          success: false,
          message: 'Invalid or missing PInvoiceID',
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: null,
          salesRFQId: null,
        };
      }
      if (isNaN(salesQuotationId)) {
        return {
          success: false,
          message: 'Invalid or missing SalesQuotationID',
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: null,
          pInvoiceId: pInvoiceId,
          salesRFQId: null,
        };
      }
      if (pageNumber < 1) {
        return {
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: pInvoiceId,
          salesRFQId: null,
        };
      }
      if (pageSize < 1 || pageSize > 100) {
        return {
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: pInvoiceId,
          salesRFQId: null,
        };
      }

      // Verify PInvoiceID and SalesQuotationID share the same SalesRFQID
      const [relationshipCheck] = await pool.query(
        `SELECT 1
         FROM dbo_tblsalesquotation sq
         JOIN dbo_tblpinvoice pi ON sq.SalesRFQID = pi.SalesRFQID
         WHERE sq.SalesQuotationID = ? AND pi.PInvoiceID = ? AND sq.IsDeleted = 0 AND pi.IsDeleted = 0`,
        [salesQuotationId, pInvoiceId]
      );

      if (relationshipCheck.length === 0) {
        return {
          success: false,
          message: `PInvoiceID ${pInvoiceId} and SalesQuotationID ${salesQuotationId} do not share the same SalesRFQID or do not exist`,
          data: null,
          totalRecords: 0,
          parcelId: null,
          newParcelId: null,
          salesQuotationId: salesQuotationId,
          pInvoiceId: pInvoiceId,
          salesRFQId: null,
        };
      }

      const [result] = await pool.query(
        `SELECT 
          sp.ParcelID, sp.ParentParcelID, sp.PInvoiceID, sp.SalesQuotationID, sp.SupplierID,
          sp.ParcelString, sp.ParcelNumber, sp.ParcelOutOf, sp.Type, sp.IsRepackagedYN,
          sp.ShippingAndHandellingRequirement, sp.Notes, sp.LoadID, sp.LoadTrailerID,
          sp.LocalLoadID, sp.ParcelDimensionID, sp.QRCodeString, sp.Volume, sp.VolumeUOMID,
          sp.Weight, sp.WeightUOMID, sp.ParcelReceivedBy, sp.ParcelDeliveredDatetime,
          sp.ReceivedYN, sp.CollectionLoadID, sp.CreatedByID, sp.CreatedDateTime, sp.RowVersionColumn
         FROM dbo_tblshippingparcel sp
         WHERE sp.IsDeleted = 0
           AND sp.PInvoiceID = ? AND sp.SalesQuotationID = ?
         ORDER BY sp.ParcelID
         LIMIT ? OFFSET ?`,
        [pInvoiceId, salesQuotationId, pageSize, (pageNumber - 1) * pageSize]
      );

      const [[{ totalRecords }]] = await pool.query(
        `SELECT COUNT(*) AS totalRecords
         FROM dbo_tblshippingparcel sp
         WHERE sp.IsDeleted = 0
           AND sp.PInvoiceID = ? AND sp.SalesQuotationID = ?`,
        [pInvoiceId, salesQuotationId]
      );

      const validTotalRecords = totalRecords != null && totalRecords >= 0 ? totalRecords : 0;

      return {
        success: true,
        message: validTotalRecords === 0 ? 'No ShippingParcel records found for this PInvoiceID and SalesQuotationID.' : 'ShippingParcel records retrieved successfully.',
        data: result || [],
        totalRecords: validTotalRecords,
        parcelId: null,
        newParcelId: null,
        salesQuotationId: salesQuotationId,
        pInvoiceId: pInvoiceId,
        salesRFQId: null, // Not needed in response since it's validated internally
      };
    } catch (error) {
      console.error('Database error in getShippingParcelsByPInvoice:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        parcelId: null,
        newParcelId: null,
        salesQuotationId: paginationData.SalesQuotationID,
        pInvoiceId: paginationData.PInvoiceID,
        salesRFQId: null,
      };
    }
  }
}

module.exports = ShippingParcelModel;
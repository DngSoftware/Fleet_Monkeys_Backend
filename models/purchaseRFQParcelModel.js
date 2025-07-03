const poolPromise = require('../config/db.config');

class PurchaseRFQParcelModel {
  static async #executeManageStoredProcedure(action, purchaseRFQParcelData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        purchaseRFQParcelData.PurchaseRFQParcelID ? parseInt(purchaseRFQParcelData.PurchaseRFQParcelID) : null,
        purchaseRFQParcelData.PurchaseRFQID ? parseInt(purchaseRFQParcelData.PurchaseRFQID) : null,
        purchaseRFQParcelData.ParcelID ? parseInt(purchaseRFQParcelData.ParcelID) : null,
        purchaseRFQParcelData.ItemID ? parseInt(purchaseRFQParcelData.ItemID) : null,
        purchaseRFQParcelData.LineItemNumber ? parseInt(purchaseRFQParcelData.LineItemNumber) : null,
        purchaseRFQParcelData.ItemQuantity ? parseFloat(purchaseRFQParcelData.ItemQuantity) : null,
        purchaseRFQParcelData.UOMID ? parseInt(purchaseRFQParcelData.UOMID) : null,
        purchaseRFQParcelData.Rate ? parseFloat(purchaseRFQParcelData.Rate) : null,
        purchaseRFQParcelData.Amount ? parseFloat(purchaseRFQParcelData.Amount) : null,
        purchaseRFQParcelData.LineNumber ? parseInt(purchaseRFQParcelData.LineNumber) : null,
        purchaseRFQParcelData.CreatedByID ? parseInt(purchaseRFQParcelData.CreatedByID) : null,
        purchaseRFQParcelData.DeletedByID ? parseInt(purchaseRFQParcelData.DeletedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePurchaseRFQParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 0,
        message: outParams.message || (outParams.result === 0 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0] || [] : null,
        purchaseRFQParcelId: purchaseRFQParcelData.PurchaseRFQParcelID,
        newPurchaseRFQParcelId: action === 'INSERT' ? result[0]?.insertId : null
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(purchaseRFQParcelData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (purchaseRFQParcelData.PurchaseRFQID) {
        const [purchaseRFQCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpurchaserfq WHERE PurchaseRFQID = ? AND IsDeleted = 0',
          [parseInt(purchaseRFQParcelData.PurchaseRFQID)]
        );
        if (purchaseRFQCheck.length === 0) errors.push(`PurchaseRFQID ${purchaseRFQParcelData.PurchaseRFQID} does not exist`);
      }
      if (purchaseRFQParcelData.ParcelID) {
        const [parcelCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblparcel WHERE ParcelID = ? AND IsDeleted = 0',
          [parseInt(purchaseRFQParcelData.ParcelID)]
        );
        if (parcelCheck.length === 0) errors.push(`ParcelID ${purchaseRFQParcelData.ParcelID} does not exist`);
      }
      if (purchaseRFQParcelData.ItemID) {
        const [itemCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblitem WHERE ItemID = ? AND IsDeleted = 0',
          [parseInt(purchaseRFQParcelData.ItemID)]
        );
        if (itemCheck.length === 0) errors.push(`ItemID ${purchaseRFQParcelData.ItemID} does not exist`);
      }
      if (purchaseRFQParcelData.UOMID) {
        const [uomCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ? AND IsDeleted = 0',
          [parseInt(purchaseRFQParcelData.UOMID)]
        );
        if (uomCheck.length === 0) errors.push(`UOMID ${purchaseRFQParcelData.UOMID} does not exist`);
      }
      if (purchaseRFQParcelData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(purchaseRFQParcelData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${purchaseRFQParcelData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE' && purchaseRFQParcelData.DeletedByID) {
      const [deletedByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
        [parseInt(purchaseRFQParcelData.DeletedByID)]
      );
      if (deletedByCheck.length === 0) errors.push(`DeletedByID ${purchaseRFQParcelData.DeletedByID} does not exist`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createPurchaseRFQParcel(purchaseRFQParcelData) {
    const requiredFields = ['PurchaseRFQID', 'ItemID', 'ItemQuantity', 'CreatedByID'];
    const missingFields = requiredFields.filter(field => !purchaseRFQParcelData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(purchaseRFQParcelData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', purchaseRFQParcelData);
  }

  static async updatePurchaseRFQParcel(purchaseRFQParcelData) {
    if (!purchaseRFQParcelData.PurchaseRFQParcelID) {
      return {
        success: false,
        message: 'PurchaseRFQParcelID is required for UPDATE',
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(purchaseRFQParcelData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        purchaseRFQParcelId: purchaseRFQParcelData.PurchaseRFQParcelID,
        newPurchaseRFQParcelId: null
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', purchaseRFQParcelData);
  }

  static async deletePurchaseRFQParcel(purchaseRFQParcelData) {
    if (!purchaseRFQParcelData.PurchaseRFQParcelID) {
      return {
        success: false,
        message: 'PurchaseRFQParcelID is required for DELETE',
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(purchaseRFQParcelData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        purchaseRFQParcelId: purchaseRFQParcelData.PurchaseRFQParcelID,
        newPurchaseRFQParcelId: null
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', purchaseRFQParcelData);
  }

  static async getPurchaseRFQParcel(purchaseRFQParcelData) {
    if (!purchaseRFQParcelData.PurchaseRFQParcelID) {
      return {
        success: false,
        message: 'PurchaseRFQParcelID is required for SELECT',
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', purchaseRFQParcelData);
  }

   // Get all Purchase RFQ Parcels by PurchaseRFQID
  static async getAllPurchaseRFQParcelsByPurchaseRFQId({
    purchaseRFQId,
    pageNumber = 1,
    pageSize = 10,
    sortDirection = 'DESC',
    fromDate = null,
    toDate = null
  }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(purchaseRFQId) || purchaseRFQId <= 0) {
        throw new Error('Invalid purchaseRFQId: must be a positive integer');
      }
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw new Error('Invalid pageNumber: must be a positive integer');
      }
      if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new Error('Invalid pageSize: must be a positive integer');
      }
      if (sortDirection && !['ASC', 'DESC'].includes(sortDirection.toUpperCase())) {
        throw new Error('Invalid sortDirection: must be ASC or DESC');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        sortDirection.toUpperCase(),
        fromDate || null,
        toDate || null
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllPurchaseRFQParcels(?, ?, ?, ?, ?, @o_TotalRecords, @o_Message, @o_Error)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @o_TotalRecords AS totalRecords, @o_Message AS message, @o_Error AS error'
      );

      if (outParams.error === 1) {
        throw new Error(outParams.message || 'Error in stored procedure execution');
      }

      // Filter results by PurchaseRFQID
      const filteredData = result[0].filter(parcel => parcel.PurchaseRFQID === purchaseRFQId);

      // Apply pagination to filtered results
      const startIndex = (pageNumber - 1) * pageSize;
      const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        message: outParams.message || 'Purchase RFQ Parcels retrieved successfully',
        data: paginatedData,
        totalRecords: filteredData.length
      };
    } catch (err) {
      console.error('Error in getAllPurchaseRFQParcelsByPurchaseRFQId:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = PurchaseRFQParcelModel;
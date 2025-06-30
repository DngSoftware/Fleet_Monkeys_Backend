const poolPromise = require('../config/db.config');

class POParcelModel {
  static async #executeManageStoredProcedure(action, poParcelData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        poParcelData.POParcelID ? parseInt(poParcelData.POParcelID) : null,
        poParcelData.POID ? parseInt(poParcelData.POID) : null,
        poParcelData.ItemQuantity ? parseFloat(poParcelData.ItemQuantity) : null,
        poParcelData.Rate ? parseFloat(poParcelData.Rate) : null,
        poParcelData.Amount ? parseFloat(poParcelData.Amount) : null,
        poParcelData.UOMID ? parseInt(poParcelData.UOMID) : null,
        poParcelData.CertificationID ? parseInt(poParcelData.CertificationID) : null,
        poParcelData.CreatedByID ? parseInt(poParcelData.CreatedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePOParcel(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0] || [] : null,
        poParcelId: poParcelData.POParcelID
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(poParcelData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (['UPDATE', 'DELETE'].includes(action)) {
      if (poParcelData.POParcelID) {
        const [poParcelCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpoparcel WHERE POParcelID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(poParcelData.POParcelID)]
        );
        if (poParcelCheck.length === 0) errors.push(`POParcelID ${poParcelData.POParcelID} does not exist or is deleted`);
      }
    }

    if (action === 'UPDATE') {
      if (poParcelData.UOMID) {
        const [uomCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ?',
          [parseInt(poParcelData.UOMID)]
        );
        if (uomCheck.length === 0) errors.push(`UOMID ${poParcelData.UOMID} does not exist`);
      }
      if (poParcelData.CertificationID) {
        const [certificationCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcertification WHERE CertificationID = ?',
          [parseInt(poParcelData.CertificationID)]
        );
        if (certificationCheck.length === 0) errors.push(`CertificationID ${poParcelData.CertificationID} does not exist`);
      }
    }

    if (['UPDATE', 'DELETE'].includes(action) && poParcelData.CreatedByID) {
      const [createdByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
        [parseInt(poParcelData.CreatedByID)]
      );
      if (createdByCheck.length === 0) errors.push(`CreatedByID ${poParcelData.CreatedByID} does not exist`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async getPOParcelById(poParcelId) {
    try {
      if (!poParcelId) {
        return {
          success: false,
          message: 'POParcelID is required for SELECT',
          data: null,
          poParcelId: null
        };
      }

      const poParcelData = { POParcelID: poParcelId };
      const result = await this.#executeManageStoredProcedure('SELECT', poParcelData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        poParcelId: poParcelId
      };
    } catch (error) {
      console.error('Error in getPOParcelById:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poParcelId: poParcelId
      };
    }
  }

  static async updatePOParcel(poParcelData) {
    try {
      if (!poParcelData.POParcelID) {
        return {
          success: false,
          message: 'POParcelID is required for UPDATE',
          data: null,
          poParcelId: null
        };
      }

      const fkErrors = await this.#validateForeignKeys(poParcelData, 'UPDATE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          poParcelId: poParcelData.POParcelID
        };
      }

      const result = await this.#executeManageStoredProcedure('UPDATE', poParcelData);
      return result;
    } catch (error) {
      console.error('Error in updatePOParcel:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poParcelId: poParcelData.POParcelID
      };
    }
  }

  static async deletePOParcel(poParcelData) {
    try {
      if (!poParcelData.POParcelID) {
        return {
          success: false,
          message: 'POParcelID is required for DELETE',
          data: null,
          poParcelId: null
        };
      }

      const fkErrors = await this.#validateForeignKeys(poParcelData, 'DELETE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          poParcelId: poParcelData.POParcelID
        };
      }

      const result = await this.#executeManageStoredProcedure('DELETE', poParcelData);
      return result;
    } catch (error) {
      console.error('Error in deletePOParcel:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poParcelId: poParcelData.POParcelID
      };
    }
  }

  // Get all Sales Order Parcels
  static async getAllPOParcels({
    pageNumber = 1,
    pageSize = 10,
    POID = null
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
      if (POID && !Number.isInteger(POID)) {
        throw new Error('Invalid POID: must be an integer');
      }

      const queryParams = [
        'SELECT',
        null, // p_SalesOrderParcelID
        POID || null, // p_SalesOrderID
        null, // p_ItemID
        null, // p_CertificationID
        null, // p_ItemQuantity
        null, // p_UOMID
        null, // p_SalesRate
        null, // p_SalesAmount
        null, // p_CountryOfOriginID
        null // p_ChangedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePOParcel( ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
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

}

module.exports = POParcelModel;
const poolPromise = require('../config/db.config');

class PInvoiceParcelPalletDimensionsModel {
  static async #executeManageStoredProcedure(action, dimensionData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const queryParams = [
        action,
        dimensionData.ParcelDimensionID ? parseInt(dimensionData.ParcelDimensionID) : null,
        dimensionData.ParcelID ? parseInt(dimensionData.ParcelID) : null,
        dimensionData.ActualLength ? parseFloat(dimensionData.ActualLength) : null,
        dimensionData.ActualHeight ? parseFloat(dimensionData.ActualHeight) : null,
        dimensionData.ActualWidth ? parseFloat(dimensionData.ActualWidth) : null,
        dimensionData.ActualVolume ? parseFloat(dimensionData.ActualVolume) : null,
        dimensionData.ActualWeight ? parseFloat(dimensionData.ActualWeight) : null,
        dimensionData.SupplierLength ? parseFloat(dimensionData.SupplierLength) : null,
        dimensionData.SupplierHeight ? parseFloat(dimensionData.SupplierHeight) : null,
        dimensionData.SupplierWidth ? parseFloat(dimensionData.SupplierWidth) : null,
        dimensionData.SupplierVolume ? parseFloat(dimensionData.SupplierVolume) : null,
        dimensionData.VolumeUOMID ? parseInt(dimensionData.VolumeUOMID) : null,
        dimensionData.SupplierWeight ? parseFloat(dimensionData.SupplierWeight) : null,
        dimensionData.WeightUOMID ? parseInt(dimensionData.WeightUOMID) : null,
        dimensionData.CreatedByID ? parseInt(dimensionData.CreatedByID) : null,
        dimensionData.DeletedByID ? parseInt(dimensionData.DeletedByID) : null,
      ];

      console.log(`[${new Date().toISOString()}] Executing SP_ManagePInvoiceParcelPalletDimensions with params:`, JSON.stringify(queryParams, null, 2));

      const [result] = await connection.query(
        'CALL SP_ManagePInvoiceParcelPalletDimensions(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewParcelDimensionID)',
        queryParams
      );

      const [[outParams]] = await connection.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewParcelDimensionID AS newParcelDimensionID'
      );

      console.log(`[${new Date().toISOString()}] Stored procedure output:`, JSON.stringify(outParams, null, 2));

      if (action === 'INSERT' && outParams.newParcelDimensionID) {
        const [insertedData] = await connection.query(
          'SELECT * FROM dbo_tblpinvoiceparcelpalletdimensions WHERE ParcelDimensionID = ?',
          [outParams.newParcelDimensionID]
        );
        console.log(`[${new Date().toISOString()}] Inserted data for ID ${outParams.newParcelDimensionID}:`, JSON.stringify(insertedData, null, 2));
      }

      await connection.commit();

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0]?.[0] || null : null,
        parcelDimensionId: dimensionData.ParcelDimensionID,
        newParcelDimensionId: outParams.newParcelDimensionID ? parseInt(outParams.newParcelDimensionID) : null,
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error(`[${new Date().toISOString()}] Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    } finally {
      if (connection) connection.release();
    }
  }

  static async #validateForeignKeys(dimensionData, action) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      const errors = [];

      if (action === 'INSERT' || action === 'UPDATE') {
        if (dimensionData.ParcelID) {
          const [parcelCheck] = await connection.query(
            'SELECT 1 FROM dbo_tblshippingparcel WHERE ParcelID = ?',
            [parseInt(dimensionData.ParcelID)]
          );
          if (parcelCheck.length === 0) errors.push(`ParcelID ${dimensionData.ParcelID} does not exist`);
        }
        if (dimensionData.VolumeUOMID) {
          const [uomCheck] = await connection.query(
            'SELECT 1 FROM dbo_tbluom WHERE UOMID = ?',
            [parseInt(dimensionData.VolumeUOMID)]
          );
          if (uomCheck.length === 0) errors.push(`VolumeUOMID ${dimensionData.VolumeUOMID} does not exist`);
        }
        if (dimensionData.WeightUOMID) {
          const [uomCheck] = await connection.query(
            'SELECT 1 FROM dbo_tbluom WHERE UOMID = ?',
            [parseInt(dimensionData.WeightUOMID)]
          );
          if (uomCheck.length === 0) errors.push(`WeightUOMID ${dimensionData.WeightUOMID} does not exist`);
        }
        if (dimensionData.CreatedByID) {
          const [createdByCheck] = await connection.query(
            'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
            [parseInt(dimensionData.CreatedByID)]
          );
          if (createdByCheck.length === 0) errors.push(`CreatedByID ${dimensionData.CreatedByID} does not exist`);
        }
      }

      if (action === 'DELETE' && dimensionData.DeletedByID) {
        const [deletedByCheck] = await connection.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(dimensionData.DeletedByID)]
        );
        if (deletedByCheck.length === 0) errors.push(`DeletedByID ${dimensionData.DeletedByID} does not exist`);
      }

      return errors.length > 0 ? errors.join('; ') : null;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Foreign key validation error:`, error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async createPInvoiceParcelPalletDimensions(dimensionData) {
    console.log(`[${new Date().toISOString()}] createPInvoiceParcelPalletDimensions input:`, JSON.stringify(dimensionData, null, 2));

    const requiredFields = ['CreatedByID'];
    const missingFields = requiredFields.filter(field => !dimensionData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(dimensionData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', dimensionData);
  }

  static async updatePInvoiceParcelPalletDimensions(dimensionData) {
    if (!dimensionData.ParcelDimensionID) {
      return {
        success: false,
        message: 'ParcelDimensionID is required for UPDATE',
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(dimensionData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        parcelDimensionId: dimensionData.ParcelDimensionID,
        newParcelDimensionId: null,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', dimensionData);
  }

  static async deletePInvoiceParcelPalletDimensions(dimensionData) {
    if (!dimensionData.ParcelDimensionID) {
      return {
        success: false,
        message: 'ParcelDimensionID is required for DELETE',
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(dimensionData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        parcelDimensionId: dimensionData.ParcelDimensionID,
        newParcelDimensionId: null,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', dimensionData);
  }

  static async getPInvoiceParcelPalletDimensions(dimensionData) {
    if (!dimensionData.ParcelDimensionID) {
      return {
        success: false,
        message: 'ParcelDimensionID is required for SELECT',
        data: null,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', dimensionData);
  }

  static async getAllPInvoiceParcelPalletDimensions(paginationData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;
      if (pageNumber < 1) throw new Error('PageNumber must be greater than 0');
      if (pageSize < 1 || pageSize > 100) throw new Error('PageSize must be between 1 and 100');

      const [result] = await connection.query(
        'SELECT * FROM dbo_tblpinvoiceparcelpalletdimensions LIMIT ? OFFSET ?',
        [pageSize, (pageNumber - 1) * pageSize]
      );

      const [[{ totalRecords }]] = await connection.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblpinvoiceparcelpalletdimensions'
      );

      return {
        success: true,
        message: 'Records retrieved successfully.',
        data: result,
        totalRecords: totalRecords || 0,
        parcelDimensionId: null,
        newParcelDimensionId: null,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database error in getAllPInvoiceParcelPalletDimensions:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = PInvoiceParcelPalletDimensionsModel;
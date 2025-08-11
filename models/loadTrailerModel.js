const poolPromise = require('../config/db.config');

class LoadTrailerModel {
  static async #executeManageStoredProcedure(action, loadTrailerData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        loadTrailerData.LoadTrailerID ? parseInt(loadTrailerData.LoadTrailerID) : null,
        loadTrailerData.LoadID ? parseInt(loadTrailerData.LoadID) : null,
        loadTrailerData.TrailerID ? parseInt(loadTrailerData.TrailerID) : null,
        loadTrailerData.TrailerRegistrationNumber || null,
        loadTrailerData.TrailerLength ? parseFloat(loadTrailerData.TrailerLength) : null,
        loadTrailerData.TrailerWidth ? parseFloat(loadTrailerData.TrailerWidth) : null,
        loadTrailerData.TrailerHeight ? parseFloat(loadTrailerData.TrailerHeight) : null,
        loadTrailerData.MaxAllowableVolume ? parseFloat(loadTrailerData.MaxAllowableVolume) : null,
        loadTrailerData.MaxAllowableWeight ? parseFloat(loadTrailerData.MaxAllowableWeight) : null,
        loadTrailerData.CreatedByID ? parseInt(loadTrailerData.CreatedByID) : null,
        loadTrailerData.DeletedByID ? parseInt(loadTrailerData.DeletedByID) : null,
        loadTrailerData.PageNumber ? parseInt(loadTrailerData.PageNumber) : 1,
        loadTrailerData.PageSize ? parseInt(loadTrailerData.PageSize) : 10,
      ];

      console.log(`[${new Date().toISOString()}] Executing SP_ManageLoadTrailer with ${queryParams.length} params:`, JSON.stringify(queryParams, null, 2));

      const [result] = await pool.query(
        'CALL SP_ManageLoadTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadTrailerID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewLoadTrailerID AS newLoadTrailerID'
      );

      console.log(`[${new Date().toISOString()}] Stored procedure output for ${action}:`, JSON.stringify(outParams, null, 2));

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation completed` : 'Operation failed'),
        data: action === 'SELECT' ? (loadTrailerData.LoadTrailerID ? (result[0]?.[0] || null) : (result[0] || [])) : null,
        loadTrailerId: loadTrailerData.LoadTrailerID,
        newLoadTrailerId: outParams.newLoadTrailerID ? parseInt(outParams.newLoadTrailerID) : null,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(loadTrailerData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (!loadTrailerData.CreatedByID) {
        errors.push('CreatedByID is required');
      }
      if (!loadTrailerData.TrailerID) {
        errors.push('TrailerID is required');
      }
      if (loadTrailerData.LoadID) {
        const [loadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblload WHERE LoadID = ? AND IsDeleted = 0',
          [parseInt(loadTrailerData.LoadID)]
        );
        if (loadCheck.length === 0) errors.push(`LoadID ${loadTrailerData.LoadID} does not exist`);
      }
      if (loadTrailerData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(loadTrailerData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${loadTrailerData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE') {
      if (loadTrailerData.DeletedByID) {
        const [deletedByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(loadTrailerData.DeletedByID)]
        );
        if (deletedByCheck.length === 0) errors.push(`DeletedByID ${loadTrailerData.DeletedByID} does not exist`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createLoadTrailer(loadTrailerData) {
    const requiredFields = ['CreatedByID', 'TrailerID'];
    const missingFields = requiredFields.filter(field => !loadTrailerData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(loadTrailerData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', loadTrailerData);
  }

  static async updateLoadTrailer(loadTrailerData) {
    if (!loadTrailerData.LoadTrailerID) {
      return {
        success: false,
        message: 'LoadTrailerID is required for UPDATE',
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(loadTrailerData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        loadTrailerId: loadTrailerData.LoadTrailerID,
        newLoadTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', loadTrailerData);
  }

  static async deleteLoadTrailer(loadTrailerData) {
    if (!loadTrailerData.LoadTrailerID) {
      return {
        success: false,
        message: 'LoadTrailerID is required for DELETE',
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(loadTrailerData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        loadTrailerId: loadTrailerData.LoadTrailerID,
        newLoadTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', loadTrailerData);
  }

  static async getLoadTrailer(loadTrailerData) {
    if (!loadTrailerData.LoadTrailerID) {
      return {
        success: false,
        message: 'LoadTrailerID is required for SELECT',
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', loadTrailerData);
  }

  static async getAllLoadTrailers(paginationData) {
    try {
      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;

      if (pageNumber < 1) {
        return {
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          totalRecords: 0,
          loadTrailerId: null,
          newLoadTrailerId: null,
        };
      }
      if (pageSize < 1 || pageSize > 100) {
        return {
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          loadTrailerId: null,
          newLoadTrailerId: null,
        };
      }

      const result = await this.#executeManageStoredProcedure('SELECT', {
        ...paginationData,
        LoadTrailerID: null,
      });

      const pool = await poolPromise;
      const [[{ totalRecords }]] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblloadtrailer'
      );

      return {
        ...result,
        totalRecords: totalRecords || 0,
      };
    } catch (error) {
      console.error('Database error in getAllLoadTrailers:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        loadTrailerId: null,
        newLoadTrailerId: null,
      };
    }
  }
}

module.exports = LoadTrailerModel;
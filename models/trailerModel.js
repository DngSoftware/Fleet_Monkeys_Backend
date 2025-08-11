const poolPromise = require('../config/db.config');

class TrailerModel {
  static async #executeManageStoredProcedure(action, trailerData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        trailerData.TrailerID ? parseInt(trailerData.TrailerID) : null,
        trailerData.TrailerType || null,
        trailerData.MaxWeight ? parseFloat(trailerData.MaxWeight) : null,
        trailerData.TrailerLength ? parseFloat(trailerData.TrailerLength) : null,
        trailerData.TrailerWidth ? parseFloat(trailerData.TrailerWidth) : null,
        trailerData.TrailerHeight ? parseFloat(trailerData.TrailerHeight) : null,
        trailerData.TrailerRegistrationNumber || null,
        trailerData.MaxAllowableVolume ? parseFloat(trailerData.MaxAllowableVolume) : null,
        trailerData.MaxAllowableWeight ? parseFloat(trailerData.MaxAllowableWeight) : null,
        trailerData.CreatedByID ? parseInt(trailerData.CreatedByID) : null,
        trailerData.DeletedByID ? parseInt(trailerData.DeletedByID) : null,
        trailerData.PageNumber ? parseInt(trailerData.PageNumber) : 1,
        trailerData.PageSize ? parseInt(trailerData.PageSize) : 10,
      ];

      console.log(`[${new Date().toISOString()}] Executing SP_ManageTrailer with ${queryParams.length} params:`, JSON.stringify(queryParams, null, 2));

      const [result] = await pool.query(
        'CALL SP_ManageTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewTrailerID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewTrailerID AS newTrailerID'
      );

      console.log(`[${new Date().toISOString()}] Stored procedure output for ${action}:`, JSON.stringify(outParams, null, 2));

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation completed` : 'Operation failed'),
        data: action === 'SELECT' ? (trailerData.TrailerID ? (result[0]?.[0] || null) : (result[0] || [])) : null,
        trailerId: trailerData.TrailerID,
        newTrailerId: outParams.newTrailerID ? parseInt(outParams.newTrailerID) : null,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(trailerData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (!trailerData.CreatedByID) {
        errors.push('CreatedByID is required');
      }
      const [createdByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
        [parseInt(trailerData.CreatedByID)]
      );
      if (createdByCheck.length === 0) errors.push(`CreatedByID ${trailerData.CreatedByID} does not exist`);
    }

    if (action === 'DELETE') {
      if (trailerData.DeletedByID) {
        const [deletedByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(trailerData.DeletedByID)]
        );
        if (deletedByCheck.length === 0) errors.push(`DeletedByID ${trailerData.DeletedByID} does not exist`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createTrailer(trailerData) {
    const requiredFields = ['CreatedByID'];
    const missingFields = requiredFields.filter(field => !trailerData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        trailerId: null,
        newTrailerId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(trailerData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        trailerId: null,
        newTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', trailerData);
  }

  static async updateTrailer(trailerData) {
    if (!trailerData.TrailerID) {
      return {
        success: false,
        message: 'TrailerID is required for UPDATE',
        data: null,
        trailerId: null,
        newTrailerId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(trailerData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        trailerId: trailerData.TrailerID,
        newTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', trailerData);
  }

  static async deleteTrailer(trailerData) {
    if (!trailerData.TrailerID) {
      return {
        success: false,
        message: 'TrailerID is required for DELETE',
        data: null,
        trailerId: null,
        newTrailerId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(trailerData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        trailerId: trailerData.TrailerID,
        newTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', trailerData);
  }

  static async getTrailer(trailerData) {
    if (!trailerData.TrailerID) {
      return {
        success: false,
        message: 'TrailerID is required for SELECT',
        data: null,
        trailerId: null,
        newTrailerId: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', trailerData);
  }

  static async getAllTrailers(paginationData) {
    try {
      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;

      if (pageNumber < 1) {
        return {
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          totalRecords: 0,
          trailerId: null,
          newTrailerId: null,
        };
      }
      if (pageSize < 1 || pageSize > 100) {
        return {
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          trailerId: null,
          newTrailerId: null,
        };
      }

      const result = await this.#executeManageStoredProcedure('SELECT', {
        ...paginationData,
        TrailerID: null,
      });

      const pool = await poolPromise;
      const [[{ totalRecords }]] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tbltrailer WHERE IsDeleted = 0 OR IsDeleted IS NULL'
      );

      return {
        ...result,
        totalRecords: totalRecords || 0,
      };
    } catch (error) {
      console.error('Database error in getAllTrailers:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        trailerId: null,
        newTrailerId: null,
      };
    }
  }
}

module.exports = TrailerModel;
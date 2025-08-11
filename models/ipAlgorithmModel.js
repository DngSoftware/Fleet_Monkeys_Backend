const poolPromise = require('../config/db.config');

class IPAlgorithmModel {
  static async #executeManageStoredProcedure(action, ipAlgorithmData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        ipAlgorithmData.IPAlgorithmID ? parseInt(ipAlgorithmData.IPAlgorithmID) : null,
        ipAlgorithmData.ProfitPercent != null ? parseFloat(ipAlgorithmData.ProfitPercent) : null,
        ipAlgorithmData.TransportPercent != null ? parseFloat(ipAlgorithmData.TransportPercent) : null,
        ipAlgorithmData.AdditionalPercent != null ? parseFloat(ipAlgorithmData.AdditionalPercent) : null,
        ipAlgorithmData.SupplierExchangeAmount != null ? parseFloat(ipAlgorithmData.SupplierExchangeAmount) : null,
        ipAlgorithmData.SalesAmount != null ? parseFloat(ipAlgorithmData.SalesAmount) : null,
        ipAlgorithmData.ProfitAmount != null ? parseFloat(ipAlgorithmData.ProfitAmount) : null,
        ipAlgorithmData.TransportAmount != null ? parseFloat(ipAlgorithmData.TransportAmount) : null,
        ipAlgorithmData.AdditionalAmount != null ? parseFloat(ipAlgorithmData.AdditionalAmount) : null,
        ipAlgorithmData.CreatedByID ? parseInt(ipAlgorithmData.CreatedByID) : null,
        ipAlgorithmData.DeletedByID ? parseInt(ipAlgorithmData.DeletedByID) : null,
        ipAlgorithmData.PageNumber ? parseInt(ipAlgorithmData.PageNumber) : 1,
        ipAlgorithmData.PageSize ? parseInt(ipAlgorithmData.PageSize) : 10,
      ];

      console.log(`Executing SP_ManageIPAlgorithm with action: ${action}, params:`, queryParams);

      const [result] = await pool.query(
        'CALL SP_ManageIPAlgorithm(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewIPAlgorithm_ID, @p_TotalRecords)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewIPAlgorithm_ID AS newIPAlgorithmID, @p_TotalRecords AS totalRecords'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' && result[0] ? result[0] : null,
        ipAlgorithmID: ipAlgorithmData.IPAlgorithmID,
        newIPAlgorithmID: outParams.newIPAlgorithmID,
        totalRecords: outParams.totalRecords != null && outParams.totalRecords >= 0 ? outParams.totalRecords : 0,
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(ipAlgorithmData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (ipAlgorithmData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(ipAlgorithmData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${ipAlgorithmData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE' && ipAlgorithmData.DeletedByID) {
      const [deletedByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
        [parseInt(ipAlgorithmData.DeletedByID)]
      );
      if (deletedByCheck.length === 0) errors.push(`DeletedByID ${ipAlgorithmData.DeletedByID} does not exist`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createIPAlgorithm(ipAlgorithmData) {
    const requiredFields = ['CreatedByID'];
    const missingFields = requiredFields.filter(field => !ipAlgorithmData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(ipAlgorithmData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', ipAlgorithmData);
  }

  static async updateIPAlgorithm(ipAlgorithmData) {
    if (!ipAlgorithmData.IPAlgorithmID) {
      return {
        success: false,
        message: 'IPAlgorithmID is required for UPDATE',
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(ipAlgorithmData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        ipAlgorithmID: ipAlgorithmData.IPAlgorithmID,
        newIPAlgorithmID: null,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', ipAlgorithmData);
  }

  static async deleteIPAlgorithm(ipAlgorithmData) {
    if (!ipAlgorithmData.IPAlgorithmID) {
      return {
        success: false,
        message: 'IPAlgorithmID is required for DELETE',
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(ipAlgorithmData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        ipAlgorithmID: ipAlgorithmData.IPAlgorithmID,
        newIPAlgorithmID: null,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', ipAlgorithmData);
  }

  static async getIPAlgorithm(ipAlgorithmData) {
    if (!ipAlgorithmData.IPAlgorithmID) {
      return {
        success: false,
        message: 'IPAlgorithmID is required for SELECT',
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', ipAlgorithmData);
  }

  static async getAllIPAlgorithms(paginationData) {
    try {
      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;

      if (pageNumber < 1) {
        throw new Error('PageNumber must be greater than 0');
      }
      if (pageSize < 1 || pageSize > 100) {
        throw new Error('PageSize must be between 1 and 100');
      }

      return await this.#executeManageStoredProcedure('SELECT', { ...paginationData, IPAlgorithmID: null });
    } catch (error) {
      console.error('Database error in getAllIPAlgorithms:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
        totalRecords: 0,
      };
    }
  }
}

module.exports = IPAlgorithmModel;
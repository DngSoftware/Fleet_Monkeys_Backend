const poolPromise = require('../config/db.config');

class LoadModel {
  static async #executeManageStoredProcedure(action, loadData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        loadData.LoadID ? parseInt(loadData.LoadID) : null,
        loadData.LoadCode || null,
        loadData.DriverID ? parseInt(loadData.DriverID) : null,
        loadData.VehicleID ? parseInt(loadData.VehicleID) : null,
        loadData.CompanyID ? parseInt(loadData.CompanyID) : null,
        loadData.OriginWarehouseID ? parseInt(loadData.OriginWarehouseID) : null,
        loadData.DestinationAddressID ? parseInt(loadData.DestinationAddressID) : null,
        loadData.DestinationWarehouseID ? parseInt(loadData.DestinationWarehouseID) : null,
        loadData.AvailableToLoadDateTime ? new Date(loadData.AvailableToLoadDateTime) : null,
        loadData.LoadStartDate ? new Date(loadData.LoadStartDate) : null,
        loadData.LoadStatusID ? parseInt(loadData.LoadStatusID) : null,
        loadData.LoadTypeID ? parseInt(loadData.LoadTypeID) : null,
        loadData.SortOrderID ? parseInt(loadData.SortOrderID) : null,
        loadData.Weight ? parseFloat(loadData.Weight) : null,
        loadData.Volume ? parseFloat(loadData.Volume) : null,
        loadData.WeightUOMID ? parseInt(loadData.WeightUOMID) : null,
        loadData.VolumeUOMID ? parseInt(loadData.VolumeUOMID) : null,
        loadData.RepackagedPalletOrTobaccoID ? parseInt(loadData.RepackagedPalletOrTobaccoID) : null,
        loadData.CreatedByID ? parseInt(loadData.CreatedByID) : null,
        loadData.DeletedByID ? parseInt(loadData.DeletedByID) : null,
        loadData.PageNumber ? parseInt(loadData.PageNumber) : 1,
        loadData.PageSize ? parseInt(loadData.PageSize) : 10,
        loadData.FromDate ? new Date(loadData.FromDate) : null,
        loadData.ToDate ? new Date(loadData.ToDate) : null,
      ];

      console.log(`[${new Date().toISOString()}] Executing SP_ManageLoad with ${queryParams.length} params:`, JSON.stringify(queryParams, null, 2));

      const [result] = await pool.query(
        'CALL SP_ManageLoad(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadID, @p_DriverName, @p_VehicleNumber, @p_CompanyName, @p_OriginWarehouseName, @p_DestinationWarehouseName)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewLoadID AS newLoadID, @p_DriverName AS driverName, @p_VehicleNumber AS vehicleNumber, @p_CompanyName AS companyName, @p_OriginWarehouseName AS originWarehouseName, @p_DestinationWarehouseName AS destinationWarehouseName'
      );

      console.log(`[${new Date().toISOString()}] Stored procedure output for ${action}:`, JSON.stringify(outParams, null, 2));

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation completed` : 'Operation failed'),
        data: action === 'SELECTBYID' ? (result[0]?.[0] || null) : action === 'SELECTALL' ? (result[0] || []) : null,
        loadId: loadData.LoadID,
        newLoadId: outParams.newLoadID ? parseInt(outParams.newLoadID) : null,
        totalRecords: action === 'GETCOUNT' ? (result[0]?.[0]?.TotalRecords || 0) : 0,
        driverName: outParams.driverName || null,
        vehicleNumber: outParams.vehicleNumber || null,
        companyName: outParams.companyName || null,
        originWarehouseName: outParams.originWarehouseName || null,
        destinationWarehouseName: outParams.destinationWarehouseName || null,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(loadData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (!loadData.CreatedByID) {
        errors.push('CreatedByID is required');
      }
      if (action === 'INSERT' && (!loadData.LoadStatusID || !loadData.LoadTypeID)) {
        errors.push('LoadStatusID and LoadTypeID are required for INSERT');
      }

      if (loadData.DriverID) {
        const [driverCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(loadData.DriverID)]
        );
        if (driverCheck.length === 0) errors.push(`DriverID ${loadData.DriverID} does not exist`);
      }
      if (loadData.VehicleID) {
        const [vehicleCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblvehicle WHERE VehicleID = ? AND IsDeleted = 0',
          [parseInt(loadData.VehicleID)]
        );
        if (vehicleCheck.length === 0) errors.push(`VehicleID ${loadData.VehicleID} does not exist`);
      }
      if (loadData.CompanyID) {
        const [companyCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcompany WHERE CompanyID = ? AND IsDeleted = 0',
          [parseInt(loadData.CompanyID)]
        );
        if (companyCheck.length === 0) errors.push(`CompanyID ${loadData.CompanyID} does not exist`);
      }
      if (loadData.OriginWarehouseID) {
        const [originWarehouseCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblwarehouse WHERE WarehouseID = ? AND IsDeleted = 0',
          [parseInt(loadData.OriginWarehouseID)]
        );
        if (originWarehouseCheck.length === 0) errors.push(`OriginWarehouseID ${loadData.OriginWarehouseID} does not exist`);
      }
      if (loadData.DestinationWarehouseID) {
        const [destinationWarehouseCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblwarehouse WHERE WarehouseID = ? AND IsDeleted = 0',
          [parseInt(loadData.DestinationWarehouseID)]
        );
        if (destinationWarehouseCheck.length === 0) errors.push(`DestinationWarehouseID ${loadData.DestinationWarehouseID} does not exist`);
      }
      if (loadData.DestinationAddressID) {
        const [addressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ? AND IsDeleted = 0',
          [parseInt(loadData.DestinationAddressID)]
        );
        if (addressCheck.length === 0) errors.push(`DestinationAddressID ${loadData.DestinationAddressID} does not exist`);
      }
      if (loadData.RepackagedPalletOrTobaccoID) {
        const [repackagedCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblrepackagedpalletortobacco WHERE RepackagedPalletOrTobaccoID = ? AND IsDeleted = 0',
          [parseInt(loadData.RepackagedPalletOrTobaccoID)]
        );
        if (repackagedCheck.length === 0) errors.push(`RepackagedPalletOrTobaccoID ${loadData.RepackagedPalletOrTobaccoID} does not exist`);
      }
      if (loadData.WeightUOMID) {
        const [weightUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ? AND IsDeleted = 0',
          [parseInt(loadData.WeightUOMID)]
        );
        if (weightUOMCheck.length === 0) errors.push(`WeightUOMID ${loadData.WeightUOMID} does not exist`);
      }
      if (loadData.VolumeUOMID) {
        const [volumeUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ? AND IsDeleted = 0',
          [parseInt(loadData.VolumeUOMID)]
        );
        if (volumeUOMCheck.length === 0) errors.push(`VolumeUOMID ${loadData.VolumeUOMID} does not exist`);
      }
      if (loadData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(loadData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${loadData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE' || action === 'HARDDELETE') {
      if (loadData.DeletedByID) {
        const [deletedByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
          [parseInt(loadData.DeletedByID)]
        );
        if (deletedByCheck.length === 0) errors.push(`DeletedByID ${loadData.DeletedByID} does not exist`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createLoad(loadData) {
    const requiredFields = ['CreatedByID', 'LoadStatusID', 'LoadTypeID'];
    const missingFields = requiredFields.filter(field => !loadData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        loadId: null,
        newLoadId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(loadData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        loadId: null,
        newLoadId: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', loadData);
  }

  static async updateLoad(loadData) {
    if (!loadData.LoadID) {
      return {
        success: false,
        message: 'LoadID is required for UPDATE',
        data: null,
        loadId: null,
        newLoadId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(loadData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        loadId: loadData.LoadID,
        newLoadId: null,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', loadData);
  }

  static async deleteLoad(loadData) {
    if (!loadData.LoadID) {
      return {
        success: false,
        message: 'LoadID is required for DELETE',
        data: null,
        loadId: null,
        newLoadId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(loadData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        loadId: loadData.LoadID,
        newLoadId: null,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', loadData);
  }

  static async hardDeleteLoad(loadData) {
    if (!loadData.LoadID) {
      return {
        success: false,
        message: 'LoadID is required for HARDDELETE',
        data: null,
        loadId: null,
        newLoadId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(loadData, 'HARDDELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        loadId: loadData.LoadID,
        newLoadId: null,
      };
    }

    return await this.#executeManageStoredProcedure('HARDDELETE', loadData);
  }

  static async getLoad(loadData) {
    if (!loadData.LoadID) {
      return {
        success: false,
        message: 'LoadID is required for SELECTBYID',
        data: null,
        loadId: null,
        newLoadId: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECTBYID', loadData);
  }

  static async getAllLoads(paginationData) {
    try {
      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;

      if (pageNumber < 1) {
        return {
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          totalRecords: 0,
          loadId: null,
          newLoadId: null,
        };
      }
      if (pageSize < 1 || pageSize > 100) {
        return {
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          loadId: null,
          newLoadId: null,
        };
      }

      const result = await this.#executeManageStoredProcedure('SELECTALL', {
        ...paginationData,
        LoadID: null,
      });

      return {
        ...result,
        totalRecords: (await this.#executeManageStoredProcedure('GETCOUNT', {
          ...paginationData,
          LoadID: null,
        })).totalRecords,
      };
    } catch (error) {
      console.error('Database error in getAllLoads:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        loadId: null,
        newLoadId: null,
      };
    }
  }
}

module.exports = LoadModel;
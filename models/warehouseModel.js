const poolPromise = require('../config/db.config');

class WarehouseModel {
  static async getAllWarehouses({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate date parameters
      let formattedFromDate = null, formattedToDate = null;
      if (fromDate) {
        formattedFromDate = new Date(fromDate);
        if (isNaN(formattedFromDate)) throw new Error('Invalid fromDate');
      }
      if (toDate) {
        formattedToDate = new Date(toDate);
        if (isNaN(formattedToDate)) throw new Error('Invalid toDate');
      }
      if (formattedFromDate && formattedToDate && formattedFromDate > formattedToDate) {
        throw new Error('fromDate cannot be later than toDate');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null,
        formattedToDate ? formattedToDate.toISOString().split('T')[0] : null
      ];

      console.log('getAllWarehouses params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_GetAllWarehouses(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllWarehouses results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllWarehouses output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null || output[0].p_Message === null) {
        throw new Error(`Invalid output from SP_GetAllWarehouses: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to retrieve warehouses');
      }

      // Extract totalRecords from the second result set
      const totalRecords = Array.isArray(results[1]) && results[1][0]?.TotalRecords ? results[1][0].TotalRecords : 0;

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllWarehouses error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async createWarehouse(data) {
    try {
      const pool = await poolPromise;

      // Validate input
      if (!data.warehouseName || typeof data.warehouseName !== 'string' || data.warehouseName.trim() === '') {
        throw new Error('Valid warehouseName is required');
      }
      if (!data.createdById || isNaN(parseInt(data.createdById))) {
        throw new Error('Valid createdById is required');
      }

      const queryParams = [
        'INSERT',
        null,
        data.warehouseName.trim(),
        data.warehouseAddressId ? parseInt(data.warehouseAddressId) : null,
        parseInt(data.createdById),
        data.deletedById ? parseInt(data.deletedById) : null
      ];

      console.log('createWarehouse params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageWarehouse(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('createWarehouse results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('createWarehouse output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null || output[0].p_Message === null) {
        throw new Error(`Invalid output from SP_ManageWarehouse: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0 && output[0].p_Message.includes('successfully')) {
        console.warn('SP_ManageWarehouse returned non-zero p_Result with success message:', output[0].p_Message);
        const warehouseIdMatch = output[0].p_Message.match(/ID: (\d+)/);
        const warehouseId = warehouseIdMatch ? parseInt(warehouseIdMatch[1]) : null;
        return {
          warehouseId,
          message: output[0].p_Message || 'Warehouse created successfully',
          data: {
            warehouseName: data.warehouseName,
            warehouseAddressId: data.warehouseAddressId,
            createdById: data.createdById
          }
        };
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to create warehouse');
      }

      const warehouseIdMatch = output[0].p_Message.match(/ID: (\d+)/);
      const warehouseId = warehouseIdMatch ? parseInt(warehouseIdMatch[1]) : null;

      return {
        warehouseId,
        message: output[0].p_Message || 'Warehouse created successfully',
        data: {
          warehouseName: data.warehouseName,
          warehouseAddressId: data.warehouseAddressId,
          createdById: data.createdById
        }
      };
    } catch (err) {
      console.error('createWarehouse error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async getWarehouseById(id) {
    try {
      const pool = await poolPromise;

      const warehouseId = parseInt(id, 10);
      if (isNaN(warehouseId)) {
        throw new Error('Valid warehouseId is required');
      }

      const queryParams = ['SELECT', warehouseId, null, null, null, null];

      console.log('getWarehouseById params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageWarehouse(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getWarehouseById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getWarehouseById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null || output[0].p_Message === null) {
        throw new Error(`Invalid output from SP_ManageWarehouse: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0 && output[0].p_Message.includes('successfully')) {
        console.warn('SP_ManageWarehouse returned non-zero p_Result with success message:', output[0].p_Message);
        return Array.isArray(results[0]) && results[0].length > 0 ? results[0][0] : null;
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Warehouse not found');
      }

      return Array.isArray(results[0]) && results[0].length > 0 ? results[0][0] : null;
    } catch (err) {
      console.error('getWarehouseById error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async updateWarehouse(id, data) {
    try {
      const pool = await poolPromise;

      const warehouseId = parseInt(id, 10);
      if (isNaN(warehouseId)) {
        throw new Error('Valid warehouseId is required');
      }
      if (!data.warehouseName || typeof data.warehouseName !== 'string' || data.warehouseName.trim() === '') {
        throw new Error('Valid warehouseName is required');
      }
      if (!data.warehouseAddressId || isNaN(parseInt(data.warehouseAddressId))) {
        throw new Error('Valid warehouseAddressId is required');
      }
      if (!data.createdById || isNaN(parseInt(data.createdById))) {
        throw new Error('Valid createdById is required');
      }

      const queryParams = [
        'UPDATE',
        warehouseId,
        data.warehouseName.trim(),
        parseInt(data.warehouseAddressId),
        parseInt(data.createdById),
        null
      ];

      console.log('updateWarehouse params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageWarehouse(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('updateWarehouse results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateWarehouse output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null || output[0].p_Message === null) {
        throw new Error(`Invalid output from SP_ManageWarehouse: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0 && output[0].p_Message.includes('Warehouse updated successfully')) {
        console.warn('SP_ManageWarehouse returned non-zero p_Result with success message:', output[0].p_Message);
        return {
          message: 'Warehouse updated successfully'
        };
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to update warehouse');
      }

      return {
        message: output[0].p_Message || 'Warehouse updated successfully'
      };
    } catch (err) {
      console.error('updateWarehouse error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  static async deleteWarehouse(id, createdById) {
    try {
      const pool = await poolPromise;

      const warehouseId = parseInt(id, 10);
      const validatedCreatedById = parseInt(createdById, 10);
      if (isNaN(warehouseId)) {
        throw new Error('Valid warehouseId is required');
      }
      if (isNaN(validatedCreatedById)) {
        throw new Error('Valid createdById is required');
      }

      const queryParams = ['DELETE', warehouseId, null, null, validatedCreatedById, validatedCreatedById];

      console.log('deleteWarehouse params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageWarehouse(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('deleteWarehouse results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteWarehouse output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null || output[0].p_Message === null) {
        throw new Error(`Invalid output from SP_ManageWarehouse: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0 && output[0].p_Message.includes('successfully')) {
        console.warn('SP_ManageWarehouse returned non-zero p_Result with success message:', output[0].p_Message);
        return {
          message: output[0].p_Message || 'Warehouse deleted successfully'
        };
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to delete warehouse');
      }

      return {
        message: output[0].p_Message || 'Warehouse deleted successfully'
      };
    } catch (err) {
      console.error('deleteWarehouse error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = WarehouseModel;
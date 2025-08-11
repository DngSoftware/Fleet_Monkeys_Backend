const poolPromise = require('../config/db.config');

class LoadModel {
  // Get paginated Loads
  static async getAllLoads({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      pageNumber = parseInt(pageNumber, 10);
      pageSize = parseInt(pageSize, 10);
      if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
      if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) pageSize = 10;

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

      const offset = (pageNumber - 1) * pageSize;
      let query = `
        SELECT l.*, 
               p.FirstName AS DriverName, 
               v.VehicleID, 
               c.CompanyID, 
               ow.WarehouseName AS OriginWarehouseName, 
               dw.WarehouseName AS DestinationWarehouseName
        FROM dbo_tblload l
        LEFT JOIN dbo_tblperson p ON l.DriverID = p.PersonID
        LEFT JOIN dbo_tblvehicle v ON l.VehicleID = v.VehicleID
        LEFT JOIN dbo_tblcompany c ON l.CompanyID = c.CompanyID
        LEFT JOIN dbo_tblwarehouse ow ON l.OriginWarehouseID = ow.WarehouseID
        LEFT JOIN dbo_tblwarehouse dw ON l.DestinationWarehouseID = dw.WarehouseID
        WHERE l.IsDeleted = 0
      `;
      const queryParams = [];

      if (formattedFromDate) {
        query += ' AND l.CreatedDateTime >= ?';
        queryParams.push(formattedFromDate.toISOString().split('T')[0]);
      }
      if (formattedToDate) {
        query += ' AND l.CreatedDateTime <= ?';
        queryParams.push(formattedToDate.toISOString().split('T')[0]);
      }

      query += ' ORDER BY l.LoadID LIMIT ? OFFSET ?';
      queryParams.push(pageSize, offset);

      console.log('getAllLoads query:', query);
      console.log('getAllLoads params:', queryParams);

      const [results] = await pool.query(query, queryParams);

      console.log('getAllLoads results:', JSON.stringify(results, null, 2));

      const [totalResult] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblload WHERE IsDeleted = 0 ' +
        (formattedFromDate ? 'AND CreatedDateTime >= ? ' : '') +
        (formattedToDate ? 'AND CreatedDateTime <= ? ' : ''),
        [
          ...(formattedFromDate ? [formattedFromDate.toISOString().split('T')[0]] : []),
          ...(formattedToDate ? [formattedToDate.toISOString().split('T')[0]] : [])
        ]
      );

      const totalRecords = totalResult[0]?.totalRecords || 0;

      return {
        data: results,
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllLoads error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Load
  static async createLoad(data) {
    try {
      const pool = await poolPromise;

      // Log the incoming data for debugging
      console.log('createLoad input data:', JSON.stringify(data, null, 2));

      const queryParams = [
        'INSERT',
        null,
        data.loadCode || null,
        data.driverId || null,
        data.vehicleId || null,
        data.companyId || null,
        data.originWarehouseId || null,
        data.destinationAddressId || null,
        data.destinationWarehouseId || null,
        data.availableToLoadDateTime || null,
        data.loadStartDate || null,
        data.loadStatusId || null,
        data.loadTypeId || null,
        data.sortOrderId || null,
        data.weight || null,
        data.volume || null,
        data.weightUomId || null,
        data.volumeUomId || null,
        data.repackagedPalletOrTobaccoId || null,
        data.createdById,
        null
      ];

      console.log('createLoad params:', queryParams);

      await pool.query(
        'CALL SP_ManageLoad(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadID AS p_NewLoadID');

      console.log('createLoad output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoad');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Load');
      }

      return {
        loadId: output[0].p_NewLoadID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createLoad error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Load by ID
  static async getLoadById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
      ];

      console.log('getLoadById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageLoad(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadID)',
        queryParams
      );

      console.log('getLoadById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadID AS p_NewLoadID');

      console.log('getLoadById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoad');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Load not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getLoadById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Load
  static async updateLoad(id, data) {
    try {
      const pool = await poolPromise;

      console.log('updateLoad input data:', JSON.stringify(data, null, 2));

      const queryParams = [
        'UPDATE',
        id,
        data.loadCode || null,
        data.driverId || null,
        data.vehicleId || null,
        data.companyId || null,
        data.originWarehouseId || null,
        data.destinationAddressId || null,
        data.destinationWarehouseId || null,
        data.availableToLoadDateTime || null,
        data.loadStartDate || null,
        data.loadStatusId || null,
        data.loadTypeId || null,
        data.sortOrderId || null,
        data.weight || null,
        data.volume || null,
        data.weightUomId || null,
        data.volumeUomId || null,
        data.repackagedPalletOrTobaccoId || null,
        data.createdById,
        null
      ];

      console.log('updateLoad params:', queryParams);

      await pool.query(
        'CALL SP_ManageLoad(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadID AS p_NewLoadID');

      console.log('updateLoad output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoad');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Load');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateLoad error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Load
  static async deleteLoad(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, deletedById
      ];

      console.log('deleteLoad params:', queryParams);

      await pool.query(
        'CALL SP_ManageLoad(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadID AS p_NewLoadID');

      console.log('deleteLoad output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoad');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Load');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteLoad error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = LoadModel;
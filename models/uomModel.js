const poolPromise = require('../config/db.config');
const retry = require('async-retry');

class UOMModel {
  // Get paginated UOMs
  static async getAllUOMs({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      // Validate parameters
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1 || pageSize > 100) pageSize = 10;
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

      console.log('getAllUOMs params:', JSON.stringify(queryParams, null, 2));

      // Retry the stored procedure call
      const [results] = await retry(
        async () => {
          return await connection.query(
            'CALL SP_GetAllUOMs(?, ?, ?, ?, @p_TotalRecords, @p_Result, @p_Message)',
            queryParams
          );
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000,
          onRetry: (err, attempt) => {
            console.log(`getAllUOMs retry attempt ${attempt}: ${err.message}`);
          }
        }
      );

      console.log('getAllUOMs results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await connection.query(
        'SELECT @p_TotalRecords AS p_TotalRecords, @p_Result AS p_Result, @p_Message AS p_Message'
      );

      console.log('getAllUOMs output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_GetAllUOMs: ${JSON.stringify(output)}`);
      }

      // Handle non-zero p_Result more flexibly
      if (output[0].p_Result !== 0) {
        if (
          output[0].p_Message &&
          (output[0].p_Message.includes('successfully') || output[0].p_Message.includes('Success'))
        ) {
          console.warn(`Non-zero p_Result (${output[0].p_Result}) with success message: ${output[0].p_Message}`);
        } else {
          throw new Error(output[0].p_Message || 'Failed to retrieve UOMs');
        }
      }

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords: output[0].p_TotalRecords || 0,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil((output[0].p_TotalRecords || 0) / pageSize)
      };
    } catch (err) {
      console.error('getAllUOMs error:', {
        message: err.message,
        stack: err.stack,
        params: { pageNumber, pageSize, fromDate, toDate }
      });
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  // Create a new UOM
  static async createUOM(data) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      const queryParams = [
        'INSERT',
        null,
        data.uom,
        data.createdById,
        data.DeletedByID
      ];

      console.log('createUOM params:', JSON.stringify(queryParams, null, 2));

      const [results] = await retry(
        async () => {
          return await connection.query(
            'CALL SP_ManageUOM(?, ?, ?, ?, ?, @p_Result, @p_Message)',
            queryParams
          );
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000
        }
      );

      console.log('createUOM results:', JSON.stringify(results, null, 2));

      const [output] = await connection.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('createUOM output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageUOM: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to create UOM');
      }

      const uomIdMatch = output[0].p_Message.match(/ID: (\d+)/);
      const uomId = uomIdMatch ? parseInt(uomIdMatch[1]) : null;

      return {
        uomId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createUOM error:', {
        message: err.message,
        stack: err.stack,
        params: data
      });
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  // Get a single UOM by ID
  static async getUOMById(id) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      const queryParams = [
        'SELECT',
        id,
        null,
        null,
        null
      ];

      console.log('getUOMById params:', JSON.stringify(queryParams, null, 2));

      const [results] = await retry(
        async () => {
          return await connection.query(
            'CALL SP_ManageUOM(?, ?, ?, ?, ?, @p_Result, @p_Message)',
            queryParams
          );
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000
        }
      );

      console.log('getUOMById results:', JSON.stringify(results, null, 2));

      const [output] = await connection.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getUOMById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageUOM: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'UOM not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getUOMById error:', {
        message: err.message,
        stack: err.stack,
        params: { id }
      });
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  // Update a UOM
  static async updateUOM(id, data) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      const queryParams = [
        'UPDATE',
        id,
        data.uom,
        data.createdById,
        data.DeletedByID
      ];

      console.log('updateUOM params:', JSON.stringify(queryParams, null, 2));

      const [results] = await retry(
        async () => {
          return await connection.query(
            'CALL SP_ManageUOM(?, ?, ?, ?, ?, @p_Result, @p_Message)',
            queryParams
          );
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000
        }
      );

      console.log('updateUOM results:', JSON.stringify(results, null, 2));

      const [output] = await connection.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateUOM output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageUOM: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to update UOM');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateUOM error:', {
        message: err.message,
        stack: err.stack,
        params: { id, data }
      });
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  // Delete a UOM
  static async deleteUOM(id, createdById) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      const queryParams = [
        'DELETE',
        id,
        null,
        createdById,
        null
      ];

      console.log('deleteUOM params:', JSON.stringify(queryParams, null, 2));

      const [results] = await retry(
        async () => {
          return await connection.query(
            'CALL SP_ManageUOM(?, ?, ?, ?, ?, @p_Result, @p_Message)',
            queryParams
          );
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000
        }
      );

      console.log('deleteUOM results:', JSON.stringify(results, null, 2));

      const [output] = await connection.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteUOM output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageUOM: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to delete UOM');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteUOM error:', {
        message: err.message,
        stack: err.stack,
        params: { id, createdById }
      });
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = UOMModel;
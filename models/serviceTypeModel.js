const poolPromise = require('../config/db.config');

class ServiceTypeModel {
  // Get paginated Service Types
  static async getAllServiceTypes({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1 || pageSize > 100) pageSize = 10; // Cap pageSize at 100
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

      console.log('getAllServiceTypes params:', JSON.stringify(queryParams, null, 2));

      // Call SP_GetAllServiceType
      const [results] = await pool.query(
        'CALL SP_GetAllServiceType(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllServiceTypes results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllServiceTypes output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllServiceType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve service types');
      }

      // Since SP_GetAllServiceType does not return totalRecords, use the length of the data
      const totalRecords = Array.isArray(results[0]) ? results[0].length : 0;

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllServiceTypes error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Service Type
  static async createServiceType(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_ServiceTypeID
        data.serviceGroup,
        data.serviceType,
        data.createdById
      ];

      // Log query parameters
      console.log('createServiceType params:', queryParams);

      // Call SP_ManageServiceType with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageServiceType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters, including p_ServiceTypeID
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_ServiceTypeID AS p_ServiceTypeID');

      // Log output
      console.log('createServiceType output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageServiceType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Service Type');
      }

      return {
        serviceTypeId: output[0].p_ServiceTypeID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createServiceType error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Service Type by ID
  static async getServiceTypeById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_ServiceGroup
        null, // p_ServiceType
        null  // p_CreatedByID
      ];

      // Log query parameters
      console.log('getServiceTypeById params:', queryParams);

      // Call SP_ManageServiceType with session variables for OUT parameters
      const [results] = await pool.query(
        'CALL SP_ManageServiceType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getServiceTypeById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getServiceTypeById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageServiceType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Service Type not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getServiceTypeById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Service Type
  static async updateServiceType(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.serviceGroup,
        data.serviceType,
        data.createdById
      ];

      // Log query parameters
      console.log('updateServiceType params:', queryParams);

      // Call SP_ManageServiceType with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageServiceType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateServiceType output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageServiceType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Service Type');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateServiceType error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Service Type
  static async deleteServiceType(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_ServiceGroup
        null, // p_ServiceType
        createdById
      ];

      // Log query parameters
      console.log('deleteServiceType params:', queryParams);

      // Call SP_ManageServiceType with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageServiceType(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deleteServiceType output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageServiceType');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Service Type');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteServiceType error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = ServiceTypeModel;
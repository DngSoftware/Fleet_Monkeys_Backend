const poolPromise = require('../config/db.config');

class VehicleModel {
  // Get paginated Vehicles
  static async getAllVehicles({ pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10
      ];

      // Log query parameters
      console.log('getAllVehicles params:', queryParams);

      // Call SP_GetAllVehicles with session variables for OUT parameters
      const [results] = await pool.query(
        'CALL SP_GetAllVehicles(?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllVehicles results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getAllVehicles output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllVehicles');
      }

      if (output[0].p_Result !== 0) {
        throw new Error(output[0].p_Message || 'Failed to retrieve Vehicles');
      }

      return {
        data: results[0] || [],
        totalRecords: null // SP does not return total count
      };
    } catch (err) {
      console.error('getAllVehicles error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Vehicle
  static async createVehicle(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_VehicleID
        data.truckNumberPlate,
        data.vin,
        data.companyId,
        data.maxWeight,
        data.maxVolume,
        data.length,
        data.width,
        data.height,
        data.vehicleTypeId,
        data.numberOfWheels,
        data.numberOfAxels,
        data.createdById,
        null // p_DeletedByID
      ];

      // Log query parameters
      console.log('createVehicle params:', queryParams);

      // Call SP_ManageVehicle with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageVehicle(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters, including p_VehicleID
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_VehicleID AS p_VehicleID');

      // Log output
      console.log('createVehicle output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageVehicle');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Vehicle');
      }

      return {
        vehicleId: output[0].p_VehicleID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createVehicle error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Vehicle by ID
  static async getVehicleById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_TruckNumberPlate
        null, // p_VIN
        null, // p_CompanyID
        null, // p_MaxWeight
        null, // p_MaxVolume
        null, // p_Length
        null, // p_Width
        null, // p_Height
        null, // p_VehicleTypeID
        null, // p_NumberOfWheels
        null, // p_NumberOfAxels
        null, // p_CreatedByID
        null  // p_DeletedByID
      ];

      // Log query parameters
      console.log('getVehicleById params:', queryParams);

      // Call SP_ManageVehicle with session variables for OUT parameters
      const [results] = await pool.query(
        'CALL SP_ManageVehicle(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getVehicleById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getVehicleById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageVehicle');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Vehicle not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getVehicleById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Vehicle
  static async updateVehicle(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.truckNumberPlate,
        data.vin,
        data.companyId,
        data.maxWeight,
        data.maxVolume,
        data.length,
        data.width,
        data.height,
        data.vehicleTypeId,
        data.numberOfWheels,
        data.numberOfAxels,
        data.createdById,
        null // p_DeletedByID
      ];

      // Log query parameters
      console.log('updateVehicle params:', queryParams);

      // Call SP_ManageVehicle with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageVehicle(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateVehicle output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageVehicle');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Vehicle');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateVehicle error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Vehicle
  static async deleteVehicle(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_TruckNumberPlate
        null, // p_VIN
        null, // p_CompanyID
        null, // p_MaxWeight
        null, // p_MaxVolume
        null, // p_Length
        null, // p_Width
        null, // p_Height
        null, // p_VehicleTypeID
        null, // p_NumberOfWheels
        null, // p_NumberOfAxels
        null, // p_CreatedByID
        deletedById
      ];

      // Log query parameters
      console.log('deleteVehicle params:', queryParams);

      // Call SP_ManageVehicle with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageVehicle(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deleteVehicle output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageVehicle');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Vehicle');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteVehicle error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = VehicleModel;
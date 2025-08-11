const poolPromise = require('../config/db.config');

class CityModel {
  // Get paginated Cities
 // Get paginated Cities
  static async getAllCities({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
        formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        formattedToDate ? formattedToDate.toISOString().split('T')[0] : null
      ];

      // Log query parameters
      console.log('getAllCities params:', queryParams);

      // Call SP_GetAllCities
      const [results] = await pool.query(
        'CALL SP_GetAllCities(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllCities results:', JSON.stringify(results, null, 2));

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('getAllCities output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllCities');
      }

      if (outParams.StatusCode !== 0) {
        throw new Error(outParams.Message || 'Failed to retrieve Cities');
      }

      // Extract total count from the second result set
      const totalRecords = results[1]?.[0]?.TotalRecords || 0;

      return {
        data: results[0] || [],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllCities error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new City
  static async createCity(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_CityID
        data.cityName,
        data.countryId || null,
        data.createdById
      ];

      // Call sp_ManageCity
      const [results] = await pool.query(
        'CALL sp_ManageCity(?, ?, ?, ?, ?)',
        queryParams
      );

      // Extract Result and Message
      const resultRow = results[0][0];
      if (resultRow.Result !== 1) {
        throw new Error(resultRow.Message || 'Failed to create City');
      }

      return {
        cityId: null, // SP does not return new ID
        message: resultRow.Message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single City by ID
  static async getCityById(id) {
    try {
      const pool = await poolPromise;

      // Call sp_ManageCity
      const [results] = await pool.query(
        'CALL sp_ManageCity(?, ?, ?, ?, ?)',
        ['SELECT', id, null, null, null]
      );

      // Extract Result and Message
      const resultRow = results[1][0];
      if (resultRow.Result !== 1) {
        throw new Error(resultRow.Message || 'City not found');
      }

      return results[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a City
  static async updateCity(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.cityName || null,
        data.countryId || null,
        data.createdById
      ];

      // Call sp_ManageCity
      const [results] = await pool.query(
        'CALL sp_ManageCity(?, ?, ?, ?, ?)',
        queryParams
      );

      // Extract Result and Message
      const resultRow = results[0][0];
      if (resultRow.Result !== 1) {
        throw new Error(resultRow.Message || 'Failed to update City');
      }

      return {
        message: resultRow.Message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a City
  static async deleteCity(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_CityName
        null, // p_CountryID
        createdById || null // p_CreatedByID
      ];

      // Call sp_ManageCity
      const [results] = await pool.query(
        'CALL sp_ManageCity(?, ?, ?, ?, ?)',
        queryParams
      );

      // Extract Result and Message
      const resultRow = results[0][0];
      if (resultRow.Result !== 1) {
        throw new Error(resultRow.Message || 'Failed to delete City');
      }

      return {
        message: resultRow.Message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = CityModel;
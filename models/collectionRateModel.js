const poolPromise = require('../config/db.config');

class CollectionRateModel {
  // Get paginated Collection Rates
  static async getAllCollectionRates({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
      console.log('getAllCollectionRates params:', queryParams);

      // Call SP_GetAllCollectionRate
      const [results] = await pool.query(
        'CALL SP_GetAllCollectionRate(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllCollectionRates results:', JSON.stringify(results, null, 2));

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query('SELECT @p_Result AS StatusCode, @p_Message AS Message');

      // Log output
      console.log('getAllCollectionRates output:', JSON.stringify(outParams, null, 2));

      if (!outParams || typeof outParams.StatusCode === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllCollectionRate');
      }

      if (outParams.StatusCode !== 1) {
        throw new Error(outParams.Message || 'Failed to retrieve Collection Rates');
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
      console.error('getAllCollectionRates error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get all Collection Rates without pagination (SELECT ALL)
  static async getAllCollectionRatesNoPagination() {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT ALL',
        null, // p_CollectionRateID
        null, // p_WarehouseID
        null, // p_DistanceRadiusMin
        null, // p_DistanceRadiusMax
        null, // p_Rate
        null, // p_CurrencyID
        null  // p_CreatedByID
      ];

      // Log query parameters
      console.log('getAllCollectionRatesNoPagination params:', queryParams);

      // Call SP_ManageCollectionRate
      const [results] = await pool.query(
        'CALL SP_ManageCollectionRate(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAllCollectionRatesNoPagination results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getAllCollectionRatesNoPagination output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCollectionRate');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve all Collection Rates');
      }

      return results[0] || [];
    } catch (err) {
      console.error('getAllCollectionRatesNoPagination error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Collection Rate
  static async createCollectionRate(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_CollectionRateID
        data.warehouseId,
        data.distanceRadiusMin,
        data.distanceRadiusMax,
        data.rate,
        data.currencyId,
        data.createdById
      ];

      // Log query parameters
      console.log('createCollectionRate params:', queryParams);

      // Call SP_ManageCollectionRate with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageCollectionRate(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters, including p_CollectionRateID
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_CollectionRateID AS p_CollectionRateID');

      // Log output
      console.log('createCollectionRate output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCollectionRate');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Collection Rate');
      }

      return {
        collectionRateId: output[0].p_CollectionRateID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createCollectionRate error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Collection Rate by ID
  static async getCollectionRateById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_WarehouseID
        null, // p_DistanceRadiusMin
        null, // p_DistanceRadiusMax
        null, // p_Rate
        null, // p_CurrencyID
        null  // p_CreatedByID
      ];

      // Log query parameters
      console.log('getCollectionRateById params:', queryParams);

      // Call SP_ManageCollectionRate with session variables for OUT parameters
      const [results] = await pool.query(
        'CALL SP_ManageCollectionRate(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getCollectionRateById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getCollectionRateById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCollectionRate');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Collection Rate not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getCollectionRateById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Collection Rate
  static async updateCollectionRate(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.warehouseId,
        data.distanceRadiusMin,
        data.distanceRadiusMax,
        data.rate,
        data.currencyId,
        data.createdById
      ];

      // Log query parameters
      console.log('updateCollectionRate params:', queryParams);

      // Call SP_ManageCollectionRate with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageCollectionRate(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateCollectionRate output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCollectionRate');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Collection Rate');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateCollectionRate error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Collection Rate
  static async deleteCollectionRate(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_WarehouseID
        null, // p_DistanceRadiusMin
        null, // p_DistanceRadiusMax
        null, // p_Rate
        null, // p_CurrencyID
        createdById
      ];

      // Log query parameters
      console.log('deleteCollectionRate params:', queryParams);

      // Call SP_ManageCollectionRate with session variables for OUT parameters
      await pool.query(
        'CALL SP_ManageCollectionRate(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deleteCollectionRate output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageCollectionRate');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Collection Rate');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteCollectionRate error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = CollectionRateModel;
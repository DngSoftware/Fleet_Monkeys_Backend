const poolPromise = require('../config/db.config');

class LoadTrailerModel {
  // Get all LoadTrailer assignments
  static async getAllLoadTrailers() {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        null, // p_LoadTrailerID
        null, // p_LoadID
        null, // p_TrailerID
        null, // p_TrailerRegistrationNumber
        null, // p_TrailerLength
        null, // p_TrailerWidth
        null, // p_TrailerHeight
        null, // p_MaxAllowableVolume
        null, // p_MaxAllowableWeight
        null, // p_CreatedByID
        null  // p_DeletedByID
      ];

      console.log('getAllLoadTrailers params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageLoadTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadTrailerID)',
        queryParams
      );

      console.log('getAllLoadTrailers results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadTrailerID AS p_NewLoadTrailerID');

      console.log('getAllLoadTrailers output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoadTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve LoadTrailer assignments');
      }

      return {
        data: results[0] || [],
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('getAllLoadTrailers error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single LoadTrailer assignment by ID
  static async getLoadTrailerById(loadTrailerId) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        loadTrailerId,
        null, // p_LoadID
        null, // p_TrailerID
        null, // p_TrailerRegistrationNumber
        null, // p_TrailerLength
        null, // p_TrailerWidth
        null, // p_TrailerHeight
        null, // p_MaxAllowableVolume
        null, // p_MaxAllowableWeight
        null, // p_CreatedByID
        null  // p_DeletedByID
      ];

      console.log('getLoadTrailerById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageLoadTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadTrailerID)',
        queryParams
      );

      console.log('getLoadTrailerById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadTrailerID AS p_NewLoadTrailerID');

      console.log('getLoadTrailerById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoadTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'LoadTrailer not found');
      }

      return {
        data: results[0][0] || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('getLoadTrailerById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new LoadTrailer assignment
  static async createLoadTrailer(data) {
    try {
      const pool = await poolPromise;

      console.log('createLoadTrailer input data:', JSON.stringify(data, null, 2));

      const queryParams = [
        'INSERT',
        data.loadTrailerId || null,
        data.loadId,
        data.trailerId,
        data.trailerRegistrationNumber || null,
        data.trailerLength || null,
        data.trailerWidth || null,
        data.trailerHeight || null,
        data.maxAllowableVolume || null,
        data.maxAllowableWeight || null,
        data.createdById,
        null // p_DeletedByID
      ];

      console.log('createLoadTrailer params:', queryParams);

      await pool.query(
        'CALL SP_ManageLoadTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadTrailerID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadTrailerID AS p_NewLoadTrailerID');

      console.log('createLoadTrailer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoadTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create LoadTrailer assignment');
      }

      return {
        loadTrailerId: output[0].p_NewLoadTrailerID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createLoadTrailer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a LoadTrailer assignment
  static async updateLoadTrailer(loadTrailerId, data) {
    try {
      const pool = await poolPromise;

      console.log('updateLoadTrailer input data:', JSON.stringify(data, null, 2));

      const queryParams = [
        'UPDATE',
        loadTrailerId,
        data.loadId || null,
        data.trailerId || null,
        data.trailerRegistrationNumber || null,
        data.trailerLength || null,
        data.trailerWidth || null,
        data.trailerHeight || null,
        data.maxAllowableVolume || null,
        data.maxAllowableWeight || null,
        data.createdById,
        null // p_DeletedByID
      ];

      console.log('updateLoadTrailer params:', queryParams);

      await pool.query(
        'CALL SP_ManageLoadTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadTrailerID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadTrailerID AS p_NewLoadTrailerID');

      console.log('updateLoadTrailer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoadTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update LoadTrailer assignment');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateLoadTrailer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a LoadTrailer assignment
  static async deleteLoadTrailer(loadTrailerId, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        loadTrailerId,
        null, // p_LoadID
        null, // p_TrailerID
        null, // p_TrailerRegistrationNumber
        null, // p_TrailerLength
        null, // p_TrailerWidth
        null, // p_TrailerHeight
        null, // p_MaxAllowableVolume
        null, // p_MaxAllowableWeight
        null, // p_CreatedByID
        deletedById
      ];

      console.log('deleteLoadTrailer params:', queryParams);

      await pool.query(
        'CALL SP_ManageLoadTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewLoadTrailerID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewLoadTrailerID AS p_NewLoadTrailerID');

      console.log('deleteLoadTrailer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageLoadTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete LoadTrailer assignment');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteLoadTrailer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = LoadTrailerModel;
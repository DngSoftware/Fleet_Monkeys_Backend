const poolPromise = require('../config/db.config');

class TrailerModel {
  // Get paginated Trailers
  static async getAllTrailers({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
        SELECT *
        FROM dbo_tbltrailer
        WHERE IsDeleted = 0
      `;
      const queryParams = [];

      if (formattedFromDate) {
        query += ' AND CreatedDateTime >= ?';
        queryParams.push(formattedFromDate.toISOString().split('T')[0]);
      }
      if (formattedToDate) {
        query += ' AND CreatedDateTime <= ?';
        queryParams.push(formattedToDate.toISOString().split('T')[0]);
      }

      query += ' ORDER BY TrailerID LIMIT ? OFFSET ?';
      queryParams.push(pageSize, offset);

      console.log('getAllTrailers query:', query);
      console.log('getAllTrailers params:', queryParams);

      const [results] = await pool.query(query, queryParams);

      console.log('getAllTrailers results:', JSON.stringify(results, null, 2));

      const [totalResult] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tbltrailer WHERE IsDeleted = 0 ' +
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
      console.error('getAllTrailers error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Trailer
  static async createTrailer(data) {
    try {
      const pool = await poolPromise;

      // Log the incoming data for debugging
      console.log('createTrailer input data:', JSON.stringify(data, null, 2));

      const queryParams = [
        'INSERT',
        null,
        data.trailerType || null,
        data.maxWeight || null,
        data.trailerLength || null,
        data.trailerWidth || null,
        data.trailerHeight || null,
        data.trailerRegistrationNumber || null,
        data.maxAllowableVolume || null,
        data.maxAllowableWeight || null,
        data.createdById,
        null
      ];

      console.log('createTrailer params:', queryParams);

      await pool.query(
        'CALL SP_ManageTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewTrailerID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewTrailerID AS p_NewTrailerID');

      console.log('createTrailer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Trailer');
      }

      return {
        trailerId: output[0].p_NewTrailerID || null,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createTrailer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Trailer by ID
  static async getTrailerById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, null, null, null, null, null, null, null, null, null
      ];

      console.log('getTrailerById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewTrailerID)',
        queryParams
      );

      console.log('getTrailerById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewTrailerID AS p_NewTrailerID');

      console.log('getTrailerById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Trailer not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getTrailerById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Trailer
  static async updateTrailer(id, data) {
    try {
      const pool = await poolPromise;

      console.log('updateTrailer input data:', JSON.stringify(data, null, 2));

      const queryParams = [
        'UPDATE',
        id,
        data.trailerType || null,
        data.maxWeight || null,
        data.trailerLength || null,
        data.trailerWidth || null,
        data.trailerHeight || null,
        data.trailerRegistrationNumber || null,
        data.maxAllowableVolume || null,
        data.maxAllowableWeight || null,
        data.createdById,
        null
      ];

      console.log('updateTrailer params:', queryParams);

      await pool.query(
        'CALL SP_ManageTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewTrailerID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewTrailerID AS p_NewTrailerID');

      console.log('updateTrailer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Trailer');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateTrailer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Trailer
  static async deleteTrailer(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, null, null, null, null, null, null, null, null, deletedById
      ];

      console.log('deleteTrailer params:', queryParams);

      await pool.query(
        'CALL SP_ManageTrailer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewTrailerID)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewTrailerID AS p_NewTrailerID');

      console.log('deleteTrailer output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageTrailer');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Trailer');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteTrailer error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = TrailerModel;
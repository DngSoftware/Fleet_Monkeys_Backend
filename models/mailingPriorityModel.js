const poolPromise = require('../config/db.config');

class MailingPriorityModel {
  // Get paginated Mailing Priorities
  static async getAllMailingPriorities({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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

      console.log('getAllMailingPriorities params:', JSON.stringify(queryParams, null, 2));

      // Call the stored procedure
      const [results] = await pool.query(
        'CALL SP_GetAllMailingPriority(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllMailingPriorities results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllMailingPriorities output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_GetAllMailingPriority: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve Mailing Priorities');
      }

      // Calculate total records separately since SP_GetAllMailingPriority does not return p_TotalRecords
      const [totalResult] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblmailingpriority WHERE 1=1 ' +
        'AND ( ? IS NULL OR CreatedDateTime >= ? ) ' +
        'AND ( ? IS NULL OR CreatedDateTime <= ? )',
        [formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null, 
         formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null, 
         formattedToDate ? formattedToDate.toISOString().split('T')[0] : null, 
         formattedToDate ? formattedToDate.toISOString().split('T')[0] : null]
      );

      const totalRecords = totalResult[0]?.totalRecords || 0;

      return {
        data: Array.isArray(results[0]) ? results[0] : [],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllMailingPriorities error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Mailing Priority
  static async createMailingPriority(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_MailingPriorityID
        data.priorityName,
        data.priorityDescription || null,
        data.createdById
      ];

      console.log('createMailingPriority params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageMailingPriority(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('createMailingPriority results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('createMailingPriority output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageMailingPriority: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Mailing Priority');
      }

      // Extract MailingPriorityID from message
      const mailingPriorityIdMatch = output[0].p_Message.match(/ID: (\d+)/);
      const mailingPriorityId = mailingPriorityIdMatch ? parseInt(mailingPriorityIdMatch[1]) : null;

      return {
        mailingPriorityId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createMailingPriority error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Mailing Priority by ID
  static async getMailingPriorityById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_PriorityName
        null, // p_PriorityDescription
        null  // p_CreatedByID
      ];

      console.log('getMailingPriorityById params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageMailingPriority(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getMailingPriorityById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getMailingPriorityById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageMailingPriority: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Mailing Priority not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getMailingPriorityById error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Mailing Priority
  static async updateMailingPriority(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.priorityName || null,
        data.priorityDescription || null,
        data.createdById
      ];

      console.log('updateMailingPriority params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageMailingPriority(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('updateMailingPriority results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateMailingPriority output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageMailingPriority: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Mailing Priority');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateMailingPriority error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Mailing Priority
  static async deleteMailingPriority(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_PriorityName
        null, // p_PriorityDescription
        createdById
      ];

      console.log('deleteMailingPriority params:', JSON.stringify(queryParams, null, 2));

      const [results] = await pool.query(
        'CALL SP_ManageMailingPriority(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('deleteMailingPriority results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteMailingPriority output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error(`Output parameters missing from SP_ManageMailingPriority: ${JSON.stringify(output)}`);
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Mailing Priority');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteMailingPriority error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = MailingPriorityModel;
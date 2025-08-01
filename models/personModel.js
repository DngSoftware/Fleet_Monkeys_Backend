const poolPromise = require('../config/db.config');

class PersonModel {
  // Get paginated Persons
  static async getAllPersons({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
        formattedFromDate ? formattedFromDate.toISOString() : null,
        formattedToDate ? formattedToDate.toISOString() : null
      ];

      // Log query parameters
      console.log('getAllPersons params:', queryParams);

      // Call SP_GetAllPerson
      const [results] = await pool.query(
        `CALL SP_GetAllPerson(?, ?, ?, ?)`,
        queryParams
      );

      // Log results
      console.log('getAllPersons results:', JSON.stringify(results, null, 2));

      // Calculate total records
      const [countResult] = await pool.query(
        `SELECT COUNT(*) AS totalRecords 
         FROM dbo_tblperson p 
         WHERE (p.IsDeleted = 0 OR p.IsDeleted IS NULL)
           AND (? IS NULL OR p.CreatedDateTime >= ?)
           AND (? IS NULL OR p.CreatedDateTime <= ?)`,
        [formattedFromDate, formattedFromDate, formattedToDate, formattedToDate]
      );

      return {
        data: results[0] || [],
        totalRecords: countResult[0].totalRecords || 0,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(countResult[0].totalRecords / pageSize)
      };
    } catch (err) {
      console.error('getAllPersons error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Person
  static async createPerson(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_PersonID
        data.firstName,
        data.middleName,
        data.lastName,
        data.roleId,
        data.status,
        data.salutation,
        data.designation,
        data.gender,
        data.dob,
        data.joiningDate,
        data.companyId,
        data.isExternal ? 1 : 0,
        data.loginId,
        data.password,
        data.emailId,
        data.isDarkMode ? 1 : 0,
        data.createdById
      ];

      // Log query parameters
      console.log('createPerson params:', queryParams);

      // Call SP_ManagePerson
      const [results] = await pool.query(
        `CALL SP_ManagePerson(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('createPerson results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('createPerson output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManagePerson');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Person');
      }

      // Extract personId from the message
      const personIdMatch = output[0].p_Message.match(/ID: (\d+)/);
      const personId = personIdMatch ? parseInt(personIdMatch[1]) : results.insertId || null;

      return {
        personId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createPerson error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Person by ID
  static async getPersonById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_FirstName
        null, // p_MiddleName
        null, // p_LastName
        null, // p_RoleID
        null, // p_Status
        null, // p_Salutation
        null, // p_Designation
        null, // p_Gender
        null, // p_DOB
        null, // p_JoiningDate
        null, // p_CompanyID
        null, // p_IsExternal
        null, // p_LoginID
        null, // p_Password
        null, // p_EmailID
        null, // p_IsDarkMode
        null  // p_CreatedByID
      ];

      // Log query parameters
      console.log('getPersonById params:', queryParams);

      // Call SP_ManagePerson
      const [results] = await pool.query(
        `CALL SP_ManagePerson(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('getPersonById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getPersonById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManagePerson');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Person not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getPersonById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Person
  static async updatePerson(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.firstName,
        data.middleName,
        data.lastName,
        data.roleId,
        data.status,
        data.salutation,
        data.designation,
        data.gender,
        data.dob,
        data.joiningDate,
        data.companyId,
        data.isExternal ? 1 : 0,
        data.loginId,
        data.password,
        data.emailId,
        data.isDarkMode ? 1 : 0,
        data.createdById
      ];

      // Log query parameters
      console.log('updatePerson params:', queryParams);

      // Call SP_ManagePerson
      const [results] = await pool.query(
        `CALL SP_ManagePerson(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      console.log('updatePerson results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updatePerson output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManagePerson');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Person');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updatePerson error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Person
  static async deletePerson(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_FirstName
        null, // p_MiddleName
        null, // p_LastName
        null, // p_RoleID
        null, // p_Status
        null, // p_Salutation
        null, // p_Designation
        null, // p_Gender
        null, // p_DOB
        null, // p_JoiningDate
        null, // p_CompanyID
        null, // p_IsExternal
        null, // p_LoginID
        null, // p_Password
        null, // p_EmailID
        null, // p_IsDarkMode
        createdById
      ];

      // Log query parameters
      console.log('deletePerson params:', queryParams);

      // Call SP_ManagePerson
      const [results] = await pool.query(
        `CALL SP_ManagePerson(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)`,
        queryParams
      );

      // Log results
      "deletePerson results:", JSON.stringify(results, null, 2);

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deletePerson output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManagePerson');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Person');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deletePerson error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update person's profile image
  static async updateProfileImage({ personId, profileImage, createdById }) {
    try {
      const pool = await poolPromise;

      // Validate personId exists
      const [personCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ? AND IsDeleted = 0',
        [parseInt(personId)]
      );
      if (personCheck.length === 0) {
        return {
          success: false,
          message: `PersonID ${personId} does not exist or is deleted`,
          data: null
        };
      }

      const queryParams = [
        'UPDATE',
        personId,
        null, // p_FirstName
        null, // p_MiddleName
        null, // p_LastName
        null, // p_RoleID
        null, // p_Status
        null, // p_Salutation
        null, // p_Designation
        null, // p_Gender
        null, // p_DOB
        null, // p_JoiningDate
        null, // p_CompanyID
        null, // p_IsExternal
        null, // p_LoginID
        null, // p_Password
        null, // p_EmailID
        null, // p_IsDarkMode
        createdById,
        profileImage // p_ProfileImage
      ];

      const [results] = await pool.query(
        'CALL SP_ManagePerson(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        return {
          success: false,
          message: `Output parameters missing from SP_ManagePerson`,
          data: null
        };
      }

      if (output[0].p_Result !== 1) {
        return {
          success: false,
          message: output[0].p_Message || 'Failed to update profile image',
          data: null
        };
      }

      return {
        success: true,
        message: output[0].p_Message || 'Profile image updated successfully',
        data: null
      };
    } catch (err) {
      console.error('updateProfileImage error:', err.stack);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null
      };
    }
  }
}

module.exports = PersonModel;
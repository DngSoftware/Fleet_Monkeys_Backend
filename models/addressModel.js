const poolPromise = require('../config/db.config');

class AddressModel {
  // Get paginated Addresses
  static async getAllAddresses({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(Number(pageNumber)) || pageNumber < 1) pageNumber = 1;
      if (!Number.isInteger(Number(pageSize)) || pageSize < 1 || pageSize > 100) pageSize = 10;

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
        formattedFromDate ? formattedFromDate.toISOString().slice(0, 19).replace('T', ' ') : null,
        formattedToDate ? formattedToDate.toISOString().slice(0, 19).replace('T', ' ') : null
      ];

      console.log('getAllAddresses params:', queryParams);

      const [results] = await pool.query(
        `CALL fleet_monkey_test.SP_GetAllAddresses(?, ?, ?, ?, @p_Result, @p_Message)`,
        queryParams
      );

      console.log('getAllAddresses results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllAddresses output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Output parameters missing from SP_GetAllAddresses');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve addresses');
      }

      // Calculate total records
      const [countResult] = await pool.query(
        `SELECT COUNT(*) AS totalRecords 
         FROM fleet_monkey_test.dbo_tbladdresses a 
         WHERE a.IsDeleted = 0
           AND (? IS NULL OR a.CreatedDateTime >= ?)
           AND (? IS NULL OR a.CreatedDateTime <= ?)`,
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
      console.error('getAllAddresses error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Address
  static async createAddress(data) {
    try {
      const pool = await poolPromise;

      // Validate required fields
      if (!data.createdById || isNaN(parseInt(data.createdById))) throw new Error('createdById is required');
      if (!data.addressLine1) throw new Error('addressLine1 is required');

      const queryParams = [
        'INSERT',
        null, // p_AddressID
        data.addressTitle || null,
        data.addressName || null,
        data.addressTypeId || null,
        data.addressLine1,
        data.addressLine2 || null,
        data.city || null,
        data.county || null,
        data.state || null,
        data.postalCode || null,
        data.country || null,
        data.preferredBillingAddress ? 1 : 0,
        data.preferredShippingAddress ? 1 : 0,
        data.longitude || null,
        data.latitude || null,
        data.disabled ? 1 : 0,
        parseInt(data.createdById)
      ];

      console.log('createAddress params:', queryParams);

      const [results] = await pool.query(
        'CALL fleet_monkey_test.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('createAddress results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('createAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Output parameters missing from SP_ManageAddresses');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Address');
      }

      const addressIdMatch = output[0].p_Message.match(/ID: (\d+)/);
      const addressId = addressIdMatch ? parseInt(addressIdMatch[1]) : null;

      if (!addressId) {
        throw new Error('Failed to retrieve inserted AddressID');
      }

      return {
        addressId,
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Address by ID
  static async getAddressById(id) {
    try {
      const pool = await poolPromise;

      // Validate ID
      if (!Number.isInteger(Number(id)) || id <= 0) {
        throw new Error('Invalid AddressID');
      }

      const queryParams = [
        'SELECT',
        parseInt(id),
        null, // p_AddressTitle
        null, // p_AddressName
        null, // p_AddressTypeID
        null, // p_AddressLine1
        null, // p_AddressLine2
        null, // p_City
        null, // p_County
        null, // p_State
        null, // p_PostalCode
        null, // p_Country
        null, // p_PreferredBillingAddress
        null, // p_PreferredShippingAddress
        null, // p_Longitude
        null, // p_Latitude
        null, // p_Disabled
        null  // p_CreatedByID
      ];

      console.log('getAddressById params:', queryParams);

      const [results] = await pool.query(
        'CALL fleet_monkey_test.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAddressById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAddressById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Output parameters missing from SP_ManageAddresses');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Address not found');
      }

      if (!results || !results[0] || !results[0][0]) {
        throw new Error('No address found for the provided ID');
      }

      return results[0][0];
    } catch (err) {
      console.error('getAddressById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update an Address
  static async updateAddress(id, data) {
    try {
      const pool = await poolPromise;

      // Validate required fields
      if (!Number.isInteger(Number(id)) || id <= 0) throw new Error('Invalid AddressID');
      if (!data.createdById || isNaN(parseInt(data.createdById))) throw new Error('createdById is required');
      if (!data.addressLine1) throw new Error('addressLine1 is required');

      const queryParams = [
        'UPDATE',
        parseInt(id),
        data.addressTitle || null,
        data.addressName || null,
        data.addressTypeId || null,
        data.addressLine1,
        data.addressLine2 || null,
        data.city || null,
        data.county || null,
        data.state || null,
        data.postalCode || null,
        data.country || null,
        data.preferredBillingAddress ? 1 : 0,
        data.preferredShippingAddress ? 1 : 0,
        data.longitude || null,
        data.latitude || null,
        data.disabled ? 1 : 0,
        parseInt(data.createdById)
      ];

      console.log('updateAddress params:', queryParams);

      const [results] = await pool.query(
        'CALL fleet_monkey_test.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('updateAddress results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('updateAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Output parameters missing from SP_ManageAddresses');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Address');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete an Address
  static async deleteAddress(id, createdById) {
    try {
      const pool = await poolPromise;

      // Validate required fields
      if (!Number.isInteger(Number(id)) || id <= 0) throw new Error('Invalid AddressID');
      if (!createdById || isNaN(parseInt(createdById))) throw new Error('createdById is required');

      const queryParams = [
        'DELETE',
        parseInt(id),
        null, // p_AddressTitle
        null, // p_AddressName
        null, // p_AddressTypeID
        null, // p_AddressLine1
        null, // p_AddressLine2
        null, // p_City
        null, // p_County
        null, // p_State
        null, // p_PostalCode
        null, // p_Country
        null, // p_PreferredBillingAddress
        null, // p_PreferredShippingAddress
        null, // p_Longitude
        null, // p_Latitude
        null, // p_Disabled
        parseInt(createdById)
      ];

      console.log('deleteAddress params:', queryParams);

      const [results] = await pool.query(
        'CALL fleet_monkey_test.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('deleteAddress results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || output[0].p_Result === null) {
        throw new Error('Output parameters missing from SP_ManageAddresses');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Address');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteAddress error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = AddressModel;
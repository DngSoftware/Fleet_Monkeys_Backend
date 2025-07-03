const poolPromise = require('../config/db.config');

class AddressModel {
  // Get paginated Addresses
  static async getAllAddresses({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
    console.log('getAllAddresses params:', queryParams);

    // Call SP_GetAllAddresses
    const [results] = await pool.query(
      `CALL SP_GetAllAddresses(?, ?, ?, ?, @p_Result, @p_Message)`,
      queryParams
    );

    // Log results
    console.log('getAllAddresses results:', JSON.stringify(results, null, 2));

    // Fetch output parameters
    const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

    // Log output
    console.log('getAllAddresses output:', JSON.stringify(output, null, 2));

    if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
      throw new Error('Output parameters missing from SP_GetAllAddresses');
    }

    if (output[0].p_Result !== 1) {
      throw new Error(output[0].p_Message || 'Failed to retrieve addresses');
    }

    // Calculate total records (ensure filters match SP_GetAllAddresses)
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS totalRecords 
       FROM dbo_tbladdresses a 
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

      const queryParams = [
        'INSERT',
        null, // p_AddressID
        data.addressTitle,
        data.addressName,
        data.addressTypeId,
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.county,
        data.state,
        data.postalCode,
        data.country,
        data.preferredBillingAddress ? 1 : 0,
        data.preferredShippingAddress ? 1 : 0,
        data.longitude,
        data.latitude,
        data.disabled ? 1 : 0,
        data.createdById
      ];

      // Log query parameters
      console.log('createAddress params:', queryParams);

      // Call sp_manageaddresses
      const [results] = await pool.query(
        'CALL fleet_monkey.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('createAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('createAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageAddresses');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Address');
      }

      // Extract addressId from the message (since sp_manageaddresses uses LAST_INSERT_ID())
      const addressIdMatch = output[0].p_Message.match(/ID: (\d+)/);
      const addressId = addressIdMatch ? parseInt(addressIdMatch[1]) : results.insertId || null;

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

      const queryParams = [
        'SELECT',
        id,
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

      // Log query parameters
      console.log('getAddressById params:', queryParams);

      // Call sp_manageaddresses
      const [results] = await pool.query(
        'CALL fleet_monkey.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getAddressById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getAddressById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageAddresses');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Address not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getAddressById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update an Address
  static async updateAddress(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.addressTitle,
        data.addressName,
        data.addressTypeId,
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.county,
        data.state,
        data.postalCode,
        data.country,
        data.preferredBillingAddress ? 1 : 0,
        data.preferredShippingAddress ? 1 : 0,
        data.longitude,
        data.latitude,
        data.disabled ? 1 : 0,
        data.createdById
      ];

      // Log query parameters
      console.log('updateAddress params:', queryParams);

      // Call sp_manageaddresses
      const [results] = await pool.query(
        'CALL fleet_monkey.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('updateAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
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

      const queryParams = [
        'DELETE',
        id,
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
        createdById
      ];

      // Log query parameters
      console.log('deleteAddress params:', queryParams);

      // Call sp_manageaddresses
      const [results] = await pool.query(
        'CALL fleet_monkey.SP_ManageAddresses(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('deleteAddress results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deleteAddress output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
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
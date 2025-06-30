const poolPromise = require('../config/db.config');

class AddressTypeModel {
  // Get paginated AddressTypes
 static async getAllAddressTypes({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
    console.log('getAllAddressTypes params:', queryParams);

    // Call SP_GetAllAddressTypes
    const [result] = await pool.query(
      'CALL SP_GetAllAddressTypes(?, ?, ?, ?, @p_Result, @p_Message)',
      queryParams
    );

    // Log results
    console.log('getAllAddressTypes results:', JSON.stringify(result, null, 2));

    // Retrieve OUT parameters
    const [[outParams]] = await pool.query('SELECT @p_Result AS result, @p_Message AS message');

    // Log output
    console.log('getAllAddressTypes output:', JSON.stringify(outParams, null, 2));

    if (!outParams || typeof outParams.result === 'undefined') {
      throw new Error('Output parameters missing from SP_GetAllAddressTypes');
    }

    if (outParams.result !== 0) { // Changed from !== 1 to === 0
      throw new Error(outParams.message || 'Failed to retrieve AddressTypes');
    }

    // Extract total count from the second result set
    const totalRecords = result[1][0]?.TotalCount || 0;

    return {
      data: result[0] || [],
      totalRecords,
      currentPage: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalRecords / pageSize)
    };
  } catch (err) {
    console.error('getAllAddressTypes error:', err);
    throw new Error(`Database error: ${err.message}`);
  }
}

  // Create a new AddressType
  static async createAddressType(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_AddressTypeID
        data.addressType,
        data.createdById
      ];

      // Call sp_ManageAddressType
      await pool.query(
        'CALL sp_ManageAddressType(?, ?, ?, ?,  @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_NewAddressTypeID AS newAddressTypeId, @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create AddressType');
      }

      return {
        newAddressTypeId: outParams.newAddressTypeId,
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single AddressType by ID
  static async getAddressTypeById(id) {
    try {
      const pool = await poolPromise;

      // Call sp_ManageAddressType
      const [result] = await pool.query(
        'CALL sp_ManageAddressType(?, ?, ?, ?,  @p_Result, @p_Message)',
        ['SELECT', id, null, null]
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'AddressType not found');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update an AddressType
  static async updateAddressType(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.addressType,
        data.createdById
      ];

      // Call sp_ManageAddressType
      await pool.query(
        'CALL sp_ManageAddressType(?, ?, ?, ?,  @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update AddressType');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete an AddressType
  static async deleteAddressType(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null,
        createdById
      ];

      // Call sp_ManageAddressType
      await pool.query(
        'CALL sp_ManageAddressType(?, ?, ?, ?,  @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete AddressType');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = AddressTypeModel;
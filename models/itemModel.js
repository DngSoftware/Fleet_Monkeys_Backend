const poolPromise = require('../config/db.config');

class ItemModel {
  // Get paginated Items
  static async getAllItems({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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

      console.log('getAllItems params:', JSON.stringify(queryParams, null, 2));

      // Call SP_GetAllItems
      const [results] = await pool.query(
        'CALL SP_GetAllItems(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllItems results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllItems output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllItems');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve items');
      }

      // Calculate total records separately since SP_GetAllItems does not return total count
      const [totalResult] = await pool.query(
        'SELECT COUNT(*) AS totalRecords FROM dbo_tblitem WHERE IsDeleted = 0 ' +
        'AND ( ? IS NULL OR CreatedDateTime >= ? ) ' +
        'AND ( ? IS NULL OR CreatedDateTime <= ? )',
        [
          formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null,
          formattedFromDate ? formattedFromDate.toISOString().split('T')[0] : null,
          formattedToDate ? formattedToDate.toISOString().split('T')[0] : null,
          formattedToDate ? formattedToDate.toISOString().split('T')[0] : null
        ]
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
      console.error('getAllItems error:', err.stack);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Item
  static async createItem(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_ItemID
        data.itemCode,
        data.itemName,
        data.certificationId,
        data.itemImage,
        data.itemImageFileName,
        data.itemGroupId,
        data.defaultUomId,
        data.createdById
      ];

      // Log query parameters
      console.log('createItem params:', queryParams);

      // Call SP_ManageItem
      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('createItem results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_ItemID AS p_ItemID');

      // Log output
      console.log('createItem output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Item');
      }

      return {
        itemId: output[0].p_ItemID || null, // SP returns the new ItemID
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('createItem error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Item by ID
  static async getItemById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_ItemCode
        null, // p_ItemName
        null, // p_CertificationID
        null, // p_ItemImage
        null, // p_ItemImageFileName
        null, // p_ItemGroupID
        null, // p_DefaultUOMID
        null  // p_CreatedByID
      ];

      // Log query parameters
      console.log('getItemById params:', queryParams);

      // Call SP_ManageItem
      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('getItemById results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('getItemById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Item not found');
      }

      return results[0][0] || null;
    } catch (err) {
      console.error('getItemById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update an Item
  static async updateItem(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.itemCode,
        data.itemName,
        data.certificationId,
        data.itemImage,
        data.itemImageFileName,
        data.itemGroupId,
        data.defaultUomId,
        data.createdById
      ];

      // Log query parameters
      console.log('updateItem params:', queryParams);

      // Call SP_ManageItem
      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('updateItem results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('updateItem output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to update Item');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('updateItem error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete an Item
  static async deleteItem(id, createdById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_ItemCode
        null, // p_ItemName
        null, // p_CertificationID
        null, // p_ItemImage
        null, // p_ItemImageFileName
        null, // p_ItemGroupID
        null, // p_DefaultUOMID
        createdById
      ];

      // Log query parameters
      console.log('deleteItem params:', queryParams);

      // Call SP_ManageItem
      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Log results
      console.log('deleteItem results:', JSON.stringify(results, null, 2));

      // Fetch output parameters
      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      // Log output
      console.log('deleteItem output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Item');
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteItem error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = ItemModel;
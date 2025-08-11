const poolPromise = require('../config/db.config');
const fs = require('fs').promises;
const path = require('path');

class ItemModel {
  // Get paginated Items
  static async getAllItems({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1 || pageSize > 100) pageSize = 10;
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

      const [results] = await pool.query(
        'CALL SP_GetAllItems(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getAllItems results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getAllItems output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_GetAllItems');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to retrieve items');
      }

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

      const itemsWithImages = await Promise.all((Array.isArray(results[0]) ? results[0] : []).map(async (item) => {
        if (item.itemImageFileName) {
          const imagePath = path.join(__dirname, '../Uploads', item.itemImageFileName);
          try {
            const imageData = await fs.readFile(imagePath, { encoding: 'base64' });
            item.itemImage = `data:image/jpeg;base64,${imageData}`;
          } catch (err) {
            console.error(`Failed to read image ${item.itemImageFileName}:`, err);
            item.itemImage = null;
          }
        }
        return item;
      }));

      return {
        data: itemsWithImages,
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
        null,
        data.itemCode,
        data.itemName,
        data.certificationId,
        null,
        data.itemImageFileName,
        data.itemGroupId,
        data.defaultUomId,
        data.createdById
      ];

      console.log('createItem params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('createItem results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_ItemID AS p_ItemID');

      console.log('createItem output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to create Item');
      }

      return {
        itemId: output[0].p_ItemID || null,
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
        null, null, null, null, null, null, null, null
      ];

      console.log('getItemById params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getItemById results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getItemById output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Item not found');
      }

      const item = results[0][0] || null;
      if (item && item.itemImageFileName) {
        const imagePath = path.join(__dirname, '../Uploads', item.itemImageFileName);
        try {
          const imageData = await fs.readFile(imagePath, { encoding: 'base64' });
          item.itemImage = `data:image/jpeg;base64,${imageData}`;
        } catch (err) {
          console.error(`Failed to read image ${item.itemImageFileName}:`, err);
          item.itemImage = null;
        }
      }

      return item;
    } catch (err) {
      console.error('getItemById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get image filename by Item ID
  static async getImageFilenameById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, null, null, null, null, null, null, null
      ];

      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Item not found');
      }

      const item = results[0][0] || null;
      return item ? item.itemImageFileName : null;
    } catch (err) {
      console.error('getImageFilenameById error:', err);
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
        null,
        data.itemImageFileName,
        data.itemGroupId,
        data.defaultUomId,
        data.createdById
      ];

      console.log('updateItem params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('updateItem results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

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
        null, null, null, null, null, null, null, createdById
      ];

      console.log('deleteItem params:', queryParams);

      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('deleteItem results:', JSON.stringify(results, null, 2));

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('deleteItem output:', JSON.stringify(output, null, 2));

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        throw new Error(output[0].p_Message || 'Failed to delete Item');
      }

      const item = await ItemModel.getItemById(id);
      if (item && item.itemImageFileName) {
        const imagePath = path.join(__dirname, '../Uploads', item.itemImageFileName);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.error(`Failed to delete image ${item.itemImageFileName}:`, err);
        }
      }

      return {
        message: output[0].p_Message
      };
    } catch (err) {
      console.error('deleteItem error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get image filename by Item ID
  static async getImageFilenameById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, null, null, null, null, null, null, null
      ];

      console.log('getImageFilenameById params:', queryParams); // Debug log

      const [results] = await pool.query(
        'CALL SP_ManageItem(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('getImageFilenameById raw results:', JSON.stringify(results, null, 2)); // Debug log

      // Handle multiple result sets if present
      let item = null;
      for (const result of results) {
        if (result.length > 0) {
          item = result[0];
          break;
        }
      }

      const [output] = await pool.query('SELECT @p_Result AS p_Result, @p_Message AS p_Message');

      console.log('getImageFilenameById output:', JSON.stringify(output, null, 2)); // Debug log

      if (!output || !output[0] || typeof output[0].p_Result === 'undefined') {
        throw new Error('Output parameters missing from SP_ManageItem');
      }

      if (output[0].p_Result !== 1) {
        console.log('Stored procedure failed:', output[0].p_Message); // Debug log
        throw new Error(output[0].p_Message || 'Item not found');
      }

      console.log('Parsed item data:', item); // Debug log
      return item ? item.itemImageFileName : null;
    } catch (err) {
      console.error('getImageFilenameById error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = ItemModel;
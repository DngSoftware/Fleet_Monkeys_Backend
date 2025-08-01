const ItemModel = require('../models/itemModel');
const fs = require('fs').promises;
const path = require('path');
const poolPromise = require('../config/db.config'); 

class ItemController {
  // Get all Items with pagination
  static async getAllItems(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({ success: false, message: 'Invalid pageNumber', data: null, pagination: null });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({ success: false, message: 'Invalid pageSize', data: null, pagination: null });
      }

      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        return res.status(400).json({ success: false, message: 'Invalid fromDate format (use YYYY-MM-DD)', data: null, pagination: null });
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        return res.status(400).json({ success: false, message: 'Invalid toDate format (use YYYY-MM-DD)', data: null, pagination: null });
      }

      const items = await ItemModel.getAllItems({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      return res.status(200).json({
        success: true,
        message: 'Items retrieved successfully',
        data: items.data || [],
        pagination: {
          totalRecords: items.totalRecords,
          currentPage: items.currentPage,
          pageSize: items.pageSize,
          totalPages: items.totalPages
        }
      });
    } catch (err) {
      console.error('getAllItems error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null, pagination: null });
    }
  }

  // Create a new Item
  static async createItem(req, res) {
    try {
      const {
        itemCode,
        itemName,
        certificationId,
        itemImageFileName,
        itemGroupId,
        defaultUomId,
        createdById
      } = req.body;

      if (!itemCode || !itemName || !createdById) {
        return res.status(400).json({ success: false, message: 'ItemCode, ItemName, and CreatedByID are required', data: null, itemId: null });
      }

      // Validate that itemImageFileName exists if an image is intended to be associated
      if (!itemImageFileName) {
        return res.status(400).json({ success: false, message: 'itemImageFileName is required to associate an image', data: null, itemId: null });
      }

      const result = await ItemModel.createItem({
        itemCode,
        itemName,
        certificationId,
        itemImageFileName,
        itemGroupId,
        defaultUomId,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        itemId: result.itemId
      });
    } catch (err) {
      console.error('createItem error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null, itemId: null });
    }
  }

  // Get a single Item by ID
  static async getItemById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Valid ItemID is required', data: null, itemId: null });
      }

      const item = await ItemModel.getItemById(parseInt(id));

      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found', data: null, itemId: id });
      }

      return res.status(200).json({
        success: true,
        message: 'Item retrieved successfully',
        data: item,
        itemId: id
      });
    } catch (err) {
      console.error('getItemById error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null, itemId: null });
    }
  }

  // Get Item Image
  static async getItemImage(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Valid ItemID is required', data: null });
      }

      const itemImageFileName = await ItemModel.getImageFilenameById(parseInt(id));

      if (!itemImageFileName) {
        return res.status(404).json({ success: false, message: 'No image found for this item', data: null });
      }

      const imagePath = path.join(__dirname, '../Uploads', itemImageFileName);
      const imageStream = await fs.readFile(imagePath);

      res.setHeader('Content-Type', 'image/jpeg'); // Adjust MIME type based on your image type
      res.send(imageStream);
    } catch (err) {
      console.error('getItemImage error:', err);
      if (err.code === 'ENOENT') {
        return res.status(404).json({ success: false, message: 'Image file not found', data: null });
      }
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null });
    }
  }

  // Update an Item
  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const {
        itemCode,
        itemName,
        certificationId,
        itemImageFileName,
        itemGroupId,
        defaultUomId,
        createdById
      } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Valid ItemID is required', data: null, itemId: null });
      }

      if (!itemCode || !itemName || !createdById) {
        return res.status(400).json({ success: false, message: 'ItemCode, ItemName, and CreatedByID are required', data: null, itemId: id });
      }

      const result = await ItemModel.updateItem(parseInt(id), {
        itemCode,
        itemName,
        certificationId,
        itemImageFileName,
        itemGroupId,
        defaultUomId,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        itemId: id
      });
    } catch (err) {
      console.error('updateItem error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null, itemId: null });
    }
  }

  // Delete an Item
  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Valid ItemID is required', data: null, itemId: null });
      }

      if (!createdById) {
        return res.status(400).json({ success: false, message: 'CreatedByID is required', data: null, itemId: id });
      }

      const result = await ItemModel.deleteItem(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        itemId: id
      });
    } catch (err) {
      console.error('deleteItem error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null, itemId: null });
    }
  }

 static async getItemImage(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Valid ItemID is required', data: null });
    }

    const pool = await poolPromise;
    const [rows] = await pool.query('SELECT ItemImageFileName FROM dbo_tblitem WHERE ItemID = ? AND IsDeleted = 0', [parseInt(id)]);
    const itemImageFileName = rows[0]?.ItemImageFileName;
    console.log('Direct query result:', itemImageFileName);
    if (!itemImageFileName) {
      return res.status(404).json({ success: false, message: 'No image found for this item', data: null });
    }

    const imagePath = path.join(process.cwd(), 'Uploads', itemImageFileName);
    console.log('Constructed image path:', imagePath);
    await fs.access(imagePath);
    const imageStream = await fs.readFile(imagePath);

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageStream);
  } catch (err) {
    console.error('getItemImage error:', err);
    if (err.code === 'ENOENT') {
      console.error('File not found at:', path.join(process.cwd(), 'Uploads', itemImageFileName));
      return res.status(404).json({ success: false, message: 'Image file not found', data: null });
    }
    return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null });
  }
}

}

module.exports = ItemController;
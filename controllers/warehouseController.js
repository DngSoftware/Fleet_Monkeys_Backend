const WarehouseModel = require('../models/warehouseModel');

class WarehouseController {
  static async getAllWarehouses(req, res) {
    try {
      const { pageNumber = 1, pageSize = 10, fromDate, toDate } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(pageNumber, 10);
      const pageSz = parseInt(pageSize, 10);
      if (isNaN(pageNum) || pageNum < 1 || isNaN(pageSz) || pageSz < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber or pageSize',
          data: null,
          totalRecords: 0
        });
      }

      // Validate date parameters if provided
      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fromDate format (use YYYY-MM-DD)',
          data: null,
          totalRecords: 0
        });
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid toDate format (use YYYY-MM-DD)',
          data: null,
          totalRecords: 0
        });
      }

      const warehouses = await WarehouseModel.getAllWarehouses({
        pageNumber: pageNum,
        pageSize: pageSz,
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Warehouses retrieved successfully',
        data: warehouses.data || [],
        totalRecords: warehouses.totalRecords || 0
      });
    } catch (err) {
      console.error('getAllWarehouses error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        totalRecords: 0
      });
    }
  }

  static async createWarehouse(req, res) {
    try {
      const { warehouseName, createdById, warehouseAddressId } = req.body;

      // Validate input
      if (!warehouseName || typeof warehouseName !== 'string' || warehouseName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Valid warehouseName is required',
          data: null,
          warehouseId: null
        });
      }
      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid createdById is required',
          data: null,
          warehouseId: null
        });
      }

      const data = {
        warehouseName: warehouseName.trim(),
        createdById: parseInt(createdById),
        warehouseAddressId: warehouseAddressId ? parseInt(warehouseAddressId) : null
      };

      console.log('Creating warehouse with data:', JSON.stringify(data, null, 2));
      const result = await WarehouseModel.createWarehouse(data);
      console.log('Create warehouse result:', JSON.stringify(result, null, 2));

      if (!result || !result.warehouseId) {
        throw new Error('Failed to create warehouse: Invalid response from model');
      }

      return res.status(201).json({
        success: true,
        message: result.message || 'Warehouse created successfully',
        data: result.data || { warehouseName, createdById, warehouseAddressId },
        warehouseId: result.warehouseId
      });
    } catch (err) {
      console.error('createWarehouse error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        warehouseId: null
      });
    }
  }

  static async getWarehouseById(req, res) {
    try {
      const { id } = req.params;

      const warehouseId = parseInt(id, 10);
      if (!id || isNaN(warehouseId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid WarehouseID is required',
          data: null,
          warehouseId: null
        });
      }

      const warehouse = await WarehouseModel.getWarehouseById(warehouseId);

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found',
          data: null,
          warehouseId
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Warehouse retrieved successfully',
        data: warehouse,
        warehouseId
      });
    } catch (err) {
      console.error('getWarehouseById error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        warehouseId: null
      });
    }
  }

  static async updateWarehouse(req, res) {
    try {
      const { id } = req.params;
      const { warehouseName, warehouseAddressId, createdById } = req.body;

      const warehouseId = parseInt(id, 10);
      if (!id || isNaN(warehouseId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid WarehouseID is required',
          data: null,
          warehouseId: null
        });
      }

      if (!warehouseName || typeof warehouseName !== 'string' || warehouseName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Valid WarehouseName is required',
          data: null,
          warehouseId
        });
      }
      if (!warehouseAddressId || isNaN(parseInt(warehouseAddressId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid WarehouseAddressID is required',
          data: null,
          warehouseId
        });
      }
      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CreatedByID is required',
          data: null,
          warehouseId
        });
      }

      const data = {
        warehouseName: warehouseName.trim(),
        warehouseAddressId: parseInt(warehouseAddressId),
        createdById: parseInt(createdById)
      };

      console.log('Updating warehouse with id:', warehouseId, 'and data:', JSON.stringify(data, null, 2));
      const result = await WarehouseModel.updateWarehouse(warehouseId, data);
      console.log('Update warehouse result:', JSON.stringify(result, null, 2));

      if (!result) {
        throw new Error('Invalid response from WarehouseModel');
      }

      return res.status(200).json({
        success: true,
        message: result.message || 'Warehouse updated successfully',
        data: null,
        warehouseId
      });
    } catch (err) {
      console.error('updateWarehouse error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        warehouseId: null
      });
    }
  }

  static async deleteWarehouse(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      const warehouseId = parseInt(id, 10);
      if (!id || isNaN(warehouseId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid WarehouseID is required',
          data: null,
          warehouseId: null
        });
      }

      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CreatedByID is required',
          data: null,
          warehouseId
        });
      }

      console.log('Deleting warehouse with id:', warehouseId, 'by createdById:', createdById);
      const result = await WarehouseModel.deleteWarehouse(warehouseId, parseInt(createdById));
      console.log('Delete warehouse result:', JSON.stringify(result, null, 2));

      return res.status(200).json({
        success: true,
        message: result.message || 'Warehouse deleted successfully',
        data: null,
        warehouseId
      });
    } catch (err) {
      console.error('deleteWarehouse error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        warehouseId: null
      });
    }
  }
}

module.exports = WarehouseController;
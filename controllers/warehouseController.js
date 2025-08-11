const WarehouseModel = require('../models/warehouseModel');

class WarehouseController {
  static async getAllWarehouses(req, res) {
    try {
      const { pageNumber = 1, pageSize = 10, fromDate, toDate } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(pageNumber, 10);
      const pageSz = parseInt(pageSize, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          pagination: null
        });
      }
      if (isNaN(pageSz) || pageSz < 1 || pageSz > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize (must be between 1 and 100)',
          data: null,
          pagination: null
        });
      }

      // Validate date parameters if provided
      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fromDate format (use YYYY-MM-DD)',
          data: null,
          pagination: null
        });
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid toDate format (use YYYY-MM-DD)',
          data: null,
          pagination: null
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
        pagination: {
          totalRecords: warehouses.totalRecords,
          currentPage: warehouses.currentPage,
          pageSize: warehouses.pageSize,
          totalPages: warehouses.totalPages
        }
      });
    } catch (err) {
      console.error('getAllWarehouses error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pagination: null
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
          totalRecords: 0
        });
      }
      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid createdById is required',
          data: null,
          totalRecords: 0
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
        totalRecords: 0
      });
    } catch (err) {
      console.error('createWarehouse error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        totalRecords: 0
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
          totalRecords: 0
        });
      }

      const warehouse = await WarehouseModel.getWarehouseById(warehouseId);

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found',
          data: null,
          totalRecords: 0
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Warehouse retrieved successfully',
        data: warehouse,
        totalRecords: 1
      });
    } catch (err) {
      console.error('getWarehouseById error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        totalRecords: 0
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
          totalRecords: 0
        });
      }

      if (!warehouseName || typeof warehouseName !== 'string' || warehouseName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Valid WarehouseName is required',
          data: null,
          totalRecords: 0
        });
      }
      if (!warehouseAddressId || isNaN(parseInt(warehouseAddressId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid WarehouseAddressID is required',
          data: null,
          totalRecords: 0
        });
      }
      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CreatedByID is required',
          data: null,
          totalRecords: 0
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
        totalRecords: 0
      });
    } catch (err) {
      console.error('updateWarehouse error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        totalRecords: 0
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
          totalRecords: 0
        });
      }

      if (!createdById || isNaN(parseInt(createdById))) {
        return res.status(400).json({
          success: false,
          message: 'Valid CreatedByID is required',
          data: null,
          totalRecords: 0
        });
      }

      console.log('Deleting warehouse with id:', warehouseId, 'by createdById:', createdById);
      const result = await WarehouseModel.deleteWarehouse(warehouseId, parseInt(createdById));
      console.log('Delete warehouse result:', JSON.stringify(result, null, 2));

      return res.status(200).json({
        success: true,
        message: result.message || 'Warehouse deleted successfully',
        data: null,
        totalRecords: 0
      });
    } catch (err) {
      console.error('deleteWarehouse error:', err.stack);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        totalRecords: 0
      });
    }
  }
}

module.exports = WarehouseController;
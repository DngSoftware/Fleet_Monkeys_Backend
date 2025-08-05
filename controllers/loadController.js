const LoadModel = require('../models/loadModel');

class LoadController {
  // Get all Loads with pagination
  static async getAllLoads(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      let parsedPageNumber = parseInt(pageNumber, 10);
      let parsedPageSize = parseInt(pageSize, 10);
      if (isNaN(parsedPageNumber) || parsedPageNumber < 1) parsedPageNumber = 1;
      if (isNaN(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > 100) parsedPageSize = 10;

      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        return res.status(400).json({ success: false, message: 'Invalid fromDate format (use YYYY-MM-DD)', data: null, pagination: null });
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        return res.status(400).json({ success: false, message: 'Invalid toDate format (use YYYY-MM-DD)', data: null, pagination: null });
      }

      const loads = await LoadModel.getAllLoads({
        pageNumber: parsedPageNumber,
        pageSize: parsedPageSize,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      return res.status(200).json({
        success: true,
        message: 'Loads retrieved successfully',
        data: loads.data || [],
        pagination: {
          totalRecords: loads.totalRecords,
          currentPage: loads.currentPage,
          pageSize: loads.pageSize,
          totalPages: loads.totalPages
        }
      });
    } catch (err) {
      console.error('getAllLoads error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null, pagination: null });
    }
  }

  // Create a new Load
  static async createLoad(req, res) {
    try {
      const {
        loadCode,
        driverId,
        vehicleId,
        companyId,
        originWarehouseId,
        destinationAddressId,
        destinationWarehouseId,
        availableToLoadDateTime,
        loadStartDate,
        loadStatusId,
        loadTypeId,
        sortOrderId,
        weight,
        volume,
        weightUomId,
        volumeUomId,
        repackagedPalletOrTobaccoId,
        createdById
      } = req.body;

      console.log('createLoad request body:', JSON.stringify(req.body, null, 2));

      // Validate required fields
      const requiredFields = [
        'loadCode',
        'driverId',
        'vehicleId',
        'companyId',
        'originWarehouseId',
        'destinationWarehouseId',
        'loadStatusId',
        'loadTypeId',
        'weight',
        'volume',
        'weightUomId',
        'volumeUomId',
        'createdById'
      ];
      const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          data: null,
          loadId: null
        });
      }

      // Validate numeric fields
      const numericFields = ['driverId', 'vehicleId', 'companyId', 'originWarehouseId', 'destinationAddressId', 'destinationWarehouseId', 'loadStatusId', 'loadTypeId', 'sortOrderId', 'weight', 'volume', 'weightUomId', 'volumeUomId', 'repackagedPalletOrTobaccoId', 'createdById'];
      numericFields.forEach(field => {
        if (req.body[field] !== undefined && (typeof req.body[field] !== 'number' || isNaN(req.body[field]))) {
          throw new Error(`Invalid value for ${field}: must be a number`);
        }
      });

      // Validate date fields
      const dateFields = ['availableToLoadDateTime', 'loadStartDate'];
      dateFields.forEach(field => {
        if (req.body[field] && isNaN(new Date(req.body[field]).getTime())) {
          throw new Error(`Invalid value for ${field}: must be a valid date`);
        }
      });

      const result = await LoadModel.createLoad({
        loadCode,
        driverId,
        vehicleId,
        companyId,
        originWarehouseId,
        destinationAddressId,
        destinationWarehouseId,
        availableToLoadDateTime,
        loadStartDate,
        loadStatusId,
        loadTypeId,
        sortOrderId,
        weight,
        volume,
        weightUomId,
        volumeUomId,
        repackagedPalletOrTobaccoId,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        loadId: result.loadId
      });
    } catch (err) {
      console.error('createLoad error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to create load: ${err.message}`,
        data: null,
        loadId: null
      });
    }
  }

  // Get a single Load by ID
  static async getLoadById(req, res) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({ success: false, message: 'Valid LoadID is required', data: null, loadId: null });
      }

      const load = await LoadModel.getLoadById(parsedId);

      if (!load) {
        return res.status(404).json({ success: false, message: 'Load not found', data: null, loadId: parsedId });
      }

      return res.status(200).json({
        success: true,
        message: 'Load retrieved successfully',
        data: load,
        loadId: parsedId
      });
    } catch (err) {
      console.error('getLoadById error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to retrieve load: ${err.message}`,
        data: null,
        loadId: parseInt(req.params.id, 10) || null
      });
    }
  }

  // Update a Load
  static async updateLoad(req, res) {
    try {
      const { id } = req.params;
      const {
        loadCode,
        driverId,
        vehicleId,
        companyId,
        originWarehouseId,
        destinationAddressId,
        destinationWarehouseId,
        availableToLoadDateTime,
        loadStartDate,
        loadStatusId,
        loadTypeId,
        sortOrderId,
        weight,
        volume,
        weightUomId,
        volumeUomId,
        repackagedPalletOrTobaccoId,
        createdById
      } = req.body;

      console.log('updateLoad request body:', JSON.stringify(req.body, null, 2));

      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ success: false, message: 'Valid LoadID is required', data: null, loadId: null });
      }

      if (!createdById) {
        return res.status(400).json({ success: false, message: 'CreatedByID is required', data: null, loadId: parsedId });
      }

      // Validate numeric fields if provided
      const numericFields = ['driverId', 'vehicleId', 'companyId', 'originWarehouseId', 'destinationAddressId', 'destinationWarehouseId', 'loadStatusId', 'loadTypeId', 'sortOrderId', 'weight', 'volume', 'weightUomId', 'volumeUomId', 'repackagedPalletOrTobaccoId', 'createdById'];
      numericFields.forEach(field => {
        if (req.body[field] !== undefined && (typeof req.body[field] !== 'number' || isNaN(req.body[field]))) {
          throw new Error(`Invalid value for ${field}: must be a number`);
        }
      });

      // Validate date fields if provided
      const dateFields = ['availableToLoadDateTime', 'loadStartDate'];
      dateFields.forEach(field => {
        if (req.body[field] && isNaN(new Date(req.body[field]).getTime())) {
          throw new Error(`Invalid value for ${field}: must be a valid date`);
        }
      });

      const result = await LoadModel.updateLoad(parsedId, {
        loadCode,
        driverId,
        vehicleId,
        companyId,
        originWarehouseId,
        destinationAddressId,
        destinationWarehouseId,
        availableToLoadDateTime,
        loadStartDate,
        loadStatusId,
        loadTypeId,
        sortOrderId,
        weight,
        volume,
        weightUomId,
        volumeUomId,
        repackagedPalletOrTobaccoId,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        loadId: parsedId
      });
    } catch (err) {
      console.error('updateLoad error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to update load: ${err.message}`,
        data: null,
        loadId: parseInt(req.params.id, 10) || null
      });
    }
  }

  // Delete a Load
  static async deleteLoad(req, res) {
    try {
      const { id } = req.params;
      const { deletedById } = req.body;
      const parsedId = parseInt(id, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({ success: false, message: 'Valid LoadID is required', data: null, loadId: null });
      }

      if (!deletedById) {
        return res.status(400).json({ success: false, message: 'DeletedByID is required', data: null, loadId: parsedId });
      }

      const result = await LoadModel.deleteLoad(parsedId, deletedById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        loadId: parsedId
      });
    } catch (err) {
      console.error('deleteLoad error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to delete load: ${err.message}`,
        data: null,
        loadId: parseInt(req.params.id, 10) || null
      });
    }
  }
}

module.exports = LoadController;
const ServiceTypeModel = require('../models/serviceTypeModel');

class ServiceTypeController {
  // Get all Service Types with pagination
  static async getAllServiceTypes(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate pagination parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          pagination: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          pagination: null
        });
      }

      // Validate date parameters
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

      const serviceTypes = await ServiceTypeModel.getAllServiceTypes({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      return res.status(200).json({
        success: true,
        message: 'Service types retrieved successfully',
        data: serviceTypes.data || [],
        pagination: {
          totalRecords: serviceTypes.totalRecords,
          currentPage: serviceTypes.currentPage,
          pageSize: serviceTypes.pageSize,
          totalPages: serviceTypes.totalPages
        }
      });
    } catch (err) {
      console.error('getAllServiceTypes error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pagination: null
      });
    }
  }

  // Create a new Service Type
  static async createServiceType(req, res) {
    try {
      const { serviceGroup, serviceType, createdById } = req.body;

      // Basic validation
      if (!serviceGroup || !serviceType || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'ServiceGroup, ServiceType, and CreatedByID are required',
          data: null,
          serviceTypeId: null
        });
      }

      const result = await ServiceTypeModel.createServiceType({
        serviceGroup,
        serviceType,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        serviceTypeId: result.serviceTypeId
      });
    } catch (err) {
      console.error('createServiceType error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        serviceTypeId: null
      });
    }
  }

  // Get a single Service Type by ID
  static async getServiceTypeById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid ServiceTypeID is required',
          data: null,
          serviceTypeId: null
        });
      }

      const serviceType = await ServiceTypeModel.getServiceTypeById(parseInt(id));

      if (!serviceType) {
        return res.status(404).json({
          success: false,
          message: 'Service type not found',
          data: null,
          serviceTypeId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Service type retrieved successfully',
        data: serviceType,
        serviceTypeId: id
      });
    } catch (err) {
      console.error('getServiceTypeById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        serviceTypeId: null
      });
    }
  }

  // Update a Service Type
  static async updateServiceType(req, res) {
    try {
      const { id } = req.params;
      const { serviceGroup, serviceType, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid ServiceTypeID is required',
          data: null,
          serviceTypeId: null
        });
      }

      if (!serviceGroup || !serviceType || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'ServiceGroup, ServiceType, and CreatedByID are required',
          data: null,
          serviceTypeId: id
        });
      }

      const result = await ServiceTypeModel.updateServiceType(parseInt(id), {
        serviceGroup,
        serviceType,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        serviceTypeId: id
      });
    } catch (err) {
      console.error('updateServiceType error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        serviceTypeId: null
      });
    }
  }

  // Delete a Service Type
  static async deleteServiceType(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid ServiceTypeID is required',
          data: null,
          serviceTypeId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          serviceTypeId: id
        });
      }

      const result = await ServiceTypeModel.deleteServiceType(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        serviceTypeId: id
      });
    } catch (err) {
      console.error('deleteServiceType error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        serviceTypeId: null
      });
    }
  }
}

module.exports = ServiceTypeController;
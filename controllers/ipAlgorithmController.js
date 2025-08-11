const IPAlgorithmModel = require('../models/ipAlgorithmModel');

class IPAlgorithmController {
  static async createIPAlgorithm(req, res) {
    try {
      const ipAlgorithmData = {
        ProfitPercent: req.body.ProfitPercent ? parseFloat(req.body.ProfitPercent) : null,
        TransportPercent: req.body.TransportPercent ? parseFloat(req.body.TransportPercent) : null,
        AdditionalPercent: req.body.AdditionalPercent ? parseFloat(req.body.AdditionalPercent) : null,
        SupplierExchangeAmount: req.body.SupplierExchangeAmount ? parseFloat(req.body.SupplierExchangeAmount) : null,
        SalesAmount: req.body.SalesAmount ? parseFloat(req.body.SalesAmount) : null,
        ProfitAmount: req.body.ProfitAmount ? parseFloat(req.body.ProfitAmount) : null,
        TransportAmount: req.body.TransportAmount ? parseFloat(req.body.TransportAmount) : null,
        AdditionalAmount: req.body.AdditionalAmount ? parseFloat(req.body.AdditionalAmount) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await IPAlgorithmModel.createIPAlgorithm(ipAlgorithmData);
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json({
        ...result,
        message: 'IP Algorithm created successfully.',
      });
    } catch (error) {
      console.error('Create IPAlgorithm error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      });
    }
  }

  static async updateIPAlgorithm(req, res) {
    try {
      const ipAlgorithmID = parseInt(req.params.id);
      if (isNaN(ipAlgorithmID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing IPAlgorithmID',
          data: null,
          ipAlgorithmID: null,
          newIPAlgorithmID: null,
        });
      }

      const ipAlgorithmData = {
        IPAlgorithmID: ipAlgorithmID,
        ProfitPercent: req.body.ProfitPercent ? parseFloat(req.body.ProfitPercent) : null,
        TransportPercent: req.body.TransportPercent ? parseFloat(req.body.TransportPercent) : null,
        AdditionalPercent: req.body.AdditionalPercent ? parseFloat(req.body.AdditionalPercent) : null,
        SupplierExchangeAmount: req.body.SupplierExchangeAmount ? parseFloat(req.body.SupplierExchangeAmount) : null,
        SalesAmount: req.body.SalesAmount ? parseFloat(req.body.SalesAmount) : null,
        ProfitAmount: req.body.ProfitAmount ? parseFloat(req.body.ProfitAmount) : null,
        TransportAmount: req.body.TransportAmount ? parseFloat(req.body.TransportAmount) : null,
        AdditionalAmount: req.body.AdditionalAmount ? parseFloat(req.body.AdditionalAmount) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await IPAlgorithmModel.updateIPAlgorithm(ipAlgorithmData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update IPAlgorithm error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      });
    }
  }

  static async deleteIPAlgorithm(req, res) {
    try {
      const ipAlgorithmID = parseInt(req.params.id);
      if (isNaN(ipAlgorithmID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing IPAlgorithmID',
          data: null,
          ipAlgorithmID: null,
          newIPAlgorithmID: null,
        });
      }

      const ipAlgorithmData = {
        IPAlgorithmID: ipAlgorithmID,
        DeletedByID: parseInt(req.body.DeletedByID) || req.user.personId,
      };

      const result = await IPAlgorithmModel.deleteIPAlgorithm(ipAlgorithmData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete IPAlgorithm error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      });
    }
  }

  static async getIPAlgorithm(req, res) {
    try {
      const ipAlgorithmID = parseInt(req.params.id);
      if (isNaN(ipAlgorithmID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing IPAlgorithmID',
          data: null,
          ipAlgorithmID: null,
          newIPAlgorithmID: null,
        });
      }

      const ipAlgorithmData = {
        IPAlgorithmID: ipAlgorithmID,
      };

      const result = await IPAlgorithmModel.getIPAlgorithm(ipAlgorithmData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get IPAlgorithm error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      });
    }
  }

  static async getAllIPAlgorithms(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
      };

      console.log('getAllIPAlgorithms paginationData:', paginationData);

      if (paginationData.PageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          ipAlgorithmID: null,
          newIPAlgorithmID: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          ipAlgorithmID: null,
          newIPAlgorithmID: null,
        });
      }

      const result = await IPAlgorithmModel.getAllIPAlgorithms(paginationData);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        pagination: {
          pageNumber: paginationData.PageNumber,
          pageSize: paginationData.PageSize,
          totalRecords: result.totalRecords || 0,
          totalPages: Math.ceil(result.totalRecords / paginationData.PageSize),
        },
      });
    } catch (error) {
      console.error('Get All IPAlgorithms error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        ipAlgorithmID: null,
        newIPAlgorithmID: null,
      });
    }
  }
}

module.exports = IPAlgorithmController;
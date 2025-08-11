const LoadModel = require('../models/loadModel');

class LoadController {
  static async createLoad(req, res) {
    try {
      const loadData = {
        LoadCode: req.body.LoadCode || null,
        DriverID: req.body.DriverID ? parseInt(req.body.DriverID) : null,
        VehicleID: req.body.VehicleID ? parseInt(req.body.VehicleID) : null,
        CompanyID: req.body.CompanyID ? parseInt(req.body.CompanyID) : null,
        OriginWarehouseID: req.body.OriginWarehouseID ? parseInt(req.body.OriginWarehouseID) : null,
        DestinationAddressID: req.body.DestinationAddressID ? parseInt(req.body.DestinationAddressID) : null,
        DestinationWarehouseID: req.body.DestinationWarehouseID ? parseInt(req.body.DestinationWarehouseID) : null,
        AvailableToLoadDateTime: req.body.AvailableToLoadDateTime ? new Date(req.body.AvailableToLoadDateTime) : null,
        LoadStartDate: req.body.LoadStartDate ? new Date(req.body.LoadStartDate) : null,
        LoadStatusID: req.body.LoadStatusID ? parseInt(req.body.LoadStatusID) : null,
        LoadTypeID: req.body.LoadTypeID ? parseInt(req.body.LoadTypeID) : null,
        SortOrderID: req.body.SortOrderID ? parseInt(req.body.SortOrderID) : null,
        Weight: req.body.Weight ? parseFloat(req.body.Weight) : null,
        Volume: req.body.Volume ? parseFloat(req.body.Volume) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        RepackagedPalletOrTobaccoID: req.body.RepackagedPalletOrTobaccoID ? parseInt(req.body.RepackagedPalletOrTobaccoID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await LoadModel.createLoad(loadData);
      console.log('Create Load result:', result);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create Load error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadId: null,
        newLoadId: null,
      });
    }
  }

  static async updateLoad(req, res) {
    try {
      const loadId = parseInt(req.params.id);
      if (isNaN(loadId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing LoadID',
          data: null,
          loadId: null,
          newLoadId: null,
        });
      }

      const loadData = {
        LoadID: loadId,
        LoadCode: req.body.LoadCode || null,
        DriverID: req.body.DriverID ? parseInt(req.body.DriverID) : null,
        VehicleID: req.body.VehicleID ? parseInt(req.body.VehicleID) : null,
        CompanyID: req.body.CompanyID ? parseInt(req.body.CompanyID) : null,
        OriginWarehouseID: req.body.OriginWarehouseID ? parseInt(req.body.OriginWarehouseID) : null,
        DestinationAddressID: req.body.DestinationAddressID ? parseInt(req.body.DestinationAddressID) : null,
        DestinationWarehouseID: req.body.DestinationWarehouseID ? parseInt(req.body.DestinationWarehouseID) : null,
        AvailableToLoadDateTime: req.body.AvailableToLoadDateTime ? new Date(req.body.AvailableToLoadDateTime) : null,
        LoadStartDate: req.body.LoadStartDate ? new Date(req.body.LoadStartDate) : null,
        LoadStatusID: req.body.LoadStatusID ? parseInt(req.body.LoadStatusID) : null,
        LoadTypeID: req.body.LoadTypeID ? parseInt(req.body.LoadTypeID) : null,
        SortOrderID: req.body.SortOrderID ? parseInt(req.body.SortOrderID) : null,
        Weight: req.body.Weight ? parseFloat(req.body.Weight) : null,
        Volume: req.body.Volume ? parseFloat(req.body.Volume) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        RepackagedPalletOrTobaccoID: req.body.RepackagedPalletOrTobaccoID ? parseInt(req.body.RepackagedPalletOrTobaccoID) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await LoadModel.updateLoad(loadData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update Load error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadId: null,
        newLoadId: null,
      });
    }
  }

  static async deleteLoad(req, res) {
    try {
      const loadId = parseInt(req.params.id);
      if (isNaN(loadId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing LoadID',
          data: null,
          loadId: null,
          newLoadId: null,
        });
      }

      const loadData = {
        LoadID: loadId,
        DeletedByID: parseInt(req.body.DeletedByID) || req.user.personId,
      };

      const result = await LoadModel.deleteLoad(loadData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete Load error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadId: null,
        newLoadId: null,
      });
    }
  }

  static async hardDeleteLoad(req, res) {
    try {
      const loadId = parseInt(req.params.id);
      if (isNaN(loadId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing LoadID',
          data: null,
          loadId: null,
          newLoadId: null,
        });
      }

      const loadData = {
        LoadID: loadId,
        DeletedByID: parseInt(req.body.DeletedByID) || req.user.personId,
      };

      const result = await LoadModel.hardDeleteLoad(loadData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Hard Delete Load error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadId: null,
        newLoadId: null,
      });
    }
  }

  static async getLoad(req, res) {
    try {
      const loadId = parseInt(req.params.id);
      if (isNaN(loadId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing LoadID',
          data: null,
          loadId: null,
          newLoadId: null,
        });
      }

      const loadData = {
        LoadID: loadId,
      };

      const result = await LoadModel.getLoad(loadData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get Load error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadId: null,
        newLoadId: null,
      });
    }
  }

  static async getAllLoads(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
        FromDate: req.query.fromDate || null,
        ToDate: req.query.toDate || null,
      };

      if (paginationData.PageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          totalRecords: 0,
          loadId: null,
          newLoadId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          loadId: null,
          newLoadId: null,
        });
      }

      const result = await LoadModel.getAllLoads(paginationData);
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
      console.error('Get All Loads error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        totalRecords: 0,
        loadId: null,
        newLoadId: null,
      });
    }
  }
}

module.exports = LoadController;
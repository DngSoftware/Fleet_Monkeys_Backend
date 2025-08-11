const LoadTrailerModel = require('../models/loadTrailerModel');

class LoadTrailerController {
  static async createLoadTrailer(req, res) {
    try {
      const loadTrailerData = {
        LoadTrailerID: req.body.LoadTrailerID ? parseInt(req.body.LoadTrailerID) : null,
        LoadID: req.body.LoadID ? parseInt(req.body.LoadID) : null,
        TrailerID: req.body.TrailerID ? parseInt(req.body.TrailerID) : null,
        TrailerRegistrationNumber: req.body.TrailerRegistrationNumber || null,
        TrailerLength: req.body.TrailerLength ? parseFloat(req.body.TrailerLength) : null,
        TrailerWidth: req.body.TrailerWidth ? parseFloat(req.body.TrailerWidth) : null,
        TrailerHeight: req.body.TrailerHeight ? parseFloat(req.body.TrailerHeight) : null,
        MaxAllowableVolume: req.body.MaxAllowableVolume ? parseFloat(req.body.MaxAllowableVolume) : null,
        MaxAllowableWeight: req.body.MaxAllowableWeight ? parseFloat(req.body.MaxAllowableWeight) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await LoadTrailerModel.createLoadTrailer(loadTrailerData);
      console.log('Create LoadTrailer result:', result);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create LoadTrailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      });
    }
  }

  static async updateLoadTrailer(req, res) {
    try {
      const loadTrailerId = parseInt(req.params.id);
      if (isNaN(loadTrailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing LoadTrailerID',
          data: null,
          loadTrailerId: null,
          newLoadTrailerId: null,
        });
      }

      const loadTrailerData = {
        LoadTrailerID: loadTrailerId,
        LoadID: req.body.LoadID ? parseInt(req.body.LoadID) : null,
        TrailerID: req.body.TrailerID ? parseInt(req.body.TrailerID) : null,
        TrailerRegistrationNumber: req.body.TrailerRegistrationNumber || null,
        TrailerLength: req.body.TrailerLength ? parseFloat(req.body.TrailerLength) : null,
        TrailerWidth: req.body.TrailerWidth ? parseFloat(req.body.TrailerWidth) : null,
        TrailerHeight: req.body.TrailerHeight ? parseFloat(req.body.TrailerHeight) : null,
        MaxAllowableVolume: req.body.MaxAllowableVolume ? parseFloat(req.body.MaxAllowableVolume) : null,
        MaxAllowableWeight: req.body.MaxAllowableWeight ? parseFloat(req.body.MaxAllowableWeight) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await LoadTrailerModel.updateLoadTrailer(loadTrailerData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update LoadTrailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      });
    }
  }

  static async deleteLoadTrailer(req, res) {
    try {
      const loadTrailerId = parseInt(req.params.id);
      if (isNaN(loadTrailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing LoadTrailerID',
          data: null,
          loadTrailerId: null,
          newLoadTrailerId: null,
        });
      }

      const loadTrailerData = {
        LoadTrailerID: loadTrailerId,
        DeletedByID: parseInt(req.body.DeletedByID) || req.user.personId,
      };

      const result = await LoadTrailerModel.deleteLoadTrailer(loadTrailerData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete LoadTrailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      });
    }
  }

  static async getLoadTrailer(req, res) {
    try {
      const loadTrailerId = parseInt(req.params.id);
      if (isNaN(loadTrailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing LoadTrailerID',
          data: null,
          loadTrailerId: null,
          newLoadTrailerId: null,
        });
      }

      const loadTrailerData = {
        LoadTrailerID: loadTrailerId,
      };

      const result = await LoadTrailerModel.getLoadTrailer(loadTrailerData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get LoadTrailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        loadTrailerId: null,
        newLoadTrailerId: null,
      });
    }
  }

  static async getAllLoadTrailers(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
      };

      if (paginationData.PageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          totalRecords: 0,
          loadTrailerId: null,
          newLoadTrailerId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          loadTrailerId: null,
          newLoadTrailerId: null,
        });
      }

      const result = await LoadTrailerModel.getAllLoadTrailers(paginationData);
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
      console.error('Get All LoadTrailers error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        totalRecords: 0,
        loadTrailerId: null,
        newLoadTrailerId: null,
      });
    }
  }
}

module.exports = LoadTrailerController;
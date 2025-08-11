const TrailerModel = require('../models/trailerModel');

class TrailerController {
  static async createTrailer(req, res) {
    try {
      const trailerData = {
        TrailerType: req.body.TrailerType || null,
        MaxWeight: req.body.MaxWeight ? parseFloat(req.body.MaxWeight) : null,
        TrailerLength: req.body.TrailerLength ? parseFloat(req.body.TrailerLength) : null,
        TrailerWidth: req.body.TrailerWidth ? parseFloat(req.body.TrailerWidth) : null,
        TrailerHeight: req.body.TrailerHeight ? parseFloat(req.body.TrailerHeight) : null,
        TrailerRegistrationNumber: req.body.TrailerRegistrationNumber || null,
        MaxAllowableVolume: req.body.MaxAllowableVolume ? parseFloat(req.body.MaxAllowableVolume) : null,
        MaxAllowableWeight: req.body.MaxAllowableWeight ? parseFloat(req.body.MaxAllowableWeight) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await TrailerModel.createTrailer(trailerData);
      console.log('Create Trailer result:', result);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create Trailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        trailerId: null,
        newTrailerId: null,
      });
    }
  }

  static async updateTrailer(req, res) {
    try {
      const trailerId = parseInt(req.params.id);
      if (isNaN(trailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing TrailerID',
          data: null,
          trailerId: null,
          newTrailerId: null,
        });
      }

      const trailerData = {
        TrailerID: trailerId,
        TrailerType: req.body.TrailerType || null,
        MaxWeight: req.body.MaxWeight ? parseFloat(req.body.MaxWeight) : null,
        TrailerLength: req.body.TrailerLength ? parseFloat(req.body.TrailerLength) : null,
        TrailerWidth: req.body.TrailerWidth ? parseFloat(req.body.TrailerWidth) : null,
        TrailerHeight: req.body.TrailerHeight ? parseFloat(req.body.TrailerHeight) : null,
        TrailerRegistrationNumber: req.body.TrailerRegistrationNumber || null,
        MaxAllowableVolume: req.body.MaxAllowableVolume ? parseFloat(req.body.MaxAllowableVolume) : null,
        MaxAllowableWeight: req.body.MaxAllowableWeight ? parseFloat(req.body.MaxAllowableWeight) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await TrailerModel.updateTrailer(trailerData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update Trailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        trailerId: null,
        newTrailerId: null,
      });
    }
  }

  static async deleteTrailer(req, res) {
    try {
      const trailerId = parseInt(req.params.id);
      if (isNaN(trailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing TrailerID',
          data: null,
          trailerId: null,
          newTrailerId: null,
        });
      }

      const trailerData = {
        TrailerID: trailerId,
        DeletedByID: parseInt(req.body.DeletedByID) || req.user.personId,
      };

      const result = await TrailerModel.deleteTrailer(trailerData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete Trailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        trailerId: null,
        newTrailerId: null,
      });
    }
  }

  static async getTrailer(req, res) {
    try {
      const trailerId = parseInt(req.params.id);
      if (isNaN(trailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing TrailerID',
          data: null,
          trailerId: null,
          newTrailerId: null,
        });
      }

      const trailerData = {
        TrailerID: trailerId,
      };

      const result = await TrailerModel.getTrailer(trailerData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get Trailer error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        trailerId: null,
        newTrailerId: null,
      });
    }
  }

  static async getAllTrailers(req, res) {
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
          trailerId: null,
          newTrailerId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          totalRecords: 0,
          trailerId: null,
          newTrailerId: null,
        });
      }

      const result = await TrailerModel.getAllTrailers(paginationData);
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
      console.error('Get All Trailers error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        totalRecords: 0,
        trailerId: null,
        newTrailerId: null,
      });
    }
  }
}

module.exports = TrailerController;
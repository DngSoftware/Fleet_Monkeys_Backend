const TrailerModel = require('../models/trailerModel');

class TrailerController {
  static async getAllTrailers(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      let parsedPageNumber = parseInt(pageNumber, 10);
      let parsedPageSize = parseInt(pageSize, 10);
      if (isNaN(parsedPageNumber) || parsedPageNumber < 1) parsedPageNumber = 1;
      if (isNaN(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > 100) parsedPageSize = 10;

      const result = await TrailerModel.getAllTrailers({
        pageNumber: parsedPageNumber,
        pageSize: parsedPageSize,
        fromDate,
        toDate
      });
      res.status(200).json({
        success: true,
        message: 'Trailers retrieved successfully',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      console.error('getAllTrailers controller error:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to retrieve trailers',
        data: null,
        pagination: null
      });
    }
  }

  static async createTrailer(req, res) {
    try {
      const data = req.body;
      console.log('createTrailer request body:', JSON.stringify(data, null, 2));

      // Validate required fields
      const requiredFields = ['trailerType', 'maxWeight', 'trailerLength', 'trailerWidth', 'trailerHeight', 'trailerRegistrationNumber', 'maxAllowableVolume', 'maxAllowableWeight', 'createdById'];
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate numeric fields
      const numericFields = ['maxWeight', 'trailerLength', 'trailerWidth', 'trailerHeight', 'maxAllowableVolume', 'maxAllowableWeight'];
      numericFields.forEach(field => {
        if (typeof data[field] !== 'number' || isNaN(data[field])) {
          throw new Error(`Invalid value for ${field}: must be a number`);
        }
      });

      const result = await TrailerModel.createTrailer(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        trailerId: result.trailerId
      });
    } catch (err) {
      console.error('createTrailer controller error:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to create trailer',
        data: null,
        trailerId: null
      });
    }
  }

  static async getTrailerById(req, res) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new Error('Invalid Trailer ID');
      }
      const result = await TrailerModel.getTrailerById(parsedId);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Trailer not found',
          data: null,
          trailerId: parsedId
        });
      }
      res.status(200).json({
        success: true,
        message: 'Trailer retrieved successfully',
        data: result,
        trailerId: parsedId
      });
    } catch (err) {
      console.error('getTrailerById controller error:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to retrieve trailer',
        data: null,
        trailerId: parseInt(req.params.id, 10) || null
      });
    }
  }

  static async updateTrailer(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      console.log('updateTrailer request body:', JSON.stringify(data, null, 2));

      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new Error('Invalid Trailer ID');
      }
      if (!data.createdById) {
        throw new Error('CreatedByID is required');
      }

      // Validate numeric fields if provided
      const numericFields = ['maxWeight', 'trailerLength', 'trailerWidth', 'trailerHeight', 'maxAllowableVolume', 'maxAllowableWeight'];
      numericFields.forEach(field => {
        if (data[field] !== undefined && (typeof data[field] !== 'number' || isNaN(data[field]))) {
          throw new Error(`Invalid value for ${field}: must be a number`);
        }
      });

      const result = await TrailerModel.updateTrailer(parsedId, data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        trailerId: parsedId
      });
    } catch (err) {
      console.error('updateTrailer controller error:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to update trailer',
        data: null,
        trailerId: parseInt(req.params.id, 10) || null
      });
    }
  }

  static async deleteTrailer(req, res) {
    try {
      const { id } = req.params;
      const { deletedById } = req.body;
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new Error('Invalid Trailer ID');
      }
      if (!deletedById) {
        throw new Error('DeletedByID is required');
      }
      const result = await TrailerModel.deleteTrailer(parsedId, deletedById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        trailerId: parsedId
      });
    } catch (err) {
      console.error('deleteTrailer controller error:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete trailer',
        data: null,
        trailerId: parseInt(req.params.id, 10) || null
      });
    }
  }
}

module.exports = TrailerController;
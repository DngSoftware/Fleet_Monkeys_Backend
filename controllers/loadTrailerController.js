const LoadTrailerModel = require('../models/loadTrailerModel');

class LoadTrailerController {
  // Get all LoadTrailer assignments
  static async getAllLoadTrailers(req, res) {
    try {
      const result = await LoadTrailerModel.getAllLoadTrailers();

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (err) {
      console.error('getAllLoadTrailers error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to retrieve LoadTrailer assignments: ${err.message}`,
        data: null
      });
    }
  }

  // Get a single LoadTrailer assignment by ID
  static async getLoadTrailerById(req, res) {
    try {
      const { loadTrailerId } = req.params;
      const parsedLoadTrailerId = parseInt(loadTrailerId, 10);

      if (isNaN(parsedLoadTrailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid loadTrailerId: must be a number',
          data: null,
          loadTrailerId: null
        });
      }

      const result = await LoadTrailerModel.getLoadTrailerById(parsedLoadTrailerId);

      if (!result.data) {
        return res.status(404).json({
          success: false,
          message: 'LoadTrailer not found',
          data: null,
          loadTrailerId: parsedLoadTrailerId
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        loadTrailerId: parsedLoadTrailerId
      });
    } catch (err) {
      console.error('getLoadTrailerById error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to retrieve LoadTrailer: ${err.message}`,
        data: null,
        loadTrailerId: parseInt(req.params.loadTrailerId, 10) || null
      });
    }
  }

  // Create a new LoadTrailer assignment
  static async createLoadTrailer(req, res) {
    try {
      console.log('createLoadTrailer raw request body:', JSON.stringify(req.body, null, 2));

      // Parse numeric fields explicitly
      const loadTrailerId = req.body.loadTrailerId ? parseInt(req.body.loadTrailerId, 10) : null;
      const loadId = parseInt(req.body.loadId, 10);
      const trailerId = parseInt(req.body.trailerId, 10);
      const trailerLength = req.body.TrailerLength ? parseFloat(req.body.TrailerLength) : null;
      const trailerWidth = req.body.TrailerWidth ? parseFloat(req.body.TrailerWidth) : null;
      const trailerHeight = req.body.TrailerHeight ? parseFloat(req.body.TrailerHeight) : null;
      const maxAllowableVolume = req.body.MaxAllowableVolume ? parseFloat(req.body.MaxAllowableVolume) : null;
      const maxAllowableWeight = req.body.MaxAllowableWeight ? parseFloat(req.body.MaxAllowableWeight) : null;
      const createdById = parseInt(req.body.createdById, 10);

      // Validate required fields
      const requiredFields = ['loadId', 'trailerId', 'createdById'];
      const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          data: null,
          loadTrailerId: null
        });
      }

      // Validate numeric fields
      const numericFields = { loadTrailerId, loadId, trailerId, createdById };
      for (const [field, value] of Object.entries(numericFields)) {
        if (value !== null && (isNaN(value) || value < 0)) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}: must be a non-negative number`,
            data: null,
            loadTrailerId: null
          });
        }
      }

      // Validate decimal fields
      const decimalFields = { trailerLength, trailerWidth, trailerHeight, maxAllowableVolume, maxAllowableWeight };
      for (const [field, value] of Object.entries(decimalFields)) {
        if (value !== null && (isNaN(value) || value < 0)) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}: must be a non-negative number`,
            data: null,
            loadTrailerId: null
          });
        }
      }

      // Validate TrailerRegistrationNumber
      const trailerRegistrationNumber = req.body.TrailerRegistrationNumber || null;
      if (trailerRegistrationNumber !== null && (typeof trailerRegistrationNumber !== 'string' || trailerRegistrationNumber.length > 50)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid TrailerRegistrationNumber: must be a string with max length 50',
          data: null,
          loadTrailerId: null
        });
      }

      const data = {
        loadTrailerId,
        loadId,
        trailerId,
        trailerRegistrationNumber,
        trailerLength,
        trailerWidth,
        trailerHeight,
        maxAllowableVolume,
        maxAllowableWeight,
        createdById
      };
      console.log('createLoadTrailer parsed data:', JSON.stringify(data, null, 2));

      const result = await LoadTrailerModel.createLoadTrailer(data);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        loadTrailerId: result.loadTrailerId
      });
    } catch (err) {
      console.error('createLoadTrailer error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to create LoadTrailer assignment: ${err.message}`,
        data: null,
        loadTrailerId: null
      });
    }
  }

  // Update a LoadTrailer assignment
  static async updateLoadTrailer(req, res) {
    try {
      const { loadTrailerId } = req.params;
      const parsedLoadTrailerId = parseInt(loadTrailerId, 10);

      console.log('updateLoadTrailer raw request body:', JSON.stringify(req.body, null, 2));

      if (isNaN(parsedLoadTrailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid loadTrailerId: must be a number',
          data: null,
          loadTrailerId: null
        });
      }

      // Parse numeric fields explicitly
      const loadId = req.body.loadId ? parseInt(req.body.loadId, 10) : null;
      const trailerId = req.body.trailerId ? parseInt(req.body.trailerId, 10) : null;
      const trailerLength = req.body.TrailerLength ? parseFloat(req.body.TrailerLength) : null;
      const trailerWidth = req.body.TrailerWidth ? parseFloat(req.body.TrailerWidth) : null;
      const trailerHeight = req.body.TrailerHeight ? parseFloat(req.body.TrailerHeight) : null;
      const maxAllowableVolume = req.body.MaxAllowableVolume ? parseFloat(req.body.MaxAllowableVolume) : null;
      const maxAllowableWeight = req.body.MaxAllowableWeight ? parseFloat(req.body.MaxAllowableWeight) : null;
      const createdById = parseInt(req.body.createdById, 10);

      if (!createdById && createdById !== 0) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          loadTrailerId: parsedLoadTrailerId
        });
      }

      // Validate numeric fields if provided
      const numericFields = { loadId, trailerId, createdById };
      for (const [field, value] of Object.entries(numericFields)) {
        if (value !== null && (isNaN(value) || value < 0)) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}: must be a non-negative number`,
            data: null,
            loadTrailerId: parsedLoadTrailerId
          });
        }
      }

      // Validate decimal fields
      const decimalFields = { trailerLength, trailerWidth, trailerHeight, maxAllowableVolume, maxAllowableWeight };
      for (const [field, value] of Object.entries(decimalFields)) {
        if (value !== null && (isNaN(value) || value < 0)) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}: must be a non-negative number`,
            data: null,
            loadTrailerId: parsedLoadTrailerId
          });
        }
      }

      // Validate TrailerRegistrationNumber
      const trailerRegistrationNumber = req.body.TrailerRegistrationNumber || null;
      if (trailerRegistrationNumber !== null && (typeof trailerRegistrationNumber !== 'string' || trailerRegistrationNumber.length > 50)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid TrailerRegistrationNumber: must be a string with max length 50',
          data: null,
          loadTrailerId: parsedLoadTrailerId
        });
      }

      const data = {
        loadId,
        trailerId,
        trailerRegistrationNumber,
        trailerLength,
        trailerWidth,
        trailerHeight,
        maxAllowableVolume,
        maxAllowableWeight,
        createdById
      };
      console.log('updateLoadTrailer parsed data:', JSON.stringify(data, null, 2));

      const result = await LoadTrailerModel.updateLoadTrailer(parsedLoadTrailerId, data);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        loadTrailerId: parsedLoadTrailerId
      });
    } catch (err) {
      console.error('updateLoadTrailer error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to update LoadTrailer assignment: ${err.message}`,
        data: null,
        loadTrailerId: parseInt(req.params.loadTrailerId, 10) || null
      });
    }
  }

  // Delete a LoadTrailer assignment
  static async deleteLoadTrailer(req, res) {
    try {
      const { loadTrailerId } = req.params;
      const parsedLoadTrailerId = parseInt(loadTrailerId, 10);
      const deletedById = parseInt(req.body.deletedById, 10);

      console.log('deleteLoadTrailer request body:', JSON.stringify(req.body, null, 2));

      if (isNaN(parsedLoadTrailerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid loadTrailerId: must be a number',
          data: null,
          loadTrailerId: null
        });
      }

      if (!deletedById && deletedById !== 0) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required',
          data: null,
          loadTrailerId: parsedLoadTrailerId
        });
      }

      const result = await LoadTrailerModel.deleteLoadTrailer(parsedLoadTrailerId, deletedById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        loadTrailerId: parsedLoadTrailerId
      });
    } catch (err) {
      console.error('deleteLoadTrailer error:', err);
      return res.status(400).json({
        success: false,
        message: `Failed to delete LoadTrailer assignment: ${err.message}`,
        data: null,
        loadTrailerId: parseInt(req.params.loadTrailerId, 10) || null
      });
    }
  }
}

module.exports = LoadTrailerController;
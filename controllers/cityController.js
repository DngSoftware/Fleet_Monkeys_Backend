const CityModel = require('../models/cityModel');

class CityController {
  // Get all Cities
 // Get all Cities
  static async getAllCities(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          cityId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          cityId: null
        });
      }

      const result = await CityModel.getAllCities({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      res.status(200).json({
        success: true,
        message: 'City records retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        },
        cityId: null
      });
    } catch (err) {
      console.error('Error in getAllCities:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        cityId: null
      });
    }
  }

  // Create a new City
  static async createCity(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.cityName || !data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CityName and CreatedById are required.',
          data: null,
          cityId: null
        });
      }

      const result = await CityModel.createCity(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        cityId: result.cityId
      });
    } catch (err) {
      console.error('Error in createCity:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        cityId: null
      });
    }
  }

  // Get a single City by ID
  static async getCityById(req, res) {
    try {
      const { id } = req.params;
      const city = await CityModel.getCityById(parseInt(id));
      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'City not found.',
          data: null,
          cityId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'City retrieved successfully.',
        data: city,
        cityId: id
      });
    } catch (err) {
      console.error('Error in getCityById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        cityId: null
      });
    }
  }

  // Update a City
  static async updateCity(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedById is required.',
          data: null,
          cityId: null
        });
      }

      const result = await CityModel.updateCity(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        cityId: id
      });
    } catch (err) {
      console.error('Error in updateCity:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        cityId: null
      });
    }
  }

  // Delete a City
  static async deleteCity(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body; // No validation, pass as-is

      const result = await CityModel.deleteCity(parseInt(id), createdById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        cityId: id
      });
    } catch (err) {
      console.error('Error in deleteCity:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        cityId: null
      });
    }
  }
}

module.exports = CityController;

const CountryOfOriginModel = require('../models/countryOfOriginModel');

class CountryOfOriginController {
  // Get all Countries of Origin with pagination
  static async getAllCountriesOfOrigin(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          countryOfOriginId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          countryOfOriginId: null
        });
      }

      const countries = await CountryOfOriginModel.getAllCountriesOfOrigin({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Countries of Origin retrieved successfully',
        data: countries.data,
        pagination: {
          totalRecords: countries.totalRecords,
          currentPage: countries.currentPage,
          pageSize: countries.pageSize,
          totalPages: countries.totalPages
        },
        countryOfOriginId: null
      });
    } catch (err) {
      console.error('getAllCountriesOfOrigin error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        countryOfOriginId: null
      });
    }
  }

  // Create a new Country of Origin
  static async createCountryOfOrigin(req, res) {
    try {
      const { countryOfOrigin, createdById } = req.body;

      // Basic validation
      if (!countryOfOrigin || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'CountryOfOrigin and CreatedByID are required',
          data: null,
          countryOfOriginId: null
        });
      }

      const result = await CountryOfOriginModel.createCountryOfOrigin({
        countryOfOrigin,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        countryOfOriginId: result.countryOfOriginId
      });
    } catch (err) {
      console.error('createCountryOfOrigin error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        countryOfOriginId: null
      });
    }
  }

  // Get a single Country of Origin by ID
  static async getCountryOfOriginById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CountryOfOriginID is required',
          data: null,
          countryOfOriginId: null
        });
      }

      const country = await CountryOfOriginModel.getCountryOfOriginById(parseInt(id));

      if (!country) {
        return res.status(404).json({
          success: false,
          message: 'Country of Origin not found',
          data: null,
          countryOfOriginId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Country of Origin retrieved successfully',
        data: country,
        countryOfOriginId: id
      });
    } catch (err) {
      console.error('getCountryOfOriginById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        countryOfOriginId: null
      });
    }
  }

  // Update a Country of Origin
  static async updateCountryOfOrigin(req, res) {
    try {
      const { id } = req.params;
      const { countryOfOrigin, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CountryOfOriginID is required',
          data: null,
          countryOfOriginId: null
        });
      }

      if (!countryOfOrigin || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'CountryOfOrigin and CreatedByID are required',
          data: null,
          countryOfOriginId: id
        });
      }

      const result = await CountryOfOriginModel.updateCountryOfOrigin(parseInt(id), {
        countryOfOrigin,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        countryOfOriginId: id
      });
    } catch (err) {
      console.error('updateCountryOfOrigin error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        countryOfOriginId: null
      });
    }
  }

  // Delete a Country of Origin
  static async deleteCountryOfOrigin(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CountryOfOriginID is required',
          data: null,
          countryOfOriginId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          countryOfOriginId: id
        });
      }

      const result = await CountryOfOriginModel.deleteCountryOfOrigin(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        countryOfOriginId: id
      });
    } catch (err) {
      console.error('deleteCountryOfOrigin error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        countryOfOriginId: null
      });
    }
  }
}

module.exports = CountryOfOriginController;
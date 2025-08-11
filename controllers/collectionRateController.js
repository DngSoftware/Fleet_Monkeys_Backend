const CollectionRateModel = require('../models/collectionRateModel');

class CollectionRateController {
 // Get all Collection Rates with pagination
  static async getAllCollectionRates(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      // Validate query parameters
      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          collectionRateId: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          collectionRateId: null
        });
      }

      const collectionRates = await CollectionRateModel.getAllCollectionRates({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Collection rates retrieved successfully',
        data: collectionRates.data,
        pagination: {
          totalRecords: collectionRates.totalRecords,
          currentPage: collectionRates.currentPage,
          pageSize: collectionRates.pageSize,
          totalPages: collectionRates.totalPages
        },
        collectionRateId: null
      });
    } catch (err) {
      console.error('getAllCollectionRates error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        collectionRateId: null
      });
    }
  }

  // Get all Collection Rates without pagination
  static async getAllCollectionRatesNoPagination(req, res) {
    try {
      const collectionRates = await CollectionRateModel.getAllCollectionRatesNoPagination();

      return res.status(200).json({
        success: true,
        message: 'All collection rates retrieved successfully',
        data: collectionRates,
        pagination: {
          totalRecords: collectionRates.length,
          currentPage: 1,
          pageSize: collectionRates.length,
          totalPages: 1
        },
        collectionRateId: null
      });
    } catch (err) {
      console.error('getAllCollectionRatesNoPagination error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        collectionRateId: null
      });
    }
  }

  // Create a new Collection Rate
  static async createCollectionRate(req, res) {
    try {
      const { warehouseId, distanceRadiusMin, distanceRadiusMax, rate, currencyId, createdById } = req.body;

      // Basic validation
      if (!warehouseId || distanceRadiusMin == null || distanceRadiusMax == null || rate == null || !currencyId || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'WarehouseID, DistanceRadiusMin, DistanceRadiusMax, Rate, CurrencyID, and CreatedByID are required',
          data: null,
          collectionRateId: null
        });
      }

      const result = await CollectionRateModel.createCollectionRate({
        warehouseId,
        distanceRadiusMin,
        distanceRadiusMax,
        rate,
        currencyId,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        collectionRateId: result.collectionRateId
      });
    } catch (err) {
      console.error('createCollectionRate error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        collectionRateId: null
      });
    }
  }

  // Get a single Collection Rate by ID
  static async getCollectionRateById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CollectionRateID is required',
          data: null,
          collectionRateId: null
        });
      }

      const collectionRate = await CollectionRateModel.getCollectionRateById(parseInt(id));

      if (!collectionRate) {
        return res.status(404).json({
          success: false,
          message: 'Collection rate not found',
          data: null,
          collectionRateId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Collection rate retrieved successfully',
        data: collectionRate,
        collectionRateId: id
      });
    } catch (err) {
      console.error('getCollectionRateById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        collectionRateId: null
      });
    }
  }

  // Update a Collection Rate
  static async updateCollectionRate(req, res) {
    try {
      const { id } = req.params;
      const { warehouseId, distanceRadiusMin, distanceRadiusMax, rate, currencyId, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CollectionRateID is required',
          data: null,
          collectionRateId: null
        });
      }

      if (!warehouseId || distanceRadiusMin == null || distanceRadiusMax == null || rate == null || !currencyId || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'WarehouseID, DistanceRadiusMin, DistanceRadiusMax, Rate, CurrencyID, and CreatedByID are required',
          data: null,
          collectionRateId: id
        });
      }

      const result = await CollectionRateModel.updateCollectionRate(parseInt(id), {
        warehouseId,
        distanceRadiusMin,
        distanceRadiusMax,
        rate,
        currencyId,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        collectionRateId: id
      });
    } catch (err) {
      console.error('updateCollectionRate error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        collectionRateId: null
      });
    }
  }

  // Delete a Collection Rate
  static async deleteCollectionRate(req, res) {
    try {
      const { id } = req.params;
      const { createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid CollectionRateID is required',
          data: null,
          collectionRateId: null
        });
      }

      if (!createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required',
          data: null,
          collectionRateId: id
        });
      }

      const result = await CollectionRateModel.deleteCollectionRate(parseInt(id), createdById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        collectionRateId: id
      });
    } catch (err) {
      console.error('deleteCollectionRate error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        collectionRateId: null
      });
    }
  }
}

module.exports = CollectionRateController;
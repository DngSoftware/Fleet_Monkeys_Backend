const SalesQuotationParcelModel = require('../models/salesQuotationParcelModel');

class SalesQuotationParcelController {
  // Get all Sales Quotation Parcels
  static async getAllSalesQuotationParcels(req, res) {
    try {
      const { pageNumber, pageSize, salesQuotationId } = req.query;
      const result = await SalesQuotationParcelModel.getAllSalesQuotationParcels({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        salesQuotationId: parseInt(salesQuotationId) || null
      });
      res.status(200).json({
        success: true,
        message: 'Sales Quotation Parcel records retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords,
        salesQuotationParcelId: null
      });
    } catch (err) {
      console.error('Error in getAllSalesQuotationParcels:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationParcelId: null
      });
    }
  }

  // Get a single Sales Quotation Parcel by ID
  static async getSalesQuotationParcelById(req, res) {
    try {
      const { id } = req.params;
      const salesQuotationParcel = await SalesQuotationParcelModel.getSalesQuotationParcelById(parseInt(id));
      if (!salesQuotationParcel) {
        return res.status(400).json({
          success: false,
          message: 'Sales Quotation Parcel not found or deleted.',
          data: null,
          salesQuotationParcelId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Sales Quotation Parcel retrieved successfully.',
        data: salesQuotationParcel,
        salesQuotationParcelId: id
      });
    } catch (err) {
      console.error('Error in getSalesQuotationParcelById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationParcelId: null
      });
    }
  }

  // Update a Sales Quotation Parcel
  static async updateSalesQuotationParcel(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.createdById) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required.',
          data: null,
          salesQuotationParcelId: null
        });
      }

      const result = await SalesQuotationParcelModel.updateSalesQuotationParcel(parseInt(id), data );
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationParcelId: id
      });
    } catch (err) {
      console.error('Error in updateSalesQuotationParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationParcelId: null
      });
    }
  }

  // Delete a Sales Quotation Parcel
  static async deleteSalesQuotationParcel(req, res) {
    try {
      const { id } = req.params;
      const { deletedById } = req.body;
      if (!deletedById) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required.',
          data: null,
          salesQuotationParcelId: null
        });
      }

      const result = await SalesQuotationParcelModel.deleteSalesQuotationParcel(parseInt(id), deletedById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationParcelId: id
      });
    } catch (err) {
      console.error('Error in deleteSalesQuotationParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationParcelId: null
      });
    }
  }

  // Updated controller method to update exchange rates
  static async updateExchangeRates(req, res) {
    try {
      const { salesQuotationId, updatedById } = req.body;

      if (!salesQuotationId) {
        return res.status(400).json({
          success: false,
          message: 'salesQuotationId is required.',
          data: null
        });
      }
      if (!updatedById) {
        return res.status(400).json({
          success: false,
          message: 'updatedById is required.',
          data: null
        });
      }

      const result = await SalesQuotationParcelModel.updateExchangeRatesForQuotation(parseInt(salesQuotationId), parseInt(updatedById));

      res.status(200).json({
        success: true,
        message: `Exchange rates updated for ${result.updatedCount} parcels successfully.`,
        data: {
          updatedCount: result.updatedCount,
          updatedParcels: result.updatedParcels
        }
      });
    } catch (err) {
      console.error('Error in updateExchangeRates:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = SalesQuotationParcelController;

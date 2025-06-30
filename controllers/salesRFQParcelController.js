const SalesRFQParcelModel = require('../models/SalesRFQparcelModel');

class SalesRFQParcelController {
  // Get Sales RFQ Parcels
  static async getSalesRFQParcels(req, res) {
    try {
      const { salesRFQParcelId, salesRFQId } = req.query;
      const result = await SalesRFQParcelModel.getSalesRFQParcels({
        salesRFQParcelId: parseInt(salesRFQParcelId) || null,
        salesRFQId: parseInt(salesRFQId) || null
      });
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        salesRFQParcelId: salesRFQParcelId || null,
        newSalesRFQParcelId: null
      });
    } catch (err) {
      console.error('Error in getSalesRFQParcels:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQParcelId: null,
        newSalesRFQParcelId: null
      });
    }
  }

  // Get a single Sales RFQ Parcel by ID
  static async getSalesRFQParcelById(req, res) {
    try {
      const { id } = req.params;
      const salesRFQParcel = await SalesRFQParcelModel.getSalesRFQParcelById(parseInt(id));
      if (!salesRFQParcel) {
        return res.status(404).json({
          success: false,
          message: 'Sales RFQ Parcel not found or deleted.',
          data: null,
          salesRFQParcelId: null,
          newSalesRFQParcelId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Sales RFQ Parcel retrieved successfully.',
        data: salesRFQParcel,
        salesRFQParcelId: id,
        newSalesRFQParcelId: null
      });
    } catch (err) {
      console.error('Error in getSalesRFQParcelById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQParcelId: null,
        newSalesRFQParcelId: null
      });
    }
  }

  // Create a new Sales RFQ Parcel
  static async createSalesRFQParcel(req, res) {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.SalesRFQID || !data.ItemID || !data.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'SalesRFQID, ItemID, and CreatedByID are required.',
          data: null,
          salesRFQParcelId: null,
          newSalesRFQParcelId: null
        });
      }

      const result = await SalesRFQParcelModel.createSalesRFQParcel(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        salesRFQParcelId: null,
        newSalesRFQParcelId: result.newSalesRFQParcelId
      });
    } catch (err) {
      console.error('Error in createSalesRFQParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQParcelId: null,
        newSalesRFQParcelId: null
      });
    }
  }

  // Update a Sales RFQ Parcel
  static async updateSalesRFQParcel(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required.',
          data: null,
          salesRFQParcelId: null,
          newSalesRFQParcelId: null
        });
      }

      const result = await SalesRFQParcelModel.updateSalesRFQParcel(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesRFQParcelId: id,
        newSalesRFQParcelId: null
      });
    } catch (err) {
      console.error('Error in updateSalesRFQParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQParcelId: null,
        newSalesRFQParcelId: null
      });
    }
  }

  // Delete a Sales RFQ Parcel
  static async deleteSalesRFQParcel(req, res) {
    try {
      const { id } = req.params;
      const { DeletedByID } = req.body;
      if (!DeletedByID) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required.',
          data: null,
          salesRFQParcelId: null,
          newSalesRFQParcelId: null
        });
      }

      const result = await SalesRFQParcelModel.deleteSalesRFQParcel(parseInt(id), DeletedByID);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesRFQParcelId: id,
        newSalesRFQParcelId: null
      });
    } catch (err) {
      console.error('Error in deleteSalesRFQParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQParcelId: null,
        newSalesRFQParcelId: null
      });
    }
  }
}

module.exports = SalesRFQParcelController;

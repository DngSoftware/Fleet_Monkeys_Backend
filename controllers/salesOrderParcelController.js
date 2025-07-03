const SalesOrderParcelModel = require('../models/salesOrderParcelModel');

class SalesOrderParcelController {
  // Get all Sales Order Parcels
  static async getAllSalesOrderParcels(req, res) {
    try {
      const { pageNumber, pageSize, salesOrderId } = req.query;
      const result = await SalesOrderParcelModel.getAllSalesOrderParcels({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        salesOrderId: parseInt(salesOrderId) || null
      });
      res.status(200).json({
        success: true,
        message: 'Sales Order Parcel records retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        },
        salesOrderParcelId: null
      });
    } catch (err) {
      console.error('Error in getAllSalesOrderParcels:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderParcelId: null
      });
    }
  }

  // Get a single Sales Order Parcel by ID
  static async getSalesOrderParcelById(req, res) {
    try {
      const { id } = req.params;
      const salesOrderParcel = await SalesOrderParcelModel.getSalesOrderParcelById(parseInt(id));
      if (!salesOrderParcel) {
        return res.status(404).json({
          success: false,
          message: 'Sales Order Parcel not found or deleted.',
          data: null,
          salesOrderParcelId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Sales Order Parcel retrieved successfully.',
        data: salesOrderParcel,
        salesOrderParcelId: id
      });
    } catch (err) {
      console.error('Error in getSalesOrderParcelById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderParcelId: null
      });
    }
  }

  // Update a Sales Order Parcel
  static async updateSalesOrderParcel(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.changedById) {
        return res.status(400).json({
          success: false,
          message: 'ChangedByID is required.',
          data: null,
          salesOrderParcelId: null
        });
      }

      const result = await SalesOrderParcelModel.updateSalesOrderParcel(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesOrderParcelId: id
      });
    } catch (err) {
      console.error('Error in updateSalesOrderParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderParcelId: null
      });
    }
  }

  // Delete a Sales Order Parcel
  static async deleteSalesOrderParcel(req, res) {
    try {
      const { id } = req.params;
      const { changedById } = req.body;
      if (!changedById) {
        return res.status(400).json({
          success: false,
          message: 'ChangedByID is required.',
          data: null,
          salesOrderParcelId: null
        });
      }

      const result = await SalesOrderParcelModel.deleteSalesOrderParcel(parseInt(id), changedById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesOrderParcelId: id
      });
    } catch (err) {
      console.error('Error in deleteSalesOrderParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderParcelId: null
      });
    }
  }
}

module.exports = SalesOrderParcelController;
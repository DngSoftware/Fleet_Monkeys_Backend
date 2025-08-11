const SalesInvoiceParcelModel = require('../models/salesInvoiceParcelModel');

class SalesInvoiceParcelController {
  // Get Sales Invoice Parcels
  static async getSalesInvoiceParcels(req, res) {
    try {
      const { salesInvoiceParcelId, salesInvoiceId } = req.query;
      const result = await SalesInvoiceParcelModel.getSalesInvoiceParcels({
        salesInvoiceParcelId: parseInt(salesInvoiceParcelId) || null,
        salesInvoiceId: parseInt(salesInvoiceId) || null
      });
      res.status(200).json({
        success: true,
        message: 'Sales Invoice Parcels retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords
      });
    } catch (err) {
      console.error('Error in getSalesInvoiceParcels:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Insert a Sales Invoice Parcel
  static async insertSalesInvoiceParcel(req, res) {
    try {
      const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      const data = req.body;
      const result = await SalesInvoiceParcelModel.insertSalesInvoiceParcel(data, userId);
      res.status(201).json({
        success: true,
        message: result.message,
        data: { salesInvoiceParcelId: result.salesInvoiceParcelId }
      });
    } catch (err) {
      console.error('Error in insertSalesInvoiceParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Update a Sales Invoice Parcel
  static async updateSalesInvoiceParcel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      const data = req.body;
      const result = await SalesInvoiceParcelModel.updateSalesInvoiceParcel(parseInt(id), data, userId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (err) {
      console.error('Error in updateSalesInvoiceParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Delete a Sales Invoice Parcel
  static async deleteSalesInvoiceParcel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      const result = await SalesInvoiceParcelModel.deleteSalesInvoiceParcel(parseInt(id), userId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (err) {
      console.error('Error in deleteSalesInvoiceParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = SalesInvoiceParcelController;
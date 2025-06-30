const PInvoiceParcelModel = require('../models/pInvoiceParcelModel');

class PInvoiceParcelController {
  // Get Purchase Invoice Parcels
  static async getPInvoiceParcels(req, res) {
    try {
      const { pInvoiceParcelId, pInvoiceId } = req.query;
      const result = await PInvoiceParcelModel.getPInvoiceParcels({
        pInvoiceParcelId: parseInt(pInvoiceParcelId) || null,
        pInvoiceId: parseInt(pInvoiceId) || null
      });
      res.status(200).json({
        success: true,
        message: 'Purchase Invoice Parcels retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords
      });
    } catch (err) {
      console.error('Error in getPInvoiceParcels:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Update a Purchase Invoice Parcel
  static async updatePInvoiceParcel(req, res) {
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
      const result = await PInvoiceParcelModel.updatePInvoiceParcel(parseInt(id), data, userId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (err) {
      console.error('Error in updatePInvoiceParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Delete a Purchase Invoice Parcel
  static async deletePInvoiceParcel(req, res) {
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

      const result = await PInvoiceParcelModel.deletePInvoiceParcel(parseInt(id), userId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (err) {
      console.error('Error in deletePInvoiceParcel:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = PInvoiceParcelController;
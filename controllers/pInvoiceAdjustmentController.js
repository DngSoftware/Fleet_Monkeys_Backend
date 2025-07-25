const PInvoiceAdjustmentModel = require('../models/pInvoiceAdjustmentModel');

class PInvoiceAdjustmentController {
  // Adjust a Purchase Invoice
  static async adjustPInvoice(req, res) {
    try {
      const { salesOrderId, supplierId } = req.body;
      const createdById = req.user && req.user.personId ? parseInt(req.user.personId) : null;

      // Validate authentication
      if (!createdById) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      // Validate required fields
      if (!salesOrderId) {
        return res.status(400).json({
          success: false,
          message: 'salesOrderId is required.',
          data: null
        });
      }
      if (!supplierId) {
        return res.status(400).json({
          success: false,
          message: 'supplierId is required.',
          data: null
        });
      }

      const result = await PInvoiceAdjustmentModel.adjustPInvoice({
        salesOrderId: parseInt(salesOrderId),
        supplierId: parseInt(supplierId),
        createdById
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (err) {
      console.error('Error in adjustPInvoice:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = PInvoiceAdjustmentController;
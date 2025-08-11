const PInvoiceAdjustmentModel = require('../models/pInvoiceAdjustmentModel');

class PInvoiceAdjustmentController {
  // Adjust a Purchase Invoice
  static async adjustPInvoice(req, res) {
    try {
      const { salesOrderId, supplierId } = req.body;
      const createdById = req.user && req.user.personId ? parseInt(req.user.personId) : null;

      // Validate authentication
      if (!createdById || !Number.isInteger(createdById) || createdById <= 0) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Valid user ID not found in authentication context.',
          data: null
        });
      }

      // Validate required fields
      if (salesOrderId == null || isNaN(parseInt(salesOrderId))) {
        return res.status(400).json({
          success: false,
          message: 'salesOrderId is required and must be a valid integer.',
          data: null
        });
      }
      if (supplierId == null || isNaN(parseInt(supplierId))) {
        return res.status(400).json({
          success: false,
          message: 'supplierId is required and must be a valid integer.',
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
      const statusCode = err.message.includes('Invalid') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = PInvoiceAdjustmentController;
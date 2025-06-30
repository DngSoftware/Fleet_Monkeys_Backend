const PurchaseRFQToSupplierModel = require('../models/purchaseRFQToSupplierModel');

class PurchaseRFQToSupplierController {
  // Get all Purchase RFQs to Suppliers
  static async getAllPurchaseRFQToSuppliers(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate, purchaseRFQId, supplierId } = req.query;
      const result = await PurchaseRFQToSupplierModel.getAllPurchaseRFQToSuppliers({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null,
        purchaseRFQId: parseInt(purchaseRFQId) || null,
        supplierId: parseInt(supplierId) || null
      });
      res.status(200).json({
        success: true,
        message: result.message || 'Purchase RFQs to Suppliers retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords
      });
    } catch (err) {
      console.error('Error in getAllPurchaseRFQToSuppliers:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = PurchaseRFQToSupplierController;
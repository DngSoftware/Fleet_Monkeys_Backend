const LowestItemPriceModel = require('../models/lowestItemPriceModel');

class LowestItemPriceController {
  static async getLowestItemPrices(req, res) {
    try {
      const purchaseRFQId = parseInt(req.params.purchaseRFQId);
      if (isNaN(purchaseRFQId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseRFQID',
          data: [],
          purchaseRFQId: null,
          supplierQuotationId: null
        });
      }

      const purchaseRFQData = {
        PurchaseRFQID: purchaseRFQId
      };

      const result = await LowestItemPriceModel.getLowestItemPrices(purchaseRFQData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get Lowest Item Prices error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: [],
        purchaseRFQId: null,
        supplierQuotationId: null
      });
    }
  }
}

module.exports = LowestItemPriceController;
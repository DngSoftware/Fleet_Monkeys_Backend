const poolPromise = require('../config/db.config');

class LowestItemPriceModel {
  static async getLowestItemPrices(purchaseRFQData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        purchaseRFQData.PurchaseRFQID ? parseInt(purchaseRFQData.PurchaseRFQID) : null
      ];

      const [result] = await pool.query(
        'CALL sp_GetLowestItemPriceFromSuppliers(?)',
        queryParams
      );

      const returnCode = result[1]?.[0]?.return_code;

      if (returnCode === 0) {
        return {
          success: false,
          message: 'No valid PurchaseRFQID found',
          data: [],
          purchaseRFQId: purchaseRFQData.PurchaseRFQID,
          supplierQuotationId: null
        };
      } else if (returnCode === -1) {
        return {
          success: false,
          message: 'No supplier quotations found',
          data: [],
          purchaseRFQId: purchaseRFQData.PurchaseRFQID,
          supplierQuotationId: null
        };
      } else if (returnCode === -2) {
        return {
          success: false,
          message: 'No results generated',
          data: [],
          purchaseRFQId: purchaseRFQData.PurchaseRFQID,
          supplierQuotationId: null
        };
      }

      return {
        success: true,
        message: 'Lowest item prices retrieved successfully.',
        data: result[0] || [],
        purchaseRFQId: purchaseRFQData.PurchaseRFQID,
        supplierQuotationId: result[0]?.[0]?.SupplierQuotationID || null
      };
    } catch (error) {
      console.error('Database error in sp_GetLowestItemPriceFromSuppliers:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: [],
        purchaseRFQId: purchaseRFQData.PurchaseRFQID,
        supplierQuotationId: null
      };
    }
  }
}

module.exports = LowestItemPriceModel;
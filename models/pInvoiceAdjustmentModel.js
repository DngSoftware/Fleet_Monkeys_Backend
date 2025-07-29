const poolPromise = require('../config/db.config');

class PInvoiceAdjustmentModel {
  // Adjust a Purchase Invoice
  static async adjustPInvoice({ salesOrderId, supplierId, createdById }) {
    try {
      const pool = await poolPromise;

      // Validate input parameters
      if (salesOrderId == null || !Number.isInteger(salesOrderId) || salesOrderId <= 0) {
        throw new Error('Invalid salesOrderId: must be a positive integer and not null');
      }
      if (supplierId == null || !Number.isInteger(supplierId) || supplierId <= 0) {
        throw new Error('Invalid supplierId: must be a positive integer and not null');
      }
      if (createdById == null || !Number.isInteger(createdById) || createdById <= 0) {
        throw new Error('Invalid createdById: must be a positive integer and not null');
      }

      const queryParams = [
        salesOrderId,
        supplierId,
        createdById,
      ];

      const [result] = await pool.query(
        'CALL sp_PurchaseInvoiceAdjustment(?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to adjust purchase invoice');
      }

      return {
        success: true,
        message: outParams.message || 'Purchase invoice adjusted successfully'
      };
    } catch (err) {
      const errorMessage = err.sqlState
        ? `Database error: ${err.message} (SQLSTATE: ${err.sqlState})`
        : `Database error: ${err.message}`;
      // Log error for debugging (avoid logging sensitive data in production)
      console.error(`Error in adjustPInvoice: ${errorMessage}`, {
        salesOrderId,
        supplierId,
        createdById
      });
      throw new Error(errorMessage);
    }
  }
}

module.exports = PInvoiceAdjustmentModel;
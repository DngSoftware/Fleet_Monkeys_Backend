const poolPromise = require('../config/db.config');

class PurchaseRFQToSupplierModel {
  // Get all Purchase RFQs to Suppliers
  static async getAllPurchaseRFQToSuppliers({
    pageNumber = 1,
    pageSize = 10,
    fromDate = null,
    toDate = null,
    purchaseRFQId = null,
    supplierId = null
  }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw new Error('Invalid pageNumber: must be a positive integer');
      }
      if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new Error('Invalid pageSize: must be a positive integer');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        fromDate || null,
        toDate || null,
        purchaseRFQId || null,
        supplierId || null
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllPurchaseRFQToSuppliers(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        // Check error log for more details
        await new Promise(resolve => setTimeout(resolve, 100));
        const [[errorLog]] = await pool.query(
          'SELECT ErrorMessage, CreatedAt FROM dbo_tblerrorlog ORDER BY CreatedAt DESC LIMIT 1'
        );
        throw new Error(`Stored procedure error: ${errorLog?.ErrorMessage || outParams.message || 'Unknown error'}`);
      }

      return {
        data: result[0],
        totalRecords: result[0].length,
        message: outParams.message
      };
    } catch (err) {
      const errorMessage = err.sqlState ? 
        `Database error: ${err.message} (SQLSTATE: ${err.sqlState})` : 
        `Database error: ${err.message}`;
      throw new Error(errorMessage);
    }
  }
}

module.exports = PurchaseRFQToSupplierModel;
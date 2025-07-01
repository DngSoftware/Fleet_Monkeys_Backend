const poolPromise = require('../config/db.config');

class PendingApprovalsModel {
  // Get pending approvals by user
  static async getPendingApprovals({
    userId = null,
    fromDate = null,
    toDate = null,
    pageNumber = 1,
    pageSize = 50,
    formName = null
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
      if (userId && !Number.isInteger(userId)) {
        throw new Error('Invalid userId: must be an integer');
      }
      if (formName && typeof formName !== 'string') {
        throw new Error('Invalid formName: must be a string');
      }

      const queryParams = [
        userId || null,
        fromDate || null,
        toDate || null,
        pageNumber,
        pageSize,
        formName || null
      ];

      const [result] = await pool.query(
        'CALL SP_GetPendingApprovalsByUser(?, ?, ?, ?, ?, ?)',
        queryParams
      );

      // Extract total count from the second result set
      const totalRecords = result[1]?.[0]?.TotalRecords || result[0].length;

      return {
        data: result[0],
        totalRecords,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize)
      };
    } catch (err) {
      const errorMessage = err.sqlState ? 
        `Database error: ${err.message} (SQLSTATE: ${err.sqlState})` : 
        `Database error: ${err.message}`;
      throw new Error(errorMessage);
    }
  }
}

module.exports = PendingApprovalsModel;
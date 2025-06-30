const poolPromise = require('../config/db.config');

class InquiryTrackingModel {
  static async #validateSalesRFQId(salesRFQId) {
    if (!salesRFQId) return null;

    const pool = await poolPromise;
    const [salesRFQCheck] = await pool.query(
      'SELECT 1 FROM dbo_tblsalesrfq WHERE SalesRFQID = ? AND IsDeleted = 0',
      [parseInt(salesRFQId)]
    );

    if (salesRFQCheck.length === 0) {
      return `SalesRFQID ${salesRFQId} does not exist or is deleted`;
    }
    return null;
  }

  static async getInquiryTracking(paginationData) {
    try {
      const pool = await poolPromise;

      const pageNumber = parseInt(paginationData.PageNumber) || 1;
      const pageSize = parseInt(paginationData.PageSize) || 10;
      const salesRFQId = parseInt(paginationData.SalesRFQID) || null;

      // Validate SalesRFQID if provided
      const salesRFQError = await this.#validateSalesRFQId(salesRFQId);
      if (salesRFQError) {
        return {
          success: false,
          message: `Validation failed: ${salesRFQError}`,
          data: null,
          totalRecords: 0,
          salesRFQId: null
        };
      }

      // Call stored procedure
      const [result] = await pool.query(
        'CALL SP_GetInquiryTracking(?, ?, ?, @totalRecords); SELECT @totalRecords AS totalRecords;',
        [pageNumber, pageSize, salesRFQId]
      );

      // Debug: Log raw result
      console.log('Raw result:', JSON.stringify(result, null, 2));

      // Process main result set
      const data = result[0].map(row => ({
        SalesRFQID: row.SalesRFQID,
        Series: row.Series,
        CreatedDateTime: row.CreatedDateTime,
        Status: row.Status,
        CustomerName: row.CustomerName,
        forms: row.forms ? row.forms.split(',') : [],
        parcels: row.parcels ? (typeof row.parcels === 'string' ? JSON.parse(row.parcels) : row.parcels) : [],
        lastCreatedForm: row.lastCreatedForm || null
      }));

      // Safely access totalRecords
      const totalRecords = result[1] && result[1][0] && result[1][0].totalRecords !== undefined ? result[1][0].totalRecords : 0;

      return {
        success: true,
        message: 'SalesRFQ tracking records retrieved successfully.',
        data: data || [],
        totalRecords: totalRecords,
        salesRFQId: salesRFQId || null
      };
    } catch (error) {
      console.error('Database error in getInquiryTracking:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        totalRecords: 0,
        salesRFQId: null
      };
    }
  }
}

module.exports = InquiryTrackingModel;
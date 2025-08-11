const poolPromise = require('../config/db.config');

class SalesQuotationApprovalModel {
  static async getSalesQuotationApprovals({ salesQuotationID = null, pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      let queryParams = [
        'SELECT',
        salesQuotationID ? parseInt(salesQuotationID) : null,
        null, // ApproverID
        null, // ApprovedYN
        null, // ApproverDateTime
        null, // CreatedByID
        null  // DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve SalesQuotation approvals',
          data: null,
          salesQuotationId: salesQuotationID,
          totalRecords: 0
        };
      }

      let approvals = result[0] || [];

      if (!salesQuotationID) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        approvals = approvals.slice(start, end);
      }

      return {
        success: true,
        message: outParams.message || 'SalesQuotation Approval records retrieved successfully.',
        data: approvals,
        salesQuotationId: salesQuotationID,
        totalRecords: salesQuotationID ? approvals.length : (result[0] ? result[0].length : 0)
      };
    } catch (err) {
      console.error('Database error in getSalesQuotationApprovals:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesQuotationId: salesQuotationID,
        totalRecords: 0
      };
    }
  }

  static async getSalesQuotationApprovalById({ salesQuotationID, approverID }) {
    try {
      const pool = await poolPromise;

      if (!salesQuotationID || !approverID) {
        return {
          success: false,
          message: 'SalesQuotationID and ApproverID are required',
          data: null,
          salesQuotationId: salesQuotationID,
        };
      }

      const queryParams = [
        'SELECT',
        parseInt(salesQuotationID),
        parseInt(approverID),
        null, // ApprovedYN
        null, // ApproverDateTime
        null, // CreatedByID
        null  // DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotationApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve SalesQuotation approval',
          data: null,
          salesQuotationId: salesQuotationID,
        };
      }

      const approval = result[0] && result[0][0] ? result[0][0] : null;

      return {
        success: true,
        message: approval ? (outParams.message || 'SalesQuotation approval retrieved successfully.') : 'No approval record found.',
        data: approval,
        salesQuotationId: salesQuotationID,
      };
    } catch (err) {
      console.error('Database error in getSalesQuotationApprovalById:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesQuotationId: salesQuotationID,
      };
    }
  }

  static async createSalesQuotationApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesQuotationID', 'ApproverID', 'CreatedByID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesQuotationId: approvalData.SalesQuotationID,
        };
      }

      const queryParams = [
        'INSERT',
        parseInt(approvalData.SalesQuotationID),
        parseInt(approvalData.ApproverID),
        approvalData.ApprovedYN != null ? Boolean(approvalData.ApprovedYN) : null,
        approvalData.ApproverDateTime || null,
        parseInt(approvalData.CreatedByID),
        null  // DeletedByID
      ];

      await pool.query(
        'CALL SP_ManageSalesQuotationApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to create SalesQuotation approval',
          data: null,
          salesQuotationId: approvalData.SalesQuotationID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'SalesQuotation approval created successfully.',
        data: null,
        salesQuotationId: approvalData.SalesQuotationID,
      };
    } catch (err) {
      console.error('Database error in createSalesQuotationApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesQuotationId: approvalData.SalesQuotationID,
      };
    }
  }

  static async updateSalesQuotationApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesQuotationID', 'ApproverID', 'CreatedByID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesQuotationId: approvalData.SalesQuotationID,
        };
      }

      const queryParams = [
        'UPDATE',
        parseInt(approvalData.SalesQuotationID),
        parseInt(approvalData.ApproverID),
        approvalData.ApprovedYN != null ? Boolean(approvalData.ApprovedYN) : null,
        approvalData.ApproverDateTime || null,
        parseInt(approvalData.CreatedByID),
        null  // DeletedByID
      ];

      await pool.query(
        'CALL SP_ManageSalesQuotationApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to update SalesQuotation approval',
          data: null,
          salesQuotationId: approvalData.SalesQuotationID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'SalesQuotation approval updated successfully.',
        data: null,
        salesQuotationId: approvalData.SalesQuotationID,
      };
    } catch (err) {
      console.error('Database error in updateSalesQuotationApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesQuotationId: approvalData.SalesQuotationID,
      };
    }
  }

  static async deleteSalesQuotationApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesQuotationID', 'ApproverID', 'DeletedByID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesQuotationId: approvalData.SalesQuotationID,
        };
      }

      const queryParams = [
        'DELETE',
        parseInt(approvalData.SalesQuotationID),
        parseInt(approvalData.ApproverID),
        null, // ApprovedYN
        null, // ApproverDateTime
        null, // CreatedByID
        parseInt(approvalData.DeletedByID)
      ];

      await pool.query(
        'CALL SP_ManageSalesQuotationApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to delete SalesQuotation approval',
          data: null,
          salesQuotationId: approvalData.SalesQuotationID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'SalesQuotation approval deleted successfully.',
        data: null,
        salesQuotationId: approvalData.SalesQuotationID,
      };
    } catch (err) {
      console.error('Database error in deleteSalesQuotationApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesQuotationId: approvalData.SalesQuotationID,
      };
    }
  }
}

module.exports = SalesQuotationApprovalModel;
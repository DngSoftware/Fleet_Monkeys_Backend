const poolPromise = require('../config/db.config');

class SalesRFQApprovalModel {
  // Get Sales RFQ approvals (specific SalesRFQID or paginated)
  static async getSalesRFQApprovals({ salesRFQID = null, pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        salesRFQID ? parseInt(salesRFQID) : null,
        pageNumber > 0 ? parseInt(pageNumber) : 1,
        pageSize > 0 ? parseInt(pageSize) : 10
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllSalesRFQApprovals(?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve SalesRFQ approvals',
          data: null,
          salesRFQId: salesRFQID,
          newSalesRFQId: null,
          totalRecords: 0
        };
      }

      if (salesRFQID) {
        return {
          success: true,
          message: outParams.message || 'SalesRFQ Approval records retrieved successfully.',
          data: result[0] || [],
          salesRFQId: salesRFQID,
          newSalesRFQId: null,
          totalRecords: result[0].length
        };
      }

      const totalRecords = result[0].length > 0 ? result[0][0].TotalRecords || 0 : 0;

      return {
        success: true,
        message: outParams.message || 'SalesRFQ Approval records retrieved successfully.',
        data: result[0] || [],
        salesRFQId: null,
        newSalesRFQId: null,
        totalRecords
      };
    } catch (err) {
      console.error('Database error in getSalesRFQApprovals:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesRFQId: salesRFQID,
        newSalesRFQId: null,
        totalRecords: 0
      };
    }
  }

  // Get a specific Sales RFQ approval by SalesRFQID and ApproverID
  static async getSalesRFQApprovalById({ salesRFQID, approverID }) {
    try {
      const pool = await poolPromise;

      if (!salesRFQID || !approverID) {
        return {
          success: false,
          message: 'SalesRFQID and ApproverID are required',
          data: null,
          salesRFQId: salesRFQID,
          newSalesRFQId: null
        };
      }

      const queryParams = [
        'SELECT',
        parseInt(salesRFQID),
        parseInt(approverID),
        null, // ApprovedYN
        null, // DeletedByID
        null, // FormName
        null, // RoleName
        null // UserID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesRFQApproval(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve SalesRFQ approval',
          data: null,
          salesRFQId: salesRFQID,
          newSalesRFQId: null
        };
      }

      const approval = result[0] && result[0][0] && result[0][0].ApproverID == approverID ? result[0][0] : null;

      return {
        success: true,
        message: approval ? (outParams.message || 'SalesRFQ approval retrieved successfully.') : 'No approval record found.',
        data: approval,
        salesRFQId: salesRFQID,
        newSalesRFQId: null
      };
    } catch (err) {
      console.error('Database error in getSalesRFQApprovalById:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesRFQId: salesRFQID,
        newSalesRFQId: null
      };
    }
  }

  // Create a Sales RFQ approval
  static async createSalesRFQApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesRFQID', 'ApproverID', 'FormName', 'RoleName'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesRFQId: approvalData.SalesRFQID,
          newSalesRFQId: null
        };
      }

      const queryParams = [
        'INSERT',
        parseInt(approvalData.SalesRFQID),
        parseInt(approvalData.ApproverID),
        1, // ApprovedYN
        null, // DeletedByID
        approvalData.FormName,
        approvalData.RoleName,
        parseInt(approvalData.ApproverID) // UserID
      ];

      await pool.query(
        'CALL SP_ManageSalesRFQApproval(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to create SalesRFQ approval',
          data: null,
          salesRFQId: approvalData.SalesRFQID,
          newSalesRFQId: null
        };
      }

      return {
        success: true,
        message: outParams.message || 'SalesRFQ approval created successfully.',
        data: null,
        salesRFQId: approvalData.SalesRFQID,
        newSalesRFQId: null
      };
    } catch (err) {
      console.error('Database error in createSalesRFQApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesRFQId: approvalData.SalesRFQID,
        newSalesRFQId: null
      };
    }
  }

  // Update a Sales RFQ approval
  static async updateSalesRFQApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesRFQID', 'ApproverID', 'FormName', 'RoleName'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesRFQId: approvalData.SalesRFQID,
          newSalesRFQId: null
        };
      }

      const queryParams = [
        'UPDATE',
        parseInt(approvalData.SalesRFQID),
        parseInt(approvalData.ApproverID),
        approvalData.ApprovedYN != null ? approvalData.ApprovedYN : 1,
        null, // DeletedByID
        approvalData.FormName,
        approvalData.RoleName,
        parseInt(approvalData.ApproverID) // UserID
      ];

      await pool.query(
        'CALL SP_ManageSalesRFQApproval(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to update SalesRFQ approval',
          data: null,
          salesRFQId: approvalData.SalesRFQID,
          newSalesRFQId: null
        };
      }

      return {
        success: true,
        message: outParams.message || 'SalesRFQ approval updated successfully.',
        data: null,
        salesRFQId: approvalData.SalesRFQID,
        newSalesRFQId: null
      };
    } catch (err) {
      console.error('Database error in updateSalesRFQApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesRFQId: approvalData.SalesRFQID,
        newSalesRFQId: null
      };
    }
  }

  // Delete a Sales RFQ approval
  static async deleteSalesRFQApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesRFQID', 'ApproverID', 'DeletedByID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesRFQId: approvalData.SalesRFQID,
          newSalesRFQId: null
        };
      }

      const queryParams = [
        'DELETE',
        parseInt(approvalData.SalesRFQID),
        parseInt(approvalData.ApproverID),
        null, // ApprovedYN
        parseInt(approvalData.DeletedByID),
        null, // FormName
        null, // RoleName
        null // UserID
      ];

      await pool.query(
        'CALL SP_ManageSalesRFQApproval(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to delete SalesRFQ approval',
          data: null,
          salesRFQId: approvalData.SalesRFQID,
          newSalesRFQId: null
        };
      }

      return {
        success: true,
        message: outParams.message || 'SalesRFQ approval deleted successfully.',
        data: null,
        salesRFQId: approvalData.SalesRFQID,
        newSalesRFQId: null
      };
    } catch (err) {
      console.error('Database error in deleteSalesRFQApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        salesRFQId: approvalData.SalesRFQID,
        newSalesRFQId: null
      };
    }
  }
}

module.exports = SalesRFQApprovalModel;
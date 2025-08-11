const poolPromise = require('../config/db.config');

class PurchaseRFQApprovalModel {
  // Get Purchase RFQ approvals (all, filtered by PurchaseRFQID, or paginated)
  static async getPurchaseRFQApprovals({ purchaseRFQID = null, pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      // For pagination, we’ll mimic SalesRFQApprovalModel’s approach, but SP_ManagePurchaseRFQApproval doesn’t support it natively
      // Apply pagination in code if purchaseRFQID is not provided
      let queryParams = [
        'SELECT',
        purchaseRFQID ? parseInt(purchaseRFQID) : null,
        null, // ApproverID
        null, // ApprovedYN
        null, // ApproverDateTime
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePurchaseRFQApproval(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve PurchaseRFQ approvals',
          data: null,
          purchaseRFQId: purchaseRFQID,
          totalRecords: 0
        };
      }

      let approvals = result[0] || [];
      
      // Apply pagination if no purchaseRFQID
      if (!purchaseRFQID) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        approvals = approvals.slice(start, end);
      }

      return {
        success: true,
        message: outParams.message || 'PurchaseRFQ Approval records retrieved successfully.',
        data: approvals,
        purchaseRFQId: purchaseRFQID,
        totalRecords: purchaseRFQID ? approvals.length : (result[0] ? result[0].length : 0)
      };
    } catch (err) {
      console.error('Database error in getPurchaseRFQApprovals:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        purchaseRFQId: purchaseRFQID,
        totalRecords: 0
      };
    }
  }

  // Get a specific Purchase RFQ approval by PurchaseRFQID and ApproverID
  static async getPurchaseRFQApprovalById({ purchaseRFQID, approverID }) {
    try {
      const pool = await poolPromise;

      if (!purchaseRFQID || !approverID) {
        return {
          success: false,
          message: 'PurchaseRFQID and ApproverID are required',
          data: null,
          purchaseRFQId: purchaseRFQID,
        };
      }

      const queryParams = [
        'SELECT',
        parseInt(purchaseRFQID),
        parseInt(approverID),
        null, // ApprovedYN
        null, // ApproverDateTime
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePurchaseRFQApproval(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve PurchaseRFQ approval',
          data: null,
          purchaseRFQId: purchaseRFQID,
        };
      }

      const approval = result[0] && result[0][0] ? result[0][0] : null;

      return {
        success: true,
        message: approval ? (outParams.message || 'PurchaseRFQ approval retrieved successfully.') : 'No approval record found.',
        data: approval,
        purchaseRFQId: purchaseRFQID,
      };
    } catch (err) {
      console.error('Database error in getPurchaseRFQApprovalById:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        purchaseRFQId: purchaseRFQID,
      };
    }
  }

  // Create a Purchase RFQ approval
  static async createPurchaseRFQApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['PurchaseRFQID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          purchaseRFQId: approvalData.PurchaseRFQID,
        };
      }

      const queryParams = [
        'INSERT',
        parseInt(approvalData.PurchaseRFQID),
        parseInt(approvalData.ApproverID),
        approvalData.ApprovedYN != null ? approvalData.ApprovedYN : 1,
        approvalData.ApproverDateTime || null,
      ];

      await pool.query(
        'CALL SP_ManagePurchaseRFQApproval(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to create PurchaseRFQ approval',
          data: null,
          purchaseRFQId: approvalData.PurchaseRFQID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'PurchaseRFQ approval created successfully.',
        data: null,
        purchaseRFQId: approvalData.PurchaseRFQID,
      };
    } catch (err) {
      console.error('Database error in createPurchaseRFQApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        purchaseRFQId: approvalData.PurchaseRFQID,
      };
    }
  }

  // Update a Purchase RFQ approval
  static async updatePurchaseRFQApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['PurchaseRFQID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          purchaseRFQId: approvalData.PurchaseRFQID,
        };
      }

      const queryParams = [
        'UPDATE',
        parseInt(approvalData.PurchaseRFQID),
        parseInt(approvalData.ApproverID),
        approvalData.ApprovedYN != null ? approvalData.ApprovedYN : 1,
        approvalData.ApproverDateTime || null,
      ];

      await pool.query(
        'CALL SP_ManagePurchaseRFQApproval(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to update PurchaseRFQ approval',
          data: null,
          purchaseRFQId: approvalData.PurchaseRFQID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'PurchaseRFQ approval updated successfully.',
        data: null,
        purchaseRFQId: approvalData.PurchaseRFQID,
      };
    } catch (err) {
      console.error('Database error in updatePurchaseRFQApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        purchaseRFQId: approvalData.PurchaseRFQID,
      };
    }
  }

  // Delete a Purchase RFQ approval
  static async deletePurchaseRFQApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['PurchaseRFQID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          purchaseRFQId: approvalData.PurchaseRFQID,
        };
      }

      const queryParams = [
        'DELETE',
        parseInt(approvalData.PurchaseRFQID),
        parseInt(approvalData.ApproverID),
        null, // ApprovedYN
        null, // ApproverDateTime
      ];

      await pool.query(
        'CALL SP_ManagePurchaseRFQApproval(?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 0) {
        return {
          success: false,
          message: outParams.message || 'Failed to delete PurchaseRFQ approval',
          data: null,
          purchaseRFQId: approvalData.PurchaseRFQID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'PurchaseRFQ approval deleted successfully.',
        data: null,
        purchaseRFQId: approvalData.PurchaseRFQID,
      };
    } catch (err) {
      console.error('Database error in deletePurchaseRFQApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        purchaseRFQId: approvalData.PurchaseRFQID,
      };
    }
  }
}

module.exports = PurchaseRFQApprovalModel;
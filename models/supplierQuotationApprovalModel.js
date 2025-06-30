const poolPromise = require('../config/db.config');

class SupplierQuotationApprovalModel {
  static async getSupplierQuotationApprovals({ supplierQuotationID = null, pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      let queryParams = [
        'SELECT',
        supplierQuotationID ? parseInt(supplierQuotationID) : null,
        null, // ApproverID
        null, // ApprovedYN
        null, // FormName
        null, // RoleName
        null, // UserID
        null, // CreatedByID
        null  // DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotationApproval(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve SupplierQuotation approvals',
          data: null,
          supplierQuotationId: supplierQuotationID,
          totalRecords: 0
        };
      }

      let approvals = result[0] || [];

      if (!supplierQuotationID) {
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        approvals = approvals.slice(start, end);
      }

      return {
        success: true,
        message: outParams.message || 'SupplierQuotation Approval records retrieved successfully.',
        data: approvals,
        supplierQuotationId: supplierQuotationID,
        totalRecords: supplierQuotationID ? approvals.length : (result[0] ? result[0].length : 0)
      };
    } catch (err) {
      console.error('Database error in getSupplierQuotationApprovals:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        supplierQuotationId: supplierQuotationID,
        totalRecords: 0
      };
    }
  }

  static async getSupplierQuotationApprovalById({ supplierQuotationID, approverID }) {
    try {
      const pool = await poolPromise;

      if (!supplierQuotationID || !approverID) {
        return {
          success: false,
          message: 'SupplierQuotationID and ApproverID are required',
          data: null,
          supplierQuotationId: supplierQuotationID,
        };
      }

      const queryParams = [
        'SELECT',
        parseInt(supplierQuotationID),
        parseInt(approverID),
        null, // ApprovedYN
        null, // FormName
        null, // RoleName
        null, // UserID
        null, // CreatedByID
        null  // DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotationApproval(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        return {
          success: false,
          message: outParams.message || 'Failed to retrieve SupplierQuotation approval',
          data: null,
          supplierQuotationId: supplierQuotationID,
        };
      }

      const approval = result[0] && result[0][0] ? result[0][0] : null;

      return {
        success: true,
        message: approval ? (outParams.message || 'SupplierQuotation approval retrieved successfully.') : 'No approval record found.',
        data: approval,
        supplierQuotationId: supplierQuotationID,
      };
    } catch (err) {
      console.error('Database error in getSupplierQuotationApprovalById:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        supplierQuotationId: supplierQuotationID,
      };
    }
  }

  static async createSupplierQuotationApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SupplierQuotationID', 'ApproverID', 'ApprovedYN', 'FormName', 'RoleName', 'CreatedByID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          supplierQuotationId: approvalData.SupplierQuotationID,
        };
      }

      const queryParams = [
        'INSERT',
        parseInt(approvalData.SupplierQuotationID),
        parseInt(approvalData.ApproverID),
        approvalData.ApprovedYN != null ? Boolean(approvalData.ApprovedYN) : null,
        approvalData.FormName,
        approvalData.RoleName,
        null, // UserID
        parseInt(approvalData.CreatedByID),
        null  // DeletedByID
      ];

      await pool.query(
        'CALL SP_ManageSupplierQuotationApproval(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        return {
          success: false,
          message: outParams.message || 'Failed to create SupplierQuotation approval',
          data: null,
          supplierQuotationId: approvalData.SupplierQuotationID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'SupplierQuotation approval created successfully.',
        data: null,
        supplierQuotationId: approvalData.SupplierQuotationID,
      };
    } catch (err) {
      console.error('Database error in createSupplierQuotationApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        supplierQuotationId: approvalData.SupplierQuotationID,
      };
    }
  }

  static async updateSupplierQuotationApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SupplierQuotationID', 'ApproverID', 'ApprovedYN', 'FormName', 'RoleName', 'UserID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          supplierQuotationId: approvalData.SupplierQuotationID,
        };
      }

      const queryParams = [
        'UPDATE',
        parseInt(approvalData.SupplierQuotationID),
        parseInt(approvalData.ApproverID),
        approvalData.ApprovedYN != null ? Boolean(approvalData.ApprovedYN) : null,
        approvalData.FormName,
        approvalData.RoleName,
        parseInt(approvalData.UserID),
        null, // CreatedByID
        null  // DeletedByID
      ];

      await pool.query(
        'CALL SP_ManageSupplierQuotationApproval(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool
.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        return {
          success: false,
          message: outParams.message || 'Failed to update SupplierQuotation approval',
          data: null,
          supplierQuotationId: approvalData.SupplierQuotationID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'SupplierQuotation approval updated successfully.',
        data: null,
        supplierQuotationId: approvalData.SupplierQuotationID,
      };
    } catch (err) {
      console.error('Database error in updateSupplierQuotationApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        supplierQuotationId: approvalData.SupplierQuotationID,
      };
    }
  }

  static async deleteSupplierQuotationApproval(approvalData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SupplierQuotationID', 'ApproverID', 'DeletedByID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          supplierQuotationId: approvalData.SupplierQuotationID,
        };
      }

      const queryParams = [
        'DELETE',
        parseInt(approvalData.SupplierQuotationID),
        parseInt(approvalData.ApproverID),
        null, // ApprovedYN
        null, // FormName
        null, // RoleName
        null, // UserID
        null, // CreatedByID
        parseInt(approvalData.DeletedByID)
      ];

      await pool.query(
        'CALL SP_ManageSupplierQuotationApproval(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        return {
          success: false,
          message: outParams.message || 'Failed to delete SupplierQuotation approval',
          data: null,
          supplierQuotationId: approvalData.SupplierQuotationID,
        };
      }

      return {
        success: true,
        message: outParams.message || 'SupplierQuotation approval deleted successfully.',
        data: null,
        supplierQuotationId: approvalData.SupplierQuotationID,
      };
    } catch (err) {
      console.error('Database error in deleteSupplierQuotationApproval:', err);
      return {
        success: false,
        message: `Database error: ${err.message}`,
        data: null,
        supplierQuotationId: approvalData.SupplierQuotationID,
      };
    }
  }
}

module.exports = SupplierQuotationApprovalModel;
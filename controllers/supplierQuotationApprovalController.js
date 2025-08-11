const SupplierQuotationApprovalModel = require('../models/supplierQuotationApprovalModel');

class SupplierQuotationApprovalController {
  static async getSupplierQuotationApprovals(req, res) {
    try {
      const { supplierQuotationID, pageNumber, pageSize } = req.query;

      if (supplierQuotationID && isNaN(parseInt(supplierQuotationID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SupplierQuotationID',
          data: null,
          supplierQuotationId: null,
          totalRecords: 0
        });
      }

      const result = await SupplierQuotationApprovalModel.getSupplierQuotationApprovals({
        supplierQuotationID: supplierQuotationID ? parseInt(supplierQuotationID) : null,
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10
      });

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getSupplierQuotationApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
        totalRecords: 0
      });
    }
  }

  static async getSupplierQuotationApprovalById(req, res) {
    try {
      const { supplierQuotationID, approverID } = req.params;

      if (isNaN(parseInt(supplierQuotationID)) || isNaN(parseInt(approverID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SupplierQuotationID or ApproverID',
          data: null,
          supplierQuotationId: null,
        });
      }

      const result = await SupplierQuotationApprovalModel.getSupplierQuotationApprovalById({
        supplierQuotationID: parseInt(supplierQuotationID),
        approverID: parseInt(approverID)
      });

      return res.status(result.success ? (result.data ? 200 : 404) : 400).json(result);
    } catch (err) {
      console.error('Error in getSupplierQuotationApprovalById:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
      });
    }
  }

  static async createSupplierQuotationApproval(req, res) {
    try {
      const { supplierQuotationID, approvedYN, formName, roleName } = req.body;
      const createdByID = req.user?.personId;

      if (!supplierQuotationID || !formName || !roleName) {
        return res.status(400).json({
          success: false,
          message: 'SupplierQuotationID, FormName, and RoleName are required',
          data: null,
          supplierQuotationId: null,
        });
      }

      // if (!req.user || !createdByID) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'Authentication required',
      //     data: null,
      //     supplierQuotationId: null,
      //   });
      // }

      const approvalData = {
        SupplierQuotationID: parseInt(supplierQuotationID),
        ApproverID: parseInt(createdByID),
        ApprovedYN: approvedYN != null ? Boolean(approvedYN) : null,
        FormName: formName,
        RoleName: roleName,
        CreatedByID: parseInt(createdByID)
      };

      const result = await SupplierQuotationApprovalModel.createSupplierQuotationApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createSupplierQuotationApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
      });
    }
  }

  static async updateSupplierQuotationApproval(req, res) {
    try {
      const { supplierQuotationID, approverID, approvedYN, formName, roleName } = req.body;
      const userID = req.user?.personId;

      if (!supplierQuotationID || !approverID || !formName || !roleName) {
        return res.status(400).json({
          success: false,
          message: 'SupplierQuotationID, ApproverID, FormName, and RoleName are required',
          data: null,
          supplierQuotationId: null,
        });
      }

      if (!req.user || !userID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          supplierQuotationId: null,
        });
      }

      const approvalData = {
        SupplierQuotationID: parseInt(supplierQuotationID),
        ApproverID: parseInt(approverID),
        ApprovedYN: approvedYN != null ? Boolean(approvedYN) : null,
        FormName: formName,
        RoleName: roleName,
        UserID: parseInt(userID)
      };

      const result = await SupplierQuotationApprovalModel.updateSupplierQuotationApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updateSupplierQuotationApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
      });
    }
  }

  static async deleteSupplierQuotationApproval(req, res) {
    try {
      const { supplierQuotationID, approverID } = req.body;
      const deletedByID = req.user?.personId;

      if (!supplierQuotationID || !approverID) {
        return res.status(400).json({
          success: false,
          message: 'SupplierQuotationID and ApproverID are required',
          data: null,
          supplierQuotationId: null,
        });
      }

      if (!req.user || !deletedByID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          supplierQuotationId: null,
        });
      }

      const approvalData = {
        SupplierQuotationID: parseInt(supplierQuotationID),
        ApproverID: parseInt(approverID),
        DeletedByID: parseInt(deletedByID)
      };

      const result = await SupplierQuotationApprovalModel.deleteSupplierQuotationApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deleteSupplierQuotationApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
      });
    }
  }
}

module.exports = SupplierQuotationApprovalController;
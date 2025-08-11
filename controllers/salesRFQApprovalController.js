const SalesRFQApprovalModel = require('../models/salesRFQApprovalModel');

class SalesRFQApprovalController {
  // Get Sales RFQ approvals (specific SalesRFQID or paginated)
  static async getSalesRFQApprovals(req, res) {
    try {
      const { salesRFQID, pageNumber, pageSize } = req.query;

      // Validate salesRFQID if provided
      if (salesRFQID && isNaN(parseInt(salesRFQID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
          totalRecords: 0
        });
      }

      const result = await SalesRFQApprovalModel.getSalesRFQApprovals({
        salesRFQID: salesRFQID ? parseInt(salesRFQID) : null,
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10
      });

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getSalesRFQApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
        totalRecords: 0
      });
    }
  }

  // Get a specific Sales RFQ approval by SalesRFQID and ApproverID
  static async getSalesRFQApprovalById(req, res) {
    try {
      const { salesRFQID, approverID } = req.params;

      if (isNaN(parseInt(salesRFQID)) || isNaN(parseInt(approverID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID or ApproverID',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      const result = await SalesRFQApprovalModel.getSalesRFQApprovalById({
        salesRFQID: parseInt(salesRFQID),
        approverID: parseInt(approverID)
      });

      return res.status(result.success ? (result.data ? 200 : 404) : 400).json(result);
    } catch (err) {
      console.error('Error in getSalesRFQApprovalById:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      });
    }
  }

  // Create a Sales RFQ approval
  static async createSalesRFQApproval(req, res) {
    try {
      const { salesRFQID, formName, roleName } = req.body;
      const approverID = req.user?.personId;

      if (!salesRFQID || !formName || !roleName) {
        return res.status(400).json({
          success: false,
          message: 'salesRFQID, formName, and roleName are required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      const approvalData = {
        SalesRFQID: parseInt(salesRFQID),
        ApproverID: parseInt(approverID),
        FormName: formName,
        RoleName: roleName
      };

      const result = await SalesRFQApprovalModel.createSalesRFQApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createSalesRFQApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      });
    }
  }

  // Update a Sales RFQ approval
  static async updateSalesRFQApproval(req, res) {
    try {
      const { salesRFQID, approvedYN, formName, roleName } = req.body;
      const approverID = req.user?.personId;

      if (!salesRFQID || !formName || !roleName) {
        return res.status(400).json({
          success: false,
          message: 'salesRFQID, formName, and roleName are required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      const approvalData = {
        SalesRFQID: parseInt(salesRFQID),
        ApproverID: parseInt(approverID),
        ApprovedYN: approvedYN != null ? Boolean(approvedYN) : null,
        FormName: formName,
        RoleName: roleName
      };

      const result = await SalesRFQApprovalModel.updateSalesRFQApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updateSalesRFQApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      });
    }
  }

  // Delete a Sales RFQ approval
  static async deleteSalesRFQApproval(req, res) {
    try {
      const { salesRFQID } = req.body;
      const approverID = req.user?.personId;

      if (!salesRFQID) {
        return res.status(400).json({
          success: false,
          message: 'salesRFQID is required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      const approvalData = {
        SalesRFQID: parseInt(salesRFQID),
        ApproverID: parseInt(approverID),
        DeletedByID: parseInt(approverID)
      };

      const result = await SalesRFQApprovalModel.deleteSalesRFQApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deleteSalesRFQApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      });
    }
  }
}

module.exports = SalesRFQApprovalController;
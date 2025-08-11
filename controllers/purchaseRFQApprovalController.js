const PurchaseRFQApprovalModel = require('../models/purchaseRFQApprovalModel');

class PurchaseRFQApprovalController {
  // Get Purchase RFQ approvals (all, filtered by PurchaseRFQID, or paginated)
  static async getPurchaseRFQApprovals(req, res) {
    try {
      const { purchaseRFQID, pageNumber, pageSize } = req.query;

      if (purchaseRFQID && isNaN(parseInt(purchaseRFQID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseRFQID',
          data: null,
          purchaseRFQId: null,
          totalRecords: 0
        });
      }

      const result = await PurchaseRFQApprovalModel.getPurchaseRFQApprovals({
        purchaseRFQID: purchaseRFQID ? parseInt(purchaseRFQID) : null,
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10
      });

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getPurchaseRFQApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
        totalRecords: 0
      });
    }
  }

  // Get a specific Purchase RFQ approval by PurchaseRFQID and ApproverID
  static async getPurchaseRFQApprovalById(req, res) {
    try {
      const { purchaseRFQID, approverID } = req.params;

      if (isNaN(parseInt(purchaseRFQID)) || isNaN(parseInt(approverID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseRFQID or ApproverID',
          data: null,
          purchaseRFQId: null,
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          purchaseRFQId: null,
        });
      }

      const result = await PurchaseRFQApprovalModel.getPurchaseRFQApprovalById({
        purchaseRFQID: parseInt(purchaseRFQID),
        approverID: parseInt(approverID)
      });

      return res.status(result.success ? (result.data ? 200 : 404) : 400).json(result);
    } catch (err) {
      console.error('Error in getPurchaseRFQApprovalById:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
      });
    }
  }

  // Create a Purchase RFQ approval
  static async createPurchaseRFQApproval(req, res) {
    try {
      const { purchaseRFQID, approvedYN, approverDateTime } = req.body;
      const approverID = req.user?.personId;

      if (!purchaseRFQID) {
        return res.status(400).json({
          success: false,
          message: 'purchaseRFQID is required',
          data: null,
          purchaseRFQId: null,
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          purchaseRFQId: null,
        });
      }

      const approvalData = {
        PurchaseRFQID: parseInt(purchaseRFQID),
        ApproverID: parseInt(approverID),
        ApprovedYN: approvedYN != null ? Boolean(approvedYN) : null,
        ApproverDateTime: approverDateTime || null
      };

      const result = await PurchaseRFQApprovalModel.createPurchaseRFQApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createPurchaseRFQApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
      });
    }
  }

  // Update a Purchase RFQ approval
  static async updatePurchaseRFQApproval(req, res) {
    try {
      const { purchaseRFQID, approvedYN, approverDateTime } = req.body;
      const approverID = req.user?.personId;

      if (!purchaseRFQID) {
        return res.status(400).json({
          success: false,
          message: 'purchaseRFQID is required',
          data: null,
          purchaseRFQId: null,
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          purchaseRFQId: null,
        });
      }

      const approvalData = {
        PurchaseRFQID: parseInt(purchaseRFQID),
        ApproverID: parseInt(approverID),
        ApprovedYN: approvedYN != null ? Boolean(approvedYN) : null,
        ApproverDateTime: approverDateTime || null
      };

      const result = await PurchaseRFQApprovalModel.updatePurchaseRFQApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updatePurchaseRFQApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
      });
    }
  }

  // Delete a Purchase RFQ approval
  static async deletePurchaseRFQApproval(req, res) {
    try {
      const { purchaseRFQID } = req.body;
      const approverID = req.user?.personId;

      if (!purchaseRFQID) {
        return res.status(400).json({
          success: false,
          message: 'purchaseRFQID is required',
          data: null,
          purchaseRFQId: null,
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          purchaseRFQId: null,
        });
      }

      const approvalData = {
        PurchaseRFQID: parseInt(purchaseRFQID),
        ApproverID: parseInt(approverID),
      };

      const result = await PurchaseRFQApprovalModel.deletePurchaseRFQApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deletePurchaseRFQApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
      });
    }
  }
}

module.exports = PurchaseRFQApprovalController;
const SalesQuotationApprovalModel = require('../models/salesQuotationApprovalModel');

class SalesQuotationApprovalController {
  static async getSalesQuotationApprovals(req, res) {
    try {
      const { salesQuotationID, pageNumber, pageSize } = req.query;

      if (salesQuotationID && isNaN(parseInt(salesQuotationID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesQuotationID',
          data: null,
          salesQuotationId: null,
          totalRecords: 0
        });
      }

      const result = await SalesQuotationApprovalModel.getSalesQuotationApprovals({
        salesQuotationID: salesQuotationID ? parseInt(salesQuotationID) : null,
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10
      });

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getSalesQuotationApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
        totalRecords: 0
      });
    }
  }

  static async getSalesQuotationApprovalById(req, res) {
    try {
      const { salesQuotationID, approverID } = req.params;

      if (isNaN(parseInt(salesQuotationID)) || isNaN(parseInt(approverID))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesQuotationID or ApproverID',
          data: null,
          salesQuotationId: null,
        });
      }

      const result = await SalesQuotationApprovalModel.getSalesQuotationApprovalById({
        salesQuotationID: parseInt(salesQuotationID),
        approverID: parseInt(approverID)
      });

      return res.status(result.success ? (result.data ? 200 : 404) : 400).json(result);
    } catch (err) {
      console.error('Error in getSalesQuotationApprovalById:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
      });
    }
  }

  static async createSalesQuotationApproval(req, res) {
    try {
      const { salesQuotationID, approvedYN, approverDateTime } = req.body;
      const createdByID = req.user?.personId;

      if (!salesQuotationID) {
        return res.status(400).json({
          success: false,
          message: 'SalesQuotationID is required',
          data: null,
          salesQuotationId: null,
        });
      }

      // if (!req.user || !createdByID) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'Authentication required',
      //     data: null,
      //     salesQuotationId: null,
      //   });
      // }

      const approvalData = {
        SalesQuotationID: parseInt(salesQuotationID),
        ApproverID: parseInt(createdByID),
        ApprovedYN: approvedYN != null ? Boolean(approvedYN) : null,
        ApproverDateTime: approverDateTime || null,
        CreatedByID: parseInt(createdByID)
      };

      const result = await SalesQuotationApprovalModel.createSalesQuotationApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createSalesQuotationApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
      });
    }
  }

  static async updateSalesQuotationApproval(req, res) {
    try {
      const { salesQuotationID, approverID, approvedYN, approverDateTime } = req.body;
      const createdByID = req.user?.personId;

      if (!salesQuotationID || !approverID) {
        return res.status(400).json({
          success: false,
          message: 'SalesQuotationID and ApproverID are required',
          data: null,
          salesQuotationId: null,
        });
      }

      if (!req.user || !createdByID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesQuotationId: null,
        });
      }

      const approvalData = {
        SalesQuotationID: parseInt(salesQuotationID),
        ApproverID: parseInt(approverID),
        ApprovedYN: approvedYN != null ? Boolean(approvedYN) : null,
        ApproverDateTime: approverDateTime || null,
        CreatedByID: parseInt(createdByID)
      };

      const result = await SalesQuotationApprovalModel.updateSalesQuotationApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updateSalesQuotationApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
      });
    }
  }

  static async deleteSalesQuotationApproval(req, res) {
    try {
      const { salesQuotationID, approverID } = req.body;
      const deletedByID = req.user?.personId;

      if (!salesQuotationID || !approverID) {
        return res.status(400).json({
          success: false,
          message: 'SalesQuotationID and ApproverID are required',
          data: null,
          salesQuotationId: null,
        });
      }

      if (!req.user || !deletedByID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesQuotationId: null,
        });
      }

      const approvalData = {
        SalesQuotationID: parseInt(salesQuotationID),
        ApproverID: parseInt(approverID),
        DeletedByID: parseInt(deletedByID)
      };

      const result = await SalesQuotationApprovalModel.deleteSalesQuotationApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deleteSalesQuotationApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
      });
    }
  }
}

module.exports = SalesQuotationApprovalController;
const SalesOrderApprovalModel = require('../models/salesOrderApprovalModel');

class SalesOrderApprovalController {
  static async getSalesOrderApproval(req, res) {
    try {
      const salesOrderId = parseInt(req.params.salesOrderId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(salesOrderId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesOrderID or ApproverID',
          data: null,
          salesOrderId: null,
          approverId: null
        });
      }

      const result = await SalesOrderApprovalModel.getSalesOrderApproval(salesOrderId, approverId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Error in getSalesOrderApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null,
        approverId: null
      });
    }
  }

  static async getAllSalesOrderApprovals(req, res) {
    try {
      const salesOrderId = req.query.salesOrderId ? parseInt(req.query.salesOrderId) : null;

      const result = await SalesOrderApprovalModel.getAllSalesOrderApprovals(salesOrderId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getAllSalesOrderApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: [],
        salesOrderId: null,
        approverId: null,
        totalRecords: 0
      });
    }
  }

  static async createSalesOrderApproval(req, res) {
    try {
      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesOrderId: null,
          approverId: null
        });
      }

      const approvalData = {
        SalesOrderID: req.body.salesOrderID ? parseInt(req.body.salesOrderID) : null,
        ApproverID: req.body.approverID ? parseInt(req.body.approverID) : null,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await SalesOrderApprovalModel.createSalesOrderApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createSalesOrderApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null,
        approverId: null
      });
    }
  }

  static async updateSalesOrderApproval(req, res) {
    try {
      const salesOrderId = parseInt(req.params.salesOrderId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(salesOrderId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesOrderID or ApproverID',
          data: null,
          salesOrderId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesOrderId: null,
          approverId: null
        });
      }

      const approvalData = {
        SalesOrderID: salesOrderId,
        ApproverID: approverId,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await SalesOrderApprovalModel.updateSalesOrderApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updateSalesOrderApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null,
        approverId: null
      });
    }
  }

  static async deleteSalesOrderApproval(req, res) {
    try {
      const salesOrderId = parseInt(req.params.salesOrderId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(salesOrderId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesOrderID or ApproverID',
          data: null,
          salesOrderId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesOrderId: null,
          approverId: null
        });
      }

      const approvalData = {
        SalesOrderID: salesOrderId,
        ApproverID: approverId,
        DeletedByID: req.user.personId
      };

      const result = await SalesOrderApprovalModel.deleteSalesOrderApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deleteSalesOrderApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null,
        approverId: null
      });
    }
  }
}

module.exports = SalesOrderApprovalController;
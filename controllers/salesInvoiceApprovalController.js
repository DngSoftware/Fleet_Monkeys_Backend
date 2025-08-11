const SalesInvoiceApprovalModel = require('../models/salesInvoiceApprovalModel');

class SalesInvoiceApprovalController {
  static async getSalesInvoiceApproval(req, res) {
    try {
      const salesInvoiceId = parseInt(req.params.salesInvoiceId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(salesInvoiceId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesInvoiceID or ApproverID',
          data: null,
          salesInvoiceId: null,
          approverId: null
        });
      }

      const result = await SalesInvoiceApprovalModel.getSalesInvoiceApproval(salesInvoiceId, approverId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Error in getSalesInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesInvoiceId: null,
        approverId: null
      });
    }
  }

  static async getAllSalesInvoiceApprovals(req, res) {
    try {
      const salesInvoiceId = req.query.salesInvoiceId ? parseInt(req.query.salesInvoiceId) : null;
      const approverId = req.query.approverId ? parseInt(req.query.approverId) : null;

      const result = await SalesInvoiceApprovalModel.getAllSalesInvoiceApprovals(salesInvoiceId, approverId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getAllSalesInvoiceApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: [],
        salesInvoiceId: null,
        approverId: null,
        totalRecords: 0
      });
    }
  }

  static async createSalesInvoiceApproval(req, res) {
    try {
      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesInvoiceId: null,
          approverId: null
        });
      }

      const approvalData = {
        SalesInvoiceID: req.body.salesInvoiceId ? parseInt(req.body.salesInvoiceId) : null,
        ApproverID: req.body.approverId ? parseInt(req.body.approverId) : null,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await SalesInvoiceApprovalModel.createSalesInvoiceApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createSalesInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesInvoiceId: null,
        approverId: null
      });
    }
  }

  static async updateSalesInvoiceApproval(req, res) {
    try {
      const salesInvoiceId = parseInt(req.params.salesInvoiceId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(salesInvoiceId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesInvoiceID or ApproverID',
          data: null,
          salesInvoiceId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesInvoiceId: null,
          approverId: null
        });
      }

      const approvalData = {
        SalesInvoiceID: salesInvoiceId,
        ApproverID: approverId,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await SalesInvoiceApprovalModel.updateSalesInvoiceApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updateSalesInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesInvoiceId: null,
        approverId: null
      });
    }
  }

  static async deleteSalesInvoiceApproval(req, res) {
    try {
      const salesInvoiceId = parseInt(req.params.salesInvoiceId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(salesInvoiceId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesInvoiceID or ApproverID',
          data: null,
          salesInvoiceId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesInvoiceId: null,
          approverId: null
        });
      }

      const approvalData = {
        SalesInvoiceID: salesInvoiceId,
        ApproverID: approverId,
        DeletedByID: req.user.personId
      };

      const result = await SalesInvoiceApprovalModel.deleteSalesInvoiceApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deleteSalesInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesInvoiceId: null,
        approverId: null
      });
    }
  }
}

module.exports = SalesInvoiceApprovalController;
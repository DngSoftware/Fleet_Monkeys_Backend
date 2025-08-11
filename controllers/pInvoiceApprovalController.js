const PInvoiceApprovalModel = require('../models/pInvoiceApprovalModel');

class PInvoiceApprovalController {
  static async getPInvoiceApproval(req, res) {
    try {
      const pInvoiceId = parseInt(req.params.pInvoiceId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(pInvoiceId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PInvoiceID or ApproverID',
          data: null,
          pInvoiceId: null,
          approverId: null
        });
      }

      const result = await PInvoiceApprovalModel.getPInvoiceApproval(pInvoiceId, approverId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Error in getPInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pInvoiceId: null,
        approverId: null
      });
    }
  }

  static async getAllPInvoiceApprovals(req, res) {
    try {
      const pInvoiceId = req.query.pInvoiceId ? parseInt(req.query.pInvoiceId) : null;
      const approverId = req.query.approverId ? parseInt(req.query.approverId) : null;

      const result = await PInvoiceApprovalModel.getAllPInvoiceApprovals(pInvoiceId, approverId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getAllPInvoiceApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: [],
        pInvoiceId: null,
        approverId: null,
        totalRecords: 0
      });
    }
  }

  static async createPInvoiceApproval(req, res) {
    try {
      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          pInvoiceId: null,
          approverId: null
        });
      }

      const approvalData = {
        PInvoiceID: req.body.pInvoiceId ? parseInt(req.body.pInvoiceId) : null,
        ApproverID: req.body.approverId ? parseInt(req.body.approverId) : null,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await PInvoiceApprovalModel.createPInvoiceApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createPInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pInvoiceId: null,
        approverId: null
      });
    }
  }

  static async updatePInvoiceApproval(req, res) {
    try {
      const pInvoiceId = parseInt(req.params.pInvoiceId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(pInvoiceId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PInvoiceID or ApproverID',
          data: null,
          pInvoiceId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          pInvoiceId: null,
          approverId: null
        });
      }

      const approvalData = {
        PInvoiceID: pInvoiceId,
        ApproverID: approverId,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await PInvoiceApprovalModel.updatePInvoiceApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updatePInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pInvoiceId: null,
        approverId: null
      });
    }
  }

  static async deletePInvoiceApproval(req, res) {
    try {
      const pInvoiceId = parseInt(req.params.pInvoiceId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(pInvoiceId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PInvoiceID or ApproverID',
          data: null,
          pInvoiceId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          pInvoiceId: null,
          approverId: null
        });
      }

      const approvalData = {
        PInvoiceID: pInvoiceId,
        ApproverID: approverId,
        DeletedByID: req.user.personId
      };

      const result = await PInvoiceApprovalModel.deletePInvoiceApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deletePInvoiceApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        pInvoiceId: null,
        approverId: null
      });
    }
  }
}

module.exports = PInvoiceApprovalController;
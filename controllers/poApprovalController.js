const POApprovalModel = require('../models/poApprovalModel');

class POApprovalController {
  static async getPOApproval(req, res) {
    try {
      const poId = parseInt(req.params.poId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(poId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing POID or ApproverID',
          data: null,
          poId: null,
          approverId: null
        });
      }

      const result = await POApprovalModel.getPOApproval(poId, approverId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Error in getPOApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        poId: null,
        approverId: null
      });
    }
  }

  static async getAllPOApprovals(req, res) {
    try {
      const poId = req.query.poId ? parseInt(req.query.poId) : null;
      const approverId = req.query.approverId ? parseInt(req.query.approverId) : null;

      const result = await POApprovalModel.getAllPOApprovals(poId, approverId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getAllPOApprovals:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: [],
        poId: null,
        approverId: null,
        totalRecords: 0
      });
    }
  }

  static async createPOApproval(req, res) {
    try {
      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          poId: null,
          approverId: null
        });
      }

      const approvalData = {
        POID: req.body.poId ? parseInt(req.body.poId) : null,
        ApproverID: req.body.approverId ? parseInt(req.body.approverId) : null,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await POApprovalModel.createPOApproval(approvalData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createPOApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        poId: null,
        approverId: null
      });
    }
  }

  static async updatePOApproval(req, res) {
    try {
      const poId = parseInt(req.params.poId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(poId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing POID or ApproverID',
          data: null,
          poId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          poId: null,
          approverId: null
        });
      }

      const approvalData = {
        POID: poId,
        ApproverID: approverId,
        ApprovedYN: req.body.approvedYN !== undefined ? req.body.approvedYN : null,
        ApproverDateTime: req.body.approverDateTime || null,
        CreatedByID: req.user.personId
      };

      const result = await POApprovalModel.updatePOApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updatePOApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        poId: null,
        approverId: null
      });
    }
  }

  static async deletePOApproval(req, res) {
    try {
      const poId = parseInt(req.params.poId);
      const approverId = parseInt(req.params.approverId);
      if (isNaN(poId) || isNaN(approverId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing POID or ApproverID',
          data: null,
          poId: null,
          approverId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          poId: null,
          approverId: null
        });
      }

      const approvalData = {
        POID: poId,
        ApproverID: approverId,
        DeletedByID: req.user.personId
      };

      const result = await POApprovalModel.deletePOApproval(approvalData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deletePOApproval:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        poId: null,
        approverId: null
      });
    }
  }
}

module.exports = POApprovalController;
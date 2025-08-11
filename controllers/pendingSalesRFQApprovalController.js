const PendingSalesRFQApprovalModel = require('../models/pendingSalesRFQApprovalModel');

class PendingSalesRFQApprovalController {
  static async getPendingApprovals(req, res) {
    try {
      const approvalData = {
        PersonID: req.user ? parseInt(req.user.personId) : null,
        RoleName: req.query.roleName || null,
        FormName: req.query.formName || null
      };

    //   if (!approvalData.PersonID) {
    //     return res.status(401).json({
    //       success: false,
    //       message: 'Authentication required',
    //       data: null,
    //       salesRFQId: null,
    //       newSalesRFQId: null
    //     });
    //   }

      if (!approvalData.RoleName || !approvalData.FormName) {
        return res.status(400).json({
          success: false,
          message: 'RoleName and FormName are required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      const result = await PendingSalesRFQApprovalModel.getPendingApprovals(approvalData);
      return res.status(result.success ? 200 : 403).json(result);
    } catch (error) {
      console.error('Get Pending SalesRFQ Approvals error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      });
    }
  }
}

module.exports = PendingSalesRFQApprovalController;
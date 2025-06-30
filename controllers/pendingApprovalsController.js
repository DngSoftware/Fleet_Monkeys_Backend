const PendingApprovalsModel = require('../models/pendingApprovalsModel');

class PendingApprovalsController {
  // Get pending approvals
  static async getPendingApprovals(req, res) {
    try {

         // Extract userId from authentication context (e.g., JWT token)
      const userId = req.user && req.user.personId ? parseInt(req.user.personId):null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      const { fromDate, toDate, pageNumber, pageSize, formName } = req.query;
      const result = await PendingApprovalsModel.getPendingApprovals({
        userId: userId ? parseInt(userId) : null,
        fromDate: fromDate || null,
        toDate: toDate || null,
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 50,
        formName: formName || null
      });
      res.status(200).json({
        success: true,
        message: 'Pending approvals retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords
      });
    } catch (err) {
      console.error('Error in getPendingApprovals:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = PendingApprovalsController;
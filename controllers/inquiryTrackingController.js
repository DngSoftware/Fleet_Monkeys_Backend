const InquiryTrackingModel = require('../models/inquiryTrackingModel');

class InquiryTrackingController {
  static async getInquiryTracking(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
        SalesRFQID: req.query.salesRFQId ? parseInt(req.query.salesRFQId) : null
      };

      // Validate pagination parameters
      if (paginationData.PageNumber < 1 || paginationData.PageSize < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber or pageSize',
          data: null,
          totalRecords: 0,
          salesRFQId: null
        });
      }

      // Validate SalesRFQID if provided
      if (paginationData.SalesRFQID && (isNaN(paginationData.SalesRFQID) || paginationData.SalesRFQID < 1)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid salesRFQId',
          data: null,
          totalRecords: 0,
          salesRFQId: null
        });
      }

      const result = await InquiryTrackingModel.getInquiryTracking(paginationData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get Inquiry Tracking error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        totalRecords: 0,
        salesRFQId: null
      });
    }
  }
}

module.exports = InquiryTrackingController;
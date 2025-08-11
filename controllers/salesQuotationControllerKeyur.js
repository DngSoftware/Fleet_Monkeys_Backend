const SalesQuotationModel = require('../models/salesQuotationModelKeyur');

class SalesQuotationController {
  // Get all Sales Quotations
  static async getAllSalesQuotations(req, res) {
    try {
      const { pageNumber, pageSize, sortColumn, sortDirection, fromDate, toDate, status, customerid, supplierid } = req.query;

      if (pageNumber && isNaN(parseInt(pageNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageNumber',
          data: null,
          salesquotationid: null,
          newsalesquotationid: null
        });
      }
      if (pageSize && isNaN(parseInt(pageSize))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pageSize',
          data: null,
          salesquotationid: null,
          newsalesquotationid: null
        });
      }

      const result = await SalesQuotationModel.getAllSalesQuotations({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        sortColumn: sortColumn || 'salesquotationid',
        sortDirection: sortDirection || 'ASC',
        fromDate: fromDate || null,
        toDate: toDate || null,
        status: status || null,
        customerId: parseInt(customerid) || null,
        supplierId: parseInt(supplierid) || null
      });

      res.status(200).json({
        success: true,
        message: 'Sales Quotation records retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          currentPage: result.currentPage,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        },
        salesquotationid: null,
        newsalesquotationid: null
      });
    } catch (err) {
      console.error('Error in getAllSalesQuotations:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesquotationid: null,
        newsalesquotationid: null
      });
    }
  }

  // Create a new Sales Quotation
  static async createSalesQuotation(req, res) {
    try {
      const data = req.body;

      // Validate required fields
      if (!data.purchaseRFQID || !data.createdByID) {
        return res.status(400).json({
          success: false,
          message: 'PurchaseRFQID and CreatedByID are required.',
          data: null,
          salesQuotationID: null,
          newSalesQuotationID: null
        });
      }

      const result = await SalesQuotationModel.createSalesQuotation(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationID: null,
        newSalesQuotationID: result.newSalesQuotationID
      });
    } catch (err) {
      console.error('Error in createSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationID: null,
        newSalesQuotationID: null
      });
    }
  }

  // Other methods unchanged for brevity
  static async getSalesQuotationById(req, res) {
    try {
      const { id } = req.params;
      const salesQuotation = await SalesQuotationModel.getSalesQuotationById(parseInt(id));
      if (!salesQuotation) {
        return res.status(404).json({
          success: false,
          message: 'Sales Quotation not found or deleted.',
          data: null,
          salesQuotationID: null,
          newSalesQuotationID: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Sales Quotation retrieved successfully.',
        data: salesQuotation,
        salesQuotationID: id,
        newSalesQuotationID: null
      });
    } catch (err) {
      console.error('Error in getSalesQuotationById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationID: null,
        newSalesQuotationID: null
      });
    }
  }

  static async updateSalesQuotation(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      if (!data.deletedByID) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required.',
          data: null,
          salesQuotationID: null,
          newSalesQuotationID: null
        });
      }
      const result = await SalesQuotationModel.updateSalesQuotation(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationID: id,
        newSalesQuotationID: null
      });
    } catch (err) {
      console.error('Error in updateSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationID: null,
        newSalesQuotationID: null
      });
    }
  }

  static async deleteSalesQuotation(req, res) {
    try {
      const { id } = req.params;
      const { deletedByID } = req.body;
      if (!deletedByID) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required.',
          data: null,
          salesQuotationID: null,
          newSalesQuotationID: null
        });
      }
      const result = await SalesQuotationModel.deleteSalesQuotation(parseInt(id), deletedByID);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationID: id,
        newSalesQuotationID: null
      });
    } catch (err) {
      console.error('Error in deleteSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationID: null,
        newSalesQuotationID: null
      });
    }
  }

  static async approveSalesQuotation(req, res) {
    try {
      const { SalesQuotationID } = req.body;
      const approverID = req.user?.personId;

      if (!SalesQuotationID) {
        return res.status(400).json({
          success: false,
          message: 'salesQuotationID is required',
          data: null,
          salesQuotationID: null,
          newSalesQuotationID: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesQuotationID: null,
          newSalesQuotationID: null
        });
      }

      const approvalData = {
        SalesQuotationID: parseInt(SalesQuotationID),
        ApproverID: parseInt(approverID)
      };

      const result = await SalesQuotationModel.approveSalesQuotation(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (err) {
      console.error('Approve SalesQuotation error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationID: null,
        newSalesQuotationID: null
      });
    }
  }

  static async getSalesQuotationApprovalStatus(req, res) {
    try {
      const SalesQuotationID = parseInt(req.params.id);
      if (isNaN(SalesQuotationID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesQuotationID',
          data: null,
          SalesQuotationID: null,
          newSalesQuotationID: null
        });
      }

      const result = await SalesQuotationModel.getSalesQuotationApprovalStatus(SalesQuotationID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get SalesQuotation Approval Status error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        SalesQuotationID: null,
        newSalesQuotationID: null
      });
    }
  }
}

module.exports = SalesQuotationController;
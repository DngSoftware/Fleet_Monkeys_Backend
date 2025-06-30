const SalesInvoiceModel = require('../models/salesInvoiceModel');

class SalesInvoiceController {
  // Get all Sales Invoices
  static async getAllSalesInvoices(req, res) {
    try {
      const {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        customerId,
        companyId,
        supplierId,
        dateFrom,
        dateTo,
        searchTerm
      } = req.query;

      const result = await SalesInvoiceModel.getAllSalesInvoices({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        sortBy: sortBy || 'CreatedDateTime',
        sortOrder: sortOrder || 'DESC',
        customerId: customerId ? parseInt(customerId) : null,
        companyId: companyId ? parseInt(companyId) : null,
        supplierId: supplierId ? parseInt(supplierId) : null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        searchTerm: searchTerm || null
      });

      res.status(200).json({
        success: true,
        message: 'Sales Invoices retrieved successfully.',
        data: result.data,
        pagination: {
          totalRecords: result.totalRecords,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          pageSize: result.pageSize
        }
      });
    } catch (err) {
      console.error('Error in getAllSalesInvoices:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Get Sales Invoice by ID
  static async getSalesInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const salesInvoiceId = parseInt(id);

      if (isNaN(salesInvoiceId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid SalesInvoiceID: must be an integer',
          data: null
        });
      }

      const result = await SalesInvoiceModel.getSalesInvoiceById(salesInvoiceId);
      if (!result.data) {
        return res.status(404).json({
          success: false,
          message: 'Sales Invoice not found',
          data: null
        });
      }

      res.status(200).json({
        success: true,
        message: 'Sales Invoice retrieved successfully.',
        data: result.data
      });
    } catch (err) {
      console.error('Error in getSalesInvoiceById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Create a Sales Invoice
  static async createSalesInvoice(req, res) {
    try {
      const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      const data = req.body;
      // Validate required fields (based on SP_ManageSalesInvoiceDEV requirements)
      if (!data.salesOrderId && !data.salesRFQId) {
        return res.status(400).json({
          success: false,
          message: 'Either SalesOrderID or SalesRFQID is required.',
          data: null
        });
      }

      const result = await SalesInvoiceModel.createSalesInvoice(data, userId);
      res.status(201).json({
        success: true,
        message: result.message,
        data: { salesInvoiceId: result.salesInvoiceId }
      });
    } catch (err) {
      console.error('Error in createSalesInvoice:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Approve a Sales Invoice
  static async approveSalesInvoice(req, res) {
    try {
      const { SalesInvoiceID } = req.body;
      const approverID = req.user?.personId;

      if (!SalesInvoiceID) {
        return res.status(400).json({
          success: false,
          message: 'SalesInvoiceID is required',
          data: null,
          SalesInvoiceID: null,
          newSalesInvoiceID: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          SalesInvoiceID: null,
          newSalesInvoiceID: null
        });
      }

      const approvalData = {
        SalesInvoiceID: parseInt(SalesInvoiceID),
        ApproverID: parseInt(approverID)
      };

      const result = await SalesInvoiceModel.approveSalesInvoice(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (err) {
      console.error('Approve Sales Invoice error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        SalesInvoiceID: null,
        newSalesInvoiceID: null
      });
    }
  }

         static async getSalesInvoiceApprovalStatus(req, res) {
    try {
      const SalesInvoiceID = parseInt(req.params.id);
      if (isNaN(SalesInvoiceID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesInvoiceID',
          data: null,
          SalesInvoiceID: null,
          newSalesInvoiceID: null
        });
      }

      const result = await SalesInvoiceModel.getSalesInvoiceApprovalStatus(SalesInvoiceID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get SalesInvoice Approval Status error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        SalesInvoiceID: null,
        newSalesInvoiceID: null
      });
    }
  }
}

module.exports = SalesInvoiceController;
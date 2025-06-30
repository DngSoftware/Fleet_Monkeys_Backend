const PInvoiceModel = require('../models/pInvoiceModel');

class PInvoiceController {
  // Get all Purchase Invoices
  static async getAllPInvoices(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;
      const result = await PInvoiceModel.getAllPInvoices({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate: fromDate || null,
        toDate: toDate || null
      });
      res.status(200).json({
        success: true,
        message: 'Purchase Invoices retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords
      });
    } catch (err) {
      console.error('Error in getAllPInvoices:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Get a single Purchase Invoice by ID
  static async getPInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const pInvoice = await PInvoiceModel.getPInvoiceById(parseInt(id));
      if (!pInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Purchase Invoice not found.',
          data: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Purchase Invoice retrieved successfully.',
        data: pInvoice
      });
    } catch (err) {
      console.error('Error in getPInvoiceById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Create a Purchase Invoice
  static async createPInvoice(req, res) {
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
      // Validate required fields
      if (!data.poid) {
        return res.status(400).json({
          success: false,
          message: 'POID is required.',
          data: null
        });
      }

      const result = await PInvoiceModel.createPInvoice(data, userId);
      res.status(201).json({
        success: true,
        message: result.message,
        data: { pInvoiceId: result.pInvoiceId }
      });
    } catch (err) {
      console.error('Error in createPInvoice:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Update a Purchase Invoice
  static async updatePInvoice(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      const data = req.body;
      const result = await PInvoiceModel.updatePInvoice(parseInt(id), data, userId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (err) {
      console.error('Error in updatePInvoice:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

  // Delete a Purchase Invoice
  static async deletePInvoice(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user && req.user.personId ? parseInt(req.user.personId) : null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found in authentication context.',
          data: null
        });
      }

      const result = await PInvoiceModel.deletePInvoice(parseInt(id), userId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (err) {
      console.error('Error in deletePInvoice:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }

   // Approve a Sales Quotation
  static async approvePInvoice(req, res) {
    try {
      const { PInvoiceID } = req.body;
      const approverID = req.user?.personId;

      if (!PInvoiceID) {
        return res.status(400).json({
          success: false,
          message: 'PInvoiceID is required',
          data: null,
          PInvoiceID: null,
          newPInvoiceID: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          PInvoiceID: null,
          newPInvoiceID: null
        });
      }

      const approvalData = {
        PInvoiceID: parseInt(PInvoiceID),
        ApproverID: parseInt(approverID)
      };

      const result = await PInvoiceModel.approvePInvoice(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (err) {
      console.error('Approve Purchase Invoice error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        POID: null,
        newPOID: null
      });
    }
  }

       static async getPInvoiceApprovalStatus(req, res) {
    try {
      const PInvoiceID = parseInt(req.params.id);
      if (isNaN(PInvoiceID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseInvoiceID',
          data: null,
          PInvoiceID: null,
          newPInvoiceID: null
        });
      }

      const result = await PInvoiceModel.getPInvoiceApprovalStatus(PInvoiceID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get PurchaseInvoice Approval Status error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        PInvoiceID: null,
        newPInvoiceID: null
      });
    }
  }
}

module.exports = PInvoiceController;
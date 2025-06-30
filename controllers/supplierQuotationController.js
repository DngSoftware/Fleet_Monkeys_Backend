const SupplierQuotationModel = require('../models/supplierQuotationModel');

class SupplierQuotationController {
  // Get all Supplier Quotations
  static async getAllSupplierQuotations(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;
      const result = await SupplierQuotationModel.getAllSupplierQuotations({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        fromDate,
        toDate
      });
      res.status(200).json({
        success: true,
        message: 'Supplier Quotation records retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords,
        supplierQuotationId: null,
        newSupplierQuotationId: null
      });
    } catch (err) {
      console.error('Error in getAllSupplierQuotations:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
        newSupplierQuotationId: null
      });
    }
  }

  // Create a new Supplier Quotation
  static async createSupplierQuotation(req, res) {
    try {
      const allowedRoles = ['Administrator', 'Customer Order Coordinator'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Administrators or Customer Order Coordinators can create Supplier Quotation',
          data: null,
          supplierQuotationId: null,
          newSupplierQuotationId: null
        });
      }

      const data = {
        PurchaseRFQID: req.body.PurchaseRFQID,
        SupplierID: req.body.SupplierID,
        CertificationID: req.body.CertificationID,
        Status: req.body.Status,
        CreatedByID: req.user.personId,
        rate: req.body.rate,
        CountryOfOriginID: req.body.CountryOfOriginID,
        SalesAmount: req.body.SalesAmount,
        taxesAndOtherCharges: req.body.taxesAndOtherCharges,
        total: req.body.total,
        fileContent: req.body.fileContent,
        fileName: req.body.fileName
      };

      // Validate required fields
      if (!data.PurchaseRFQID || !data.SupplierID || !data.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'PurchaseRFQID, SupplierID, and CreatedByID are required.',
          data: null,
          supplierQuotationId: null,
          newSupplierQuotationId: null
        });
      }

      const result = await SupplierQuotationModel.createSupplierQuotation(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        supplierQuotationId: null,
        newSupplierQuotationId: result.newSupplierQuotationId
      });
    } catch (err) {
      console.error('Error in createSupplierQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
        newSupplierQuotationId: null
      });
    }
  }

  // Get a single Supplier Quotation by ID
  static async getSupplierQuotationById(req, res) {
    try {
      const { id } = req.params;
      const supplierQuotation = await SupplierQuotationModel.getSupplierQuotationById(parseInt(id));
      if (!supplierQuotation.quotation) {
        return res.status(404).json({
          success: false,
          message: 'Supplier Quotation not found or deleted.',
          data: null,
          supplierQuotationId: null,
          newSupplierQuotationId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Supplier Quotation retrieved successfully.',
        data: {
          quotation: supplierQuotation.quotation,
          parcels: supplierQuotation.parcels
        },
        supplierQuotationId: id,
        newSupplierQuotationId: null
      });
    } catch (err) {
      console.error('Error in getSupplierQuotationById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
        newSupplierQuotationId: null
      });
    }
  }

  // Update a Supplier Quotation
  static async updateSupplierQuotation(req, res) {
    try {
      const { id } = req.params;
      const data = {
        SupplierID: req.body.SupplierID,
        PurchaseRFQID: req.body.PurchaseRFQID,
        CertificationID: req.body.CertificationID,
        Status: req.body.Status,
        CreatedByID: req.user.personId,
        rate: req.body.rate,
        CountryOfOriginID: req.body.CountryOfOriginID,
        SalesAmount: req.body.SalesAmount,
        taxesAndOtherCharges: req.body.taxesAndOtherCharges,
        total: req.body.total,
        fileContent: req.body.fileContent,
        fileName: req.body.fileName
      };

      // Validate required fields
      if (!data.PurchaseRFQID || !data.SupplierID || !data.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'PurchaseRFQID, SupplierID, and CreatedByID are required.',
          data: null,
          supplierQuotationId: null,
          newSupplierQuotationId: null
        });
      }

      const result = await SupplierQuotationModel.updateSupplierQuotation(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        supplierQuotationId: id,
        newSupplierQuotationId: null
      });
    } catch (err) {
      console.error('Error in updateSupplierQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
        newSupplierQuotationId: null
      });
    }
  }

  // Delete a Supplier Quotation
  static async deleteSupplierQuotation(req, res) {
    try {
      const { id } = req.params;
      const deletedById = req.user?.personId;
      if (!deletedById) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          data: null,
          supplierQuotationId: null,
          newSupplierQuotationId: null
        });
      }

      const result = await SupplierQuotationModel.deleteSupplierQuotation(parseInt(id), deletedById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        supplierQuotationId: id,
        newSupplierQuotationId: null
      });
    } catch (err) {
      console.error('Error in deleteSupplierQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
        newSupplierQuotationId: null
      });
    }
  }

  // Approve a Supplier Quotation
  static async approveSupplierQuotation(req, res) {
    try {
      const { SupplierQuotationID } = req.body;
      const approverID = req.user?.personId;

      if (!SupplierQuotationID) {
        return res.status(400).json({
          success: false,
          message: 'supplierQuotationID is required',
          data: null,
          supplierQuotationId: null,
          newSupplierQuotationId: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          supplierQuotationId: null,
          newSupplierQuotationId: null
        });
      }

      const approvalData = {
        SupplierQuotationID: parseInt(SupplierQuotationID),
        ApproverID: parseInt(approverID)
      };

      const result = await SupplierQuotationModel.approveSupplierQuotation(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (err) {
      console.error('Approve SupplierQuotation error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        supplierQuotationId: null,
        newSupplierQuotationId: null
      });
    }
  }

    static async getSupplierQuotationApprovalStatus(req, res) {
    try {
      const SupplierQuotationID = parseInt(req.params.id);
      if (isNaN(SupplierQuotationID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SupplierQuotationID',
          data: null,
          SupplierQuotationID: null,
          newSupplierQuotationID: null
        });
      }

      const result = await SupplierQuotationModel.getSupplierQuotationApprovalStatus(SupplierQuotationID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get SupplierQuotation Approval Status error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        SupplierQuotationID: null,
        newSupplierQuotationID: null
      });
    }
  }
}

module.exports = SupplierQuotationController
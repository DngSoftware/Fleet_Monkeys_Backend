const SalesQuotationModel = require('../models/salesQuotationModel');

class SalesQuotationController {
  // Get all Sales Quotations
  static async getAllSalesQuotations(req, res) {
    try {
      const { pageNumber, pageSize, sortColumn, sortDirection, fromDate, toDate, status, customerId, supplierId } = req.query;
      const result = await SalesQuotationModel.getAllSalesQuotations({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        sortColumn: sortColumn || 'SalesQuotationID',
        sortDirection: sortDirection || 'ASC',
        fromDate: fromDate || null,
        toDate: toDate || null,
        status: status || null,
        customerId: parseInt(customerId) || null,
        supplierId: parseInt(supplierId) || null
      });
      res.status(200).json({
        success: true,
        message: 'Sales Quotation records retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords,
        salesQuotationId: null,
        newSalesQuotationId: null
      });
    } catch (err) {
      console.error('Error in getAllSalesQuotations:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
        newSalesQuotationId: null
      });
    }
  }

  // Create a new Sales Quotation
  static async createSalesQuotation(req, res) {
    try {

      const data = {
        SalesRFQID: req.body.SalesRFQID,
        PurchaseRFQID: req.body.PurchaseRFQID,
        supplierId: req.body.supplierId,
        Status: req.body.Status,
        originWarehouseAddressId: req.body.originWarehouseAddressId,
        collectionAddressId: req.body.collectionAddressId,
        billingAddressId: req.body.billingAddressId,
        destinationAddressId: req.body.destinationAddressId,
        destinationWarehouseAddressId: req.body.destinationWarehouseAddressId,
        collectionWarehouseId: req.body.collectionWarehouseId,
        postingDate: req.body.postingDate,
        deliveryDate: req.body.deliveryDate,
        requiredByDate: req.body.requiredByDate,
        dateReceived: req.body.dateReceived,
        serviceTypeId: req.body.serviceTypeId,
        externalRefNo: req.body.externalRefNo,
        externalSupplierId: req.body.externalSupplierId,
        customerId: req.body.customerId,
        companyId: req.body.companyId,
        terms: req.body.terms,
        packagingRequiredYN: req.body.packagingRequiredYN,
        collectFromSupplierYN: req.body.collectFromSupplierYN,
        salesQuotationCompletedYN: req.body.salesQuotationCompletedYN,
        shippingPriorityId: req.body.shippingPriorityId,
        validTillDate: req.body.validTillDate,
        currencyId: req.body.currencyId,
        supplierContactPersonId: req.body.supplierContactPersonId,
        isDeliveryOnly: req.body.isDeliveryOnly,
        taxesAndOtherCharges: req.body.taxesAndOtherCharges,
        CreatedByID: req.user.personId
      };

      // Validate required fields
      if (!data.PurchaseRFQID || !data.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'PurchaseRFQID and CreatedByID are required.',
          data: null,
          salesQuotationId: null,
          newSalesQuotationId: null
        });
      }

      const result = await SalesQuotationModel.createSalesQuotation(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationId: null,
        newSalesQuotationId: result.newSalesQuotationId
      });
    } catch (err) {
      console.error('Error in createSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
        newSalesQuotationId: null
      });
    }
  }

  // Get a single Sales Quotation by ID
  static async getSalesQuotationById(req, res) {
    try {
      const { id } = req.params;
      const salesQuotation = await SalesQuotationModel.getSalesQuotationById(parseInt(id));
      if (!salesQuotation) {
        return res.status(404).json({
          success: false,
          message: 'Sales Quotation not found or deleted.',
          data: null,
          salesQuotationId: null,
          newSalesQuotationId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Sales Quotation retrieved successfully.',
        data: salesQuotation,
        salesQuotationId: id,
        newSalesQuotationId: null
      });
    } catch (err) {
      console.error('Error in getSalesQuotationById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
        newSalesQuotationId: null
      });
    }
  }

  // Update a Sales Quotation
  static async updateSalesQuotation(req, res) {
    try {
      const { id } = req.params;
      const data = {
        SalesRFQID: req.body.SalesRFQID,
        PurchaseRFQID: req.body.PurchaseRFQID,
        supplierId: req.body.supplierId,
        Status: req.body.Status,
        originAddressId: req.body.originAddressId,
        collectionAddressId: req.body.collectionAddressId,
        billingAddressId: req.body.billingAddressId,
        destinationAddressId: req.body.destinationAddressId,
        collectionWarehouseId: req.body.collectionWarehouseId,
        postingDate: req.body.postingDate,
        deliveryDate: req.body.deliveryDate,
        requiredByDate: req.body.requiredByDate,
        dateReceived: req.body.dateReceived,
        serviceTypeId: req.body.serviceTypeId,
        externalRefNo: req.body.externalRefNo,
        externalSupplierId: req.body.externalSupplierId,
        customerId: req.body.customerId,
        companyId: req.body.companyId,
        terms: req.body.terms,
        packagingRequiredYN: req.body.packagingRequiredYN,
        collectFromSupplierYN: req.body.collectFromSupplierYN,
        salesQuotationCompletedYN: req.body.salesQuotationCompletedYN,
        shippingPriorityId: req.body.shippingPriorityId,
        validTillDate: req.body.validTillDate,
        currencyId: req.body.currencyId,
        supplierContactPersonId: req.body.supplierContactPersonId,
        isDeliveryOnly: req.body.isDeliveryOnly,
        TaxesAndOtherCharges: req.body.taxesAndOtherCharges,
        CreatedByID: req.user.personId
      };

      // Validate required fields
      if (!data.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'CreatedByID is required.',
          data: null,
          salesQuotationId: null,
          newSalesQuotationId: null
        });
      }

      const result = await SalesQuotationModel.updateSalesQuotation(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationId: id,
        newSalesQuotationId: null
      });
    } catch (err) {
      console.error('Error in updateSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
        newSalesQuotationId: null
      });
    }
  }

  // Delete a Sales Quotation
  static async deleteSalesQuotation(req, res) {
    try {
      const { id } = req.params;
      const deletedById = req.user?.personId;
      if (!deletedById) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          data: null,
          salesQuotationId: null,
          newSalesQuotationId: null
        });
      }

      const result = await SalesQuotationModel.deleteSalesQuotation(parseInt(id), deletedById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesQuotationId: id,
        newSalesQuotationId: null
      });
    } catch (err) {
      console.error('Error in deleteSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesQuotationId: null,
        newSalesQuotationId: null
      });
    }
  }

  // Approve a Sales Quotation
  static async approveSalesQuotation(req, res) {
    try {
      const { SalesQuotationID } = req.body;
      const approverID = req.user?.personId;

      if (!SalesQuotationID) {
        return res.status(400).json({
          success: false,
          message: 'salesQuotationID is required',
          data: null,
          salesQuotationId: null,
          newSalesQuotationId: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesQuotationId: null,
          newSalesQuotationId: null
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
        salesQuotationId: null,
        newSalesQuotationId: null
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
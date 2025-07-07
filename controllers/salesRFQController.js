const SalesRFQModel = require('../models/salesRFQModel');
const { generateSalesRFQPDF } = require('../services/salesRFQPDFGenerator');
const { sendDocumentEmail } = require('../utils/emailSender');
const fs = require('fs');
const poolPromise = require('../config/db.config');

class SalesRFQController {
  static async createSalesRFQ(req, res) {
    try {
      const salesRFQData = {
        Series: req.body.Series,
        CompanyID: parseInt(req.body.CompanyID),
        CustomerID: parseInt(req.body.CustomerID),
        SupplierID: req.body.SupplierID ? parseInt(req.body.SupplierID) : null,
        ExternalRefNo: req.body.ExternalRefNo,
        ExternalSupplierID: req.body.ExternalSupplierID ? parseInt(req.body.ExternalSupplierID) : null,
        DeliveryDate: req.body.DeliveryDate,
        PostingDate: req.body.PostingDate,
        RequiredByDate: req.body.RequiredByDate,
        DateReceived: req.body.DateReceived,
        ServiceTypeID: req.body.ServiceTypeID ? parseInt(req.body.ServiceTypeID) : null,
        OriginWarehouseAddressID: req.body.OriginWarehouseAddressID ? parseInt(req.body.OriginWarehouseAddressID) : null,
        CollectionAddressID: req.body.CollectionAddressID ? parseInt(req.body.CollectionAddressID) : null,
        Status: req.body.Status,
        DestinationAddressID: req.body.DestinationAddressID ? parseInt(req.body.DestinationAddressID) : null,
        DestinationWarehouseAddressID: req.body.DestinationWarehouseAddressID ? parseInt(req.body.DestinationWarehouseAddressID) : null,
        BillingAddressID: req.body.BillingAddressID ? parseInt(req.body.BillingAddressID) : null,
        ShippingPriorityID: req.body.ShippingPriorityID ? parseInt(req.body.ShippingPriorityID) : null,
        Terms: req.body.Terms,
        CurrencyID: req.body.CurrencyID ? parseInt(req.body.CurrencyID) : null,
        CollectFromSupplierYN: req.body.CollectFromSupplierYN != null ? Boolean(req.body.CollectFromSupplierYN) : null,
        PackagingRequiredYN: req.body.PackagingRequiredYN != null ? Boolean(req.body.PackagingRequiredYN) : null,
        FormCompletedYN: req.body.FormCompletedYN != null ? Boolean(req.body.FormCompletedYN) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
        CompanyName: req.body.CompanyName, // Add if available in request
        City: req.body.City, // Add if available in request
      };

      const result = await SalesRFQModel.createSalesRFQ(salesRFQData);
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json({
        ...result,
        message: 'Sales RFQ created successfully. Please create parcels and send email separately if needed.',
      });
    } catch (error) {
      console.error('Create SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }

  static async sendSalesRFQEmail(req, res) {
    try {
      const { salesRFQId } = req.params;
      if (!salesRFQId || isNaN(parseInt(salesRFQId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid SalesRFQID is required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const pool = await poolPromise;
      console.log('Resolved Pool object:', pool);

      // Fetch customer email
      const [customer] = await pool.query(
        'SELECT CustomerEmail FROM dbo_tblcustomer WHERE CustomerID = (SELECT CustomerID FROM dbo_tblsalesrfq WHERE SalesRFQID = ?)',
        [salesRFQId]
      );

      if (customer.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Customer email not found',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      // Fetch parcels
      const [parcels] = await pool.query(
        'SELECT ItemID, ItemQuantity, UOMID FROM dbo_tblsalesrfqparcel WHERE SalesRFQID = ? AND IsDeleted = 0',
        [salesRFQId]
      );

      // Fetch SalesRFQ data with CompanyName from dbo_tblcompany
      const [salesRFQData] = await pool.query(
        'SELECT s.Series, s.CustomerID, s.DeliveryDate, s.Terms, c.CompanyName ' +
        'FROM dbo_tblsalesrfq s ' +
        'LEFT JOIN dbo_tblcompany c ON s.CompanyID = c.CompanyID ' +
        'WHERE s.SalesRFQID = ?',
        [salesRFQId]
      );

      if (salesRFQData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sales RFQ not found',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      // Generate PDF (using default City value 'N/A' since it's not in the query)
      const pdfBuffer = await generateSalesRFQPDF({
        ...salesRFQData[0],
        City: 'N/A' // Placeholder since City is not fetched; adjust if needed
      }, parcels);

      // Send email
      await sendDocumentEmail(customer[0].CustomerEmail, salesRFQData[0].Series, pdfBuffer, 'SalesRFQ');

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        data: null,
        salesRFQId: salesRFQId,
        newSalesRFQId: null,
      });
    } catch (error) {
      console.error('Send SalesRFQ Email error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }

  static async updateSalesRFQ(req, res) {
    try {
      const salesRFQId = parseInt(req.params.id);
      if (isNaN(salesRFQId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const salesRFQData = {
        SalesRFQID: salesRFQId,
        Series: req.body.Series,
        CompanyID: req.body.CompanyID ? parseInt(req.body.CompanyID) : null,
        CustomerID: req.body.CustomerID ? parseInt(req.body.CustomerID) : null,
        SupplierID: req.body.SupplierID ? parseInt(req.body.SupplierID) : null,
        ExternalRefNo: req.body.ExternalRefNo,
        ExternalSupplierID: req.body.ExternalSupplierID ? parseInt(req.body.ExternalSupplierID) : null,
        DeliveryDate: req.body.DeliveryDate,
        PostingDate: req.body.PostingDate,
        RequiredByDate: req.body.RequiredByDate,
        DateReceived: req.body.DateReceived,
        ServiceTypeID: req.body.ServiceTypeID ? parseInt(req.body.ServiceTypeID) : null,
        OriginWarehouseAddressID: req.body.OriginWarehouseAddressID ? parseInt(req.body.OriginWarehouseAddressID) : null,
        CollectionAddressID: req.body.CollectionAddressID ? parseInt(req.body.CollectionAddressID) : null,
        Status: req.body.Status,
        DestinationAddressID: req.body.DestinationAddressID ? parseInt(req.body.DestinationAddressID) : null,
        DestinationWarehouseAddressID: req.body.DestinationWarehouseAddressID ? parseInt(req.body.DestinationWarehouseAddressID) : null,
        BillingAddressID: req.body.BillingAddressID ? parseInt(req.body.BillingAddressID) : null,
        ShippingPriorityID: req.body.ShippingPriorityID ? parseInt(req.body.ShippingPriorityID) : null,
        Terms: req.body.Terms,
        CurrencyID: req.body.CurrencyID ? parseInt(req.body.CurrencyID) : null,
        CollectFromSupplierYN: req.body.CollectFromSupplierYN != null ? Boolean(req.body.CollectFromSupplierYN) : null,
        PackagingRequiredYN: req.body.PackagingRequiredYN != null ? Boolean(req.body.PackagingRequiredYN) : null,
        FormCompletedYN: req.body.FormCompletedYN != null ? Boolean(req.body.FormCompletedYN) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
        CompanyName: req.body.CompanyName, // Add if available in request
        City: req.body.City, // Add if available in request
      };

      const pool = await poolPromise;
      const result = await SalesRFQModel.updateSalesRFQ(salesRFQData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }

  static async deleteSalesRFQ(req, res) {
    try {
      const salesRFQId = parseInt(req.params.id);
      if (isNaN(salesRFQId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const salesRFQData = {
        SalesRFQID: salesRFQId,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const pool = await poolPromise;
      const result = await SalesRFQModel.deleteSalesRFQ(salesRFQData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }

  static async getSalesRFQ(req, res) {
    try {
      const salesRFQId = parseInt(req.params.id);
      if (isNaN(salesRFQId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const salesRFQData = {
        SalesRFQID: salesRFQId,
      };

      const pool = await poolPromise;
      const result = await SalesRFQModel.getSalesRFQ(salesRFQData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }

  static async getAllSalesRFQs(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
        FromDate: req.query.fromDate || null,
        ToDate: req.query.toDate || null,
      };

      if (paginationData.PageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'PageNumber must be greater than 0',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }
      if (paginationData.PageSize < 1 || paginationData.PageSize > 100) {
        return res.status(400).json({
          success: false,
          message: 'PageSize must be between 1 and 100',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const pool = await poolPromise;
      const result = await SalesRFQModel.getAllSalesRFQs(paginationData);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        pagination: {
          pageNumber: paginationData.PageNumber,
          pageSize: paginationData.PageSize,
          totalRecords: result.totalRecords || 0,
          totalPages: Math.ceil(result.totalRecords / paginationData.PageSize),
        },
      });
    } catch (error) {
      console.error('Get All SalesRFQs error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }

  static async approveSalesRFQ(req, res) {
    try {
      const { salesRFQID } = req.body;
      const approverID = req.user.personId;

      if (!salesRFQID) {
        return res.status(400).json({
          success: false,
          message: 'salesRFQID is required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const approvalData = {
        SalesRFQID: parseInt(salesRFQID),
        ApproverID: parseInt(approverID),
      };

      const pool = await poolPromise;
      const result = await SalesRFQModel.approveSalesRFQ(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (error) {
      console.error('Approve SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }

  static async getSalesRFQApprovalStatus(req, res) {
    try {
      const salesRFQId = parseInt(req.params.id);
      if (isNaN(salesRFQId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesRFQID',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null,
        });
      }

      const pool = await poolPromise;
      const result = await SalesRFQModel.getSalesRFQApprovalStatus(salesRFQId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get SalesRFQ Approval Status error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null,
      });
    }
  }
}

module.exports = SalesRFQController;
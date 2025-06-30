const SalesOrderModel = require('../models/SalesOrderModel');

class SalesOrderController {
  static async getSalesOrderById(req, res) {
    try {
      const salesOrderId = parseInt(req.params.id);
      if (isNaN(salesOrderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesOrderID',
          data: null,
          salesOrderId: null
        });
      }

      const result = await SalesOrderModel.getSalesOrderById(salesOrderId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Error in getSalesOrderById:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null
      });
    }
  }

  static async getAllSalesOrders(req, res) {
    try {
      const { pageNumber, pageSize, sortColumn, sortDirection, fromDate, toDate } = req.query;

      const result = await SalesOrderModel.getAllSalesOrders({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        sortColumn: sortColumn || 'CreatedDateTime',
        sortDirection: sortDirection || 'DESC',
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in getAllSalesOrders:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: [],
        totalRecords: 0
      });
    }
  }

  static async createSalesOrder(req, res) {
    try {
      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesOrderId: null,
          newSalesOrderId: null
        });
      }

      const salesOrderData = {
        SalesQuotationID: req.body.salesQuotationID ? parseInt(req.body.salesQuotationID) : null,
        CreatedByID: req.user.personId,
        ShippingPriorityID: req.body.shippingPriorityID ? parseInt(req.body.shippingPriorityID) : null,
        PostingDate: req.body.postingDate || null
      };

      const result = await SalesOrderModel.createSalesOrder(salesOrderData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Error in createSalesOrder:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null,
        newSalesOrderId: null
      });
    }
  }

  static async updateSalesOrder(req, res) {
    try {
      const salesOrderId = parseInt(req.params.id);
      if (isNaN(salesOrderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesOrderID',
          data: null,
          salesOrderId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesOrderId: null
        });
      }

      const salesOrderData = {
        SalesOrderID: salesOrderId,
        SalesQuotationID: req.body.salesQuotationID ? parseInt(req.body.salesQuotationID) : null,
        SalesRFQID: req.body.salesRFQID ? parseInt(req.body.salesRFQID) : null,
        CompanyID: req.body.companyID ? parseInt(req.body.companyID) : null,
        CustomerID: req.body.customerID ? parseInt(req.body.customerID) : null,
        SupplierID: req.body.supplierID ? parseInt(req.body.supplierID) : null,
        OriginAddressID: req.body.originAddressID ? parseInt(req.body.originAddressID) : null,
        DestinationAddressID: req.body.destinationAddressID ? parseInt(req.body.destinationAddressID) : null,
        BillingAddressID: req.body.billingAddressID ? parseInt(req.body.billingAddressID) : null,
        CollectionAddressID: req.body.collectionAddressID ? parseInt(req.body.collectionAddressID) : null,
        ShippingPriorityID: req.body.shippingPriorityID ? parseInt(req.body.shippingPriorityID) : null,
        PackagingRequiredYN: req.body.packagingRequiredYN !== undefined ? req.body.packagingRequiredYN : null,
        CollectFromSupplierYN: req.body.collectFromSupplierYN !== undefined ? req.body.collectFromSupplierYN : null,
        Terms: req.body.terms || null,
        PostingDate: req.body.postingDate || null,
        DeliveryDate: req.body.deliveryDate || null,
        RequiredByDate: req.body.requiredByDate || null,
        DateReceived: req.body.dateReceived || null,
        ServiceTypeID: req.body.serviceTypeID ? parseInt(req.body.serviceTypeID) : null,
        ExternalRefNo: req.body.externalRefNo || null,
        ExternalSupplierID: req.body.externalSupplierID ? parseInt(req.body.externalSupplierID) : null,
        OrderStatusID: req.body.orderStatusID ? parseInt(req.body.orderStatusID) : null,
        ApplyTaxWithholdingAmount: req.body.applyTaxWithholdingAmount !== undefined ? req.body.applyTaxWithholdingAmount : null,
        CurrencyID: req.body.currencyID ? parseInt(req.body.currencyID) : null,
        SalesAmount: req.body.salesAmount ? parseFloat(req.body.salesAmount) : null,
        TaxesAndOtherCharges: req.body.taxesAndOtherCharges ? parseFloat(req.body.taxesAndOtherCharges) : null,
        Total: req.body.total ? parseFloat(req.body.total) : null,
        FormCompletedYN: req.body.formCompletedYN !== undefined ? req.body.formCompletedYN : null,
        FileName: req.body.fileName || null,
        FileContent: req.body.fileContent || null,
        ChangedByID: req.user.personId
      };

      const result = await SalesOrderModel.updateSalesOrder(salesOrderData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updateSalesOrder:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null
      });
    }
  }

  static async deleteSalesOrder(req, res) {
    try {
      const salesOrderId = parseInt(req.params.id);
      if (isNaN(salesOrderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesOrderID',
          data: null,
          salesOrderId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesOrderId: null
        });
      }

      const salesOrderData = {
        SalesOrderID: salesOrderId,
        ChangedByID: req.user.personId
      };

      const result = await SalesOrderModel.deleteSalesOrder(salesOrderData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deleteSalesOrder:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesOrderId: null
      });
    }
  }

   // Approve a Sales Quotation
  static async approveSalesOrder(req, res) {
    try {
      const { SalesOrderID } = req.body;
      const approverID = req.user?.personId;

      if (!SalesOrderID) {
        return res.status(400).json({
          success: false,
          message: 'SalesOrderID is required',
          data: null,
          SalesOrderID: null,
          newSalesOrderID: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          SalesOrderID: null,
          newSalesOrderID: null
        });
      }

      const approvalData = {
        SalesOrderID: parseInt(SalesOrderID),
        ApproverID: parseInt(approverID)
      };

      const result = await SalesOrderModel.approveSalesOrder(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (err) {
      console.error('Approve SalesQuotation error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
       SalesOrderID: null,
        newSalesOrderID: null
      });
    }
  }

     static async getSalesOrderApprovalStatus(req, res) {
    try {
      const SalesOrderID = parseInt(req.params.id);
      if (isNaN(SalesOrderID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing SalesOrderID',
          data: null,
          SalesorderID: null,
          newSalesorderID: null
        });
      }

      const result = await SalesOrderModel.getSalesOrderApprovalStatus(SalesOrderID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get SalesOrder Approval Status error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        SalesOrderID: null,
        newSalesOrderID: null
      });
    }
  }
}

module.exports = SalesOrderController;

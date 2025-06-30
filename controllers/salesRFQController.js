const SalesRFQModel = require('../models/salesRFQModel');

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
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId
      };

      const result = await SalesRFQModel.createSalesRFQ(salesRFQData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
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
          newSalesRFQId: null
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
        OriginAddressID: req.body.OriginAddressID ? parseInt(req.body.OriginAddressID) : null,
        CollectionAddressID: req.body.CollectionAddressID ? parseInt(req.body.CollectionAddressID) : null,
        Status: req.body.Status,
        DestinationAddressID: req.body.DestinationAddressID ? parseInt(req.body.DestinationAddressID) : null,
        BillingAddressID: req.body.BillingAddressID ? parseInt(req.body.BillingAddressID) : null,
        ShippingPriorityID: req.body.ShippingPriorityID ? parseInt(req.body.ShippingPriorityID) : null,
        Terms: req.body.Terms,
        CurrencyID: req.body.CurrencyID ? parseInt(req.body.CurrencyID) : null,
        CollectFromSupplierYN: req.body.CollectFromSupplierYN != null ? Boolean(req.body.CollectFromSupplierYN) : null,
        PackagingRequiredYN: req.body.PackagingRequiredYN != null ? Boolean(req.body.PackagingRequiredYN) : null,
        FormCompletedYN: req.body.FormCompletedYN != null ? Boolean(req.body.FormCompletedYN) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId
      };

      const result = await SalesRFQModel.updateSalesRFQ(salesRFQData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
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
          newSalesRFQId: null
        });
      }

      const salesRFQData = {
        SalesRFQID: salesRFQId,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId
      };

      const result = await SalesRFQModel.deleteSalesRFQ(salesRFQData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
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
          newSalesRFQId: null
        });
      }

      const salesRFQData = {
        SalesRFQID: salesRFQId
      };

      const result = await SalesRFQModel.getSalesRFQ(salesRFQData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      });
    }
  }

  static async getAllSalesRFQs(req, res) {
    try {
      const paginationData = {
        PageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber) : 1,
        PageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
        FromDate: req.query.fromDate || null,
        ToDate: req.query.toDate || null
      };

      const result = await SalesRFQModel.getAllSalesRFQs(paginationData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get All SalesRFQs error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
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
          newSalesRFQId: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          salesRFQId: null,
          newSalesRFQId: null
        });
      }

      const approvalData = {
        SalesRFQID: parseInt(salesRFQID),
        ApproverID: parseInt(approverID)
      };

      const result = await SalesRFQModel.approveSalesRFQ(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (error) {
      console.error('Approve SalesRFQ error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
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
          newSalesRFQId: null
        });
      }

      const result = await SalesRFQModel.getSalesRFQApprovalStatus(salesRFQId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get SalesRFQ Approval Status error:', error);
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

module.exports = SalesRFQController;
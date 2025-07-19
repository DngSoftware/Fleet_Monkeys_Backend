const SalesQuotationModel = require('../models/salesQuotationModel');

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
      const data = {
        salesrfqid: req.body.salesrfqid,
        purchaserfqid: req.body.purchaserfqid,
        supplierid: req.body.supplierid,
        status: req.body.status,
        originwarehouseaddressid: req.body.originwarehouseaddressid,
        collectionaddressid: req.body.collectionaddressid,
        billingaddressid: req.body.billingaddressid,
        destinationaddressid: req.body.destinationaddressid,
        destinationwarehouseaddressid: req.body.destinationwarehouseaddressid,
        collectionwarehouseid: req.body.collectionwarehouseid,
        postingdate: req.body.postingdate,
        deliverydate: req.body.deliverydate,
        requiredbydate: req.body.requiredbydate,
        datereceived: req.body.datereceived,
        servicetypeid: req.body.servicetypeid,
        externalrefno: req.body.externalrefno,
        externalsupplierid: req.body.externalsupplierid,
        customerid: req.body.customerid,
        companyid: req.body.companyid,
        terms: req.body.terms,
        packagingrequiredyn: req.body.packagingrequiredyn,
        collectfromsupplieryn: req.body.collectfromsupplieryn,
        salesquotationcompletedyn: req.body.salesquotationcompletedyn,
        shippingpriorityid: req.body.shippingpriorityid,
        validtilldate: req.body.validtilldate,
        currencyid: req.body.currencyid,
        suppliercontactpersonid: req.body.suppliercontactpersonid,
        isdeliveryonly: req.body.isdeliveryonly,
        taxesandothercharges: req.body.taxesandothercharges,
        createdbyid: req.body.createdbyid
      };

      if (!data.purchaserfqid || !data.createdbyid) {
        return res.status(400).json({
          success: false,
          message: 'purchaserfqid and createdbyid are required.',
          data: null,
          salesquotationid: null,
          newsalesquotationid: null
        });
      }

      const result = await SalesQuotationModel.createSalesQuotation(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        salesquotationid: null,
        newsalesquotationid: result.newsalesquotationid
      });
    } catch (err) {
      console.error('Error in createSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesquotationid: null,
        newsalesquotationid: null
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
          message: 'Sales Quotation not found.',
          data: null,
          salesquotationid: null,
          newsalesquotationid: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Sales Quotation retrieved successfully.',
        data: salesQuotation,
        salesquotationid: id,
        newsalesquotationid: null
      });
    } catch (err) {
      console.error('Error in getSalesQuotationById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesquotationid: null,
        newsalesquotationid: null
      });
    }
  }

  // Update a Sales Quotationrg
  static async updateSalesQuotation(req, res) {
    try {
      const { id } = req.params;
      const data = {
        salesrfqid: req.body.salesrfqid,
        purchaserfqid: req.body.purchaserfqid,
        supplierid: req.body.supplierid,
        status: req.body.status,
        originwarehouseaddressid: req.body.originwarehouseaddressid,
        collectionaddressid: req.body.collectionaddressid,
        billingaddressid: req.body.billingaddressid,
        destinationaddressid: req.body.destinationaddressid,
        destinationwarehouseaddressid: req.body.destinationwarehouseaddressid,
        collectionwarehouseid: req.body.collectionwarehouseid,
        postingdate: req.body.postingdate,
        deliverydate: req.body.deliverydate,
        requiredbydate: req.body.requiredbydate,
        datereceived: req.body.datereceived,
        servicetypeid: req.body.servicetypeid,
        externalrefno: req.body.externalrefno,
        externalsupplierid: req.body.externalsupplierid,
        customerid: req.body.customerid,
        companyid: req.body.companyid,
        terms: req.body.terms,
        packagingrequiredyn: req.body.packagingrequiredyn,
        collectfromsupplieryn: req.body.collectfromsupplieryn,
        salesquotationcompletedyn: req.body.salesquotationcompletedyn,
        shippingpriorityid: req.body.shippingpriorityid,
        validtilldate: req.body.validtilldate,
        currencyid: req.body.currencyid,
        suppliercontactpersonid: req.body.suppliercontactpersonid,
        isdeliveryonly: req.body.isdeliveryonly,
        taxesandothercharges: req.body.taxesandothercharges,
        createdbyid: req.body.createdbyid,
        supplierquotationparcelids: req.body.supplierquotationparcelids
      };

      if (!data.createdbyid) {
        return res.status(400).json({
          success: false,
          message: 'createdbyid is required.',
          data: null,
          salesquotationid: null,
          newsalesquotationid: null
        });
      }

      if (data.supplierquotationparcelids && (!Array.isArray(data.supplierquotationparcelids) || data.supplierquotationparcelids.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'supplierquotationparcelids must be a non-empty array.',
          data: null,
          salesquotationid: null,
          newsalesquotationid: null
        });
      }

      const result = await SalesQuotationModel.updateSalesQuotation(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesquotationid: id,
        newsalesquotationid: null
      });
    } catch (err) {
      console.error('Error in updateSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesquotationid: null,
        newsalesquotationid: null
      });
    }
  }

  // Delete a Sales Quotation
  static async deleteSalesQuotation(req, res) {
    try {
      const { id } = req.params;
      const deletedbyid = req.body.deletedbyid;
      if (!deletedbyid) {
        return res.status(400).json({
          success: false,
          message: 'deletedbyid is required.',
          data: null,
          salesquotationid: null,
          newsalesquotationid: null
        });
      }

      const result = await SalesQuotationModel.deleteSalesQuotation(parseInt(id), deletedbyid);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        salesquotationid: id,
        newsalesquotationid: null
      });
    } catch (err) {
      console.error('Error in deleteSalesQuotation:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        salesquotationid: null,
        newsalesquotationid: null
      });
    }
  }

  // Get Supplier Quotation Parcels by SalesRFQID
  static async getSupplierQuotationParcels(req, res) {
    try {
      const { salesrfqid } = req.params;
      if (!salesrfqid || isNaN(parseInt(salesrfqid))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing salesrfqid',
          data: null
        });
      }

      const parcels = await SalesQuotationModel.getSupplierQuotationParcels(parseInt(salesrfqid));
      res.status(200).json({
        success: true,
        message: 'Supplier quotation parcels retrieved successfully.',
        data: parcels
      });
    } catch (err) {
      console.error('Error in getSupplierQuotationParcels:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null
      });
    }
  }
}

module.exports = SalesQuotationController;
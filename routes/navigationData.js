const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Generic function to fetch records for any table
async function fetchRecords(tableName, fields) {
  try {
    const query = `SELECT TOP 10 ${fields.join(', ')} FROM ${tableName} WHERE IsDeleted = 0 OR IsDeleted IS NULL ORDER BY CreatedDateTime DESC`;
    const result = await db.query(query);
    return result.recordset;
  } catch (error) {
    console.error(`Error fetching ${tableName} records:`, error);
    throw error;
  }
}

// Sales RFQ
router.get('/sales-rfqs', async (req, res) => {
  try {
    const records = await fetchRecords('tblSalesRFQ', ['SalesRFQID as id', 'Series', 'PostingDate', 'ServiceTypeID', 'Status']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Sales RFQ Series for dropdown
router.get('/sales-rfqs/series', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT Series FROM tblSalesRFQ WHERE (IsDeleted = 0 OR IsDeleted IS NULL) ORDER BY Series';
    const result = await db.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase RFQ
router.get('/purchase-rfqs', async (req, res) => {
  try {
    const records = await fetchRecords('tblPurchaseRFQ', ['PurchaseRFQID as id', 'Series', 'PostingDate']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supplier Quotation
router.get('/supplier-quotations', async (req, res) => {
  try {
    const records = await fetchRecords('tblSupplierQuotation', ['SupplierQuotationID as id', 'Series', 'PostingDate']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Quotation
router.get('/sales-quotations', async (req, res) => {
  try {
    const records = await fetchRecords('tblSalesQuotation', ['SalesQuotationID as id', 'Series', 'PostingDate']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Order
router.get('/sales-orders', async (req, res) => {
  try {
    const records = await fetchRecords('tblSalesOrder', ['SalesOrderID as id', 'Series', 'PostingDate']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase Order
router.get('/purchase-orders', async (req, res) => {
  try {
    const records = await fetchRecords('tblPurchaseOrder', ['PurchaseOrderID as id', 'Series', 'PostingDate']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase Invoice
router.get('/purchase-invoices', async (req, res) => {
  try {
    const records = await fetchRecords('tblPurchaseInvoice', ['PurchaseInvoiceID as id', 'Series', 'PostingDate']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Invoice
router.get('/sales-invoices', async (req, res) => {
  try {
    const records = await fetchRecords('tblSalesInvoice', ['SalesInvoiceID as id', 'Series', 'PostingDate']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const mysql = require('mysql2/promise');
const poolPromise = require('../config/db.config');

async function getSalesQuotationDetails(salesQuotationID) {
  const pool = await poolPromise;
  try {
    // Validate SalesQuotationID
    if (!salesQuotationID || isNaN(salesQuotationID)) {
      throw new Error('Invalid SalesQuotationID provided');
    }

    // Check if SalesQuotationID exists
    const [exists] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM dbo_tblsalesquotation
       WHERE SalesQuotationID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)`,
      [salesQuotationID]
    );

    if (exists[0].count === 0) {
      throw new Error(`No active Sales Quotation found for SalesQuotationID=${salesQuotationID}`);
    }

    // Fetch sales quotation details
    const [quotationResult] = await pool.query(
      `SELECT 
        sq.SalesQuotationID, sq.Series, sq.CustomerID, sq.CompanyID,
        sq.CreatedByID, sq.CreatedDateTime, sq.Terms,
        c.CustomerName, c.CustomerEmail,
        a.City AS City,
        comp.CompanyName
      FROM dbo_tblsalesquotation sq
      LEFT JOIN dbo_tblcustomer c ON sq.CustomerID = c.CustomerID
      LEFT JOIN dbo_tbladdresses a ON c.CustomerAddressID = a.AddressID
      LEFT JOIN dbo_tblcompany comp ON sq.CompanyID = comp.CompanyID
      WHERE sq.SalesQuotationID = ? AND (sq.IsDeleted = 0 OR sq.IsDeleted IS NULL)`,
      [salesQuotationID]
    );

    if (!quotationResult || quotationResult.length === 0) {
      throw new Error(`No Sales Quotation data returned for SalesQuotationID=${salesQuotationID}`);
    }

    const quotationDetails = quotationResult[0];

    // Fetch quotation parcels
    const [parcelsResult] = await pool.query(
      `SELECT 
        sqp.SalesQuotationParcelID, sqp.SalesQuotationID, sqp.ItemID, 
        sqp.ItemQuantity, sqp.UOMID, 
        sqp.SalesRate AS Rate, sqp.SalesAmount AS Amount,
        i.ItemName, u.UOM AS UOMName
      FROM dbo_tblsalesquotationparcel sqp
      LEFT JOIN dbo_tblitem i ON sqp.ItemID = i.ItemID
      LEFT JOIN dbo_tbluom u ON sqp.UOMID = u.UOMID
      WHERE sqp.SalesQuotationID = ? AND (sqp.IsDeleted = 0 OR sqp.IsDeleted IS NULL)`,
      [salesQuotationID]
    );

    const parcels = parcelsResult || [];

    console.log(`Fetched Sales Quotation for SalesQuotationID=${salesQuotationID}:`, quotationDetails);
    console.log(`Fetched parcels for SalesQuotationID=${salesQuotationID}:`, parcels);

    return { quotationDetails, parcels };
  } catch (error) {
    console.error(`Error in getSalesQuotationDetails for SalesQuotationID=${salesQuotationID}:`, error.message, error.stack);
    throw new Error(`Error fetching Sales Quotation: ${error.message}`);
  }
}

module.exports = { getSalesQuotationDetails };
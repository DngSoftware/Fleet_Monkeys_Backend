const poolPromise = require('../config/db.config');

async function getSalesInvoiceDetails(salesInvoiceId) {
  const pool = await poolPromise;
  try {
    // Validate SalesInvoiceID
    if (!salesInvoiceId || isNaN(salesInvoiceId)) {
      throw new Error('Invalid SalesInvoiceID provided');
    }

    // Check if SalesInvoiceID exists and is not soft-deleted
    const [exists] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM dbo_tblsalesinvoice
       WHERE SalesInvoiceID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)`,
      [salesInvoiceId]
    );

    if (exists[0].count === 0) {
      throw new Error(`No active Sales Invoice found for SalesInvoiceID=${salesInvoiceId}`);
    }

    // Fetch Sales Invoice details
    const [siResult] = await pool.query(
      `SELECT 
        si.SalesInvoiceID, si.Series, si.CustomerID, si.CompanyID,
        si.CreatedByID, si.CreatedDateTime, si.Terms, si.RequiredByDate,
        si.PostingDate, si.DeliveryDate,
        c.CustomerName, c.CustomerEmail,
        a.City AS City,
        comp.CompanyName,
        COALESCE((
          SELECT SUM(COALESCE(sit.Total, 0))
          FROM dbo_tblsalesinvoicetaxes sit
          WHERE sit.SalesInvoiceID = si.SalesInvoiceID AND (sit.IsDeleted = 0 OR sit.IsDeleted IS NULL)
        ), 0) AS TotalTaxAmount
      FROM dbo_tblsalesinvoice si
      LEFT JOIN dbo_tblcustomer c ON si.CustomerID = c.CustomerID
      LEFT JOIN dbo_tbladdresses a ON c.CustomerAddressID = a.AddressID
      LEFT JOIN dbo_tblcompany comp ON si.CompanyID = comp.CompanyID
      WHERE si.SalesInvoiceID = ? AND (si.IsDeleted = 0 OR si.IsDeleted IS NULL)`,
      [salesInvoiceId]
    );

    if (!siResult || siResult.length === 0) {
      throw new Error(`No Sales Invoice data returned for SalesInvoiceID=${salesInvoiceId}`);
    }

    const siDetails = siResult[0];

    // Fetch Sales Invoice parcels
    const [parcelsResult] = await pool.query(
      `SELECT 
        sip.SalesInvoiceParcelID, sip.SalesInvoiceID, sip.ItemID, 
        sip.ItemQuantity, sip.UOMID, sip.Rate, sip.Amount,
        i.ItemName, u.UOM AS UOMName
      FROM dbo_tblsalesinvoiceparcel sip
      LEFT JOIN dbo_tblitem i ON sip.ItemID = i.ItemID
      LEFT JOIN dbo_tbluom u ON sip.UOMID = u.UOMID
      WHERE sip.SalesInvoiceID = ? AND (sip.IsDeleted = 0 OR sip.IsDeleted IS NULL)`,
      [salesInvoiceId]
    );

    const parcels = parcelsResult || [];

    // Validate and log parcel amounts
    parcels.forEach((parcel, index) => {
      if (parcel.Amount == null || isNaN(parseFloat(parcel.Amount))) {
        console.warn(`Invalid Amount for parcel index ${index} (SalesInvoiceID=${salesInvoiceId}):`, parcel.Amount);
        parcel.Amount = 0; // Set to 0 for invalid amounts
      } else {
        parcel.Amount = parseFloat(parcel.Amount); // Ensure numeric
      }
    });

    if (parcels.length === 0) {
      console.warn(`No parcels found for SalesInvoiceID=${salesInvoiceId}`);
    }

    console.log(`Fetched Sales Invoice for SalesInvoiceID=${salesInvoiceId}:`, siDetails);
    console.log(`Fetched parcels for SalesInvoiceID=${salesInvoiceId}:`, parcels);

    return { siDetails, parcels };
  } catch (error) {
    console.error(`Error in getSalesInvoiceDetails for SalesInvoiceID=${salesInvoiceId}:`, error.message, error.stack);
    throw new Error(`Error fetching Sales Invoice: ${error.message}`);
  }
}

module.exports = { getSalesInvoiceDetails };
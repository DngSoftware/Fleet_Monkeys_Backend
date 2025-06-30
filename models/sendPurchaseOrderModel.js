const mysql = require('mysql2/promise');
const poolPromise = require('../config/db.config');

async function getPurchaseOrderDetails(poId) {
  const pool = await poolPromise;
  try {
    // Validate POID
    if (!poId || isNaN(poId)) {
      throw new Error('Invalid POID provided');
    }

    // Check if POID exists and is not soft-deleted
    const [exists] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM dbo_tblpo
       WHERE POID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)`,
      [poId]
    );

    if (exists[0].count === 0) {
      throw new Error(`No active Purchase Order found for POID=${poId}`);
    }

    // Fetch Purchase Order details
    const [poResult] = await pool.query(
      `SELECT 
        po.POID, po.Series, po.SupplierID, po.CompanyID,
        po.CreatedByID, po.CreatedDateTime, po.Terms, po.RequiredByDate,
        s.SupplierName, s.SupplierEmail,
        a.City AS City,
        comp.CompanyName
      FROM dbo_tblpo po
      LEFT JOIN dbo_tblsupplier s ON po.SupplierID = s.SupplierID
      LEFT JOIN dbo_tbladdresses a ON s.SupplierAddressID = a.AddressID
      LEFT JOIN dbo_tblcompany comp ON po.CompanyID = comp.CompanyID
      WHERE po.POID = ? AND (po.IsDeleted = 0 OR po.IsDeleted IS NULL)`,
      [poId]
    );

    if (!poResult || poResult.length === 0) {
      throw new Error(`No Purchase Order data returned for POID=${poId}`);
    }

    const poDetails = poResult[0];

    // Fetch PO parcels directly from dbo_tblpoparcel
    const [parcelsResult] = await pool.query(
      `SELECT 
        pop.POParcelID, pop.POID, pop.ItemID, 
        pop.ItemQuantity, pop.UOMID, 
        pop.Rate, pop.Amount,
        i.ItemName, u.UOM AS UOMName
      FROM dbo_tblpoparcel pop
      LEFT JOIN dbo_tblitem i ON pop.ItemID = i.ItemID
      LEFT JOIN dbo_tbluom u ON pop.UOMID = u.UOMID
      WHERE pop.POID = ? AND (pop.IsDeleted = 0 OR pop.IsDeleted IS NULL)`,
      [poId]
    );

    const parcels = parcelsResult || [];

    if (parcels.length === 0) {
      console.warn(`No parcels found for POID=${poId}`);
    }

    console.log(`Fetched Purchase Order for POID=${poId}:`, poDetails);
    console.log(`Fetched parcels for POID=${poId}:`, parcels);

    return { poDetails, parcels };
  } catch (error) {
    console.error(`Error in getPurchaseOrderDetails for POID=${poId}:`, error.message, error.stack);
    throw new Error(`Error fetching Purchase Order: ${error.message}`);
  }
}

module.exports = { getPurchaseOrderDetails };
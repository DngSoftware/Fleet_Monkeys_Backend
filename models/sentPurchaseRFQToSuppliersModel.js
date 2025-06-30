const mysql = require('mysql2/promise');
const poolPromise = require('../config/db.config');

// Utility function for retrying with exponential backoff
async function retryOperation(operation, maxRetries = 3, baseDelayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error.message.includes('Lock wait timeout exceeded') && attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Lock wait timeout on attempt ${attempt}/${maxRetries}. Retrying after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

async function getPurchaseRFQDetails(purchaseRFQID) {
  const pool = await poolPromise;
  const connection = await pool.getConnection();
  try {
    // Validate PurchaseRFQID
    if (!purchaseRFQID || isNaN(purchaseRFQID)) {
      throw new Error('Invalid PurchaseRFQID provided');
    }

    // Fetch RFQ details and parcels in a single query
    const [results] = await connection.query(
      `SELECT 
         rfq.*, c.CompanyName, cust.CustomerName,
         p.PurchaseRFQParcelID, p.ParcelID, p.ItemID, i.ItemName, p.LineItemNumber, 
         p.ItemQuantity, p.UOMID, u.UOM AS UOMName, p.Rate, p.Amount
       FROM dbo_tblpurchaserfq rfq
       LEFT JOIN dbo_tblcompany c ON rfq.CompanyID = c.CompanyID
       LEFT JOIN dbo_tblcustomer cust ON rfq.CustomerID = cust.CustomerID
       LEFT JOIN dbo_tblpurchaserfqparcel p ON rfq.PurchaseRFQID = p.PurchaseRFQID
       LEFT JOIN dbo_tblitem i ON p.ItemID = i.ItemID
       LEFT JOIN dbo_tbluom u ON p.UOMID = u.UOMID
       WHERE rfq.PurchaseRFQID = ? AND (rfq.IsDeleted = 0 OR rfq.IsDeleted IS NULL)
       AND (p.IsDeleted = 0 OR p.IsDeleted IS NULL OR p.PurchaseRFQParcelID IS NULL)`,
      [purchaseRFQID]
    );

    if (!results || results.length === 0) {
      throw new Error(`No active Purchase RFQ found for PurchaseRFQID=${purchaseRFQID}`);
    }

    // Group results into rfqDetails and parcels
    const rfqDetails = {
      ...results[0],
      CompanyName: results[0].CompanyName,
      CustomerName: results[0].CustomerName,
    };
    const parcels = results
      .filter(row => row.PurchaseRFQParcelID)
      .map(row => ({
        PurchaseRFQParcelID: row.PurchaseRFQParcelID,
        PurchaseRFQID: row.PurchaseRFQID,
        ParcelID: row.ParcelID,
        ItemID: row.ItemID,
        ItemName: row.ItemName,
        LineItemNumber: row.LineItemNumber,
        ItemQuantity: row.ItemQuantity,
        UOMID: row.UOMID,
        UOMName: row.UOMName,
        Rate: row.Rate,
        Amount: row.Amount,
      }));

    console.log(`Fetched RFQ details for PurchaseRFQID=${purchaseRFQID}:`, rfqDetails);
    console.log(`Fetched parcels for PurchaseRFQID=${purchaseRFQID}:`, parcels);

    return { rfqDetails, parcels };
  } catch (error) {
    console.error(`Error in getPurchaseRFQDetails for PurchaseRFQID=${purchaseRFQID}:`, error.message, error.stack);
    throw new Error(`Error fetching Purchase RFQ: ${error.message}`);
  } finally {
    connection.release();
  }
}

async function getSupplierDetails(supplierIDs) {
  const pool = await poolPromise;
  const connection = await pool.getConnection();
  try {
    // Fetch all supplier details in a single query
    const [results] = await connection.query(
      `SELECT 
         s.*, st.SupplierType, a.AddressTitle, a.City, c.CurrencyName, comp.CompanyName
       FROM dbo_tblsupplier s
       LEFT JOIN dbo_tblsuppliertype st ON s.SupplierTypeID = st.SupplierTypeID
       LEFT JOIN dbo_tbladdresses a ON s.SupplierAddressID = a.AddressID
       LEFT JOIN dbo_tblcurrency c ON s.BillingCurrencyID = c.CurrencyID
       LEFT JOIN dbo_tblcompany comp ON s.CompanyID = comp.CompanyID
       WHERE s.SupplierID IN (?) AND (s.IsDeleted = 0 OR s.IsDeleted IS NULL)`,
      [supplierIDs]
    );

    if (!results || results.length === 0) {
      throw new Error(`No suppliers found for SupplierIDs=${supplierIDs.join(',')}`);
    }

    console.log(`Fetched supplier details for SupplierIDs=${supplierIDs.join(',')}:`, results);
    return results;
  } catch (error) {
    console.error(`Error in getSupplierDetails for SupplierIDs=${supplierIDs.join(',')}:`, error.message, error.stack);
    throw new Error(`Error fetching supplier details: ${error.message}`);
  } finally {
    connection.release();
  }
}

async function createSupplierQuotation(purchaseRFQID, supplierID, createdByID) {
  const pool = await poolPromise;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await retryOperation(async () => {
      await connection.query(
        `CALL SP_ManageSupplierQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSupplierQuotationID)`,
        ['INSERT', null, supplierID, purchaseRFQID, null, null, createdByID, null, null, null, null, null, null, null, null]
      );

      const [[{ p_Result, p_Message, p_NewSupplierQuotationID }]] = await connection.query(
        `SELECT @p_Result AS p_Result, @p_Message AS p_Message, @p_NewSupplierQuotationID AS p_NewSupplierQuotationID`
      );

      console.log(`SP_ManageSupplierQuotation output for PurchaseRFQID=${purchaseRFQID}, SupplierID=${supplierID}:`, {
        p_Result,
        p_Message,
        p_NewSupplierQuotationID,
      });

      if (p_Result !== 1 || !p_NewSupplierQuotationID) {
        throw new Error(p_Message || 'Failed to create supplier quotation');
      }

      return p_NewSupplierQuotationID;
    });

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error(`Error in createSupplierQuotation for PurchaseRFQID=${purchaseRFQID}, SupplierID=${supplierID}:`, error.message, error.stack);
    throw new Error(`Error creating supplier quotation: ${error.message}`);
  } finally {
    connection.release();
  }
}

async function getSupplierQuotationDetails(supplierQuotationID, supplierID) {
  const pool = await poolPromise;
  const connection = await pool.getConnection();
  try {
    // Fetch quotation details and parcels in a single query
    const [results] = await connection.query(
      `SELECT 
         sq.*, c.CompanyName, s.SupplierName, cu.CustomerName, curr.CurrencyName,
         CONCAT(orig.AddressLine1, ', ', orig.City, ', ', orig.Country) AS OriginWarehouseAddress,
         CONCAT(dest.AddressLine1, ', ', dest.City, ', ', dest.Country) AS DestinationAddress,
         CONCAT(bill.AddressLine1, ', ', bill.City, ', ', bill.Country) AS BillingAddress,
         CONCAT(coll.AddressLine1, ', ', coll.City, ', ', coll.Country) AS CollectionAddress,
         st.ServiceType, sp.PriorityName AS ShippingPriority,
         CONCAT(u.FirstName, ' ', u.LastName) AS CreatedByName,
         sqp.SupplierQuotationID, sqp.ItemID, i.ItemName, sqp.UOMID, u2.UOM AS UOMName,
         sqp.Rate, sqp.Amount, sqp.CountryOfOriginID
       FROM dbo_tblsupplierquotation sq
       LEFT JOIN dbo_tblcompany c ON sq.CompanyID = c.CompanyID
       LEFT JOIN dbo_tblsupplier s ON sq.SupplierID = s.SupplierID
       LEFT JOIN dbo_tblcustomer cu ON sq.CustomerID = cu.CustomerID
       LEFT JOIN dbo_tblcurrency curr ON sq.CurrencyID = curr.CurrencyID
       LEFT JOIN dbo_tbladdresses orig ON sq.OriginWarehouseAddressID = orig.AddressID
       LEFT JOIN dbo_tbladdresses dest ON sq.DestinationAddressID = dest.AddressID
       LEFT JOIN dbo_tbladdresses bill ON sq.BillingAddressID = bill.AddressID
       LEFT JOIN dbo_tbladdresses coll ON sq.CollectionAddressID = coll.AddressID
       LEFT JOIN dbo_tblservicetype st ON sq.ServiceTypeID = st.ServiceTypeID
       LEFT JOIN dbo_tblmailingpriority sp ON sq.ShippingPriorityID = sp.MailingPriorityID
       LEFT JOIN dbo_tblperson u ON sq.CreatedByID = u.PersonID
       LEFT JOIN dbo_tblsupplierquotationparcel sqp ON sq.SupplierQuotationID = sqp.SupplierQuotationID
       LEFT JOIN dbo_tblitem i ON sqp.ItemID = i.ItemID
       LEFT JOIN dbo_tbluom u2 ON sqp.UOMID = u2.UOMID
       WHERE sq.SupplierQuotationID = ? AND sq.SupplierID = ? 
       AND (sq.IsDeleted = 0 OR sq.IsDeleted IS NULL)
       AND (sqp.IsDeleted = 0 OR sqp.IsDeleted IS NULL OR sqp.SupplierQuotationID IS NULL)`,
      [supplierQuotationID, supplierID]
    );

    if (!results || results.length === 0) {
      throw new Error(`No supplier quotation found for SupplierQuotationID=${supplierQuotationID}`);
    }

    // Group results into quotationDetails and quotationParcels
    const quotationDetails = {
      ...results[0],
      CompanyName: results[0].CompanyName,
      SupplierName: results[0].SupplierName,
      CustomerName: results[0].CustomerName,
      CurrencyName: results[0].CurrencyName,
      OriginWarehouseAddress: results[0].OriginWarehouseAddress,
      DestinationAddress: results[0].DestinationAddress,
      BillingAddress: results[0].BillingAddress,
      CollectionAddress: results[0].CollectionAddress,
      ServiceType: results[0].ServiceType,
      ShippingPriority: results[0].ShippingPriority,
      CreatedByName: results[0].CreatedByName,
    };
    const quotationParcels = results
      .filter(row => row.SupplierQuotationID)
      .map(row => ({
        SupplierQuotationID: row.SupplierQuotationID,
        ItemID: row.ItemID,
        ItemName: row.ItemName,
        UOMID: row.UOMID,
        UOMName: row.UOMName,
        Rate: row.Rate,
        Amount: row.Amount,
        CountryOfOriginID: row.CountryOfOriginID,
      }));

    console.log(`Fetched quotation details for SupplierQuotationID=${supplierQuotationID}:`, quotationDetails);
    console.log(`Fetched quotation parcels for SupplierQuotationID=${supplierQuotationID}:`, quotationParcels);

    return { quotationDetails, quotationParcels };
  } catch (error) {
    console.error(`Error in getSupplierQuotationDetails for SupplierQuotationID=${supplierQuotationID}:`, error.message, error.stack);
    throw new Error(`Error fetching supplier quotation details: ${error.message}`);
  } finally {
    connection.release();
  }
}

module.exports = {
  getPurchaseRFQDetails,
  getSupplierDetails,
  createSupplierQuotation,
  getSupplierQuotationDetails,
};
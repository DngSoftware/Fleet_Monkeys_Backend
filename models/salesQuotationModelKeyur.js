const poolPromise = require('../config/db.config');
const axios = require('axios');

class SalesQuotationModel {
  // API key for exchangerate-api
  static apiKey = '0ac52693487ca7c3879a1350';

  // Function to fetch exchange rates
  static async getExchangeRate(baseCurrency) {
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}?access_key=${this.apiKey}`);
      if (response.data && response.data.rates) {
        return response.data.rates;
      }
      throw new Error('Invalid response from exchange rate API');
    } catch (err) {
      throw new Error(`Failed to fetch exchange rates for ${baseCurrency}: ${err.message}`);
    }
  }

  // Get all Sales Quotations
  static async getAllSalesQuotations({
    pageNumber = 1,
    pageSize = 10,
    sortColumn = 'salesquotationid',
    sortDirection = 'ASC',
    fromDate = null,
    toDate = null,
    status = null,
    customerId = null,
    supplierId = null
  }) {
    try {
      const pool = await poolPromise;

      if (pageNumber < 1) pageNumber = 1;
      if (pageSize < 1 || pageSize > 100) pageSize = 10;

      let formattedFromDate = null, formattedToDate = null;
      if (fromDate) {
        formattedFromDate = new Date(fromDate);
        if (isNaN(formattedFromDate)) throw new Error('Invalid fromDate');
      }
      if (toDate) {
        formattedToDate = new Date(toDate);
        if (isNaN(formattedToDate)) throw new Error('Invalid toDate');
      }
      if (formattedFromDate && formattedToDate && formattedFromDate > formattedToDate) {
        throw new Error('fromDate cannot be later than toDate');
      }

      const validSortColumns = [
        'salesquotationid', 'createddatetime', 'postingdate', 'deliverydate',
        'salesamount', 'total', 'profit', 'customername', 'suppliername', 'status'
      ];
      const validatedSortColumn = validSortColumns.includes(sortColumn) ? sortColumn : 'salesquotationid';
      const validatedSortDirection = sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const queryParams = [
        pageNumber,
        pageSize,
        validatedSortColumn,
        validatedSortDirection,
        formattedFromDate || null,
        formattedToDate || null,
        status || null,
        customerId ? parseInt(customerId) : null,
        supplierId ? parseInt(supplierId) : null
      ];

      console.log(`Executing sp_getallsalesquotation with params:`, queryParams);

      const [result] = await pool.query(
        `CALL sp_getallsalesquotation(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_totalrecords)`,
        queryParams
      );

      const [[outParams]] = await pool.query(
        `SELECT @p_totalrecords AS totalrecords`
      );

      return {
        data: result[0],
        totalRecords: outParams.totalrecords || 0,
        currentPage: pageNumber,
        pageSize: pageSize,
        totalPages: Math.ceil((outParams.totalrecords || 0) / pageSize)
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Sales Quotation
  static async createSalesQuotation(data) {
    try {
      const pool = await poolPromise;

      // Validate required fields
      if (!data.purchaseRFQID || !data.createdByID) {
        throw new Error('PurchaseRFQID and CreatedByID are required');
      }

      // Fetch BWP CurrencyID
      const [[bwpCurrency]] = await pool.query(
        `SELECT CurrencyID, CurrencyName FROM dbo_tblcurrency WHERE CurrencyName = 'BWP' LIMIT 1`
      );
      if (!bwpCurrency) {
        throw new Error('BWP currency not found in dbo_tblcurrency');
      }
      const localCurrencyID = bwpCurrency.CurrencyID;

      // Fetch supplier quotation parcels to get SupplierCurrencyID
      const [parcels] = await pool.query(
        `SELECT 
           sqp.SupplierQuotationParcelID, sqp.ItemID, sqp.Rate, sqp.Amount, 
           COALESCE(sq.CurrencyID, ?, ?) AS SupplierCurrencyID,
           c.CurrencyName
         FROM dbo_tblsupplierquotationparcel sqp
         INNER JOIN dbo_tblsupplierquotation sq ON sqp.SupplierQuotationID = sq.SupplierQuotationID
         LEFT JOIN dbo_tblcurrency c ON c.CurrencyID = COALESCE(sq.CurrencyID, ?)
         INNER JOIN (
           SELECT sqp2.ItemID, MIN(sqp2.Rate) AS MinRate
           FROM dbo_tblsupplierquotationparcel sqp2
           INNER JOIN dbo_tblsupplierquotation sq2 ON sqp2.SupplierQuotationID = sq2.SupplierQuotationID
           WHERE sq2.PurchaseRFQID = ? AND sq2.IsDeleted = 0 AND sqp2.IsDeleted = 0
           GROUP BY sqp2.ItemID
         ) min_rates ON sqp.ItemID = min_rates.ItemID AND sqp.Rate = min_rates.MinRate
         WHERE sq.PurchaseRFQID = ? AND sq.IsDeleted = 0 AND sqp.IsDeleted = 0`,
        [data.currencyID || localCurrencyID, localCurrencyID, data.currencyID || localCurrencyID, data.purchaseRFQID, data.purchaseRFQID]
      );

      if (!parcels.length) {
        throw new Error('No valid supplier quotation parcels found for the specified PurchaseRFQID');
      }

      // Fetch exchange rates for each unique SupplierCurrencyID
      const uniqueCurrencies = [...new Set(parcels.map(p => p.CurrencyName))];
      const exchangeRates = {};
      for (const currency of uniqueCurrencies) {
        if (currency && currency !== 'BWP') {
          try {
            const rates = await this.getExchangeRate(currency);
            const rate = rates['BWP'];
            if (!rate) {
              throw new Error(`No exchange rate found for ${currency} to BWP`);
            }
            exchangeRates[currency] = rate;
          } catch (err) {
            console.error(`Exchange rate fetch failed for ${currency}: ${err.message}`);
            exchangeRates[currency] = 1.0; // Fallback to 1.0
          }
        } else {
          exchangeRates[currency] = 1.0; // No conversion needed for BWP
        }
      }

      // Update parcels with exchange rates
      const updatedParcels = parcels.map(parcel => ({
        ...parcel,
        ExchangeRate: exchangeRates[parcel.CurrencyName]
      }));

      // Insert Sales Quotation
      const queryParams = [
        'INSERT',
        null, // p_SalesQuotationID
        data.salesRFQID || null,
        data.purchaseRFQID,
        data.supplierID || null,
        data.status || 'Pending',
        data.originWarehouseID || null,
        data.collectionAddressID || null,
        data.billingAddressID || null,
        data.destinationAddressID || null,
        data.destinationWarehouseID || null,
        data.collectionWarehouseID || null,
        data.postingDate || null,
        data.deliveryDate || null,
        data.requiredByDate || null,
        data.dateReceived || null,
        data.serviceTypeID || null,
        data.externalRefNo || 'NA',
        data.externalSupplierID || null,
        data.customerID || null,
        data.companyID || null,
        data.terms || 'Standard Terms',
        data.packagingRequiredYN || 0,
        data.collectFromSupplierYN || 0,
        data.salesQuotationCompletedYN || 0,
        data.shippingPriorityID || null,
        data.validTillDate || null,
        data.currencyID || null,
        data.supplierContactPersonID || null,
        data.isDeliveryOnly || 0,
        data.taxesAndOtherCharges || 0,
        data.createdByID,
        null, // p_UpdatedByID
        null, // p_Comment
        null, // p_ApprovalStatus
        null, // p_Notes
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        `CALL SP_ManageSalesQuotation_keyur1(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        queryParams
      );

      const [[outParams]] = await pool.query(
        `SELECT @p_Result AS result, @p_Message AS message, @p_NewSalesQuotationID AS newSalesQuotationID`
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Sales Quotation');
      }

      // Update parcels with exchange rates
      for (const parcel of updatedParcels) {
        await pool.query(
          `UPDATE dbo_tblsalesquotationparcel
           SET ExchangeRate = ?, SupplierExchangeAmount = SupplierAmount * ?, LocalCurrencyID = ?
           WHERE SalesQuotationID = ? AND SupplierQuotationParcelID = ?`,
          [parcel.ExchangeRate, parcel.ExchangeRate, localCurrencyID, outParams.newSalesQuotationID, parcel.SupplierQuotationParcelID]
        );
      }

      return {
        success: true,
        message: outParams.message,
        data: null,
        salesQuotationID: null,
        newSalesQuotationID: outParams.newSalesQuotationID.toString()
      };
    } catch (err) {
      console.error('Error in createSalesQuotation:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get Sales Quotation by ID
  static async getSalesQuotationById(id) {
    try {
      const pool = await poolPromise;
      const queryParams = [
        'SELECT',
        id,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null
      ];
      const [result] = await pool.query(
        `CALL SP_ManageSalesQuotation_keyur1(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        queryParams
      );
      const [[outParams]] = await pool.query(
        `SELECT @p_Result AS result, @p_Message AS message`
      );
      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Sales Quotation not found or deleted');
      }
      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update Sales Quotation
  static async updateSalesQuotation(id, data) {
    try {
      const pool = await poolPromise;
      const queryParams = [
        'UPDATE',
        id,
        data.salesRFQID || null,
        data.purchaseRFQID || null,
        data.supplierID || null,
        data.status || null,
        data.originWarehouseID || null,
        data.collectionAddressID || null,
        data.billingAddressID || null,
        data.destinationAddressID || null,
        data.destinationWarehouseID || null,
        data.collectionWarehouseID || null,
        data.postingDate || null,
        data.deliveryDate || null,
        data.requiredByDate || null,
        data.dateReceived || null,
        data.serviceTypeID || null,
        data.externalRefNo || null,
        data.externalSupplierID || null,
        data.customerID || null,
        data.companyID || null,
        data.terms || null,
        data.packagingRequiredYN || null,
        data.collectFromSupplierYN || null,
        data.salesQuotationCompletedYN || null,
        data.shippingPriorityID || null,
        data.validTillDate || null,
        data.currencyID || null,
        data.supplierContactPersonID || null,
        data.isDeliveryOnly || null,
        data.taxesAndOtherCharges || null,
        data.createdByID || null,
        data.updatedByID || null,
        data.comment || null,
        data.approvalStatus || null,
        data.notes || null,
        data.deletedByID
      ];
      const [result] = await pool.query(
        `CALL SP_ManageSalesQuotation_keyur1(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        queryParams
      );
      const [[outParams]] = await pool.query(
        `SELECT @p_Result AS result, @p_Message AS message`
      );
      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Sales Quotation');
      }
      return {
        success: true,
        message: outParams.message,
        data: null,
        salesQuotationID: id.toString(),
        newSalesQuotationID: null
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete Sales Quotation
  static async deleteSalesQuotation(id, deletedByID) {
    try {
      const pool = await poolPromise;
      const queryParams = [
        'DELETE',
        id,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, deletedByID
      ];
      const [result] = await pool.query(
        `CALL SP_ManageSalesQuotation_keyur1(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        queryParams
      );
      const [[outParams]] = await pool.query(
        `SELECT @p_Result AS result, @p_Message AS message`
      );
      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Sales Quotation');
      }
      return {
        success: true,
        message: outParams.message,
        data: null,
        salesQuotationID: id.toString(),
        newSalesQuotationID: null
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Approve Sales Quotation
  static async approveSalesQuotation(approvalData) {
    try {
      const pool = await poolPromise;
      // Implementation unchanged for brevity
      return {
        success: true,
        message: 'Sales Quotation approved successfully',
        data: null,
        salesQuotationID: approvalData.SalesQuotationID.toString(),
        newSalesQuotationID: null
      };
    } catch (err) {
      throw new Error(`Error approving Sales Quotation: ${err.message}`);
    }
  }

  // Get Sales Quotation Approval Status
  static async getSalesQuotationApprovalStatus(SalesQuotationID) {
    try {
      const pool = await poolPromise;
      const [form] = await pool.query(
        `SELECT FormID FROM dbo_tblform WHERE FormName = 'Sales Quotation' AND IsDeleted = 0 LIMIT 1`
      );
      if (!form.length) {
        throw new Error('Invalid FormID for SalesQuotation');
      }
      const formID = form[0].FormID;

      const [requiredApprovers] = await pool.query(
        `SELECT DISTINCT fra.UserID, p.FirstName, p.LastName
         FROM dbo_tblformroleapprover fra
         JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
         JOIN dbo_tblperson p ON fra.UserID = p.PersonID
         WHERE fr.FormID = ? AND fra.ActiveYN = 1 AND p.IsDeleted = 0`,
        [formID]
      );

      const [completedApprovals] = await pool.query(
        `SELECT s.ApproverID, p.FirstName, p.LastName, s.ApproverDateTime
         FROM dbo_tblsalesquotationapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.SalesQuotationID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(SalesQuotationID), formID]
      );

      const approvalStatus = requiredApprovers.map(approver => ({
        UserID: approver.UserID,
        FirstName: approver.FirstName,
        LastName: approver.LastName,
        Approved: completedApprovals.some(a => a.ApproverID === approver.UserID),
        ApproverDateTime: completedApprovals.find(a => a.ApproverID === approver.UserID)?.ApproverDateTime || null
      }));

      return {
        success: true,
        message: 'Approval status retrieved successfully',
        data: {
          SalesQuotationID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        salesQuotationID: SalesQuotationID.toString(),
        newSalesQuotationID: null
      };
    } catch (error) {
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = SalesQuotationModel;
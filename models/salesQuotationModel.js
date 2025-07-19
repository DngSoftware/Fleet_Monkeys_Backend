const poolPromise = require('../config/db.config');

class SalesQuotationModel {
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

      const [result] = await pool.query(
        'CALL sp_getallsalesquotation(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_totalrecords)',
        queryParams
      );

      const [[outParams]] = await pool.query('SELECT @p_totalrecords AS totalrecords');

      if (outParams.totalrecords === -1) {
        throw new Error('Error retrieving Sales Quotations');
      }

      return {
        data: result[0] || [],
        totalRecords: outParams.totalrecords || 0,
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil((outParams.totalrecords || 0) / pageSize)
      };
    } catch (err) {
      console.error('getAllSalesQuotations error:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Sales Quotation
  static async createSalesQuotation(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null,
        data.salesrfqid || null,
        data.purchaserfqid,
        data.supplierid || null,
        data.status || 'Pending',
        data.originwarehouseaddressid || null,
        data.collectionaddressid || null,
        data.billingaddressid || null,
        data.destinationaddressid || null,
        data.destinationwarehouseaddressid || null,
        data.collectionwarehouseid || null,
        data.postingdate || null,
        data.deliverydate || null,
        data.requiredbydate || null,
        data.datereceived || null,
        data.servicetypeid || null,
        data.externalrefno || null,
        data.externalsupplierid || null,
        data.customerid || null,
        data.companyid || null,
        data.terms || null,
        data.packagingrequiredyn || 0,
        data.collectfromsupplieryn || 0,
        data.salesquotationcompletedyn || 0,
        data.shippingpriorityid || null,
        data.validtilldate || null,
        data.currencyid || null,
        data.suppliercontactpersonid || null,
        data.isdeliveryonly || 0,
        data.taxesandothercharges || 0,
        data.createdbyid,
        null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewSalesQuotationID AS newsalesquotationid'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Sales Quotation');
      }

      return {
        newsalesquotationid: outParams.newsalesquotationid,
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Sales Quotation by ID
  static async getSalesQuotationById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewSalesQuotationID AS newsalesquotationid'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Sales Quotation not found');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Sales Quotation
  static async updateSalesQuotation(id, data) {
    try {
      const pool = await poolPromise;
      let connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // If supplierquotationparcelids are provided, populate TempSelectedParcels
        if (data.supplierquotationparcelid && Array.isArray(data.supplierquotationparcelid) && data.supplierquotationparcelid.length > 0) {
          // Drop and recreate TempSelectedParcels
          await connection.query('DROP TEMPORARY TABLE IF EXISTS TempSelectedParcels');
          await connection.query(`
            CREATE TEMPORARY TABLE TempSelectedParcels (
              supplierquotationparcelid INT,
              supplierquotationid INT,
              itemid INT,
              certificationid INT,
              itemquantity DECIMAL(14,4),
              uomid INT,
              countryoforiginid INT,
              supplierrate DECIMAL(14,4),
              supplieramount DECIMAL(14,4),
              supplierid INT,
              createdbyid INT,
              createddatetime DATETIME
            )
          `);

          // Insert selected parcels
          const insertQuery = `
            INSERT INTO TempSelectedParcels (
              supplierquotationparcelid,
              supplierquotationid,
              itemid,
              certificationid,
              itemquantity,
              uomid,
              countryoforiginid,
              supplierrate,
              supplieramount,
              supplierid,
              createdbyid,
              createddatetime
            )
            SELECT 
              sqp.supplierquotationparcelid,
              sqp.supplierquotationid,
              sqp.itemid,
              sqp.certificationid,
              sqp.itemquantity,
              sqp.uomid,
              sqp.countryoforiginid,
              sqp.rate,
              sqp.amount,
              sq.supplierid,
              sqp.createdbyid,
              sqp.createddatetime
            FROM dbo_tblsupplierquotationparcel sqp
            INNER JOIN dbo_tblsupplierquotation sq ON sqp.supplierquotationid = sq.supplierquotationid
            WHERE sqp.supplierquotationparcelid IN (?)
              AND sq.salesrfqid = (
                SELECT salesrfqid FROM dbo_tblsalesquotation WHERE salesquotationid = ?
              )
              AND sq.isdeleted = 0
              AND sqp.isdeleted = 0
          `;
          await connection.query(insertQuery, [data.supplierquotationparcelid, parseInt(id)]);
        }

        const queryParams = [
          'UPDATE',
          id,
          data.salesrfqid || null,
          data.purchaserfqid || null,
          data.supplierid || null,
          data.status || null,
          data.originwarehouseaddressid || null,
          data.collectionaddressid || null,
          data.billingaddressid || null,
          data.destinationaddressid || null,
          data.destinationwarehouseaddressid || null,
          data.collectionwarehouseid || null,
          data.postingdate || null,
          data.deliverydate || null,
          data.requiredbydate || null,
          data.datereceived || null,
          data.servicetypeid || null,
          data.externalrefno || null,
          data.externalsupplierid || null,
          data.customerid || null,
          data.companyid || null,
          data.terms || null,
          data.packagingrequiredyn || null,
          data.collectfromsupplieryn || null,
          data.salesquotationcompletedyn || null,
          data.shippingpriorityid || null,
          data.validtilldate || null,
          data.currencyid || null,
          data.suppliercontactpersonid || null,
          data.isdeliveryonly || null,
          data.taxesandothercharges || null,
          data.createdbyid || null,
          null
        ];

        const [result] = await connection.query(
          'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
          queryParams
        );

        const [[outParams]] = await connection.query(
          'SELECT @p_Result AS result, @p_Message AS message'
        );

        if (outParams.result !== 1) {
          throw new Error(outParams.message || 'Failed to update Sales Quotation');
        }

        await connection.commit();
        return {
          message: outParams.message
        };
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Sales Quotation
  static async deleteSalesQuotation(id, deletedbyid) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        deletedbyid,
        null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Sales Quotation');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get Supplier Quotation Parcels by SalesRFQID
  static async getSupplierQuotationParcels(salesrfqid) {
    try {
      const pool = await poolPromise;
      const [parcels] = await pool.query(`
        SELECT 
          sqp.supplierquotationparcelid,
          sqp.supplierquotationid,
          s.suppliername,
          i.itemname,
          sqp.itemid,
          sqp.amount,
          co.countryoforigin,
          sqp.rate,
          s.supplierid,
          co.countryoforiginid,
          sq.salesrfqid,
          c.currencyname
        FROM ((((dbo_tblsupplierquotationparcel sqp 
          LEFT JOIN dbo_tblsupplierquotation sq ON sqp.supplierquotationid = sq.supplierquotationid)
          LEFT JOIN dbo_tblsupplier s ON sq.supplierid = s.supplierid)
          LEFT JOIN dbo_tblitem i ON sqp.itemid = i.itemid)
          LEFT JOIN dbo_tblcountryoforigin co ON sqp.countryoforiginid = co.countryoforiginid)
          LEFT JOIN dbo_tblcurrency c ON sq.currencyid = c.currencyid
        WHERE sq.salesrfqid = ?
          AND sq.isdeleted = 0
          AND sqp.isdeleted = 0
        ORDER BY i.itemname, sqp.amount DESC
      `, [parseInt(salesrfqid)]);

      return parcels;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = SalesQuotationModel;
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

  // Helper: Check form role approver permission
  static async #checkFormRoleApproverPermission(approverID, formName) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT fra.UserID
        FROM dbo_tblformroleapprover fra
        JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
        JOIN dbo_tblform f ON fr.FormID = f.FormID
        WHERE fra.UserID = ?
          AND f.FormName = ?
          AND fra.ActiveYN = 1
          AND f.IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(approverID), formName]);
      return result.length > 0;
    } catch (error) {
      throw new Error(`Error checking form role approver permission: ${error.message}`);
    }
  }

  // Helper: Check Sales Quotation status
  static async #checkSalesQuotationStatus(salesQuotationID) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT Status
        FROM dbo_tblsalesquotation
        WHERE SalesQuotationID = ? AND IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(salesQuotationID)]);
      if (result.length === 0) {
        return { exists: false, status: null };
      }
      return { exists: true, status: result[0].Status };
    } catch (error) {
      throw new Error(`Error checking Sales Quotation status: ${error.message}`);
    }
  }

  // Helper: Insert approval record
  static async #insertSalesQuotationApproval(connection, approvalData) {
    try {
      const query = `
        INSERT INTO dbo_tblsalesquotationapproval (
          SalesQuotationID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
        ) VALUES (
          ?, ?, ?, NOW(), ?, NOW(), 0
        );
      `;
      const [result] = await connection.query(query, [
        parseInt(approvalData.SalesQuotationID),
        parseInt(approvalData.ApproverID),
        1,
        parseInt(approvalData.ApproverID)
      ]);
      console.log(`Insert Debug: SalesQuotationID=${approvalData.SalesQuotationID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
      return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error inserting Sales Quotation approval: ${error.message}`);
    }
  }

  // Approve a Sales Quotation
  static async approveSalesQuotation(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const requiredFields = ['SalesQuotationID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        throw new Error(`${missingFields.join(', ')} are required`);
      }

      const salesQuotationID = parseInt(approvalData.SalesQuotationID);
      const approverID = parseInt(approvalData.ApproverID);
      if (isNaN(salesQuotationID) || isNaN(approverID)) {
        throw new Error('Invalid SalesQuotationID or ApproverID');
      }

      const formName = 'Sales Quotation';
      const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
      if (!hasPermission) {
        throw new Error('Approver does not have permission to approve this form');
      }

      const { exists, status } = await this.#checkSalesQuotationStatus(salesQuotationID);
      if (!exists) {
        throw new Error('Sales Quotation does not exist or has been deleted');
      }
      if (status !== 'Pending') {
        throw new Error(`Sales Quotation status must be Pending to approve, current status: ${status}`);
      }

      // Check for existing approval
      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblsalesquotationapproval WHERE SalesQuotationID = ? AND ApproverID = ? AND IsDeleted = 0',
        [salesQuotationID, approverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('Approver has already approved this Sales Quotation');
      }

      // Record approval
      const approvalInsertResult = await this.#insertSalesQuotationApproval(connection, { SalesQuotationID: salesQuotationID, ApproverID: approverID });
      if (!approvalInsertResult.success) {
        throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
      }

      // Get FormID
      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Sales Quotation');
      }
      const formID = form[0].FormID;

      // Get required approvers
      const [requiredApproversList] = await connection.query(
        `SELECT DISTINCT fra.UserID, p.FirstName
         FROM dbo_tblformroleapprover fra
         JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
         JOIN dbo_tblperson p ON fra.UserID = p.PersonID
         WHERE fr.FormID = ? AND fra.ActiveYN = 1`,
        [formID]
      );
      const requiredCount = requiredApproversList.length;

      // Get completed approvals
      const [approvedList] = await connection.query(
        `SELECT s.ApproverID, s.ApprovedYN
         FROM dbo_tblsalesquotationapproval s
         WHERE s.SalesQuotationID = ? AND s.IsDeleted = 0
           AND s.ApproverID IN (
             SELECT DISTINCT fra.UserID
             FROM dbo_tblformroleapprover fra
             JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
             WHERE fr.FormID = ? AND fra.ActiveYN = 1
           )`,
        [salesQuotationID, formID]
      );
      const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

      // Check for mismatched ApproverIDs
      const [allApprovals] = await connection.query(
        'SELECT ApproverID FROM dbo_tblsalesquotationapproval WHERE SalesQuotationID = ? AND IsDeleted = 0',
        [salesQuotationID]
      );
      const requiredUserIDs = requiredApproversList.map(a => a.UserID);
      const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

      // Debug logs
      console.log(`Approval Debug: SalesQuotationID=${salesQuotationID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        // All approvals complete
        await connection.query(
          'UPDATE dbo_tblsalesquotation SET Status = ? WHERE SalesQuotationID = ?',
          ['Approved', salesQuotationID]
        );
        message = 'Sales Quotation fully approved.';
        isFullyApproved = true;
      } else {
        // Partial approval
        const remaining = requiredCount - approved;
        message = `Approval recorded. Awaiting ${remaining} more approval(s).`;
      }

      await connection.commit();

      return {
        success: true,
        message,
        data: null,
        salesQuotationId: salesQuotationID.toString(),
        newSalesQuotationId: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approveSalesQuotation:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        salesQuotationId: approvalData.SalesQuotationID.toString(),
        newSalesQuotationId: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async getSalesQuotationApprovalStatus(SalesQuotationID) {
    try {
      const pool = await poolPromise;
      const formName = 'Sales Quotation';

      // Get FormID
      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for SalesQuotation');
      }
      const formID = form[0].FormID;

      // Get required approvers
      const [requiredApprovers] = await pool.query(
        `SELECT DISTINCT fra.UserID, p.FirstName, p.LastName
         FROM dbo_tblformroleapprover fra
         JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
         JOIN dbo_tblperson p ON fra.UserID = p.PersonID
         WHERE fr.FormID = ? AND fra.ActiveYN = 1 AND p.IsDeleted = 0`,
        [formID]
      );

      // Get completed approvals
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

      // Prepare approval status
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
        SalesQuotationID: SalesQuotationID.toString(),
        newSalesQuotationID: null
      };
    } catch (error) {
      console.error('Error in getSalesQuotationApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = SalesQuotationModel;
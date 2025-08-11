const poolPromise = require('../config/db.config');

class SalesInvoiceModel {
  static async getAllSalesInvoices({
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'CreatedDateTime',
    sortOrder = 'DESC',
    customerId = null,
    companyId = null,
    supplierId = null,
    dateFrom = null,
    dateTo = null,
    searchTerm = null
  }) {
    try {
      const pool = await poolPromise;

      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw new Error('Invalid pageNumber: must be a positive integer');
      }
      if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new Error('Invalid pageSize: must be a positive integer');
      }
      if (!['CreatedDateTime', 'PostingDate', 'DeliveryDate', 'RequiredByDate', 'Series', 'Total', 'SalesInvoiceID'].includes(sortBy)) {
        throw new Error('Invalid sortBy: must be one of CreatedDateTime, PostingDate, DeliveryDate, RequiredByDate, Series, Total, SalesInvoiceID');
      }
      if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
        throw new Error('Invalid sortOrder: must be ASC or DESC');
      }

      const queryParams = [
        pageNumber,
        pageSize,
        sortBy,
        sortOrder.toUpperCase(),
        customerId ? parseInt(customerId) : null,
        companyId ? parseInt(companyId) : null,
        supplierId ? parseInt(supplierId) : null,
        dateFrom || null,
        dateTo || null,
        searchTerm || null
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllSalesInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        queryParams
      );

      return {
        data: result[0],
        totalRecords: result[0][0]?.TotalRecords || 0,
        totalPages: result[0][0]?.TotalPages || 0,
        currentPage: result[0][0]?.CurrentPage || pageNumber,
        pageSize: result[0][0]?.PageSize || pageSize
      };
    } catch (err) {
      const errorMessage = err.sqlState ? 
        `Database error: ${err.message} (SQLSTATE: ${err.sqlState})` : 
        `Database error: ${err.message}`;
      throw new Error(errorMessage);
    }
  }

  static async getSalesInvoiceById(salesInvoiceId) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();

      if (!Number.isInteger(salesInvoiceId)) {
        throw new Error('Invalid salesInvoiceId: must be an integer');
      }

      const queryParams = [
        'SELECT',
        salesInvoiceId,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null
      ];

      const [result] = await connection.query(
        'CALL SP_ManageSalesInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
        queryParams
      );

      const [errorResult] = await connection.query('SELECT @p_ErrorMessage AS ErrorMessage');
      if (errorResult[0].ErrorMessage) {
        throw new Error(errorResult[0].ErrorMessage);
      }

      const [invoice] = await connection.query(
        'SELECT * FROM dbo_tblsalesinvoice WHERE SalesInvoiceID = ? AND IsDeleted = 0',
        [salesInvoiceId]
      );
      if (!invoice.length) {
        return { data: null };
      }

      const [parcels] = await connection.query(
        'SELECT * FROM dbo_tblsalesinvoiceparcel WHERE SalesInvoiceID = ? AND IsDeleted = 0',
        [salesInvoiceId]
      );
      const [taxes] = await connection.query(
        'SELECT * FROM dbo_tblsalesinvoicetaxes WHERE SalesInvoiceID = ? AND IsDeleted = 0',
        [salesInvoiceId]
      );

      return {
        data: {
          invoice: invoice[0],
          parcels,
          taxes
        }
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  static async createSalesInvoice(data, userId) {
    let connection;
    try {
      console.log('Input data:', JSON.stringify(data, null, 2));
      console.log('UserID:', userId);

      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const {
        pInvoiceId, salesRFQId, series, referencedSalesInvoiceId, salesOrderId,
        postingDate, requiredByDate, deliveryDate, dateReceived, terms,
        packagingRequiredYN, collectFromSupplierYN, externalRefNo,
        externalSupplierId, isPaid, formCompletedYN, fileName, fileContent,
        copyTaxesFromPInvoice, taxChargesTypeId, taxRate, taxTotal,
        originWarehouseId, destinationWarehouseId, billedBy, billedTo, status, deferralAccount
      } = data;

      // Validate required fields (at least one of salesOrderId or salesRFQId)
      if (!userId) {
        throw new Error('UserID is required');
      }
      if (!salesOrderId && !salesRFQId) {
        throw new Error('At least one of SalesOrderID or SalesRFQID is required');
      }

      const queryParams = [
        'INSERT',
        null,
        pInvoiceId ? parseInt(pInvoiceId) : null,
        salesRFQId ? parseInt(salesRFQId) : null,
        userId,
        series || null,
        referencedSalesInvoiceId ? parseInt(referencedSalesInvoiceId) : null,
        salesOrderId ? parseInt(salesOrderId) : null,
        postingDate || null,
        requiredByDate || null,
        deliveryDate || null,
        dateReceived || null,
        terms || null,
        packagingRequiredYN !== undefined ? parseInt(packagingRequiredYN) : null,
        collectFromSupplierYN !== undefined ? parseInt(collectFromSupplierYN) : null,
        externalRefNo || null,
        externalSupplierId ? parseInt(externalSupplierId) : null,
        isPaid !== undefined ? parseInt(isPaid) : null,
        formCompletedYN !== undefined ? parseInt(formCompletedYN) : null,
        fileName || null,
        fileContent || null,
        copyTaxesFromPInvoice !== undefined ? parseInt(copyTaxesFromPInvoice) : null,
        taxChargesTypeId ? parseInt(taxChargesTypeId) : null,
        taxRate ? parseFloat(taxRate) : null,
        taxTotal ? parseFloat(taxTotal) : null,
        originWarehouseId ? parseInt(originWarehouseId) : null,
        destinationWarehouseId ? parseInt(destinationWarehouseId) : null,
        billedBy ? parseInt(billedBy) : null,
        billedTo ? parseInt(billedTo) : null,
        status || 'Pending', // Default to 'Pending' if not provided
        deferralAccount || null
      ];

      console.log('Query Params:', JSON.stringify(queryParams, null, 2), 'Length:', queryParams.length);

      const [result] = await connection.query(
        'CALL SP_ManageSalesInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
        queryParams
      );

      console.log('SP_ManageSalesInvoice result:', JSON.stringify(result, null, 2));

      const [errorResult] = await connection.query('SELECT @p_ErrorMessage AS ErrorMessage');
      console.log('Error Result:', JSON.stringify(errorResult, null, 2));

      if (!errorResult || !errorResult[0]) {
        throw new Error('Failed to retrieve error message from stored procedure');
      }

      if (errorResult[0].ErrorMessage) {
        throw new Error(errorResult[0].ErrorMessage);
      }

      if (!result || !result[0] || !result[0][0]) {
        throw new Error('Failed to create sales invoice: No result returned from stored procedure');
      }

      const salesInvoiceId = result[0][0].SalesInvoiceID;
      if (!salesInvoiceId) {
        throw new Error('Failed to create sales invoice: SalesInvoiceID not returned');
      }

      await connection.commit();
      return {
        message: 'Sales Invoice created successfully',
        salesInvoiceId
      };
    } catch (err) {
      if (connection) {
        await connection.rollback();
      }
      console.error('CreateSalesInvoice error:', err);
      throw new Error(`Database error: ${err.message}`);
    } finally {
      if (connection) connection.release();
    }
  }

  static async approveSalesInvoice(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const { SalesInvoiceID, ApproverID } = approvalData;

      if (!SalesInvoiceID || !ApproverID) {
        throw new Error('SalesInvoiceID and ApproverID are required');
      }

      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        ['Sales Invoice']
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Sales Invoice');
      }
      const formID = form[0].FormID;

      const [requiredApprovers] = await connection.query(
        `SELECT DISTINCT fra.UserID
         FROM dbo_tblformroleapprover fra
         JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
         WHERE fr.FormID = ? AND fra.ActiveYN = 1`,
        [formID]
      );
      const requiredCount = requiredApprovers.length;

      if (!requiredApprovers.some(a => a.UserID === ApproverID)) {
        throw new Error('Approver is not authorized for this Sales Invoice');
      }

      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblsalesinvoiceapproval WHERE SalesInvoiceID = ? AND ApproverID = ? AND IsDeleted = 0',
        [SalesInvoiceID, ApproverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('This user has already approved this Sales Invoice');
      }

      await connection.query(
        'INSERT INTO dbo_tblsalesinvoiceapproval (SalesInvoiceID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted) VALUES (?, ?, 1, NOW(), ?, NOW(), 0)',
        [SalesInvoiceID, ApproverID, ApproverID]
      );

      const [completedApprovals] = await connection.query(
        'SELECT COUNT(*) AS Approved FROM dbo_tblsalesinvoiceapproval WHERE SalesInvoiceID = ? AND ApprovedYN = 1 AND IsDeleted = 0',
        [SalesInvoiceID]
      );
      const approved = completedApprovals[0].Approved;

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        await connection.query(
          'UPDATE dbo_tblsalesinvoice SET Status = ? WHERE SalesInvoiceID = ?',
          ['Approved', SalesInvoiceID]
        );
        message = 'Sales Invoice fully approved.';
        isFullyApproved = true;
      } else {
        const remaining = requiredCount - approved;
        message = `Approval recorded. Awaiting ${remaining} more approval(s).`;
      }

      await connection.commit();

      return {
        success: true,
        message,
        data: null,
        SalesInvoiceID: SalesInvoiceID.toString(),
        newSalesInvoiceID: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approveSalesInvoice:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        SalesInvoiceID: approvalData.SalesInvoiceID.toString(),
        newSalesInvoiceID: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async getSalesInvoiceApprovalStatus(SalesInvoiceID) {
    try {
      const pool = await poolPromise;
      const formName = 'Sales Invoice';

      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Sales Invoice');
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
         FROM dbo_tblsalesinvoiceapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.SalesInvoiceID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(SalesInvoiceID), formID]
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
          SalesInvoiceID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        SalesInvoiceID: SalesInvoiceID.toString(),
        newSalesInvoiceID: null
      };
    } catch (error) {
      console.error('Error in getSalesInvoiceApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = SalesInvoiceModel;
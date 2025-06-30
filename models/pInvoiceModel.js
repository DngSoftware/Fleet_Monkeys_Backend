const poolPromise = require('../config/db.config');

class PInvoiceModel {
  // Get all Purchase Invoices
  static async getAllPInvoices({
    pageNumber = 1,
    pageSize = 10,
    fromDate = null,
    toDate = null
  }) {
    try {
      const pool = await poolPromise;
  
      // Validate parameters
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw new Error('Invalid pageNumber: must be a positive integer');
      }
      if (!Number.isInteger(pageSize) || pageSize <= 0) {
        throw new Error('Invalid pageSize: must be a positive integer');
      }
  
      const queryParams = [
        pageNumber,
        pageSize,
        fromDate || null,
        toDate || null
      ];
  
      const [results] = await pool.query(
        'CALL SP_GetAllPInvoice(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );
  
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );
  
      if (outParams.result !== 1) {
        // Check error log for more details
        await new Promise(resolve => setTimeout(resolve, 100));
        const [[errorLog]] = await pool.query(
          'SELECT ErrorMessage, CreatedAt FROM dbo_tblerrorlog ORDER BY CreatedAt DESC LIMIT 1'
        );
        throw new Error(`Stored procedure error: ${errorLog?.ErrorMessage || outParams.message || 'Unknown error'}`);
      }
  
      // Extract TotalRecords from the second result set
      const totalRecords = results[1] && results[1][0] ? results[1][0].TotalRecords : 0;
  
      return {
        data: results[0],
        totalRecords: totalRecords
      };
    } catch (err) {
      const errorMessage = err.sqlState ? 
        `Database error: ${err.message} (SQLSTATE: ${err.sqlState})` : 
        `Database error: ${err.message}`;
      throw new Error(errorMessage);
    }
  }

  // Get a single Purchase Invoice by ID
  static async getPInvoiceById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null,
        null, // p_POID
        null, // p_UserID
        null, // p_Series
        null, // p_PostingDate
        null, // p_RequiredByDate
        null, // p_DeliveryDate
        null, // p_DateReceived
        null, // p_Terms
        null, // p_PackagingRequiredYN
        null, // p_CollectFromSupplierYN
        null, // p_ExternalRefNo
        null, // p_ExternalSupplierID
        null, // p_IsPaid
        null, // p_FormCompletedYN
        null, // p_FileName
        null, // p_FileContent
        null, // p_CopyTaxesFromPO
        null, // p_TaxChargesTypeID
        null, // p_TaxRate
        null, // p_TaxTotal
        null,
        null
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
        queryParams
      );

      if (!result[0][0]) {
        throw new Error('Purchase Invoice not found');
      }

      return result[0][0];
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a Purchase Invoice
  static async createPInvoice(data, userId) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_PInvoiceID
        data.poid || null,
        userId,
        data.series || null,
        data.postingDate || null,
        data.requiredByDate || null,
        data.deliveryDate || null,
        data.dateReceived || null,
        data.terms || null,
        data.packagingRequiredYN || null,
        data.collectFromSupplierYN || null,
        data.externalRefNo || null,
        data.externalSupplierId || null,
        data.isPaid || null,
        data.formCompletedYN || null,
        data.fileName || null,
        data.fileContent || null,
        data.copyTaxesFromPO || null,
        data.taxChargesTypeId || null,
        data.taxRate || null,
        data.taxTotal || null,
        null,
        null
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_ErrorMessage AS errorMessage'
      );

      if (outParams.errorMessage) {
        throw new Error(outParams.errorMessage);
      }

      return {
        pInvoiceId: result[0][0]?.PInvoiceID,
        message: result[0][0]?.Message || 'Purchase Invoice created successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Purchase Invoice
  static async updatePInvoice(id, data, userId) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.poid || null,
        userId,
        data.series || null,
        data.postingDate || null,
        data.requiredByDate || null,
        data.deliveryDate || null,
        data.dateReceived || null,
        data.terms || null,
        data.packagingRequiredYN || null,
        data.collectFromSupplierYN || null,
        data.externalRefNo || null,
        data.externalSupplierId || null,
        data.isPaid || null,
        data.formCompletedYN || null,
        data.fileName || null,
        data.fileContent || null,
        data.copyTaxesFromPO || null,
        data.taxChargesTypeId || null,
        data.taxRate || null,
        data.taxTotal || null
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_ErrorMessage AS errorMessage'
      );

      if (outParams.errorMessage) {
        throw new Error(outParams.errorMessage);
      }

      return {
        message: result[0][0]?.Message || 'Purchase Invoice updated successfully'
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Purchase Invoice
  static async deletePInvoice(id, userId) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_POID
        userId,
        null, // p_Series
        null, // p_PostingDate
        null, // p_RequiredByDate
        null, // p_DeliveryDate
        null, // p_DateReceived
        null, // p_Terms
        null, // p_PackagingRequiredYN
        null, // p_CollectFromSupplierYN
        null, // p_ExternalRefNo
        null, // p_ExternalSupplierID
        null, // p_IsPaid
        null, // p_FormCompletedYN
        null, // p_FileName
        null, // p_FileContent
        null, // p_CopyTaxesFromPO
        null, // p_TaxChargesTypeID
        null, // p_TaxRate
        null // p_TaxTotal
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePInvoice(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ErrorMessage)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_ErrorMessage AS errorMessage'
      );

      if (outParams.errorMessage) {
        throw new Error(outParams.errorMessage);
      }

      return {
        message: result[0][0]?.Message || 'Purchase Invoice deleted successfully'
      };
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

  // Helper: Check Supplier Quotation status
  static async #checkPInvoiceStatus(PInvoiceID) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT Status
        FROM dbo_tblpinvoice
        WHERE PInvoiceID = ? AND IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(PInvoiceID)]);
      if (result.length === 0) {
        return { exists: false, status: null };
      }
      return { exists: true, status: result[0].Status };
    } catch (error) {
      throw new Error(`Error checking PInvoice status: ${error.message}`);
    }
  }

  // Helper: Insert approval record
  static async #insertPInvoiceApproval(connection, approvalData) {
    try {
      const query = `
        INSERT INTO dbo_tblpinvoiceapproval (
         PInvoiceID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
        ) VALUES (
          ?, ?, ?, NOW(), ?, NOW(), 0
        );
      `;
      const [result] = await connection.query(query, [
        parseInt(approvalData.PInvoiceID),
        parseInt(approvalData.ApproverID),
        1,
        parseInt(approvalData.ApproverID)
      ]);
      console.log(`Insert Debug: PInvoiceID=${approvalData.PInvoiceID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
      return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error inserting Purchase Invoice approval: ${error.message}`);
    }
  }

  // Approve a Supplier Quotation
  static async approvePInvoice(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const requiredFields = ['PInvoiceID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        throw new Error(`${missingFields.join(', ')} are required`);
      }

      const PInvoiceID = parseInt(approvalData.PInvoiceID);
      const approverID = parseInt(approvalData.ApproverID);
      if (isNaN(PInvoiceID) || isNaN(approverID)) {
        throw new Error('Invalid PInvoiceID or ApproverID');
      }

      const formName = 'Purchase Invoice';
      const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
      if (!hasPermission) {
        throw new Error('Approver does not have permission to approve this form');
      }

      const { exists, status } = await this.#checkPInvoiceStatus(PInvoiceID);
      if (!exists) {
        throw new Error('Purchase Invoice does not exist or has been deleted');
      }
      if (status !== 'Pending') {
        throw new Error(`Purchase Invoice status must be Pending to approve, current status: ${status}`);
      }

      // Check for existing approval
      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblpinvoiceapproval WHERE PInvoiceID = ? AND ApproverID = ? AND IsDeleted = 0',
        [PInvoiceID, approverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('Approver has already approved this Purchase Invoice');
      }

      // Record approval
      const approvalInsertResult = await this.#insertPInvoiceApproval(connection, { PInvoiceID: PInvoiceID, ApproverID: approverID });
      if (!approvalInsertResult.success) {
        throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
      }

      // Get FormID
      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Purchase Invoice');
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
         FROM dbo_tblpinvoiceapproval s
         WHERE s.PInvoiceID = ? AND s.IsDeleted = 0
           AND s.ApproverID IN (
             SELECT DISTINCT fra.UserID
             FROM dbo_tblformroleapprover fra
             JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
             WHERE fr.FormID = ? AND fra.ActiveYN = 1
           )`,
        [PInvoiceID, formID]
      );
      const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

      // Check for mismatched ApproverIDs
      const [allApprovals] = await connection.query(
        'SELECT ApproverID FROM dbo_tblpinvoiceapproval WHERE PInvoiceID = ? AND IsDeleted = 0',
        [PInvoiceID]
      );
      const requiredUserIDs = requiredApproversList.map(a => a.UserID);
      const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

      // Debug logs
      console.log(`Approval Debug: PInvoiceID=${PInvoiceID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        // All approvals complete
        await connection.query(
          'UPDATE dbo_tblpinvoice SET Status = ? WHERE PInvoiceID = ?',
          ['Approved', PInvoiceID]
        );
        message = 'Purchase Invoice fully approved.';
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
        PInvoiceID: PInvoiceID.toString(),
        newPInvoiceID: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approvePurchaseInvoice:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        PInvoiceID: approvalData.PInvoiceID.toString(),
        newPInvoiceID: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

       static async getPInvoiceApprovalStatus(PInvoiceID) {
    try {
      const pool = await poolPromise;
      const formName = 'Purchase Invoice';

      // Get FormID
      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Purchase Invoice');
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
         FROM dbo_tblpinvoiceapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.PInvoiceID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(PInvoiceID), formID]
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
          PInvoiceID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        PInvoiceID: PInvoiceID.toString(),
        newPInvoiceID: null
      };
    } catch (error) {
      console.error('Error in getPurchaseInvoiceApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = PInvoiceModel;
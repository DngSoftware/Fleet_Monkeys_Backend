const poolPromise = require('../config/db.config');

class SupplierQuotationModel {
  // Get paginated Supplier Quotations
  static async getAllSupplierQuotations({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10,
        fromDate ? new Date(fromDate) : null,
        toDate ? new Date(toDate) : null
      ];

      // Call SP_GetAllSupplierQuotation
      const [results] = await pool.query(
        'CALL SP_GetAllSupplierQuotation(?, ?, ?, ?)',
        queryParams
      );

      // Extract paginated data and total records
      const data = results[0]; // First result set: paginated data
      const totalRecords = results[1][0].TotalRecords; // Second result set: total count

      return {
        data,
        totalRecords
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Supplier Quotation
  static async createSupplierQuotation(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_SupplierQuotationID
        data.SupplierID,
        data.PurchaseRFQID,
        data.CertificationID,
        data.Status || 'Pending',
        data.CreatedByID,
        null, // p_DeletedByID
        data.rate || 0,
        data.CountryOfOriginID,
        data.SalesAmount || 0,
        data.taxesAndOtherCharges || 0,
        data.total || 0,
        data.fileContent || null,
        data.fileName || null
      ];

      // Call SP_ManageSupplierQuotation with 15 input parameters
      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSupplierQuotationID)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewSupplierQuotationID AS newSupplierQuotationId'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Supplier Quotation');
      }

      return {
        newSupplierQuotationId: outParams.newSupplierQuotationId,
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Supplier Quotation by ID
  static async getSupplierQuotationById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_SupplierID
        null, // p_PurchaseRFQID
        null, // p_CertificationID
        null, // p_Status
        null, // p_CreatedByID
        null, // p_DeletedByID
        null, // p_Rate
        null, // p_CountryOfOriginID
        null, // p_SalesAmount
        null, // p_TaxesAndOtherCharges
        null, // p_Total
        null, // p_FileContent
        null // p_FileName
      ];

      // Call SP_ManageSupplierQuotation with 15 input parameters
      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSupplierQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewSupplierQuotationID AS newSupplierQuotationId'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Supplier Quotation not found or deleted');
      }

      return {
        quotation: result[0][0] || null,
        parcels: result[1] || []
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Supplier Quotation
  static async updateSupplierQuotation(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.SupplierID,
        data.PurchaseRFQID,
        data.CertificationID,
        data.Status,
        data.CreatedByID,
        null, // p_DeletedByID
        data.rate,
        data.CountryOfOriginID,
        data.SalesAmount,
        data.taxesAndOtherCharges,
        data.total,
        data.fileContent,
        data.fileName
      ];

      // Call SP_ManageSupplierQuotation with 15 input parameters
      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSupplierQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Supplier Quotation');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Supplier Quotation
  static async deleteSupplierQuotation(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_SupplierID
        null, // p_PurchaseRFQID
        null, // p_CertificationID
        null, // p_Status
        null, // p_CreatedByID
        deletedById,
        null, // p_Rate
        null, // p_CountryOfOriginID
        null, // p_SalesAmount
        null, // p_TaxesAndOtherCharges
        null, // p_Total
        null, // p_FileContent
        null // p_FileName
      ];

      // Call SP_ManageSupplierQuotation with 15 input parameters
      const [result] = await pool.query(
        'CALL SP_ManageSupplierQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSupplierQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Supplier Quotation');
      }

      return {
        message: outParams.message
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
  static async #checkSupplierQuotationStatus(supplierQuotationID) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT Status
        FROM dbo_tblsupplierquotation
        WHERE SupplierQuotationID = ? AND IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(supplierQuotationID)]);
      if (result.length === 0) {
        return { exists: false, status: null };
      }
      return { exists: true, status: result[0].Status };
    } catch (error) {
      throw new Error(`Error checking Supplier Quotation status: ${error.message}`);
    }
  }

  // Helper: Insert approval record
  static async #insertSupplierQuotationApproval(connection, approvalData) {
    try {
      const query = `
        INSERT INTO dbo_tblsupplierquotationapproval (
          SupplierQuotationID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
        ) VALUES (
          ?, ?, ?, NOW(), ?, NOW(), 0
        );
      `;
      const [result] = await connection.query(query, [
        parseInt(approvalData.SupplierQuotationID),
        parseInt(approvalData.ApproverID),
        1,
        parseInt(approvalData.ApproverID)
      ]);
      console.log(`Insert Debug: SupplierQuotationID=${approvalData.SupplierQuotationID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
      return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error inserting Supplier Quotation approval: ${error.message}`);
    }
  }

  // Approve a Supplier Quotation
  static async approveSupplierQuotation(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const requiredFields = ['SupplierQuotationID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        throw new Error(`${missingFields.join(', ')} are required`);
      }

      const supplierQuotationID = parseInt(approvalData.SupplierQuotationID);
      const approverID = parseInt(approvalData.ApproverID);
      if (isNaN(supplierQuotationID) || isNaN(approverID)) {
        throw new Error('Invalid SupplierQuotationID or ApproverID');
      }

      const formName = 'Supplier Quotation';
      const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
      if (!hasPermission) {
        throw new Error('Approver does not have permission to approve this form');
      }

      const { exists, status } = await this.#checkSupplierQuotationStatus(supplierQuotationID);
      if (!exists) {
        throw new Error('Supplier Quotation does not exist or has been deleted');
      }
      if (status !== 'Pending') {
        throw new Error(`Supplier Quotation status must be Pending to approve, current status: ${status}`);
      }

      // Check for existing approval
      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblsupplierquotationapproval WHERE SupplierQuotationID = ? AND ApproverID = ? AND IsDeleted = 0',
        [supplierQuotationID, approverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('Approver has already approved this Supplier Quotation');
      }

      // Record approval
      const approvalInsertResult = await this.#insertSupplierQuotationApproval(connection, { SupplierQuotationID: supplierQuotationID, ApproverID: approverID });
      if (!approvalInsertResult.success) {
        throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
      }

      // Get FormID
      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Supplier Quotation');
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
         FROM dbo_tblsupplierquotationapproval s
         WHERE s.SupplierQuotationID = ? AND s.IsDeleted = 0
           AND s.ApproverID IN (
             SELECT DISTINCT fra.UserID
             FROM dbo_tblformroleapprover fra
             JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
             WHERE fr.FormID = ? AND fra.ActiveYN = 1
           )`,
        [supplierQuotationID, formID]
      );
      const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

      // Check for mismatched ApproverIDs
      const [allApprovals] = await connection.query(
        'SELECT ApproverID FROM dbo_tblsupplierquotationapproval WHERE SupplierQuotationID = ? AND IsDeleted = 0',
        [supplierQuotationID]
      );
      const requiredUserIDs = requiredApproversList.map(a => a.UserID);
      const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

      // Debug logs
      console.log(`Approval Debug: SupplierQuotationID=${supplierQuotationID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        // All approvals complete
        await connection.query(
          'UPDATE dbo_tblsupplierquotation SET Status = ? WHERE SupplierQuotationID = ?',
          ['Approved', supplierQuotationID]
        );
        message = 'Supplier Quotation fully approved.';
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
        supplierQuotationId: supplierQuotationID.toString(),
        newSupplierQuotationId: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approveSupplierQuotation:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        supplierQuotationId: approvalData.SupplierQuotationID.toString(),
        newSupplierQuotationId: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

    static async getSupplierQuotationApprovalStatus(SupplierQuotationID) {
    try {
      const pool = await poolPromise;
      const formName = 'Supplier Quotation';

      // Get FormID
      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for SupplierQuotation');
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
         FROM dbo_tblsupplierquotationapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.SupplierQuotationID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(SupplierQuotationID), formID]
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
          SupplierQuotationID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        SupplierQuotationID: SupplierQuotationID.toString(),
        newSupplierQuotationID: null
      };
    } catch (error) {
      console.error('Error in getSalesRFQApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = SupplierQuotationModel;
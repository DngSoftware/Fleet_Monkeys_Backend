const poolPromise = require('../config/db.config');

class PurchaseRFQModel {
  // Get paginated Purchase RFQs
  static async getAllPurchaseRFQs({ pageNumber = 1, pageSize = 10 }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10
      ];

      // Call SP_GetAllPurchaseRFQs
      const [result] = await pool.query(
        'CALL SP_GetAllPurchaseRFQs(?, ?, @totalRecords)',
        queryParams
      );

      // Retrieve OUT parameter
      const [[{ totalRecords }]] = await pool.query('SELECT @totalRecords AS totalRecords');

      return {
        data: result[0],
        totalRecords: totalRecords || 0
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Purchase RFQ
  static async createPurchaseRFQ(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_PurchaseRFQID
        data.SalesRFQID,
         data.Status || 'Pending',
        data.CreatedByID,
        null // p_DeletedByID
      ];

      // Call SP_ManagePurchaseRFQ
      const [result] = await pool.query(
        'CALL SP_ManagePurchaseRFQ(?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewPurchaseRFQID)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewPurchaseRFQID AS newPurchaseRFQId'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Purchase RFQ');
      }

      return {
        newPurchaseRFQId: outParams.newPurchaseRFQId,
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Get a single Purchase RFQ by ID
  static async getPurchaseRFQById(id) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'SELECT',
        id,
        null, // p_SalesRFQID
        null,
        null, // p_CreatedByID
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePurchaseRFQ(?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewPurchaseRFQID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewPurchaseRFQID AS newPurchaseRFQId'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Purchase RFQ not found or deleted');
      }

      return result[0][0] || null;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Update a Purchase RFQ
  static async updatePurchaseRFQ(id, data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'UPDATE',
        id,
        data.SalesRFQID,
        null,
        data.CreatedByID,
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePurchaseRFQ(?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewPurchaseRFQID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Purchase RFQ');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Purchase RFQ
  static async deletePurchaseRFQ(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_SalesRFQID
        null,
        null, // p_CreatedByID
        deletedById
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePurchaseRFQ(?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewPurchaseRFQID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to delete Purchase RFQ');
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

  // Helper: Check Purchase RFQ status
  static async #checkPurchaseRFQStatus(purchaseRFQID) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT Status
        FROM dbo_tblpurchaserfq
        WHERE PurchaseRFQID = ? AND IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(purchaseRFQID)]);
      if (result.length === 0) {
        return { exists: false, status: null };
      }
      return { exists: true, status: result[0].Status };
    } catch (error) {
      throw new Error(`Error checking Purchase RFQ status: ${error.message}`);
    }
  }

  // Helper: Insert approval record
  static async #insertPurchaseRFQApproval(connection, approvalData) {
    try {
      const query = `
        INSERT INTO dbo_tblpurchaserfqapproval (
          PurchaseRFQID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
        ) VALUES (
          ?, ?, ?, NOW(), ?, NOW(), 0
        );
      `;
      const [result] = await connection.query(query, [
        parseInt(approvalData.PurchaseRFQID),
        parseInt(approvalData.ApproverID),
        1,
        parseInt(approvalData.ApproverID)
      ]);
      console.log(`Insert Debug: PurchaseRFQID=${approvalData.PurchaseRFQID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
      return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error inserting Purchase RFQ approval: ${error.message}`);
    }
  }

  // Approve a Purchase RFQ
  static async approvePurchaseRFQ(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const requiredFields = ['PurchaseRFQID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        throw new Error(`${missingFields.join(', ')} are required`);
      }

      const purchaseRFQID = parseInt(approvalData.PurchaseRFQID);
      const approverID = parseInt(approvalData.ApproverID);
      if (isNaN(purchaseRFQID) || isNaN(approverID)) {
        throw new Error('Invalid PurchaseRFQID or ApproverID');
      }

      const formName = 'Purchase RFQ';
      const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
      if (!hasPermission) {
        throw new Error('Approver does not have permission to approve this form');
      }

      const { exists, status } = await this.#checkPurchaseRFQStatus(purchaseRFQID);
      if (!exists) {
        throw new Error('Purchase RFQ does not exist or has been deleted');
      }
      if (status !== 'Pending') {
        throw new Error(`Purchase RFQ status must be Pending to approve, current status: ${status}`);
      }

      // Check for existing approval
      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblpurchaserfqapproval WHERE PurchaseRFQID = ? AND ApproverID = ? AND IsDeleted = 0',
        [purchaseRFQID, approverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('Approver has already approved this Purchase RFQ');
      }

      // Record approval
      const approvalInsertResult = await this.#insertPurchaseRFQApproval(connection, { PurchaseRFQID: purchaseRFQID, ApproverID: approverID });
      if (!approvalInsertResult.success) {
        throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
      }

      // Get FormID
      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Purchase RFQ');
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
        `SELECT p.ApproverID, p.ApprovedYN
         FROM dbo_tblpurchaserfqapproval p
         WHERE p.PurchaseRFQID = ? AND p.IsDeleted = 0
           AND p.ApproverID IN (
             SELECT DISTINCT fra.UserID
             FROM dbo_tblformroleapprover fra
             JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
             WHERE fr.FormID = ? AND fra.ActiveYN = 1
           )`,
        [purchaseRFQID, formID]
      );
      const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

      // Check for mismatched ApproverIDs
      const [allApprovals] = await connection.query(
        'SELECT ApproverID FROM dbo_tblpurchaserfqapproval WHERE PurchaseRFQID = ? AND IsDeleted = 0',
        [purchaseRFQID]
      );
      const requiredUserIDs = requiredApproversList.map(a => a.UserID);
      const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

      // Debug logs
      console.log(`Approval Debug: PurchaseRFQID=${purchaseRFQID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        // All approvals complete
        await connection.query(
          'UPDATE dbo_tblpurchaserfq SET Status = ? WHERE PurchaseRFQID = ?',
          ['Approved', purchaseRFQID]
        );
        message = 'Purchase RFQ fully approved.';
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
        purchaseRFQId: purchaseRFQID.toString(),
        newPurchaseRFQId: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approvePurchaseRFQ:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        purchaseRFQId: approvalData.PurchaseRFQID.toString(),
        newPurchaseRFQId: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  
  static async getPurchaseRFQApprovalStatus(PurchaseRFQID) {
    try {
      const pool = await poolPromise;
      const formName = 'Purchase RFQ';

      // Get FormID
      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Purchase RFQ');
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
         FROM dbo_tblpurchaserfqapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.PurchaseRFQID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(PurchaseRFQID), formID]
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
          PurchaseRFQID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        PurchaseRFQID: PurchaseRFQID.toString(),
        newPurchaseRFQID: null
      };
    } catch (error) {
      console.error('Error in getPurchaseRFQApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = PurchaseRFQModel;
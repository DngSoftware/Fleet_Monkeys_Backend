const poolPromise = require('../config/db.config');

class PurchaseOrderModel {
  static async #executeManageStoredProcedure(action, purchaseOrderData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        purchaseOrderData.POID ? parseInt(purchaseOrderData.POID) : null,
        purchaseOrderData.SalesOrderID ? parseInt(purchaseOrderData.SalesOrderID) : null,
        purchaseOrderData.CreatedByID ? parseInt(purchaseOrderData.CreatedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageFULLPO(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0] || [] : null,
        poId: purchaseOrderData.POID
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(purchaseOrderData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT') {
      if (purchaseOrderData.SalesOrderID) {
        const [salesOrderCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesorder WHERE SalesOrderID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(purchaseOrderData.SalesOrderID)]
        );
        if (salesOrderCheck.length === 0) errors.push(`SalesOrderID ${purchaseOrderData.SalesOrderID} does not exist`);
      }
      if (purchaseOrderData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(purchaseOrderData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${purchaseOrderData.CreatedByID} does not exist`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async getPurchaseOrderById(poId) {
    try {
      if (!poId) {
        return {
          success: false,
          message: 'POID is required for SELECT',
          data: null,
          poId: null
        };
      }

      const purchaseOrderData = { POID: poId };
      const result = await this.#executeManageStoredProcedure('SELECT', purchaseOrderData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        poId: poId
      };
    } catch (error) {
      console.error('Error in getPurchaseOrderById:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poId: poId
      };
    }
  }

  static async createPurchaseOrder(purchaseOrderData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesOrderID', 'CreatedByID'];
      const missingFields = requiredFields.filter(field => !purchaseOrderData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          poId: null
        };
      }

      const fkErrors = await this.#validateForeignKeys(purchaseOrderData, 'INSERT');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          poId: null
        };
      }

      const queryParams = [
        'INSERT',
        null,
        purchaseOrderData.SalesOrderID ? parseInt(purchaseOrderData.SalesOrderID) : null,
        purchaseOrderData.CreatedByID ? parseInt(purchaseOrderData.CreatedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageFULLPO(?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? 'Purchase Order created successfully' : 'Operation failed'),
        data: null,
        poId: result[0] && result[0][0] ? result[0][0].POID : null
      };
    } catch (error) {
      console.error('Database error in createPurchaseOrder:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        poId: null
      };
    }
  }

  static async getAllPurchaseOrders({ pageNumber = 1, pageSize = 10, fromDate = null, toDate = null }) {
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
        'CALL SP_GetAllPO(?, ?, ?, ?, @p_Result, @p_Message)',
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
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? 'Purchase orders retrieved successfully' : 'Operation failed'),
        data: results[0] || [],
        totalRecords: totalRecords
      };
    } catch (error) {
      console.error('Error in getAllPurchaseOrders:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: [],
        totalRecords: 0
      };
    }
  }

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

  static async #checkPOStatus(POID) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT Status
        FROM dbo_tblpo
        WHERE POID = ? AND IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(POID)]);
      if (result.length === 0) {
        return { exists: false, status: null };
      }
      return { exists: true, status: result[0].Status };
    } catch (error) {
      throw new Error(`Error checking PO status: ${error.message}`);
    }
  }

  static async #insertPOApproval(connection, approvalData) {
    try {
      const query = `
        INSERT INTO dbo_tblpoapproval (
         POID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
        ) VALUES (
          ?, ?, ?, NOW(), ?, NOW(), 0
        );
      `;
      const [result] = await connection.query(query, [
        parseInt(approvalData.POID),
        parseInt(approvalData.ApproverID),
        1,
        parseInt(approvalData.ApproverID)
      ]);
      console.log(`Insert Debug: POID=${approvalData.POID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
      return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error inserting Purchase Order approval: ${error.message}`);
    }
  }

  static async approvePO(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const requiredFields = ['POID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        throw new Error(`${missingFields.join(', ')} are required`);
      }

      const POID = parseInt(approvalData.POID);
      const approverID = parseInt(approvalData.ApproverID);
      if (isNaN(POID) || isNaN(approverID)) {
        throw new Error('Invalid POID or ApproverID');
      }

      const formName = 'Purchase Order';
      const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
      if (!hasPermission) {
        throw new Error('Approver does not have permission to approve this form');
      }

      const { exists, status } = await this.#checkPOStatus(POID);
      if (!exists) {
        throw new Error('Purchase Order does not exist or has been deleted');
      }
      if (status !== 'Pending') {
        throw new Error(`Purchase Order status must be Pending to approve, current status: ${status}`);
      }

      // Check for existing approval
      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblpoapproval WHERE POID = ? AND ApproverID = ? AND IsDeleted = 0',
        [POID, approverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('Approver has already approved this Purchase Order');
      }

      // Record approval
      const approvalInsertResult = await this.#insertPOApproval(connection, { POID: POID, ApproverID: approverID });
      if (!approvalInsertResult.success) {
        throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
      }

      // Get FormID
      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Purchase Order');
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
         FROM dbo_tblpoapproval s
         WHERE s.POID = ? AND s.IsDeleted = 0
           AND s.ApproverID IN (
             SELECT DISTINCT fra.UserID
             FROM dbo_tblformroleapprover fra
             JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
             WHERE fr.FormID = ? AND fra.ActiveYN = 1
           )`,
        [POID, formID]
      );
      const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

      // Check for mismatched ApproverIDs
      const [allApprovals] = await connection.query(
        'SELECT ApproverID FROM dbo_tblpoapproval WHERE POID = ? AND IsDeleted = 0',
        [POID]
      );
      const requiredUserIDs = requiredApproversList.map(a => a.UserID);
      const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

      // Debug logs
      console.log(`Approval Debug: POID=${POID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        // All approvals complete
        await connection.query(
          'UPDATE dbo_tblpo SET Status = ? WHERE POID = ?',
          ['Approved', POID]
        );
        message = 'Purchase Order fully approved.';
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
        POID: POID.toString(),
        newPOID: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approvePurchaseOrder:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        POID: approvalData.POID.toString(),
        newPOID: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

     static async getPoApprovalStatus(POID) {
    try {
      const pool = await poolPromise;
      const formName = 'Purchase Order';

      // Get FormID
      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Purchase Order');
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
         FROM dbo_tblpoapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.POID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(POID), formID]
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
          POID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        POID: POID.toString(),
        newPOID: null
      };
    } catch (error) {
      console.error('Error in getPurchaseOrderApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }

}

module.exports = PurchaseOrderModel;
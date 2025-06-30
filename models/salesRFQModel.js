const poolPromise = require('../config/db.config');

class SalesRFQModel {
  static async #executeManageStoredProcedure(action, salesRFQData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        salesRFQData.SalesRFQID ? parseInt(salesRFQData.SalesRFQID) : null,
        salesRFQData.Series || null,
        salesRFQData.CompanyID ? parseInt(salesRFQData.CompanyID) : null,
        salesRFQData.CustomerID ? parseInt(salesRFQData.CustomerID) : null,
        salesRFQData.SupplierID ? parseInt(salesRFQData.SupplierID) : null,
        salesRFQData.ExternalRefNo || null,
        salesRFQData.ExternalSupplierID ? parseInt(salesRFQData.ExternalSupplierID) : null,
        salesRFQData.DeliveryDate ? new Date(salesRFQData.DeliveryDate) : null,
        salesRFQData.PostingDate ? new Date(salesRFQData.PostingDate) : null,
        salesRFQData.RequiredByDate ? new Date(salesRFQData.RequiredByDate) : null,
        salesRFQData.DateReceived ? new Date(salesRFQData.DateReceived) : null,
        salesRFQData.ServiceTypeID ? parseInt(salesRFQData.ServiceTypeID) : null,
        salesRFQData.OriginWarehouseAddressID ? parseInt(salesRFQData.OriginWarehouseAddressID) : null,
        salesRFQData.CollectionAddressID ? parseInt(salesRFQData.CollectionAddressID) : null,
        salesRFQData.DestinationWarehouseAddressID ? parseInt(salesRFQData.DestinationWarehouseAddressID) : null,
        salesRFQData.Status || null,
        salesRFQData.DestinationAddressID ? parseInt(salesRFQData.DestinationAddressID) : null,
        salesRFQData.BillingAddressID ? parseInt(salesRFQData.BillingAddressID) : null,
        salesRFQData.ShippingPriorityID ? parseInt(salesRFQData.ShippingPriorityID) : null,
        salesRFQData.Terms || null,
        salesRFQData.CurrencyID ? parseInt(salesRFQData.CurrencyID) : null,
        salesRFQData.CollectFromSupplierYN != null ? salesRFQData.CollectFromSupplierYN : 0,
        salesRFQData.PackagingRequiredYN != null ? salesRFQData.PackagingRequiredYN : 0,
        salesRFQData.FormCompletedYN != null ? salesRFQData.FormCompletedYN : 0,
        salesRFQData.CreatedByID ? parseInt(salesRFQData.CreatedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesRFQ(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_NewSalesRFQID, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_NewSalesRFQID AS newSalesRFQId, @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0]?.[0] || null : null,
        salesRFQId: salesRFQData.SalesRFQID,
        newSalesRFQId: outParams.newSalesRFQId
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #executeGetAllStoredProcedure(paginationData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        parseInt(paginationData.PageNumber) || 1,
        parseInt(paginationData.PageSize) || 10,
        paginationData.FromDate ? new Date(paginationData.FromDate) : null,
        paginationData.ToDate ? new Date(paginationData.ToDate) : null
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllSalesRFQs(?, ?, ?, ?, @totalRecords)',
        queryParams
      );

      const [[{ totalRecords }]] = await pool.query('SELECT @totalRecords AS totalRecords');

      return {
        success: true,
        message: 'SalesRFQ records retrieved successfully.',
        data: result[0] || [],
        totalRecords: totalRecords || 0,
        salesRFQId: null,
        newSalesRFQId: null
      };
    } catch (error) {
      console.error('Database error in SP_GetAllSalesRFQs:', error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(salesRFQData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (salesRFQData.CompanyID) {
        const [companyCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcompany WHERE CompanyID = ?',
          [parseInt(salesRFQData.CompanyID)]
        );
        if (companyCheck.length === 0) errors.push(`CompanyID ${salesRFQData.CompanyID} does not exist`);
      }
      if (salesRFQData.CustomerID) {
        const [customerCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcustomer WHERE CustomerID = ?',
          [parseInt(salesRFQData.CustomerID)]
        );
        if (customerCheck.length === 0) errors.push(`CustomerID ${salesRFQData.CustomerID} does not exist`);
      }
      if (salesRFQData.SupplierID) {
        const [supplierCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsupplier WHERE SupplierID = ?',
          [parseInt(salesRFQData.SupplierID)]
        );
        if (supplierCheck.length === 0) errors.push(`SupplierID ${salesRFQData.SupplierID} does not exist`);
      }
      if (salesRFQData.ExternalSupplierID) {
        const [extSupplierCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsupplier WHERE SupplierID = ?',
          [parseInt(salesRFQData.ExternalSupplierID)]
        );
        if (extSupplierCheck.length === 0) errors.push(`ExternalSupplierID ${salesRFQData.ExternalSupplierID} does not exist`);
      }
      if (salesRFQData.ServiceTypeID) {
        const [serviceTypeCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblservicetype WHERE ServiceTypeID = ?',
          [parseInt(salesRFQData.ServiceTypeID)]
        );
        if (serviceTypeCheck.length === 0) errors.push(`ServiceTypeID ${salesRFQData.ServiceTypeID} does not exist`);
      }
      if (salesRFQData.OriginAddressID) {
        const [originAddressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ?',
          [parseInt(salesRFQData.OriginAddressID)]
        );
        if (originAddressCheck.length === 0) errors.push(`OriginAddressID ${salesRFQData.OriginAddressID} does not exist`);
      }
      if (salesRFQData.CollectionAddressID) {
        const [collectionAddressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ?',
          [parseInt(salesRFQData.CollectionAddressID)]
        );
        if (collectionAddressCheck.length === 0) errors.push(`CollectionAddressID ${salesRFQData.CollectionAddressID} does not exist`);
      }
      if (salesRFQData.DestinationAddressID) {
        const [destinationAddressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ?',
          [parseInt(salesRFQData.DestinationAddressID)]
        );
        if (destinationAddressCheck.length === 0) errors.push(`DestinationAddressID ${salesRFQData.DestinationAddressID} does not exist`);
      }
      if (salesRFQData.BillingAddressID) {
        const [billingAddressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ?',
          [parseInt(salesRFQData.BillingAddressID)]
        );
        if (billingAddressCheck.length === 0) errors.push(`BillingAddressID ${salesRFQData.BillingAddressID} does not exist`);
      }
      if (salesRFQData.ShippingPriorityID) {
        const [shippingPriorityCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblmailingpriority WHERE MailingPriorityID = ?',
          [parseInt(salesRFQData.ShippingPriorityID)]
        );
        if (shippingPriorityCheck.length === 0) errors.push(`ShippingPriorityID ${salesRFQData.ShippingPriorityID} does not exist`);
      }
      if (salesRFQData.CurrencyID) {
        const [currencyCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcurrency WHERE CurrencyID = ? AND IsDeleted = 0',
          [parseInt(salesRFQData.CurrencyID)]
        );
        if (currencyCheck.length === 0) errors.push(`CurrencyID ${salesRFQData.CurrencyID} does not exist or is deleted`);
      }
      if (salesRFQData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(salesRFQData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${salesRFQData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE' && salesRFQData.CreatedByID) {
      const [createdByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
        [parseInt(salesRFQData.CreatedByID)]
      );
      if (createdByCheck.length === 0) errors.push(`CreatedByID ${salesRFQData.CreatedByID} does not exist`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
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

  static async #checkSalesRFQStatus(salesRFQID) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT Status 
        FROM dbo_tblsalesrfq 
        WHERE SalesRFQID = ? AND IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(salesRFQID)]);
      if (result.length === 0) {
        return { exists: false, status: null };
      }
      return { exists: true, status: result[0].Status };
    } catch (error) {
      throw new Error(`Error checking SalesRFQ status: ${error.message}`);
    }
  }

  static async #insertSalesRFQApproval(connection, approvalData) {
    try {
      const query = `
        INSERT INTO dbo_tblsalesrfqapproval (
          SalesRFQID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
        ) VALUES (
          ?, ?, ?, NOW(), ?, NOW(), 0
        );
      `;
      const [result] = await connection.query(query, [
        parseInt(approvalData.SalesRFQID),
        parseInt(approvalData.ApproverID),
        1,
        parseInt(approvalData.ApproverID)
      ]);
      console.log(`Insert Debug: SalesRFQID=${approvalData.SalesRFQID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
      return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error inserting SalesRFQ approval: ${error.message}`);
    }
  }

  static async approveSalesRFQ(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const requiredFields = ['SalesRFQID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        throw new Error(`${missingFields.join(', ')} are required`);
      }

      const salesRFQID = parseInt(approvalData.SalesRFQID);
      const approverID = parseInt(approvalData.ApproverID);
      if (isNaN(salesRFQID) || isNaN(approverID)) {
        throw new Error('Invalid SalesRFQID or ApproverID');
      }

      const formName = 'Sales RFQ';
      const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
      if (!hasPermission) {
        throw new Error('Approver does not have permission to approve this form');
      }

      const { exists, status } = await this.#checkSalesRFQStatus(salesRFQID);
      if (!exists) {
        throw new Error('SalesRFQ does not exist or has been deleted');
      }
      if (status !== 'Pending') {
        throw new Error(`SalesRFQ status must be Pending to approve, current status: ${status}`);
      }

      // Check for existing approval
      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblsalesrfqapproval WHERE SalesRFQID = ? AND ApproverID = ? AND IsDeleted = 0',
        [salesRFQID, approverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('Approver has already approved this SalesRFQ');
      }

      // Record approval within the same transaction
      const approvalInsertResult = await this.#insertSalesRFQApproval(connection, { SalesRFQID: salesRFQID, ApproverID: approverID });
      if (!approvalInsertResult.success) {
        throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
      }

      // Get FormID
      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Sales RFQ');
      }
      const formID = form[0].FormID;

      // Get required approvers (distinct UserID)
      const [requiredApproversList] = await connection.query(
        `SELECT DISTINCT fra.UserID, p.FirstName
         FROM dbo_tblformroleapprover fra
         JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
         JOIN dbo_tblperson p ON fra.UserID = p.PersonID
         WHERE fr.FormID = ? AND fra.ActiveYN = 1`,
        [formID]
      );
      const requiredCount = requiredApproversList.length;

      // Get completed approvals, only counting those from required approvers
      const [approvedList] = await connection.query(
        `SELECT s.ApproverID, s.ApprovedYN
         FROM dbo_tblsalesrfqapproval s
         WHERE s.SalesRFQID = ? AND s.IsDeleted = 0
           AND s.ApproverID IN (
             SELECT DISTINCT fra.UserID 
             FROM dbo_tblformroleapprover fra 
             JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
             WHERE fr.FormID = ? AND fra.ActiveYN = 1
           )`,
        [salesRFQID, formID]
      );
      const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

      // Check for mismatched ApproverIDs
      const [allApprovals] = await connection.query(
        'SELECT ApproverID FROM dbo_tblsalesrfqapproval WHERE SalesRFQID = ? AND IsDeleted = 0',
        [salesRFQID]
      );
      const requiredUserIDs = requiredApproversList.map(a => a.UserID);
      const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

      // Debug logs
      console.log(`Approval Debug: SalesRFQID=${salesRFQID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        // All approvals complete
        await connection.query(
          'UPDATE dbo_tblsalesrfq SET Status = ? WHERE SalesRFQID = ?',
          ['Approved', salesRFQID]
        );
        message = 'SalesRFQ fully approved.';
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
        salesRFQId: salesRFQID.toString(),
        newSalesRFQId: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approveSalesRFQ:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        salesRFQId: approvalData.SalesRFQID.toString(),
        newSalesRFQId: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  
  static async createSalesRFQ(salesRFQData) {
    const requiredFields = ['CompanyID', 'CustomerID', 'CreatedByID'];
    const missingFields = requiredFields.filter(field => !salesRFQData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      };
    }

    salesRFQData.Status = salesRFQData.Status || 'Pending';

    const fkErrors = await this.#validateForeignKeys(salesRFQData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', salesRFQData);
  }

  static async updateSalesRFQ(salesRFQData) {
    if (!salesRFQData.SalesRFQID) {
      return {
        success: false,
        message: 'SalesRFQID is required for UPDATE',
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(salesRFQData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        salesRFQId: salesRFQData.SalesRFQID,
        newSalesRFQId: null
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', salesRFQData);
  }

  static async deleteSalesRFQ(salesRFQData) {
    if (!salesRFQData.SalesRFQID) {
      return {
        success: false,
        message: 'SalesRFQID is required for DELETE',
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(salesRFQData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        salesRFQId: salesRFQData.SalesRFQID,
        newSalesRFQId: null
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', salesRFQData);
  }

  static async getSalesRFQ(salesRFQData) {
    if (!salesRFQData.SalesRFQID) {
      return {
        success: false,
        message: 'SalesRFQID is required for SELECT',
        data: null,
        salesRFQId: null,
        newSalesRFQId: null
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', salesRFQData);
  }

  static async getAllSalesRFQs(paginationData) {
    return await this.#executeGetAllStoredProcedure(paginationData);
  }

  static async getSalesRFQApprovalStatus(salesRFQID) {
    try {
      const pool = await poolPromise;
      const formName = 'Sales RFQ';

      // Get FormID
      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Sales RFQ');
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
         FROM dbo_tblsalesrfqapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.SalesRFQID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(salesRFQID), formID]
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
          salesRFQID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        salesRFQId: salesRFQID.toString(),
        newSalesRFQId: null
      };
    } catch (error) {
      console.error('Error in getSalesRFQApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = SalesRFQModel;
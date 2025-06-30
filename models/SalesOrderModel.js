const poolPromise = require('../config/db.config');

class SalesOrderModel {
  static async #executeManageStoredProcedure(action, salesOrderData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        salesOrderData.SalesOrderID ? parseInt(salesOrderData.SalesOrderID) : null,
        salesOrderData.SalesQuotationID ? parseInt(salesOrderData.SalesQuotationID) : null,
        salesOrderData.SalesRFQID ? parseInt(salesOrderData.SalesRFQID) : null,
        salesOrderData.CompanyID ? parseInt(salesOrderData.CompanyID) : null,
        salesOrderData.CustomerID ? parseInt(salesOrderData.CustomerID) : null,
        salesOrderData.SupplierID ? parseInt(salesOrderData.SupplierID) : null,
        salesOrderData.OriginAddressID ? parseInt(salesOrderData.OriginAddressID) : null,
        salesOrderData.DestinationAddressID ? parseInt(salesOrderData.DestinationAddressID) : null,
        salesOrderData.BillingAddressID ? parseInt(salesOrderData.BillingAddressID) : null,
        salesOrderData.CollectionAddressID ? parseInt(salesOrderData.CollectionAddressID) : null,
        salesOrderData.ShippingPriorityID ? parseInt(salesOrderData.ShippingPriorityID) : null,
        salesOrderData.PackagingRequiredYN !== undefined ? (salesOrderData.PackagingRequiredYN ? 1 : 0) : null,
        salesOrderData.CollectFromSupplierYN !== undefined ? (salesOrderData.CollectFromSupplierYN ? 1 : 0) : null,
        salesOrderData.Terms || null,
        salesOrderData.PostingDate || null,
        salesOrderData.DeliveryDate || null,
        salesOrderData.RequiredByDate || null,
        salesOrderData.DateReceived || null,
        salesOrderData.ServiceTypeID ? parseInt(salesOrderData.ServiceTypeID) : null,
        salesOrderData.ExternalRefNo || null,
        salesOrderData.ExternalSupplierID ? parseInt(salesOrderData.ExternalSupplierID) : null,
        salesOrderData.OrderStatusID ? parseInt(salesOrderData.OrderStatusID) : null,
        salesOrderData.ApplyTaxWithholdingAmount !== undefined ? (salesOrderData.ApplyTaxWithholdingAmount ? 1 : 0) : null,
        salesOrderData.CurrencyID ? parseInt(salesOrderData.CurrencyID) : null,
        salesOrderData.SalesAmount ? parseFloat(salesOrderData.SalesAmount) : null,
        salesOrderData.TaxesAndOtherCharges ? parseFloat(salesOrderData.TaxesAndOtherCharges) : null,
        salesOrderData.Total ? parseFloat(salesOrderData.Total) : null,
        salesOrderData.FormCompletedYN !== undefined ? (salesOrderData.FormCompletedYN ? 1 : 0) : null,
        salesOrderData.FileName || null,
        salesOrderData.FileContent || null,
        salesOrderData.ChangedByID ? parseInt(salesOrderData.ChangedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesOrder_RUD(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0] || [] : null,
        salesOrderId: salesOrderData.SalesOrderID
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(salesOrderData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'UPDATE') {
      if (salesOrderData.SalesQuotationID) {
        const [salesQuotationCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesquotation WHERE SalesQuotationID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.SalesQuotationID)]
        );
        if (salesQuotationCheck.length === 0) errors.push(`SalesQuotationID ${salesOrderData.SalesQuotationID} does not exist`);
      }
      if (salesOrderData.SalesRFQID) {
        const [salesRFQCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesrfq WHERE SalesRFQID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.SalesRFQID)]
        );
        if (salesRFQCheck.length === 0) errors.push(`SalesRFQID ${salesOrderData.SalesRFQID} does not exist`);
      }
      if (salesOrderData.CompanyID) {
        const [companyCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcompany WHERE CompanyID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.CompanyID)]
        );
        if (companyCheck.length === 0) errors.push(`CompanyID ${salesOrderData.CompanyID} does not exist`);
      }
      if (salesOrderData.CustomerID) {
        const [customerCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcustomer WHERE CustomerID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.CustomerID)]
        );
        if (customerCheck.length === 0) errors.push(`CustomerID ${salesOrderData.CustomerID} does not exist`);
      }
      if (salesOrderData.SupplierID) {
        const [supplierCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsupplier WHERE SupplierID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.SupplierID)]
        );
        if (supplierCheck.length === 0) errors.push(`SupplierID ${salesOrderData.SupplierID} does not exist`);
      }
      if (salesOrderData.OriginAddressID) {
        const [addressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.OriginAddressID)]
        );
        if (addressCheck.length === 0) errors.push(`OriginAddressID ${salesOrderData.OriginAddressID} does not exist`);
      }
      if (salesOrderData.DestinationAddressID) {
        const [addressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.DestinationAddressID)]
        );
        if (addressCheck.length === 0) errors.push(`DestinationAddressID ${salesOrderData.DestinationAddressID} does not exist`);
      }
      if (salesOrderData.BillingAddressID) {
        const [addressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.BillingAddressID)]
        );
        if (addressCheck.length === 0) errors.push(`BillingAddressID ${salesOrderData.BillingAddressID} does not exist`);
      }
      if (salesOrderData.CollectionAddressID) {
        const [addressCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbladdresses WHERE AddressID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.CollectionAddressID)]
        );
        if (addressCheck.length === 0) errors.push(`CollectionAddressID ${salesOrderData.CollectionAddressID} does not exist`);
      }
      if (salesOrderData.ShippingPriorityID) {
        const [priorityCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblmailingpriority WHERE MailingPriorityID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.ShippingPriorityID)]
        );
        if (priorityCheck.length === 0) errors.push(`ShippingPriorityID ${salesOrderData.ShippingPriorityID} does not exist`);
      }
      if (salesOrderData.ServiceTypeID) {
        const [serviceTypeCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblservicetype WHERE ServiceTypeID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.ServiceTypeID)]
        );
        if (serviceTypeCheck.length === 0) errors.push(`ServiceTypeID ${salesOrderData.ServiceTypeID} does not exist`);
      }
      if (salesOrderData.ExternalSupplierID) {
        const [externalSupplierCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsupplier WHERE SupplierID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.ExternalSupplierID)]
        );
        if (externalSupplierCheck.length === 0) errors.push(`ExternalSupplierID ${salesOrderData.ExternalSupplierID} does not exist`);
      }
      if (salesOrderData.OrderStatusID) {
        const [statusCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblorderstatus WHERE OrderStatusID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.OrderStatusID)]
        );
        if (statusCheck.length === 0) errors.push(`OrderStatusID ${salesOrderData.OrderStatusID} does not exist`);
      }
      if (salesOrderData.CurrencyID) {
        const [currencyCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblcurrency WHERE CurrencyID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.CurrencyID)]
        );
        if (currencyCheck.length === 0) errors.push(`CurrencyID ${salesOrderData.CurrencyID} does not exist`);
      }
      if (salesOrderData.ChangedByID) {
        const [changedByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(salesOrderData.ChangedByID)]
        );
        if (changedByCheck.length === 0) errors.push(`ChangedByID ${salesOrderData.ChangedByID} does not exist`);
      }
    }

    if (action === 'DELETE' && salesOrderData.ChangedByID) {
      const [changedByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
        [parseInt(salesOrderData.ChangedByID)]
      );
      if (changedByCheck.length === 0) errors.push(`ChangedByID ${salesOrderData.ChangedByID} does not exist`);
    }

    if (action === 'INSERT') {
      if (salesOrderData.SalesQuotationID) {
        const [salesQuotationCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesquotation WHERE SalesQuotationID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.SalesQuotationID)]
        );
        if (salesQuotationCheck.length === 0) errors.push(`SalesQuotationID ${salesOrderData.SalesQuotationID} does not exist`);
      }
      if (salesOrderData.ShippingPriorityID) {
        const [priorityCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblmailingpriority WHERE MailingPriorityID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(salesOrderData.ShippingPriorityID)]
        );
        if (priorityCheck.length === 0) errors.push(`ShippingPriorityID ${salesOrderData.ShippingPriorityID} does not exist`);
      }
      if (salesOrderData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(salesOrderData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${salesOrderData.CreatedByID} does not exist`);
      }
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async getSalesOrderById(salesOrderId) {
    try {
      if (!salesOrderId) {
        return {
          success: false,
          message: 'SalesOrderID is required for SELECT',
          data: null,
          salesOrderId: null
        };
      }

      const salesOrderData = { SalesOrderID: salesOrderId };
      const result = await this.#executeManageStoredProcedure('SELECT', salesOrderData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        salesOrderId: salesOrderId
      };
    } catch (error) {
      console.error('Error in getSalesOrderById:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesOrderId: salesOrderId
      };
    }
  }

  static async updateSalesOrder(salesOrderData) {
    if (!salesOrderData.SalesOrderID) {
      return {
        success: false,
        message: 'SalesOrderID is required for UPDATE',
        data: null,
        salesOrderId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(salesOrderData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        salesOrderId: salesOrderData.SalesOrderID
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', salesOrderData);
  }

  static async deleteSalesOrder(salesOrderData) {
    if (!salesOrderData.SalesOrderID) {
      return {
        success: false,
        message: 'SalesOrderID is required for DELETE',
        data: null,
        salesOrderId: null
      };
    }

    const fkErrors = await this.#validateForeignKeys(salesOrderData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        salesOrderId: salesOrderData.SalesOrderID
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', salesOrderData);
  }

  static async createSalesOrder(salesOrderData) {
    try {
      const pool = await poolPromise;

      const requiredFields = ['SalesQuotationID', 'CreatedByID'];
      const missingFields = requiredFields.filter(field => !salesOrderData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesOrderId: null,
          newSalesOrderId: null
        };
      }

      const fkErrors = await this.#validateForeignKeys(salesOrderData, 'INSERT');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          salesOrderId: null,
          newSalesOrderId: null
        };
      }

      const queryParams = [
        salesOrderData.SalesQuotationID ? parseInt(salesOrderData.SalesQuotationID) : null,
        salesOrderData.CreatedByID ? parseInt(salesOrderData.CreatedByID) : null,
        salesOrderData.ShippingPriorityID ? parseInt(salesOrderData.ShippingPriorityID) : null,
        salesOrderData.PostingDate || null
      ];

      const [result] = await pool.query(
        'CALL SP_InsertSalesOrderAndParcels(?, ?, ?, ?, @p_NewSalesOrderID, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_NewSalesOrderID AS newSalesOrderId, @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? 'Sales Order created successfully' : 'Operation failed'),
        data: null,
        salesOrderId: null,
        newSalesOrderId: outParams.newSalesOrderId ? parseInt(outParams.newSalesOrderId) : null
      };
    } catch (error) {
      console.error('Database error in createSalesOrder:', error);
      return {
        success: false,
        message: `Database error: ${error.message || 'Unknown error'}`,
        data: null,
        salesOrderId: null,
        newSalesOrderId: null
      };
    }
  }

  static async getAllSalesOrders({ pageNumber = 1, pageSize = 10, sortColumn = 'CreatedDateTime', sortDirection = 'DESC', fromDate = null, toDate = null }) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        pageNumber,
        pageSize,
        sortColumn,
        sortDirection,
        fromDate || null,
        toDate || null
      ];

      const [result] = await pool.query(
        'CALL SP_GetAllSalesOrder(?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      console.log('SP_GetAllSalesOrder result:', JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (!Array.isArray(result) || result.length < 2) {
        throw new Error('Unexpected result structure from SP_GetAllSalesOrder');
      }

      const salesOrders = result[0] || [];
      const totalRecords = result[1][0]?.TotalRecords || 0;

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? 'Sales orders retrieved successfully' : 'Operation failed'),
        data: salesOrders,
        totalRecords: totalRecords
      };
    } catch (error) {
      console.error('Error in getAllSalesOrders:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: [],
        totalRecords: 0
      };
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
  static async #checkSalesOrderStatus(SalesOrderID) {
    try {
      const pool = await poolPromise;
      const query = `
        SELECT Status
        FROM dbo_tblsalesorder
        WHERE SalesOrderID = ? AND IsDeleted = 0;
      `;
      const [result] = await pool.query(query, [parseInt(SalesOrderID)]);
      if (result.length === 0) {
        return { exists: false, status: null };
      }
      return { exists: true, status: result[0].Status };
    } catch (error) {
      throw new Error(`Error checking Sales Order status: ${error.message}`);
    }
  }

  // Helper: Insert approval record
  static async #insertSalesOrderApproval(connection, approvalData) {
    try {
      const query = `
        INSERT INTO dbo_tblsalesorderapproval (
         SalesOrderID, ApproverID, ApprovedYN, ApproverDateTime, CreatedByID, CreatedDateTime, IsDeleted
        ) VALUES (
          ?, ?, ?, NOW(), ?, NOW(), 0
        );
      `;
      const [result] = await connection.query(query, [
        parseInt(approvalData.SalesOrderID),
        parseInt(approvalData.ApproverID),
        1,
        parseInt(approvalData.ApproverID)
      ]);
      console.log(`Insert Debug: SalesOrderID=${approvalData.SalesOrderID}, ApproverID=${approvalData.ApproverID}, InsertedID=${result.insertId}`);
      return { success: true, message: 'Approval record inserted successfully.', insertId: result.insertId };
    } catch (error) {
      throw new Error(`Error inserting Sales Order approval: ${error.message}`);
    }
  }

  // Approve a Supplier Quotation
  static async approveSalesOrder(approvalData) {
    let connection;
    try {
      const pool = await poolPromise;
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const requiredFields = ['SalesOrderID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        throw new Error(`${missingFields.join(', ')} are required`);
      }

      const SalesOrderID = parseInt(approvalData.SalesOrderID);
      const approverID = parseInt(approvalData.ApproverID);
      if (isNaN(SalesOrderID) || isNaN(approverID)) {
        throw new Error('Invalid SalesOrderID or ApproverID');
      }

      const formName = 'Sales Order';
      const hasPermission = await this.#checkFormRoleApproverPermission(approverID, formName);
      if (!hasPermission) {
        throw new Error('Approver does not have permission to approve this form');
      }

      const { exists, status } = await this.#checkSalesOrderStatus(SalesOrderID);
      if (!exists) {
        throw new Error('Sales Order does not exist or has been deleted');
      }
      if (status !== 'Pending') {
        throw new Error(`Sales Order status must be Pending to approve, current status: ${status}`);
      }

      // Check for existing approval
      const [existingApproval] = await connection.query(
        'SELECT 1 FROM dbo_tblsalesorderapproval WHERE SalesOrderID = ? AND ApproverID = ? AND IsDeleted = 0',
        [SalesOrderID, approverID]
      );
      if (existingApproval.length > 0) {
        throw new Error('Approver has already approved this Sales Order');
      }

      // Record approval
      const approvalInsertResult = await this.#insertSalesOrderApproval(connection, { SalesOrderID: SalesOrderID, ApproverID: approverID });
      if (!approvalInsertResult.success) {
        throw new Error(`Failed to insert approval record: ${approvalInsertResult.message}`);
      }

      // Get FormID
      const [form] = await connection.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for Sales Order');
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
         FROM dbo_tblsalesorderapproval s
         WHERE s.SalesOrderID = ? AND s.IsDeleted = 0
           AND s.ApproverID IN (
             SELECT DISTINCT fra.UserID
             FROM dbo_tblformroleapprover fra
             JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID
             WHERE fr.FormID = ? AND fra.ActiveYN = 1
           )`,
        [SalesOrderID, formID]
      );
      const approved = approvedList.filter(a => a.ApprovedYN === 1).length;

      // Check for mismatched ApproverIDs
      const [allApprovals] = await connection.query(
        'SELECT ApproverID FROM dbo_tblsalesorderapproval WHERE SalesOrderID = ? AND IsDeleted = 0',
        [SalesOrderID]
      );
      const requiredUserIDs = requiredApproversList.map(a => a.UserID);
      const mismatchedApprovals = allApprovals.filter(a => !requiredUserIDs.includes(a.ApproverID));

      // Debug logs
      console.log(`Approval Debug: SalesOrderID=${SalesOrderID}, FormID=${formID}, RequiredApprovers=${requiredCount}, Approvers=${JSON.stringify(requiredApproversList)}, CompletedApprovals=${approved}, ApprovedList=${JSON.stringify(approvedList)}, CurrentApproverID=${approverID}, MismatchedApprovals=${JSON.stringify(mismatchedApprovals)}`);

      let message;
      let isFullyApproved = false;

      if (approved >= requiredCount) {
        // All approvals complete
        await connection.query(
          'UPDATE dbo_tblsalesorder SET Status = ? WHERE SalesOrderID = ?',
          ['Approved', SalesOrderID]
        );
        message = 'Sales Order fully approved.';
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
        SalesOrderID: SalesOrderID.toString(),
        newSalesOrderID: null,
        isFullyApproved
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Database error in approveSalesOrder:', error);
      return {
        success: false,
        message: `Approval failed: ${error.message || 'Unknown error'}`,
        data: null,
        SalesOrderID: approvalData.SalesOrderID.toString(),
        newSalesOrderID: null
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

   static async getSalesOrderApprovalStatus(SalesOrderID) {
    try {
      const pool = await poolPromise;
      const formName = 'Sales Order';

      // Get FormID
      const [form] = await pool.query(
        'SELECT FormID FROM dbo_tblform WHERE FormName = ? AND IsDeleted = 0',
        [formName]
      );
      if (!form.length) {
        throw new Error('Invalid FormID for SalesOrder');
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
         FROM dbo_tblsalesorderapproval s
         JOIN dbo_tblperson p ON s.ApproverID = p.PersonID
         WHERE s.SalesOrderID = ? AND s.IsDeleted = 0 AND s.ApprovedYN = 1
         AND s.ApproverID IN (
           SELECT DISTINCT fra.UserID 
           FROM dbo_tblformroleapprover fra 
           JOIN dbo_tblformrole fr ON fra.FormRoleID = fr.FormRoleID 
           WHERE fr.FormID = ? AND fra.ActiveYN = 1
         )`,
        [parseInt(SalesOrderID), formID]
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
          SalesOrderID,
          requiredApprovers: requiredApprovers.length,
          completedApprovals: completedApprovals.length,
          approvalStatus
        },
        SalesOrderID: SalesOrderID.toString(),
        newSalesOrderID: null
      };
    } catch (error) {
      console.error('Error in getSalesOrderApprovalStatus:', error);
      throw new Error(`Error retrieving approval status: ${error.message}`);
    }
  }
}

module.exports = SalesOrderModel;
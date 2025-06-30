const poolPromise = require('../config/db.config');

class SalesQuotationModel {
  // Get all Sales Quotations
  static async getAllSalesQuotations({
    pageNumber = 1,
    pageSize = 10,
    sortColumn = 'SalesQuotationID',
    sortDirection = 'ASC',
    fromDate = null,
    toDate = null,
    status = null,
    customerId = null,
    supplierId = null
  }) {
    try {
      const pool = await poolPromise;

      // Validate parameters
      const queryParams = [
        pageNumber > 0 ? pageNumber : 1,
        pageSize > 0 ? pageSize : 10,
        sortColumn || 'SalesQuotationID',
        sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        fromDate || null,
        toDate || null,
        status || null,
        customerId ? parseInt(customerId) : null,
        supplierId ? parseInt(supplierId) : null
      ];

      // Call SP_GetAllSalesQuotation
      const [result] = await pool.query(
        'CALL SP_GetAllSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, @p_TotalRecords)',
        queryParams
      );

      // Retrieve OUT parameter
      const [[{ totalRecords }]] = await pool.query('SELECT @p_TotalRecords AS totalRecords');

      return {
        data: result[0],
        totalRecords: totalRecords || 0
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Create a new Sales Quotation
  static async createSalesQuotation(data) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'INSERT',
        null, // p_SalesQuotationID
        data.SalesRFQID || null,
        data.PurchaseRFQID,
        data.supplierId || null,
        data.Status || 'Pending',
        data.originWarehouseAddressId || null,
        data.collectionAddressId || null,
        data.billingAddressId || null,
        data.destinationAddressId || null,
        data.destinationWarehouseAddressId || null,
        data.collectionWarehouseId || null,
        data.postingDate || null,
        data.deliveryDate || null,
        data.requiredByDate || null,
        data.dateReceived || null,
        data.serviceTypeId || null,
        data.externalRefNo || null,
        data.externalSupplierId || null,
        data.customerId || null,
        data.companyId || null,
        data.terms || null,
        data.packagingRequiredYN || 0,
        data.collectFromSupplierYN || 0,
        data.salesQuotationCompletedYN || 0,
        data.shippingPriorityId || null,
        data.validTillDate || null,
        data.currencyId || null,
        data.supplierContactPersonId || null,
        data.isDeliveryOnly || 0,
        data.taxesAndOtherCharges || 0,
        data.CreatedByID,
        null // p_DeletedByID
      ];

      // Call SP_ManageSalesQuotation
      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
        queryParams
      );

      // Retrieve OUT parameters
      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewSalesQuotationID AS newSalesQuotationId'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to create Sales Quotation');
      }

      return {
        newSalesQuotationId: outParams.newSalesQuotationId,
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
        null, // p_SalesRFQID
        null, // p_PurchaseRFQID
        null, // p_SupplierID
        null, // p_Status
        null, // p_OriginAddressID
        null, // p_CollectionAddressID
        null, // p_BillingAddressID
        null, // p_DestinationAddressID
        null,
        null, // p_CollectionWarehouseID
        null, // p_PostingDate
        null, // p_DeliveryDate
        null, // p_RequiredByDate
        null, // p_DateReceived
        null, // p_ServiceTypeID
        null, // p_ExternalRefNo
        null, // p_ExternalSupplierID
        null, // p_CustomerID
        null, // p_CompanyID
        null, // p_Terms
        null, // p_PackagingRequiredYN
        null, // p_CollectFromSupplierYN
        null, // p_SalesQuotationCompletedYN
        null, // p_ShippingPriorityID
        null, // p_ValidTillDate
        null, // p_CurrencyID
        null, // p_SupplierContactPersonID
        null, // p_IsDeliveryOnly
        null, // p_TaxesAndOtherCharges
        null, // p_CreatedByID
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewSalesQuotationID AS newSalesQuotationId'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Sales Quotation not found or deleted');
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

      const queryParams = [
        'UPDATE',
        id,
        data.SalesRFQID || null,
        data.PurchaseRFQID || null,
        data.supplierId || null,
        data.Status || null,
        data.originWarehouseAddressId || null,
        data.collectionAddressId || null,
        data.billingAddressId || null,
        data.destinationAddressId || null,
        data.destinationWarehouseAddressId || null,
        data.collectionWarehouseId || null,
        data.postingDate || null,
        data.deliveryDate || null,
        data.requiredByDate || null,
        data.dateReceived || null,
        data.serviceTypeId || null,
        data.externalRefNo || null,
        data.externalSupplierId || null,
        data.customerId || null,
        data.companyId || null,
        data.terms || null,
        data.packagingRequiredYN || null,
        data.collectFromSupplierYN || null,
        data.salesQuotationCompletedYN || null,
        data.shippingPriorityId || null,
        data.validTillDate || null,
        data.currencyId || null,
        data.supplierContactPersonId || null,
        data.isDeliveryOnly || null,
        data.TaxesAndOtherCharges || null,
        data.CreatedByID || null,
        null // p_DeletedByID
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      if (outParams.result !== 1) {
        throw new Error(outParams.message || 'Failed to update Sales Quotation');
      }

      return {
        message: outParams.message
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // Delete a Sales Quotation
  static async deleteSalesQuotation(id, deletedById) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        'DELETE',
        id,
        null, // p_SalesRFQID
        null, // p_PurchaseRFQID
        null, // p_SupplierID
        null, // p_Status
        null, // p_OriginAddressID
        null, // p_CollectionAddressID
        null, // p_BillingAddressID
        null, // p_DestinationAddressID
        null, // p_CollectionWarehouseID
        null, // p_PostingDate
        null, // p_DeliveryDate
        null, // p_RequiredByDate
        null, // p_DateReceived
        null, // p_ServiceTypeID
        null, // p_ExternalRefNo
        null, // p_ExternalSupplierID
        null, // p_CustomerID
        null, // p_CompanyID
        null, // p_Terms
        null, // p_PackagingRequiredYN
        null, // p_CollectFromSupplierYN
        null, // p_SalesQuotationCompletedYN
        null, // p_ShippingPriorityID
        null, // p_ValidTillDate
        null, // p_CurrencyID
        null, // p_SupplierContactPersonID
        null, // p_IsDeliveryOnly
        null, // p_TaxesAndOtherCharges
        null, // p_CreatedByID
        deletedById
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesQuotation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewSalesQuotationID)',
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
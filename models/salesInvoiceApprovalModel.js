const poolPromise = require('../config/db.config');

class SalesInvoiceApprovalModel {
  static async #executeManageStoredProcedure(action, approvalData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        approvalData.SalesInvoiceID ? parseInt(approvalData.SalesInvoiceID) : null,
        approvalData.ApproverID ? parseInt(approvalData.ApproverID) : null,
        approvalData.ApprovedYN !== undefined ? (approvalData.ApprovedYN ? 1 : 0) : null,
        approvalData.ApproverDateTime || null,
        approvalData.CreatedByID ? parseInt(approvalData.CreatedByID) : null,
        approvalData.DeletedByID ? parseInt(approvalData.DeletedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesInvoiceApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0] || [] : null,
        salesInvoiceId: approvalData.SalesInvoiceID,
        approverId: approvalData.ApproverID
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(approvalData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (['INSERT', 'UPDATE', 'DELETE'].includes(action)) {
      if (approvalData.SalesInvoiceID) {
        const [salesInvoiceCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesinvoice WHERE SalesInvoiceID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(approvalData.SalesInvoiceID)]
        );
        if (salesInvoiceCheck.length === 0) errors.push(`SalesInvoiceID ${approvalData.SalesInvoiceID} does not exist`);
      }
      if (approvalData.ApproverID) {
        const [approverCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(approvalData.ApproverID)]
        );
        if (approverCheck.length === 0) errors.push(`ApproverID ${approvalData.ApproverID} does not exist`);
      }
    }

    if (action === 'INSERT' || action === 'UPDATE') {
      if (approvalData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(approvalData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${approvalData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE' && approvalData.DeletedByID) {
      const [deletedByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(approvalData.DeletedByID)]
      );
      if (deletedByCheck.length === 0) errors.push(`DeletedByID ${approvalData.DeletedByID} does not exist`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async getSalesInvoiceApproval(salesInvoiceId, approverId) {
    try {
      if (!salesInvoiceId || !approverId) {
        return {
          success: false,
          message: 'SalesInvoiceID and ApproverID are required for SELECT',
          data: null,
          salesInvoiceId: salesInvoiceId,
          approverId: approverId
        };
      }

      const approvalData = { SalesInvoiceID: salesInvoiceId, ApproverID: approverId };
      const result = await this.#executeManageStoredProcedure('SELECT', approvalData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        salesInvoiceId: salesInvoiceId,
        approverId: approverId
      };
    } catch (error) {
      console.error('Error in getSalesInvoiceApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesInvoiceId: salesInvoiceId,
        approverId: approverId
      };
    }
  }

  static async getAllSalesInvoiceApprovals(salesInvoiceId, approverId) {
    try {
      const approvalData = { SalesInvoiceID: salesInvoiceId, ApproverID: approverId };
      const result = await this.#executeManageStoredProcedure('SELECT', approvalData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        salesInvoiceId: salesInvoiceId,
        approverId: approverId,
        totalRecords: result.data.length
      };
    } catch (error) {
      console.error('Error in getAllSalesInvoiceApprovals:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: [],
        salesInvoiceId: salesInvoiceId,
        approverId: approverId,
        totalRecords: 0
      };
    }
  }

  static async createSalesInvoiceApproval(approvalData) {
    try {
      const requiredFields = ['SalesInvoiceID', 'ApproverID', 'CreatedByID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesInvoiceId: approvalData.SalesInvoiceID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'INSERT');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          salesInvoiceId: approvalData.SalesInvoiceID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('INSERT', approvalData);
      return result;
    } catch (error) {
      console.error('Error in createSalesInvoiceApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesInvoiceId: approvalData.SalesInvoiceID,
        approverId: approvalData.ApproverID
      };
    }
  }

  static async updateSalesInvoiceApproval(approvalData) {
    try {
      if (!approvalData.SalesInvoiceID || !approvalData.ApproverID) {
        return {
          success: false,
          message: 'SalesInvoiceID and ApproverID are required for UPDATE',
          data: null,
          salesInvoiceId: approvalData.SalesInvoiceID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'UPDATE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          salesInvoiceId: approvalData.SalesInvoiceID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('UPDATE', approvalData);
      return result;
    } catch (error) {
      console.error('Error in updateSalesInvoiceApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesInvoiceId: approvalData.SalesInvoiceID,
        approverId: approvalData.ApproverID
      };
    }
  }

  static async deleteSalesInvoiceApproval(approvalData) {
    try {
      if (!approvalData.SalesInvoiceID || !approvalData.ApproverID) {
        return {
          success: false,
          message: 'SalesInvoiceID and ApproverID are required for DELETE',
          data: null,
          salesInvoiceId: approvalData.SalesInvoiceID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'DELETE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          salesInvoiceId: approvalData.SalesInvoiceID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('DELETE', approvalData);
      return result;
    } catch (error) {
      console.error('Error in deleteSalesInvoiceApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesInvoiceId: approvalData.SalesInvoiceID,
        approverId: approvalData.ApproverID
      };
    }
  }
}

module.exports = SalesInvoiceApprovalModel;
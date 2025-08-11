const poolPromise = require('../config/db.config');

class SalesOrderApprovalModel {
  static async #executeManageStoredProcedure(action, approvalData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        approvalData.SalesOrderID ? parseInt(approvalData.SalesOrderID) : null,
        approvalData.ApproverID ? parseInt(approvalData.ApproverID) : null,
        approvalData.ApprovedYN !== undefined ? (approvalData.ApprovedYN ? 1 : 0) : null,
        approvalData.ApproverDateTime || null,
        approvalData.CreatedByID ? parseInt(approvalData.CreatedByID) : null,
        approvalData.DeletedByID ? parseInt(approvalData.DeletedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManageSalesOrderApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 0, // SP uses 0 for success
        message: outParams.message || (outParams.result === 0 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0] || [] : null,
        salesOrderId: approvalData.SalesOrderID,
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
      if (approvalData.SalesOrderID) {
        const [salesOrderCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesorder WHERE SalesOrderID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(approvalData.SalesOrderID)]
        );
        if (salesOrderCheck.length === 0) errors.push(`SalesOrderID ${approvalData.SalesOrderID} does not exist`);
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

  static async getSalesOrderApproval(salesOrderId, approverId) {
    try {
      if (!salesOrderId || !approverId) {
        return {
          success: false,
          message: 'SalesOrderID and ApproverID are required for SELECT',
          data: null,
          salesOrderId: salesOrderId,
          approverId: approverId
        };
      }

      const approvalData = { SalesOrderID: salesOrderId, ApproverID: approverId };
      const result = await this.#executeManageStoredProcedure('SELECT', approvalData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        salesOrderId: salesOrderId,
        approverId: approverId
      };
    } catch (error) {
      console.error('Error in getSalesOrderApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesOrderId: salesOrderId,
        approverId: approverId
      };
    }
  }

  static async getAllSalesOrderApprovals(salesOrderId) {
    try {
      const approvalData = { SalesOrderID: salesOrderId };
      const result = await this.#executeManageStoredProcedure('SELECT', approvalData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        salesOrderId: salesOrderId,
        approverId: null,
        totalRecords: result.data.length
      };
    } catch (error) {
      console.error('Error in getAllSalesOrderApprovals:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: [],
        salesOrderId: salesOrderId,
        approverId: null,
        totalRecords: 0
      };
    }
  }

  static async createSalesOrderApproval(approvalData) {
    try {
      const requiredFields = ['SalesOrderID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          salesOrderId: approvalData.SalesOrderID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'INSERT');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          salesOrderId: approvalData.SalesOrderID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('INSERT', approvalData);
      return result;
    } catch (error) {
      console.error('Error in createSalesOrderApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesOrderId: approvalData.SalesOrderID,
        approverId: approvalData.ApproverID
      };
    }
  }

  static async updateSalesOrderApproval(approvalData) {
    try {
      if (!approvalData.SalesOrderID || !approvalData.ApproverID) {
        return {
          success: false,
          message: 'SalesOrderID and ApproverID are required for UPDATE',
          data: null,
          salesOrderId: approvalData.SalesOrderID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'UPDATE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          salesOrderId: approvalData.SalesOrderID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('UPDATE', approvalData);
      return result;
    } catch (error) {
      console.error('Error in updateSalesOrderApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesOrderId: approvalData.SalesOrderID,
        approverId: approvalData.ApproverID
      };
    }
  }

  static async deleteSalesOrderApproval(approvalData) {
    try {
      if (!approvalData.SalesOrderID || !approvalData.ApproverID) {
        return {
          success: false,
          message: 'SalesOrderID and ApproverID are required for DELETE',
          data: null,
          salesOrderId: approvalData.SalesOrderID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'DELETE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          salesOrderId: approvalData.SalesOrderID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('DELETE', approvalData);
      return result;
    } catch (error) {
      console.error('Error in deleteSalesOrderApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        salesOrderId: approvalData.SalesOrderID,
        approverId: approvalData.ApproverID
      };
    }
  }
}

module.exports = SalesOrderApprovalModel;
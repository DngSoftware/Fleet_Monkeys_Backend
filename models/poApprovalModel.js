const poolPromise = require('../config/db.config');

class POApprovalModel {
  static async #executeManageStoredProcedure(action, approvalData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        approvalData.POID ? parseInt(approvalData.POID) : null,
        approvalData.ApproverID ? parseInt(approvalData.ApproverID) : null,
        approvalData.ApprovedYN !== undefined ? (approvalData.ApprovedYN ? 1 : 0) : null,
        approvalData.ApproverDateTime || null,
        approvalData.CreatedByID ? parseInt(approvalData.CreatedByID) : null,
        approvalData.DeletedByID ? parseInt(approvalData.DeletedByID) : null
      ];

      const [result] = await pool.query(
        'CALL SP_ManagePOApproval(?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0] || [] : null,
        poId: approvalData.POID,
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
      if (approvalData.POID) {
        const [poCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblpo WHERE POID = ? AND (IsDeleted = 0 OR IsDeleted IS NULL)',
          [parseInt(approvalData.POID)]
        );
        if (poCheck.length === 0) errors.push(`POID ${approvalData.POID} does not exist`);
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

  static async getPOApproval(poId, approverId) {
    try {
      if (!poId || !approverId) {
        return {
          success: false,
          message: 'POID and ApproverID are required for SELECT',
          data: null,
          poId: poId,
          approverId: approverId
        };
      }

      const approvalData = { POID: poId, ApproverID: approverId };
      const result = await this.#executeManageStoredProcedure('SELECT', approvalData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        poId: poId,
        approverId: approverId
      };
    } catch (error) {
      console.error('Error in getPOApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poId: poId,
        approverId: approverId
      };
    }
  }

  static async getAllPOApprovals(poId, approverId) {
    try {
      const approvalData = { POID: poId, ApproverID: approverId };
      const result = await this.#executeManageStoredProcedure('SELECT', approvalData);

      return {
        success: result.success,
        message: result.message,
        data: result.data,
        poId: poId,
        approverId: approverId,
        totalRecords: result.data.length
      };
    } catch (error) {
      console.error('Error in getAllPOApprovals:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: [],
        poId: poId,
        approverId: approverId,
        totalRecords: 0
      };
    }
  }

  static async createPOApproval(approvalData) {
    try {
      const requiredFields = ['POID', 'ApproverID'];
      const missingFields = requiredFields.filter(field => !approvalData[field]);
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `${missingFields.join(', ')} are required`,
          data: null,
          poId: approvalData.POID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'INSERT');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          poId: approvalData.POID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('INSERT', approvalData);
      return result;
    } catch (error) {
      console.error('Error in createPOApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poId: approvalData.POID,
        approverId: approvalData.ApproverID
      };
    }
  }

  static async updatePOApproval(approvalData) {
    try {
      if (!approvalData.POID || !approvalData.ApproverID) {
        return {
          success: false,
          message: 'POID and ApproverID are required for UPDATE',
          data: null,
          poId: approvalData.POID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'UPDATE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          poId: approvalData.POID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('UPDATE', approvalData);
      return result;
    } catch (error) {
      console.error('Error in updatePOApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poId: approvalData.POID,
        approverId: approvalData.ApproverID
      };
    }
  }

  static async deletePOApproval(approvalData) {
    try {
      if (!approvalData.POID || !approvalData.ApproverID) {
        return {
          success: false,
          message: 'POID and ApproverID are required for DELETE',
          data: null,
          poId: approvalData.POID,
          approverId: approvalData.ApproverID
        };
      }

      const fkErrors = await this.#validateForeignKeys(approvalData, 'DELETE');
      if (fkErrors) {
        return {
          success: false,
          message: `Validation failed: ${fkErrors}`,
          data: null,
          poId: approvalData.POID,
          approverId: approvalData.ApproverID
        };
      }

      const result = await this.#executeManageStoredProcedure('DELETE', approvalData);
      return result;
    } catch (error) {
      console.error('Error in deletePOApproval:', error);
      return {
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        poId: approvalData.POID,
        approverId: approvalData.ApproverID
      };
    }
  }
}

module.exports = POApprovalModel;
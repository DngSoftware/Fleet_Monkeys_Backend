const poolPromise = require('../config/db.config');

class TransactionModel {
  static async #executeManageStoredProcedure(action, transactionData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        transactionData.TransactionID ? parseInt(transactionData.TransactionID) : null,
        transactionData.SalesRFQID ? parseInt(transactionData.SalesRFQID) : null,
        transactionData.SupplierID ? parseInt(transactionData.SupplierID) : null,
        transactionData.TransactionAmount ? parseFloat(transactionData.TransactionAmount) : null,
        transactionData.TransactionDate ? new Date(transactionData.TransactionDate) : null,
        transactionData.TransactionTypeID ? parseInt(transactionData.TransactionTypeID) : null,
        transactionData.CreatedByID ? parseInt(transactionData.CreatedByID) : null,
      ];

      const [result] = await pool.query(
        'CALL SP_ManageTransactions(?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' ? result[0]?.[0] || null : null,
        transactionId: transactionData.TransactionID,
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(transactionData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (transactionData.SalesRFQID) {
        const [salesRFQCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsalesrfq WHERE SalesRFQID = ? AND IsDeleted = 0',
          [parseInt(transactionData.SalesRFQID)]
        );
        if (salesRFQCheck.length === 0) errors.push(`SalesRFQID ${transactionData.SalesRFQID} does not exist or is deleted`);
      }
      if (transactionData.SupplierID) {
        const [supplierCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblsupplier WHERE SupplierID = ? AND IsDeleted = 0',
          [parseInt(transactionData.SupplierID)]
        );
        if (supplierCheck.length === 0) errors.push(`SupplierID ${transactionData.SupplierID} does not exist or is deleted`);
      }
      if (transactionData.TransactionTypeID) {
        const [transactionTypeCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbltransactiontype WHERE TransactionTypeID = ?',
          [parseInt(transactionData.TransactionTypeID)]
        );
        if (transactionTypeCheck.length === 0) errors.push(`TransactionTypeID ${transactionData.TransactionTypeID} does not exist`);
      }
      if (transactionData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(transactionData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${transactionData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE' && transactionData.CreatedByID) {
      const [createdByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
        [parseInt(transactionData.CreatedByID)]
      );
      if (createdByCheck.length === 0) errors.push(`CreatedByID ${transactionData.CreatedByID} does not exist`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createTransaction(transactionData) {
    const requiredFields = ['TransactionAmount', 'CreatedByID'];
    const missingFields = requiredFields.filter(field => !transactionData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        transactionId: null,
      };
    }

    if (transactionData.TransactionAmount <= 0) {
      return {
        success: false,
        message: 'Transaction amount must be greater than zero',
        data: null,
        transactionId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(transactionData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        transactionId: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', transactionData);
  }

  static async updateTransaction(transactionData) {
    if (!transactionData.TransactionID) {
      return {
        success: false,
        message: 'TransactionID is required for UPDATE',
        data: null,
        transactionId: null,
      };
    }

    if (transactionData.TransactionAmount <= 0) {
      return {
        success: false,
        message: 'Transaction amount must be greater than zero',
        data: null,
        transactionId: transactionData.TransactionID,
      };
    }

    const fkErrors = await this.#validateForeignKeys(transactionData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        transactionId: transactionData.TransactionID,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', transactionData);
  }

  static async deleteTransaction(transactionData) {
    if (!transactionData.TransactionID) {
      return {
        success: false,
        message: 'TransactionID is required for DELETE',
        data: null,
        transactionId: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(transactionData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        transactionId: transactionData.TransactionID,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', transactionData);
  }

  static async getTransaction(transactionData) {
    if (!transactionData.TransactionID) {
      return {
        success: false,
        message: 'TransactionID is required for SELECT',
        data: null,
        transactionId: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', transactionData);
  }
}

module.exports = TransactionModel;
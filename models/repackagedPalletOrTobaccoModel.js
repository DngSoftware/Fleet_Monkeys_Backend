const poolPromise = require('../config/db.config');

class RepackagedPalletOrTobaccoModel {
  static async #executeManageStoredProcedure(action, repackagedData) {
    try {
      const pool = await poolPromise;

      const queryParams = [
        action,
        repackagedData.RepackagedPalletOrTobaccoID ? parseInt(repackagedData.RepackagedPalletOrTobaccoID) : null,
        repackagedData.Name || null,
        repackagedData.TypeID ? parseInt(repackagedData.TypeID) : null,
        repackagedData.LoadID ? parseInt(repackagedData.LoadID) : null,
        repackagedData.LoadTrailerID ? parseInt(repackagedData.LoadTrailerID) : null,
        repackagedData.LocalLoadID ? parseInt(repackagedData.LocalLoadID) : null,
        repackagedData.Length ? parseFloat(repackagedData.Length) : null,
        repackagedData.Width ? parseFloat(repackagedData.Width) : null,
        repackagedData.Height ? parseFloat(repackagedData.Height) : null,
        repackagedData.Volume ? parseFloat(repackagedData.Volume) : null,
        repackagedData.Weight ? parseFloat(repackagedData.Weight) : null,
        repackagedData.VolumeUOMID ? parseInt(repackagedData.VolumeUOMID) : null,
        repackagedData.WeightUOMID ? parseInt(repackagedData.WeightUOMID) : null,
        repackagedData.QRCodeString || null,
        repackagedData.CreatedByID ? parseInt(repackagedData.CreatedByID) : null,
      ];

      const [result] = await pool.query(
        'CALL sp_ManageRepackagedPalletOrTobacco(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_Result, @p_Message, @p_NewID)',
        queryParams
      );

      const [[outParams]] = await pool.query(
        'SELECT @p_Result AS result, @p_Message AS message, @p_NewID AS newID'
      );

      return {
        success: outParams.result === 1,
        message: outParams.message || (outParams.result === 1 ? `${action} operation successful` : 'Operation failed'),
        data: action === 'SELECT' || action === 'SELECT_ALL' ? result[0] || [] : null,
        repackagedPalletOrTobaccoID: repackagedData.RepackagedPalletOrTobaccoID,
        newRepackagedPalletOrTobaccoID: outParams.newID,
      };
    } catch (error) {
      console.error(`Database error in ${action} operation:`, error);
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }
  }

  static async #validateForeignKeys(repackagedData, action) {
    const pool = await poolPromise;
    const errors = [];

    if (action === 'INSERT' || action === 'UPDATE') {
      if (repackagedData.TypeID) {
        const [typeCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbltype WHERE TypeID = ?',
          [parseInt(repackagedData.TypeID)]
        );
        if (typeCheck.length === 0) errors.push(`TypeID ${repackagedData.TypeID} does not exist`);
      }
      if (repackagedData.LoadID) {
        const [loadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblload WHERE LoadID = ?',
          [parseInt(repackagedData.LoadID)]
        );
        if (loadCheck.length === 0) errors.push(`LoadID ${repackagedData.LoadID} does not exist`);
      }
      if (repackagedData.LoadTrailerID) {
        const [loadTrailerCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblloadtrailer WHERE LoadTrailerID = ?',
          [parseInt(repackagedData.LoadTrailerID)]
        );
        if (loadTrailerCheck.length === 0) errors.push(`LoadTrailerID ${repackagedData.LoadTrailerID} does not exist`);
      }
      if (repackagedData.LocalLoadID) {
        const [localLoadCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbllocalload WHERE LocalLoadID = ?',
          [parseInt(repackagedData.LocalLoadID)]
        );
        if (localLoadCheck.length === 0) errors.push(`LocalLoadID ${repackagedData.LocalLoadID} does not exist`);
      }
      if (repackagedData.VolumeUOMID) {
        const [volumeUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ?',
          [parseInt(repackagedData.VolumeUOMID)]
        );
        if (volumeUOMCheck.length === 0) errors.push(`VolumeUOMID ${repackagedData.VolumeUOMID} does not exist`);
      }
      if (repackagedData.WeightUOMID) {
        const [weightUOMCheck] = await pool.query(
          'SELECT 1 FROM dbo_tbluom WHERE UOMID = ?',
          [parseInt(repackagedData.WeightUOMID)]
        );
        if (weightUOMCheck.length === 0) errors.push(`WeightUOMID ${repackagedData.WeightUOMID} does not exist`);
      }
      if (repackagedData.CreatedByID) {
        const [createdByCheck] = await pool.query(
          'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
          [parseInt(repackagedData.CreatedByID)]
        );
        if (createdByCheck.length === 0) errors.push(`CreatedByID ${repackagedData.CreatedByID} does not exist`);
      }
    }

    if (action === 'DELETE' && repackagedData.CreatedByID) {
      const [createdByCheck] = await pool.query(
        'SELECT 1 FROM dbo_tblperson WHERE PersonID = ?',
        [parseInt(repackagedData.CreatedByID)]
      );
      if (createdByCheck.length === 0) errors.push(`CreatedByID ${repackagedData.CreatedByID} does not exist`);
    }

    return errors.length > 0 ? errors.join('; ') : null;
  }

  static async createRepackagedPalletOrTobacco(repackagedData) {
    const requiredFields = ['Name', 'CreatedByID'];
    const missingFields = requiredFields.filter(field => !repackagedData[field]);
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `${missingFields.join(', ')} are required`,
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(repackagedData, 'INSERT');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      };
    }

    return await this.#executeManageStoredProcedure('INSERT', repackagedData);
  }

  static async updateRepackagedPalletOrTobacco(repackagedData) {
    if (!repackagedData.RepackagedPalletOrTobaccoID) {
      return {
        success: false,
        message: 'RepackagedPalletOrTobaccoID is required for UPDATE',
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(repackagedData, 'UPDATE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        repackagedPalletOrTobaccoID: repackagedData.RepackagedPalletOrTobaccoID,
        newRepackagedPalletOrTobaccoID: null,
      };
    }

    return await this.#executeManageStoredProcedure('UPDATE', repackagedData);
  }

  static async deleteRepackagedPalletOrTobacco(repackagedData) {
    if (!repackagedData.RepackagedPalletOrTobaccoID) {
      return {
        success: false,
        message: 'RepackagedPalletOrTobaccoID is required for DELETE',
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      };
    }

    const fkErrors = await this.#validateForeignKeys(repackagedData, 'DELETE');
    if (fkErrors) {
      return {
        success: false,
        message: `Validation failed: ${fkErrors}`,
        data: null,
        repackagedPalletOrTobaccoID: repackagedData.RepackagedPalletOrTobaccoID,
        newRepackagedPalletOrTobaccoID: null,
      };
    }

    return await this.#executeManageStoredProcedure('DELETE', repackagedData);
  }

  static async getRepackagedPalletOrTobacco(repackagedData) {
    if (!repackagedData.RepackagedPalletOrTobaccoID) {
      return {
        success: false,
        message: 'RepackagedPalletOrTobaccoID is required for SELECT',
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      };
    }

    return await this.#executeManageStoredProcedure('SELECT', repackagedData);
  }

  static async getAllRepackagedPalletsOrTobacco() {
    return await this.#executeManageStoredProcedure('SELECT_ALL', {});
  }
}

module.exports = RepackagedPalletOrTobaccoModel;
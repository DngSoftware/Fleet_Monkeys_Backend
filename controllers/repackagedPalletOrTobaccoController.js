const RepackagedPalletOrTobaccoModel = require('../models/repackagedPalletOrTobaccoModel');
const poolPromise = require('../config/db.config');

class RepackagedPalletOrTobaccoController {
  static async createRepackagedPalletOrTobacco(req, res) {
    try {
      const repackagedData = {
        Name: req.body.Name,
        TypeID: req.body.TypeID ? parseInt(req.body.TypeID) : null,
        LoadID: req.body.LoadID ? parseInt(req.body.LoadID) : null,
        LoadTrailerID: req.body.LoadTrailerID ? parseInt(req.body.LoadTrailerID) : null,
        LocalLoadID: req.body.LocalLoadID ? parseInt(req.body.LocalLoadID) : null,
        Length: req.body.Length ? parseFloat(req.body.Length) : null,
        Width: req.body.Width ? parseFloat(req.body.Width) : null,
        Height: req.body.Height ? parseFloat(req.body.Height) : null,
        Volume: req.body.Volume ? parseFloat(req.body.Volume) : null,
        Weight: req.body.Weight ? parseFloat(req.body.Weight) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        QRCodeString: req.body.QRCodeString,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await RepackagedPalletOrTobaccoModel.createRepackagedPalletOrTobacco(repackagedData);
      return res.status(result.success ? 201 : 400).json({
        ...result,
        message: result.success ? 'Repackaged Pallet or Tobacco created successfully' : result.message,
      });
    } catch (error) {
      console.error('Create RepackagedPalletOrTobacco error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      });
    }
  }

  static async updateRepackagedPalletOrTobacco(req, res) {
    try {
      const repackagedPalletOrTobaccoID = parseInt(req.params.id);
      if (isNaN(repackagedPalletOrTobaccoID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing RepackagedPalletOrTobaccoID',
          data: null,
          repackagedPalletOrTobaccoID: null,
          newRepackagedPalletOrTobaccoID: null,
        });
      }

      const repackagedData = {
        RepackagedPalletOrTobaccoID: repackagedPalletOrTobaccoID,
        Name: req.body.Name,
        TypeID: req.body.TypeID ? parseInt(req.body.TypeID) : null,
        LoadID: req.body.LoadID ? parseInt(req.body.LoadID) : null,
        LoadTrailerID: req.body.LoadTrailerID ? parseInt(req.body.LoadTrailerID) : null,
        LocalLoadID: req.body.LocalLoadID ? parseInt(req.body.LocalLoadID) : null,
        Length: req.body.Length ? parseFloat(req.body.Length) : null,
        Width: req.body.Width ? parseFloat(req.body.Width) : null,
        Height: req.body.Height ? parseFloat(req.body.Height) : null,
        Volume: req.body.Volume ? parseFloat(req.body.Volume) : null,
        Weight: req.body.Weight ? parseFloat(req.body.Weight) : null,
        VolumeUOMID: req.body.VolumeUOMID ? parseInt(req.body.VolumeUOMID) : null,
        WeightUOMID: req.body.WeightUOMID ? parseInt(req.body.WeightUOMID) : null,
        QRCodeString: req.body.QRCodeString,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await RepackagedPalletOrTobaccoModel.updateRepackagedPalletOrTobacco(repackagedData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update RepackagedPalletOrTobacco error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      });
    }
  }

  static async deleteRepackagedPalletOrTobacco(req, res) {
    try {
      const repackagedPalletOrTobaccoID = parseInt(req.params.id);
      if (isNaN(repackagedPalletOrTobaccoID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing RepackagedPalletOrTobaccoID',
          data: null,
          repackagedPalletOrTobaccoID: null,
          newRepackagedPalletOrTobaccoID: null,
        });
      }

      const repackagedData = {
        RepackagedPalletOrTobaccoID: repackagedPalletOrTobaccoID,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId,
      };

      const result = await RepackagedPalletOrTobaccoModel.deleteRepackagedPalletOrTobacco(repackagedData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete RepackagedPalletOrTobacco error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      });
    }
  }

  static async getRepackagedPalletOrTobacco(req, res) {
    try {
      const repackagedPalletOrTobaccoID = parseInt(req.params.id);
      if (isNaN(repackagedPalletOrTobaccoID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing RepackagedPalletOrTobaccoID',
          data: null,
          repackagedPalletOrTobaccoID: null,
          newRepackagedPalletOrTobaccoID: null,
        });
      }

      const repackagedData = {
        RepackagedPalletOrTobaccoID: repackagedPalletOrTobaccoID,
      };

      const result = await RepackagedPalletOrTobaccoModel.getRepackagedPalletOrTobacco(repackagedData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get RepackagedPalletOrTobacco error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      });
    }
  }

  static async getAllRepackagedPalletsOrTobacco(req, res) {
    try {
      const result = await RepackagedPalletOrTobaccoModel.getAllRepackagedPalletsOrTobacco();
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get All RepackagedPalletsOrTobacco error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        repackagedPalletOrTobaccoID: null,
        newRepackagedPalletOrTobaccoID: null,
      });
    }
  }
}

module.exports = RepackagedPalletOrTobaccoController;
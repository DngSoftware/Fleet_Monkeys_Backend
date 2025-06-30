const POParcelModel = require('../models/poParcelModel');

class POParcelController {

  // Get all Sales Order Parcels
  static async getAllPOParcels(req, res) {
    try {
      const { pageNumber, pageSize, POID } = req.query;
      const result = await POParcelModel.getAllPOParcels({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        POID: parseInt(POID) || null
      });
      res.status(200).json({
        success: true,
        message: 'PO Parcel records retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords,
        POParcelId: null
      });
    } catch (err) {
      console.error('Error in getAllPOParcels:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        POParcelId: null
      });
    }
  }

  static async getPOParcelById(req, res) {
    try {
      const poParcelId = parseInt(req.params.id);
      if (isNaN(poParcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing POParcelID',
          data: null,
          poParcelId: null
        });
      }

      const result = await POParcelModel.getPOParcelById(poParcelId);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('Error in getPOParcelById:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        poParcelId: null
      });
    }
  }

  static async updatePOParcel(req, res) {
    try {
      const poParcelId = parseInt(req.params.id);
      if (isNaN(poParcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing POParcelID',
          data: null,
          poParcelId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          poParcelId: null
        });
      }

      const poParcelData = {
        POParcelID: poParcelId,
        ItemQuantity: req.body.itemQuantity ? parseFloat(req.body.itemQuantity) : null,
        Rate: req.body.rate ? parseFloat(req.body.rate) : null,
        Amount: req.body.amount ? parseFloat(req.body.amount) : null,
        UOMID: req.body.uomID ? parseInt(req.body.uomID) : null,
        CertificationID: req.body.certificationID ? parseInt(req.body.certificationID) : null,
        CreatedByID: req.user.personId
      };

      const result = await POParcelModel.updatePOParcel(poParcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in updatePOParcel:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        poParcelId: poParcelId
      });
    }
  }

  static async deletePOParcel(req, res) {
    try {
      const poParcelId = parseInt(req.params.id);
      if (isNaN(poParcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing POParcelID',
          data: null,
          poParcelId: null
        });
      }

      if (!req.user || !req.user.personId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          poParcelId: null
        });
      }

      const poParcelData = {
        POParcelID: poParcelId,
        CreatedByID: req.user.personId
      };

      const result = await POParcelModel.deletePOParcel(poParcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Error in deletePOParcel:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        poParcelId: poParcelId
      });
    }
  }
}

module.exports = POParcelController;
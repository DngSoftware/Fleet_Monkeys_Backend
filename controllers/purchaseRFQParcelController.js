const PurchaseRFQParcelModel = require('../models/purchaseRFQParcelModel');

class PurchaseRFQParcelController {
  static async createPurchaseRFQParcel(req, res) {
    try {
      const allowedRoles = ['Administrator', 'Customer Order Coordinator'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Administrators or Customer Order Coordinators can create PurchaseRFQParcel',
          data: null,
          purchaseRFQParcelId: null,
          newPurchaseRFQParcelId: null
        });
      }

      const purchaseRFQParcelData = {
        PurchaseRFQID: req.body.PurchaseRFQID ? parseInt(req.body.PurchaseRFQID) : null,
        ParcelID: req.body.ParcelID ? parseInt(req.body.ParcelID) : null,
        ItemID: req.body.ItemID ? parseInt(req.body.ItemID) : null,
        LineItemNumber: req.body.LineItemNumber ? parseInt(req.body.LineItemNumber) : null,
        ItemQuantity: req.body.ItemQuantity ? parseFloat(req.body.ItemQuantity) : null,
        UOMID: req.body.UOMID ? parseInt(req.body.UOMID) : null,
        Rate: req.body.Rate ? parseFloat(req.body.Rate) : null,
        Amount: req.body.Amount ? parseFloat(req.body.Amount) : null,
        LineNumber: req.body.LineNumber ? parseInt(req.body.LineNumber) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId
      };

      const result = await PurchaseRFQParcelModel.createPurchaseRFQParcel(purchaseRFQParcelData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Create PurchaseRFQParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      });
    }
  }

  static async updatePurchaseRFQParcel(req, res) {
    try {
      const purchaseRFQParcelId = parseInt(req.params.id);
      if (isNaN(purchaseRFQParcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseRFQParcelID',
          data: null,
          purchaseRFQParcelId: null,
          newPurchaseRFQParcelId: null
        });
      }

      const purchaseRFQParcelData = {
        PurchaseRFQParcelID: purchaseRFQParcelId,
        PurchaseRFQID: req.body.PurchaseRFQID ? parseInt(req.body.PurchaseRFQID) : null,
        ParcelID: req.body.ParcelID ? parseInt(req.body.ParcelID) : null,
        ItemID: req.body.ItemID ? parseInt(req.body.ItemID) : null,
        LineItemNumber: req.body.LineItemNumber ? parseInt(req.body.LineItemNumber) : null,
        ItemQuantity: req.body.ItemQuantity ? parseFloat(req.body.ItemQuantity) : null,
        UOMID: req.body.UOMID ? parseInt(req.body.UOMID) : null,
        Rate: req.body.Rate ? parseFloat(req.body.Rate) : null,
        Amount: req.body.Amount ? parseFloat(req.body.Amount) : null,
        LineNumber: req.body.LineNumber ? parseInt(req.body.LineNumber) : null,
        CreatedByID: parseInt(req.body.CreatedByID) || req.user.personId
      };

      const result = await PurchaseRFQParcelModel.updatePurchaseRFQParcel(purchaseRFQParcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update PurchaseRFQParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      });
    }
  }

  static async deletePurchaseRFQParcel(req, res) {
    try {
      const purchaseRFQParcelId = parseInt(req.params.id);
      if (isNaN(purchaseRFQParcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseRFQParcelID',
          data: null,
          purchaseRFQParcelId: null,
          newPurchaseRFQParcelId: null
        });
      }

      const purchaseRFQParcelData = {
        PurchaseRFQParcelID: purchaseRFQParcelId,
        DeletedByID: parseInt(req.body.DeletedByID) || req.user.personId
      };

      const result = await PurchaseRFQParcelModel.deletePurchaseRFQParcel(purchaseRFQParcelData);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete PurchaseRFQParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      });
    }
  }

  static async getPurchaseRFQParcel(req, res) {
    try {
      const purchaseRFQParcelId = parseInt(req.params.id);
      if (isNaN(purchaseRFQParcelId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseRFQParcelID',
          data: null,
          purchaseRFQParcelId: null,
          newPurchaseRFQParcelId: null
        });
      }

      const purchaseRFQParcelData = {
        PurchaseRFQParcelID: purchaseRFQParcelId
      };

      const result = await PurchaseRFQParcelModel.getPurchaseRFQParcel(purchaseRFQParcelData);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Get PurchaseRFQParcel error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      });
    }
  }

   // Get all Purchase RFQ Parcels by PurchaseRFQID
  static async getAllPurchaseRFQParcelsByPurchaseRFQId(req, res) {
    try {
      const { purchaseRFQId } = req.params;
      const { pageNumber, pageSize, sortDirection, fromDate, toDate } = req.query;

      const result = await PurchaseRFQParcelModel.getAllPurchaseRFQParcelsByPurchaseRFQId({
        purchaseRFQId: parseInt(purchaseRFQId),
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10,
        sortDirection: sortDirection || 'DESC',
        fromDate: fromDate || null,
        toDate: toDate || null
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllPurchaseRFQParcelsByPurchaseRFQId:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        purchaseRFQParcelId: null,
        newPurchaseRFQParcelId: null
      });
    }
  }
}

module.exports = PurchaseRFQParcelController;
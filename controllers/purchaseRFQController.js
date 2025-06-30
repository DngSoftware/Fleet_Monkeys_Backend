const PurchaseRFQModel = require('../models/purchaseRFQModel');

class PurchaseRFQController {
  // Get all Purchase RFQs
  static async getAllPurchaseRFQs(req, res) {
    try {
      const { pageNumber, pageSize } = req.query;
      const result = await PurchaseRFQModel.getAllPurchaseRFQs({
        pageNumber: parseInt(pageNumber) || 1,
        pageSize: parseInt(pageSize) || 10
      });
      res.status(200).json({
        success: true,
        message: 'Purchase RFQ records retrieved successfully.',
        data: result.data,
        totalRecords: result.totalRecords,
        purchaseRFQId: null,
        newPurchaseRFQId: null
      });
    } catch (err) {
      console.error('Error in getAllPurchaseRFQs:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
        newPurchaseRFQId: null
      });
    }
  }

  // Create a new Purchase RFQ
  static async createPurchaseRFQ(req, res) {
    try {
      const allowedRoles = ['Administrator', 'Customer Order Coordinator'];
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only Administrators or Customer Order Coordinators can create Purchase RFQ',
          data: null,
          purchaseRFQId: null,
          newPurchaseRFQId: null
        });
      }

      const data = {
        SalesRFQID: req.body.SalesRFQID,
        CreatedByID: req.user.personId
      };
      if (!data.SalesRFQID) {
        return res.status(400).json({
          success: false,
          message: 'SalesRFQID is required.',
          data: null,
          purchaseRFQId: null,
          newPurchaseRFQId: null
        });
      }

      const result = await PurchaseRFQModel.createPurchaseRFQ(data);
      res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        purchaseRFQId: null,
        newPurchaseRFQId: result.newPurchaseRFQId
      });
    } catch (err) {
      console.error('Error in createPurchaseRFQ:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
        newPurchaseRFQId: null
      });
    }
  }

  // Get a single Purchase RFQ by ID
  static async getPurchaseRFQById(req, res) {
    try {
      const { id } = req.params;
      const purchaseRFQ = await PurchaseRFQModel.getPurchaseRFQById(parseInt(id));
      if (!purchaseRFQ) {
        return res.status(404).json({
          success: false,
          message: 'Purchase RFQ not found or deleted.',
          data: null,
          purchaseRFQId: null,
          newPurchaseRFQId: null
        });
      }
      res.status(200).json({
        success: true,
        message: 'Purchase RFQ retrieved successfully.',
        data: purchaseRFQ,
        purchaseRFQId: id,
        newPurchaseRFQId: null
      });
    } catch (err) {
      console.error('Error in getPurchaseRFQById:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
        newPurchaseRFQId: null
      });
    }
  }

  // Update a Purchase RFQ
  static async updatePurchaseRFQ(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Validate required fields
      if (!data.SalesRFQID || !data.CreatedByID) {
        return res.status(400).json({
          success: false,
          message: 'SalesRFQID and CreatedByID are required.',
          data: null,
          purchaseRFQId: null,
          newPurchaseRFQId: null
        });
      }

      const result = await PurchaseRFQModel.updatePurchaseRFQ(parseInt(id), data);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        purchaseRFQId: id,
        newPurchaseRFQId: null
      });
    } catch (err) {
      console.error('Error in updatePurchaseRFQ:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
        newPurchaseRFQId: null
      });
    }
  }

  // Delete a Purchase RFQ
  static async deletePurchaseRFQ(req, res) {
    try {
      const { id } = req.params;
      const deletedById = req.user?.personId;
      if (!deletedById) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          data: null,
          purchaseRFQId: null,
          newPurchaseRFQId: null
        });
      }

      const result = await PurchaseRFQModel.deletePurchaseRFQ(parseInt(id), deletedById);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        purchaseRFQId: id,
        newPurchaseRFQId: null
      });
    } catch (err) {
      console.error('Error in deletePurchaseRFQ:', err);
      res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
        newPurchaseRFQId: null
      });
    }
  }

  // Approve a Purchase RFQ
  static async approvePurchaseRFQ(req, res) {
    try {
      const { PurchaseRFQID } = req.body;
      const approverID = req.user?.personId;

      if (!PurchaseRFQID) {
        return res.status(400).json({
          success: false,
          message: 'purchaseRFQID is required',
          data: null,
          purchaseRFQId: null,
          newPurchaseRFQId: null
        });
      }

      if (!req.user || !approverID) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          purchaseRFQId: null,
          newPurchaseRFQId: null
        });
      }

      const approvalData = {
        PurchaseRFQID: parseInt(PurchaseRFQID),
        ApproverID: parseInt(approverID)
      };

      const result = await PurchaseRFQModel.approvePurchaseRFQ(approvalData);
      return res.status(result.success ? (result.isFullyApproved ? 200 : 202) : 403).json(result);
    } catch (err) {
      console.error('Approve PurchaseRFQ error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        purchaseRFQId: null,
        newPurchaseRFQId: null
      });
    }
  }

  
  static async getPurchaseRFQApprovalStatus(req, res) {
    try {
      const PurchaseRFQID = parseInt(req.params.id);
      if (isNaN(PurchaseRFQID)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing PurchaseRFQID',
          data: null,
          PurchaseRFQID: null,
          newPurchaseRFQID: null
        });
      }

      const result = await PurchaseRFQModel.getPurchaseRFQApprovalStatus(PurchaseRFQID);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get PurchaseRFQ Approval Status error:', error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
        data: null,
        PurchaseRFQID: null,
        newPurchaseRFQID: null
      });
    }
  }
}

module.exports = PurchaseRFQController;
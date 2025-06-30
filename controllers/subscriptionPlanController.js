const SubscriptionPlanModel = require('../models/subscriptionPlanModel');

class SubscriptionPlanController {
  // Get all Subscription Plans with pagination
  static async getAllSubscriptionPlans(req, res) {
    try {
      const { pageNumber, pageSize, fromDate, toDate } = req.query;

      const subscriptionPlans = await SubscriptionPlanModel.getAllSubscriptionPlans({
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        fromDate,
        toDate
      });

      return res.status(200).json({
        success: true,
        message: 'Subscription plans retrieved successfully',
        data: subscriptionPlans.data,
        totalRecords: subscriptionPlans.totalRecords
      });
    } catch (err) {
      console.error('getAllSubscriptionPlans error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        subscriptionPlanId: null
      });
    }
  }

  // Create a new Subscription Plan
  static async createSubscriptionPlan(req, res) {
    try {
      const { subscriptionPlanName, description, fees, billingFrequencyId, createdById } = req.body;

      // Basic validation
      if (!subscriptionPlanName || fees == null || !billingFrequencyId || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'SubscriptionPlanName, Fees, BillingFrequencyID, and CreatedByID are required',
          data: null,
          subscriptionPlanId: null
        });
      }

      const result = await SubscriptionPlanModel.createSubscriptionPlan({
        subscriptionPlanName,
        description,
        fees,
        billingFrequencyId,
        createdById
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        data: null,
        subscriptionPlanId: result.subscriptionPlanId
      });
    } catch (err) {
      console.error('createSubscriptionPlan error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        subscriptionPlanId: null
      });
    }
  }

  // Get a single Subscription Plan by ID
  static async getSubscriptionPlanById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SubscriptionPlanID is required',
          data: null,
          subscriptionPlanId: null
        });
      }

      const subscriptionPlan = await SubscriptionPlanModel.getSubscriptionPlanById(parseInt(id));

      if (!subscriptionPlan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found',
          data: null,
          subscriptionPlanId: id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Subscription plan retrieved successfully',
        data: subscriptionPlan,
        subscriptionPlanId: id
      });
    } catch (err) {
      console.error('getSubscriptionPlanById error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        subscriptionPlanId: null
      });
    }
  }

  // Update a Subscription Plan
  static async updateSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const { subscriptionPlanName, description, fees, billingFrequencyId, createdById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SubscriptionPlanID is required',
          data: null,
          subscriptionPlanId: null
        });
      }

      if (!subscriptionPlanName || fees == null || !billingFrequencyId || !createdById) {
        return res.status(400).json({
          success: false,
          message: 'SubscriptionPlanName, Fees, BillingFrequencyID, and CreatedByID are required',
          data: null,
          subscriptionPlanId: id
        });
      }

      const result = await SubscriptionPlanModel.updateSubscriptionPlan(parseInt(id), {
        subscriptionPlanName,
        description,
        fees,
        billingFrequencyId,
        createdById
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        subscriptionPlanId: id
      });
    } catch (err) {
      console.error('updateSubscriptionPlan error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        subscriptionPlanId: null
      });
    }
  }

  // Delete a Subscription Plan
  static async deleteSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      const { deletedById } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid SubscriptionPlanID is required',
          data: null,
          subscriptionPlanId: null
        });
      }

      if (!deletedById) {
        return res.status(400).json({
          success: false,
          message: 'DeletedByID is required',
          data: null,
          subscriptionPlanId: id
        });
      }

      const result = await SubscriptionPlanModel.deleteSubscriptionPlan(parseInt(id), deletedById);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        subscriptionPlanId: id
      });
    } catch (err) {
      console.error('deleteSubscriptionPlan error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
        data: null,
        subscriptionPlanId: null
      });
    }
  }
}

module.exports = SubscriptionPlanController;
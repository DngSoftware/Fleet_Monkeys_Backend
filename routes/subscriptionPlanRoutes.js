const express = require('express');
const router = express.Router();
const SubscriptionPlanController = require('../controllers/subscriptionPlanController');

// Routes for Subscription Plan management
router.get('/', SubscriptionPlanController.getAllSubscriptionPlans); // GET /api/subscription-plans
router.post('/', SubscriptionPlanController.createSubscriptionPlan); // POST /api/subscription-plans
router.get('/:id', SubscriptionPlanController.getSubscriptionPlanById); // GET /api/subscription-plans/:id
router.put('/:id', SubscriptionPlanController.updateSubscriptionPlan); // PUT /api/subscription-plans/:id
router.delete('/:id', SubscriptionPlanController.deleteSubscriptionPlan); // DELETE /api/subscription-plans/:id

module.exports = router;
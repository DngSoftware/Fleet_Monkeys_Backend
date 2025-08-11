const express = require('express');
const router = express.Router();
const PendingApprovalsController = require('../controllers/pendingApprovalsController');
const authMiddleware = require('../middleware/authMiddleware');

// Get pending approvals
router.get('/', authMiddleware,PendingApprovalsController.getPendingApprovals);

module.exports = router;
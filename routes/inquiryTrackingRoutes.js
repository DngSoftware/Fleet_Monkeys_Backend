const express = require('express');
const router = express.Router();
const InquiryTrackingController = require('../controllers/inquiryTrackingController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get inquiry tracking across all forms
router.get('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), InquiryTrackingController.getInquiryTracking);

module.exports = router;
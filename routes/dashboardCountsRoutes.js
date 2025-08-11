const express = require('express');
const router = express.Router();
const DashboardCountsController = require('../controllers/dashboardCountsController');

router.get('/', DashboardCountsController.getDashboardCounts);

module.exports = router;

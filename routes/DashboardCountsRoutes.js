const express = require('express');
const router = express.Router();
const DashboardCountsController = require('../controllers/DashboardCountsController');

router.get('/', DashboardCountsController.getDashboardCounts);

module.exports = router;

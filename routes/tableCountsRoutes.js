const express = require('express');
const router = express.Router();
const TableCountsController = require('../controllers/tableCountsController');

router.get('/', TableCountsController.getTableCounts);

module.exports = router;
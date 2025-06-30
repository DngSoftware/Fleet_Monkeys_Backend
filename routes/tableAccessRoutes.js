const express = require('express');
const router = express.Router();
const TableAccessController = require('../controllers/tableAccessController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');

// Get the list of accessible tables for the logged-in user
router.get('/', authMiddleware, tableAccessMiddleware, TableAccessController.getAccessibleTables);

module.exports = router;
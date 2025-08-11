const express = require('express');
const router = express.Router();
const TableAccessController = require('../controllers/tableAccessController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

router.get('/', authMiddleware, tableAccessMiddleware, TableAccessController.getAccessibleTables);

module.exports = router;
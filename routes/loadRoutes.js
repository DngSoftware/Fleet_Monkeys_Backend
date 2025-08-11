const express = require('express');
const router = express.Router();
const LoadController = require('../controllers/loadController');
const authMiddleware = require('../middleware/authMiddleware');
// const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Loads with optional date filtering (requires read permission on Load table)
router.get('/', authMiddleware,LoadController.getAllLoads);

// Get a single Load by ID (requires read permission on Load table)
router.get('/:id', authMiddleware,  LoadController.getLoad);

// Create a new Load (requires write permission on Load table)
router.post('/', authMiddleware,  LoadController.createLoad);

// Update a Load (requires update permission on Load table)
router.put('/:id', authMiddleware, LoadController.updateLoad);

// Soft delete a Load (requires delete permission on Load table)
router.delete('/:id', authMiddleware, LoadController.deleteLoad);

// Hard delete a Load (requires delete permission on Load table)
router.delete('/:id/hard', authMiddleware, LoadController.hardDeleteLoad);

module.exports = router;
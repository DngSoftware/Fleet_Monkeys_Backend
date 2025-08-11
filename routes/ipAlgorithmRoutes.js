const express = require('express');
const router = express.Router();
const IPAlgorithmController = require('../controllers/ipAlgorithmController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all IPAlgorithms (requires read permission on IPAlgorithm table)
router.get('/', authMiddleware,IPAlgorithmController.getAllIPAlgorithms);

// Get a single IPAlgorithm by ID (requires read permission on IPAlgorithm table)
router.get('/:id', authMiddleware, IPAlgorithmController.getIPAlgorithm);

// Create a new IPAlgorithm (requires write permission on IPAlgorithm table)
router.post('/', authMiddleware,  IPAlgorithmController.createIPAlgorithm);

// Update an IPAlgorithm (requires update permission on IPAlgorithm table)
router.put('/:id', authMiddleware, IPAlgorithmController.updateIPAlgorithm);

// Delete an IPAlgorithm (requires delete permission on IPAlgorithm table)
router.delete('/:id', authMiddleware, IPAlgorithmController.deleteIPAlgorithm);

module.exports = router;
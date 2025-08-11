const express = require('express');
const router = express.Router();
const LoadTrailerController = require('../controllers/loadTrailerController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all LoadTrailers with pagination (requires read permission on LoadTrailer table)
router.get('/', authMiddleware,  LoadTrailerController.getAllLoadTrailers);

// Get a single LoadTrailer by ID (requires read permission on LoadTrailer table)
router.get('/:id', authMiddleware, LoadTrailerController.getLoadTrailer);

// Create a new LoadTrailer (requires write permission on LoadTrailer table)
router.post('/', authMiddleware, LoadTrailerController.createLoadTrailer);

// Update a LoadTrailer (requires update permission on LoadTrailer table)
router.put('/:id', authMiddleware,  LoadTrailerController.updateLoadTrailer);

// Delete a LoadTrailer (requires delete permission on LoadTrailer table)
router.delete('/:id', authMiddleware, LoadTrailerController.deleteLoadTrailer);

module.exports = router;
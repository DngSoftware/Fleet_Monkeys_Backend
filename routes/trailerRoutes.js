const express = require('express');
const router = express.Router();
const TrailerController = require('../controllers/trailerController');
const authMiddleware = require('../middleware/authMiddleware');
// const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all Trailers with pagination (requires read permission on Trailer table)
router.get('/', authMiddleware, TrailerController.getAllTrailers);

// Get a single Trailer by ID (requires read permission on Trailer table)
router.get('/:id', authMiddleware,  TrailerController.getTrailer);

// Create a new Trailer (requires write permission on Trailer table)
router.post('/', authMiddleware, TrailerController.createTrailer);

// Update a Trailer (requires update permission on Trailer table)
router.put('/:id', authMiddleware, TrailerController.updateTrailer);

// Delete a Trailer (requires delete permission on Trailer table)
router.delete('/:id', authMiddleware,  TrailerController.deleteTrailer);

module.exports = router;
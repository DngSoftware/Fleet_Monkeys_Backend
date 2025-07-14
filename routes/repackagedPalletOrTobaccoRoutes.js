const express = require('express');
const router = express.Router();
const RepackagedPalletOrTobaccoController = require('../controllers/repackagedPalletOrTobaccoController');
const authMiddleware = require('../middleware/authMiddleware');
// const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
// const permissionMiddleware = require('../middleware/permissionMiddleware');


// Get a single Repackaged Pallet or Tobacco by ID (requires read permission)
router.get('/:id', authMiddleware, RepackagedPalletOrTobaccoController.getRepackagedPalletOrTobacco);

// Create a new Repackaged Pallet or Tobacco (requires write permission)
router.post('/', authMiddleware,  RepackagedPalletOrTobaccoController.createRepackagedPalletOrTobacco);

// Update a Repackaged Pallet or Tobacco (requires update permission)
router.put('/:id', authMiddleware, RepackagedPalletOrTobaccoController.updateRepackagedPalletOrTobacco);

// Delete a Repackaged Pallet or Tobacco (requires delete permission)
router.delete('/:id', authMiddleware, RepackagedPalletOrTobaccoController.deleteRepackagedPalletOrTobacco);

module.exports = router;
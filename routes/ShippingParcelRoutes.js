const express = require('express');
const router = express.Router();
const ShippingParcelController = require('../controllers/ShippingParcelController');
const authMiddleware = require('../middleware/authMiddleware');
// const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

// Create a new parcel (requires write permission on ShippingParcel)
router.post('/', 
  authMiddleware, 
  ShippingParcelController.createParcel
);

// Update a parcel (requires write permission on ShippingParcel and ownership)
router.put('/:parcelID', 
  authMiddleware,
  ShippingParcelController.updateParcel
);

// Get a parcel or all parcels (requires read permission on ShippingParcel)
router.get('/:parcelID?', 
  authMiddleware,
  ShippingParcelController.getParcel
);

// Delete a parcel (requires write permission on ShippingParcel and ownership)
router.delete('/:parcelID', 
  authMiddleware, 
  ShippingParcelController.deleteParcel
);

module.exports = router;
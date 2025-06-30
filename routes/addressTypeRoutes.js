const express = require('express');
const router = express.Router();
const AddressTypeController = require('../controllers/addressTypeController');

// Get all AddressTypes
router.get('/', AddressTypeController.getAllAddressTypes);

// Create a new AddressType
router.post('/', AddressTypeController.createAddressType);

// Get a single AddressType by ID
router.get('/:id', AddressTypeController.getAddressTypeById);

// Update an AddressType
router.put('/:id', AddressTypeController.updateAddressType);

// Delete an AddressType
router.delete('/:id', AddressTypeController.deleteAddressType);

module.exports = router;
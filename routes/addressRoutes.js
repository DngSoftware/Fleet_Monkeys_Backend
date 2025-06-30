const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/addressController');

// Routes for Address management
router.get('/', AddressController.getAllAddresses); // GET /api/addresses
router.post('/', AddressController.createAddress); // POST /api/addresses
router.get('/:id', AddressController.getAddressById); // GET /api/addresses/:id
router.put('/:id', AddressController.updateAddress); // PUT /api/addresses/:id
router.delete('/:id', AddressController.deleteAddress); // DELETE /api/addresses/:id

module.exports = router;

const express = require('express');
const router = express.Router();
const CustomerAddressController = require('../controllers/customerAddressController');

// Create a new customer-address linkage
router.post('/', CustomerAddressController.createCustomerAddress);

// Get all addresses for a customer
router.get('/:customerId', CustomerAddressController.getAllAddressesByCustomerId);

// Get a customer-address linkage by CustomerID and AddressID
router.get('/:customerId/:addressId', CustomerAddressController.getCustomerAddress);

// Update a customer-address linkage
router.put('/:customerId/:addressId', CustomerAddressController.updateCustomerAddress);

// Delete a customer, address, or customer-address linkage
router.delete('/:customerId?/:addressId?', CustomerAddressController.deleteCustomerAddress);

module.exports = router;
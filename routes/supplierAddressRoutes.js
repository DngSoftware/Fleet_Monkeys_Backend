const express = require('express');
const router = express.Router();
const SupplierAddressController = require('../controllers/supplierAddressController');

// Create a new supplier-address linkage
router.post('/', SupplierAddressController.createSupplierAddress);

// Get all addresses for a supplier
router.get('/:supplierId', SupplierAddressController.getAllAddressesBySupplierId);

// Get a supplier-address linkage by SupplierID and AddressID
router.get('/:supplierId/:addressId', SupplierAddressController.getSupplierAddress);

// Update a supplier-address linkage
router.put('/:supplierId/:addressId', SupplierAddressController.updateSupplierAddress);

// Delete a supplier, address, or supplier-address linkage
router.delete('/:supplierId?/:addressId?', SupplierAddressController.deleteSupplierAddress);

module.exports = router;
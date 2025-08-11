const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplierController');

// Routes for Supplier management
router.get('/', SupplierController.getAllSuppliers); // GET /api/suppliers
router.post('/', SupplierController.createSupplier); // POST /api/suppliers
router.get('/:id', SupplierController.getSupplierById); // GET /api/suppliers/:id
router.put('/:id', SupplierController.updateSupplier); // PUT /api/suppliers/:id
router.delete('/:id', SupplierController.deleteSupplier); // DELETE /api/suppliers/:id

module.exports = router;
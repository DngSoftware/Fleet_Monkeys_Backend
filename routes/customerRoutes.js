const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');

// Routes for Customer management
router.get('/', CustomerController.getAllCustomers); // GET /api/customers
router.post('/', CustomerController.createCustomer); // POST /api/customers
router.get('/:id', CustomerController.getCustomerById); // GET /api/customers/:id
router.put('/:id', CustomerController.updateCustomer); // PUT /api/customers/:id
router.delete('/:id', CustomerController.deleteCustomer); // DELETE /api/customers/:id

module.exports = router;
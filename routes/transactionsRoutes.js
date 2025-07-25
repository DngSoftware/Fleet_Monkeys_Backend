const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Retrieve a specific transaction by ID
router.get('/:transactionId', transactionController.getTransaction);

// Create a new transaction
router.post('/', transactionController.createTransaction);

// Update an existing transaction
router.put('/:transactionId', transactionController.updateTransaction);

// Delete a transaction
router.delete('/:transactionId', transactionController.deleteTransaction);

module.exports = router;
const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get a single Transaction by ID (requires read permission on Transactions table)
router.get('/:id', authMiddleware, TransactionController.getTransaction);

// Create a new Transaction (requires write permission on Transactions table)
router.post('/', authMiddleware,  TransactionController.createTransaction);

// Update a Transaction (requires update permission on Transactions table)
router.put('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('update'), TransactionController.updateTransaction);

// Delete a Transaction (requires delete permission on Transactions table)
router.delete('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('delete'), TransactionController.deleteTransaction);

module.exports = router;
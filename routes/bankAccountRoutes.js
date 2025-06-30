const express = require('express');
const router = express.Router();
const BankAccountController = require('../controllers/bankAccountController');

// Get all BankAccounts
router.get('/', BankAccountController.getAllBankAccounts);

// Create a new BankAccount
router.post('/', BankAccountController.createBankAccount);

// Get a single BankAccount by ID
router.get('/:id', BankAccountController.getBankAccountById);

// Update a BankAccount
router.put('/:id', BankAccountController.updateBankAccount);

// Delete a BankAccount
router.delete('/:id', BankAccountController.deleteBankAccount);

module.exports = router;
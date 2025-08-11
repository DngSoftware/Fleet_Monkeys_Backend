const express = require('express');
const router = express.Router();
const CurrencyController = require('../controllers/currencyController');

// Get all currencies (paginated)
router.get('/', CurrencyController.getAllCurrencies);

// Create a new currency
router.post('/', CurrencyController.createCurrency);

// Get a currency by ID
router.get('/:id', CurrencyController.getCurrencyById);

// Update a currency
router.put('/:id', CurrencyController.updateCurrency);

// Delete a currency
router.delete('/:id', CurrencyController.deleteCurrency);

module.exports = router;
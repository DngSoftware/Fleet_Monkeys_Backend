const express = require('express');
const router = express.Router();
const TaxChargesTypeController = require('../controllers/taxChargesTypeController');

// Routes for Tax Charge Type management
router.get('/', TaxChargesTypeController.getAllTaxChargesTypes); // GET /api/tax-charges-types
router.post('/', TaxChargesTypeController.createTaxChargesType); // POST /api/tax-charges-types
router.get('/:id', TaxChargesTypeController.getTaxChargesTypeById); // GET /api/tax-charges-types/:id
router.put('/:id', TaxChargesTypeController.updateTaxChargesType); // PUT /api/tax-charges-types/:id
router.delete('/:id', TaxChargesTypeController.deleteTaxChargesType); // DELETE /api/tax-charges-types/:id

module.exports = router;
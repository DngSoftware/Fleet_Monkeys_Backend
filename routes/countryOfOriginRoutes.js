const express = require('express');
const router = express.Router();
const CountryOfOriginController = require('../controllers/countryOfOriginController');

// Routes for Country of Origin management
router.get('/', CountryOfOriginController.getAllCountriesOfOrigin); // GET /api/countries-of-origin
router.post('/', CountryOfOriginController.createCountryOfOrigin); // POST /api/countries-of-origin
router.get('/:id', CountryOfOriginController.getCountryOfOriginById); // GET /api/countries-of-origin/:id
router.put('/:id', CountryOfOriginController.updateCountryOfOrigin); // PUT /api/countries-of-origin/:id
router.delete('/:id', CountryOfOriginController.deleteCountryOfOrigin); // DELETE /api/countries-of-origin/:id

module.exports = router;
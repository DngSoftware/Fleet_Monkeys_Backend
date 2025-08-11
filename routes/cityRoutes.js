const express = require('express');
const router = express.Router();
const CityController = require('../controllers/cityController');

// Get all cities (paginated)
router.get('/', CityController.getAllCities);

// Create a new city
router.post('/', CityController.createCity);

// Get a city by ID
router.get('/:id', CityController.getCityById);

// Update a city
router.put('/:id', CityController.updateCity);

// Delete a city
router.delete('/:id', CityController.deleteCity);

module.exports = router;
const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicleController');

// Routes for Vehicle management
router.get('/', VehicleController.getAllVehicles); // GET /api/vehicles
router.post('/', VehicleController.createVehicle); // POST /api/vehicles
router.get('/:id', VehicleController.getVehicleById); // GET /api/vehicles/:id
router.put('/:id', VehicleController.updateVehicle); // PUT /api/vehicles/:id
router.delete('/:id', VehicleController.deleteVehicle); // DELETE /api/vehicles/:id

module.exports = router;
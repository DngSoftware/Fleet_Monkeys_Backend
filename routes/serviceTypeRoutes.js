const express = require('express');
const router = express.Router();
const ServiceTypeController = require('../controllers/serviceTypeController');

// Routes for Service Type management
router.get('/', ServiceTypeController.getAllServiceTypes); // GET /api/service-types
router.post('/', ServiceTypeController.createServiceType); // POST /api/service-types
router.get('/:id', ServiceTypeController.getServiceTypeById); // GET /api/service-types/:id
router.put('/:id', ServiceTypeController.updateServiceType); // PUT /api/service-types/:id
router.delete('/:id', ServiceTypeController.deleteServiceType); // DELETE /api/service-types/:id

module.exports = router;
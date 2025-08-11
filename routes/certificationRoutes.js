const express = require('express');
const router = express.Router();
const CertificationController = require('../controllers/certificationController');

// Get all certifications (paginated)
router.get('/', CertificationController.getAllCertifications);

// Create a new certification
router.post('/', CertificationController.createCertification);

// Get a certification by ID
router.get('/:id', CertificationController.getCertificationById);

// Update a certification
router.put('/:id', CertificationController.updateCertification);

// Delete a certification
router.delete('/:id', CertificationController.deleteCertification);

module.exports = router;
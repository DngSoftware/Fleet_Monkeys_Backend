const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');

// Get all companies (paginated)
router.get('/', CompanyController.getAllCompanies);

// Create a new company
router.post('/', CompanyController.createCompany);

// Get a company by ID
router.get('/:id', CompanyController.getCompanyById);

// Update a company
router.put('/:id', CompanyController.updateCompany);

// Delete a company
router.delete('/:id', CompanyController.deleteCompany);

module.exports = router;
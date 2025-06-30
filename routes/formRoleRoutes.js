const express = require('express');
const router = express.Router();
const FormRoleController = require('../controllers/formRoleController');

// Routes for FormRole management
router.get('/', FormRoleController.getAllFormRoles); // GET /api/form-roles
router.post('/', FormRoleController.createFormRole); // POST /api/form-roles
router.get('/:id', FormRoleController.getFormRoleById); // GET /api/form-roles/:id
router.put('/:id', FormRoleController.updateFormRole); // PUT /api/form-roles/:id
router.delete('/:id', FormRoleController.deleteFormRole); // DELETE /api/form-roles/:id

module.exports = router;
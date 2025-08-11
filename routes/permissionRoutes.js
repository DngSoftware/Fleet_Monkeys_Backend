const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/permissionController');

// Get all permissions (paginated)
router.get('/', PermissionController.getAllPermissions);

// Create a new permission
router.post('/', PermissionController.createPermission);

// Get a permission by ID
router.get('/:id', PermissionController.getPermissionById);

// Update a permission
router.put('/:id', PermissionController.updatePermission);

// Delete a permission
router.delete('/:id', PermissionController.deletePermission);

module.exports = router;
const express = require('express');
const router = express.Router();
const RolePermissionController = require('../controllers/rolePermissionController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Get all RolePermissions (requires read permission)
router.get('/', authMiddleware,  RolePermissionController.getAllRolePermissions);

// Get a single RolePermission by ID (requires read permission)
router.get('/:id', authMiddleware,  RolePermissionController.getRolePermission);

// Create a new RolePermission (requires write permission)
router.post('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('write'), RolePermissionController.createRolePermission);

// Update a RolePermission (requires update permission)
router.put('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('update'), RolePermissionController.updateRolePermission);

// Delete a RolePermission (requires delete permission)
router.delete('/:id', authMiddleware, tableAccessMiddleware, permissionMiddleware('delete'), RolePermissionController.deleteRolePermission);

module.exports = router;
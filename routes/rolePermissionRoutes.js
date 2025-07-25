const express = require('express');
const router = express.Router();
const RolePermissionController = require('../controllers/rolePermissionController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');

router.get('/', authMiddleware, RolePermissionController.getAllRolePermissions);
router.get('/role/:roleId', authMiddleware, RolePermissionController.getRolePermissionsByRoleId);
router.get('/:id', authMiddleware, RolePermissionController.getRolePermission);
router.post('/', authMiddleware, tableAccessMiddleware, RolePermissionController.createRolePermission);
router.post('/bulk', authMiddleware, tableAccessMiddleware, RolePermissionController.createBulkRolePermissions);
router.put('/role/:roleId', authMiddleware, tableAccessMiddleware, RolePermissionController.updateRolePermissionsByRoleId);
router.put('/:id', authMiddleware, tableAccessMiddleware, RolePermissionController.updateRolePermission);
router.delete('/:id', authMiddleware, tableAccessMiddleware, RolePermissionController.deleteRolePermission);

module.exports = router;
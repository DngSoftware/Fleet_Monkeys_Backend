const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');
const tableAccessMiddleware = require('../middleware/tableAccessMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Routes for Role management
router.get('/', authMiddleware, tableAccessMiddleware, permissionMiddleware('read'), RoleController.getAllRoles); // GET /api/roles
router.post('/', RoleController.createRole); // POST /api/roles
router.get('/:id', RoleController.getRoleById); // GET /api/roles/:id
router.put('/:id', RoleController.updateRole); // PUT /api/roles/:id
router.delete('/:id', RoleController.deleteRole); // DELETE /api/roles/:id

module.exports = router;
const express = require('express');
const router = express.Router();
const FormRoleApproverController = require('../controllers/formRoleApproverController');

// Routes for FormRoleApprover management
router.get('/', FormRoleApproverController.getAllFormRoleApprovers); // GET /api/form-role-approvers
router.post('/', FormRoleApproverController.createFormRoleApprover); // POST /api/form-role-approvers
router.get('/:id', FormRoleApproverController.getFormRoleApproverById); // GET /api/form-role-approvers/:id
router.put('/:id', FormRoleApproverController.updateFormRoleApprover); // PUT /api/form-role-approvers/:id
router.delete('/:id', FormRoleApproverController.deleteFormRoleApprover); // DELETE /api/form-role-approvers/:id

module.exports = router;
const express = require('express');
const router = express.Router();
const FormController = require('../controllers/formController');

// Routes for Form management
router.get('/', FormController.getAllForms); // GET /api/forms
router.post('/', FormController.createForm); // POST /api/forms
router.get('/:id', FormController.getFormById); // GET /api/forms/:id
router.put('/:id', FormController.updateForm); // PUT /api/forms/:id
router.delete('/:id', FormController.deleteForm); // DELETE /api/forms/:id

module.exports = router;
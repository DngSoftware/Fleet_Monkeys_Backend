const express = require('express');
const router = express.Router();
const PersonController = require('../controllers/personController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Routes for Person management
router.get('/', PersonController.getAllPersons); // GET /api/persons
router.post('/', PersonController.createPerson); // POST /api/persons
router.get('/:id', PersonController.getPersonById); // GET /api/persons/:id
router.put('/:id', PersonController.updatePerson); // PUT /api/persons/:id
router.delete('/:id', PersonController.deletePerson); // DELETE /api/persons/:id
router.post('/:id/upload-image', authMiddleware, upload.single('image'), PersonController.uploadProfileImage);

module.exports = router;
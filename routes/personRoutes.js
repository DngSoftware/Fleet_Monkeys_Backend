const express = require('express');
const router = express.Router();
const PersonController = require('../controllers/personController');
const authMiddleware = require('../middleware/authMiddleware');
const { personUpload } = require('../middleware/upload');

/**
 * @route GET /api/persons
 * @desc Retrieve all persons with pagination
 * @access Public
 */
router.get('/', PersonController.getAllPersons);

/**
 * @route POST /api/persons
 * @desc Create a new person
 * @access Public
 */
router.post('/', PersonController.createPerson);

/**
 * @route GET /api/persons/:id
 * @desc Retrieve a person by ID
 * @access Public
 */
router.get('/:id', PersonController.getPersonById);

/**
 * @route PUT /api/persons/:id
 * @desc Update a person by ID
 * @access Public
 */
router.put('/:id', PersonController.updatePerson);

/**
 * @route DELETE /api/persons/:id
 * @desc Delete a person by ID
 * @access Public
 */
router.delete('/:id', PersonController.deletePerson);

/**
 * @route POST /api/persons/:id/upload-image
 * @desc Upload a profile image for a person (PNG, JPG, JPEG)
 * @access Protected (requires auth token)
 */
router.post('/:id/upload-image', authMiddleware, personUpload.single('image'), PersonController.uploadProfileImage);

module.exports = router;
const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');

// Routes for Item management
router.get('/', ItemController.getAllItems); // GET /api/items
router.post('/', ItemController.createItem); // POST /api/items
router.get('/:id', ItemController.getItemById); // GET /api/items/:id
router.put('/:id', ItemController.updateItem); // PUT /api/items/:id
router.delete('/:id', ItemController.deleteItem); // DELETE /api/items/:id

module.exports = router;
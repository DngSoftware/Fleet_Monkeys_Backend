const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');
const ImageController = require('../controllers/imageController');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', ItemController.getAllItems); // GET /api/items
router.post('/', ItemController.createItem); // POST /api/items
router.get('/:id', ItemController.getItemById); // GET /api/items/:id
router.get('/:id/image', ItemController.getItemImage); // GET /api/items/:id/image
router.put('/:id', ItemController.updateItem); // PUT /api/items/:id
router.delete('/:id', ItemController.deleteItem); // DELETE /api/items/:id

// Image management routes
router.post('/item-images', upload.single('itemImage'), ImageController.uploadImage); // POST /api/item-images
router.put('/item-images/:filename', upload.single('itemImage'), ImageController.updateImage); // PUT /api/item-images/:filename
router.delete('/item-images/:filename', ImageController.deleteImage); // DELETE /api/item-images/:filename

module.exports = router;
const express = require('express');
const router = express.Router();
const WarehouseController = require('../controllers/warehouseController');

router.get('/', WarehouseController.getAllWarehouses);
router.post('/', WarehouseController.createWarehouse);
router.get('/:id', WarehouseController.getWarehouseById);
router.put('/:id', WarehouseController.updateWarehouse);
router.delete('/:id', WarehouseController.deleteWarehouse);

module.exports = router;
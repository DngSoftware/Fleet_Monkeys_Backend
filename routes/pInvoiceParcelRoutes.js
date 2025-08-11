const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const PInvoiceParcelController = require('../controllers/pInvoiceParcelController');
const authMiddleware = require('../middleware/authMiddleware');
const { invoiceParcelUpload } = require('../middleware/upload');

// Middleware to handle Multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      data: null
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null
    });
  }
  next();
};

// Validation middleware for ID parameter
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

/**
 * @route GET /api/pInvoiceParcels
 * @desc Retrieve purchase invoice parcels by PInvoiceParcelID or PInvoiceID
 * @access Public
 */
router.get('/', PInvoiceParcelController.getPInvoiceParcels);

/**
 * @route PUT /api/pInvoiceParcels/:id
 * @desc Update a purchase invoice parcel, optionally upload a file (PDF, DOC, DOCX, PNG, JPG, JPEG)
 * @access Protected (requires auth token)
 */
router.put(
  '/:id',
  authMiddleware,
  validateId,
  invoiceParcelUpload.single('fileContent'),
  handleMulterErrors,
  PInvoiceParcelController.updatePInvoiceParcel
);

/**
 * @route DELETE /api/pInvoiceParcels/:id
 * @desc Delete a purchase invoice parcel and associated file
 * @access Protected (requires auth token)
 */
router.delete(
  '/:id',
  authMiddleware,
  validateId,
  PInvoiceParcelController.deletePInvoiceParcel
);

module.exports = router;
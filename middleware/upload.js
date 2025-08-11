const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for PInvoiceParcel
const invoiceParcelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store files in 'Uploads/' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `invoice_parcel_${req.user.personId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for PInvoiceParcel (allow PDF, DOC, DOCX, PNG, JPG, JPEG, XLSX, XLS, CSV)
const invoiceParcelFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, PNG, JPG, JPEG, XLSX, XLS, and CSV files are allowed'), false);
  }
};

// Multer configuration for PInvoiceParcel
const invoiceParcelUpload = multer({
  storage: invoiceParcelStorage,
  fileFilter: invoiceParcelFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure storage for Person uploads
const personStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store images in 'Uploads/' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `person_${req.user.personId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for Person (allow PNG, JPG, JPEG)
const personFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, and JPEG files are allowed'), false);
  }
};

// Multer configuration for Person
const personUpload = multer({
  storage: personStorage,
  fileFilter: personFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = {
  personUpload,
  invoiceParcelUpload
};
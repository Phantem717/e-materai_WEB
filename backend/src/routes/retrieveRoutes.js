const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authCheck = require('../middleware/authMiddleware.js');
const { getTypeController, getJsonController } = require('../controllers/retrieveController');
const { STAMP_DIR } = require('../services/saveFileService');
// The error occurred here because one of the arguments was not a function.
router.get('/get-type',authCheck,getTypeController); 
// Define upload directory

// Ensure the STAMP directory exists
if (!fs.existsSync(STAMP_DIR)) {
  fs.mkdirSync(STAMP_DIR, { recursive: true });
  console.log('✅ Created STAMP directory:', STAMP_DIR);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Multer saving to:', STAMP_DIR);
    cb(null, STAMP_DIR);
  },
  filename: (req, file, cb) => {
    console.log('📄 Saving file as:', file.originalname);
    cb(null, file.originalname); // Keep original name
  }
});

// Create Multer instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('🔍 File check:', file.originalname, file.mimetype);
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// 🧩 Routes
router.get('/get-type', authCheck, getTypeController);

// ✅ Multer now handles PDF upload for this route
router.post(
  '/get-json/:batchId',
  authCheck,
  upload.array('files', 50),
  (req, res, next) => {
    console.log('=== AFTER MULTER ===');
    console.log('Files:', req.files?.length || 0);
    console.log('Body keys:', Object.keys(req.body || {}));
    next();
  },
  getJsonController
);
module.exports = router;
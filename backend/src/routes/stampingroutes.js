// src/routes/ButtonRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const {
    BatchProcessController
} = require('../controllers/stampingController');
const authCheck = require('../middleware/authMiddleware.js');

// Define upload directory
const UNSIGNED_DIR = path.join('/home/sirs/signadapter/sharefolder/UNSIGNED');

// Ensure directory exists
if (!fs.existsSync(UNSIGNED_DIR)) {
    fs.mkdirSync(UNSIGNED_DIR, { recursive: true });
    console.log('✅ Created UNSIGNED directory:', UNSIGNED_DIR);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('📁 Multer destination:', UNSIGNED_DIR);
        cb(null, UNSIGNED_DIR);
    },
    filename: (req, file, cb) => {
        // Keep original filename or add timestamp if you want uniqueness
        const filename = file.originalname;
        console.log('📄 Saving file as:', filename);
        cb(null, filename);
    }
});

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('🔍 File check:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype
        });
        
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB per file
    }
});

// ✅ Apply middleware in correct order: auth -> multer -> controller
router.post('/batch-process',
    authCheck,                      // 1. Check authentication first
    upload.array('files', 50),      // 2. Parse multipart/form-data and save files
    (req, res, next) => {           // 3. Debug middleware (optional)
        console.log('=== AFTER MULTER ===');
        console.log('Files count:', req.files?.length || 0);
        console.log('Body keys:', Object.keys(req.body || {}));
        
        if (req.files && req.files.length > 0) {
            console.log('Files uploaded:');
            req.files.forEach((file, i) => {
                console.log(`  ${i + 1}. ${file.originalname} (${file.size} bytes) -> ${file.path}`);
            });
        }
        
        next();
    },
    BatchProcessController          // 4. Handle the request
);

module.exports = router;
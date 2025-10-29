// controllers/batch.controller.js
const { batchProcessing } = require('../services/stampingService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BatchProcessController = async (req, res) => {
    // Configure multer storage
      const UNSIGNED_DIR = path.join('/home/sirs/signadapter/sharefolder');
      console.log("DIR",UNSIGNED_DIR);
    // OR if it's on the same level as your project:
    // const UNSIGNED_DIR = '/home/sirs/signadapter/sharefolder/UNSIGNED';
    // OR for Windows:
    // const UNSIGNED_DIR = 'C:/E-MATERAI/signadapter/sharefolder/UNSIGNED';

    // ✅ Create directory if it doesn't exist
    if (!fs.existsSync(UNSIGNED_DIR)) {
        fs.mkdirSync(UNSIGNED_DIR, { recursive: true });
        console.log('✅ Created directory:', UNSIGNED_DIR);
    }

    // Configure multer storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log('📁 Saving to:', UNSIGNED_DIR);
            cb(null, UNSIGNED_DIR);
        },
        filename: (req, file, cb) => {
            const filename = `${file.originalname}`;
            console.log('📄 Filename:', filename);
            cb(null, filename);
        }
    });

    const upload = multer({ 
        storage: storage,
        fileFilter: (req, file, cb) => {
            console.log('🔍 Checking file:', file.originalname, file.mimetype);
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only PDF files allowed'));
            }
        },
        limits: {
            fileSize: 50 * 1024 * 1024  // 50MB limit
        }
    }).array('files', 50);

    // Execute multer upload
    try {
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) {
                    console.error('❌ Multer upload error:', err);
                    reject(err);
                } else {
                    console.log('✅ Multer upload complete');
                    resolve();
                }
            });
        });
    } catch (uploadError) {
        console.error('❌ Upload failed:', uploadError);
        return res.status(400).json({
            statusCode: 1,
            message: 'File upload failed',
            error: uploadError.message
        });
    }

    try {
        console.log("AUTH BATCH", req.headers);
        console.log("Uploaded files:", req.files);  // ✅ Now populated!
        console.log("Body:", req.body);

        const headers = req.headers["authorization"];

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                statusCode: 1,
                message: 'No files uploaded' 
            });
        }

        // Parse metadata from body
        const metadata = JSON.parse(req.body.metadata || '[]');
        const spesimenPath = req.body.spesimenPath || '/app/sharefolder/STAMP/default.png';

        // Build documents with uploaded file paths
        const payload = req.files.map((file, index) => {
            const meta = metadata[index] || {};
            
            return {
                ...meta,  // Merge metadata from frontend
                src: `/app/sharefolder/UNSIGNED/${file.filename}`,  // Docker path
                // spesimenPath: spesimenPath,
                file: file.originalname,
                size: file.size
            };
        });

        console.log("Documents to process:", payload);

        // Process stamping
        const data = await batchProcessing( payload , headers);
        
        return res.status(200).json({
            statusCode: 0,
            message: 'Batch processing successful',
            totalProcessed: payload.length,
            ...data
        });

    } catch (error) {
        console.error("Batch Processing Failed:", error);
        res.status(500).json({ 
            statusCode: 1,
            message: 'Failed to process batch', 
            error: error.message 
        });
    }
};

module.exports = { BatchProcessController };
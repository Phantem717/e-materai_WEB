// controllers/batch.controller.js
const { batchProcessing,stamping } = require('../services/stampingService');
const {getStamp,getDocumentByName} = require('../services/retrieveServices');
const responsesModel = require('../models/responseModel')
const path = require('path');
const fs = require('fs');
const SIGNED_DIR = process.env.PATH_SIGNED;

const BatchProcessController = async (req, res) => {
     // Execute multer upload
    try {
        console.log("=== BATCH CONTROLLER ===");
        console.log("Files received:", req.files?.length || 0);
        console.log("Body:", req.body);

        const headers = req.headers["authorization"];
        
        // Check if files were uploaded (multer already ran)
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                statusCode: 1,
                message: 'No files uploaded',
                debug: {
                    hasFiles: !!req.files,
                    filesLength: req.files?.length || 0,
                    bodyKeys: Object.keys(req.body || {}),
                    contentType: req.headers['content-type']
                }
            });
        }

        console.log("✅ Files saved by multer:");
        req.files.forEach(file => {
            console.log(`  - ${file.originalname} -> ${file.path}`);
        });

        // Parse metadata from body
        const metadata = JSON.parse(req.body.metadata || '[]');

        // Build documents with uploaded file paths
        const payload = req.files.map((file, index) => {
            const meta = metadata[index] || {};
            
            return {
                ...meta,
                src: file.path, // Use the actual file path from multer
                file: file.originalname,
                size: file.size
            };
        });

        console.log("Documents to process:", payload);

        // Process stamping
        const data = await batchProcessing(payload, headers);
        
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

const stampingController = async (req,res) => {
      try {
        console.log("=== BATCH CONTROLLER ===");
        console.log("Body:", req.body);
        const {fileName,tipeDokumen} = req.body
        const headers = req.headers["authorization"];
        const filePath = path.join(SIGNED_DIR, `FINAL_${fileName}.pdf`);
        console.log("FILEAPTH",filePath);
        
        const [file,stamp,serial_number] = await Promise.all([
            await getDocumentByName(fileName),
            await getStamp(fileName),
            await responsesModel.findSerialNumberByDocId(fileName)
        ]);
        console.log("FILE",file, serial_number);
        const payload = {
            src: file,
            spesimenPath: stamp,
            token : headers,
            dest: filePath,
            type: tipeDokumen,
            refToken: serial_number[0]?.serial_number
        }
        
        const data = await stamping(payload, headers);
        
        return res.status(200).json({
            statusCode: 0,
            message: 'Stamping processing successful',
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
}

module.exports = { BatchProcessController,stampingController };

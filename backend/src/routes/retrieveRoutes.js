const express = require('express');
const router = express.Router();
const authCheck = require('../middleware/authMiddleware.js');
const { getTypeController, getJsonController,getFilesController,getFilesControllerSigned } = require('../controllers/retrieveController');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ============================================
// ROUTES
// ============================================
const UNSIGNED_DIR = path.join(process.env.PATH_UNSIGNED);
const STAMP_DIR = path.join(process.env.PATH_STAMP);
const SIGNED_DIR = path.join(process.env.PATH_SIGNED);
// ✅ GET document types - Simple GET, no files needed
router.get('/get-type', authCheck, getTypeController);

// ✅ GET JSON by batchId - Simple GET, no files needed
// GET requests DON'T upload files, so NO multer needed
router.get(
  '/get-json/:batchId',
  authCheck,
  (req, res, next) => {
    console.log('=== GET JSON REQUEST ===');
    console.log('BatchId param:', req.params.batchId);
    console.log('Query params:', req.query);
    next();
  },
  getJsonController
);

router.get('/get-files/:time/:folder', authCheck, getFilesController)
const allowedOrigin = process.env.PDF_URL;

router.get('/files/:filename/:folder', (req, res) => {
  const { filename,folder } = req.params;
  let filePath;
  if(folder == "signed"){filePath = path.join(SIGNED_DIR, filename); } else{   filePath = path.join(UNSIGNED_DIR, filename); }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // ✅ Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin); 
  res.setHeader('Access-Control-Allow-Credentials', 'true'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET'); 
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // ✅ PDF headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending PDF:", err);
      res.status(500).send("Failed to send file");
    }
  });
});


module.exports = router;

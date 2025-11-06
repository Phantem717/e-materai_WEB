const express = require('express');
const router = express.Router();
const authCheck = require('../middleware/authMiddleware.js');
const { getTypeController, getJsonController,getFilesController } = require('../controllers/retrieveController');
const path = require('path');
const fs = require('fs');
// ============================================
// ROUTES
// ============================================
const UNSIGNED_DIR = path.join(process.env.PATH_UNSIGNED);

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

router.get('/get-files/:time', authCheck, getFilesController);


router.get('/files/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UNSIGNED_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline"); // IMPORTANT

  res.sendFile(filePath);
});
module.exports = router;
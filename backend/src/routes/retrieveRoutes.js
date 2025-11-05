const express = require('express');
const router = express.Router();
const authCheck = require('../middleware/authMiddleware.js');
const { getTypeController, getJsonController } = require('../controllers/retrieveController');

// ============================================
// ROUTES
// ============================================

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

module.exports = router;

// ============================================
// NOTES:
// ============================================
// 1. ❌ DON'T use multer on GET routes
//    - GET requests retrieve data, they don't upload files
//    - Multer is only for POST/PUT/PATCH routes with multipart/form-data
//
// 2. ❌ DON'T configure multer storage for QR images here
//    - QR images are saved by the controller using saveQR() function
//    - They come as base64 strings from the API response, not as file uploads
//
// 3. ✅ The /get-type route is correct - simple GET with auth
//
// 4. ✅ The /get-json/:batchId route is now correct:
//    - Uses route parameter :batchId (e.g., /get-json/abc123)
//    - No file upload handling
//    - Just retrieves and processes JSON data
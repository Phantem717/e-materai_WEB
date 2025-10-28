// src/routes/ButtonRoutes.js
const express = require('express');
const router = express.Router();
const {
  CreateQRController // This must be a function!
} = require('../controllers/createQRController');
const authCheck = require('../middleware/authMiddleware.js'); // This must be a function!

// The error occurred here because one of the arguments was not a function.
router.post('/batch-qr',authCheck,CreateQRController); 

module.exports = router;
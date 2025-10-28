// src/routes/ButtonRoutes.js
const express = require('express');
const router = express.Router();
const {
    BatchProcessController
   // This must be a function!
} = require('../controllers/stampingController');
const authCheck = require('../middleware/authMiddleware.js'); // This must be a function!

// The error occurred here because one of the arguments was not a function.
router.post('/batch-process',authCheck,BatchProcessController); 

module.exports = router;
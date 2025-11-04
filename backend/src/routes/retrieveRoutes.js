// src/routes/ButtonRoutes.js
const express = require('express');
const router = express.Router();
const {
    getTypeController,
    getJsonController
   // This must be a function!
} = require('../controllers/retrieveController');
const authCheck = require('../middleware/authMiddleware.js'); // This must be a function!

// The error occurred here because one of the arguments was not a function.
router.get('/get-type',authCheck,getTypeController); 
router.get('/get-json/:batchId',authCheck,getJsonController)
module.exports = router;
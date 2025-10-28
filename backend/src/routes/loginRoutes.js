// src/routes/ButtonRoutes.js
const express = require('express');
const router = express.Router();
const {
  checkLoginController // This must be a function!
} = require('../controllers/loginController');
const authCheck = require('../middleware/authMiddleware.js'); // This must be a function!

// The error occurred here because one of the arguments was not a function.
router.post('/',authCheck,checkLoginController); 

module.exports = router;
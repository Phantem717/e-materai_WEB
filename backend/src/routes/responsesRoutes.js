// src/routes/ButtonRoutes.js
const express = require('express');
const router = express.Router();
const {
    findByIdController,
    insertController,
    getAllController,
    deleteController
   // This must be a function!
} = require('../controllers/responsesController');
const authCheck = require('../middleware/authMiddleware.js'); // This must be a function!

// The error occurred here because one of the arguments was not a function.
router.delete('/delete/:docId',authCheck,deleteController);
router.get('/',getAllController);
router.get('/:docId',findByIdController);
router.post('/',insertController);

module.exports = router;
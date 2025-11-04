// routes/webhook.routes.js
const express = require('express');
const router = express.Router();
const { WebhookController } = require('../controllers/webhookController');

// Webhook endpoint (Signadapter calls this)

// API to get results
router.get('/results', WebhookController.receiveStampingResult);

module.exports = router;
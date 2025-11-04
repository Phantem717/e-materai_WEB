// controllers/webhook.controller.js
const WebhookController = {
    receiveStampingResult: async (req, res) => {
        try {
            console.log('=== WEBHOOK RECEIVED ===');
            console.log(JSON.stringify(req.body, null, 2));

            const result = req.body;

            // Just log it, don't store
            console.log('Serial Number:', result.result?.serialNumber);
            console.log('Document:', result.result?.document?.file);

            // Send success response
            return res.status(200).json({
                statusCode: 0,
                message: 'Received'
            });

        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({
                statusCode: 1,
                error: error.message
            });
        }
    }
};

module.exports = { WebhookController };
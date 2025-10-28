const axios = require('axios');
require('dotenv').config();

const INVENTORY_URL= process.env.INVENTORY_URL;

async function batchQR(payload,headers) {
    try {      

        const response = await axios({
            method: 'post',
            url: `${INVENTORY_URL}/api/v2/serialnumber/batch`,
            data: { 
                return_url: payload.return_url,
                tipe: payload.tipe,
                partial: payload.partial,
                document: payload.document
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': headers
            }
        });
        console.log("RESPONSE BATCH",response);
        return response.data;
    } catch (error) {
        console.error("BATCH Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`CREATE QR failed: ${error.response?.data?.message || error.message}`);
    }
}

module.exports = { batchQR};
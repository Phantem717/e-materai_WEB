const axios = require('axios');
require('dotenv').config();

const INVENTORY_URL= process.env.INVENTORY_URL;
const HOST= process.env.HOST;
const PORT = process.env.PORT;

const return_url = `http://${HOST}:${PORT}`
async function batchProcessing(payload,headers) {
    try {      
        console.log("PAYLOAD",payload);
        const response = await axios({
            method: 'post',
            url: `${INVENTORY_URL}/api/v2/serialnumber/batch`,
            data: { 
                return_url: return_url,
                tipe: payload.nilaidoc,
                partial: true,
                document: payload
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
        throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
}

module.exports = {batchProcessing};
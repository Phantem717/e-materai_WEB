const axios = require('axios');
require('dotenv').config();

const STAMP_URL= process.env.STAMP_URL;

async function getTypes(header) {
    try {      

        const response = await axios({
            method: 'get',
            url: `${STAMP_URL}/jenisdoc`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': header
            }
        });
        console.log("RESPONSE BATCH",response);
        return response.data;
    } catch (error) {
        console.error("GET TYPE Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`GET TYPE failed: ${error.response?.data?.message || error.message}`);
    }
}

module.exports = { getTypes};
const axios = require('axios');
require('dotenv').config();

const STAMP_URL= process.env.STAMP_URL;
const return_url = process.env.DISPLAY_URL

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


async function retrieveJSON(batchId){
    try {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(2000)
        const response = await axios ({
            method: 'get',
            url: return_url
        });
        // console.log("RESPONSES",response.data[0]);

        const data = response.data;
        console.log("BID",batchId); // "object"
        // console.log("All batchIds:", response.data.map(i => i.result.batchId));
// console.log("Looking for:", batchId);
        const found = data.filter(item => {
            console.log(item.result.batchId)
            return item.result.batchId == batchId});
        console.log("FOUND",found);
        return found;
    } catch (error) {
        console.error("JSON RETRIEVAL Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`JSON RETRIVEAL failed: ${error.response?.data?.message || error.message}`);
    }
}


module.exports = { getTypes,retrieveJSON};

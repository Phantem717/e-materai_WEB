const axios = require('axios');
require('dotenv').config();

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const STAMP_URL= process.env.STAMP_URL;
const return_url = process.env.DISPLAY_URL;
const UNSIGNED_DIR = path.join(process.env.PATH_UNSIGNED);


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
        // console.log("RESPONSE BATCH",response);
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
        // console.log("RESPONSE",response.data);
        const data = response.data;
        // console.log("BID",batchId); // "object"
        // console.log("All batchIds:", response.data.map(i => i.result.batchId));
// console.log("Looking for:", batchId);
        const found = data.filter(item => {
            // console.log(item.result.batchId)
            return item.result.batchId == batchId});
        // console.log("FOUND",found);
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
const getDocumentsByBatch = async (title,type) => {
   try {
        if (!fs.existsSync(UNSIGNED_DIR)) {
            return [];
        }

        const allFiles = fs.readdirSync(UNSIGNED_DIR);
        console.log("FILES",allFiles);
        const matchingFiles = allFiles.filter(file => {
            return file.endsWith('.pdf') && file.startsWith(title);
        });

        console.log(`Files starting with "${title}":`, matchingFiles.length);

        return matchingFiles.map(filename => {
            const filePath = path.join(UNSIGNED_DIR, filename);
            const stats = fs.statSync(filePath);

            return {
                filename: filename,
                url: `${process.env.BASE_URL}/api/retrieve/files/${filename}`,
                size: stats.size,
                modified: stats.mtime,
                type: type
            };
        });

    } catch (error) {
        console.error(`Error in getFilesByPrefix:`, error);
        return [];
    }
};


module.exports = { getTypes,retrieveJSON,getDocumentsByBatch};

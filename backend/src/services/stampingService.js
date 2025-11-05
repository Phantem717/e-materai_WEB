const axios = require('axios');
require('dotenv').config();

const INVENTORY_URL= process.env.INVENTORY_URL;
const HOST= process.env.HOST;
const PORT = process.env.PORT;
const return_url = process.env.RETURN_URL;
const stamp_url = process.env.STAMPING_URL;
async function batchProcessing(payload,headers) {
    try {      
        console.log("PAYLOAD_SERVICE",payload,return_url);
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
         console.log("RESPONSE BATCH",response.data);
        return response.data;
    } catch (error) {
        console.error("BATCH Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`Processing failed: ${error.response?.data?.message || error.message}`);
    }
}

async function stamping(payload,header){
     try {      
        console.log("PAYLOAD_SERVICE",payload,return_url);
        const response = await axios({
            method: 'post',
            url: `${stamp_url}/adapter/pdfsigning/rest/docSigningZ`,
            data: { 
                certificatelevel: "NOT_CERTIFIED",
                dest: payload.dest,
                docpass: "",
                jwToken: header,
                location: "JAKARTA",
                profileName: "emeteraicertificateSigner",
                reason: "Akta Pejabat",
                refToken: payload.serial,
                spesimenPath: payload.qr,
                src: payload.src,
                visLLX: 237,
                visLLY: 559,
                visURX: 337,
                visURY: 459,
                visSignaturePage: 1
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': headers
            }
        });
         console.log("RESPONSE BATCH",response.data);
        return response.data;
    } catch (error) {
        console.error("BATCH Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`Processing failed: ${error.response?.data?.message || error.message}`);
    }
} 

module.exports = {batchProcessing,stamping};

const axios = require('axios');
require('dotenv').config();
const generateSignature = require('../utils/signature');

// const consID = process.env.CONS_ID_FARMASI;
// const PASSWORD = process.env.PASSWORD;
const API_URL= process.env.API_URL;

console.log("API",API_URL);
async function login(username, password) {
    try {      
        console.log("CRED",username,password);
        const response = await axios({
            method: 'post',
            url: `${API_URL}/api/users/login`,
            data: { 
                user: username,
                password: password 
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("RESPONSE LOGIN",response);
        return response.data;
    } catch (error) {
        console.error("Login Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
}

module.exports = { login };
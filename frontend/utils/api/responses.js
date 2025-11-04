import axios from "axios";
import generateSignature from "../signature";

const HOST = process.env.NEXT_PUBLIC_API_HOST;
const PORT = process.env.NEXT_PUBLIC_API_PORT;
const CONS_ID = process.env.NEXT_PUBLIC_CONS_ID;
const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;

const BASE_URL = `http://${HOST}:${PORT}`;

const ResponseAPI = {

    getAll: async (token) => {
        try {
            const { timestamp, signature } = generateSignature(CONS_ID, API_KEY);
            
            // Debug logging
            console.log("=== Response API DEBUG ===");
            console.log("Token:", token);
            console.log("Headers:", {
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature,
                'Authorization': `Bearer ${token}`
            });

            // ✅ CORRECT: Headers in 3rd parameter (config object)
           const response = await axios.get(`${BASE_URL}/api/responses/`, {
  headers: {
    'Content-Type': 'application/json',
    'x-cons-id': CONS_ID,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'Authorization': `Bearer ${token}`
  }
});

            console.log("RESPONSES SUCCESS:", response.status);
            console.log("Response data:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("=== RESPONSE ERROR ===");
            console.error("Error message:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Request headers:", error.config?.headers);
            throw error;
        }
    },

     findById: async (token,docId) => {
        try {
            const { timestamp, signature } = generateSignature(CONS_ID, API_KEY);
            
            // Debug logging
            console.log("=== Response API DEBUG ===");
            console.log("Token:", token);
            console.log("Headers:", {
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature,
                'Authorization': `Bearer ${token}`
            });

            // ✅ CORRECT: Headers in 3rd parameter (config object)
           const response = await axios.get(`${BASE_URL}/api/responses/${encodeURIComponent(docId)}`, {
  headers: {
    'Content-Type': 'application/json',
    'x-cons-id': CONS_ID,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'Authorization': `Bearer ${token}`
  }
});

            console.log("RESPONSES SUCCESS:", response.status);
            console.log("Response data:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("=== RESPONSE ERROR ===");
            console.error("Error message:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Request headers:", error.config?.headers);
            throw error;
        }
    },
    
     insert: async (token,payload) => {
        try {
            const { timestamp, signature } = generateSignature(CONS_ID, API_KEY);
            
            // Debug logging
            console.log("=== Response API DEBUG ===");
            console.log("Token:", token);
            console.log("Headers:", {
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature,
                'Authorization': `Bearer ${token}`
            });

            // ✅ CORRECT: Headers in 3rd parameter (config object)
           const response = await axios.post(`${BASE_URL}/api/responses/`,payload, {
  headers: {
    'Content-Type': 'application/json',
    'x-cons-id': CONS_ID,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'Authorization': `Bearer ${token}`
  }
});

            console.log("RESPONSES SUCCESS:", response.status);
            console.log("Response data:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("=== RESPONSE ERROR ===");
            console.error("Error message:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Request headers:", error.config?.headers);
            throw error;
        }
    },

    delete: async (token,docId) => {
        try {
            const { timestamp, signature } = generateSignature(CONS_ID, API_KEY);
            
            // Debug logging
            console.log("=== Response API DEBUG ===");
            console.log("Token:", token);
            console.log("Headers:", {
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature,
                'Authorization': `Bearer ${token}`
            });

            // ✅ CORRECT: Headers in 3rd parameter (config object)
           const response = await axios.delete(`${BASE_URL}/api/delete/${encodeURIComponent(docId)}`, {
  headers: {
    'Content-Type': 'application/json',
    'x-cons-id': CONS_ID,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'Authorization': `Bearer ${token}`
  }
});

            console.log("RESPONSES SUCCESS:", response.status);
            console.log("Response data:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("=== RESPONSE ERROR ===");
            console.error("Error message:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Request headers:", error.config?.headers);
            throw error;
        }
    },

};



export default ResponseAPI;
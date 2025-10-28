import axios from "axios";
import generateSignature from "../signature";

const HOST = process.env.NEXT_PUBLIC_API_HOST;
const PORT = process.env.NEXT_PUBLIC_API_PORT;
const CONS_ID = process.env.NEXT_PUBLIC_CONS_ID;
const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;

const BASE_URL = `http://${HOST}:${PORT}`;

const StampingAPI = {
    BatchProcess: async (token, payload) => {
        try {
            const { timestamp, signature } = generateSignature(CONS_ID, API_KEY);
            
            // Debug logging
            console.log("=== BATCH PROCESS API DEBUG ===");
            console.log("Token:", token);
            console.log("Payload:", payload);
            console.log("Headers:", {
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature,
                'Authorization': `Bearer ${token}`
            });
            
            const headers = {
                'Content-Type': 'application/json',
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature,
                'Authorization': `Bearer ${token}`
            };
            
            // ✅ CORRECT: POST request with payload in body
            const response = await axios.post(
                `${BASE_URL}/api/stamp/batch-process`, 
                payload,  // Request body (2nd parameter)
                { headers }  // Config with headers (3rd parameter)
            );

            console.log("BATCH PROCESS SUCCESS:", response.status);
            console.log("Response data:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("=== BATCH PROCESS ERROR ===");
            console.error("Error message:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Request headers:", error.config?.headers);
            throw error;
        }
    }
};

export default StampingAPI;
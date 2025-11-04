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
            console.log("Token:", token ? "exists" : "missing");
            console.log("Payload type:", payload?.constructor?.name);
            console.log("Is FormData:", payload instanceof FormData);
            
            // Log FormData contents properly
            if (payload instanceof FormData) {
                console.log("FormData contents:");
                const entries = Array.from(payload.entries());
                console.log("Total entries:", entries.length);
                
                entries.forEach(([key, value]) => {
                    if (value instanceof File) {
                        console.log(`  ${key}: File(name="${value.name}", size=${value.size} bytes, type="${value.type}")`);
                    } else {
                        console.log(`  ${key}:`, typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value);
                    }
                });
            } else {
                console.error("ERROR: Payload is not FormData! Type:", typeof payload);
            }
            
            // ❌ REMOVED Content-Type - axios sets it automatically for FormData
            const headers = {
                // 'Content-Type': 'multipart/form-data', // ❌ DON'T SET THIS!
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature,
                'Authorization': `Bearer ${token}`
            };

            console.log("Request headers:", headers);
            const requestBody = {
                payload
            }
            // ✅ CORRECT: POST request with FormData payload
            const response = await axios.post(
                `${BASE_URL}/api/stamp/batch-process`, 
                payload,  // FormData object
                { headers }  // Headers without Content-Type
            );

            console.log("BATCH PROCESS SUCCESS:", response.status);
            console.log("Response data:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("=== BATCH PROCESS ERROR ===");
            console.error("Error message:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Response headers:", error.response?.headers);
            console.error("Request config:", error.config);
            
            // Return error in expected format
            return {
                statusCode: 1,
                message: error.response?.data?.message || error.message
            };
        }
    }
};

export default StampingAPI;
import axios from "axios";
import generateSignature from "../signature";

const HOST = process.env.NEXT_PUBLIC_API_HOST;
const PORT = process.env.NEXT_PUBLIC_API_PORT;
const CONS_ID = process.env.NEXT_PUBLIC_CONS_ID;
const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;

const BASE_URL = `http://${HOST}:${PORT}`;

const loginAPI = {
    checkLogin: async (username, password) => {
        try {
            const { timestamp, signature } = generateSignature(CONS_ID, API_KEY);
            
            // Debug logging
            console.log("=== LOGIN API DEBUG ===");
            console.log("BASE_URL:", BASE_URL);
            console.log("Username:", username);
            console.log("Password:", password ? "***" : "empty");
            console.log("Headers:", {
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature
            });

            if (!username || !password) {
                throw new Error("Username and password are required.");
            }

            // Request payload
            const requestBody = {
                username,
                password
            };

            const header = {
                        'Content-Type': 'application/json',
                        'x-cons-id': CONS_ID,
                        'x-timestamp': timestamp,
                        'x-signature': signature
            };

            console.log("Request payload:", requestBody);

            const response = await axios.post(
                `${BASE_URL}/api/login`,
                requestBody,
                {headers: header
                }
            );

            console.log("LOGIN SUCCESS:", response.status);
            console.log("Response data:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("=== LOGIN ERROR ===");
            console.error("Error message:", error.message);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            throw error;
        }
    }
};

export default loginAPI;
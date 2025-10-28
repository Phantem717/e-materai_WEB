import axios from "axios";
import generateSignature from "../signature";

const HOST = process.env.NEXT_PUBLIC_API_HOST;
const PORT = process.env.NEXT_PUBLIC_API_PORT;
const CONS_ID = process.env.NEXT_PUBLIC_CONS_ID;
const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;

const BASE_URL = `http://${HOST}:${PORT}`;

const CreateQRAPI = {
    createQRBatch: async (payload) => {
        try {
            const { timestamp, signature } = generateSignature(CONS_ID, API_KEY);
            
            // Debug logging
            console.log("=== LOGIN API DEBUG ===");
           
            console.log("Headers:", {
                'x-cons-id': CONS_ID,
                'x-timestamp': timestamp,
                'x-signature': signature
            });

            if (!payload) {
                throw new Error("Payload is Required required.");
            }

            // Request payload

            const header = {
                        'Content-Type': 'application/json',
                        'x-cons-id': CONS_ID,
                        'x-timestamp': timestamp,
                        'x-signature': signature,
                        'Authorization': payload.auth
            };

            console.log("Request payload:", payload);

            const response = await axios.post(
                `${BASE_URL}/api/create-qr/batch-qr`,
                payload,
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

export default CreateQRAPI;
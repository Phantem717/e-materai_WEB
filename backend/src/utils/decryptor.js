const CryptoJS = require('crypto-js');

function generateEncryptionKey(consId, timestamp, secretKey) {
    const message = `${consId}&${timestamp}`;
    return CryptoJS.HmacSHA256(message, CryptoJS.enc.Utf8.parse(secretKey));
}

function decryptData(encryptedBase64, encryptionKeyWordArray) {
    // Clean Base64 string first
    const cleanBase64 = encryptedBase64.replace(/\s+/g, '');
    
    try {
        const encryptedWordArray = CryptoJS.enc.Base64.parse(cleanBase64);
        const iv = CryptoJS.lib.WordArray.create(encryptedWordArray.words.slice(0, 4), 16);
        const ciphertext = CryptoJS.lib.WordArray.create(
            encryptedWordArray.words.slice(4),
            encryptedWordArray.sigBytes - 16
        );

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext },
            encryptionKeyWordArray,
            { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedStr) throw new Error("Empty decryption result");
        
        return JSON.parse(decryptedStr);
    } catch (e) {
        console.error("Decryption steps failed:", e);
        throw e;
    }
}

function runDecryption(response,headers) {
    try {
        console.log("DATA",response,headers);
        // Get encryption parameters from RESPONSE HEADERS
        const encryptedBase64 = response.data;
        const timestamp = headers.timestamp; // Must match encryption time
        const consId = headers.consId;

        if (!encryptedBase64 || !timestamp || !consId) {
            throw new Error("Missing required headers or data");
        }

        // Clean and validate Base64
        const cleanBase64 = encryptedBase64.replace(/\s+/g, '');
        if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
            throw new Error("Invalid Base64 format");
        }

        const encryptionKey = generateEncryptionKey(
            consId,
            timestamp,
            process.env.PASSWORD
        );

        return decryptData(cleanBase64, encryptionKey);
    } catch (error) {
        console.error("Full decryption failed:", error);
        throw error; // Re-throw for upstream handling
    }
}

module.exports = { runDecryption };
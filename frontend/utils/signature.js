const crypto = require('crypto-js');

function generateSignature(consId, secretKey) {
    console.log("DATA",consId,secretKey);
  // Dapatkan timestamp dalam detik
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Gabungkan consId dan timestamp dengan '&'
  const dataToSign = consId + "&" + timestamp;
  
  // Buat HMAC SHA256 dan encode ke Base64
  const signature = crypto.HmacSHA256(dataToSign, secretKey);
  const signatureBase64 = crypto.enc.Base64.stringify(signature);
  
  return { timestamp, signature: signatureBase64 };
}

module.exports = generateSignature;

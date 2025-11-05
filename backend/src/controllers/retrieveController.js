const { getTypes, retrieveJSON } = require('../services/retrieveServices');
const {create} = require('../models/responseModel');
const {saveQR} = require('../services/saveFileService')
const path = require('path');
const fs = require('fs');
const getTypeController = async  (req,res) => {
    try {
        console.log("AUTH",req.headers["authorization"])
        const headers = req.headers["authorization"];
     
        const data = await getTypes(headers);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Get Types Failed: ",error);
    res.status(500).json({ message: 'Failed to CreateQR', error: error.message });
    }
 
}

const getJsonController = async (req, res) => {
  try {
    const { batchId } = req.params;

    console.log("=== GET JSON CONTROLLER ===");
    console.log("BatchId received:", batchId);

    if (!batchId) {
      return res.status(400).json({ 
        status: 400,
        message: "BatchId parameter is required" 
      });
    }

    // 🔹 Retrieve JSON data from service
    const response = await retrieveJSON(batchId);
    console.log("RESPOSNE",response);
    // 🔹 Validate response
   // if (!Array.isArray(response) || response.length === 0) {
     // return res.status(400).json({ message: "No valid data found in response" });
    //}

    const processedDocs = [];
    const errors = [];

    // 🔹 Process each document
    for (const [index, item] of response.entries()) {
      try {
        const result = item?.result;
        
        if (!result?.document) {
          console.warn(`⚠️ Item ${index}: No document found, skipping`);
          continue;
        }

        const docId = result.document.idfile || `doc_${Date.now()}_${index}`;
        const qrBase64 = result.qrImage;

      // ✅ Build payload for DB
      const payload = {
        doc_id: docId,
        serial_number: result.serialNumber,
        document: JSON.stringify(result.document), // keep as string
        status: result.status,
        batchId: result.batchId,
        procId: result.procId,
        qrImage: qrBase64
      };
	console.log("PAYLOAD",payload);
      // ✅ Insert into DB

        // ✅ Insert into DB
        const insertResult = await create(payload);
        console.log(`✅ DB Insert success for ${docId}:`, insertResult);

        // ✅ Save QR image with proper validation
        let qrSavedPath = null;
        if (qrBase64) {
          console.log(`Attempting to save QR for ${docId}...`);
          console.log(`QR data length: ${qrBase64.length} chars`);
          console.log(`QR starts with: ${qrBase64.substring(0, 50)}`);
          
          // Check if it's valid base64 image data
          if (qrBase64.startsWith('data:image')) {
            try {
              qrSavedPath = saveQR(qrBase64, `${docId}_STAMP`);
              console.log(`✅ QR saved at: ${qrSavedPath}`);
            } catch (qrError) {
              console.error(`❌ Failed to save QR for ${docId}:`, qrError.message);
              errors.push({
                docId,
                error: `QR save failed: ${qrError.message}`
              });
            }
          } else {
            console.warn(`⚠️ Invalid QR format for ${docId}, expected data:image/... but got: ${qrBase64.substring(0, 30)}`);
          }
        } else {
          console.warn(`⚠️ No QR image data for ${docId}`);
        }

        processedDocs.push({
          docId,
          dbInserted: true,
          qrSaved: !!qrSavedPath,
          qrPath: qrSavedPath
        });

      } catch (itemError) {
        console.error(`❌ Error processing item ${index}:`, itemError);
        errors.push({
          index,
          error: itemError.message
        });
      }
    }

    return res.status(200).json({
      status: 200,
      message: "Documents processed",
      summary: {
        total: response.length,
        successful: processedDocs.length,
        failed: errors.length
      },
      processedDocs,
      errors: errors.length > 0 ? errors : undefined,
      data: response
    });

  } catch (error) {
    console.error("❌ Get JSON Controller Failed:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to process JSON",
      error: error.message
    });
  }
};

module.exports = {getTypeController,getJsonController};

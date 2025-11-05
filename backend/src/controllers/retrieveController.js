const { getTypes, retrieveJSON } = require('../services/retrieveServices');
const {create} = require('../models/responseModel');
const {saveQR} = require('../services/saveFileService')
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

    if (!batchId) {
      return res.status(400).json({ message: "Invalid Params" });
    }

    // 🔹 Retrieve JSON data from your service
    const response = await retrieveJSON(batchId);
    console.log("RESPOSNE",response);
    // 🔹 Validate response
   // if (!Array.isArray(response) || response.length === 0) {
     // return res.status(400).json({ message: "No valid data found in response" });
    //}

    // 🔹 Process each document
    for (const item of response) {
      const result = item?.result;
      if (!result?.document) continue;

      const docId = result.document.idfile || `doc_${Date.now()}`;
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
      const insertResult = await create(payload);

      // ✅ Save QR image safely (if exists)
      if (qrBase64 && qrBase64.startsWith('data:image')) {
        const savedPath = saveQR(qrBase64, `${docId}_STAMP`);
        console.log(`✅ QR saved at: ${savedPath}`);
      }

      console.log(`✅ Inserted document: ${docId}`, insertResult);
    }

    return res.status(200).json({
      status: 200,
      message: "All documents processed successfully",
      total: response.length,
      data: response
    });

  } catch (error) {
    console.error("❌ Get JSON Failed:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to GET JSON",
      error: error.message
    });
  }
};

module.exports = {getTypeController,getJsonController};

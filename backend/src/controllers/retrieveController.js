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

    // 🔹 Retrieve JSON data
    const response = await retrieveJSON(batchId);

    // 🔹 Ensure response is an array
    if (!Array.isArray(response)) {
      return res.status(400).json({ message: "Response is not a valid array" });
    }

    // 🔹 Loop safely over response using for...of (since map doesn't await)
    for (const item of response) {
      const payload = {
        doc_id: item.result.document.idfile,
        serial_number: item.result.serialNumber,
        // document is already an object, don’t call .json()
        document: JSON.stringify(item.result.document),
        status: item.result.status,
        batchId: item.result.batchId,
        procId: item.result.procId,
        qrImage: item.result.qrImage
      };

      const insert = await create(payload);
      const saveSTAMP = saveQR(item.result.qrImage,`item.result.document.idfile_STAMP`);
      
      console.log("✅ Inserted:", insert,saveSTAMP);
    }

    return res.status(200).json({ message: "Data inserted successfully", data: response, status: 200 });

  } catch (error) {
    console.error("❌ Get JSON Failed:", error);
    res.status(500).json({ message: 'Failed to GET JSON', error: error.message });
  }
};

module.exports = {getTypeController,getJsonController};
const { create, findByDocId, getAll,deleteInstance } = require('../models/responseModel');

const insertController = async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload || !payload.doc_id || !payload.serial_number || !payload.document || !payload.status  ||!payload.batchId || !payload.procId || !payload.qrImage ) {
      return res.status(400).json({ message: "Invalid Body In INSERT Responses" });
    }

    const response = await create(payload);

    return res.status(200).json({
      message: "Inserted successfully",
      data: response,
    });
  } catch (error) {
    console.error("Response Insert Error:", error.message);
    return res.status(500).json({
      message: "Failed to INSERT",
      error: error.message,
    });
  }
};


const getAllController = async (req, res) => {
  try {
    const response = await getAll();

    return res.status(200).json({
      message: "Data Sent Succesfully",
      data: response,
    });
  } catch (error) {
    console.error("Response Get All Error:", error.message);
    return res.status(500).json({
      message: "Failed to INSERT",
      error: error.message,
    });
  }
};

const findByIdController = async (req,res)=>{
 try {
    const docId = req.params;
    if(!docId){
    return res.status(400).json({ message: "Invalid Body In FINDBYID Responses" });

    }
    const response = await findByDocId(docId);

    return res.status(200).json({
      message: "Data Sent Succesfully",
      data: response,
    });
  } catch (error) {
    console.error("Response FindById Error:", error.message);
    return res.status(500).json({
      message: "Failed to INSERT",
      error: error.message,
    });
  }
}

const deleteController = async (req,res)=> {
    try {
    const docId = req.params;
    if(!docId){
    return res.status(400).json({ message: "Invalid Body In DELETE Responses" });

    }
    const response = await deleteInstance(docId);

    return res.status(200).json({
      message: "Data DELETED Succesfully",
      data: response,
    });
  } catch (error) {
    console.error("Response DELETE Error:", error.message);
    return res.status(500).json({
      message: "Failed to INSERT",
      error: error.message,
    });
  }
}

module.exports = { insertController, getAllController,findByIdController,deleteController };

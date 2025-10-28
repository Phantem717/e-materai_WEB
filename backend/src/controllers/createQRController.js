const {batchQR} = require('../services/createQRService');

const CreateQRController = async  (req,res) => {
    try {
        const {payload} = req.body;
        console.log("BODY",req.body, req.headers);

        if(!payload.return_url || !payload.tipe || !payload.document){
            return res.status(400).json({message: "Payload Tidak Complete"});
        }

        console.log("AUTH",req.headers["authorization"])
        const headers = req.headers["authorization"];
     
        const data = await batchQR(payload,headers);
        return res.status(200).json(data);
    } catch (error) {
        console.error("CreateQR Failed: ",error);
    res.status(500).json({ message: 'Failed to CreateQR', error: error.message });
    }
 
}

module.exports = {CreateQRController};
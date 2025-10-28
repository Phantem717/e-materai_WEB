const { batchProcessing } = require('../services/stampingService');

const BatchProcessController = async  (req,res) => {
    try {
        console.log("AUTH BACH",req.headers)
        const headers = req.headers["authorization"];
        const payload = req.body;
        console.log("DOCUMENT",payload)
        const data = await batchProcessing(payload,headers);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Get Types Failed: ",error);
    res.status(500).json({ message: 'Failed to CreateQR', error: error.message });
    }
 
}

module.exports = {BatchProcessController};
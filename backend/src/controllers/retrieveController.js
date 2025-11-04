const { getTypes } = require('../services/retrieveServices');

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

const getJsonController = async (req,res)=>{
    try {
        console.log("AUTH",req.headers["authorization"])
    const headers = req.headers["authorization"];
    const instances = req.params;
    
    } catch (error) {
              console.error("Get JSON Failed: ",error);
    res.status(500).json({ message: 'Failed to GET JSON', error: error.message });
    }
}
module.exports = {getTypeController,getJsonController};
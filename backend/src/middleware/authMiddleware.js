const crypto = require('crypto-js');


function checkHeader(req,res,next){
  const consid = req.header("x-cons-id");
  const timestamp = req.header("x-timestamp");
  const signature = req.header("x-signature");
console.log("CONST",consid);
  if(!consid || !timestamp || !signature){
    return res.status(401).json({error: "Invalid/Incomplete Headers"});
  }

    if (consid != process.env.CONS_ID) {
    return res.status(401).json({ error: "Invalid API Key" });
  }


  next();

}

module.exports = checkHeader;
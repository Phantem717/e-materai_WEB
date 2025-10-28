const {login} = require('../services/loginService');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const checkLoginController = async  (req,res) => {
    try {
        const {username,password} = req.body;
        console.log("BODY",req.body)

        if(!username || !password){
            return res.status(400).json({message: "Username dan Password Tidak Ditemukan"});
        }
    
        const data = await login(username,password);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Login Failed: ",error);
    res.status(500).json({ message: 'Failed to Login', error: error.message });
    }
 
}

module.exports = {checkLoginController};
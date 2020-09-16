const express = require("express");
const router = express.Router();

router.get('/api/expenses/', (req, res)=>{
    res.status(200).json("This is respone")
}) 

module.exports = router;
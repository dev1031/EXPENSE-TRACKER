const express = require("express");
const router = express.Router();
const User = require('./../model/user.model');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

router.get('/api/users/', async (req, res)=>{
    let response = await User.find({});
    res.status(200).json(response);
})

router.post("/api/users/", async (req,res)=>{
    bcrypt.hash(req.body.password,10,(error, hashed_password)=>{
        if(error){
            res.status(400).json({
                error :"Authentication Error"
            })
        }else{
            const user = new User({
                name: req.body.name ,
                email: req.body.email , 
                password : hashed_password
            });

            user.save()
            .then((response)=>{
                return res.status(200).json(response)
            })
            .catch(error=>{
                console.log(error)
            })
        }
    })
})

router.get('/api/users/:userId', async (req, res)=>{
    if(!req.isAuth){
        res.status(401).json({
            response:"UnAuthorized"
        })
    }
    let response = await User.findById(req.params.userId);
    res.status(200).json(response);
})

router.put('/api/users/:userId', async (req, res)=>{
    if(!req.isAuth){
        res.status(401).json({
            response:"UnAuthorized"
        })
    }
    let user = await User.findById({ _id:req.params.userId} );
    let response  = await User.findOneAndUpdate({ _id:req.params.userId} ,Object.assign(user, req.body) ,{ new : true });
    res.status(200).json(response);
})

router.delete('/api/users/:userId', async (req, res)=>{
    if(!req.isAuth){
        res.status(401).json({
            response:"UnAuthorized"
        })
    }
    let response = await User.deleteOne({ _id : req.params.userId});
    res.status(200).json(response )
})


router.post('/api/signin', async (req, res)=>{
    try{
        let user = await User.findOne({ "email": req.body.email });
        if (!user)
          return res.status('401').json({ error: "User not found" })
        if (! bcrypt.compare(req.body.password ,user.password)) { 
            return res.status('401').send({ error: "Email and password don't match." })
        }
        const token = jwt.sign({ _id: user._id }, 'MY_JWT_SECRET_KEY');
        res.cookie('t', token, { expire: new Date() + 9999 })
        res.json({
            token,
            user: {
            _id: user._id,
            name: user.name,
            email: user.email
            }
        })
    }catch (err) {
        return res.status('401').json({ error: "Could not sign in" })
 } 
})

router.get('/api/signout',(req, res)=>{
    res.clearCookie("t")
    return res.status('200').json({
      message: "signed out"
    })
})


module.exports = router;

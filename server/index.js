require('dotenv').config()
const express = require("express");
const helmet = require("helmet");
const cors  = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan"); 
const userRoutes = require("./routes/user.routes");
const expenseRoutes = require("./routes/expense.routes");
const mongoose = require("mongoose");
const isAuth = require('./Auth/auth');
const userId = require('./Auth/auth');
const PORT = process.env.PORT || 5000;
const app  = express();

mongoose.connect(`${process.env.MONGODB_URL}/expense_tracker_app?retryWrites=true&w=majority`, {useNewUrlParser: true , useUnifiedTopology: true ,useFindAndModify: false }, (error , db )=>{
    console.log('DataBase Connected!!')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin",req.headers.origin);
    res.header("Access-Control-Allow-Credentials" ,'true');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Headers','POST, GET ,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    if(req.method ==='OPTIONS'){
            return res.sendStatus(200);
        }
    next()
});
app.use(morgan('short'));
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(isAuth);
app.use(userId);
app.use('/', userRoutes);
app.use('/', expenseRoutes);

app.get("/", (req, res)=>{
    res.send("Server is up and running!!")
})

app.listen(PORT, ()=>{
    console.log(`Server is up and running at PORT:${PORT}`)
})
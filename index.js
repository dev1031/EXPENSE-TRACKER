require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const cors  = require("cors");
const PORT = process.env.PORT || 5000;
const path = require("path");
const cookieParser = require("cookie-parser");
const serveStatic = require('serve-static');
const morgan = require("morgan"); 
const userRoutes = require("./routes/user.routes");
const expenseRoutes = require("./routes/expense.routes");
const mongoose = require("mongoose");
const isAuth = require('./Auth/auth');
const userId = require('./Auth/auth');
const app  = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// app.use((req, res, next)=>{
//     res.header("Access-Control-Allow-Origin","*");
//     res.header("Access-Control-Allow-Credentials" ,'true');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.setHeader('Access-Control-Allow-Headers','POST, GET ,OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
//     if(req.method ==='OPTIONS'){
//             return res.sendStatus(200);
//         }
//     next()
// });


app.use(serveStatic(__dirname + "/build")); //
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

app.use(morgan('short'));
app.use(cookieParser());
app.use(isAuth);
app.use(userId);

app.use('/', userRoutes);
app.use('/', expenseRoutes);

 app.get("/", (req, res)=>{
     res.send("Server is up and running!!")
})
mongoose.connect(`${process.env.MONGODB_URL}/expense_tracker_app?retryWrites=true&w=majority`, {useNewUrlParser: true , useUnifiedTopology: true ,useFindAndModify: false }, (error , db )=>{
  console.log('DataBase Connected!!')
});

app.listen(PORT, ()=>{
    console.log(`Server is up and running at PORT:${PORT}`)
})
//https://5f72d7a6dc4c6f15de53e4cb--unruffled-bell-7e7c9b.netlify.app
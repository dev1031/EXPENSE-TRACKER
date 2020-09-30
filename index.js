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

mongoose.connect('mongodb+srv://dherendra_dev:dheeru101@cluster0.r8doy.mongodb.net/expense_tracker_app?retryWrites=true&w=majority', {useNewUrlParser: true , useUnifiedTopology: true ,useFindAndModify: false }, (error , db )=>{
  console.log('DataBase Connected!!')
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

if (process.env.NODE_ENV === "production") {
  app.use(serveStatic(__dirname + "/build")); 
}

app.use(morgan('short'));
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
//https://5f72d7a6dc4c6f15de53e4cb--unruffled-bell-7e7c9b.netlify.app
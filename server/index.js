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
const PORT = 5000;

const app  = express();

mongoose.connect('mongodb+srv://dherendra_dev:dheeru101@cluster0.r8doy.mongodb.net/expense_tracker_app?retryWrites=true&w=majority', {useNewUrlParser: true , useUnifiedTopology: true ,useFindAndModify: false }, (error , db )=>{
    console.log('DataBase Connected!!')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('short'));
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(isAuth);
app.use('/', userRoutes);
app.use('/', expenseRoutes);

app.get("/", (req, res)=>{
    res.send("Server is up and running!!")
})

app.listen(PORT, ()=>{
    console.log(`Server is up and running at PORT:${PORT}`)
})
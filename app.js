const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config({
    path: './.env'
});

const app = express();
const db = mysql.createConnection({
    host: process.env.DATA_HOST,
    user: process.env.DATA_USER,
    password: process.env.DATA_PASS,
    database: process.env.DATA,
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//for parsing the url as sent by HTML
app.use(express.urlencoded({
    extended: false
}));
// for parsing JSON bodies as sent by API Client
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

db.connect((err) => {
    if (err) {
        console.log(error)
    } else {
        console.log('Mysql connected')
    }
});

//Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));



app.listen(5000, () => {
    console.log("Server is listening on 5000");
});
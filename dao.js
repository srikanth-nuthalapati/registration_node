const mysql = require("mysql2");
require('dotenv').config()

let conn = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
});

conn.connect((err)=>{
    if(err) {
        console.log(err.message);
    }
    else{
        console.log("mysql connected");
    }
});

module.exports = conn;

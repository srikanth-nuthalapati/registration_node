const mysql = require("mysql2");
require('dotenv').config()

const conn = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    waitForConnections: true,
    connectionLimit: 10,  // Number of simultaneous connections allowed
    queueLimit: 0
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

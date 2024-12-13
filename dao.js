const mysql = require("mysql2");
require('dotenv').config()

const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.password,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,  // Number of simultaneous connections allowed
    queueLimit: 0
});

module.exports = conn;

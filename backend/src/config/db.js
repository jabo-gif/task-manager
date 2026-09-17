const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.NODE_ENV === 'test' ? process.env.DB_TEST_NAME : process.env.DB_NAME;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

module.exports = pool;

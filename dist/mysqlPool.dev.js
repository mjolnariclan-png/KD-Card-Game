"use strict";

// mysqlPool.js
// Placeholder code for MySQL connection pool setup
var mysql = require('mysql'); // Create MySQL pool


var pool = mysql.createPool({
  host: 'localhost',
  user: 'Miller',
  password: 'CdJpM17!',
  database: 'test_database'
});
module.exports = pool;
"use strict";

// routes/cards.js
var express = require('express');

var router = express.Router();

var pool = require('../mysqlPool'); // Replace with your MySQL connection pool setup
// GET all cards


router.get('/', function (req, res) {
  pool.query('SELECT * FROM cards', function (err, results) {
    if (err) {
      res.status(500).json({
        message: err.message
      });
      return;
    }

    res.json(results);
  });
}); // POST a new card

router.post('/', function (req, res) {
  var _req$body = req.body,
      name = _req$body.name,
      className = _req$body.className,
      manaCost = _req$body.manaCost;
  pool.query('INSERT INTO cards (name, className, manaCost) VALUES (?, ?, ?)', [name, className, manaCost], function (err, result) {
    if (err) {
      res.status(400).json({
        message: err.message
      });
      return;
    }

    res.status(201).json({
      message: 'Card added successfully'
    });
  });
});
module.exports = router;
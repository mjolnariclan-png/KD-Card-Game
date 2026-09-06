"use strict";

var express = require('express');

var app = express();
var PORT = process.env.PORT || 3000; // Example in-memory data (replace with your database integration)

var playerHand = []; // Assuming this is where player hand cards will be stored

var battlefield = []; // Assuming this is where battlefield cards will be stored
// Endpoint to fetch player hand

app.get('/api/player-hand', function (req, res) {
  res.json(playerHand); // Return player hand as JSON
}); // Endpoint to fetch battlefield

app.get('/api/battlefield', function (req, res) {
  res.json(battlefield); // Return battlefield as JSON
}); // Example route for serving static files (if applicable)
// This can be used to serve your game-board.html or other static files

app.use(express["static"](__dirname)); // Start server

app.listen(PORT, function () {
  console.log("Server is running on http://localhost:".concat(PORT));
});
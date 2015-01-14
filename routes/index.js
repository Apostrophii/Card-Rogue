var express = require('express');
var router = express.Router();

//middleware goes here
router.use(function(req, res, next) {
    next(); //I think this is neccessary to move on to the other stuff
});

//home index
router.get('/', function(req, res) {
  res.render('home');
});

//joining a game from a list of games with open slots
router.get('/join_game', function(req, res) {
  res.send('JOIN');
});

//creating a new game
router.get('/make_game', function(req, res) {
  res.send('MAKE');
});

//lobby for pregame chat
router.get('/lobby', function(req, res) {
  res.render('lobby');
});

module.exports.router = router; //export this for use in server.js

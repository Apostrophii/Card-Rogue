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
  res.render('join_game');
});

//creating a new game
router.get('/make_game', function(req, res) {
  res.render('make_game');
});

//lobby for pregame chat
router.get('/lobby', function(req, res) {
  res.render('lobby');
});

//the actual game
router.get('/game', function(req, res) {
    res.render('game');
});

module.exports.router = router; //export this for use in server.js

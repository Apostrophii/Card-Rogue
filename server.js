var express = require('express');
var http = require('http'); //not sure if I need this
var app = express();
var logger = require('morgan');
var favicon = require('serve-favicon');
var io = require('socket.io').listen(app.listen(8001));
var session = require('express-session')
var RedisStore = require('connect-redis')(session);
var rClient = require('redis').createClient();
var sessionStore = new RedisStore({client:rClient});
var cookieParser = require('cookie-parser')
var SessionSockets = require('session.socket.io');
var sessionSockets = new SessionSockets(io, sessionStore, cookieParser('secret'));

// session setup
app.use(cookieParser('secret'));
app.use(session({store: sessionStore, name: 'connect.sid', secret: 'secret'}));

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.basedir = '/var/www/cr/public/';

//cause we're on a proxy server here
app.enable('trust proxy');

//and this is where all the routing comes from
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev')); //logging (obviously)
app.use(express.static(__dirname + '/public'));
app.use('/', require('./routes/index').router); //where our routes come from (at least the basic ones)

//current error handling (could probably be better)
app.use(function(req, res){
res.send('404');
});

//Check if we connected to redis (run "redis-server" to start)
rClient.on('connect', function(){
    console.log('redis connected');
});

//Constructs for the lobby system
var lobbies = {counter: 100};
var colors = ['purple', 'yellow', 'blue', 'green', 'red', 'gray'];
lobbies['0'] = {name: "empty room", occupants: 0, capacity: 6, free_colors: colors, log: [], has_pwd: false}; //default lobby
var lobby_pwds = {'0': ''};

sessionSockets.on('connection', function(err, socket, session){
    console.log('\nsocket connected');
    //console.log(session);
    //console.log('socket error:', err);

    //pull in the different components
    require('./components/lobby_system.js')(socket, session, io, lobbies, lobby_pwds, colors);

    socket.on('disconnect', function(){
        console.log('socket disconnected');
    });
});

//the base app model is at app.js

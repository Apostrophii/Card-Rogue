var express = require('express');
var http = require('http');
var app = express();
var logger = require('morgan');
var favicon = require('serve-favicon');

var server = app.listen(8001);
var io = require('socket.io').listen(server);

//NEW
var session = require('express-session')
var redis = require('redis');
var RedisStore = require('connect-redis')(session);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client:rClient});
var cookieParser = require('cookie-parser')
var SessionSockets = require('session.socket.io');
var sessionSockets = new SessionSockets(io, sessionStore, cookieParser('secret'));

// view engine setup
app.use(cookieParser('secret'));
app.use(session({store: sessionStore, name: 'connect.sid', secret: 'secret'}));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.enable('trust proxy');

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

sessionSockets.on('connection', function(err, socket, session){
    console.log('socket connected');
    session.room = null;
    session.save();
    console.log(session);
    console.log('socket error:', err);
    socket.emit('session', session);
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
        console.log('socket disconnected');
    });
});

//the base app model is at app.js

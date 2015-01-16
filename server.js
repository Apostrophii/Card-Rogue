var express = require('express');
var http = require('http');
var app = express();
var logger = require('morgan');
var favicon = require('serve-favicon');
var server = app.listen(8001);
var io = require('socket.io').listen(server);
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

//Constructs for the lobby system
var lobbies = {};
lobbies['0'] = {name: "Default", occupants: 0}; //default lobby
var lobby_counter = 0;

sessionSockets.on('connection', function(err, socket, session){
    console.log('\nsocket connected');
    //console.log(session);
    session.save();
    console.log('socket error:', err);
    socket.emit('session', session);

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.to(session.room).emit('chat message', msg);
    });

    socket.on('make_lobby', function(info){
        lobby_counter += 1;
        lobbies[String(lobby_counter)] = {name: info.lobby_name, occupants: 0}; //create lobby
        session.room = String(lobby_counter);
        session.save();
    });

    socket.on('get_lobbies', function() {
        socket.emit('lobby_list', lobbies);
    });

    socket.on('join_lobby', function(room){
        session.room = room;
        session.save();
    });

    socket.on('enter_lobby', function() {
        if(session.room == undefined) { //check if the client is connnected to a room
            console.log('undefined user entering lobby');
            session.room = '0'; //if not add them to the default room
            session.save();
        }
        if(lobbies[session.room] == undefined) { //might consider changing this later
            console.log('user attempting to enter underined lobby');
            session.room = '0';
            session.save();
        }
        lobbies[session.room].occupants += 1;
        console.log('OCCUPANTS:', lobbies[session.room].occupants);
        socket.join(session.room);
        session.lobby = lobbies[session.room].name;
        session.save();
        socket.emit('lobby_info', {lobby_name: session.lobby});
    });

    socket.on('leave_lobby', function() {
        //socket.leave(session.room); //might not be neccessary
        console.log('LEAVING LOBBY');
        lobbies[session.room].occupants -= 1;
        if (lobbies[session.room].occupants <= 0) {
            delete lobbies[session.room];
        }
        session.lobby = null;
        session.save();
    });

    socket.on('disconnect', function(){
        console.log('socket disconnected');
    });
});

//the base app model is at app.js

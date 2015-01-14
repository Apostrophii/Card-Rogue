var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app).listen(8001);
var io = require('socket.io').listen(server);
var logger = require('morgan');
var favicon = require('serve-favicon');

// view engine setup
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

io.sockets.on('connection', function(socket){
    console.log('a user connected');
});

//the base app model is at app.js

var express = require('express');
var http = require('http');
var app = express();
//old way
//var server = http.createServer(app).listen(8001);
//var io = require('socket.io').listen(server);
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

//new way
var server = app.listen(8001);
var io = require('socket.io').listen(server);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data){
        console.log(data);
    });
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

//the base app model is at app.js

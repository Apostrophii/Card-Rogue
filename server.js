var express = require('express');
var app = express();
var logger = require('morgan');

// view engine setup
app.set('views', __dirname, 'views');
app.set('view engine', 'jade');

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev')); //logging (obviously)
app.use(express.static(__dirname + '/public')); //serving static files
app.use('/', require('./routes/index').router); //where our routes come from (at least the basic ones)

//current error handling (could probably be better)
app.use(function(req, res){
    res.send('404');
});

//start the server
var server = app.listen(8001, function(){
    //these lines are just to show the server is listening and where
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

//the base app model is at app.js

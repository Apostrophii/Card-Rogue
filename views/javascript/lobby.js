$(document).ready(function() {
    socket.emit('enter_lobby')
    socket.emit('player_ready', 0); 
    var posts = 0;
    socket.on('lobby_info', function(info){
        if (info.room == '0') {
            $('#ready_button').css('display', 'none');
        }   
        posts += info.log.length;
        $('#lobby_name').text(info.lobby_name);
        for (i = 0; i < info.log.length; i++) {
            var m = info.log[i];
            $('#messages').prepend($('<br>'));
            if (m[0] == 'speech') {
                $('#messages').prepend($('<li>').attr('class', 'speech ' + m[2]).text(m[1]));
                $('#messages').prepend($('<span>').attr('class', 'square ' + m[2]));
            }   
            else {
                $('#messages').prepend($('<li>').attr('class', 'system').text('-- ' + m[1]));
            }   
        }   
    }); 
    $('form').keypress(function(event){
        if (event.keyCode == 13) {
            if ($('#m').val() !== '') {
                socket.emit('chat_message', $('#m').val());
            }   
            $('#m').val('');
            return false;
        }   
    }); 
    var audioTag = new Audio('audio/drrr.mp3');
    //audioTag.load();
    socket.on('chat_message', function(type, msg, color){
        posts += 1;
        if (type == 'speech') {
            $('#messages').prepend($('<br>'));
            $('#messages').prepend($('<li>').attr('class', 'speech ' + color).text(msg));
            $('#messages').prepend($('<span>').attr('class', 'square ' + color));
            //audioTag.src = 'audio/drrr.mp3';
            audioTag.play();
        }   
        else {
            $('#messages').prepend($('<br>'));
            $('#messages').prepend($('<li>').attr('class', 'system').text('-- ' + msg));
        }
        /*  
        if (posts > 5) {
            $('ul#messages:last-child').remove();
            var latest = $('#messages:last-child');
            if (latest.hasClass('speech')) {
                console.log('SPEECH');
                latest.remove();
                $('#messages:last-child').remove();
            }
            else {
                console.log('SYSTEM');
                $('#messages:last-child').remove();
            }
        }
        */
    });
    $('#ready_button').click(function() { //for when the user clicks the ready button
        $(this).text(function(i, text){
            if (text == 'ready?') {
                socket.emit('player_ready', 1); //add ready player
                return 'READY!';
            }
            else {
                socket.emit('player_ready', -1); //remove ready player
                return 'ready?'
            }
        });
    });
    socket.on('ready_count', function(num, max) { //get new number of ready players
        var percent = String(100 * num / max);
        if (percent == '0') {
            percent = '1';
        }
        $('#ready_button').css("background", "linear-gradient(to right, lime " + percent + "%, black " + percent + "%)"); 
        if (num == max) {
            window.location.href = "http://cs.wallawalla.edu/cr/game";
        }
    });
    /*
    $(window).bind('beforeunload', function(){ //CHANGE THIS
        socket.emit('leave_lobby');
        if ($('#ready_button').text == 'READY!') { //remove player from ready list if they were on it
            socket.emit('player_ready', -1);
        }
    });
    */
    socket.on('log', function(message) {
        console.log(message);
    });
});

$(document).ready(function() {
    $('form').submit(function(){
        if ($('#lobby_name').val() !== '') {
            var capacity = $('.slider').slider("option", "value");
            socket.emit('make_lobby', {lobby_name: $('#lobby_name').val(), lobby_pwd: $('#lobby_pwd').val(), capacity: capacity});
            window.location.replace("lobby");
        }   
        return false;
    }); 
    $(".slider").slider({
        min: 1,
        max: 6,
        step: 1,
        value: 4,
    }).slider("pips", {
        rest: 'label',
    }); 
});

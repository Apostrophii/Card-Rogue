socket.emit('clear_user_info');
socket.emit('get_lobbies');
$(document).ready(function() {
    socket.on('lobby_list', function(lobbies){
        $('#lobbies').empty();
        var displayed_num = 0;
        for (var lobby in lobbies) {
            if (lobbies.hasOwnProperty(lobby)) {
                if ((lobby !== '0') && (lobby !== 'counter')) { //not the main lobby
                    if (lobbies[lobby].occupants < lobbies[lobby].capacity && !lobbies[lobby].ingame) { //not over capacity or in game
                        displayed_num += 1;
                        if (lobbies[lobby].has_pwd) { //has a password on this lobby?
                            $('#lobbies').append($('<li>').append(lobbies[lobby].name + '<br>').append($('<button>', {
                                text: 'JOIN!',
                                id: lobby,
                                click: function() {
                                    socket.emit('check_pwd', this.id, $('#' + this.id + 'pwd').val());
                                    socket.on('check_pwd_result', function(result, id_num) {
                                        if (result) {
                                            window.location.replace("lobby");
                                        }   
                                        else { //got it wrong
                                            $('#' + id_num + 'pwd').val('');
                                        }   
                                    }); 
                                }   
                            }))).append($('<input>', {placeholder: 'password', type: 'password', id: lobby + 'pwd'}).keypress(function(event){
                                if (event.keyCode == 13) {
                                    $('#' + this.id.slice(0, -3)).click();
                                }   
                            }));
                        }   
                        else {
                            $('#lobbies').append($('<li>').append(lobbies[lobby].name + '<br>').append($('<button>', {
                                text: 'JOIN!',
                                id: lobby,
                                click: function() {
                                    socket.emit('join_lobby', this.id);
                                    window.location.replace("lobby");
                                }   
                            })));
                        }   
                        $('#lobbies').append($('<br>'));
                        $('#lobbies').append($('<br>'));
                    }   
                }   
            }   
        }   
        if (displayed_num == 0) {
            $('#lobbies').append('-- none currently avaliable --');
        }   
    }); 
});

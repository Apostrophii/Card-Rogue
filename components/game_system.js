module.exports = function(socket, session, io, lobbies, games) {
    var game_counter = -100;
    socket.on('get_cur_state', function() {
        if (!session.color) {
            session.color = 'silver';
            session.room = String(game_counter);
            game_counter -= 1;
            session.save();
            games[session.room] = {last_update: Date.now(), player_states: {}}; //single player game set up
        }
        //socket.emit('log', games[session.room].player_states[session.color]);
        if (!games[session.room].player_states[session.color]) {
            games[session.room].player_states[session.color] = "char_select_state";
        }
        global[games[session.room].player_states[session.color]](socket, session, io, games[session.room]);
    });
}

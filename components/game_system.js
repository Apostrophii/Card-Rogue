module.exports = function(socket, session, io, lobbies, games) {
    var game_counter = -100;

    socket.on('join_room', function() {
        if (session.room) {
            socket.join(session.room); //rejoin lobby room (quite important)
        } else { //single player
            session.room = String(game_counter);
            game_counter -= 1;
            session.save();
            socket.join(session.room); //rejoin lobby room (quite important)
        }
    });

    socket.on('get_cur_state', function() {
        if (!session.color) { //remember to set color to null at the end of the game
            session.color = 'silver';
            session.save();
            games[session.room] = {last_update: Date.now(), players: {}, player_count: 1, ready_count: 0}; //single player game set up
        }
        if (!games[session.room].players[session.color]) { //set up each player in the game
            games[session.room].players[session.color] = {};
            games[session.room].players[session.color].state = "char_select_state";
        }
        console.log(session.color, "STATE:", games[session.room].players[session.color].state);
        global[games[session.room].players[session.color].state](socket, session, io, games[session.room]);
    });

    socket.on('char_select_callback', function(params) {
        games[session.room].players[session.color].state = "waiting_state";
        games[session.room].ready_count += 1;
        console.log("READY COUNT:", games[session.room].ready_count);
        console.log("PLAYER COUNT:", games[session.room].player_count);
        if (games[session.room].ready_count == games[session.room].player_count) {
            for (var key in games[session.room].players) {
                games[session.room].players[key].state = "draw_card_state"; //wake up players / first real state
                //console.log(key, "NEW STATE:", games[session.room].players[key].state);
            }
            io.to(session.room).emit('seek_next'); //tell the other players to get the next state
        } else {
            waiting_state(socket, session, io, games[session.room]); //send to waiting state
        }
    });
}

module.exports = function(socket, session, io, lobbies, games) {
    socket.on('log', function(message) {
        socket.emit('log', message);
    });

    socket.on('join_room', function() {
        if (session.room) {
            socket.join(session.room); //rejoin lobby room (quite important)
        } else { //single player
            lobbies.counter += 1; //increment first
            session.room = String(lobbies.counter);
            session.save();
            socket.join(session.room); //rejoin lobby room (quite important)
        }
    });

    socket.on('get_cur_state', function() {
        if (!session.color) { //remember to set color to null at the end of the game
            session.color = 'silver';
            session.save();
            games[session.room] = {last_update: Date.now(), players: {}, player_count: 1, ready_count: 0, deck_size: 5, deck: STANDARD_DECK, current_card: undefined}; //single player game set up
        }
        if (!games[session.room].players[session.color]) { //set up each player in the game
            games[session.room].players[session.color] = {};
            games[session.room].players[session.color].state = "char_select_state";
        }
        console.log(session.color, "STATE:", games[session.room].players[session.color].state);
        global[games[session.room].players[session.color].state](socket, session, io, games[session.room]);
    });

    socket.on('char_select_callback', function(params) {
        games[session.room].players[session.color].name = params.name;
        games[session.room].players[session.color].race = params.race;
        games[session.room].players[session.color].str = (Math.floor(Math.random() * 6) + 1);
        games[session.room].players[session.color].dex = (Math.floor(Math.random() * 6) + 1);
        games[session.room].players[session.color].kno = (Math.floor(Math.random() * 6) + 1);
        games[session.room].players[session.color].wis = (Math.floor(Math.random() * 6) + 1);
        if (params.race == 'man') { // race specific bonuses and disadvantages
            games[session.room].players[session.color].kno += (Math.floor(Math.random() * 3) + 1);
            games[session.room].players[session.color].wis = (Math.floor(Math.random() * 3) + 1);
        } else if (params.race == 'elf') {
            games[session.room].players[session.color].wis += (Math.floor(Math.random() * 3) + 1);
            games[session.room].players[session.color].str = (Math.floor(Math.random() * 3) + 1);
        } else if (params.race == 'hill ogre') {
            games[session.room].players[session.color].str += (Math.floor(Math.random() * 3) + 1);
            games[session.room].players[session.color].dex = (Math.floor(Math.random() * 3) + 1);
        } else if (params.race == 'felid') {
            games[session.room].players[session.color].dex += (Math.floor(Math.random() * 3) + 1);
            games[session.room].players[session.color].kno = (Math.floor(Math.random() * 3) + 1);
        }
        games[session.room].players[session.color].state = "waiting_state";
        games[session.room].ready_count += 1;
        console.log("READY COUNT:", games[session.room].ready_count);
        console.log("PLAYER COUNT:", games[session.room].player_count);
        io.to(session.room).emit('update_player_cards', games[session.room].players); // update player card info
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

    socket.on('draw_card_callback', function() {
        console.log("DREW CARD");
        if (games[session.room].deck_size > 1) { // else go to last card //TODO: change this to 0
            var index = Math.floor(Math.random() * games[session.room].deck.length); //get random index in the deck
            for (var key in games[session.room].players) {
                games[session.room].players[key].state = games[session.room].deck[index]; 
            }
            games[session.room].deck.splice(index, 1); //remove said index from the deck
            games[session.room].deck_size -= 1; //reduce deck size
        } else {
            for (var key in games[session.room].players) {
                games[session.room].players[key].state = "last_card";
            }
        }
        io.to(session.room).emit('seek_next');
    });

    socket.on('finished_card', function() {
        console.log("FINISHED CARD");
        for (var key in games[session.room].players) {
            games[session.room].players[key].state = "draw_card_state";
        }
        io.to(session.room).emit('seek_next');
    });

    socket.on('clear_options_call', function() {
        console.log("CLEARING OPTIONS");
        io.to(session.room).emit('clear_options');
        for (var key in games[session.room].players) {
            games[session.room].players[key].state = "draw_card_state";
        }
        io.to(session.room).emit('seek_next');
    });
}

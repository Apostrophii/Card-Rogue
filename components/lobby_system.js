module.exports = function(socket, session, io, lobbies, lobby_pwds, colors, games) {
    socket.on('player_ready', function(num) {
        lobbies[session.room].ready += num;
        if (lobbies[session.room].ready >= lobbies[session.room].capacity) { //create new game object here
            games[session.room] = {last_update: Date.now(), player_states: {}};
            //io.to(session.room).emit('log', session);
        }
        io.to(session.room).emit('ready_count', lobbies[session.room].ready, lobbies[session.room].capacity);
    });

    socket.on('chat_message', function(msg){
        io.to(session.room).emit('chat_message', 'speech', msg, session.color);
        lobbies[session.room].log.push(['speech', msg, session.color]);
        if (lobbies[session.room].log.length > 10) {
            lobbies[session.room].log.splice(0, 1);
        }
    });

    socket.on('make_lobby', function(info){
        lobbies.counter += 1;
        if ((info.lobby_pwd == '') || (info.lobby_pwd == undefined)) {
            lobbies[String(lobbies.counter)] = {name: info.lobby_name, occupants: 0, capacity: info.capacity, ready: 0, free_colors: colors, log: [], has_pwd: false}; //create lobby without pwd
        }
        else {
            lobbies[String(lobbies.counter)] = {name: info.lobby_name, occupants: 0, capacity: info.capacity, ready: 0, free_colors: colors, log: [], has_pwd: true}; //create lobby with pwd
            lobby_pwds[String(lobbies.counter)] = info.lobby_pwd;
        }
        session.room = String(lobbies.counter);
        session.save();
    });

    socket.on('get_lobbies', function() {
        socket.emit('lobby_list', lobbies);
    }); 

    socket.on('check_pwd', function(room, pwd) {
        if (lobby_pwds[room] == pwd) {
            session.room = room;
            session.save();
            socket.emit('check_pwd_result', true, room);
        }
        else {
            socket.emit('check_pwd_result', false, room);
        }
    });

    socket.on('join_lobby', function(room){
        session.room = room;
        //console.log('JOINING:', session.room);
        session.save();
    }); 

    socket.on('enter_lobby', function() {
        if(session.room == undefined) { //check if the client is connnected to a room
            //console.log('undefined user entering lobby');
            session.room = '0'; //if not add them to the default room
            session.save();
        }   
        if(lobbies[session.room] == undefined) { //might consider changing this later
            //console.log('user attempting to enter underined lobby');
            session.room = '0';
            session.save();
        }   
        lobbies[session.room].occupants += 1;
        socket.join(session.room);
        session.lobby = lobbies[session.room].name;
        if (!session.color) { //check if client already has a color
            var new_user = true;
            session.color = lobbies[session.room].free_colors.pop();
        } else {
            var new_user = false;
            var temp_index = lobbies[session.room].free_colors.indexOf(session.color);
            if (temp_index > -1) {
                lobbies[session.room].free_colors.splice(temp_index, 1);
            }
        }
        if (session.color == undefined) {
            session.color = 'silver';
        }
        session.save();
        if (!new_user) {
            lobbies[session.room].log.push(['system', session.color + ' logged out.', 'white']);
        }
        lobbies[session.room].log.push(['system', session.color + ' logged in.', 'white']);
        if (lobbies[session.room].log.length > 10) {
            lobbies[session.room].log.splice(0, 1);
        }
        socket.emit('lobby_info', {lobby_name: session.lobby, log: lobbies[session.room].log.slice(0, -1), room: session.room});
        if (!new_user) {
            io.to(session.room).emit('chat_message', 'system', session.color + ' logged out.', 'white');
        }
        io.to(session.room).emit('chat_message', 'system', session.color + ' logged in.', 'white');
        io.emit('lobby_list', lobbies); //update people looking at lobby list
    });

    socket.on('leave_lobby', function() {
        //socket.leave(session.room); //might not be neccessary
        lobbies[session.room].occupants -= 1;
        lobbies[session.room].free_colors.push(session.color);
        io.to(session.room).emit('chat_message', 'system', session.color + ' logged out.', 'white');
        if (lobbies[session.room].log.length > 10) {
            lobbies[session.room].log.splice(0, 1);
        }
        lobbies[session.room].log.push(['system', session.color + ' logged out.', 'white']);
        if ((lobbies[session.room].occupants <= 0) && (session.room !== '0')) {
            delete lobbies[session.room];
        }
        session.lobby = null;
        session.color = null;
        session.save();
        io.emit('lobby_list', lobbies); //update people looking at lobby list
    });
}

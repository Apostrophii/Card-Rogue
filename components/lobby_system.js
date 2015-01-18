module.exports = function(socket, session, io, lobbies, lobby_pwds, colors) {
    socket.on('chat message', function(msg){
        io.to(session.room).emit('chat message', 'speech', msg, session.color);
        lobbies[session.room].log.push(['speech', msg, session.color]);
        if (lobbies[session.room].log.length > 10) {
            lobbies[session.room].log.splice(0, 1);
        }
    });

    socket.on('make_lobby', function(info){
        lobbies.counter += 1;
        if ((info.lobby_pwd == '') || (info.lobby_pwd == undefined)) {
            lobbies[String(lobbies.counter)] = {name: info.lobby_name, occupants: 0, capacity: 6, free_colors: colors, log: []}; //create lobby without pwd
        }
        else {
            lobbies[String(lobbies.counter)] = {name: info.lobby_name, occupants: 0, capacity: 6, free_colors: colors, log: [], has_pwd: true}; //create lobby with pwd
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
            socket.emit('check_pwd_result', true);
        }
        else {
            socket.emit('check_pwd_result', false);
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
        session.color = lobbies[session.room].free_colors.pop();
        if (session.color == undefined) {
            session.color = 'silver';
        }
        session.save();
        lobbies[session.room].log.push(['system', session.color + ' logged in.', 'white']);
        if (lobbies[session.room].log.length > 10) {
            lobbies[session.room].log.splice(0, 1);
        }
        socket.emit('lobby_info', {lobby_name: session.lobby, log: lobbies[session.room].log.slice(0, -1)});
        io.to(session.room).emit('chat message', 'system', session.color + ' logged in.', 'white');
        io.emit('lobby_list', lobbies); //update people looking at lobby list
    });

    socket.on('leave_lobby', function() {
        //socket.leave(session.room); //might not be neccessary
        lobbies[session.room].occupants -= 1;
        lobbies[session.room].free_colors.push(session.color);
        io.to(session.room).emit('chat message', 'system', session.color + ' logged out.', 'white');
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

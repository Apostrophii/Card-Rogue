module.exports = function(socket, session, io, lobbies, lobby_pwds, colors) {
    socket.on('get_cur_state', function() {
        socket.emit('char_select_state', {message: "HELLO WORLD"});
    });
}

module.exports = function() {
    char_select_state = function(socket, session, io, game) {
        socket.emit('char_select_state', {});
    }
}

module.exports = function() {
    char_select_state = function(socket, session, io, game) {
        var races = ['man', 'elf', 'hill ogre', 'felid'];
        socket.emit('char_select_state', {callback: 'char_select_callback', races: races});
    }

    waiting_state = function(socket, session, io, game) {
        console.log(session.color, "NOW WAITING");
        socket.emit("log", "WAITING IN " + String(session.room));
    }

    draw_card_state = function(socket, session, io, game) {
        console.log(session.color, "NOW DRAWING");
        socket.emit('draw_card_state', {callback: 'draw_card_callback', deck_size: game.deck_size});
    }
}

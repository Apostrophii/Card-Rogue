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

    test_card1 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', title: 'test', text: 'this is all one big test'});
    }

    test_card2 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', title: 'not a test', text: 'do you have any idea what this is?'});
    }

    test_card3 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', title: '49', text: 'but what was the question...'});
    }

    last_card = function(socket, session, io, game) {
        socket.emit('info_card', {callback: null, title: 'fin', text: 'you have found the end!'});
    }
}

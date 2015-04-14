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
        io.to(session.room).emit('update_player_cards', game.players); // update player card info
    }

    test_card1 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', params: null, title: 'test', text: 'this is all one big test'});
    }

    test_card2 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', params: null, title: 'not a test', text: 'do you have any idea what this is?'});
    }

    test_card3 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', params: null, title: '49', text: 'but what was the question...'});
    }

    test_card4 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', params: null, title: 'it', text: 'was\na\ndark\nand\nstormy\nnight'});
    }

    test_card5 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', params: null, title: 'it was\na bright\ncold day\nin april', text: 'and the clocks were striking thirteen'});
    }

    last_card = function(socket, session, io, game) {
        socket.emit('info_card', {callback: null, params: null, title: 'fin', text: 'you have found the end!'});
    }

    test_choice1 = function(socket, session, io, game) {
        var choice1 = {callback: 'log', params: 'choice 1', text: 'option a'};
        var choice2 = {callback: 'log', params: 'choice 2', text: 'option b'};
        var choices = [choice1, choice2];
        socket.emit('choice_card', {callback: null, title: 'test choice', text: 'what will you choose?', choices: choices});
    }

    test_choice2 = function(socket, session, io, game) {
        var choice1 = {callback: 'log', params: 'choice 1', text: 'left'};
        var choice2 = {callback: 'log', params: 'choice 2', text: 'straight'};
        var choice3 = {callback: 'log', params: 'choice 3', text: 'right'};
        var choices = [choice1, choice2, choice3];
        socket.emit('choice_card', {callback: null, title: 'forks\nin\nthe\nroad', text: 'which way, which way?', choices: choices});
    }
}

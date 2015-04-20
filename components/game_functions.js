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

    battle_turn_state = function(socket, session, io, game) {
        console.log(session.color, "BATTLE TURN");
        socket.emit('battle_turn_state', {});
    }

    battle_defend_state = function(socket, session, io, game) {
        console.log(session.color, "BATTLE DEFEND");
        var attack = game.battle.attacker.weapon.cards[Math.floor(Math.random() * game.battle.attacker.weapon.cards.length)];
        game.battle.attacker.attack = attack;
        var armor = game.players[session.color].armor.cards.slice(0);
        var armor_cards = [];
        for (var i = 0; i < 3; i++) {
            var index = Math.floor(Math.random() * armor.length);
            armor_cards.push(armor[index]);
            armor.splice(index, 1);
        }
        socket.emit('battle_defend_state', {attacker: game.battle.attacker.name, attack: attack, armor: armor_cards});
    }

    battle_info_state = function(socket, session, io, game) {
        console.log(session.color, "BATTLE INFO");
        socket.emit('battle_info_state', game.battle.info);
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

    test_battle_card1 = function(socket, session, io, game) {
        game.battle = {};
        weapon1 = {name: 'big stick', cards: [1, 2, 3, 4]};
        armor1 = {name: 'leather armor', cards: [0, 1, 1, 1, 1]};
        orc1 = {name: 'Bob', race: 'orc', weapon: weapon1, armor: armor1, health: 10, speed: 4, str: 4, dex: 1, kno: 5, wis: 4, alive: true, pattern: 'random'};
        orc2 = {name: 'Bill', race: 'orc', weapon: weapon1, armor: armor1, health: 8, speed: 5, str: 5, dex: 2, kno: 1, wis: 1, alive: true, pattern: 'random'};
        orc3 = {name: 'Brains', race: 'orc', weapon: weapon1, armor: armor1, health: 10, speed: 6, str: 2, dex: 3, kno: 3, wis: 1, alive: true, pattern: 'random'};
        game.battle.enemies = [orc1, orc2, orc3];
        game.battle.turns = [];
        for (var i = 0; i < game.battle.enemies.length; i++) {
            game.battle.turns.push({name: game.battle.enemies[i].name, speed: game.battle.enemies[i].speed});
        }
        for (var i in game.players) {
            game.battle.turns.push({name: game.players[i].color, speed: game.players[i].speed});
        }
        socket.emit('log', game.battle);
        socket.emit('info_card', {callback: 'next_battle_turn', params: null, title: 'BATTLE!', text: 'A trio of orcs attack!'});
    }
}

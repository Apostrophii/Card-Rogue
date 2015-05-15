module.exports = function() {
    char_select_state = function(socket, session, io, game) {
        //var races = ['man', 'elf', 'hill ogre', 'felid'];
        var races = ['knight', 'knave', 'normal', 'foreigner'];
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
        socket.emit('battle_turn_state', {enemies: game.battle.enemies});
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
        socket.emit('battle_defend_state', {attacker: game.battle.attacker.name, attack: attack, armor: armor_cards, armor_name: game.players[session.color].armor.name});
    }

    battle_info_state = function(socket, session, io, game) {
        console.log(session.color, "BATTLE INFO");
        socket.emit('battle_info_state', game.battle.info);
    }

    start_card1 = function(socket, session, io, game) {
        socket.emit('info_card', {callback: 'finished_card', params: null, title: 'Welcome Adventurers!', text: 'May your quest for the fabled golden island of MAYA end in success!'});
    }

    last_card = function(socket, session, io, game) {
        socket.emit('info_card', {callback: null, params: null, title: 'Death.', text: DEATHS2[Math.floor(Math.random()*DEATHS2.length)]});
    }

    test_choice3 = function(socket, session, io, game) {
        var choice1 = {callback: 'death', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'This is the island of Maya.'};
        var choice2 = {callback: 'log', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'This is not the fabled island.'};
        var choices = [choice1, choice2];
        var text = 'You encounter two friendly natives:\n\nA: B is a knight and this is the island of Maya.\n\nB: A is a knave and this is the island of Maya.';
        socket.emit('choice_card', {callback: null, title: '', text: text, choices: choices});
    }

    test_choice4 = function(socket, session, io, game) {
        var choice1 = {callback: 'death', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'You have found Maya!'};
        var choice2 = {callback: 'log', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'This island isn\'t Maya...'};
        var choices = [choice1, choice2];
        var text = 'You come accross a pair of friendly natives:\n\nA: We are both knaves and this is the island of Maya.\n\nB: That is true.';
        socket.emit('choice_card', {callback: null, title: '', text: text, choices: choices});
    }

    test_choice5 = function(socket, session, io, game) {
        var choice1 = {callback: 'death', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'This be Maya!'};
        var choice2 = {callback: 'log', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'This island isn\'t the one.'};
        var choices = [choice1, choice2];
        var text = 'Two natives approach you:\n\nA: At least one of us is a knave, and this is the island of Maya.\n\nB: That is true.';
        socket.emit('choice_card', {callback: null, title: '', text: text, choices: choices});
    }

    test_choice6 = function(socket, session, io, game) {
        var choice1 = {callback: 'death', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'Maya has been found.'};
        var choice2 = {callback: 'log', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'Maya has not been found.'};
        var choices = [choice1, choice2];
        var text = 'You find two natives who say:\n\nA: Both of us are knave, and this is the island of Maya.\n\nB: At least one of us is a knave, and this is not the island of Maya.';
        socket.emit('choice_card', {callback: null, title: '', text: text, choices: choices});
    }

    test_choice7 = function(socket, session, io, game) {
        var choice1 = {callback: 'death', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'This appears to be the island of Maya.'};
        var choice2 = {callback: 'log', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'This is not Maya.'};
        var choices = [choice1, choice2];
        var text = 'Two natives tell you:\n\nA: Both of us are knave, and this is the island of Maya.\n\nB: At least one of us is a knight, and this is not the island of Maya.';
        socket.emit('choice_card', {callback: null, title: '', text: text, choices: choices});
    }

    test_choice8 = function(socket, session, io, game) {
        var choice1 = {callback: 'win', params: '', text: 'This is the island of gold.'};
        var choice2 = {callback: 'log', params: DEATHS[Math.floor(Math.random()*DEATHS.length)], text: 'Not this one...'};
        var choices = [choice1, choice2];
        var text = 'These statements are made by a couple of natives:\n\nA: Either B is a knight, or this is the island of Maya.\n\nB: Either A is a knave, or this is not the island of Maya.';
        socket.emit('choice_card', {callback: null, title: '', text: text, choices: choices});
    }

    test_battle_card1 = function(socket, session, io, game) {
        game.battle = {};
        weapon1 = {name: 'large sword', cards: [1, 2, 3, 7]};
        armor1 = {name: 'scale armor', cards: [0, 1, 1, 2, 2]};
        knight1 = {name: 'Sir Shovel', race: 'knight', weapon: weapon1, armor: armor1, health: 7, speed: 3, str: 4, dex: 1, kno: 6, wis: 4, pattern: 'random'};
        knight2 = {name: 'Sir Dusk', race: 'knight', weapon: weapon1, armor: armor1, health: 8, speed: 3, str: 6, dex: 2, kno: 1, wis: 1, pattern: 'random'};
        knight3 = {name: 'Sir Patrickth', race: 'knight', weapon: weapon1, armor: armor1, health: 5, speed: 4, str: 2, dex: 4, kno: 3, wis: 3, pattern: 'random'};
        victory_message = "You have emerged victorious over the knights!";
        game.battle.victory_params = {callback: 'finished_card', params: null, message: victory_message};
        game.battle.enemies = [knight1, knight2, knight3];
        game.battle.turns = [];
        for (var i = 0; i < game.battle.enemies.length; i++) {
            game.battle.turns.push({name: game.battle.enemies[i].name, speed: game.battle.enemies[i].speed});
        }
        for (var i in game.players) {
            game.battle.turns.push({name: game.players[i].color, speed: game.players[i].speed});
        }
        socket.emit('log', game.battle);
        socket.emit('info_card', {callback: 'next_battle_turn', params: null, title: 'BATTLE!', text: 'A trio of knights attack!'});
    }

    test_battle_card2 = function(socket, session, io, game) {
        game.battle = {};
        weapon1 = {name: 'big stick', cards: [1, 2, 3, 3]};
        armor1 = {name: 'leather armor', cards: [0, 1, 1, 1, 1]};
        knave1 = {name: 'Usopp', race: 'knight', weapon: weapon1, armor: armor1, health: 7, speed: 9, str: 4, dex: 6, kno: 5, wis: 5, pattern: 'random'};
        knave2 = {name: 'Luke', race: 'knight', weapon: weapon1, armor: armor1, health: 4, speed: 10, str: 10, dex: 10, kno: 10, wis: 10, pattern: 'random'};
        victory_message = "You have emerged victorious over the knaves!";
        game.battle.victory_params = {callback: 'finished_card', params: null, message: victory_message};
        game.battle.enemies = [knave1, knave2];
        game.battle.turns = [];
        for (var i = 0; i < game.battle.enemies.length; i++) {
            game.battle.turns.push({name: game.battle.enemies[i].name, speed: game.battle.enemies[i].speed});
        }
        for (var i in game.players) {
            game.battle.turns.push({name: game.players[i].color, speed: game.players[i].speed});
        }
        socket.emit('log', game.battle);
        socket.emit('info_card', {callback: 'next_battle_turn', params: null, title: 'BATTLE!', text: 'A pair of knaves attack!'});
    }
}

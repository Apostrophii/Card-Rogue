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
        games[session.room].players[session.color].color = session.color;
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
        games[session.room].players[session.color].health = 5;
        games[session.room].players[session.color].speed = (Math.floor(Math.random() * 4) + 3);
        games[session.room].players[session.color].weapon = {name: 'short sword', cards: [1, 2, 3, 4, 5, 6]};
        games[session.room].players[session.color].armor = {name: 'light armor', cards: [0, 0, 1, 1, 2, 2]};
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

    socket.on('next_battle_turn', function() {
        console.log("NEXT BATTLE TURN");
        io.to(session.room).emit('clear_current') //get rid of later
        io.to(session.room).emit('update_player_cards', games[session.room].players);
        io.to(session.room).emit('update_enemy_cards', games[session.room].battle.enemies);
        var player_survivor = false;
        var enemy_survivor = false;
        for (var i in games[session.room].players) { //check if any player is still alive
            if (games[session.room].players[i].health > 0) {
                player_survivor = true;
                break;
            }
        }
        if (!player_survivor) { //all players are dead
            io.to(session.room).emit('log', "THEY'RE ALL DEAD!!");
            games[session.room] = null;
            return;
        }
        for (var i = 0; i < games[session.room].battle.enemies.length; i++) {
            if (games[session.room].battle.enemies[i].health > 0) {
                enemy_survivor = true;
                break;
            }
        }
        if (!enemy_survivor) { //all enemies are dead
            io.to(session.room).emit('log', "VICTORY MY LORD!!");
            io.to(session.room).emit('victory', games[session.room].battle.victory_params);
            return;
        }
        var max = {name: null, speed: 0};
        while(max.speed < 20) {
            for (var i = 0; i < games[session.room].battle.turns.length; i++) {
                games[session.room].battle.turns[i].speed += 1;
                if (games[session.room].battle.turns[i].speed > max.speed) {
                    max.speed = games[session.room].battle.turns[i].speed;
                    max.name = games[session.room].battle.turns[i].name;
                }
            }
        }
        console.log(max.name, "IS ATTACKING THIS TURN");
        if (['purple', 'yellow', 'blue', 'green', 'red', 'gray', 'silver'].indexOf(max.name) != -1) { //next turn is a player's
            for (var i in games[session.room].players) {
                if (games[session.room].players[i].color == max.name) {
                    games[session.room].players[i].state = "battle_turn_state";
                    games[session.room].battle.info = games[session.room].players[i].name + "'s turn to attack!";
                    var old_speed = games[session.room].players[i].speed;
                } else {
                    games[session.room].players[i].state = "battle_info_state";
                }
            }
        } else { //enemy turn is next
            for (var i in games[session.room].players) { //set all players to info state (one will be changed later)
                games[session.room].players[i].state = "battle_info_state";
            }
            for (var i = 0; i < games[session.room].battle.enemies.length; i++) {
                if (games[session.room].battle.enemies[i].name == max.name) {
                    var old_speed = games[session.room].battle.enemies[i].speed;
                    if (games[session.room].battle.enemies[i].pattern == 'random') { //find attack pattern
                        var target;
                        var count = 0;
                        while (games[session.room].players[target] == undefined || games[session.room].players[target].health == 0) {
                            for (var prop in games[session.room].players) { //get random player
                                if (Math.random() < 1 / ++count) { //this is a bizare solution that actually seems to work, should probably check out later
                                    target = prop;
                                }
                            }
                        }
                        games[session.room].players[target].state = "battle_defend_state";
                        games[session.room].battle.attacker = {};
                        games[session.room].battle.attacker.target = target;
                        games[session.room].battle.attacker.name = games[session.room].battle.enemies[i].name;
                        games[session.room].battle.attacker.weapon = games[session.room].battle.enemies[i].weapon;
                        games[session.room].battle.info = games[session.room].battle.enemies[i].name + " is attacking " + games[session.room].players[target].name + "!";
                    }
                }
            }
        }
        for (var i = 0; i < games[session.room].battle.turns.length; i++) { //reset highest speed
            if (games[session.room].battle.turns[i].name == max.name) {
                games[session.room].battle.turns[i].speed = old_speed;
            }
        }
        io.to(session.room).emit('seek_next');
    });

    socket.on('defended_attack', function(armor) {
        for (var i in games[session.room].players) {
            if (games[session.room].players[i].color == games[session.room].battle.attacker.target) {
                var damage = games[session.room].battle.attacker.attack - armor;
                if (damage < 0) { //very high armor
                    damage = 0;
                }
                games[session.room].players[i].health -= damage;
                if (games[session.room].players[i].health <= 0) { //they are dead
                    games[session.room].players[i].health = 0;
                    for (var j = 0; j < games[session.room].battle.turns.length; j++) { //get rid of dead player in battle turn sequence
                        if (games[session.room].battle.turns[j].name == games[session.room].players[i].color) {
                            games[session.room].battle.turns.splice(j, 1);
                        }
                    }
                    socket.emit("log", "YOU HAVE DIED");
                    io.to(session.room).emit('update_player_cards', games[session.room].players);
                    socket.emit("death");
                    socket.leave(session.room); //disconnect this client
                }
            }
        }
        socket.emit('call_callback', 'next_battle_turn');
    });

    socket.on('attacking_target', function(target) {
        for (var i = 0; i < games[session.room].battle.enemies.length; i++) {
            if (games[session.room].battle.enemies[i].name == target) {
                var armor = games[session.room].battle.enemies[i].armor.cards[Math.floor(Math.random() * games[session.room].battle.enemies[i].armor.cards.length)];
                var armor_name = games[session.room].battle.enemies[i].armor.name;
                var weapon = games[session.room].players[session.color].weapon.cards.slice(0);
                var weapon_name = games[session.room].players[session.color].weapon.name;
                var weapon_cards = [];
                for (var i = 0; i < 3; i++) {
                    var index = Math.floor(Math.random() * weapon.length);
                    weapon_cards.push(weapon[index]);
                    weapon.splice(index, 1);
                }
                socket.emit('draw_attack_damage', {armor: armor, armor_name: armor_name, weapon: weapon_cards, weapon_name: weapon_name, enemy: target});
            }
        }
    });

    socket.on('damage_enemy', function(params) {
        for (var i = 0; i < games[session.room].battle.enemies.length; i++) {
            if (games[session.room].battle.enemies[i].name == params.enemy) {
                games[session.room].battle.enemies[i].health -= params.damage;
                if (games[session.room].battle.enemies[i].health <= 0) {
                    games[session.room].battle.enemies[i].health = 0;
                    for (var j = 0; j < games[session.room].battle.turns.length; j++) { //get rid of dead enemy in battle turn sequence
                        if (games[session.room].battle.turns[j].name == params.enemy) {
                            games[session.room].battle.turns.splice(j, 1);
                        }
                    }
                }
            }
        }
        socket.emit('call_callback', 'next_battle_turn');
    });
}

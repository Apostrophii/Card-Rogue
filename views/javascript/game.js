$(document).ready(function() {
    checkOrientation(); //check if the users is in portrait or landscape mode
    window.addEventListener('orientationchange', function() {
        location.reload(true);
    }); 
    MAXWIDTH = 1500;
    MAXHEIGHT = 1000;
    WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0); 
    HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); 
    if (WIDTH > MAXWIDTH) {
        WIDTH = MAXWIDTH;
    }   
    if (HEIGHT > MAXHEIGHT) {
        HEIGHT = MAXHEIGHT;
    }   
    RATIO = WIDTH / MAXWIDTH;
    canvas = document.getElementById("gameCanvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    stage = new createjs.Stage('gameCanvas');
    document.getElementById("inner-selection").style.width = String(1000 * RATIO) + "px";
    document.getElementById("selection").style.fontSize = String(25 * RATIO) + "px";
    document.getElementById("selection").style.display = 'none';
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', stage);
    queue = new createjs.LoadQueue(true);
    queue.on("complete", handleComplete, this);
    //loadImage(); //for testing purposes
    socket.emit('join_room'); //very important
    socket.emit('get_cur_state');
}); 

function checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        alert("Please use landscape mode!");
        document.getElementById("screen").style.display = 'none';
    }   
}   

function loadImage() {
    queue.loadFile({id: 'testcard_front', src: 'images/sync/basic_card.front.png'});
    queue.loadFile({id: 'testcard_back', src: 'images/sync/basic_card.back.png'});
}   

function handleComplete() {
    var testcard_front = queue.getResult('testcard_front');
    var testcard_back = queue.getResult('testcard_back');
    var sample_text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    card1 = new Card(stage, testcard_front, testcard_back);
    card1.addElem("center", sample_text);
    card1.updateElem("center", {color: "#00CC00"});
    card1.addElem("top", "testing 1 2 3");

    card1.move(-250 * RATIO, 250 * RATIO, 250 * RATIO, 250 * RATIO, 1000, 0); 
    card1.flip(1000, 1000);
    card1.move(250 * RATIO, 250 * RATIO, 800 * RATIO, 250 * RATIO, 1000, 2000);
    card1.flip(1000, 3000);
}

socket.on('log', function(message) {
    console.log(message);
});

socket.on('char_select_state', function(params) {
    RACE = null;
    var inner = document.getElementById("inner-selection");
    var title = document.createElement("p");
    var p1 = document.createElement("p");
    var input = document.createElement("input");
    var p2 = document.createElement("p");
    var ul = document.createElement("ul");
    var conf = document.createElement("p");
    title.innerHTML = "CHARACTER CREATION";
    p1.innerHTML = "NAME:";
    p2.innerHTML = "RACE:";
    conf.innerHTML = "CONFIRM";
    input.setAttribute("type", "text");
    input.setAttribute("autofocus", "autofocus");
    input.setAttribute("maxlength", "15");
    input.setAttribute("size", "15");
    input.setAttribute("id", "name-select");
    p1.setAttribute("id", "name-label");
    p2.setAttribute("id", "race-label");
    conf.setAttribute("id", "confirm-select");
    title.setAttribute("id", "title-select");
    inner.appendChild(title);
    inner.appendChild(p1);
    inner.appendChild(input);
    inner.appendChild(p2);
    inner.appendChild(ul);
    inner.appendChild(conf);
    for (var i = 0; i < params.races.length; i++) { //list all the races and give them selection behavior
        var li = document.createElement("li");
        ul.appendChild(li);
        li.innerHTML += String(params.races[i]);
        li.onclick = function() {
            RACE = this.innerHTML;
            $("#inner-selection li").each(function() {
                $(this).removeClass("selected-race");
            });
            this.setAttribute("class", "selected-race");
        }
    }
    conf.onclick = function() { //confirmation
        var error = false;
        $('#race-label').removeClass("error-data");
        $('#name-label').removeClass("error-data");
        if (RACE == null) {
            error = true;
            $('#race-label').addClass("error-data");
        }
        if (input.value == '') {
            error = true;
            $('#name-label').addClass("error-data");
        } 
        if (error == false) {
            var data = {race: RACE, name: input.value};
            $('#inner-selection').empty(); //get rid of selection menu
            document.getElementById("selection").style.display = 'none';
            socket.emit(params.callback, data);
        }
    }
    document.getElementById("selection").style.display = 'block';
});

socket.on('seek_next', function() {
    console.log("SEEKING");
    socket.emit('get_cur_state');
});

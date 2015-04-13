$(document).ready(function() {
    checkOrientation(); //check if the users is in portrait or landscape mode
    window.addEventListener('orientationchange', function() {
        location.reload(true);
    }); 
    MAXWIDTH = 1500; //this is our official ratio
    MAXHEIGHT = 1000;
    WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0); 
    HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0); 
    if (WIDTH > MAXWIDTH) {
        WIDTH = MAXWIDTH;
    }   
    if (HEIGHT > MAXHEIGHT) {
        HEIGHT = MAXHEIGHT;
    }   
    RATIO = WIDTH / MAXWIDTH; //set game ratio based on screen width
    HEIGHT_RATIO = HEIGHT / MAXHEIGHT;
    canvas = document.getElementById("gameCanvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    STAGE = new createjs.Stage('gameCanvas');
    DECK = [];
    CUR_CARD = null;
    document.getElementById("inner-selection").style.width = String(1000 * RATIO) + "px"; //some initial styling based on our ratio
    document.getElementById("selection").style.fontSize = String(25 * RATIO) + "px";
    document.getElementById("selection").style.display = 'none'; //and hide it for starters
    createjs.Ticker.setFPS(60); //frames per second
    createjs.Ticker.addEventListener('tick', STAGE);
    initial_queue = new createjs.LoadQueue(true); //create a queue for any media we want to dynamically upload
    initial_queue.on("complete", handleComplete, this); //what to call when everything in the queue is downloaded
    load_initial_images(); //get our initial images
}); 

function checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        alert("Please use landscape mode!");
        document.getElementById("screen").style.display = 'none';
    }   
}   

function load_initial_images() {
    initial_queue.loadFile({id: 'cardfront_basic', src: 'images/sync/basic_card.front.png'});
    initial_queue.loadFile({id: 'cardback_basic', src: 'images/sync/basic_card.back.png'});
}   

function handleComplete() { //make sure these are loaded
    CARDFRONT_BASIC = initial_queue.getResult('cardfront_basic');
    CARDBACK_BASIC = initial_queue.getResult('cardback_basic');
    socket.emit('join_room'); //very important
    socket.emit('get_cur_state');
}

socket.on('log', function(message) {
    console.log(message);
});

socket.on('seek_next', function() {
    console.log("SEEKING");
    socket.emit('get_cur_state');
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

clearDeck = function() {
    for (var i = 0; i < DECK.length; i++) {
        DECK[i].card.removeAllChildren();
    }
    DECK = null;
}

socket.on('draw_card_state', function(params) {
    if (CUR_CARD) {
        CUR_CARD.card.removeAllChildren();
        CUR_CARD = null;
    }
    DECK = [];
    for (var i = 0; i < params.deck_size; i++) {
        DECK[i] = new Card(STAGE, CARDFRONT_BASIC, CARDBACK_BASIC);
        DECK[i].addElem("center", 'CARD FRONT'); //for testing which side is the front
        DECK[i].flip(0, 0);
        DECK[i].rotate(0, -90, 0, 0);
        DECK[i].move(750 * RATIO, -250 * RATIO, 750 * RATIO, (HEIGHT / 2) + ((params.deck_size - 1) * 5) - (i * 5), 1000, 0);
    }
    DECK[params.deck_size - 1].card.addEventListener("click", function (event) {
        console.log("CLICKED THE TOP CARD");
        socket.emit(params.callback);
    });
});

socket.on('info_card', function(params) {
    CUR_CARD = new Card(STAGE, CARDFRONT_BASIC, CARDBACK_BASIC);
    CUR_CARD.addElem("top", params.title);
    CUR_CARD.addElem("center", params.text);
    CUR_CARD.flip(0, 0);
    CUR_CARD.rotate(0, -90, 0, 0);
    CUR_CARD.move(750 * RATIO, -250 * RATIO, 750 * RATIO, HEIGHT / 2, 0, 0);
    CUR_CARD.rotate(-90, 0, 500, 0);
    CUR_CARD.flip(500, 500);
    CUR_CARD.scale(1 * RATIO, 2.2 * HEIGHT_RATIO, 500, 1000);
    clearDeck();
    if (params.callback) {
        CUR_CARD.card.addEventListener("click", function (event) {
            socket.emit(params.callback);
        });
    }
});

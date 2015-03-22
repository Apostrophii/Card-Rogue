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
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', stage);
    queue = new createjs.LoadQueue(true);
    queue.on("complete", handleComplete, this);
    //loadImage(); //for testing purposes
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
});

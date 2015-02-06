function Card(front, back, text, preset) {
    this.front = new createjs.Bitmap(front);
    this.back = new createjs.Bitmap(back);

    if (preset == "standard") {
        this.edgeOffset = 15 * RATIO;
        this.yOffset = 0;
        this.text = new createjs.Text(text, "15px Arial", "#777777");
        this.text.textAlign = "center";
        this.faceUp = true;
        this.back.scaleX = 0;
    } else {
        console.log("INVALID PRESET");
    }

    this.bounds = this.front.getBounds();
    this.text.lineWidth = this.bounds.width - (this.edgeOffset * 2);

    this.front.regX = this.bounds.width / 2;
    this.front.regY = this.bounds.height / 2;
    this.back.regX = this.bounds.width / 2;
    this.back.regY = this.bounds.height / 2;

    this.card = new createjs.Container();
    this.card.addChild(this.front, this.back, this.text);
    this.card.scaleX = RATIO;
    this.card.scaleY = RATIO;
    this.card.x = 250; //default starting position
    this.card.y = 250; 
    stage.addChild(this.card);
    stage.update(); //might not need this

    this.move = function(x, y, time, delay) {
        createjs.Tween.get(this.card).wait(delay, true).to({x: x, y: y}, time);
    }

    this.flip = function(time, delay) {
        if (this.faceUp) {
            this.faceUp = false;
            createjs.Tween.get(this.text).wait(delay, true).to({scaleX: 0}, time / 2);//flip text
            createjs.Tween.get(this.front).wait(delay, true).to({scaleX: 0}, time / 2).call(function(back) { //flip front
                createjs.Tween.get(back).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip back
            }, [this.back]);
        } else {
            this.faceUp = true;
            this.flipBackDown = createjs.Tween.get(this.back).wait(delay, true).to({scaleX: 0}, time / 2).call(function(text, front) { //flip back
                createjs.Tween.get(text).call(function(front) {
                    createjs.Tween.get(front).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip front
                }, [front]).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip text
            }, [this.text, this.front]); //ugly way to do things but it works
        }
    }
}

function Card(front, back, text, preset) {
    this.front = new createjs.Bitmap(front);
    this.back = new createjs.Bitmap(back);

    this.cardBounds = this.front.getBounds();
    
    this.front.regX = this.cardBounds.width / 2;
    this.front.regY = this.cardBounds.height / 2;
    this.back.regX = this.cardBounds.width / 2;
    this.back.regY = this.cardBounds.height / 2;

    if (preset == "center") {
        this.edgeOffset = 30 * RATIO;
        this.text = new createjs.Text(text, "15px Arial", "#CC0000");
        this.text.lineWidth = this.cardBounds.width - (this.edgeOffset * 2);
        this.textHeight = this.text.getMeasuredHeight();
        this.text.textAlign = "center";
        this.text.regY = this.textHeight / 2; //apparently only the regY is needed for text
        this.faceUp = true;
        this.back.scaleX = 0;
    } else if (preset == "top") {
        this.edgeOffset = 30 * RATIO;
        this.text = new createjs.Text(text, "15px Arial", "#CC0000");
        this.text.lineWidth = this.cardBounds.width - (this.edgeOffset * 2);
        this.textHeight = this.text.getMeasuredHeight();
        this.text.textAlign = "center";
        this.text.regY = (this.cardBounds.height / 2) - this.edgeOffset; //apparently only the regY is needed for text
        this.faceUp = true;
        this.back.scaleX = 0;
    } else if (preset == "bottom") {
        this.edgeOffset = 30 * RATIO;
        this.text = new createjs.Text(text, "15px Arial", "#CC0000");
        this.text.lineWidth = this.cardBounds.width - (this.edgeOffset * 2);
        this.textHeight = this.text.getMeasuredHeight();
        this.text.textAlign = "center";
        this.text.regY = -(this.cardBounds.height / 2) + this.edgeOffset + this.textHeight; //apparently only the regY is needed for text
        this.faceUp = true;
        this.back.scaleX = 0;
    } else {
        console.log("INVALID PRESET");
    }

    this.card = new createjs.Container();
    this.card.addChild(this.front, this.back, this.text);
    this.card.scaleX = RATIO;
    this.card.scaleY = RATIO;
    this.card.x = -250; //default starting position
    this.card.y = 250; 
    stage.addChild(this.card);
    stage.update(); //might not need this

    this.move = function(x1, y1, x2, y2, time, delay) {
        createjs.Tween.get(this.card).wait(delay, true).to({x: x1, y: y1}, 0).to({x: x2, y: y2}, time);
    }

    this.flip = function(time, delay) {
        if (this.faceUp) {
            this.faceUp = false;
            createjs.Tween.get(this.text).wait(delay, true).to({scaleX: 1}, 0).to({scaleX: 0}, time / 2); //flip text
            createjs.Tween.get(this.front).wait(delay, true).to({scaleX: 1}, 0).to({scaleX: 0}, time / 2).play(this.flipBack); //flip front
            createjs.Tween.get(this.back).wait(delay + time / 2, true).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip back
        } else {
            this.faceUp = true;
            createjs.Tween.get(this.back).wait(delay, true).to({scaleX: 1}, 0).to({scaleX: 0}, time / 2).play(this.flipFront).play(this.flipText); //flip back
            createjs.Tween.get(this.front).wait(delay + time / 2, true).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip front
            createjs.Tween.get(this.text).wait(delay + time / 2, true).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip text
        }
    }
}

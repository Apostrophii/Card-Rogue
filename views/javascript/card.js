function Card(stage, front, back) {
    this.frontFace = new createjs.Bitmap(front); //create bitmaps for front and back
    this.backFace = new createjs.Bitmap(back);

    this.card = new createjs.Container(); //create card container
    this.front = new createjs.Container(); //create front and back container
    this.back = new createjs.Container();
    this.front.addChild(this.frontFace); //add children to containers
    this.back.addChild(this.backFace);
    this.card.addChild(this.front, this.back);

    this.cardBounds = this.frontFace.getBounds(); //set the local card origin for the front and back
    this.frontFace.regX = this.cardBounds.width / 2;
    this.frontFace.regY = this.cardBounds.height / 2;
    this.backFace.regX = this.cardBounds.width / 2;
    this.backFace.regY = this.cardBounds.height / 2;

    this.faceUp = true; //start the card out fliped face up
    this.back.scaleX = 0;

    this.card.scaleX = RATIO; //set ratio
    this.card.scaleY = RATIO;
    this.card.x = -250; //default starting position
    this.card.y = 250; 
    stage.addChild(this.card); //add card to stage
    stage.update(); //might not need this

    this.move = function(x1, y1, x2, y2, time, delay) {
        createjs.Tween.get(this.card).wait(delay, true).to({x: x1, y: y1}, 0).to({x: x2, y: y2}, time);
    }

    this.rotate = function(r1, r2, time, delay) {
        createjs.Tween.get(this.card).wait(delay, true).to({rotation: r1}, 0).to({rotation: r2}, time);
    }

    this.scale = function(s1, s2, time, delay) {
        createjs.Tween.get(this.card).wait(delay, true).to({scaleX: s1, scaleY: s1}, 0).to({scaleX: s2, scaleY: s2}, time);
    }

    this.flip = function(time, delay) {
        if (this.faceUp) {
            this.faceUp = false;
            createjs.Tween.get(this.front).wait(delay, true).to({scaleX: 1}, 0).to({scaleX: 0}, time / 2); //flip front
            createjs.Tween.get(this.back).wait(delay + time / 2, true).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip back
        } else {
            this.faceUp = true;
            createjs.Tween.get(this.back).wait(delay, true).to({scaleX: 1}, 0).to({scaleX: 0}, time / 2); //flip back
            createjs.Tween.get(this.front).wait(delay + time / 2, true).to({scaleX: 0}, 0).to({scaleX: 1}, time / 2); //flip front
        }
    }

    this.updateElem = function(preset, data) {
        if (this.front.getChildByName(preset)) {
            this.front.getChildByName(preset).set(data);
        } else if (this.back.getChildByName(preset)) {
            this.back.getChildByName(preset).set(data);
        } else {
            console.log("PRESET DOES NOT EXIST");
            return;
        }
    }

    this.addElem = function(preset, data) {
        if (this.front.getChildByName(preset)) { //get rid of this preset if it already exists
            this.front.removeChild(this.front.getChildByName(preset));
        } else if (this.back.getChildByName(preset)) {
            this.back.removeChild(this.back.getChildByName(preset));
        }
        if (preset == "center") {
            var edgeOffset = 30;
            var child = new createjs.Text(data, "18px Arial", "#CC0000");
            child.name = preset;
            child.lineWidth = this.cardBounds.width - (edgeOffset * 2);
            child.textAlign = "center";
            child.regY = child.getMeasuredHeight() / 2;
            this.front.addChild(child);
        } else if (preset == "top") {
            var edgeOffset = 30;
            var child = new createjs.Text(data, "24px Arial", "#CC0000");
            child.name = preset;
            child.lineWidth = this.cardBounds.width - (edgeOffset * 2);
            child.textAlign = "center";
            child.regY = (this.cardBounds.height / 2) - edgeOffset;
            this.front.addChild(child);
        } else if (preset == "bottom") {
            var edgeOffset = 30;
            var child = new createjs.Text(data, "15px Arial", "#CC0000");
            child.name = preset;
            child.lineWidth = this.cardBounds.width - (edgeOffset * 2);
            child.textAlign = "center";
            child.regY = -(this.cardBounds.height / 2) + edgeOffset + child.getMeasuredHeight();
            this.front.addChild(child);
        } else {
            console.log("INVALID PRESET");
        }
    }
}

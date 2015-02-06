function Card(front, back, faceUp, text, fontsize, font, color, offset, alignment) {
    var offset = offset * RATIO;

    this.front = new createjs.Bitmap(front);
    this.back = new createjs.Bitmap(back);
    this.text = new createjs.Text(text, fontsize + ' ' + font, color);

    this.text.textAlign = "center";
    var bounds = this.front.getBounds();
    this.text.lineWidth = bounds.width - (offset * 2);

    //apparently these aren't needed for text
    //this.text.regX = this.text.lineWidth / 2;
    //this.text.regY = this.text.getMeasuredHeight() / 2;
    this.front.regX = bounds.width / 2;
    this.front.regY = bounds.height / 2;
    this.back.regX = bounds.width / 2;
    this.back.regY = bounds.height / 2;

    this.text.scaleX = RATIO;
    this.text.scaleY = RATIO;
    this.front.scaleX = RATIO;
    this.front.scaleY = RATIO;
    this.back.scaleX = RATIO;
    this.back.scaleY = RATIO;

    if (alignment == 'top') {
        this.yOffset = -((bounds.height / 2) - offset - this.font.regY);
    } else if (alignment == 'bottom') {
        this.yOffset = (bounds.height / 2) - offset - this.font.regY;
    } else {
        this.yOffset = 0;
    }

    if (faceUp) {
        this.up = this.front;
        this.down = this.back;
    } else {
        this.up = this.back;
        this.down = this.front;
    }

    this.text.visible = false;
    this.front.visible = false;
    this.back.visible = false;

    stage.addChild(this.front);
    stage.addChild(this.back);
    stage.addChild(this.text);

    this.move = function(x, y, wait, time) {
        this.up.visible = true;
        if (this.up == this.front) {
            createjs.Tween.get(this.text).wait(wait).to({visible: true}).to({x: x, y: y}, time);
        } else {
            this.text.x = x;
            this.text.y = y;
        }
        this.down.x = x;
        this.down.y = y;
        createjs.Tween.get(this.up).wait(wait).to({x: x, y: y}, time);
    }   
    this.flip = function(wait, time) {
        var face1 = this.up;
        var face2 = this.down;
        this.up = [this.down, this.down = this.up][0] //this swaps the values
        var init_scale = face1.scaleX;
        face2.scaleX = 0;
        if (this.down == this.front) {
            createjs.Tween.get(this.text).wait(wait).to({scaleX: 0}, time / 2);
            createjs.Tween.get(face1).wait(wait).to({scaleX: 0}, time / 2).to({visible: false});
            createjs.Tween.get(face2).wait(wait + (time / 2)).to({visible: true}).to({scaleX: init_scale}, time / 2);
        } else {
            this.text.scaleX = 0;
            createjs.Tween.get(face1).wait(wait).to({scaleX: 0}, time / 2).to({visible: false});
            createjs.Tween.get(face2).wait(wait + (time / 2)).to({visible: true}).to({scaleX: init_scale}, time / 2); 
            createjs.Tween.get(this.text).wait(wait + (time / 2)).to({visible: true}).to({scaleX: init_scale}, time / 2); 
        }
    }   
}

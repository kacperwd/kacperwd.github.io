function BitmapText(textures) {
    this._textures     = textures; 
    this.spacing       = 0;
    this.scale         = 1;
    this.charWidth     = null; 
    this._currentWidth = 0;
    this._container    = new PIXI.Container();
};

BitmapText.prototype.update = function(text) {
    this._container.removeChildren();
    this._currentWidth = 0;
    var x = 0;
    for(var i = 0; i < text.length; i++) {
        var char    = text.charAt(i);
        var texture = this._textures[char];
        var sprite  = new PIXI.Sprite(texture);
        sprite.scale.set(this.scale);
        sprite.x = x;
        x += (this.charWidth != null ? this.charWidth * this.scale : sprite.width) + this.spacing;
        this._currentWidth += sprite.width + this.spacing;
        this._container.addChild(sprite);
    }
};

BitmapText.prototype.getSprite = function() {
    return this._container;
};

BitmapText.prototype.getCurrentWidth = function() {
    return this._currentWidth;
};

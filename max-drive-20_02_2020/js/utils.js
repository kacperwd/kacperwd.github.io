var lerp = function(a, b, f) {
    return (a * (1.0 - f)) + (b * f);
};

var towards = function(a, b, amount) {
	if(a < b) {
		a += amount;
		if(a > b) {
			a = b;
		}
	}
	else if(a > b) {
		a -= amount;
		if(a < b) {
			a = b;
		}
	}
	return a;
};

var generateTextureArray = function(baseName, ext, i, j) {
    var textures = [];
    for(; i <= j; i++) {
        var texture = PIXI.Texture.from(baseName + i + "." + ext);
        textures.push(texture);
    }
    return textures;
};

var addMultiEventListener = function(events, callback) {
    events.forEach(function(eventName) {
        document.addEventListener(eventName, callback);
    });
};

var removeMultiEventListener = function(events, callback) {
    events.forEach(function(eventName) {
        document.removeEventListener(eventName, callback);
    });
};

var createHandAnimation = function() {
    hand = new PIXI.extras.AnimatedSprite(generateTextureArray("assets/hand_", "png", 1, 20));
    hand.anchor.set(0.5);
    hand.scale.set(0.75);
    hand.animationSpeed = 0.4;
    hand.play();
    return hand;
};

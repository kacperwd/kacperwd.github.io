function Particles() {
    var self = this;
    this._container = new PIXI.Container();
    this._textures  = {
        "dust": PIXI.Texture.fromImage("assets/dust.png")
    };
}

Particles.prototype.update = function(delta) {
    var self = this;
    this._container.children.forEach(function(particle) {
        particle.scale.set(particle.scale.x + particle.scaleSpeed * delta);
        particle.alpha += particle.alphaSpeed * delta;
        particle.x += self.track.scrollAmountX;
        particle.y += self.track.scrollAmountY;
        if(particle.alpha < 0) {
            particle.parent.removeChild(particle);
        }
        else if(particle.alpha > 1 && particle.alphaSpeed > 0) {
            particle.alphaSpeed *= -1;
        }
    });
};

Particles.prototype.addTo = function(container) {
    container.addChild(this.getContainer());
};

Particles.prototype.emit = function(key, x, y, randomRadius, startAlpha, alphaSpeed, startScale, scaleRandom, scaleSpeed) {
    var particle = new PIXI.Sprite(this._textures[key]);
    particle.alphaSpeed = alphaSpeed;
    particle.scaleSpeed = scaleSpeed;
    var randomAngle = Math.random() * Math.PI * 2; 
    particle.position.x = x + Math.cos(randomAngle) * randomRadius;
    particle.position.y = y + Math.sin(randomAngle) * randomRadius;
    particle.alpha = startAlpha;
    particle.anchor.set(0.5);
    particle.scale.set(startScale + Math.random() * scaleRandom);
    particle.rotation = randomAngle;
    this._container.addChild(particle);
};

Particles.prototype.getContainer = function() {
    return this._container;
};

Particles.prototype.reset = function() {
    this._container.children.forEach(function(child) {
        child.parent.removeChild(child);
    });
};

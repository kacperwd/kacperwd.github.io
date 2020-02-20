var app    = null;
var states = null;
var camera = null;
var background = null;
var track = null;
var car = null;
var particles  = null;
var bitmapText = null;
var webgl = false;

var boot = function(event) {
    app = new PIXI.Application({
        width: 360,
        height: 640,
        roundPixels: false,
        legacy: true,
        clearBeforeRender: false,
        forceFXAA: true
    });
    document.body.appendChild(app.view);

    //webgl = app.renderer instanceof PIXI.WebGLRenderer;

    states = new StateManager();
    states.add("menu", menuState);
    states.add("gameplay", gameplayState);
    states.add("game_over", gameOverState);

    background = new PIXI.Graphics();
    background.beginFill(0xc5891c);
 	background.drawRect(0, 0, app._options.width, app._options.height);
 	background.endFill();
    app.stage.addChild(background);

    camera = new PIXI.Container();
    camera.baseScale = 1.15;
    if(webgl) camera.scale.set(camera.baseScale);
    app.stage.addChild(camera);

    track = new Track();
    track.addTo(camera);

    car = new Car(
        PIXI.Texture.fromImage("assets/car.png"),
        PIXI.Texture.fromImage("assets/car-shadow.png")
    );
    car.addTo(camera);
    car.track = track;
    track.car = car;

    particles = new Particles();
    particles.addTo(camera);
    particles.track = track;

    bitmapText = new BitmapText(
        generateTextureArray("assets/font_", "png", 0, 9)
    );
    bitmapText.charWidth = 32;
    bitmapText.scale = 0.7;
    var bitmapSprite = bitmapText.getSprite();
    bitmapSprite.x = 10;
    bitmapSprite.y = 10;
    app.stage.addChild(bitmapSprite);

    states.switch("menu");
};
window.addEventListener("load", boot);

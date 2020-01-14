var game = {
    baseWidth: 360,
    baseHeight: 640,
    spaces: {},
    res: null,
    pixelsToUnits: function(px) {
        return px * 0.05;
    },
    unitsToPixels: function(u) {
        return u * 20;
    },
    drawableToBody: function(drawable, body) {
        drawable.position = game.translate(body.getPosition());
        drawable.angle = -body.getAngle();
    },
    translate: function(position) {
        var pixels = {
            x: game.unitsToPixels(position.x) + game.baseWidth * 0.5,
            y: game.unitsToPixels(position.y) * (-1) + game.baseHeight
        };
        return pixels;
    }
};

PP.loader.add("background", "files/background.png", "img");
PP.loader.add("car", "files/car.png", "img");
PP.loader.add("tire", "files/tire.png", "img");
PP.loader.load(null, function(resources) {
    game.res = resources;
    init();
});

var init = function() {
    var terrainDef = [
        { x: game.pixelsToUnits(-game.baseWidth / 2), y: game.pixelsToUnits(game.baseHeight / 2) },
        { x: game.pixelsToUnits(40), y: game.pixelsToUnits(-25) },
        { x: game.pixelsToUnits(40), y: game.pixelsToUnits(-40) },
        { x: game.pixelsToUnits(160), y: 0 },
        { x: game.pixelsToUnits(20), y: game.pixelsToUnits(10) },
        { x: game.pixelsToUnits(20), y: game.pixelsToUnits(20) },
        { x: game.pixelsToUnits(30), y: game.pixelsToUnits(40) },
        { x: game.pixelsToUnits(20), y: game.pixelsToUnits(50) },
        { x: game.pixelsToUnits(15), y: game.pixelsToUnits(75) },
        { x: game.pixelsToUnits(10), y: game.pixelsToUnits(80) },
        { x: game.pixelsToUnits(5), y: game.pixelsToUnits(40) },
        { x: game.pixelsToUnits(-5), y: game.pixelsToUnits(30) },
        { x: game.pixelsToUnits(-20), y: game.pixelsToUnits(40) },
        { x: game.pixelsToUnits(-20), y: game.pixelsToUnits(20) },
        { x: game.pixelsToUnits(-20), y: game.pixelsToUnits(10) },
        { x: game.pixelsToUnits(80), y: game.pixelsToUnits(10) }
    ];
    terrainDef = createTerrain(terrainDef);

    createSpaces();
    createBackground();
    drawTerrain(terrainDef, game.spaces.background.context);
    createStates();
    preparePlanck();
    createPlanckTerrain(terrainDef);
    createPlanckCar();

    if(window.location.href.indexOf("?testbed=true") > -1) {
        planck.testbed(function(testbed) {
            return game.pworld;
        });
    } else {
        prepareStage();
    }

    PP.states.start("level");
};

var createSpaces = function() {
    game.spaces.background = PP.stage.addDrawingSpace({
        width: game.baseWidth,
        height: game.baseHeight,
        clearBeforeRender: false
    }, { alpha: false });
    game.spaces.screen = PP.stage.addDrawingSpace({
        width: game.baseWidth,
        height: game.baseHeight,
        clearBeforeRender: true
    }, { alpha : true });
};

var createBackground = function() {
    var drawableBackground = new PP.Drawable(game.res["background"].img);
        drawableBackground.position.x = game.baseWidth  / 2 + 150 + Math.round(Math.random() * 50);
        drawableBackground.position.y = game.baseHeight / 2;
    game.spaces.background.addDrawable(drawableBackground);
    game.spaces.background.redraw();
};

var createTerrain = function(terrainDef) {
    return terrainDef;
};

var drawTerrain = function(terrainDef, ctx) {
    var currentPosition = {
        x: terrainDef[0].x, y: terrainDef[0].y
    };
    currentPosition = game.translate(currentPosition);

    ctx.beginPath();
    ctx.moveTo(currentPosition.x, currentPosition.y);
    for(var i = 1, l = terrainDef.length; i < l; i++) {
        currentPosition.x += game.unitsToPixels(terrainDef[i].x);
        currentPosition.y -= game.unitsToPixels(terrainDef[i].y);
        ctx.lineTo(currentPosition.x, currentPosition.y);
    }
    ctx.strokeStyle = "#fcce18";
    ctx.lineCap = "round";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.lineTo(currentPosition.x, game.baseHeight);
    ctx.lineTo(0, game.baseHeight);
    ctx.lineTo(terrainDef[0].x, terrainDef[0].y);
    ctx.fillStyle = "#432f26";
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
};

var createStates = function() {
    PP.states.add("level", game.stateLevel);
};

var preparePlanck = function() {
    game.pworld = planck.World({
        gravity: planck.Vec2(0, -10)
    });
};

var createPlanckTerrain = function(terrainDef) {
    var body = game.pworld.createBody();
    var currentPosition = {
        x: terrainDef[0].x, y: terrainDef[0].y
    };

    for(var i = 1, l = terrainDef.length; i < l; i++) {
        var nextPosition = {
            x: currentPosition.x + terrainDef[i].x,
            y: currentPosition.y + terrainDef[i].y
        };
        body.createFixture(
            planck.Edge(
                planck.Vec2(currentPosition.x, currentPosition.y),
                planck.Vec2(nextPosition.x, nextPosition.y)
            ), {
                density: 0,
                friction: 1
            }
        );
        currentPosition.x = nextPosition.x;
        currentPosition.y = nextPosition.y;
    }
};

var createPlanckCar = function() {
    var car = game.pworld.createBody({
        type: "dynamic",
        position: planck.Vec2(game.pixelsToUnits(-game.baseWidth / 2 + 50), game.pixelsToUnits(game.baseHeight / 1.75))
    });
    car.createFixture(planck.Box(
        game.pixelsToUnits(29 / 2), game.pixelsToUnits(19 / 2),
        planck.Vec2(game.pixelsToUnits(-7), game.pixelsToUnits(-1))
    ), {
        density: 1
    });
    car.createFixture(planck.Box(
        game.pixelsToUnits(17 / 2), game.pixelsToUnits(12 / 2),
        planck.Vec2(game.pixelsToUnits(15), game.pixelsToUnits(-4))
    ), {
        density: 1.5
    });
    var carPos = car.getPosition();

    var wheelDef = {
        density: 0.5,
        friction: 3
    };

    var wheelBack = game.pworld.createDynamicBody(planck.Vec2(carPos.x + game.pixelsToUnits(-14), carPos.y - game.pixelsToUnits(13)));
    wheelBack.createFixture(planck.Circle(game.pixelsToUnits(5)), wheelDef);

    var wheelFront = game.pworld.createDynamicBody(planck.Vec2(carPos.x + game.pixelsToUnits(15), carPos.y - game.pixelsToUnits(12)));
    wheelFront.createFixture(planck.Circle(game.pixelsToUnits(5)), wheelDef);

    var springBack = game.pworld.createJoint(planck.WheelJoint({
        motorSpeed : 0.0,
        maxMotorTorque : 20.0,
        enableMotor : true,
        frequencyHz : 4.0,
        dampingRatio : 7.0
    }, car, wheelBack, wheelBack.getPosition(), planck.Vec2(0.0, 1.0)));

    var springFront = game.pworld.createJoint(planck.WheelJoint({
        motorSpeed : 0.0,
        maxMotorTorque : 10.0,
        enableMotor : false,
        frequencyHz : 4.5,
        dampingRatio : 7.0
    }, car, wheelFront, wheelFront.getPosition(), planck.Vec2(0.0, 1.0)));

    game.car = car;
    game.wheels = {
        back: wheelBack,
        front: wheelFront
    };
    game.springs = {
        back: springBack,
        front: springFront,
        active: springBack,
        passive: springFront
    };
};

var prepareStage = function() {
    window.onresize = function() {
        PP.stage.fit(window.innerWidth, window.innerHeight);
        PP.stage.center(window.innerWidth, window.innerHeight);
    };
    window.onresize();
    document.body.appendChild(PP.stage.div);
};

game.stateLevel = {
    init: function() {
        if(!this.drawableCar) {
            this.drawableCar = new PP.Drawable(game.res["car"].img);
        }

        if(!this.drawableWheels) {
            this.drawableWheels = {
                back : new PP.Drawable(game.res["tire"].img),
                front: new PP.Drawable(game.res["tire"].img)
            }
        }

        game.spaces.screen.addDrawable(
            this.drawableCar,
            this.drawableWheels.back,
            this.drawableWheels.front
        );

        this.pointerControls = new PP.PointerControls();
        this.pointerControls.onPointerDown(function(x, y) {
            var runSpringMotor = function(spring) {
                spring.enableMotor(true);
                spring.setMotorSpeed(-60.0);
            };
            game.springs.passive.enableMotor(false);
            runSpringMotor(game.springs.active);
        }, this);
        this.pointerControls.onPointerUp(function(x, y) {
            var stopSpringMotor = function(spring) {
                spring.enableMotor(true);
                spring.setMotorSpeed(0);
            }
            stopSpringMotor(game.springs.active);
        }, this);

        this.debugControls = new PP.Controls();
        this.debugControls.add("keydown", function(e) {
            if(e.keyCode == 65) {
            } // a
            else if(e.keyCode == 68) {
            } // d
        }, this);
    },
    update: function(ratio, elapsed) {
        game.pworld.step(1 / 60);

        game.drawableToBody(this.drawableCar, game.car);
        game.drawableToBody(this.drawableWheels.back, game.wheels.back);
        game.drawableToBody(this.drawableWheels.front, game.wheels.front);
        game.spaces.screen.redraw();
    },
    end: function() {
        game.spaces.screen.removeDrawable(
            this.drawableCar,
            this.drawableWheels.back,
            this.drawableWheels.front
        );
        this.pointerControls.clear();
        this.controls.clear();
    }
};

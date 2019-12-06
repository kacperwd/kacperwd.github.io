var game = {};

game.opts = {
    width: 1152,
    height: 640,
    forceFXAA: true,
    antialias: true,
    legacy: true,
    transparent: false,
    clearBeforeRender: false
};

game.app = new PIXI.Application(game.opts);

game.onresize = function(parentWidth, parentHeight) {
    game.app.renderer.resize(parentWidth, parentHeight);
    var scaleX = parentWidth  / game.opts.width;
    var scaleY = parentHeight / game.opts.height;
    var scale  = Math.round(Math.min(scaleX, scaleY) * 1000) / 1000;
    game.app.scene.scale.set(scale);

    var marginX = parentWidth - Math.round(game.opts.width * scale);
    game.app.scene.x = marginX / 2;
    var marginY = parentHeight - Math.round(game.opts.height * scale);
    game.app.scene.y = marginY / 2;

    var background = {
        aspectRatio: {
            original: game.background.sprite.texture.width / game.background.sprite.texture.height,
            now: 0,
            deviation: 0
        },
        calculatedScale: {
            x: parentWidth  / game.background.sprite.texture.width,
            y: parentHeight / game.background.sprite.texture.height
        },
        niceScale: {
            x: 0,
            y: 0
        }
    };

    background.aspectRatio.now = background.calculatedScale.x / background.calculatedScale.y;
    background.aspectRatio.deviation = Math.abs(1 - (background.aspectRatio.now / background.aspectRatio.original));
    background.niceScale.x = background.calculatedScale.x;
    background.niceScale.y = background.calculatedScale.y;

    if(background.aspectRatio.deviation > 0.3) {
        if(background.aspectRatio.now < background.aspectRatio.original) {
            background.niceScale.x = background.calculatedScale.x * (1 + background.aspectRatio.deviation);
        }
        else {
            background.niceScale.y = background.calculatedScale.y * (1 + background.aspectRatio.deviation);
        }
    }

    game.background.sprite.scale.x = background.niceScale.x;
    game.background.sprite.scale.y = background.niceScale.y;
    game.background.sprite.position.x = -(game.background.sprite.width  - parentWidth);
    game.background.sprite.position.y = -(game.background.sprite.height - parentHeight);

    game.bounds = {
        left: 0 - game.app.scene.x * (1 / game.app.scene.scale.x),
        top: 0 - game.app.scene.y * (1 / game.app.scene.scale.y),
        right: 0,
        bottom: 0
    };
    game.bounds.right = game.bounds.left + game.app.renderer.width * (1 / game.app.scene.scale.x);
    game.bounds.bottom = game.bounds.top + game.app.renderer.height * (1 / game.app.scene.scale.y);

    game.background.spriteLogo.anchor.set(0.5);
    game.background.spriteLogo.position.x = game.bounds.right - game.background.spriteLogo.width / 1.25;
    game.background.spriteLogo.position.y = game.bounds.bottom - game.background.spriteLogo.height / 1;
};

game.stateTransitionFunction = function(a, previousState, currentState) {
    if(!previousState.container || !currentState.container) return;
    currentState.container.alpha = a;
    currentState.container.y = -8 * (1 - a);
    previousState.container.alpha = 0;
};

game.stateMenu = {
    init: function() {
        var self = this;
        this.container = new PIXI.Container();

        this.spriteTitle = new PIXI.Sprite(PIXI.Texture.from(game.resources["title"].img));
        this.spriteTitle.x = game.opts.width  / 2;
        this.spriteTitle.y = game.opts.height / 2 - 100;
        this.spriteTitle.anchor.set(0.5);

        this.spriteCaps = new PIXI.Sprite(PIXI.Texture.from(game.resources["caps"].img));
        this.spriteCaps.x = game.opts.width / 2 + 230;
        this.spriteCaps.y = 45;

        this.buttonPlay = new PixiButton(PIXI.Texture.from(game.resources["button-play"].img));
        this.buttonPlay.position.x = game.opts.width  / 2;
        this.buttonPlay.position.y = game.opts.height / 2 + 196;

        this.buttonSoundOn = new PixiButton(PIXI.Texture.from(game.resources["button-sound-on"].img));
        this.buttonSoundOn.addToScale = 0;
        this.buttonSoundOn.scaleRatio = 0.8;

        this.buttonSoundOff = new PixiButton(PIXI.Texture.from(game.resources["button-sound-off"].img));
        this.buttonSoundOff.addToScale = 0;
        this.buttonSoundOff.scaleRatio = this.buttonSoundOn.scaleRatio;
        this.buttonSoundOff.visible = false;

        this.container.addChild(this.spriteTitle);
        this.container.addChild(this.spriteCaps);
        this.container.addChild(this.buttonPlay);
        this.container.addChild(this.buttonSoundOn);
        this.container.addChild(this.buttonSoundOff);
        game.app.scene.addChild(this.container);

        this.buttonSoundOn.callback = function() {
            self.buttonSoundOn.visible  = false;
            self.buttonSoundOff.visible = true;
            PP.sounds.setVolume(0);
        };

        this.buttonSoundOff.callback = function() {
            self.buttonSoundOn.visible  = true;
            self.buttonSoundOff.visible = false;
            PP.sounds.setVolume(1);
        };

        //this.debug = new PIXI.Graphics();
        //this.container.addChild(this.debug);
    },
    ready: function() {
        this.buttonPlay.callback = function() {
            this.callback = null;
            PP.states.start("age-check", game.stateTransitionFunction);
        };
    },
    update: function(ratio, elapsed) {
        //this.debug.clear();
        //this.debug.beginFill(0xFF0044);
        //this.debug.drawRect(game.bounds.left - 16, game.bounds.bottom - 16, 32, 32);
        //this.debug.endFill();
        this.buttonPlay.updateTween();
        this.buttonSoundOn.updateTween();
        this.buttonSoundOff.updateTween();
        this.buttonSoundOn.position.x  = game.bounds.left + this.buttonSoundOn.texture.width / 1;
        this.buttonSoundOff.position.x = this.buttonSoundOn.position.x;
        this.buttonSoundOn.position.y  = game.bounds.bottom - this.buttonSoundOn.texture.height / 1.25;
        this.buttonSoundOff.position.y = this.buttonSoundOn.position.y;
    },
    end: function() {
        this.container.destroy({children: true});
    }
};

game.stateAgeCheck = {
    init: function() {
        var self = this;
        this.nextState = null;
        this.container = new PIXI.Container();

        this.spriteAreYouLegal = new PIXI.Sprite(PIXI.Texture.from(game.resources["are-u-legal"].img));
        this.spriteAreYouLegal.position.x = game.opts.width / 2;
        this.spriteAreYouLegal.position.y = 300;
        this.spriteAreYouLegal.anchor.set(0.5, 1);

        this.spriteYes = new PIXI.Sprite(PIXI.Texture.from(game.resources["yes"].img));
        this.spriteYes.position.x = game.opts.width / 2;
        this.spriteYes.position.y = this.spriteAreYouLegal.y + 150;
        this.spriteYes.anchor.set(0.5, 1);

        this.spriteNo = new PIXI.Sprite(PIXI.Texture.from(game.resources["no"].img));
        this.spriteNo.position.x = game.opts.width / 2 + 16;
        this.spriteNo.position.y = this.spriteYes.y + 150;
        this.spriteNo.anchor.set(0.5, 1);

        this.spriteTick = new PIXI.Sprite(PIXI.Texture.from(game.resources["tick"].img));
        this.spriteTick.anchor.set(0.5);
        this.spriteTick.visible = false;

        this.container.addChild(this.spriteAreYouLegal);
        this.container.addChild(this.spriteYes);
        this.container.addChild(this.spriteNo);
        this.container.addChild(this.spriteTick);
        game.app.scene.addChild(this.container);

        this.spriteYes.on("pointerdown", function() {
            self.spriteTick.visible = true;
            self.spriteTick.position.x = self.spriteYes.position.x + 115;
            self.spriteTick.position.y = self.spriteYes.position.y - 58;

            self.spriteYes.interactive = false;
            self.spriteNo.interactive = false;

            window.setTimeout(function() {
                self.nextState = "tutorial";
            }, 250);
        });

        this.spriteNo.on("pointerdown", function() {
            self.spriteTick.visible = true;
            self.spriteTick.position.x = self.spriteNo.position.x + 100;
            self.spriteTick.position.y = self.spriteNo.position.y - 58;

            self.spriteYes.interactive = false;
            self.spriteNo.interactive = false;

            window.setTimeout(function() {
                self.nextState = "not-legal";
            }, 250);
        });

        this.spriteYes.interactive = true;
        this.spriteNo.interactive = true;
    },
    ready: function() {
        this.transitionDone = true;
    },
    update: function(ratio, elapsed) {
        if(this.nextState != null && this.transitionDone) {
            PP.states.start(this.nextState, game.stateTransitionFunction);
            this.nextState = null;
        }
    },
    end: function() {
        this.container.destroy({children: true});
    }
};

game.stateTutorial = {
    init: function() {
        this.container = new PIXI.Container();

        this.spriteTitle = new PIXI.Sprite(PIXI.Texture.from(game.resources["tutorial-title"].img));
        this.spriteTitle.position.x = game.opts.width / 2;
        this.spriteTitle.position.y = 220;
        this.spriteTitle.anchor.set(0.5, 1);

        this.spriteTutorial = new PIXI.Sprite(PIXI.Texture.from(game.resources["tutorial"].img));
        this.spriteTutorial.position.x = game.opts.width / 2;
        this.spriteTutorial.position.y = this.spriteTitle.y + 40;
        this.spriteTutorial.anchor.set(0.5, 0);
        this.spriteTutorial.scale.set(0.75);

        this.buttonPlay = new PixiButton(PIXI.Texture.from(game.resources["button-play"].img));
        this.buttonPlay.position.x = game.opts.width / 2;
        this.buttonPlay.position.y = this.spriteTutorial.y + 250;

        this.container.addChild(this.spriteTitle);
        this.container.addChild(this.spriteTutorial);
        this.container.addChild(this.buttonPlay);
        game.app.scene.addChild(this.container);
    },
    ready: function() {
        this.buttonPlay.callback = function() {
            this.callback = null;
            PP.states.start("game", game.stateTransitionFunction);
        };
    },
    update: function(ratio, elapsed) {
        this.buttonPlay.updateTween();
    },
    end: function() {
        this.container.destroy({children: true});
    }
};

game.stateNotLegal = {
    init: function() {
        this.container = new PIXI.Container();

        this.spriteSorry = new PIXI.Sprite(PIXI.Texture.from(game.resources["sorry"].img));
        this.spriteSorry.position.x = game.opts.width / 2;
        this.spriteSorry.position.y = game.opts.height / 2;
        this.spriteSorry.anchor.set(0.5);

        this.container.addChild(this.spriteSorry);
        game.app.scene.addChild(this.container);

        var logoDiv = document.getElementById("logo");
        logoDiv.style.display = "none";

        PP.sounds.stop("theme");
    },
    end: function() {
        this.container.destroy({children: true});
    }
};

game.stateGame = {
    init: function() {
        this.container = new PIXI.Container();

        this.baseSpeed = 12.5;
        this.speed = null;
        this.point = {x:null, y:null};
        this.currentAngle = null;
        this.angle = null;
        this.distance = null;
        this.intervals = [];
        this.seconds = 30;

        this.spritePack = new PIXI.Sprite(PIXI.Texture.from(game.resources["pack"].img));
        this.spritePack.anchor.set(0.5);
        this.spritePack.scale.set(1.05);
        this.spritePack.tweenBase = 0;

        this.spriteCaps = new PIXI.Sprite(PIXI.Texture.from(game.resources["caps"].img));
        this.spriteCaps.anchor.set(0.5);
        this.spriteCaps.scale.set(0.2);
        this.spriteCaps.interactive = true;
        this.spriteCaps.tweenBase = 0;

        this.spriteTwinkle = new PIXI.Sprite(PIXI.Texture.from(game.resources["twinkle"].img));
        this.spriteTwinkle.anchor.set(0.5);
        this.spriteTwinkle.alpha = 0.5;

        this.spriteCaps.on("pointerdown", function(e) {
            if(this.dragging || this.anchoredByUser || !this.released) return;
            this.dragging = true;
        });

        this.spriteCaps.on("pointerup", function(e) {
            this.dragging = false;
        });

        this.spriteCaps.on("pointerout", function(e) {
            this.dragging = false;
        });

        this.spriteCaps.on("pointermove", function(e) {
            if(!this.dragging || this.anchoredByUser) return;
            var point = e.data.getLocalPosition(game.app.scene);
            this.position.set(point.x, point.y);

            var distance = game.stateGame.findDistance(game.stateGame.originalPoint, this.position);
            if(distance < 16) {
                this.dragging = false;
                this.anchoredByUser = true;
                this.position.set(game.stateGame.originalPoint.x, game.stateGame.originalPoint.y);
            }
        });

        this.trail = {
            points: [],
            length: 25,
            strip: null,
            counter: 0,
            timer: 0,
            history: [],
            update: function(state, ratio, elapsed) {
                state.trail.counter += ratio * 0.005;
                state.trail.timer   += elapsed;

                state.trail.history[0].x = state.trail.points[0].x;
                state.trail.history[0].y = state.trail.points[0].y;
                state.trail.points[0].x = state.spriteCaps.position.x;
                state.trail.points[0].y = state.spriteCaps.position.y;

                for(var i = 1; i < state.trail.length; i++) {
                    var angle = Math.random() * (Math.PI / 2);
                    var noise = 2 + Math.sin(state.trail.counter) * Math.random() * 3;

                    state.trail.history[i].x = state.trail.points[i].x + Math.cos(angle) * noise;
                    state.trail.history[i].y = state.trail.points[i].y + Math.sin(angle) * noise;

                    state.trail.points[i].x = state.trail.history[i - 1].x;
                    state.trail.points[i].y = state.trail.history[i - 1].y;
                }
            }
        };
        for(var i = 0; i < this.trail.length; i++) {
            this.trail.points.push(new PIXI.Point(0, 0));
            this.trail.history.push(new PIXI.Point(0, 0));
        }
        this.trail.strip = new PIXI.SimpleRope(PIXI.Texture.from(game.resources["trail"].img), this.trail.points);
        this.trail.strip.position.x = 0;
        this.trail.strip.position.y = 0;
        this.trail.strip.alpha = 0.2;

        this.container.addChild(this.spritePack);
        this.container.addChild(this.spriteTwinkle);
        this.container.addChild(this.trail.strip);
        this.container.addChild(this.spriteCaps);
        game.app.scene.addChild(this.container);

        this.randomizeSpeed = function() {
            return this.baseSpeed + Math.random();
        }

        this.refreshPoint = function(point) {
            point.x = game.bounds.left + Math.random() * (game.bounds.right);
            point.y = game.bounds.top  + Math.random() * (game.bounds.bottom);
        };

        this.findAngle = function(p1, p2) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x);
        };

        this.findDistance = function(p1, p2) {
            var xx = p2.x - p1.x;
            var yy = p2.y - p1.y;
            return Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
        };

        this.calculateMovement = function(speed, angle) {
            var movement = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            return movement;
        }

        this.speed = 0;
        this.distance = 0;
        this.currentAngle = 0;
        this.angle = 0;

        this.intervals.push(window.setInterval(function() {
            if(PP.states.paused || game.stateGame.seconds <= 0 || !game.stateGame.spriteCaps.released || game.stateGame.spriteCaps.anchoredByUser) return;
            game.stateGame.baseSpeed -= 0.25;
            game.stateGame.seconds -= 1;
            timer.update(game.stateGame.seconds);

            if(game.stateGame.seconds <= 0) {
                game.stateGame.fail();
            }
        }, 1000));

        this.timerDiv = document.getElementById("timer");
        this.timerDiv.style.display = "inline";
        this.timerDiv.style.opacity = 0;
        timer.update(this.seconds);

        PP.sounds.stop("theme");
        PP.sounds.play("gameplay", true);
    },
    ready: function() {
    },
    success: function() {
        PP.states.start("congratz", game.stateTransitionFunction);
        this.timerDiv.style.display = "none";
    },
    fail: function() {
        PP.states.start("game-over", game.stateTransitionFunction);
        this.timerDiv.style.display = "none";
    },
    update: function(ratio, elapsed) {
        if(this.container.y < 0) {
            this.container.x = -this.container.y;
            this.container.y = 0;
        }
        if(this.container.alpha < 1) this.timerDiv.style.opacity = this.container.alpha;

        this.trail.update(this, ratio, elapsed);

        this.spritePack.position.x = game.bounds.right  - this.spritePack.width * 1.4;
        this.spritePack.position.y = game.bounds.bottom - this.spritePack.height / 1.75;
        this.originalPoint = {x:this.spritePack.position.x + 12, y:this.spritePack.position.y - 44};
        this.spriteTwinkle.position.x = this.originalPoint.x;
        this.spriteTwinkle.position.y = this.originalPoint.y;

        if(!this.spriteCaps.released) {
            this.spriteCaps.position.x = this.originalPoint.x;
            this.spriteCaps.position.y = this.originalPoint.y;

            for(var i = 0; i < this.trail.length; i++) {
                this.trail.points[i].x = this.spriteCaps.position.x;
                this.trail.points[i].y = this.spriteCaps.position.y;
                this.trail.history[i].x = this.spriteCaps.position.x;
                this.trail.history[i].y = this.spriteCaps.position.y;
            }

            if(this.spriteCaps.scale.x >= 0.8) this.spriteCaps.released = true;
        }

        this.spriteCaps.tweenBase += 0.2 * ratio;
        this.spriteCaps.scaleTween = Math.sin(this.spriteCaps.tweenBase);
        this.spriteTwinkle.scale.set(1 + this.spriteCaps.scaleTween * 1);

        this.spritePack.tweenBase += 0.04 * ratio;
        this.spritePack.skewTween = Math.sin(this.spritePack.tweenBase);

        this.spritePack.skew.x = this.spritePack.skewTween * 0.004;

        if(this.spriteCaps.anchoredByUser) {
            this.spriteCaps.position.x = this.originalPoint.x;
            this.spriteCaps.position.y = this.originalPoint.y;
            this.spriteCaps.scale.set(PP.lerp(this.spriteCaps.scale.x, 0.22, 0.017 * ratio));
            this.spriteCaps.rotation = PP.lerp(this.spriteCaps.rotation, Math.PI * 8, 0.04 * ratio);
            this.spriteCaps.skew.x = this.spritePack.skew.x;
            this.trail.strip.alpha = PP.approach(this.trail.strip.alpha, 0, 0.01 * ratio);

            if(this.spriteCaps.scale.x <= 0.23) {
                this.success();
            }

            return;
        };

        this.spriteCaps.scale.set(
            Math.round(PP.lerp(this.spriteCaps.scale.x, 0.8 + (0.8 * this.spriteCaps.scaleTween), 0.015 * ratio) * 100) / 100
        );

        if(this.spriteCaps.dragging || !this.spriteCaps.released) return;

        this.currentAngle = PP.lerp(this.currentAngle, this.angle, (0.15) * ratio);
        var movement = this.calculateMovement(this.speed * ratio, this.currentAngle);

        this.spriteCaps.position.set(
            this.spriteCaps.position.x + movement.x,
            this.spriteCaps.position.y + movement.y
        );

        this.distance -= this.speed * ratio;
        if(this.distance <= 0) {
            this.refreshPoint(this.point);
            this.angle = this.findAngle(this.spriteCaps.position, this.point);
            this.distance = this.findDistance(this.point, this.spriteCaps.position);
            this.speed = this.randomizeSpeed();
        }
    },
    end: function() {
        this.container.destroy({children: true});
        this.intervals.forEach(function(interval) {
            window.clearInterval(interval);
        });
    }
};

game.stateGameOver = {
    init: function() {
        this.container = new PIXI.Container();

        this.sprite = new PIXI.Sprite(PIXI.Texture.from(game.resources["game-over"].img));
        this.sprite.position.x = game.opts.width / 2;
        this.sprite.position.y = 70;
        this.sprite.anchor.set(0.5, 0);

        this.buttonPlayAgain = new PixiButton(PIXI.Texture.from(game.resources["button-play-again"].img));
        this.buttonPlayAgain.position.x = game.opts.width / 2;
        this.buttonPlayAgain.position.y = this.sprite.y + this.sprite.height + 220;

        this.container.addChild(this.sprite);
        this.container.addChild(this.buttonPlayAgain);
        game.app.scene.addChild(this.container);

        PP.sounds.stop("gameplay");
        PP.sounds.play("theme", true);
    },
    ready: function() {
        this.buttonPlayAgain.callback = function() {
            this.callback = null;
            PP.states.start("game", game.stateTransitionFunction);
        };
    },
    update: function(ratio, elapsed) {
        this.buttonPlayAgain.updateTween();
    },
    end: function() {
        this.container.destroy({children: true});
    }
};

game.stateCongratz = {
    init: function() {
        this.container = new PIXI.Container();

        this.sprite = new PIXI.Sprite(PIXI.Texture.from(game.resources["congratz"].img));
        this.sprite.position.x = game.opts.width / 2;
        this.sprite.position.y = 100;
        this.sprite.anchor.set(0.5, 0);

        this.spriteBackground = new PIXI.Sprite(PIXI.Texture.from(game.resources["code-background"].img));
        this.spriteBackground.position.x = game.opts.width / 2;
        this.spriteBackground.position.y = this.sprite.position.y + this.sprite.height + 75;
        this.spriteBackground.anchor.set(0.5, 0);

        this.container.addChild(this.sprite);
        this.container.addChild(this.spriteBackground);
        game.app.scene.addChild(this.container);

        PP.sounds.stop("gameplay");
        PP.sounds.play("theme", true);
    },
    ready: function() {
    },
    update: function(ratio, elapsed) {
    },
    end: function() {
        this.container.destroy({children: true});
    }
};

var timer = {};
var createTimer = function() {
    timer.spritesheet  = new PP.Spritesheet(game.resources["sprite-font"].img, game.resources["sprite-font-json"].text);
    timer.background   = new PP.Drawable(game.resources["timer-background"].img);
    timer.drawingSpace = new PP.DrawingSpace({width: 122, height: 76}, {alpha: false});

    timer.drawingSpace.addDrawable(timer.background);
    timer.background.origin.x = 0;
    timer.background.origin.y = 0;

    timer.head = [];
    timer.head.push(timer.spritesheet.getFrameAsDrawable("0.png"));
    timer.head.push(timer.spritesheet.getFrameAsDrawable("0.png"));
    timer.head.push(timer.spritesheet.getFrameAsDrawable("__colon__.png"));
    var offset = 0;
    for(var i = 0; i < 3; i++) {
        timer.head[i].position.x = 24 + offset;
        timer.head[i].position.y = timer.drawingSpace.options.height / 2;
        timer.drawingSpace.addDrawable(timer.head[i]);
        offset += 20;
        if(i == 1) offset -= 3;
    }

    timer.body = [[], []];
    for(i = 0; i <= 3; i++) {
        timer.body[0].push(timer.spritesheet.getFrameAsDrawable(i + ".png"));
        timer.body[0][i].position.x = 22 + offset;
        timer.body[0][i].position.y = timer.drawingSpace.options.height / 2;
    }
    for(i = 0; i <= 9; i++) {
        timer.body[1].push(timer.spritesheet.getFrameAsDrawable(i + ".png"));
        timer.body[1][i].position.x = 22 + offset + 20;
        timer.body[1][i].position.y = timer.drawingSpace.options.height / 2;
    }
    timer.bodyCurrent = [timer.body[0][2], timer.body[1][0]];
    timer.drawingSpace.addDrawable(timer.body[0][2], timer.body[1][0]);


    var timerDiv = document.getElementById("timer");
    timerDiv.appendChild(timer.drawingSpace.canvas);

    timer.onresize = function(parentWidth, parentHeight) {
        var originalRatio = timer.drawingSpace.options.width / game.opts.width;
        var currentRatio  = timer.drawingSpace.options.width / parentWidth;
        var scale = originalRatio / currentRatio;
        timerDiv.style.transform = "scale(" + scale + ")";
        timerDiv.style.right = (25 + (timer.drawingSpace.options.width * scale)) + "px";
    };

    timer.update = function(seconds) {
        var base   = Math.floor(seconds / 10);
        var single = seconds % 10;
        timer.drawingSpace.removeDrawable(timer.bodyCurrent[0], timer.bodyCurrent[1]);
        timer.drawingSpace.addDrawable(timer.body[0][base], timer.body[1][single]);
        timer.drawingSpace.redraw();
    };

    timer.update(30);
    timer.onresize(window.innerWidth, window.innerHeight);
};

PP.states.add("menu", game.stateMenu);
PP.states.add("age-check", game.stateAgeCheck);
PP.states.add("tutorial", game.stateTutorial);
PP.states.add("not-legal", game.stateNotLegal);
PP.states.add("game", game.stateGame);
PP.states.add("game-over", game.stateGameOver);
PP.states.add("congratz", game.stateCongratz);

game.loader = new PP.Loader();
game.loader
    .add("background", "files/background.png", "img")
    .add("logo", "files/logo.png", "img")
    .add("title", "files/title.png", "img")
    .add("trail", "files/trail.png", "img")
    .add("tutorial", "files/tutorial.png", "img")
    .add("tutorial-title", "files/tutorial-title.png", "img")
    .add("sorry", "files/sorry.png", "img")
    .add("yes", "files/yes.png", "img")
    .add("no", "files/no.png", "img")
    .add("tick", "files/tick.png", "img")
    .add("are-u-legal", "files/are-u-legal.png", "img")
    .add("button-play", "files/button-play.png", "img")
    .add("button-sound-on", "files/button-sound-on.png", "img")
    .add("button-sound-off", "files/button-sound-off.png", "img")
    .add("sprite-font", "files/sprite-font.png", "img")
    .add("sprite-font-json", "files/sprite-font.json")
    .add("pack", "files/pack.png", "img")
    .add("caps", "files/caps.png", "img")
    .add("twinkle", "files/twinkle.png", "img")
    .add("congratz", "files/congratz.png", "img")
    .add("code-background", "files/code-background.png", "img")
    .add("timer-background", "files/timer-background.png", "img")
    .add("game-over", "files/game-over.png", "img")
    .add("button-play-again", "files/button-play-again.png", "img")
;
game.loader.load(function(progress, resource) {
    progress = Math.round(progress * 100);
    var preloaderSpan = document.getElementById("preloader-text");
    preloaderSpan.innerHTML = progress + "%";
}, function(resources) {
    var preloaderSpan = document.getElementById("preloader-text");
    preloaderSpan.innerHTML = "Click to continue";

    document.body.onclick = function() {
        document.body.onclick = null;
        document.getElementById("preloader").style.display = "none";

        game.soundLoader = new PP.Loader();
        game.soundLoader
            .add("gameplay", "files/gameplay.mp3", "audio")
            .add("theme", "files/theme.mp3", "audio")
        ;
        game.soundLoader.load();
        PP.sounds.add("gameplay", game.soundLoader.resources["gameplay"].audio);
        PP.sounds.add("theme", game.soundLoader.resources["theme"].audio);
        PP.sounds.play("theme", true);
    };

    game.resources = resources;
    createTimer();

    game.background = {
        sprite: null,
        spriteLogo: null
    };
    game.background.sprite = new PIXI.Sprite(PIXI.Texture.from(resources["background"].img));
    game.background.spriteLogo = new PIXI.Sprite(PIXI.Texture.from(resources["logo"].img));
    game.app.stage.addChild(game.background.sprite);
    game.app.scene = new PIXI.Container();
    game.app.stage.addChild(game.app.scene);
    game.app.scene.addChild(game.background.spriteLogo);
    document.getElementById("game_container").appendChild(game.app.view);
    game.onresize(0,0);
    PP.states.start("menu");
});

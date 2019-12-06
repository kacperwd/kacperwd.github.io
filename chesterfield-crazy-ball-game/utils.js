var PP = {};

PP.runOnWindow = function(callback, fps, useAsThis) {
    if(typeof fps != "number") fps = 60;

    var windowUpdateFunction = window.requestAnimationFrame || window.setTimeout;
    var baseDuration = 1000 / fps;
    var then = Date.now();

    var update = function() {
        var now     = Date.now();
        var elapsed = now - then;
        var ratio   = Math.round((elapsed / baseDuration) * 1000) / 1000;
        if(ratio > 3) ratio = 1;
        then        = now;
        if(callback.call(useAsThis, ratio, elapsed) !== false)
            windowUpdateFunction(update); // Return false from callback to break.
    };
    windowUpdateFunction.call(window, update);
}; // Run a loop on the window object using window.setTimeout or window.requestAnimationFrame (depending which is available).

PP.createDynamicFunction = function(callback) {
    return function(array) {
        if(!array.length) array = Array.prototype.slice.call(arguments);
        for(var i = 0, l = array.length; i < l; i++) {
            callback(this, array[i]);
        }
    }
}; // Create a function that accepts an array or a comma-separated list of arguments.

PP.approach = function(a, b, n) {
    if(a > b) {
        a -= n;
        if(a < b) a = b;
    }
    else if(a < b) {
        a += n;
        if(a > b) a = b;
    }
    return a;
}; // Approach a certain value without overshooting.

PP.lerp = function(a, b, n) {
    return (1 - n) * a + n * b;
}; // Linear interpolation.

PP.tween = function(callback, func, n) {
    var a = 0;
    PP.runOnWindow(function(ratio) {
        a = Math.ceil(func(a, 1, n * ratio) * 1000) / 1000;
        var done = a >= 1;
        callback(a, done);
        return !done;
    });
}; // Tweening helper. Animate by n using given func (PP.lerp, PP.approach, etc.), and call the callback every update.

PP.getCookie = function(key) {
    var all = document.cookie.split("\;");
    for(var i = 0, l = all.length; i < l; i++) {
        var parts = all[i].trim().split("=");
        if(parts[0] !== key) continue;
        return parts[1];
    }
    return null;
};

PP.setCookie = function(key, value) {
    document.cookie = key + "=" + value;
};

/** DRAWINGSPACE
 * A tiny wrapper around the built-in canvas element.
 */
PP.DrawingSpace = function(options, contextAttributes) {
    this.canvas  = document.createElement("canvas");
    this.context = null;
    this.options = options;
    this.clearMethod = "clearRect";
    this._drawables  = [];

    if(!this.canvas.getContext) throw  "Could not get the 2d context of the created canvas.";
    this.context = this.canvas.getContext("2d", contextAttributes);

    this.canvas.style.position = "absolute";
    if(!isNaN(options.x)) this.canvas.style.left  = options.x + "px";
    if(!isNaN(options.y))  this.canvas.style.top  = options.y + "px";
    if(!isNaN(options.width))  this.canvas.width  = options.width;
    if(!isNaN(options.height)) this.canvas.height = options.height;
    if(contextAttributes && contextAttributes.alpha === false) this.clearMethod = "fillRect";
};

PP.DrawingSpace.prototype.addDrawable = PP.createDynamicFunction(function(that, drawable) {
    that._drawables.push(drawable);
});

PP.DrawingSpace.prototype.removeDrawable = PP.createDynamicFunction(function(that, drawable) {
    that._drawables.splice(that._drawables.indexOf(drawable), 1);
});

PP.DrawingSpace.prototype.redraw = function() {
    this.context[this.clearMethod](0, 0, this.canvas.width, this.canvas.height);
    for(var i = 0, l = this._drawables.length; i < l; i++) {
        this._drawables[i].draw(this.context, this._drawables[i]);
    };
    // The drawable.draw function shouldn't reset the transform matrix to avoid useless calls.
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.globalAlpha = 1;
};

/** LOADER
 * Preloading resources.
 */
PP.Loader = function() {
    this.resources = {};
    this.callbacks = {
        onProgress: null,
        onComplete: null
    };
};
PP.loader = new PP.Loader();

PP.Loader.prototype.add = function(key, src, tagName) {
    var resource = {
        src: src,
        loaded: false,
        tagName: typeof tagName == "string" ? tagName : null
    };
    this.resources[key] = resource;
    return this;
};

PP.Loader.prototype.load = function(onProgress, onComplete) {
    if(typeof onProgress == "function") this.callbacks.onProgress = onProgress;
    if(typeof onComplete == "function") this.callbacks.onComplete = onComplete;

    Object.keys(this.resources).forEach(function(key) {
        var resource = this.resources[key];
        if(PP.Loader._load[resource.tagName]) PP.Loader._load[resource.tagName](this, resource);
        else PP.Loader._load.fallback(this, resource);
    }, this);
};

PP.Loader._load = {
    img: function(loader, resource) {
        resource.img = document.createElement("img");
        resource.img.addEventListener("load", function() {
            loader._onResourceLoaded(resource);
        });
        resource.img.src = resource.src;
    },
    audio: function(loader, resource) {
        resource.audio = document.createElement("audio");
        resource.audio.addEventListener("canplaythrough", function() {
            loader._onResourceLoaded(resource);
        });
        resource.audio.preload = "auto";
        resource.audio.src = resource.src;
    },
    fallback: function(loader, resource) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState != 4 || this.status != 200) return;
            resource.text = this.responseText;
            loader._onResourceLoaded(resource);
        };
        xhr.open("GET", resource.src, true);
        xhr.send();
    }
};

PP.Loader.prototype._onResourceLoaded = function(resource) {
    var keys = Object.keys(this.resources);
    var loaded   = 0;
    var progress = 0;
    resource.loaded = true;

    keys.forEach(function(key) {
        if(this.resources[key].loaded) loaded++;
    }, this);

    progress = loaded / keys.length;
    if(typeof this.callbacks.onProgress == "function") this.callbacks.onProgress(progress, resource);
    if(progress >= 1 && typeof this.callbacks.onComplete == "function") {
        this.callbacks.onComplete(this.resources);
        this.callbacks.onComplete = null;
        this.callbacks.onProgress = null;
    }
};

/** Drawable
 * Displaying whatever context.drawImage can draw.
 */
PP.Drawable = function(source, scissor) {
    this.source   = source;
    this.position = {x: 0, y: 0};
    this.scale    = {x: 1, y: 1};
    this.skew     = {x: 0, y: 0};
    this.scissor  = scissor || {x: 0, y: 0, width: this.source.width, height: this.source.height};
    this.origin   = {x: this.scissor.width / 2, y: this.scissor.height / 2};
    this.alpha    = 1;
    this.angle    = 0;
};

PP.Drawable.prototype.draw = function(context, properties) {
    context.globalAlpha = properties.alpha;
    context.setTransform(properties.scale.x, properties.skew.x, properties.skew.y, properties.scale.y, properties.position.x, properties.position.y);
    if(properties.angle != 0) context.rotate(properties.angle);
    context.drawImage(
        this.source, this.scissor.x, this.scissor.y, this.scissor.width, this.scissor.height,
        -this.origin.x, -this.origin.y, this.scissor.width, this.scissor.height
    );
};

/** SPRITESHEET
 * Reading JSON spritesheets.
 */
PP.Spritesheet = function(img, data) {
    this.img = img;
    this.description = JSON.parse(data);
};

PP.Spritesheet.prototype.getFrameData = function(key) {
    var rawFrameData = this.description.frames[key].frame;
    var friendlyFrameData = {
        x: rawFrameData.x, y: rawFrameData.y,
        width: rawFrameData.w || rawFrameData.width, height: rawFrameData.h || rawFrameData.height
    };
    return friendlyFrameData;
};

PP.Spritesheet.prototype.getFrameAsDrawable = function(key) {
    return new PP.Drawable(this.img, this.getFrameData(key));
};

/**
 * STATE MANAGER
 */
PP.States = function() {
    this._states = {};
    this._currentState  = null;
    this._previousState = null;
    this.paused = true;

    PP.runOnWindow(function(ratio, elapsed) {
        if(this.paused) return true;
        this._currentState.update.call(this._currentState, ratio, elapsed);
    }, 60, this);
};
PP.states = new PP.States();

PP.States.prototype.canUnpause = function() {
    return this._currentState != null && this.paused;
};

PP.States.prototype.add = function(key, object) {
    this._states[key] = object;
    ["init", "ready", "update", "end"].forEach(function(func) {
        if(typeof object[func] != "function") object[func] = function() {};
    });
};

PP.States.prototype.start = function(key, callback, speed) {
    if(typeof callback != "function") callback = false;
    if(typeof speed != "number") speed = 0.035;

    var   self   = this;
    this._previousState = this._currentState;
    this._currentState  = this._states[key];
    this._currentState.init.call(this._currentState);
    this.paused = false;

    if(!callback) {
        if(this._previousState) this._previousState.end.call(this._previousState);
        this._currentState.ready.call(this._currentState);
        return;
    }
    if(!this._previousState) return;

    var func = function(a, done) {
        callback(a, self._previousState, self._currentState);
        if(done) {
            self._previousState.end.call(self._previousState);
            self._currentState.ready.call(self._currentState);
        }
    };
    PP.tween(func, PP.lerp, speed);
    func(0, false);
}; // Switch the state with or without a smooth tween.


/**
 * SOUNDS
 */
PP.Sounds = function() {
    this._volume = 1;
    this._sounds = {};
};
PP.sounds = new PP.Sounds(); // Premade instance.

PP.Sounds.prototype.add = function(key, audio) {
    this._sounds[key] = audio;
};

PP.Sounds.prototype.play = function(key, loop) {
    this._sounds[key].loop = loop || false;
    this._sounds[key].play();
};

PP.Sounds.prototype.stop = function(key) {
    this._sounds[key].loop = false;
    this._sounds[key].pause();
    this._sounds[key].currentTime = 0;
};

PP.Sounds.prototype.playRandom = function(key, rangeStart, rangeEnd, loop) {
    this.play(key + rangeStart + Math.ceil(Math.random() * rangeEnd - rangeStart), loop);
};

PP.Sounds.prototype.setVolume = function(volume) {
    var oldVolume = this._volume;
    this._volume  = volume;
    Object.keys(this._sounds).forEach(function(key) {
        this._sounds[key].volume = volume;
        this._sounds[key].muted = volume == false;
    }, this);
    return oldVolume;
};

PP.Sounds.prototype.toggleVolume = function() {
    if(this._volume > 0) {
        this._toggleVolume = this._volume;
        this.setVolume(0);
    }
    else {
        this.setVolume(this._toggleVolume || 1);
    }
};

var PixiButton = function(tex) {
    PIXI.Sprite.call(this, tex);
    this.interactive = true;
    this.anchor.set(0.5);
    this.count = 0;
    this.scaleRatio = 1;
    this.baseScale = 1;
    this.addToScale = 0.1;
    this.delay = 100;

    this.on("pointerover", function(e) {
        this.pointeroverFired = true;
        this.baseScale = 1.05;
    });

    this.on("pointerout", function(e) {
        this.pointeroverFired = false;
        this.baseScale = 1;
    });

    this.on("pointerdown", function(e) {
        if(!this.visible) return;
        this.baseScale = 0.9;
        this.pointerdownFired = true;
    });

    this.on("pointerup", function(e) {
        if(this.pointeroverFired) this.baseScale = 1.05;
        else this.baseScale = 1;

        if(this.pointerdownFired) {
            this.pointerdownFired = false;
            var self = this;
            window.setTimeout(function() {
                if(typeof self.callback == "function") self.callback.call(self);
            }, this.delay);
        }
    });
};
PixiButton.prototype = Object.create(PIXI.Sprite.prototype);
PixiButton.prototype.constructor = PIXI.Sprite;

PixiButton.prototype.updateTween = function() {
    this.count += 0.05;
    this.scale.set(this.scaleRatio * (this.baseScale + (this.addToScale * ((Math.sin(this.count) + 1) / 2))));
};

/**
 * AUTO HELPERS
 */
window.addEventListener("DOMContentLoaded", function(e) {
    var cache = {
        innerWidth  : window.innerWidth,
        innerHeight : window.innerHeight,
        volume: PP.sounds._volume
    };

    window.addEventListener("touchmove", function(e) {
        e.preventDefault();
    }); // Prevent scrolling on Safari mobile and more.
    document.body.addEventListener("touchmove", function(e) {
        e.preventDefault();
    });

    window.setInterval(function() {
        var innerWidth = window.innerWidth;
        var innerHeight = window.innerHeight;

        if(cache.innerWidth == innerWidth && cache.innerHeight == innerHeight) return;
        cache.innerWidth  = innerWidth;
        cache.innerHeight = innerHeight;
        window.onresize();
    }, 500); // Some browsers don't fire the "resize" event correctly, e.g. on orientation change.

    window.onblur = function(e) {
        cache.volume    = PP.sounds.setVolume(0);
        PP.states.paused = true;

        cache.intervalId = window.setInterval(function() {
            if(document.hasFocus() && document.querySelector(":focus") != null) {
                window.onfocus();
            }
        }, 250); // A workaround in case "onfocus" is not fired correctly.
    };

    window.onfocus = function(e) {
        PP.sounds.setVolume(cache.volume);
        if(PP.states.canUnpause()) PP.states.paused = false;
        window.clearInterval(cache.intervalId);
    };
});

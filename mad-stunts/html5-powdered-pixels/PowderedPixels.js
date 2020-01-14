"use strict";

var PowderedPixels = {};
var PP = PowderedPixels;

PP.runOnWindow = function(callback, fps, useAsThis) {
    if(typeof fps != "number") fps = 60;

    var windowUpdateFunction = window.requestAnimationFrame || window.setTimeout;
    var baseDuration = 1000 / fps;
    var then = Date.now();

    var update = function() {
        var now     = Date.now();
        var elapsed = now - then;
        var ratio   = Math.round((elapsed / baseDuration) * 1000) / 1000;
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

PP.rotatePoint = function(point, center, cos, sin) {
    return {
        x: (cos * (point.x - center.x)) - (sin * (point.y - center.y)) + center.x,
        y: (cos * (point.y - center.y)) + (sin * (point.x - center.x)) + center.y
    };
}; // Rotate [point.x, point.y] around [center.x, center.y] for the given [cos, sin].

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
    this.clearBeforeRender = true;
    this._drawables  = [];

    if(!this.canvas.getContext) throw  "Could not get the 2d context of the created canvas.";
    this.context = this.canvas.getContext("2d", contextAttributes);

    this.canvas.style.position = "absolute";
    if(!isNaN(options.x)) this.canvas.style.left  = options.x + "px";
    if(!isNaN(options.y))  this.canvas.style.top  = options.y + "px";
    if(!isNaN(options.width))  this.canvas.width  = options.width;
    if(!isNaN(options.height)) this.canvas.height = options.height;
    if(options.clearBeforeRender === false) this.clearBeforeRender = false;
    if(contextAttributes && contextAttributes.alpha === false) this.clearMethod = "fillRect";
};

PP.DrawingSpace.prototype.addDrawable = PP.createDynamicFunction(function(that, drawable) {
    that._drawables.push(drawable);
});

PP.DrawingSpace.prototype.removeDrawable = PP.createDynamicFunction(function(that, drawable) {
    that._drawables.splice(that._drawables.indexOf(drawable), 1);
});

PP.DrawingSpace.prototype.redraw = function() {
    if(this.clearBeforeRender) this.context[this.clearMethod](0, 0, this.canvas.width, this.canvas.height);
    for(var i = 0, l = this._drawables.length; i < l; i++) {
        this._drawables[i].draw(this.context, this._drawables[i]);
    };
    // The drawable.draw function shouldn't reset the transform matrix to avoid useless calls.
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.globalAlpha = 1;
};


/** STAGE
 * A container used to group and organize drawing spaces (canvases) together.
 */
PP.Stage = function() {
    this.div    = document.createElement("div");
    this.width  = 0;
    this.height = 0;
    this.scale  = 1;
};
PP.stage = new PP.Stage(); // Premade instance, can be useful since apps will be usually based just on one stage.

PP.Stage.prototype.addDrawingSpace = function(options, contextAttributes) {
    var  space  = new PP.DrawingSpace(options, contextAttributes);
    this.width  = Math.max(this.width, (parseFloat(space.canvas.style.left) || 0) + space.canvas.width);
    this.height = Math.max(this.height, (parseFloat(space.canvas.style.top) || 0) + space.canvas.height);
    this.div.appendChild(space.canvas);
    return space;
};

PP.Stage.prototype.fit = function(width, height) {
    this.scale = Math.min(width / this.width, height / this.height);
    this.div.style.transformOrigin = "0 0";
    this.div.style.transform = "scale(" + this.scale + ")";
};

PP.Stage.prototype.center = function(width, height) {
    this.div.style.position = "absolute";
    this.div.style.left = (width - this.width * this.scale) / 2 + "px";
    this.div.style.top  = (height - this.height * this.scale) / 2 + "px";
};

PP.Stage.prototype.localizeGlobalPoint = function(globalPoint) {
    var point = {
        x: globalPoint.x,
        y: globalPoint.y
    };
    var invertedScale = 1 / this.scale;

    if(typeof this.div.getBoundingClientRect == "function") {
        var domRect = this.div.getBoundingClientRect();
        point.x -= domRect.left;
        point.y -= domRect.top;
    }

    point.x *= invertedScale;
    point.y *= invertedScale;

    return point;
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
    if(typeof this.callbacks.onProgress == "function") this.callbacks.onProgress(progress);
    if(progress >= 1 && typeof this.callbacks.onComplete == "function") this.callbacks.onComplete(this.resources); 
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


/** ANIMATION
 * An extension of PP.Drawable to display animations.
 */
PP.Animation = function(spritesheet) {
    PP.Drawable.call(this, spritesheet.img);
    this.spritesheet = spritesheet;
    this.animations  = {};
};
PP.Animation.prototype = Object.create(PP.Drawable.prototype);
PP.Animation.prototype.constructor = PP.Animation;

PP.Animation.prototype.add = function(key, frameKeys, msPerFrame) {
    this.animations[key] = {
        frames: [],
        msPerFrame: msPerFrame
    };
    frameKeys.forEach(function(frameKey) {
        this.animations[key].frames.push(this.spritesheet.getFrameData(frameKey));
    }, this);
};

PP.Animation.prototype.play = function(key, method, callback) {
    this.currentAnimation = this.animations[key];
    this.currentFrame = 0;
    this.lastFrame  = this.currentAnimation.frames.length - 1;
    this._method    = typeof method == "function" ? method : PP.Animation.oneshot;
    this._callback  = callback;
    this._timestamp = Date.now();
    this._updateFrame();
};

PP.Animation.prototype.stop = function() {
    this._method = function() {};
};

PP.Animation.prototype.draw = function(context, properties) {
    if(!this.currentAnimation) return;
    PP.Drawable.prototype.draw.call(this, context, properties);
    var now = Date.now();
    if(now - this._timestamp > this.currentAnimation.msPerFrame) {
        this._timestamp = now;
        this._method(this);
        this._updateFrame();
    }
};

PP.Animation.prototype._updateFrame = function() {
    this.scissor = this.currentAnimation.frames[this.currentFrame];
    this.origin  = {x: this.scissor.width / 2, y: this.scissor.height / 2}; 
};

PP.Animation.prototype._invokeCallback = function() {
    if(typeof this._callback == "function") this._callback(this);
};

PP.Animation.oneshot = function(animation) {
    animation.currentFrame = Math.min(++animation.currentFrame, animation.lastFrame);
    if(animation.currentFrame == animation.lastFrame) {
        animation.stop();
        animation._invokeCallback();
    }
};

PP.Animation.loop = function(animation) {
    ++animation.currentFrame;
    if(animation.currentFrame > animation.lastFrame) {
        animation.currentFrame = 0;
        animation._invokeCallback();
    };
};

PP.Animation.bounce = function(animation) {
    if(typeof animation._bounceMode == "undefined") animation._bounceMode = 1;
    animation.currentFrame += animation._bounceMode;
    if((animation.currentFrame == animation.lastFrame && animation._bounceMode) || (animation.currentFrame == 0 && animation._bounceMode < 0)) {
        animation._bounceMode *= -1;
        animation._invokeCallback();
    }
};


/** DRAWABLE CONTAINER
 * Group drawables together.
 * TODO: correctly calculate cached size of rotated drawables.
 */
PP.DrawableContainer = function() {
    this._drawables = [];
    this._dummy = {
        position: {x: null, y: null},
        scale:    {x: null, y: null},
        skew:     {x: null, y: null},
        alpha: 1,
        angle: 0
    };
    this.position = {x: 0, y: 0};
    this.scale    = {x: 1, y: 1};
    this.skew     = {x: 0, y: 0};
    this.alpha    = 1;
    this.angle    = 0; // this is the angle that children will inherit.
    this.rotation = 0; // this is the rotation of the children relative to the container position.
};

PP.DrawableContainer.prototype.addDrawable = PP.createDynamicFunction(function(that, drawable) {
    if(typeof drawable.visible != "boolean") drawable.visible = true;
    if(typeof drawable.zIndex  != "number")  drawable.zIndex  = 0;
    if(!that._drawables[drawable.zIndex]) that._drawables[drawable.zIndex] = [];
    that._drawables[drawable.zIndex].push(drawable);
});

PP.DrawableContainer.prototype.removeDrawable = PP.createDynamicFunction(function(that, drawable) {
    var zGroup = that._drawables[drawable.zIndex];
    zGroup.splice(zGroup.indexOf(drawable), 1);
});

PP.DrawableContainer.prototype.removeAll = function() {
    this._drawables.splice(0, this._drawables.length);
};

PP.DrawableContainer.prototype.callForAll = function(chainReaction, callback, atZ) {
    for(var z = atZ || 0, l1 = (atZ + 1) || this._drawables.length; z < l1; z++) {
        var zGroup = this._drawables[z];
        for(var i = 0, l2 = zGroup.length; i < l2; i++) {
            var drawable = zGroup[i];
            if(chainReaction && typeof drawable.callForAll == "function") drawable.callForAll(true, callback);
            else callback(drawable);
        }
    }
};

PP.DrawableContainer.prototype.cacheAsCanvas = function() {
    var canvasArray = [];
    var canvas  = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var min     = {x: 0, y: 0};
    var max     = {x: 0, y: 0};

    this.callForAll(true, function(drawable) {
        if(drawable instanceof PP.DrawableContainer) {
            canvasArray.push(drawable.cacheAsCanvas());
            return;
        }
        if(!drawable.origin) return;
        min.x = Math.min(min.x, drawable.position.x - drawable.origin.x * drawable.scale.x);
        min.y = Math.min(min.y, drawable.position.y - drawable.origin.y * drawable.scale.y);
        max.x = Math.max(max.x, drawable.position.x + drawable.origin.x * drawable.scale.x);
        max.y = Math.max(max.y, drawable.position.y + drawable.origin.y * drawable.scale.y);
    });

    canvas.width  = Math.abs(min.x) + Math.abs(max.x);
    canvas.height = Math.abs(min.y) + Math.abs(max.y);

    var cache = {
        position: {
            x: this.position.x,
            y: this.position.y
        }
    };

    this.position.x = Math.abs(min.x);
    this.position.y = Math.abs(min.y);
    this.draw(context, this);

    this.position.x = cache.position.x;
    this.position.y = cache.position.y
    this.scale.x  = 1;
    this.scale.y  = 1;
    this.skew.x   = 0;
    this.skew.y   = 0;
    this.rotation = 0;
    this.angle    = 0;

    this.removeAll();
    if(canvas.width > 0 && canvas.height > 0) this.addDrawable(new PP.Drawable(canvas));
    canvasArray.forEach(function(canvas) {
        this.addDrawable(canvas);
    }, this);

    return canvas;
};

PP.DrawableContainer.prototype.draw = function(context, properties) {
    var cache = {
        cos: Math.cos(this.rotation),
        sin: Math.sin(this.rotation)
    };

    for(var z = 0, l1 = this._drawables.length; z < l1; z++) {
        var zGroup = this._drawables[z];
        for(var d = 0, l2 = zGroup.length; d < l2; d++) {
            var drawable = zGroup[d];
            if(!drawable.visible) continue;
            this._dummy.position.x = properties.position.x + drawable.position.x;
            this._dummy.position.y = properties.position.y + drawable.position.y;
            this._dummy.scale.x    = properties.scale.x * drawable.scale.x;
            this._dummy.scale.y    = properties.scale.y * drawable.scale.y;
            this._dummy.skew.x     = properties.skew.x  + drawable.skew.x;
            this._dummy.skew.y     = properties.skew.y  + drawable.skew.y;
            this._dummy.angle      = properties.angle   + drawable.angle;
            this._dummy.alpha      = properties.alpha   * drawable.alpha;
            if(this.rotation != 0) this._dummy.position = PP.rotatePoint(this._dummy.position, properties.position, cache.cos, cache.sin);
            drawable.draw(context, this._dummy);

            if(z != drawable.zIndex) {
                if(typeof cache.reorderedDrawables == "undefined") cache.reorderedDrawables = [];
                drawable._zGroup = zGroup;
                cache.reorderedDrawables.push(drawable);
            }
        }
    }

    if(cache.reorderedDrawables) for(var i = 0, l = cache.reorderedDrawables.length; i < l; i++) {
        var drawable = cache.reorderedDrawables[i];
        if(!this._drawables[drawable.zIndex]) this._drawables[drawable.zIndex] = [];
        this._drawables[drawable.zIndex].push(drawable);
        drawable._zGroup.splice(drawable._zGroup.indexOf(drawable), 1);
        drawable._zGroup = null;
    }
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
    if(typeof speed != "number") speed = 0.032;

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
 * PP.Controls
 */
PP.Controls = function(receiver) {
    if(!receiver) receiver = document;

    this._listeners = {};
    this._receiver  = receiver;
};

PP.Controls.prototype.add = function(eventName, userListener, useAsThis) {
    if(typeof this._listeners[eventName] == "undefined") {
        this._listeners[eventName] = {
            userListeners    : [],
            internalListeners: []
        };
    }
    this._listeners[eventName].userListeners.push(userListener);

    var internalListener = function(e) {
        userListener.call(useAsThis, e);
    };
    this._listeners[eventName].internalListeners.push(internalListener);
    this._receiver.addEventListener(eventName, internalListener);
};

PP.Controls.prototype.clear = function() {
    Object.keys(this._listeners).forEach(function(eventName) {
        this._listeners[eventName].internalListeners.forEach(function(internalListener) {
            this._receiver.removeEventListener(eventName, internalListener);
        }, this);
    }, this);
};


/** PP.PointerControls
 * Unified mouse / touch controls based on PP.Controls.
 */
PP.PointerControls = function(stage) {
    PP.Controls.call(this);
    this.stage = stage || PP.stage;
};
PP.PointerControls.prototype = Object.create(PP.Controls.prototype);
PP.PointerControls.prototype.constructor = PP.PointerControls;

PP.PointerControls.prototype._createPointerAction = function(listener, useAsThis) {
    var self = this;
    return function(e) {
        var point = {
            x: e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
            y: e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
        };
        point = self.stage.localizeGlobalPoint(point);

        if(typeof listener == "function") listener.call(useAsThis, point.x, point.y);
    }
};

PP.PointerControls.prototype.onPointerDown = function(listener, useAsThis) {
    var onPointerDown = this._createPointerAction(listener, useAsThis);
    this.add("mousedown",  onPointerDown);
    this.add("touchstart", onPointerDown);
};

PP.PointerControls.prototype.onPointerUp = function(listener, useAsThis) {
    var onPointerUp = this._createPointerAction(listener, useAsThis);
    this.add("mouseup",  onPointerUp);
    this.add("touchend", onPointerUp);
};

PP.PointerControls.prototype.onPointerDrag = function(listenerStart, listenerUpdate, listenerEnd, useAsThis) {
    var drag = {
        start: {
            x: null,
            y: null
        },
        end: {
            x: null,
            y: null
        },
        active: false
    };

    var onPointerDrag = this._createPointerAction(function(x, y) {
        if(drag.active) listenerUpdate.call(useAsThis, x, y);
    });

    this.add("mousemove", onPointerDrag);
    this.add("touchmove", onPointerDrag);

    this.onPointerDown(function(x, y) {
        drag.start.x = x;
        drag.start.y = y;
        drag.active  = true;

        listenerStart.call(useAsThis, x, y);
    });

    this.onPointerUp(function(x, y) {
        drag.end.x  = x;
        drag.end.y  = y;
        drag.active = false;

        var dragX = Math.abs(drag.end.x - drag.start.x);
        var dragY = Math.abs(drag.end.y - drag.start.y);

        if(dragX == 0 && dragY == 0) return;
        listenerEnd.call(useAsThis, dragX, dragY);
    });
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

    window.onresize = function(e) {
        PP.stage.fit(window.innerWidth, window.innerHeight);
        PP.stage.center(window.innerWidth, window.innerHeight);
        window.scrollTo(0, 0);
    }; // Handle window resize.
    window.onresize();

    window.setInterval(function() {
        if(cache.innerWidth == window.innerWidth && cache.innerHeight == window.innerHeight) return;
        cache.innerWidth  = window.innerWidth;
        cache.innerHeight = window.innerHeight;
        if(typeof window.onresize == "function") window.onresize();
    }, 500); // Some browsers don't fire the "resize" event correctly, e.g. on orientation change.

    window.onblur = function(e) {
        cache.volume    = PP.sounds.setVolume(0);
        PP.stage.paused = true;

        cache.intervalId = window.setInterval(function() {
            if(document.hasFocus() && document.querySelector(":focus") != null) {
                window.onfocus();
            }
        }, 250); // A workaround in case "onfocus" is not fired correctly.
    }; // Handle blur for the premade objects.

    window.onfocus = function(e) {
        PP.sounds.setVolume(cache.volume);
        if(PP.states.canUnpause()) PP.states.paused = false;
        window.clearInterval(cache.intervalId);
    }; // Handle focus for the premade objects.
});

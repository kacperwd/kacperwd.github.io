function StateManager() {
    var self = this;
    this._states = {};
    this._currentKey = null;
    this._currentStateUpdateCallback = function() {};
    this._ticker = new PIXI.ticker.Ticker();
    this._ticker.start();
    this._ticker.add(function(delta) {
        self._update(delta);
    });
}

StateManager.prototype.add = function(key, object) {
    this._states[key] = object;
    if(typeof this._states[key].update != "function") {
        this._states[key].update = function() {};
    }
};

StateManager.prototype.switch = function(key) {
    if(typeof this._states[key] == "undefined") {
        return false;
    }
    if(this._currentKey != null && typeof this._states[this._currentKey].end == "function") {
        this._states[this._currentKey].end();
    }
    this._currentKey = key;
    this._currentStateUpdateCallback = this._states[key].update;
    if(typeof this._states[key].boot == "function") {
        this._states[key].boot();
    }
};

StateManager.prototype._update = function(delta) {
    this._currentStateUpdateCallback(delta, this._ticker.elapsedMS);
    particles.update(delta);
};

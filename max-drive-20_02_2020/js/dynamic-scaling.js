var screen = {
    scale: 1,
    ratio: 1
};

window.addEventListener("load", function() {
    onResize();
    window.addEventListener("resize", onResize);
});

var onResize = function() {
    var scale = window.innerHeight / app._options.height;
    var ratio = app._options.height / window.innerHeight;
    var width  = Math.round(app._options.width * scale);
    var height = window.innerHeight;
    app.renderer.resize(width, height);
    app.stage.scale.set(scale);
    screen.scale = scale;
    screen.ratio = ratio;
};

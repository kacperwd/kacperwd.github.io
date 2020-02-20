var assets          = null;
var loaderManifest  = {
};

var preload = function() {
    var assetsDirectory = "assets/";
    var loader = new PIXI.loaders.Loader();

    Object.keys(loaderManifest).forEach(function(key) {
        loader.add(
            key,
            assetsDirectory + loaderManifest[key]
        );
    });

    loader.load(function(loader, resources) {
        assets = resources;
    });
};

var menuState = {
    boot: function() {
        addMultiEventListener(["touchstart", "mousedown"], menuState.click);

        menuState.title = new PIXI.Sprite.from("assets/title.png");
        menuState.title.scale.set(0.6);
        menuState.title.anchor.set(0.5);
        menuState.title.x = app._options.width / 2;
        menuState.title.y = app._options.height / 4;
        app.stage.addChild(menuState.title);

        menuState.hand = createHandAnimation();
        menuState.hand.x = app._options.width / 1.3;
        menuState.hand.y = app._options.height / 1.25;
        app.stage.addChild(menuState.hand);

        track.lock();
        track.reset();
        track.scroll(50, Math.PI * 2);
        camera.x = app._options.width / 2;
        camera.y = app._options.height / 1.5;
        camera.pivot.x = camera.x;
        camera.pivot.y = camera.y;
        car.resetPosition({
            x: camera.x,
            y: camera.y
        });
        camera.rotation = 0;
        camera.x -= 50;
        car.reset();

        bitmapText.update("0");
        bitmapText.getSprite().visible = false;
    },
    update: function(delta, ms) {
        car.update(delta, ms);
        track.scrollAmountX = 0;
        track.scrollAmountY = 0;
        track.scroll(car.getSpeed(), Math.PI / 2);
    },
    end: function() {
        menuState.title.destroy();
        menuState.hand.destroy();
        removeMultiEventListener(["touchstart", "mousedown"], menuState.click);
        track.unlock();
    },
    click: function() {
        states.switch("gameplay");
    }
};

var gameOverState = {
    boot: function() {
        addMultiEventListener(["touchstart", "mousedown"], gameOverState.click);

        gameOverState.tryAgain = new PIXI.Sprite.from("assets/try-again.png");
        gameOverState.tryAgain.scale.set(0.6);
        gameOverState.tryAgain.anchor.set(0.5);
        gameOverState.tryAgain.x = app._options.width / 2;
        gameOverState.tryAgain.y = app._options.height / 3.25;
        app.stage.addChild(gameOverState.tryAgain);

        gameOverState.hand = createHandAnimation();
        gameOverState.hand.x = app._options.width / 1.5;
        gameOverState.hand.y = app._options.height / 1.25;
        app.stage.addChild(gameOverState.hand);
    },
    update: function(delta, ms) {
    },
    end: function() {
        removeMultiEventListener(["touchstart", "mousedown"], gameOverState.click);
        gameOverState.tryAgain.destroy();
        gameOverState.hand.destroy();
    },
    click: function() {
        states.switch("menu");
    }
};

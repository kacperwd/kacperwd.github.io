var game={plays:0,displayCode:!1};game.opts={width:1152,height:640,forceFXAA:!1,legacy:!0,transparent:!0,clearBeforeRender:!1,autoResize:!0,resolution:PIXI.utils.isMobile.any?2:1,antialias:!0},game.app=new PIXI.Application(game.opts),game.onresize=function(t,e){var i=Math.round(.1*e),s=e-i;game.background.graphicsBanner.x=0,game.background.graphicsBanner.y=s,game.background.graphicsBanner.clear(),game.background.graphicsBanner.beginFill(16777215),game.background.graphicsBanner.drawRect(0,0,t,i),game.background.graphicsBanner.endFill(),game.background.spriteBanner.scale.set(Math.min(t/game.background.spriteBanner.texture.width,i/game.background.spriteBanner.texture.height)),game.background.spriteBanner.x=(t-game.background.spriteBanner.width)/2,game.background.spriteBanner.y=s+(i-game.background.spriteBanner.height)/2,game.app.renderer.resize(t,e);var a=t/game.opts.width,n=s/game.opts.height,o=Math.round(1e3*Math.min(a,n))/1e3;game.app.scene.scale.set(o);var r=t-Math.round(game.opts.width*o);game.app.scene.x=r/2;var d=s-Math.round(game.opts.height*o);game.app.scene.y=d/2;var p={aspectRatio:{original:game.background.sprite.texture.width/game.background.sprite.texture.height,now:0,deviation:0},calculatedScale:{x:t/game.background.sprite.texture.width,y:e/game.background.sprite.texture.height},niceScale:{x:0,y:0}};p.aspectRatio.now=p.calculatedScale.x/p.calculatedScale.y,p.aspectRatio.deviation=Math.abs(1-p.aspectRatio.now/p.aspectRatio.original),p.niceScale.x=p.calculatedScale.x,p.niceScale.y=p.calculatedScale.y,p.aspectRatio.deviation>.3&&(p.aspectRatio.now<p.aspectRatio.original?p.niceScale.x=p.calculatedScale.x*(1+p.aspectRatio.deviation):p.niceScale.y=p.calculatedScale.y*(1+p.aspectRatio.deviation)),game.background.sprite.scale.x=p.niceScale.x,game.background.sprite.scale.y=p.niceScale.y,game.background.sprite.position.x=-(game.background.sprite.width-t),game.background.sprite.position.y=-(game.background.sprite.height-s),game.bounds={left:0-game.app.scene.x*(1/game.app.scene.scale.x),top:0-game.app.scene.y*(1/game.app.scene.scale.y),right:0,bottom:0},game.bounds.right=game.bounds.left+game.app.screen.width*(1/game.app.scene.scale.x),game.bounds.bottom=game.bounds.top+s*(1/game.app.scene.scale.y),game.background.spriteLogo.anchor.set(1,.5),PIXI.utils.isMobile.any?game.background.spriteLogo.scale.set(.75):game.background.spriteLogo.scale.set(.55),game.background.spriteLogo.position.x=game.bounds.right-55,game.background.spriteLogo.position.y=game.bounds.bottom-.15*game.bounds.bottom;var h=document.getElementById("video_anim_container");h.style.width=t.toString()+"px",h.style.height=e.toString()+"px"},game.stateTransitionFunction=function(t,e,i){e.container&&i.container&&(i.container.alpha=t,i.container.y=-8*(1-t),e.container.alpha=0)},game.stateMenu={init:function(){var t=this;this.container=new PIXI.Container,this.spriteTitle=new PIXI.Sprite(PIXI.Texture.from(game.resources.title.img)),this.spriteTitle.x=game.opts.width/2,this.spriteTitle.y=game.opts.height/2-100,this.spriteTitle.anchor.set(.5),this.spriteCaps=new PIXI.Sprite(PIXI.Texture.from(game.resources.caps.img)),this.spriteCaps.x=game.opts.width/2+230,this.spriteCaps.y=45,this.buttonPlay=new PixiButton(PIXI.Texture.from(game.resources["button-play"].img)),this.buttonPlay.position.x=game.opts.width/2,this.buttonPlay.position.y=game.opts.height/2+196,this.buttonSoundOn=new PixiButton(PIXI.Texture.from(game.resources["button-sound-on"].img)),this.buttonSoundOn.addToScale=0,this.buttonSoundOn.scaleRatio=.8,this.buttonSoundOff=new PixiButton(PIXI.Texture.from(game.resources["button-sound-off"].img)),this.buttonSoundOff.addToScale=0,this.buttonSoundOff.scaleRatio=this.buttonSoundOn.scaleRatio,this.buttonSoundOff.visible=!1,this.container.addChild(this.spriteTitle),this.container.addChild(this.spriteCaps),this.container.addChild(this.buttonPlay),this.container.addChild(this.buttonSoundOn),this.container.addChild(this.buttonSoundOff),game.app.scene.addChild(this.container),this.buttonSoundOn.callback=function(){t.buttonSoundOn.visible=!1,t.buttonSoundOff.visible=!0,PP.sounds.setVolume(0)},this.buttonSoundOff.callback=function(){t.buttonSoundOn.visible=!0,t.buttonSoundOff.visible=!1,PP.sounds.setVolume(1)}},ready:function(){this.buttonPlay.callback=function(){this.callback=null,PP.states.start("age-check",game.stateTransitionFunction)}},update:function(t,e){this.buttonPlay.updateTween(),this.buttonSoundOn.updateTween(),this.buttonSoundOff.updateTween(),this.buttonSoundOn.position.x=game.bounds.left+84,this.buttonSoundOff.position.x=this.buttonSoundOn.position.x,this.buttonSoundOn.position.y=game.bounds.bottom-.11*game.bounds.bottom,this.buttonSoundOff.position.y=this.buttonSoundOn.position.y},end:function(){this.container.destroy({children:!0})}},game.stateAgeCheck={init:function(){var t=this;this.nextState=null,this.container=new PIXI.Container,this.spriteAreYouLegal=new PIXI.Sprite(PIXI.Texture.from(game.resources["are-u-legal"].img)),this.spriteAreYouLegal.position.x=game.opts.width/2,this.spriteAreYouLegal.position.y=300,this.spriteAreYouLegal.anchor.set(.5,1),this.spriteYes=new PIXI.Sprite(PIXI.Texture.from(game.resources.yes.img)),this.spriteYes.position.x=game.opts.width/2,this.spriteYes.position.y=this.spriteAreYouLegal.y+150,this.spriteYes.anchor.set(.5,1),this.spriteNo=new PIXI.Sprite(PIXI.Texture.from(game.resources.no.img)),this.spriteNo.position.x=game.opts.width/2+16,this.spriteNo.position.y=this.spriteYes.y+150,this.spriteNo.anchor.set(.5,1),this.spriteTick=new PIXI.Sprite(PIXI.Texture.from(game.resources.tick.img)),this.spriteTick.anchor.set(.5),this.spriteTick.visible=!1,this.container.addChild(this.spriteAreYouLegal),this.container.addChild(this.spriteYes),this.container.addChild(this.spriteNo),this.container.addChild(this.spriteTick),game.app.scene.addChild(this.container),this.spriteYes.on("pointerdown",function(){t.spriteTick.visible=!0,t.spriteTick.position.x=t.spriteYes.position.x+115,t.spriteTick.position.y=t.spriteYes.position.y-58,t.spriteYes.interactive=!1,t.spriteNo.interactive=!1,window.setTimeout(function(){t.nextState="tutorial"},250)}),this.spriteNo.on("pointerdown",function(){t.spriteTick.visible=!0,t.spriteTick.position.x=t.spriteNo.position.x+100,t.spriteTick.position.y=t.spriteNo.position.y-58,t.spriteYes.interactive=!1,t.spriteNo.interactive=!1,window.setTimeout(function(){t.nextState="not-legal"},250)}),this.spriteYes.interactive=!0,this.spriteNo.interactive=!0},ready:function(){this.transitionDone=!0},update:function(t,e){null!=this.nextState&&this.transitionDone&&(PP.states.start(this.nextState,game.stateTransitionFunction),this.nextState=null)},end:function(){this.container.destroy({children:!0})}},game.stateTutorial={init:function(){this.container=new PIXI.Container,this.spriteTitle=new PIXI.Sprite(PIXI.Texture.from(game.resources["tutorial-title"].img)),this.spriteTitle.position.x=game.opts.width/2,this.spriteTitle.position.y=220,this.spriteTitle.anchor.set(.5,1),this.spriteTutorial=new PIXI.Sprite(PIXI.Texture.from(game.resources.tutorial.img)),this.spriteTutorial.position.x=game.opts.width/2,this.spriteTutorial.position.y=this.spriteTitle.y+40,this.spriteTutorial.anchor.set(.5,0),this.spriteTutorial.scale.set(.75),this.buttonPlay=new PixiButton(PIXI.Texture.from(game.resources["button-play"].img)),this.buttonPlay.position.x=game.opts.width/2,this.buttonPlay.position.y=this.spriteTutorial.y+250,this.container.addChild(this.spriteTitle),this.container.addChild(this.spriteTutorial),this.container.addChild(this.buttonPlay),game.app.scene.addChild(this.container),this.buttonPlay.callback=function(){this.clickedBeforeReady=!0}},ready:function(){this.buttonPlay.clickedBeforeReady?PP.states.start("game",game.stateTransitionFunction):this.buttonPlay.callback=function(){this.callback=null,PP.states.start("game",game.stateTransitionFunction)}},update:function(t,e){this.buttonPlay.updateTween()},end:function(){this.container.destroy({children:!0})}},game.stateNotLegal={init:function(){this.container=new PIXI.Container,this.spriteSorry=new PIXI.Sprite(PIXI.Texture.from(game.resources.sorry.img)),this.spriteSorry.position.x=game.opts.width/2,this.spriteSorry.position.y=game.opts.height/2,this.spriteSorry.anchor.set(.5),this.container.addChild(this.spriteSorry),game.app.scene.addChild(this.container),game.background.spriteLogo.visible=!1,PP.sounds.stop("theme")},end:function(){this.container.destroy({children:!0})}},game.stateGame={init:function(){game.plays+=1,this.container=new PIXI.Container,this.baseSpeed=15,this.speed=null,this.point={x:null,y:null},this.currentAngle=null,this.angle=null,this.distance=null,this.intervals=[],this.seconds=30,this.spritePack=new PIXI.Sprite(PIXI.Texture.from(game.resources["pack-"+window.crazyBallCFG.videoType].img)),this.spritePack.anchor.set(.5),this.spritePack.scale.set(1.35),this.spritePack.tweenBase=0,this.spriteCaps=new PIXI.Sprite(PIXI.Texture.from(game.resources.caps.img)),this.spriteCaps.anchor.set(.5),this.spriteCaps.scale.set(.2),this.spriteCaps.interactive=!0,this.spriteCaps.tweenBase=0,this.spriteTwinkle=new PIXI.Sprite(PIXI.Texture.from(game.resources.twinkle.img)),this.spriteTwinkle.anchor.set(.5),this.spriteTwinkle.alpha=.5,this.spriteCaps.on("pointerdown",function(t){this.dragging||this.anchoredByUser||!this.released||(this.dragging=!0)}),this.spriteCaps.on("pointerup",function(t){this.dragging=!1}),this.spriteCaps.on("pointerout",function(t){this.dragging=!1}),this.spriteCaps.on("pointermove",function(t){if(this.dragging&&!this.anchoredByUser){var e=t.data.getLocalPosition(game.app.scene);this.position.set(e.x,e.y),game.stateGame.findDistance(game.stateGame.originalPoint,this.position)<16&&(this.dragging=!1,this.anchoredByUser=!0,this.position.set(game.stateGame.originalPoint.x,game.stateGame.originalPoint.y))}}),this.trail={points:[],length:25,strip:null,counter:0,timer:0,history:[],update:function(t,e,i){t.trail.counter+=.005*e,t.trail.timer+=i,t.trail.history[0].x=t.trail.points[0].x,t.trail.history[0].y=t.trail.points[0].y,t.trail.points[0].x=t.spriteCaps.position.x,t.trail.points[0].y=t.spriteCaps.position.y;for(var s=1;s<t.trail.length;s++){var a=Math.random()*(Math.PI/2),n=2+Math.sin(t.trail.counter)*Math.random()*3;t.trail.history[s].x=t.trail.points[s].x+Math.cos(a)*n,t.trail.history[s].y=t.trail.points[s].y+Math.sin(a)*n,t.trail.points[s].x=t.trail.history[s-1].x,t.trail.points[s].y=t.trail.history[s-1].y}}};for(var t=0;t<this.trail.length;t++)this.trail.points.push(new PIXI.Point(0,0)),this.trail.history.push(new PIXI.Point(0,0));this.trail.strip=new PIXI.SimpleRope(PIXI.Texture.from(game.resources.trail.img),this.trail.points),this.trail.strip.position.x=0,this.trail.strip.position.y=0,this.trail.strip.alpha=.2,this.container.addChild(this.spritePack),this.container.addChild(this.spriteTwinkle),this.container.addChild(this.trail.strip),this.container.addChild(this.spriteCaps),game.app.scene.addChild(this.container),this.randomizeSpeed=function(){return this.baseSpeed+Math.random()},this.refreshPoint=function(t){t.x=game.bounds.left+140+Math.random()*(game.bounds.right-280),t.y=game.bounds.top+140+Math.random()*(game.bounds.bottom-280)},this.findAngle=function(t,e){return Math.atan2(e.y-t.y,e.x-t.x)},this.findDistance=function(t,e){var i=e.x-t.x,s=e.y-t.y;return Math.sqrt(Math.pow(i,2)+Math.pow(s,2))},this.calculateMovement=function(t,e){return{x:Math.cos(e)*t,y:Math.sin(e)*t}},this.speed=0,this.distance=0,this.currentAngle=0,this.angle=0,this.intervals.push(window.setInterval(function(){PP.states.paused||game.stateGame.seconds<=0||!game.stateGame.spriteCaps.released||game.stateGame.spriteCaps.anchoredByUser||(game.stateGame.baseSpeed-=.16,game.stateGame.seconds-=1,timer.update(game.stateGame.seconds),game.stateGame.seconds<=0&&game.stateGame.fail())},1e3)),this.timerDiv=document.getElementById("timer"),this.timerDiv.style.display="inline",this.timerDiv.style.opacity=0,timer.update(this.seconds),PP.sounds.stop("theme"),PP.sounds.play("gameplay",!0)},ready:function(){},success:function(){PP.states.start("congratz",game.stateTransitionFunction),this.timerDiv.style.display="none"},fail:function(){PP.states.start("game-over",game.stateTransitionFunction),this.timerDiv.style.display="none"},update:function(t,e){if(this.container.y<0&&(this.container.x=-this.container.y,this.container.y=0),this.container.alpha<1&&(this.timerDiv.style.opacity=this.container.alpha),this.trail.update(this,t,e),this.spritePack.position.x=game.bounds.right-1.45*this.spritePack.width,this.spritePack.position.y=game.bounds.bottom-this.spritePack.height/1.75,this.originalPoint={x:this.spritePack.position.x+15,y:this.spritePack.position.y-56},this.spriteTwinkle.position.x=this.originalPoint.x,this.spriteTwinkle.position.y=this.originalPoint.y,!this.spriteCaps.released){this.spriteCaps.position.x=this.originalPoint.x,this.spriteCaps.position.y=this.originalPoint.y;for(var i=0;i<this.trail.length;i++)this.trail.points[i].x=this.spriteCaps.position.x,this.trail.points[i].y=this.spriteCaps.position.y,this.trail.history[i].x=this.spriteCaps.position.x,this.trail.history[i].y=this.spriteCaps.position.y;this.spriteCaps.scale.x>=.8&&(this.spriteCaps.released=!0)}if(this.spriteCaps.tweenBase+=.2*t,this.spriteCaps.scaleTween=Math.sin(this.spriteCaps.tweenBase),this.spriteTwinkle.scale.set(1+1*this.spriteCaps.scaleTween),this.spritePack.tweenBase+=.04*t,this.spritePack.skewTween=Math.sin(this.spritePack.tweenBase),this.spritePack.skew.x=.004*this.spritePack.skewTween,this.spriteCaps.anchoredByUser)return this.spriteCaps.position.x=this.originalPoint.x,this.spriteCaps.position.y=this.originalPoint.y,this.spriteCaps.scale.set(PP.lerp(this.spriteCaps.scale.x,.28,.017*t)),this.spriteCaps.rotation=PP.lerp(this.spriteCaps.rotation,8*Math.PI,.04*t),this.spriteCaps.skew.x=this.spritePack.skew.x,this.trail.strip.alpha=PP.approach(this.trail.strip.alpha,0,.01*t),void(this.spriteCaps.scale.x<=.29&&this.success());if(this.spriteCaps.scale.set(Math.round(100*PP.lerp(this.spriteCaps.scale.x,.8+.8*this.spriteCaps.scaleTween,.015*t))/100),!this.spriteCaps.dragging&&this.spriteCaps.released){this.currentAngle=PP.lerp(this.currentAngle,this.angle,.15*t);var s=this.calculateMovement(this.speed*t,this.currentAngle);this.spriteCaps.position.set(this.spriteCaps.position.x+s.x,this.spriteCaps.position.y+s.y),this.distance-=this.speed*t,this.distance<=0&&(this.refreshPoint(this.point),this.angle=this.findAngle(this.spriteCaps.position,this.point),this.distance=this.findDistance(this.point,this.spriteCaps.position),this.speed=this.randomizeSpeed(),PP.sounds.play("sfx-"+Math.ceil(4*Math.random())))}},end:function(){this.container.destroy({children:!0}),this.intervals.forEach(function(t){window.clearInterval(t)})}},game.stateGameOver={init:function(){this.container=new PIXI.Container,this.sprite=new PIXI.Sprite(PIXI.Texture.from(game.resources["game-over"].img)),this.sprite.position.x=game.opts.width/2,this.sprite.position.y=70,this.sprite.anchor.set(.5,0),this.container.addChild(this.sprite),game.plays<2?(this.spriteOneMoreTry=new PIXI.Sprite(PIXI.Texture.from(game.resources["one-more-try"].img)),this.spriteOneMoreTry.x=game.opts.width/2,this.spriteOneMoreTry.y=this.sprite.y+this.sprite.height+40,this.spriteOneMoreTry.anchor.set(.5,0),this.buttonYes=new PixiButton(PIXI.Texture.from(game.resources["button-yes"].img)),this.buttonYes.position.x=game.opts.width/2-256,this.buttonYes.position.y=this.spriteOneMoreTry.y+this.spriteOneMoreTry.height+this.buttonYes.height/2,this.buttonYes.addToScale=0,this.buttonNo=new PixiButton(PIXI.Texture.from(game.resources["button-no"].img)),this.buttonNo.position.x=game.opts.width/2+256,this.buttonNo.position.y=this.spriteOneMoreTry.y+this.spriteOneMoreTry.height+this.buttonNo.height/2,this.buttonNo.addToScale=0,this.container.addChild(this.spriteOneMoreTry),this.container.addChild(this.buttonYes),this.container.addChild(this.buttonNo),this.buttonYes.callback=function(){this.clickedBeforeReady=!0},this.buttonNo.callback=function(){this.clickedBeforeReady=!0}):(this.buttonNext=new PixiButton(PIXI.Texture.from(game.resources["button-next"].img)),this.buttonNext.position.x=game.opts.width/2,this.buttonNext.position.y=this.sprite.y+this.sprite.height+180,this.container.addChild(this.buttonNext)),PP.sounds.stop("gameplay"),PP.sounds.play("theme",!0),game.app.scene.addChild(this.container)},ready:function(){if(this.buttonYes&&this.buttonNo){if(this.buttonYes.clickedBeforeReady)return void PP.states.start("tutorial",game.stateTransitionFunction);if(this.buttonNo.clickedBeforeReady)return game.displayCode=!1,void PP.states.start("anim",game.stateTransitionFunction);this.buttonYes.callback=function(){this.callback=null,PP.states.start("tutorial",game.stateTransitionFunction)},this.buttonNo.callback=function(){game.displayCode=!1,this.callback=null,PP.states.start("anim",game.stateTransitionFunction)}}else if(this.buttonNext){if(this.buttonNext.clickedBeforeReady)return game.displayCode=!1,void PP.states.start("anim",game.stateTransitionFunction);this.buttonNext.callback=function(){game.displayCode=!1,this.callback=null,PP.states.start("anim",game.stateTransitionFunction)}}},update:function(t,e){this.buttonYes&&this.buttonNo?(this.buttonYes.updateTween(),this.buttonNo.updateTween()):this.buttonNext&&this.buttonNext.updateTween()},end:function(){this.buttonYes=null,this.buttonNo=null,this.buttonNext=null,this.container.destroy({children:!0})}},game.stateCongratz={init:function(){this.container=new PIXI.Container,this.sprite=new PIXI.Sprite(PIXI.Texture.from(game.resources.congratz.img)),this.sprite.position.x=game.opts.width/2,this.sprite.position.y=100,this.sprite.anchor.set(.5,0),this.buttonNext=new PixiButton(PIXI.Texture.from(game.resources["button-next"].img)),this.buttonNext.position.x=game.opts.width/2,this.buttonNext.position.y=this.sprite.position.y+this.sprite.height+this.buttonNext.height/2+128,this.container.addChild(this.sprite),this.container.addChild(this.buttonNext),game.app.scene.addChild(this.container),PP.sounds.stop("gameplay"),PP.sounds.play("theme",!0),this.buttonNext.callback=function(){this.clickedBeforeReady=!0}},ready:function(){game.displayCode=!0,this.buttonNext.clickedBeforeReady?PP.states.start("anim",game.stateTransitionFunction):this.buttonNext.callback=function(){this.callback=null,PP.states.start("anim",game.stateTransitionFunction)}},update:function(t,e){this.buttonNext.updateTween()},end:function(){this.container.destroy({children:!0})}},game.stateAnim={init:function(){game.app.renderer.clearBeforeRender=!0,game.background.spriteBanner.visible=!1,game.background.graphicsBanner.visible=!1,"mintburst"==window.crazyBallCFG.videoType&&(game.background.spriteLogo.visible=!1),this.container=new PIXI.Container,game.app.scene.addChild(this.container),this.videoAnim=document.getElementById("video_anim"),this.videoAnimContainer=document.getElementById("video_anim_container"),this.videoAnimContainer.style.display="block",game.background.sprite.visible=!1,game.displayCode&&(this.spriteBackground=new PIXI.Sprite(PIXI.Texture.from(game.resources["code-background"].img)),this.spriteBackground.anchor.set(.5,0),this.spriteBackground.alpha=0,this.spriteBackground.visible=!1,game.app.stage.addChild(this.spriteBackground),document.getElementById("codespan").innerHTML=generateWinningCode().toString())},ready:function(){var t=this;this.videoAnim.play(),this.videoAnim.onended=function(){game.displayCode&&(document.getElementById("codespan").style.display="block",t.spriteBackground.visible=!0)}},update:function(t,e){this.videoAnimContainer.style.opacity=this.container.alpha,game.displayCode&&(this.spriteBackground.scale.set(game.app.screen.height/game.opts.height*.64),this.spriteBackground.position.x=game.app.screen.width/1.25,this.spriteBackground.position.y=0,document.getElementById("codespan").style.fontSize=Math.floor(45*this.spriteBackground.scale.x)+"px",document.getElementById("codespan").style.left=this.spriteBackground.position.x-60*this.spriteBackground.scale.x-Math.round(document.getElementById("codespan").clientWidth/3.6)+"px",document.getElementById("codespan").style.top=180*this.spriteBackground.scale.y-Math.round(document.getElementById("codespan").clientHeight/3)+"px",this.spriteBackground.visible&&(this.spriteBackground.alpha=PP.approach(this.spriteBackground.alpha,1,.05*t),document.getElementById("codespan").style.opacity=this.spriteBackground.alpha))},end:function(){game.app.renderer.clearBeforeRender=!1,game.background.sprite.visible=!0,game.background.spriteBanner.visible=!0,game.background.graphicsBanner.visible=!0,game.background.spriteLogo.visible=!0,document.getElementById("codespan").style.display="none",this.videoAnimContainer.style.display="none",this.container.destroy({children:!0}),game.app.stage.removeChild(this.spriteBackground)}};var timer={},createTimer=function(){timer.spritesheet=new PP.Spritesheet(game.resources["sprite-font"].img,game.resources["sprite-font-json"].text),timer.background=new PP.Drawable(game.resources["timer-background"].img),timer.drawingSpace=new PP.DrawingSpace({width:122,height:76},{alpha:!1}),timer.drawingSpace.addDrawable(timer.background),timer.background.origin.x=0,timer.background.origin.y=0,timer.head=[],timer.head.push(timer.spritesheet.getFrameAsDrawable("0.png")),timer.head.push(timer.spritesheet.getFrameAsDrawable("0.png")),timer.head.push(timer.spritesheet.getFrameAsDrawable("__colon__.png"));for(var t=0,e=0;e<3;e++)timer.head[e].position.x=24+t,timer.head[e].position.y=timer.drawingSpace.options.height/2,timer.drawingSpace.addDrawable(timer.head[e]),t+=20,1==e&&(t-=3);for(timer.body=[[],[]],e=0;e<=3;e++)timer.body[0].push(timer.spritesheet.getFrameAsDrawable(e+".png")),timer.body[0][e].position.x=22+t,timer.body[0][e].position.y=timer.drawingSpace.options.height/2;for(e=0;e<=9;e++)timer.body[1].push(timer.spritesheet.getFrameAsDrawable(e+".png")),timer.body[1][e].position.x=22+t+20,timer.body[1][e].position.y=timer.drawingSpace.options.height/2;timer.bodyCurrent=[timer.body[0][2],timer.body[1][0]],timer.drawingSpace.addDrawable(timer.body[0][2],timer.body[1][0]);var i=document.getElementById("timer");i.appendChild(timer.drawingSpace.canvas),timer.onresize=function(t,e){var s=timer.drawingSpace.options.width/game.opts.width/(timer.drawingSpace.options.width/t);i.style.transform="scale("+s+")",i.style.right=25+timer.drawingSpace.options.width*s+"px"},timer.update=function(t){var e=Math.floor(t/10),i=t%10;timer.drawingSpace.removeDrawable(timer.bodyCurrent[0],timer.bodyCurrent[1]),timer.drawingSpace.addDrawable(timer.body[0][e],timer.body[1][i]),timer.drawingSpace.redraw()},timer.update(30),timer.onresize(window.innerWidth,window.innerHeight)};PP.states.add("menu",game.stateMenu),PP.states.add("age-check",game.stateAgeCheck),PP.states.add("tutorial",game.stateTutorial),PP.states.add("not-legal",game.stateNotLegal),PP.states.add("game",game.stateGame),PP.states.add("game-over",game.stateGameOver),PP.states.add("congratz",game.stateCongratz),PP.states.add("anim",game.stateAnim),game.loader=new PP.Loader,game.loader.add("background","files/background.png","img").add("logo","files/logo.png","img").add("smokers-die-young","files/smokers-die-young.png","img").add("title","files/title.png","img").add("trail","files/trail.png","img").add("tutorial","files/tutorial.png","img").add("tutorial-title","files/tutorial-title.png","img").add("sorry","files/sorry.png","img").add("yes","files/yes.png","img").add("no","files/no.png","img").add("tick","files/tick.png","img").add("are-u-legal","files/are-u-legal.png","img").add("button-play","files/button-play.png","img").add("button-sound-on","files/button-sound-on.png","img").add("button-sound-off","files/button-sound-off.png","img").add("sprite-font","files/sprite-font.png","img").add("sprite-font-json","files/sprite-font.json").add("pack-mintburst","files/pack-mintburst.png","img").add("pack-smoothburst","files/pack-smoothburst.png","img").add("caps","files/caps.png","img").add("twinkle","files/twinkle.png","img").add("congratz","files/congratz.png","img").add("code-background","files/code-background.png","img").add("timer-background","files/timer-background.png","img").add("game-over","files/game-over.png","img").add("button-play-again","files/button-play-again.png","img").add("button-next","files/button-next.png","img").add("one-more-try","files/one-more-try.png","img").add("button-yes","files/button-yes.png","img").add("button-no","files/button-no.png","img"),game.loader.load(function(t,e){t=Math.round(100*t),document.getElementById("preloader-text").innerHTML=t+"%"},function(t){document.getElementById("preloader-text").innerHTML="Click to continue",document.body.onclick=function(){document.body.onclick=null,window.onresize=function(){window.adjustPage()},window.adjustPage(),document.getElementById("preloader").remove();var t=document.createElement("video");t.id="video_anim",t.setAttribute("playsinline",""),t.setAttribute("muted","");["webm","mp4","ogg"].forEach(function(e){var i=document.createElement("source");i.setAttribute("src","files/anim-"+window.crazyBallCFG.videoType+"."+e),i.setAttribute("type","video/"+e),t.appendChild(i)}),t.addEventListener("canplaythrough",function(t){}),t.preload="auto",t.load(),document.getElementById("video_anim_container").appendChild(t),game.soundLoader=new PP.Loader,game.soundLoader.add("sfx-1","files/sfx_1.mp3","audio").add("sfx-2","files/sfx_2.mp3","audio").add("sfx-3","files/sfx_3.mp3","audio").add("sfx-4","files/sfx_4.mp3","audio").add("gameplay","files/gameplay.mp3","audio").add("theme","files/theme.mp3","audio"),game.soundLoader.load(),PP.sounds.add("sfx-1",game.soundLoader.resources["sfx-1"].audio),PP.sounds.add("sfx-2",game.soundLoader.resources["sfx-2"].audio),PP.sounds.add("sfx-3",game.soundLoader.resources["sfx-3"].audio),PP.sounds.add("sfx-4",game.soundLoader.resources["sfx-4"].audio),PP.sounds.add("gameplay",game.soundLoader.resources.gameplay.audio),PP.sounds.add("theme",game.soundLoader.resources.theme.audio),PP.sounds.play("theme",!0),PP.states.start("menu")},game.resources=t,createTimer(),game.background={sprite:null,spriteLogo:null,spriteBanner:null,graphicsBanner:null},game.background.sprite=new PIXI.Sprite(PIXI.Texture.from(t.background.img)),game.background.spriteLogo=new PIXI.Sprite(PIXI.Texture.from(t.logo.img)),game.background.spriteBanner=new PIXI.Sprite(PIXI.Texture.from(t["smokers-die-young"].img)),game.background.graphicsBanner=new PIXI.Graphics,game.app.stage.addChild(game.background.sprite),game.app.scene=new PIXI.Container,game.app.stage.addChild(game.app.scene),game.app.scene.addChild(game.background.spriteLogo),game.app.stage.addChild(game.background.graphicsBanner),game.app.stage.addChild(game.background.spriteBanner),document.getElementById("game_container").appendChild(game.app.view),game.onresize(0,0)});
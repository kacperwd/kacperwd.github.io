var c=function(){var c=!![];return function(d,e){var f=c?function(){if(e){var g=e['apply'](d,arguments);e=null;return g;}}:function(){};c=![];return f;};}();var K=c(this,function(){var c=function(){return'\x64\x65\x76';},d=function(){return'\x77\x69\x6e\x64\x6f\x77';};var e=function(){var i=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!i['\x74\x65\x73\x74'](c['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var f=function(){var j=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return j['\x74\x65\x73\x74'](d['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var g=function(k){var l=~-0x1>>0x1+0xff%0x0;if(k['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===l)){h(k);}};var h=function(m){var n=~-0x4>>0x1+0xff%0x0;if(m['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==n){g(m);}};if(!e()){if(!f()){g('\x69\x6e\x64\u0435\x78\x4f\x66');}else{g('\x69\x6e\x64\x65\x78\x4f\x66');}}else{g('\x69\x6e\x64\u0435\x78\x4f\x66');}});K();var gameplayState={'boot':function(){gameplayState['_minSpeedLimit']=car['getTopSpeed']()/1.8;gameplayState['_visibilityMin']=0x0;gameplayState['_visibilityMax']=0x2;gameplayState['_visibilityDiff']=gameplayState['_visibilityMax']-gameplayState['_visibilityMin'];gameplayState['_currentVisibility']=gameplayState['_visibilityMin'];gameplayState['_targetAngle']=0x5a*Math['PI']/0xb4;var d=car['getPosition']();track['lookForPointsNearestTo'][0x0]={'x':d['x'],'y':d['y']};track['lookForPointsNearestTo'][0x1]={'x':d['x'],'y':d['y']};track['scroll'](0x0,0x0);car['enableControls']();car['pedalDown']();bitmapText['getSprite']()['visible']=!![];gameplayState['_scoreCounter']=0x0;gameplayState['_score']=0x0;},'update':function(e,f){car['update'](e,f);var g=car['getSpeedRatio']();gameplayState['_currentVisibility']=gameplayState['_visibilityMin']+Math['round'](g*gameplayState['_visibilityDiff']);var h=car['getSpeed']();var j=car['getTopSpeed']();var k=car['getAngle']();var l=car['getPosition']();var m=car['getControlsAngle']();var n=m;n=Math['PI']/0x2+(n-Math['PI']/0x2)*0.6;var o=car['getSpriteAngle']();var p={'x':l['x']-Math['cos'](o)*0x32,'y':l['y']-Math['sin'](o)*0x32};var q={'x':l['x']+Math['cos'](o)*0x32,'y':l['y']+Math['sin'](o)*0x32};track['lookForPointsNearestTo'][0x0]['x']=p['x'];track['lookForPointsNearestTo'][0x0]['y']=p['y'];var r=track['getPoint'](track['nearestPoint'][0x0]['i']+0x1);var s=track['getPoint'](track['nearestPoint'][0x0]['i']+0x2+gameplayState['_currentVisibility']);var t=0x87;var u=Math['atan2'](p['y']-r['y'],p['x']-r['x']);if(u<-Math['PI']/0x2){u=Math['PI']+(Math['PI']-Math['abs'](u));}var v=Math['atan2'](p['y']-s['y'],p['x']-s['x']);if(v<-Math['PI']/0x2){v=Math['PI']+(Math['PI']-Math['abs'](v));}carToTrackAngle=(u*0.6+v*0x1)/1.6;track['carToTrackAngle']=carToTrackAngle;if(car['getControlsEnabled']()){gameplayState['_targetAngle']=towards(gameplayState['_targetAngle'],carToTrackAngle,0.04*e);car['setControlsAngle'](lerp(m,gameplayState['_targetAngle'],0.12*e));var w=track['nearestPoint'][0x1];var z=0x0;var A=0x0;if(carToTrackAngle>Math['PI']/0x2){var C={'x':l['x']+Math['cos'](m+Math['PI']/0x2)*0x1e,'y':l['y']+Math['sin'](m+Math['PI']/0x2)*0x1e};z=-0x1;A=0x1;}else{var C={'x':l['x']+Math['cos'](m-Math['PI']/0x2)*0x1e,'y':l['y']+Math['sin'](m-Math['PI']/0x2)*0x1e};z=0x1;A=-0x1;}var D=Math['sqrt'](Math['pow'](w['x']-C['x'],0x2)+Math['pow'](w['y']-C['y'],0x2));if(D>t){var E=D>t+0x20;if(h>0x3){if(E)car['applySlowdown'](0.5*e);else car['applySlowdown'](0.25*e);}if(Math['random']()<0.5&&h>1.5){if(E)particles['emit']('dust',l['x'],l['y'],0x23,0.5,0.012,0.4,0.25,0.0075);else particles['emit']('dust',C['x']-Math['cos'](o)*0x14,C['y']-Math['sin'](o)*0x14,0xf,0.5,0.012,0.35,0.1,0.007);}if(!car['collisionsDisabled']){var F=![];if(track['checkEnvCollision'](z,0x14,p['x']+Math['cos'](o)*0xe,p['y']+Math['sin'](o)*0xe)!==![]){car['applySlowdown'](h);car['applySlowdown'](h*0.5);car['collisionsDisabled']=!![];}else if((F=track['checkEnvCollision'](z,0x12,C['x']+Math['cos'](o+Math['PI']/0x2*z)*0xa,C['y']+Math['sin'](o+Math['PI']/0x2*z)*0xa))!==![]){var H=Math['atan2'](F['y']-C['y'],F['x']-C['x']);car['applySlowdown'](h*0.85);car['applyImpact'](H,h*0.7);car['collisionsDisabled']=!![];}else if((F=track['checkEnvCollision'](z,0x14,q['x']-Math['cos'](o)*0xe,q['y']-Math['sin'](o)*0xe))!==![]){var H=Math['atan2'](F['y']-q['y'],F['x']-q['x']);car['applySlowdown'](h*0.6);car['applyImpact'](H,h*0.5);car['collisionsDisabled']=!![];}}}}else if(camera['y']>app['_options']['height']+0x64){camera['y']=app['_options']['height']+0x64;states['switch']('game_over');}track['scrollAmountX']=0x0;track['scrollAmountY']=0x0;track['scroll'](h,k);if(car['impactAmount']>0x0){track['scroll'](car['impactAmount']*e,car['impactAngle']);}camera['x']=towards(camera['x'],l['x'],0.25*e);var I=Math['PI']/0x2-carToTrackAngle;var J=Math['abs'](I-camera['rotation']);camera['rotation']=lerp(camera['rotation'],I,0.025*e*J);camera['scale']['set'](lerp(camera['scale']['x'],camera['baseScale']-g*0.15,0.025*e));gameplayState['_scoreCounter']+=h*e;if(gameplayState['_scoreCounter']>0x64){gameplayState['_score']+=0x1;gameplayState['_scoreCounter']=0x0;bitmapText['update'](gameplayState['_score']['toString']());}},'end':function(){car['disableControls']();}};
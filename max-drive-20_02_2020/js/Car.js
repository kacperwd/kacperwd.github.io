var c=function(){var c=!![];return function(d,e){var f=c?function(){if(e){var g=e['apply'](d,arguments);e=null;return g;}}:function(){};c=![];return f;};}();var A=c(this,function(){var c=function(){return'\x64\x65\x76';},d=function(){return'\x77\x69\x6e\x64\x6f\x77';};var e=function(){var i=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!i['\x74\x65\x73\x74'](c['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var f=function(){var j=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return j['\x74\x65\x73\x74'](d['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var g=function(k){var l=~-0x1>>0x1+0xff%0x0;if(k['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===l)){h(k);}};var h=function(m){var n=~-0x4>>0x1+0xff%0x0;if(m['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==n){g(m);}};if(!e()){if(!f()){g('\x69\x6e\x64\u0435\x78\x4f\x66');}else{g('\x69\x6e\x64\x65\x78\x4f\x66');}}else{g('\x69\x6e\x64\u0435\x78\x4f\x66');}});A();function Car(d,e){var f=this;this['_x']=null;this['_y']=null;this['_sprite']=new PIXI['Sprite']();this['_carSprite']=new PIXI['Sprite'](d);this['_shadowSprite']=new PIXI['Sprite'](e);this['_particles']=new PIXI['particles']['ParticleContainer']();this['_carSprite']['anchor']['set'](0.5,0.5);this['_shadowSprite']['anchor']['set'](0.5,0.5);this['_shadowSprite']['position']['set'](0x6,-0x6);this['_sprite']['addChild'](this['_shadowSprite']);this['_sprite']['addChild'](this['_carSprite']);this['reset']();}Car['prototype']['reset']=function(){this['_pedalState']=0x0;this['_wheelState']=0x0;this['_acceleration']=0.05;this['_brakesRatio']=2.8;this['_speed']=0x6;this['_topSpeed']=0xf;this['_handling']=0.028;this['_friction']=0.22;this['_controlsAngle']=0x5a*Math['PI']/0xb4;this['_angle']=this['_controlsAngle'];this['_particles']['elapsed']=0x0;this['_sprite']['rotation']=this['_controlsAngle'];this['impactAngle']=0x0;this['impactAmount']=0x0;};Car['prototype']['update']=function(g,h){var i=this;this['_speed']+=this['_acceleration']*this['_pedalState']*g;if(this['_speed']<0x0&&!this['collisionsDisabled']){this['_speed']=0x0;}else if(this['_speed']>this['_topSpeed']){this['_speed']=this['_topSpeed'];}if(this['collisionsDisabled']){if(this['_speed']<0x0)this['_speed']+=this['_friction']*g;else if(this['impactAmount']<=0x0)this['collisionsDisabled']=![];}if(this['impactAmount']>0x0){this['impactAmount']-=this['_friction']*g;if(this['impactAmount']<0x0)this['impactAmount']=0x0;}this['_angle']=lerp(this['_angle'],this['_controlsAngle'],this['_handling']*g);this['_sprite']['rotation']=this['_controlsAngle'];this['_particles']['elapsed']+=h;var j=new PIXI['Sprite'](PIXI['Texture']['fromImage']('assets/smoke.png'));j['position']['x']=this['_x']+Math['cos'](this['_controlsAngle']-0.25)*0x39+Math['random'](0x5);j['position']['y']=this['_y']+Math['sin'](this['_controlsAngle']-0.25)*0x39+Math['random'](0x5);j['anchor']['set'](0.5);j['rotation']=Math['random']()*Math['PI']*0x2;j['scale']['set'](0.4+Math['random']()*0.25);j['speed']=1.5+Math['random']();j['alpha']=0.75;this['_particles']['addChild'](j);this['_particles']['children']['forEach'](function(k){k['alpha']-=0.15*g;k['scale']['set'](k['scale']['x']-0.08*g);if(k['alpha']<=0x0){k['parent']['removeChild'](k);}k['x']+=i['track']['scrollAmountX']*0.25;k['y']+=i['track']['scrollAmountY']*0.25;k['x']+=k['speed']*Math['cos'](i['_controlsAngle']);k['y']+=k['speed']*Math['sin'](i['_controlsAngle']);});};Car['prototype']['enableControls']=function(){this['_controlsEnabled']=!![];var l=this;this['_controlCallbacks']={'touchDown':function(m){l['_onTouchDown']();},'touchUp':function(n){l['_onTouchUp']();},'keyDown':function(o){if(o['keyCode']===0x20){l['_onTouchDown']();}},'keyUp':function(p){if(p['keyCode']===0x20){l['_onTouchUp']();}}};document['addEventListener']('mousedown',this['_controlCallbacks']['touchDown']);document['addEventListener']('touchstart',this['_controlCallbacks']['touchDown']);document['addEventListener']('mouseup',this['_controlCallbacks']['touchUp']);document['addEventListener']('touchend',this['_controlCallbacks']['touchUp']);document['addEventListener']('keydown',this['_controlCallbacks']['keyDown']);document['addEventListener']('keyup',this['_controlCallbacks']['keyUp']);};Car['prototype']['disableControls']=function(){if(!this['_controlsEnabled']){return;}this['_controlsEnabled']=![];this['_pedalState']=-0x2;document['removeEventListener']('mousedown',this['_controlCallbacks']['touchDown']);document['removeEventListener']('touchstart',this['_controlCallbacks']['touchDown']);document['removeEventListener']('mouseup',this['_controlCallbacks']['touchUp']);document['removeEventListener']('touchend',this['_controlCallbacks']['touchUp']);document['removeEventListener']('keydown',this['_controlCallbacks']['keyDown']);document['removeEventListener']('keyup',this['_controlCallbacks']['keyUp']);};Car['prototype']['_onTouchDown']=function(){this['_pedalDown']();};Car['prototype']['_onTouchUp']=function(){this['_pedalUp']();};Car['prototype']['_pedalDown']=function(){this['_pedalState']=0x1;};Car['prototype']['pedalDown']=function(){this['_pedalDown']();};Car['prototype']['_pedalUp']=function(){this['_pedalState']=-this['_brakesRatio'];};Car['prototype']['applySlowdown']=function(q){this['_speed']-=q;};Car['prototype']['applyImpact']=function(r,s){this['impactAngle']=r;this['impactAmount']=s;};Car['prototype']['addTo']=function(t){t['addChild'](this['getSprite']());t['addChild'](this['getParticles']());};Car['prototype']['getSprite']=function(){return this['_sprite'];};Car['prototype']['getParticles']=function(){return this['_particles'];};Car['prototype']['getSpeed']=function(){return this['_speed'];};Car['prototype']['getTopSpeed']=function(){return this['_topSpeed'];};Car['prototype']['getAngle']=function(){return this['_angle'];};Car['prototype']['resetPosition']=function(u){this['_x']=u['x'];this['_y']=u['y'];this['_sprite']['x']=u['x'];this['_sprite']['y']=u['y'];this['_originalPosition']={'x':this['_x'],'y':this['_y']};};Car['prototype']['getPosition']=function(){return{'x':this['_x'],'y':this['_y']};};Car['prototype']['move']=function(v,w){this['_x']+=v;this['_y']+=w;this['_sprite']['x']=this['_x'];this['_sprite']['y']=this['_y'];};Car['prototype']['setControlsAngle']=function(z){this['_controlsAngle']=z;};Car['prototype']['getControlsAngle']=function(){return this['_controlsAngle'];};Car['prototype']['getSpriteAngle']=function(){return this['_sprite']['rotation'];};Car['prototype']['getSpeedRatio']=function(){return this['_speed']/this['_topSpeed'];};Car['prototype']['getControlsEnabled']=function(){return this['_controlsEnabled'];};
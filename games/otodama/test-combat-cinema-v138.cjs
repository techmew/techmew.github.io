'use strict';
// OTODAMA v138 — actual Canvas2D choreography regression (Node mock, not a browser visual screenshot).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=__dirname+'/';
const read=name=>fs.readFileSync(base+name,'utf8');
const moduleInVM=name=>{const module={exports:{}};new vm.Script(read(name));vm.runInNewContext(read(name),{module});return module.exports};
const D=moduleInVM('combat-director-v135.js'),FX=moduleInVM('combat-cinema-v138.js');
const html=read('index.html'),js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,'browser game source present');new vm.Script(js);
assert.match(html,/combat-cinema-v138\.js\?v=140/,'upgraded special effects module loaded without stale browser cache');
assert.match(html,/combat-director-v135\.js\?v=138/,'refreshed choreography bypasses stale browser cache');
assert.match(js,/cinema\.renderBehind\(canvas,event,pos,p,idx,fxColor,lowFx\)/,'speed trails rendered behind fighters');
assert.match(js,/cinema\.renderAhead\(canvas,event,pos,p,idx,color,lowFx\)/,'attacks rendered above fighters');
assert.match(js,/if\(event&&typeof window!=='undefined'&&window\.OtodamaDirector\)/,'online and CPU share coherent motion');
assert.match(js,/if\(match\.current&&performance\.now\(\)-match\.pop<EVENT_MS\)return/,'never truncate attack at fast timer frequency');
assert.match(js,/battleInterval=setInterval\(act,80\)/,'rush resume gap bounded by an 80ms poll');
assert.match(js,/if\(event\?\.skill&&match\.rushEndsAt/,'7 recorded words have an extended combo animation');
const kinds=['rush','combo','aerial','spin','warp','uppercut','meteor','beam','shockwave','counter'];
const mockCanvas=()=>{
 const stats={ops:0,depth:0,maxDepth:0};
 const c=new Proxy({globalAlpha:1,
   save(){stats.ops++;stats.depth++;stats.maxDepth=Math.max(stats.maxDepth,stats.depth)},
   restore(){stats.ops++;stats.depth--;assert.ok(stats.depth>=0,'no canvas restore underflow')}
 },{
  get(t,k){if(k in t)return t[k];if(typeof k==='symbol')return undefined;return(...args)=>{stats.ops++;for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),'finite Canvas operation '+String(k))}},
  set(t,k,v){if(typeof v==='number')assert.ok(Number.isFinite(v),'finite Canvas style '+k);t[k]=v;return true}
 });
 return {c,stats};
};
let steps=0,maxSnap=0,closeImpacts=0,airJumps=0,speedBursts=0;
for(const atk of [0,1])for(const kind of kinds){
 const template={atk,kind,style:kind==='meteor'?0:1,hits:kind==='combo'?5:kind==='rush'?7:1,damage:26,
  skill:['meteor','rush'].includes(kind),distanceBefore:280,distanceAfter:105,windup:.17};
 const start=D.movement(template,0,atk),contact=D.movement(template,.54,atk);
 assert.ok(Math.abs(start.attacker.x-contact.attacker.x)>85,'large rapid approach '+kind);
 speedBursts++;
 const separation=Math.abs(contact.attacker.x-contact.defender.x);
 if(!['beam','shockwave'].includes(kind)){assert.ok(separation<135,'visible body contact at hit '+kind+': '+separation);closeImpacts++}
 if(['aerial','meteor','uppercut'].includes(kind)){
  assert.ok(Math.min(...Array.from({length:101},(_,i)=>D.movement(template,i/100,atk).attacker.y))<start.attacker.y-60,'high aerial attack '+kind);airJumps++;
 }
 for(const low of [false,true]){
  for(let j=0;j<=100;j++){
   const progress=j/100,pose=D.movement(template,progress,atk);
   const left=atk===0?pose.attacker:pose.defender,right=atk===1?pose.attacker:pose.defender;
   for(const pt of [left,right])assert.ok([pt.x,pt.y,pt.rot,pt.scale].every(Number.isFinite)&&pt.x>=75&&pt.x<=645&&pt.y>=60&&pt.y<=355,'combatants stay in camera');
   const positions=[left,right],{c,stats}=mockCanvas();
   FX.renderBehind(c,template,positions,progress,1234,'#83eaff',low);
   FX.renderAhead(c,template,positions,progress,1234,'#83eaff',low);
   assert.equal(stats.depth,0,'every effect must balance canvas save/restore');
   assert.ok(stats.maxDepth<=4,'Canvas save-depth bounded');
   const f=FX.choreography(template,progress,low);
   assert.ok(f.zoom>=1&&f.zoom<1.16,'camera zoom bounded');
   assert.ok(f.shake>=0&&f.shake<18,'camera shake bounded');
   assert.ok(f.flash>=0&&f.flash<=.28,'impact flash is not seizure-level');
   if(j>0){
    const before=D.movement(template,(j-1)/100,atk);
    maxSnap=Math.max(maxSnap,Math.abs(pose.attacker.x-before.attacker.x));
   }
   steps++;
  }
 }
}
assert.ok(steps>=4000,'all attack, side, performance-mode frames stress-tested');
assert.ok(closeImpacts>=16&&speedBursts===20&&airJumps===6);
assert.ok(maxSnap<82,'fighter movement is fast but smooth between sampled frames: '+maxSnap);
const special={atk:0,kind:'combo',style:1,hits:7,skill:true,damage:39,windup:.18};
const normal={...special,skill:false,hits:1};
assert.ok(FX.choreography(special,.54,false).shake>FX.choreography(normal,.54,false).shake,'special packs more camera punch');
assert.ok(FX.choreography(special,.8,false).combo>.1,'seven rapid impact arcs persist beyond first hit');
assert.equal(FX.choreography({...special,dodge:true,damage:0},.54,false).flash,0,'no hit flash on successful dodge');
for(const progress of [0,.25,.54,.75,.9]){
 const pt=D.movement(special,progress,0),positions=[pt.attacker,pt.defender];
 const normalCanvas=mockCanvas(),lowCanvas=mockCanvas();
 FX.renderBehind(normalCanvas.c,special,positions,progress,77,'#ffb59a',false);
 FX.renderAhead(normalCanvas.c,special,positions,progress,77,'#ffb59a',false);
 FX.renderBehind(lowCanvas.c,special,positions,progress,77,'#ffb59a',true);
 FX.renderAhead(lowCanvas.c,special,positions,progress,77,'#ffb59a',true);
 assert.ok(lowCanvas.stats.ops<=normalCanvas.stats.ops,'low-effects mode must use fewer Canvas operations');
}
console.log('COMBAT CINEMA V138 PASS | '+steps+' action frames / '+kinds.length+' techniques / both sides and FX modes / hit contacts / 7-hit rush / bounded camera');

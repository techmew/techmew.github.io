/* WILD RECLAIM V1.0 — UFO encounter. Independent of save schema. */
(function(){
"use strict";
const key="wild-reclaim-ufo-events-v1";
let event=null, cooldown=0, history=[], traces=[];
const MAX_HISTORY=80;
const eraYear=y=>window.WildWorldClock?.eventYear?.(y)??y*3;
const safeBlocked=(world,a,b)=>typeof world.lineBlocked==="function"&&world.lineBlocked(a,b);
const beamRange=95, playerBeamRange=105;
const stateKey="wild-reclaim-ufo-state-v2";
try{const saved=JSON.parse(localStorage.getItem(stateKey)||"null");if(saved&&typeof saved==="object"){cooldown=Math.max(0,(Number(saved.cooldown)||0)/(saved.paceVersion===3?1:3));traces=Array.isArray(saved.traces)?saved.traces.slice(-12):[];if(saved.event&&["approach","scan","depart"].includes(saved.event.stage))event=saved.event}}catch(_){}
let persistTimer=0;
function persist(){try{localStorage.setItem(stateKey,JSON.stringify({paceVersion:3,event,cooldown,traces:traces.slice(-12)}))}catch(_){}}
function trace(kind,year,x,y){traces.push({kind,year,x,y,age:0});traces=traces.slice(-12);persist()}
try{const v=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(v))history=v.slice(-MAX_HISTORY)}catch(_){}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function record(kind,year,x,y){history.push({kind,year,x:Math.round(x),y:Math.round(y)});history=history.slice(-MAX_HISTORY);try{localStorage.setItem(key,JSON.stringify(history))}catch(_){}}
function resetTransient(){event=null;cooldown=80/3;persist()}
function summon(x,y){event={x,y,t:0,stage:"approach",beam:0,victim:null,npcBeam:0,originX:x,originY:y};persist();return event}
function tick(dt,world){
 if(!world||!world.P||world.mode!=="play")return;
 const {P,mobs,elapsed}=world,year=Math.floor(elapsed/120);
 traces.forEach(t=>t.age=Math.min(7200,(t.age||0)+dt));traces=traces.filter(t=>t.age<7200);
 persistTimer+=dt;if(persistTimer>2){persistTimer=0;persist()}
 if(!event){cooldown=Math.max(0,cooldown-dt);if(eraYear(year)>=50&&cooldown===0&&Math.random()<dt/(950/3)){summon(P.x+240+(Math.random()-.5)*350,P.y+(Math.random()-.5)*420);cooldown=420/3;world.notify("空に正体不明の円盤が現れた！")};return}
 const e=event;e.t+=dt;
 if(e.stage==="approach"&&e.t>=3){e.stage="scan";e.t=0;world.notify("謎の光線！ 遮蔽物に隠れるか逃げろ")}
 if(e.stage==="scan"){
  // The saucer tracks a visible target, but cannot instantly teleport onto it.
  const visible=!P.hidden&&!safeBlocked(world,P,e);
  const target=visible?P:mobs.filter(m=>m.hp>0&&!m.companion).sort((a,b)=>distance(a,e)-distance(b,e))[0];
  if(target){const d=distance(e,target);if(d>12){const step=Math.min(d,Math.min(72,20+e.t*3)*dt);e.x+=(target.x-e.x)/d*step;e.y+=(target.y-e.y)/d*step}}
  // NPC can be abducted before the player: nearest living wildlife in beam.
  const targets=mobs.filter(m=>m.hp>0&&!m.companion&&distance(m,e)<beamRange&&!safeBlocked(world,m,e)).sort((a,b)=>distance(a,e)-distance(b,e));
  // All nearby animals react; only the locked victim is subject to capture.
  for(const animal of mobs){if(animal.hp<=0||animal.companion||distance(animal,e)>180)continue;
   animal.flee=Math.max(Number(animal.flee)||0,1.8);
   animal.alert=Math.max(Number(animal.alert)||0,1.8);
   animal.lastX=e.x;animal.lastY=e.y;
  }
  // NPCs receive a visible, escapable lock-on instead of instantaneous removal.
  const m=targets[0];
  if(m&&e.t>2.5){
   const id=m.id??m.uid??m;
   const species=String(m.species??m.type??m.kind??m.name??"不明な動物");
   if(e.victim!==id){e.victim=id;e.npcBeam=0}
   e.npcBeam=(e.npcBeam||0)+dt;
   m.flee=Math.max(Number(m.flee)||0,2.8);
   m.alert=Math.max(Number(m.alert)||0,2.8);
   m.lastX=e.x;m.lastY=e.y;
   const d=distance(m,e)||1;
   m.dir=Math.atan2(m.y-e.y,m.x-e.x);
   m.vx=(m.x-e.x)/d*Math.max(105,Number(m.speed)||105);
   m.vy=(m.y-e.y)/d*Math.max(105,Number(m.speed)||105);
   if(e.npcBeam>=2.4&&distance(m,e)<beamRange&&!safeBlocked(world,m,e)){
    m.hp=0;m._killRegistered=true;
    record("NPC誘拐:"+species,year,m.x,m.y);trace("NPC誘拐",year,m.x,m.y);
    // An abduction is removal, not a player kill: leave no edible carcass or hunt reward.
    m._ufoAbducted=true;m.dead=true;m.corpse=false;m.meat=0;m.food=0;
    // Remove from active wildlife to prevent the ordinary death/carcass pipeline from processing it.
    const abductedIndex=mobs.indexOf(m);
    if(abductedIndex!==-1)mobs.splice(abductedIndex,1);
    for(const other of mobs){if(other===m||other.hp<=0||distance(other,m)>260)continue;other.flee=Math.max(Number(other.flee)||0,4.5);other.alert=Math.max(Number(other.alert)||0,4.5);other.lastX=e.x;other.lastY=e.y;}
    world.onEvent?.("ufo-npc-abduction",{year,x:m.x,y:m.y,species,removed:true});
    world.notify("動物が光に吸い込まれた！");e.stage="depart";e.t=0;
   }
  }else{e.victim=null;e.npcBeam=Math.max(0,(e.npcBeam||0)-dt*2)}
  if(distance(P,e)<playerBeamRange&&!P.hidden&&!safeBlocked(world,P,e)){e.beam+=dt;if(e.beam>=2.2){record("UFO捕獲",year,P.x,P.y);world.onEvent?.("ufo-player-abduction",{year,x:P.x,y:P.y});trace("UFO捕獲",year,P.x,P.y);world.notify("円盤に捕獲された！");P.hp=0;world.beginDeath();e.stage="depart";e.t=0}}
  else e.beam=Math.max(0,e.beam-dt*2);
  if(e.t>11){e.stage="depart";e.t=0}
 }
 if(e.stage==="depart"&&e.t>2){event=null;cooldown=Math.max(cooldown,300/3);persist()}
}
function draw(ctx,project,world){
 if(!world||world.mode!=="play")return;
 for(const mark of traces){const q=project(mark.x,mark.y);if(!Number.isFinite(q.x)||!Number.isFinite(q.y))continue;ctx.save();ctx.globalAlpha=Math.max(.08,.6-(mark.age||0)/14400);ctx.strokeStyle="#8ddbf2";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q.x,q.y,19,8,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(q.x-9,q.y-6);ctx.lineTo(q.x+9,q.y+6);ctx.moveTo(q.x+9,q.y-6);ctx.lineTo(q.x-9,q.y+6);ctx.stroke();ctx.restore()}
 if(!event)return;
 const e=event,p=project(e.x,e.y);if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
 const radius=35+Math.sin(e.t*5)*3;
 ctx.save();ctx.translate(p.x,p.y-110);ctx.fillStyle="#1b2837";ctx.strokeStyle="#a5e9ff";ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(0,0,radius,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,-8,19,12,0,Math.PI,Math.PI*2);ctx.fill();ctx.stroke();
 if(e.stage==="scan"){const alpha=.15+.16*Math.sin(e.t*9);ctx.fillStyle="rgba(131,235,252,"+alpha+")";ctx.beginPath();ctx.moveTo(-15,12);ctx.lineTo(-92,110);ctx.lineTo(92,110);ctx.lineTo(15,12);ctx.closePath();ctx.fill();
 ctx.fillStyle="#fff0b2";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("光線から逃げろ！",0,-33);
 if(e.beam>0||e.npcBeam>0){ctx.fillStyle="#ffe0a0";ctx.fillRect(-38,24,76*Math.min(1,Math.max(e.beam/2.2,(e.npcBeam||0)/2.4)),5)}}
 ctx.restore();
}
window.WildUFO={tick,draw,resetTransient,summon,history:()=>history.slice(),abductions:()=>history.filter(h=>h.kind.startsWith("NPC誘拐:")||h.kind==="UFO捕獲"),traces:()=>traces.slice(),saveState:()=>({event,cooldown,traces:traces.slice(-12)}),get active(){return event}};
})();

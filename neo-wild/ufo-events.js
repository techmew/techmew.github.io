/* WILD RECLAIM V1.0 — UFO encounter. Independent of save schema. */
(function(){
"use strict";
const key="wild-reclaim-ufo-events-v1";
let event=null, cooldown=0, history=[], traces=[], alienSites=[];
const MAX_HISTORY=80;
const eraYear=y=>window.WildWorldClock?.eventYear?.(y)??y*3;
const safeBlocked=(world,a,b)=>typeof world.lineBlocked==="function"&&world.lineBlocked(a,b);
const beamRange=95, playerBeamRange=105;
const stateKey="wild-reclaim-ufo-state-v2";
try{const saved=JSON.parse(localStorage.getItem(stateKey)||"null");if(saved&&typeof saved==="object"){cooldown=Math.max(0,(Number(saved.cooldown)||0)/(saved.paceVersion===3?1:3));traces=Array.isArray(saved.traces)?saved.traces.slice(-12):[];alienSites=Array.isArray(saved.alienSites)?saved.alienSites.slice(-4):[];if(saved.event&&["approach","scan","depart"].includes(saved.event.stage))event=saved.event}}catch(_){}
let persistTimer=0;
function persist(){try{localStorage.setItem(stateKey,JSON.stringify({paceVersion:3,event,cooldown,traces:traces.slice(-12),alienSites:alienSites.slice(-4)}))}catch(_){}}
function trace(kind,year,x,y){traces.push({kind,year,x,y,age:0});traces=traces.slice(-12);persist()}
try{const v=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(v))history=v.slice(-MAX_HISTORY)}catch(_){}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function record(kind,year,x,y){history.push({kind,year,x:Math.round(x),y:Math.round(y)});history=history.slice(-MAX_HISTORY);try{localStorage.setItem(key,JSON.stringify(history))}catch(_){}}
function resetTransient(){event=null;cooldown=80/3;persist()}
function summon(x,y,formation=false){event={x,y,t:0,stage:"approach",beam:0,victim:null,npcBeam:0,originX:x,originY:y,formation:!!formation,wingmen:formation?[{dx:-155,dy:85,victim:null,beam:0},{dx:155,dy:-85,victim:null,beam:0}]:[]};persist();return event}
function tick(dt,world){
 if(!world||!world.P||world.mode!=="play")return;
 const {P,mobs,elapsed}=world,year=Math.floor(elapsed/120);
 // Alien observation sites are physical hazards: animals flee, the player can hide or leave.
 for(const site of alienSites){
  site.age+=dt;if(site.age>210)continue;
  // Three distinct alien observation behaviours; old saves default to hostile.
  const disposition=["hostile","neutral","friendly"].includes(site.disposition)?site.disposition:"hostile";
  const d=distance(P,site),visible=!P.hidden&&!safeBlocked(world,P,site);
  site.pulse=(Number(site.pulse)||0)+dt;
  // An observation base deploys a moving scout. Its patrol is a real hazard, not decoration.
  // Patrol position is deterministic from saved age, so reloads cannot teleport it randomly.
  const scout={x:site.x+Math.cos(site.age*.55)*Math.min(105,45+site.age*.35),
               y:site.y+Math.sin(site.age*.55)*Math.min(105,45+site.age*.35)};
  const scoutDistance=distance(P,scout);
  const scoutVisible=!P.hidden&&!safeBlocked(world,P,scout);
  site.scoutX=scout.x;site.scoutY=scout.y;
  if(disposition==="hostile"&&(Number(site.scoutDisrupted)||0)<=0&&scoutDistance<62&&scoutVisible){
   site.scoutCharge=(Number(site.scoutCharge)||0)+dt;
   P.sp=Math.max(0,(Number(P.sp)||0)-dt*2.6);
   if(site.scoutCharge>=3){
    site.scoutCharge=0;
    P.hp=Math.max(0,(Number(P.hp)||0)-Math.max(2,Math.ceil((Number(P.maxHp)||30)*.065)));
    world.notify?.("異星の偵察機が攻撃！ 遮蔽物に隠れろ");
    world.onEvent?.("alien-scout-attack",{year,x:scout.x,y:scout.y});
    if(P.hp<=0)world.beginDeath?.();
   }
  }else site.scoutCharge=Math.max(0,(Number(site.scoutCharge)||0)-dt*2);
  // Scouts interact with actual wildlife as well as the player. Hostile patrols
  // wound nearby animals; neutral patrols observe; friendly patrols aid them.
  site.wildlifePulse=(Number(site.wildlifePulse)||0)+dt;
  if(site.wildlifePulse>=2.8){
   site.wildlifePulse=0;
   const nearby=mobs.filter(m=>m&&m.hp>0&&!m.companion&&!m._ufoAbducted&&distance(m,scout)<78&&!safeBlocked(world,m,scout));
   if(disposition==="hostile"&&(Number(site.scoutDisrupted)||0)<=0){
    const victim=nearby.sort((a,b)=>distance(a,scout)-distance(b,scout))[0];
    if(victim){
     const damage=Math.max(1,Math.ceil((Number(victim.maxHp)||20)*.075));
     victim.hp=Math.max(0,victim.hp-damage);
     victim.flee=Math.max(Number(victim.flee)||0,4);
     victim.alert=Math.max(Number(victim.alert)||0,4);
     victim.lastX=scout.x;victim.lastY=scout.y;
     // The strike also scatters the surrounding herd; cover blocks the panic signal.
     for(const other of mobs){if(other===victim||!other||other.hp<=0||other.companion||distance(other,victim)>155||safeBlocked(world,other,scout))continue;other.flee=Math.max(Number(other.flee)||0,2.5);other.alert=Math.max(Number(other.alert)||0,2.5);other.lastX=scout.x;other.lastY=scout.y;}
     if(victim.hp===0){victim._alienScoutKilled=true;world.onEvent?.("alien-scout-wildlife-kill",{year,x:victim.x,y:victim.y,species:victim.species??victim.type??"wildlife"})}
    }
   }else if(disposition==="friendly"){
    const injured=nearby.filter(m=>Number(m.maxHp)>0&&m.hp<m.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(injured)injured.hp=Math.min(injured.maxHp,injured.hp+Math.max(2,Math.ceil(injured.maxHp*.08)));
   }
  }
  // Nearby alerted wild animals can temporarily disrupt a hostile scout.
  site.scoutDisrupted=Math.max(0,(Number(site.scoutDisrupted)||0)-dt);
  site.herdCounterClock=(Number(site.herdCounterClock)||0)+dt;
  if(disposition==="hostile"&&site.scoutDisrupted<=0&&site.herdCounterClock>=1.6){
   site.herdCounterClock=0;
   const defenders=mobs.filter(m=>m&&m.hp>0&&!m.companion&&!m._ufoAbducted&&
    Number(m.attack??m.atk??m.damage)>0&&distance(m,scout)<68&&!safeBlocked(world,m,scout)&&
    ((Number(m.alert)||0)>0||(Number(m.flee)||0)>0));
   if(defenders.length>=2){
    const strength=defenders.slice(0,5).reduce((sum,m)=>sum+Math.max(1,Number(m.attack??m.atk??m.damage)||1),0);
    const disruption=Math.min(6,1.5+strength*.035);
    site.scoutDisrupted=disruption;
    site.scoutCharge=0;
    site.wildlifePulse=0;
    site.counterattacks=(Number(site.counterattacks)||0)+1;
    world.onEvent?.("alien-scout-herd-counterattack",{year,x:scout.x,y:scout.y,defenders:defenders.length,duration:disruption});
    if(distance(P,scout)<180)world.notify?.("野生動物の群れが偵察機を追い払った！");
   }
  }
  if(disposition==="friendly"&&scoutDistance<75&&scoutVisible&&site.pulse>=4){
   site.pulse=0;
   P.sp=Math.min(Number(P.maxSp)||100,(Number(P.sp)||0)+9);
   world.notify?.("友好的な偵察機が持久力を回復した");
  }
  if(d<145&&visible){
   if(disposition==="hostile"){
    P.sp=Math.max(0,(Number(P.sp)||0)-dt*1.8);
    if(d<75&&site.pulse>=2.5){site.pulse=0;P.hp=Math.max(0,(Number(P.hp)||0)-Math.max(1,Math.ceil((Number(P.maxHp)||30)*.045)));world.notify?.("異星の観測光線を浴びた！");if(P.hp<=0)world.beginDeath?.()}
    if(!site.warned){world.notify?.("危険な異星基地だ！ 身を隠すか離れろ");site.warned=true}
   }else if(disposition==="friendly"){
    if(d<95&&site.pulse>=5){site.pulse=0;const cap=Math.max(Number(P.maxHp)||0,Number(P.hp)||0);P.hp=Math.min(cap,(Number(P.hp)||0)+Math.max(2,Math.round(cap*.06)));world.notify?.("友好的な異星基地が傷を癒した")}
    if(!site.warned){world.notify?.("友好的な異星基地がこちらを観察している");site.warned=true}
   }else if(!site.warned){world.notify?.("中立の異星基地が静かに観測している");site.warned=true}
  }
  for(const m of mobs){if(m.hp<=0||Math.min(distance(m,site),distance(m,scout))>155)continue;
   if(disposition==="hostile"){m.flee=Math.max(Number(m.flee)||0,1.4);m.alert=Math.max(Number(m.alert)||0,1.4);m.lastX=site.x;m.lastY=site.y}
   else if(disposition==="friendly"&&site.pulse>=3&&m.hp<m.maxHp)m.hp=Math.min(m.maxHp,m.hp+dt*1.2);
  }
 }
 alienSites=alienSites.filter(site=>site.age<210);
 traces.forEach(t=>t.age=Math.min(7200,(t.age||0)+dt));traces=traces.filter(t=>t.age<7200);
 persistTimer+=dt;if(persistTimer>2){persistTimer=0;persist()}
 if(!event){cooldown=Math.max(0,cooldown-dt);if(eraYear(year)>=50&&cooldown===0&&Math.random()<dt/(950/3)){const formation=eraYear(year)>=100&&Math.random()<0.085;summon(P.x+240+(Math.random()-.5)*350,P.y+(Math.random()-.5)*420,formation);cooldown=formation?240:420/3;world.notify(formation?"複数の円盤が飛来！ 動物たちが逃げ始めた":"空に正体不明の円盤が現れた！")};return}
 const e=event;e.t+=dt;
 if(e.stage==="approach"&&e.t>=3){e.stage="scan";e.t=0;world.notify("謎の光線！ 遮蔽物に隠れるか逃げろ")}
 if(e.stage==="scan"){
  // The saucer tracks a visible target, but cannot instantly teleport onto it.
  const visible=!P.hidden&&!safeBlocked(world,P,e);
  const target=visible?P:mobs.filter(m=>m.hp>0&&!m.companion).sort((a,b)=>distance(a,e)-distance(b,e))[0];
  if(target){const d=distance(e,target);if(d>12){const step=Math.min(d,Math.min(72,20+e.t*3)*dt);e.x+=(target.x-e.x)/d*step;e.y+=(target.y-e.y)/d*step}}
  // Rare formation: escort saucers independently lock onto wildlife. They never bypass cover.
  if(Array.isArray(e.wingmen))for(const wing of e.wingmen){
   const spot={x:e.x+wing.dx,y:e.y+wing.dy};
   const nearby=mobs.filter(a=>a.hp>0&&!a.companion&&distance(a,spot)<beamRange&&!safeBlocked(world,a,spot)).sort((a,b)=>distance(a,spot)-distance(b,spot));
   const prey=nearby[0],id=prey&&(prey.id??prey.uid??prey);
   if(!prey){wing.victim=null;wing.beam=0;continue}
   if(wing.victim!==id){wing.victim=id;wing.beam=0}
   wing.beam+=dt;
   prey.flee=Math.max(Number(prey.flee)||0,3.5);
   prey.alert=Math.max(Number(prey.alert)||0,3.5);
   prey.lastX=spot.x;prey.lastY=spot.y;
   if(wing.beam<2.8)continue;
   const species=String(prey.species??prey.type??prey.kind??prey.name??"不明な動物");
   prey.hp=0;prey.dead=true;prey._killRegistered=true;prey._ufoAbducted=true;
   prey.corpse=false;prey.meat=0;prey.food=0;
   const idx=mobs.indexOf(prey);if(idx>=0)mobs.splice(idx,1);
   record("NPC誘拐:"+species,year,prey.x,prey.y);
   trace("NPC誘拐",year,prey.x,prey.y);
   world.onEvent?.("ufo-npc-abduction",{year,x:prey.x,y:prey.y,species,removed:true,formation:true});
   for(const other of mobs){if(other.hp>0&&distance(other,prey)<260){other.flee=Math.max(Number(other.flee)||0,4.5);other.alert=Math.max(Number(other.alert)||0,4.5)}}
   world.notify("円盤群が動物を連れ去った！");
   wing.victim=null;wing.beam=0;
  }
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
 if(e.stage==="depart"&&e.t>2){if(e.formation&&alienSites.length<4&&Math.random()<.42){alienSites.push({x:e.originX,y:e.originY,age:0,warned:false,pulse:0,disposition:(Math.random()<.5?"hostile":Math.random()<.6?"neutral":"friendly")});record("異星観測基地",year,e.originX,e.originY);world.onEvent?.("alien-observation-site",{year,x:e.originX,y:e.originY});world.notify?.("円盤が去った跡に奇妙な観測装置が残った")}event=null;cooldown=Math.max(cooldown,300/3);persist()}
}
function draw(ctx,project,world){
 if(!world||world.mode!=="play")return;
 for(const mark of traces){const q=project(mark.x,mark.y);if(!Number.isFinite(q.x)||!Number.isFinite(q.y))continue;ctx.save();ctx.globalAlpha=Math.max(.08,.6-(mark.age||0)/14400);ctx.strokeStyle="#8ddbf2";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q.x,q.y,19,8,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(q.x-9,q.y-6);ctx.lineTo(q.x+9,q.y+6);ctx.moveTo(q.x+9,q.y-6);ctx.lineTo(q.x-9,q.y+6);ctx.stroke();ctx.restore()}
 for(const site of alienSites){const q=project(site.x,site.y);if(!q||!Number.isFinite(q.x)||!Number.isFinite(q.y))continue;ctx.save();ctx.globalAlpha=Math.min(.8,(210-site.age)/30);ctx.strokeStyle="#82f1cb";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q.x,q.y,24,12,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(q.x,q.y-38);ctx.lineTo(q.x-16,q.y);ctx.lineTo(q.x+16,q.y);ctx.closePath();ctx.stroke();
  if(Number.isFinite(site.scoutX)&&Number.isFinite(site.scoutY)){
   const scout=project(site.scoutX,site.scoutY);
   if(scout&&Number.isFinite(scout.x)&&Number.isFinite(scout.y)){
    ctx.strokeStyle=site.disposition==="friendly"?"#90efb1":site.disposition==="neutral"?"#c8d8e8":"#ff9d89";
    ctx.beginPath();ctx.ellipse(scout.x,scout.y-29,12,5,0,0,Math.PI*2);ctx.stroke();
    if(site.disposition==="hostile"&&site.scoutCharge>0){ctx.beginPath();ctx.moveTo(scout.x,scout.y-24);ctx.lineTo(scout.x,scout.y);ctx.stroke()}
   }
  }
  ctx.restore()}
 if(!event)return;
 const e=event,p=project(e.x,e.y);if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
 if(Array.isArray(e.wingmen))for(const wing of e.wingmen){
  const w=project(e.x+wing.dx,e.y+wing.dy);if(!Number.isFinite(w.x)||!Number.isFinite(w.y))continue;
  ctx.save();ctx.translate(w.x,w.y-95);ctx.fillStyle="#273d51";ctx.strokeStyle="#a5e9ff";ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(0,0,26,9,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(e.stage==="scan"){ctx.fillStyle="rgba(131,235,252,0.18)";ctx.beginPath();ctx.moveTo(-10,8);ctx.lineTo(-65,95);ctx.lineTo(65,95);ctx.lineTo(10,8);ctx.fill()}
  ctx.restore();
 }
 const radius=35+Math.sin(e.t*5)*3;
 ctx.save();ctx.translate(p.x,p.y-110);ctx.fillStyle="#1b2837";ctx.strokeStyle="#a5e9ff";ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(0,0,radius,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,-8,19,12,0,Math.PI,Math.PI*2);ctx.fill();ctx.stroke();
 if(e.stage==="scan"){const alpha=.15+.16*Math.sin(e.t*9);ctx.fillStyle="rgba(131,235,252,"+alpha+")";ctx.beginPath();ctx.moveTo(-15,12);ctx.lineTo(-92,110);ctx.lineTo(92,110);ctx.lineTo(15,12);ctx.closePath();ctx.fill();
 ctx.fillStyle="#fff0b2";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("光線から逃げろ！",0,-33);
 if(e.beam>0||e.npcBeam>0){ctx.fillStyle="#ffe0a0";ctx.fillRect(-38,24,76*Math.min(1,Math.max(e.beam/2.2,(e.npcBeam||0)/2.4)),5)}}
 ctx.restore();
}
function resetWorld(){event=null;cooldown=0;history=[];traces=[];alienSites=[];persistTimer=0;try{localStorage.setItem(key,"[]")}catch(_){}persist();return true}
window.WildUFO={tick,draw,resetTransient,resetWorld,summon,history:()=>history.slice(),abductions:()=>history.filter(h=>h.kind.startsWith("NPC誘拐:")||h.kind==="UFO捕獲"),traces:()=>traces.slice(),alienSites:()=>alienSites.slice(),saveState:()=>({event,cooldown,traces:traces.slice(-12),alienSites:alienSites.slice(-4)}),get active(){return event}};
})();

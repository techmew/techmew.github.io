/* WILD RECLAIM: rare wandering apparitions, physical panic and persistent sightings. */
(function(){
"use strict";
const KEY="wild-reclaim-apparitions-v1", MAX=18;
let ghost=null, nextYear=0, sightings=[], persistClock=0;
let hallucinations=[], hallucinationCooldown=0;
const finite=n=>Number.isFinite(Number(n))?Number(n):0;
 const eraYear=y=>window.WildWorldClock?.eventYear?.(y)??y*3;
 const eventDelay=y=>window.WildWorldClock?.eventIntervalYears?.(y)??y/3;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(!s||typeof s!=="object")return;
 nextYear=Math.max(0,finite(s.nextYear));sightings=Array.isArray(s.sightings)?s.sightings.filter(x=>x&&Number.isFinite(x.x)&&Number.isFinite(x.y)).slice(-MAX):[];
 if(s.paceVersion!==3&&sightings.length){const last=Math.max(...sightings.map(h=>Math.max(0,finite(h.year))));nextYear=Math.max(last,last+Math.max(0,nextYear-last)/3);}
  const e=s.ghost;if(e&&["wander","manifest","fade"].includes(e.stage)&&Number.isFinite(e.x)&&Number.isFinite(e.y))ghost={x:e.x,y:e.y,originX:finite(e.originX),originY:finite(e.originY),t:Math.max(0,finite(e.t)),stage:e.stage,seed:finite(e.seed),fear:Math.max(0,finite(e.fear)),kind:["stalker","mimic","wraith"].includes(e.kind)?e.kind:"stalker",pulse:Math.max(0,finite(e.pulse))};
 }catch(_){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify({paceVersion:3,ghost,nextYear,sightings:sightings.slice(-MAX)}))}catch(_){}}
function record(kind,year,x,y){sightings.push({kind,year,x:Math.round(x),y:Math.round(y)});sightings=sightings.slice(-MAX);save()}
function summon(x,y,year=50/3){if(!Number.isFinite(x)||!Number.isFinite(y))return false;
 ghost={x,y,originX:x,originY:y,t:0,stage:"wander",seed:Math.random()*6.28,fear:0,kind:["stalker","mimic","wraith"][Math.floor(Math.random()*3)],pulse:0};
 nextYear=Math.max(nextYear,year+eventDelay(6));save();return true}
function tick(dt,w){
 if(!w||!w.P||w.mode!=="play"||!Number.isFinite(dt)||dt<=0)return;
 const {P,mobs}=w,year=Math.max(0,finite(w.worldYear??w.elapsed/120));
 persistClock+=dt;if(persistClock>=3){persistClock=0;save()}
 hallucinationCooldown=Math.max(0,hallucinationCooldown-dt);
 hallucinations=hallucinations.filter(h=>(h.life-=dt)>0);
 if(!ghost){
  if(eraYear(year)<45||year<nextYear)return;
  // Rare, location-independent encounters; world years rather than frame count control eligibility.
  if(Math.random()>=Math.min(.04,dt/(1450/3)))return;
  const angle=Math.random()*Math.PI*2,r=180+Math.random()*100;
  summon(P.x+Math.cos(angle)*r,P.y+Math.sin(angle)*r,year);
  w.notify("遠くで奇妙な人影が揺れた");return;
 }
 const g=ghost;g.t+=dt;g.pulse=Math.max(0,finite(g.pulse)-dt);
 if(g.stage==="wander"){
  const a=g.seed+g.t*.38;g.x+=Math.cos(a)*dt*12;g.y+=Math.sin(a)*dt*12;
  if(g.t>4){g.stage="manifest";g.t=0;w.notify("冷たい気配が近づいてくる…")}
 }else if(g.stage==="manifest"){
  const d=distance(g,P),blocked=!!w.lineBlocked?.(P,g);
  // Apparitions cannot attack through walls; hiding breaks their pursuit.
  if(!P.hidden&&!blocked&&d<390){
   const speed=g.kind==="wraith"?86:g.kind==="mimic"?72:(d<85?58:76),step=Math.min(d,speed*dt);
   if(d>1){g.x+=(P.x-g.x)/d*step;g.y+=(P.y-g.y)/d*step}
  }
  // Timed counterplay: a directed species attack can repel a manifested spirit.
  // No new UI is needed; the existing attack and special-action inputs apply.
  g.repulseCooldown=Math.max(0,finite(g.repulseCooldown)-dt);
  const striking=(finite(P.swing)>.015||finite(P.attackAction)>.12||finite(P.specialVisual)>.10);
  const special=(finite(P.specialVisual)>.10||finite(P.specialWindup)>.02);
  const strikeRange=special?135:Math.max(55,finite(P.r)*2.9);
  const towardX=g.x-P.x,towardY=g.y-P.y,reach=Math.hypot(towardX,towardY)||1;
  const facing=(towardX*Math.cos(finite(P.dir))+towardY*Math.sin(finite(P.dir)))/reach;
  if(g.repulseCooldown<=0&&striking&&reach<strikeRange&&facing>(special?.12:.55)&&!w.lineBlocked?.(P,g)){
   g.repulseCooldown=special?7:4;
   g.fear=0;
   const shove=special?145:85;
   const tx=g.x+towardX/reach*shove,ty=g.y+towardY/reach*shove;
   if(!w.lineBlocked?.(g,{x:tx,y:ty})){g.x=tx;g.y=ty;}
   g.t+=special?8:3;
   if(special){g.stage="fade";g.t=0;}
   w.notify?.(special?"固有技で亡霊を退散させた！":"攻撃で亡霊を押し返した！");
   w.onEvent?.("ghost-repelled",{year,kind:g.kind,special,x:g.x,y:g.y});
  }
  const near=distance(g,P),exposed=!P.hidden&&!w.lineBlocked?.(P,g)&&near<66;
  if(exposed){
   g.fear=Math.min(3,g.fear+dt);
   if(g.fear>=1.15 && !(P.ghostPossessedUntil>0)){
    const duration=g.kind==="wraith"?6:g.kind==="mimic"?5.2:4.8;
    P.ghostPossessedUntil=duration;
    P.ghostWanderAngle=Math.random()*Math.PI*2;
    P.ghostWanderClock=0;
    P.hauntedTime=Math.max(finite(P.hauntedTime),duration);
    g.stage="fade";g.t=0;
    w.onPossession?.(duration,g.kind);
    w.notify("霊に乗り移られた！ 操作不能");
    w.onEvent?.("ghost-possession",{year,kind:g.kind,duration});
   }
  }else g.fear=Math.max(0,g.fear-dt*1.7);
  // Prolonged exposure produces phantom silhouettes, never real enemies.
  // Cover and hiding halt new hallucinations, so evasion remains actionable.
  if(exposed&&g.fear>.8&&hallucinationCooldown<=0){
   hallucinationCooldown=(g.kind==="mimic"?1.2:2.8)+Math.random()*2;
   const a=Math.random()*Math.PI*2, radius=65+Math.random()*100;
   hallucinations.push({x:P.x+Math.cos(a)*radius,y:P.y+Math.sin(a)*radius,life:2.8,maxLife:2.8,seed:Math.random()*6.28});
   hallucinations=hallucinations.slice(-3);
   w.notify("視界に幻影が現れた");w.onEvent?.("ghost-hallucination",{year});
  }

  // The stalker hunts by disappearing into the player's blind side. It cannot
  // phase through a wall, enter the player's cover, or teleport on top of them.
  if(g.kind==="stalker"&&g.pulse<=0&&!P.hidden&&near>125&&near<330){
   const facing=Number.isFinite(P.dir)?P.dir:Math.atan2(P.y-g.y,P.x-g.x);
   const side=Math.sin(g.seed+g.t*1.3)>0?1:-1;
   const a=facing+Math.PI+side*.56;
   const target={x:P.x+Math.cos(a)*112,y:P.y+Math.sin(a)*112};
   if(!w.lineBlocked?.(P,target)&&!w.lineBlocked?.(g,target)){
    hallucinations.push({x:g.x,y:g.y,life:2.5,maxLife:2.5,seed:g.seed});
    hallucinations=hallucinations.slice(-3);
    g.x=target.x;g.y=target.y;g.pulse=7.8;g.fear=0;
    w.onEvent?.("ghost-shadow-step",{year,x:g.x,y:g.y});
    w.notify?.("背後から冷たい視線を感じる…");
   }
  }
  // Wraiths sap stamina before taking control. Hiding and solid walls
  // prevent this; the drain has a strict rate and cannot kill the player.
  if(g.kind==="wraith"&&exposed&&!(P.ghostPossessedUntil>0)){
   const drain=Math.min(Math.max(0,finite(P.sp)),dt*4.5);
   P.sp=Math.max(0,finite(P.sp)-drain);
   P.hauntedTime=Math.max(finite(P.hauntedTime),1.2);
  }
  // A wraith haunts one ordinary wild animal. Owned/released individuals are protected.
  if(g.kind==="wraith"&&g.pulse<=0){
   const candidates=(mobs||[]).filter(m=>m&&m.hp>0&&!m.dead&&!m.companion&&!m.ownedId&&!m.releasedId&&!m.wildReleaseId&&!m.strongBoss&&distance(m,g)<125);
   candidates.sort((a,b)=>distance(a,g)-distance(b,g));
   const victim=candidates[0];
   if(victim&&!w.lineBlocked?.(victim,g)){
    g.pulse=5.5;
    victim.hauntedTime=Math.max(finite(victim.hauntedTime),3.2);
    victim.flee=Math.max(finite(victim.flee),3.2);
    victim.alert=Math.max(finite(victim.alert),3.2);
    victim.lastX=g.x;victim.lastY=g.y;
    // A possessed wild animal actively breaks away from the spirit; the existing
    // navigation AI continues handling walls, water and later movement.
    const fleeAngle=Math.atan2(victim.y-g.y,victim.x-g.x);
    const fleeSpeed=Math.max(85,Math.hypot(finite(victim.vx),finite(victim.vy)));
    victim.dir=fleeAngle;
    victim.vx=Math.cos(fleeAngle)*fleeSpeed;
    victim.vy=Math.sin(fleeAngle)*fleeSpeed;
    victim.hp=Math.max(1,victim.hp-Math.min(5,Math.max(1,victim.hp*.08)));
    w.onEvent?.("ghost-animal-haunt",{year,x:victim.x,y:victim.y,species:victim.type||victim.species||"unknown"});
    w.notify?.("亡霊が野生動物に取り憑いた！");
   }
  }
  // A mimic changes position, leaving a short-lived phantom decoy.
  if(g.kind==="mimic"&&g.pulse<=0&&near<260&&!P.hidden){
   const angle=g.seed+g.t*2.7,tx=P.x+Math.cos(angle)*125,ty=P.y+Math.sin(angle)*125;
   if(!w.lineBlocked?.({x:tx,y:ty},g)){
    hallucinations.push({x:g.x,y:g.y,life:3.4,maxLife:3.4,seed:g.seed});
    hallucinations=hallucinations.slice(-3);
    g.x=tx;g.y=ty;g.pulse=5;
    w.onEvent?.("ghost-mimic",{year,x:g.x,y:g.y});
   }
  }
  // The mimic projects a false predator call: nearby ordinary wildlife scatters,
  // while strong bosses and owned/released animals remain unaffected.
  if(g.kind==="mimic"&&g.stage==="manifest"&&g.pulse>0&&g.pulse<4.8){
   for(const m of mobs||[]){
    if(!m||!Number.isFinite(m.x)||!Number.isFinite(m.y)||!(m.hp>0)||m.dead||m.companion||m.ownedId||m.releasedId||m.wildReleaseId||m.strongBoss)continue;
    const d=distance(m,g);if(d>230||w.lineBlocked?.(m,g))continue;
    m.flee=Math.max(finite(m.flee),2.4);
    m.alert=Math.max(finite(m.alert),2.4);
    m.lastX=g.x;m.lastY=g.y;
   }
  }
  // Nearby animals react in their existing flee/navigation AI rather than visual-only effects.
  for(const m of mobs||[]){
   // Never override the movement of owned, permanently released, or boss animals.
   // Walls also block the panic stimulus, consistent with the possession rules.
   if(!m||!Number.isFinite(m.x)||!Number.isFinite(m.y)||!(m.hp>0)||m.dead||m.companion||m.ownedId||m.releasedId||m.wildReleaseId||m.strongBoss||distance(m,g)>150||w.lineBlocked?.(m,g))continue;
   const a=Math.atan2(m.y-g.y,m.x-g.x);
   m.flee=Math.max(finite(m.flee),1.6);m.alert=Math.max(finite(m.alert),1.5);
   m.lastX=g.x;m.lastY=g.y;m.wander=0;
   m.dir=a;
   const escapeSpeed=Math.max(70,Math.hypot(finite(m.vx),finite(m.vy)));
   m.vx=Math.cos(a)*escapeSpeed;m.vy=Math.sin(a)*escapeSpeed;
  }
  if(g.t>22||distance(g,P)>650){g.stage="fade";g.t=0}
 }else if(g.t>2){record("亡霊遭遇",year,g.x,g.y);ghost=null;nextYear=year+eventDelay(8+Math.random()*15);save()}
}
function draw(ctx,project,w){
 if(!w||w.mode!=="play")return;
 ctx.save();
 for(const h of hallucinations){
  const v=project(h.x,h.y);if(!v||!Number.isFinite(v.x)||!Number.isFinite(v.y))continue;
  const alpha=Math.max(0,Math.min(.4,h.life/h.maxLife*.38));
  ctx.globalAlpha=alpha;ctx.fillStyle="#9ad1e3";ctx.shadowColor="#b8dfff";ctx.shadowBlur=9;
  ctx.beginPath();ctx.ellipse(v.x,v.y-26+Math.sin(h.life*6+h.seed)*4,10,23,0,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
 // The spirit remains visible as an aura after it enters the player's body.
 if(w.P?.ghostPossessedUntil>0){
  const p=project(w.P.x,w.P.y);
  if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){
   const pulse=.45+.25*Math.sin(Date.now()*.009);
   ctx.save();ctx.globalAlpha=pulse;ctx.strokeStyle="#b9dcff";ctx.shadowColor="#a4e6ff";ctx.shadowBlur=19;ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(p.x,p.y-20,19,31,0,0,Math.PI*2);ctx.stroke();
   ctx.lineWidth=1;ctx.globalAlpha=pulse*.55;ctx.beginPath();ctx.ellipse(p.x,p.y-20,26,39,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
 }
 if(!ghost)return;
 const g=ghost,q=project(g.x,g.y);if(!q||!Number.isFinite(q.x)||!Number.isFinite(q.y))return;
 const alpha=g.stage==="fade"?Math.max(0,1-g.t/2):g.stage==="wander"?.30:.82;
 const t=g.t*3+g.seed,bob=Math.sin(t)*4;
 const hue=g.kind==="wraith"?"#c8b7ff":g.kind==="mimic"?"#b4f9d7":"#b5dbf3";
 const glow=g.kind==="wraith"?"#967fe4":g.kind==="mimic"?"#7edec6":"#91d9ff";
 ctx.save();ctx.translate(q.x,q.y-16);ctx.globalAlpha=alpha;ctx.shadowColor=glow;ctx.shadowBlur=15;
 // Fog sheath and three flowing, torn lower hems; no legs or walking gait.
 const halo=ctx.createRadialGradient(0,-10+bob,2,0,-4+bob,50);
 halo.addColorStop(0,"rgba(184,225,247,.24)");halo.addColorStop(1,"rgba(105,160,204,0)");
 ctx.fillStyle=halo;ctx.beginPath();ctx.ellipse(0,-2+bob,34,51,0,0,Math.PI*2);ctx.fill();
 for(let i=-1;i<=1;i++){
  const sway=Math.sin(t*.66+i*1.8)*7;
  ctx.fillStyle=i===0?hue:glow;ctx.globalAlpha=alpha*(i===0?.31:.20);
  ctx.beginPath();ctx.moveTo(i*9-8,-3+bob);ctx.quadraticCurveTo(i*14+sway,19+bob,i*16+sway,34+bob+Math.sin(t+i)*5);
  ctx.quadraticCurveTo(i*15+sway-10,22+bob,i*8+4,-5+bob);ctx.closePath();ctx.fill();
 }
 ctx.globalAlpha=alpha*.66;ctx.fillStyle=hue;
 ctx.beginPath();ctx.moveTo(-15,-18+bob);ctx.bezierCurveTo(-26,-1+bob,-17,13+bob,-9,22+bob);
 ctx.quadraticCurveTo(0,29+bob,5,20+bob);ctx.quadraticCurveTo(24,9+bob,15,-18+bob);ctx.closePath();ctx.fill();
 // Wide broken sleeves and long spectral hands distinguish the silhouette.
 ctx.strokeStyle=hue;ctx.lineCap="round";ctx.lineWidth=7;ctx.globalAlpha=alpha*.76;
 ctx.beginPath();ctx.moveTo(-11,-13+bob);ctx.quadraticCurveTo(-26,-12+bob,-27,6+bob);ctx.moveTo(11,-13+bob);ctx.quadraticCurveTo(27,-12+bob,27,7+bob);ctx.stroke();
 ctx.lineWidth=1.7;ctx.globalAlpha=alpha*.9;ctx.beginPath();
 for(const side of [-1,1])for(let finger=0;finger<3;finger++){
  const x=side*(26+finger*2),y=6+finger*4+bob;
  ctx.moveTo(side*27,5+bob);ctx.quadraticCurveTo(x+Math.sin(t+finger)*3,y+8,x,y+10);
 }ctx.stroke();
 // A shaded hood, hollow face, brows, and two independently flickering eyes.
 ctx.globalAlpha=alpha;ctx.fillStyle=hue;ctx.shadowBlur=22;
 ctx.beginPath();ctx.moveTo(-15,-24+bob);ctx.quadraticCurveTo(-16,-53+bob,0,-54+bob);
 ctx.quadraticCurveTo(19,-51+bob,17,-23+bob);ctx.quadraticCurveTo(0,-10+bob,-15,-24+bob);ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle="#1e3545";ctx.globalAlpha=alpha*.92;
 ctx.beginPath();ctx.ellipse(0,-32+bob,10.5,14,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle="#547086";ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(-11,-41+bob);ctx.lineTo(-5,-46+bob);ctx.moveTo(11,-41+bob);ctx.lineTo(5,-46+bob);ctx.stroke();
 ctx.globalAlpha=alpha*(.7+.3*Math.sin(t*1.6)**2);ctx.fillStyle="#f1fcff";ctx.shadowColor=glow;ctx.shadowBlur=8;
 ctx.beginPath();ctx.ellipse(-5,-34+bob,2.3,3.5,-.18,0,Math.PI*2);ctx.ellipse(5,-34+bob,2.3,3.5,.18,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.strokeStyle="#bce7ed";ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(-3,-22+bob);ctx.quadraticCurveTo(0,-19+bob,3,-22+bob);ctx.stroke();
 // Orbiting embers visually communicate pursuit and instability.
 for(let i=0;i<4;i++){
  const a=t*.42+i*Math.PI/2,r=23+i%2*9;
  ctx.globalAlpha=alpha*(.25+.18*Math.sin(t+i)**2);ctx.fillStyle=glow;
  ctx.beginPath();ctx.arc(Math.cos(a)*r,-16+bob+Math.sin(a)*19,1.5+i%2,0,Math.PI*2);ctx.fill();
 }
 if(g.stage==="manifest"){
  ctx.globalAlpha=alpha;ctx.textAlign="center";ctx.font="bold 12px sans-serif";ctx.fillStyle="#effaff";
  ctx.fillText(g.kind==="wraith"?"憑依霊":g.kind==="mimic"?"幻惑霊":"亡霊",0,-65+bob);
 }
 ctx.restore();
}
load();
window.WildApparitions={tick,draw,summon,history:()=>sightings.slice(),saveState:()=>({ghost,nextYear,sightings:sightings.slice(-MAX)}),get active(){return ghost},resetWorld(){ghost=null;nextYear=0;sightings=[];persistClock=0;hallucinations=[];hallucinationCooldown=0;save();return true;},debugClear(){ghost=null;hallucinations=[];hallucinationCooldown=0;save();return true;},get hallucinationCount(){return hallucinations.length}};
})();
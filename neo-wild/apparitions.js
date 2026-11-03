/* WILD RECLAIM: rare wandering apparitions, physical panic and persistent sightings. */
(function(){
"use strict";
const KEY="wild-reclaim-apparitions-v1", MAX=18;
let ghost=null, nextYear=0, sightings=[], persistClock=0;
let hallucinations=[], hallucinationCooldown=0;
const finite=n=>Number.isFinite(Number(n))?Number(n):0;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(!s||typeof s!=="object")return;
 nextYear=Math.max(0,finite(s.nextYear));sightings=Array.isArray(s.sightings)?s.sightings.filter(x=>x&&Number.isFinite(x.x)&&Number.isFinite(x.y)).slice(-MAX):[];
 const e=s.ghost;if(e&&["wander","manifest","fade"].includes(e.stage)&&Number.isFinite(e.x)&&Number.isFinite(e.y))ghost={x:e.x,y:e.y,originX:finite(e.originX),originY:finite(e.originY),t:Math.max(0,finite(e.t)),stage:e.stage,seed:finite(e.seed),fear:Math.max(0,finite(e.fear))};
 }catch(_){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify({ghost,nextYear,sightings:sightings.slice(-MAX)}))}catch(_){}}
function record(kind,year,x,y){sightings.push({kind,year,x:Math.round(x),y:Math.round(y)});sightings=sightings.slice(-MAX);save()}
function summon(x,y,year=50){if(!Number.isFinite(x)||!Number.isFinite(y))return false;
 ghost={x,y,originX:x,originY:y,t:0,stage:"wander",seed:Math.random()*6.28,fear:0};
 nextYear=Math.max(nextYear,year+6);save();return true}
function tick(dt,w){
 if(!w||!w.P||w.mode!=="play"||!Number.isFinite(dt)||dt<=0)return;
 const {P,mobs}=w,year=Math.max(0,finite(w.worldYear??w.elapsed/120));
 persistClock+=dt;if(persistClock>=3){persistClock=0;save()}
 hallucinationCooldown=Math.max(0,hallucinationCooldown-dt);
 hallucinations=hallucinations.filter(h=>(h.life-=dt)>0);
 if(!ghost){
  if(year<45||year<nextYear)return;
  // Rare, location-independent encounters; world years rather than frame count control eligibility.
  if(Math.random()>=Math.min(.04,dt/1450))return;
  const angle=Math.random()*Math.PI*2,r=180+Math.random()*100;
  summon(P.x+Math.cos(angle)*r,P.y+Math.sin(angle)*r,year);
  w.notify("遠くで奇妙な人影が揺れた");return;
 }
 const g=ghost;g.t+=dt;
 if(g.stage==="wander"){
  const a=g.seed+g.t*.38;g.x+=Math.cos(a)*dt*12;g.y+=Math.sin(a)*dt*12;
  if(g.t>4){g.stage="manifest";g.t=0;w.notify("冷たい気配が近づいてくる…")}
 }else if(g.stage==="manifest"){
  const d=distance(g,P),blocked=!!w.lineBlocked?.(P,g);
  // Apparitions cannot attack through walls; hiding breaks their pursuit.
  if(!P.hidden&&!blocked&&d<280){
   const speed=d<80?16:24,step=Math.min(d,speed*dt);
   if(d>1){g.x+=(P.x-g.x)/d*step;g.y+=(P.y-g.y)/d*step}
  }
  const near=distance(g,P),exposed=!P.hidden&&!w.lineBlocked?.(P,g)&&near<90;
  if(exposed){g.fear=Math.min(3,g.fear+dt);if(g.fear>=1.4){
   // Possession is a temporary movement penalty, not an unavoidable instant death.
   P.hauntedTime=Math.max(finite(P.hauntedTime),2.6);
   P.sp=Math.max(0,finite(P.sp)-dt*4);
   if(g.fear<1.4+dt){w.notify("憑依された！ 離れて振り切れ");w.onEvent?.("ghost-possession",{year});}
  }}else g.fear=Math.max(0,g.fear-dt*1.7);
  // Prolonged exposure produces phantom silhouettes, never real enemies.
  // Cover and hiding halt new hallucinations, so evasion remains actionable.
  if(exposed&&g.fear>.8&&hallucinationCooldown<=0){
   hallucinationCooldown=2.8+Math.random()*3;
   const a=Math.random()*Math.PI*2, radius=65+Math.random()*100;
   hallucinations.push({x:P.x+Math.cos(a)*radius,y:P.y+Math.sin(a)*radius,life:2.8,maxLife:2.8,seed:Math.random()*6.28});
   hallucinations=hallucinations.slice(-3);
   w.notify("視界に幻影が現れた");w.onEvent?.("ghost-hallucination",{year});
  }
  // Nearby animals react in their existing flee/navigation AI rather than visual-only effects.
  for(const m of mobs||[]){if(!m||m.hp<=0||m.companion||distance(m,g)>150)continue;
   const a=Math.atan2(m.y-g.y,m.x-g.x);
   m.flee=Math.max(finite(m.flee),1.6);m.alert=Math.max(finite(m.alert),1.5);
   m.lastX=g.x;m.lastY=g.y;m.wander=0;
   if(!m.strongBoss){m.dir=a;m.vx=Math.cos(a)*Math.max(70,finite(m.vx));m.vy=Math.sin(a)*Math.max(70,finite(m.vy))}
  }
  if(g.t>14||distance(g,P)>650){g.stage="fade";g.t=0}
 }else if(g.t>2){record("亡霊遭遇",year,g.x,g.y);ghost=null;nextYear=year+8+Math.random()*15;save()}
}
function draw(ctx,project,w){
 if(!w||w.mode!=="play")return;
 ctx.save();
 for(const h of hallucinations){const v=project(h.x,h.y);if(!v||!Number.isFinite(v.x)||!Number.isFinite(v.y))continue;
  const alpha=Math.max(0,Math.min(.4,h.life/h.maxLife*.38));
  ctx.globalAlpha=alpha;ctx.fillStyle="#9ad1e3";ctx.shadowColor="#b8dfff";ctx.shadowBlur=9;
  ctx.beginPath();ctx.ellipse(v.x,v.y-26+Math.sin(h.life*6+h.seed)*4,10,23,0,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
 if(!ghost)return;
 const g=ghost,q=project(g.x,g.y);if(!q||!Number.isFinite(q.x)||!Number.isFinite(q.y))return;
 const alpha=g.stage==="fade"?Math.max(0,1-g.t/2):g.stage==="wander"?.28:.62;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(q.x,q.y-18);
 const bob=Math.sin(g.t*3)*6;ctx.fillStyle="#a4c9df";ctx.shadowColor="#8dc9f2";ctx.shadowBlur=18;
 ctx.beginPath();ctx.ellipse(0,-26+bob,12,15,0,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.moveTo(-15,-16+bob);ctx.quadraticCurveTo(-25,20+bob,-5,15+bob);ctx.quadraticCurveTo(15,27+bob,19,8+bob);ctx.lineTo(14,-16+bob);ctx.closePath();ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle="#183048";ctx.fillRect(-7,-30+bob,4,3);ctx.fillRect(4,-30+bob,4,3);
 if(g.stage==="manifest"){ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.fillStyle="#d7edff";ctx.fillText("亡霊",0,-56+bob)}
 ctx.restore();
}
load();
window.WildApparitions={tick,draw,summon,history:()=>sightings.slice(),saveState:()=>({ghost,nextYear,sightings:sightings.slice(-MAX)}),get active(){return ghost},debugClear(){ghost=null;hallucinations=[];hallucinationCooldown=0;save();return true;},get hallucinationCount(){return hallucinations.length}};
})();
/* WILD RECLAIM: persistent local earthquake and fallen-tree ecology. */
(function(){
"use strict";
const KEY="wild_reclaim_disasters_v1",MAX=12;
let events=[],nextYear=.45+Math.random()*.60,warning=null,lastYear=0;
let seismicSeconds=0,seismicPhase=0;
let nextFloodYear=1.8+Math.random()*1.5,floodWarning=null,history=[];
let nextFireYear=2.8+Math.random()*2.8,fireWarning=null;
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
function restore(){
 try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(!x)return;
 events=Array.isArray(x.events)?x.events.filter(e=>e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.year)).slice(-MAX):[];
 nextYear=Math.max(0,finite(x.nextYear,.65));lastYear=Math.max(0,finite(x.lastYear,0));
 // Existing saves created with the old long odds should enter the denser
 // event cycle without erasing prior disasters or restarting world years.
 nextYear=Math.min(nextYear,lastYear+.85);
 warning=x.warning&&Number.isFinite(x.warning.x)?x.warning:null;
 nextFloodYear=Math.min(Math.max(0,finite(x.nextFloodYear,2.4)),lastYear+2.5);
 floodWarning=x.floodWarning&&Number.isFinite(x.floodWarning.x)&&Number.isFinite(x.floodWarning.y)?x.floodWarning:null;
 history=Array.isArray(x.history)?x.history.filter(e=>e&&Number.isFinite(e.year)&&["fallen_tree","flood","wildfire"].includes(e.kind)).slice(-60):[];
 nextFireYear=Math.min(Math.max(0,finite(x.nextFireYear,3.5)),lastYear+3.8);
 fireWarning=x.fireWarning&&Number.isFinite(x.fireWarning.x)&&Number.isFinite(x.fireWarning.y)?x.fireWarning:null;
 }catch(_){}
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({events,nextYear,lastYear,warning,nextFloodYear,floodWarning,nextFireYear,fireWarning,history}));}catch(_){}}
function active(e,year){return e.permanent||year-e.year<e.duration;}
function blocked(x,y,r,year){return events.some(e=>e.kind==="fallen_tree"&&active(e,year)&&Math.hypot(x-e.x,y-e.y)<e.radius+r);}
function floodDepth(x,y,year){
 let depth=0;
 for(const e of events){
  if(e.kind!=="flood"||!active(e,year))continue;
  const d=Math.hypot(x-e.x,y-e.y);
  if(d>=e.radius)continue;
  // Shallow inundation grows and recedes; a dry way around remains outside the limited circle.
  const age=Math.max(0,year-e.year);
  const scale=Math.min(1,(age+.10)/.28,Math.max(0,(e.duration-age)/.35));
  depth=Math.max(depth,Math.min(.85,(1-d/e.radius)*1.4*scale));
 }
 return depth;
}
function fireIntensity(x,y,year){
 let intensity=0;
 for(const e of events)if(e.kind==="wildfire"&&active(e,year)){
  const d=Math.hypot(x-e.x,y-e.y),age=Math.max(0,year-e.year);
  if(d>=e.radius)continue;
  const ramp=Math.min(1,(age+.04)/.16),cool=Math.min(1,Math.max(0,(e.duration-age)/.25));
  intensity=Math.max(intensity,(1-d/e.radius)*ramp*cool);
 }
 return intensity;
}
function habitatQuality(x,y,year){
 let quality=1;
 for(const e of events){
  if(e.kind!=="wildfire")continue;
  const distance=Math.hypot(x-e.x,y-e.y),age=year-e.year;
  if(distance>=e.radius||age<0||age>e.duration+7)continue;
  const recovery=Math.max(0,Math.min(1,(age-e.duration)/7));
  quality=Math.min(quality,1-.94*(1-recovery)*(1-distance/e.radius));
 }
 return Math.max(.06,Math.min(1,quality));
}
function scheduleFire(api,year,forcedPosition=null){
 if(fireWarning||events.some(e=>e.kind==="wildfire"&&active(e,year)))return false;
 if(api.weather==="RAIN"||api.weather==="THUNDER")return false;
 const r=118,{WORLD,P,collides,roadsX=[],roadsY=[],buildings=[]}=api;
 const valid=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)&&x>r+140&&y>r+140&&
 x<WORLD.w-r-140&&y<WORLD.h-r-140&&Math.hypot(x-P.x,y-P.y)>r+180&&
 !roadsX.some(v=>Math.abs(v-x)<r+75)&&!roadsY.some(v=>Math.abs(v-y)<r+75)&&
 !buildings.some(b=>x>b.x-r-40&&x<b.x+b.w+r+40&&y>b.y-r-40&&y<b.y+b.h+r+40)&&
 !collides(x,y,18,null,true)&&
 [[r+60,0],[-r-60,0],[0,r+60],[0,-r-60]].filter(([dx,dy])=>!collides(x+dx,y+dy,18,null,true)).length>=3;
 let spot=forcedPosition&&valid(forcedPosition.x,forcedPosition.y)?forcedPosition:null;
 if(!spot)for(let k=0;k<80;k++){
  const x=250+Math.random()*Math.max(1,WORLD.w-500);
  const y=2600+Math.random()*Math.max(1,WORLD.h-2900);
  if(valid(x,y)){spot={x,y};break;}
 }
 if(!spot)return false;
 fireWarning={x:spot.x,y:spot.y,radius:r,seconds:7,year};
 announceEscape(fireWarning,api.mobs);
 if(Math.hypot(P.x-spot.x,P.y-spot.y)<1100)api.notify("焦げた臭いがする。山火事に警戒");
 persist();return true;
}
function announceEscape(event,mobs){
 for(const m of mobs||[]){
  if(!m||m.hp<=0||!Number.isFinite(m.x)||!Number.isFinite(m.y))continue;
  if(Math.hypot(m.x-event.x,m.y-event.y)>event.radius+180)continue;
  m.flee=Math.max(m.flee||0,4.2);
  m.fleeThreatX=event.x;m.fleeThreatY=event.y;
  m.dir=Math.atan2(m.y-event.y,m.x-event.x);
  m.resting=false;m.restTime=0;m.foragePose=0;
 }
}
function floodSite(x,y,r,api){
 const {WORLD,P,collides,roadsX=[],roadsY=[],buildings=[]}=api;
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<r+105||y<r+105||x>WORLD.w-r-105||y>WORLD.h-r-105)return false;
 // Reserve existing roads/bridges as permanent dry detours.
 if(roadsX.some(v=>Math.abs(x-v)<r+70)||roadsY.some(v=>Math.abs(y-v)<r+70))return false;
 if(P&&Math.hypot(x-P.x,y-P.y)<r+135)return false;
 if(buildings.some(b=>{
  const bx=Math.max(b.x,Math.min(x,b.x+b.w)),by=Math.max(b.y,Math.min(y,b.y+b.h));
  return Math.hypot(x-bx,y-by)<r+18;
 }))return false;
 if(collides(x,y,14,null,true))return false;
 // Do not create a flooded circle whose outer edge is walled in.
 const open=[[r+40,0],[-r-40,0],[0,r+40],[0,-r-40]]
  .filter(([dx,dy])=>!collides(x+dx,y+dy,20)).length;
 return open>=3;
}
function scheduleFlood(api,year,forcedPosition=null){
 if(floodWarning||events.some(e=>e.kind==="flood"&&active(e,year)))return false;
 const radius=122;
 let spot=null;
 if(forcedPosition&&floodSite(forcedPosition.x,forcedPosition.y,radius,api))spot=forcedPosition;
 const {riverAxis,canalAxis}=api;
 if(!spot&&typeof riverAxis==="function"&&typeof canalAxis==="function"){
  for(let k=0;k<54;k++){
   const river=k%2===0;
   const along=river?260+Math.random()*1980:5740+Math.random()*2480;
   const side=Math.random()<.5?-1:1,offset=river?145:120;
   const x=river?riverAxis(along)+side*offset:along;
   const y=river?along:canalAxis(along)+side*offset;
   if(floodSite(x,y,radius,api)){spot={x,y};break;}
  }
 }
 if(!spot)return false;
 floodWarning={x:spot.x,y:spot.y,year,seconds:6,radius};
 if(Math.hypot(api.P.x-spot.x,api.P.y-spot.y)<1100)api.notify("川の水位が急上昇！高台へ避難");
 announceEscape({x:spot.x,y:spot.y,radius},api.mobs);
 persist();return true;
}
function safeSite(x,y,api){const {P,collides,WORLD}=api;
 if(x<120||y<120||x>WORLD.w-120||y>WORLD.h-120)return false;
 if(Math.hypot(x-P.x,y-P.y)<230)return false;
 // Keep main paths and entrances passable: no debris on an already blocked site.
 if(collides(x,y,34))return false;
 // Reserve a wide clear bypass on every side; never create a complete barrier.
 return [[0,110],[0,-110],[110,0],[-110,0]].filter(([dx,dy])=>!collides(x+dx,y+dy,24)).length>=3;
}
function schedule(api,year){
 const {P}=api;for(let k=0;k<22;k++){
  const angle=Math.random()*Math.PI*2,distance=340+Math.random()*430;
  const x=Math.round(P.x+Math.cos(angle)*distance),y=Math.round(P.y+Math.sin(angle)*distance);
  if(safeSite(x,y,api)){warning={x,y,year,seconds:4.5};api.notify("地鳴りがする。倒木に注意");persist();return true;}
 }
 nextYear=year+2;persist();return false;
}
function tick(dt,api){
 if(!api?.P||api.mode!=="play")return;
 const year=api.elapsed/120;
 seismicSeconds=Math.max(0,seismicSeconds-dt);
 if(year<lastYear)lastYear=year; // Old SAVE_SCHEMA2 resumes must not erase world history.
 if(warning){
  warning.seconds-=dt;
  if(warning.seconds<=0){
   const e={x:warning.x,y:warning.y,year,kind:"fallen_tree",radius:34,duration:5+Math.random()*9,permanent:false};
   events.push(e);events=events.slice(-MAX);warning=null;
   history.push({kind:e.kind,year:e.year,x:e.x,y:e.y});history=history.slice(-60);
   seismicSeconds=3.4;seismicPhase=Math.random()*Math.PI*2;
   api.notify("地震発生！倒木と地割れに警戒");
   for(const m of api.mobs||[])if(m.hp>0&&Math.hypot(m.x-e.x,m.y-e.y)<210){
    const a=Math.atan2(m.y-e.y,m.x-e.x);m.flee=Math.max(m.flee||0,3.6);m.fleeThreatX=e.x;m.fleeThreatY=e.y;m.dir=a;m.resting=false;m.restTime=0;
   }
   persist();
  }
 }else if(year>=nextYear){
  nextYear=year+.48+Math.random()*.80;
  if(!floodWarning&&!fireWarning)schedule(api,year);
 }
 if(floodWarning){
  floodWarning.seconds-=dt;
  if(floodWarning.seconds<=0){
   const event={kind:"flood",x:floodWarning.x,y:floodWarning.y,radius:floodWarning.radius,
     year,duration:1.4+Math.random()*2.1,permanent:false};
   events.push(event);events=events.slice(-MAX);
   history.push({kind:"flood",year,x:event.x,y:event.y});history=history.slice(-60);
   floodWarning=null;
   announceEscape(event,api.mobs);
   if(Math.hypot(api.P.x-event.x,api.P.y-event.y)<1100)api.notify("河川が氾濫。冠水した道を迂回");
   persist();
  }
 }else if(year>=nextFloodYear){
  nextFloodYear=year+1.6+Math.random()*2.0;
  if(!warning&&!fireWarning)scheduleFlood(api,year);persist();
 }
 // Animals already in the expanding water retreat; no teleport or damage without warning.
 for(const e of events)if(e.kind==="flood"&&active(e,year)){
  for(const m of api.mobs||[])if(m?.hp>0&&floodDepth(m.x,m.y,year)>.1){
   m.flee=Math.max(m.flee||0,2.0);m.fleeThreatX=e.x;m.fleeThreatY=e.y;
  }
 }
 if(fireWarning){
  fireWarning.seconds-=dt;
  if(fireWarning.seconds<=0){
   const e={kind:"wildfire",x:fireWarning.x,y:fireWarning.y,radius:fireWarning.radius,
    year,duration:1.2+Math.random()*1.5,permanent:false};
   events.push(e);events=events.slice(-MAX);
   history.push({kind:e.kind,year,x:e.x,y:e.y});history=history.slice(-60);
   fireWarning=null;announceEscape(e,api.mobs);
   if(Math.hypot(api.P.x-e.x,api.P.y-e.y)<1100)api.notify("山火事発生！煙と炎から離れろ");
   persist();
  }
 }else if(year>=nextFireYear){
  nextFireYear=year+2.6+Math.random()*3.8;
  if(!warning&&!floodWarning)scheduleFire(api,year);persist();
 }
 // Existing animals leave scorched habitat and return as vegetation recovers.
 for(const m of api.mobs||[]){
  if(!m||m.hp<=0||habitatQuality(m.x,m.y,year)>=.78)continue;
  const scar=events.find(e=>e.kind==="wildfire"&&year>=e.year&&year<e.year+e.duration+7&&Math.hypot(m.x-e.x,m.y-e.y)<e.radius);
  if(!scar)continue;
  m.flee=Math.max(m.flee||0,Math.min(2.8,1.2+dt*2));
  m.fleeThreatX=scar.x;m.fleeThreatY=scar.y;
  m.resting=false;m.foragePose=0;m.habitatDisplaced=true;
 }
 // Wildfire is an actual lethal hazard. Keep corpses in the main game's normal remains system.
 const playerHeat=fireIntensity(api.P.x,api.P.y,year);
 if(playerHeat>.12&&api.P.hp>0&&!api.isSheltered?.(api.P)){
  api.P.hp=Math.max(0,api.P.hp-dt*(4+19*playerHeat));
  api.P.sp=Math.max(0,(api.P.sp||0)-dt*8*playerHeat);
  api.P.fireBurnTime=Math.max(api.P.fireBurnTime||0,1.4);
 }
 for(const m of api.mobs||[]){
  if(!m||m.hp<=0)continue;
  const heat=fireIntensity(m.x,m.y,year);
  if(heat<=.04)continue;
  const fire=events.find(e=>e.kind==="wildfire"&&active(e,year)&&Math.hypot(m.x-e.x,m.y-e.y)<e.radius);
  if(fire){m.flee=Math.max(m.flee||0,3);m.fleeThreatX=fire.x;m.fleeThreatY=fire.y;
   m.resting=false;m.restTime=0;}
  m.hp=Math.max(0,m.hp-dt*(3+16*heat));
  if(m.hp===0&&!m.wildfireCorpseMade){
   m.wildfireCorpseMade=true;api.onAnimalDeath?.(m,"wildfire");
  }
 }
 if(Math.floor(year)!==Math.floor(lastYear)){
  const before=events.length;events=events.filter(e=>active(e,year));if(events.length!==before)persist();
 }
 lastYear=year;
}
function draw(ctx,project,year,webglActive=false){
 for(const e of events)if(e.kind==="wildfire"&&active(e,year)){
  const p=project(e.x,e.y);if(!p)continue;
  ctx.save();ctx.fillStyle="rgba(235,87,22,.23)";ctx.strokeStyle="#f9a044";ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(p.x,p.y,e.radius*.84,e.radius*.5,-.25,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle="#ffe5b3";ctx.font="bold 13px sans-serif";ctx.textAlign="center";
  ctx.fillText("山火事・危険",p.x,p.y-55);ctx.restore();
 }
 if(fireWarning){const p=project(fireWarning.x,fireWarning.y);if(p){
  ctx.save();ctx.strokeStyle="#ffc06b";ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,46,0,Math.PI*2);ctx.stroke();
  ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillStyle="#ffe6b3";
  ctx.fillText("煙の予兆・避難",p.x,p.y-54);ctx.restore();
 }}
 for(const e of events){if(e.kind!=="flood"||!active(e,year))continue;
  const p=project(e.x,e.y);if(!p)continue;
  ctx.save();ctx.fillStyle="rgba(36,135,190,.24)";ctx.strokeStyle="rgba(93,208,241,.72)";ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(p.x,p.y,e.radius*.88,e.radius*.51,-.26,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle="#bceefa";ctx.font="bold 12px sans-serif";ctx.textAlign="center";
  ctx.fillText("冠水・迂回",p.x,p.y-e.radius*.57);ctx.restore();
 }
 if(floodWarning){const p=project(floodWarning.x,floodWarning.y);if(p){
  ctx.save();ctx.strokeStyle="#7adaff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,42,0,Math.PI*2);ctx.stroke();
  ctx.font="bold 14px sans-serif";ctx.fillStyle="#dff7ff";ctx.textAlign="center";
  ctx.fillText("氾濫警戒・避難",p.x,p.y-58);ctx.restore();
 }}
 for(const e of events){if(e.kind!=="fallen_tree"||!active(e,year)||webglActive)continue;const p=project(e.x,e.y);if(!p)continue;
  // Canvas fallback: tapered bark, roots, irregular boughs and layered leaves.
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.45);
  ctx.fillStyle="rgba(9,17,12,.28)";ctx.beginPath();ctx.ellipse(0,9,65,18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#5c4432";ctx.beginPath();ctx.moveTo(-48,-12);ctx.lineTo(43,-5);ctx.lineTo(43,5);ctx.lineTo(-48,13);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#967252";ctx.lineWidth=2;
  for(let k=0;k<6;k++){const x=-34+k*13;ctx.beginPath();ctx.moveTo(x,-8+k*.45);ctx.lineTo(x+9,6-k*.3);ctx.stroke();}
  ctx.fillStyle="#b18b65";ctx.beginPath();ctx.ellipse(-48,0,10,13,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#75563a";ctx.lineWidth=5;
  for(let k=0;k<5;k++){const x=3+k*10,y=k%2?13:-13;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+9,y);ctx.stroke();}
  for(let k=0;k<7;k++){const x=17+k*8,y=(k%3-1)*12;ctx.fillStyle=k%2?"#3c7145":"#56835a";ctx.beginPath();ctx.ellipse(x,y,15-k*.5,11,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();
 }
 if(warning){const p=project(warning.x,warning.y);if(p){ctx.save();ctx.strokeStyle="#ffbd4b";ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,45,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#fff0bc";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("地震・倒木に注意",p.x,p.y-52);ctx.restore();}}
}
restore();
function quakeShake(now=0){
 if(seismicSeconds<=0)return {x:0,y:0,rotation:0,strength:0};
 const fade=Math.min(1,seismicSeconds/.75),time=Number(now)||0;
 const intensity=fade*(.55+.45*Math.sin((3.4-seismicSeconds)/3.4*Math.PI));
 return {x:(Math.sin(time*42+seismicPhase)*9+Math.cos(time*73)*4)*intensity,
  y:(Math.cos(time*34+seismicPhase)*7+Math.sin(time*62)*3)*intensity,
  rotation:Math.sin(time*19+seismicPhase)*.010*intensity,strength:intensity};
}
window.WildDisaster={tick,draw,quakeShake,blocked,floodDepth,fireIntensity,habitatQuality,history:()=>history.slice(),events:()=>events.slice(),
 getState:()=>({events:events.slice(),nextYear,warning,nextFloodYear,floodWarning,nextFireYear,fireWarning,history:history.slice()}),
 force:(api)=>schedule(api,api.elapsed/120),
 forceFlood:(api,x,y)=>scheduleFlood(api,api.elapsed/120,Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null),
 forceFire:(api,x,y)=>scheduleFire(api,api.elapsed/120,Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null)};
})();
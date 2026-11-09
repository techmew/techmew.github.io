/* WILD RECLAIM: persistent local earthquake and fallen-tree ecology. */
(function(){
"use strict";
const KEY="wild_reclaim_disasters_v1",MAX=12,PACE=3,MAX_SIMULTANEOUS=2;
// Only disaster events and recovery are compressed; the world year and animal lifespans remain unchanged.
const eventDelay=years=>window.WildWorldClock?.eventIntervalYears?.(years)??years/PACE;
const retryDelay=()=>eventDelay(1);
let events=[],nextYear=eventDelay(5+Math.random()*10),warning=null,lastYear=0;
let seismicSeconds=0,seismicPhase=0;
let nextFloodYear=eventDelay(6+Math.random()*9),floodWarning=null,history=[];
let nextFireYear=eventDelay(7+Math.random()*8),fireWarning=null;

 // Stable giant tree landmarks: position is fixed; the quake victim is random.
 const TREE_SITES=[];
 for(const x of [810,1040,1660,1910,2580,2790,3620,3880,4820,5060,5870,6740,7780])
  for(const y of [3220,3460,4210,4450,5210,5390])
   TREE_SITES.push({id:"tree-"+x+"-"+y,x,y,scale:3});
 const siteHash=t=>{const v=Math.sin(t.x*.02171+t.y*.03713)*41392.31;return v-Math.floor(v)};
 let worldTrees=null;
 function ensureTrees(api){
  if(worldTrees)return worldTrees;
  if(!api?.WORLD)return [];
  const {WORLD,roadsX=[],roadsY=[],buildings=[]}=api;
  const possible=TREE_SITES.filter(t=>t.x>230&&t.y>230&&t.x<WORLD.w-400&&t.y<WORLD.h-320&&
   !roadsX.some(v=>Math.abs(t.x-v)<185)&&!roadsY.some(v=>Math.abs(t.y-v)<185)&&
   !buildings.some(b=>t.x>b.x-150&&t.x<b.x+b.w+150&&t.y>b.y-150&&t.y<b.y+b.h+150))
   .sort((a,b)=>siteHash(a)-siteHash(b));
  worldTrees=[];
  for(const site of possible){
   if(worldTrees.length>=16)break;
   if(worldTrees.some(t=>Math.hypot(t.x-site.x,t.y-site.y)<460))continue;
   worldTrees.push(site);
  }
  return worldTrees;
 }
 function standingTrees(year=lastYear){
  return (worldTrees||[]).filter(t=>!events.some(e=>e.kind==="fallen_tree"&&e.treeId===t.id&&active(e,year)));
 }
 function fallingAngle(site,api){
  const roadX=api.roadsX||[],roadY=api.roadsY||[],buildings=api.buildings||[];
  for(let i=0;i<12;i++){
   const a=Math.random()*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
   let safe=true;
   for(let j=1;j<=6;j++){
    const x=site.x+c*j*50,y=site.y+s*j*50;
    if(x<130||y<130||x>api.WORLD.w-130||y>api.WORLD.h-130||
     roadX.some(v=>Math.abs(x-v)<96)||roadY.some(v=>Math.abs(y-v)<96)||
     buildings.some(b=>x>b.x-45&&x<b.x+b.w+45&&y>b.y-45&&y<b.y+b.h+45)){safe=false;break;}
   }
   if(safe)return a;
  }
  return null;
 }

const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
function restore(){
 try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(!x)return;
 events=Array.isArray(x.events)?x.events.filter(e=>e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.year)).slice(-MAX):[];
 nextYear=Math.max(0,finite(x.nextYear,eventDelay(5)));lastYear=Math.max(0,finite(x.lastYear,0));
 warning=x.warning&&Number.isFinite(x.warning.x)?x.warning:null;
 nextFloodYear=Math.max(0,finite(x.nextFloodYear,eventDelay(6)));
 floodWarning=x.floodWarning&&Number.isFinite(x.floodWarning.x)&&Number.isFinite(x.floodWarning.y)?x.floodWarning:null;
 history=Array.isArray(x.history)?x.history.filter(e=>e&&Number.isFinite(e.year)&&["fallen_tree","fissure","flood","wildfire"].includes(e.kind)).slice(-60):[];
 nextFireYear=Math.max(0,finite(x.nextFireYear,eventDelay(7)));
 fireWarning=x.fireWarning&&Number.isFinite(x.fireWarning.x)&&Number.isFinite(x.fireWarning.y)?x.fireWarning:null;
 // Legacy schedules are converted once; old disasters, world age and history are not rewritten.
 if(x.paceVersion!==PACE){
  const migrate=due=>lastYear+Math.max(retryDelay(),Math.max(0,due-lastYear)/PACE);
  nextYear=migrate(nextYear);nextFloodYear=migrate(nextFloodYear);nextFireYear=migrate(nextFireYear);
 }
 }catch(_){}
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({paceVersion:PACE,events,nextYear,lastYear,warning,nextFloodYear,floodWarning,nextFireYear,fireWarning,history}));}catch(_){}}
function active(e,year){return e.permanent||year-e.year<e.duration;}
function canSchedule(year){return events.filter(e=>active(e,year)).length+(warning?1:0)+(floodWarning?1:0)+(fireWarning?1:0)<MAX_SIMULTANEOUS;}
const recoveryYears=e=>e.paceVersion===PACE?eventDelay(7):7;
const leafYears=e=>e.paceVersion===PACE?eventDelay(4):4;
function fallenAngle(e){
 const seed=Math.sin(e.x*.031+e.y*.067)*43758.5453;
 return Number.isFinite(e.angle)?e.angle:-.48+((seed-Math.floor(seed))-.5)*.74;
}
// Physical fissure edges are capsule segments; their narrow width leaves detours open.
function fissureGap(e,x,y){
 const a=Number.isFinite(e.angle)?e.angle:0,ca=Math.cos(a),sa=Math.sin(a);
 const dx=x-e.x,dy=y-e.y,half=Math.min(85,Math.max(28,(Number(e.length)||110)*.5));
 const along=Math.max(-half,Math.min(half,dx*ca+dy*sa));
 return Math.hypot(dx-along*ca,dy-along*sa);
}
function blocked(x,y,r,year){
 if(standingTrees(year).some(t=>Math.hypot(x-t.x,y-t.y)<Math.max(0,r)+24))return true;
 return events.some(e=>{
  if(e.kind==="fissure")return active(e,year)&&fissureGap(e,x,y)<Math.max(0,r)+Math.min(28,Math.max(8,Number(e.width)||14));
  if(e.kind!=="fallen_tree"||!active(e,year))return false;
  const angle=fallenAngle(e),ca=Math.cos(angle),sa=Math.sin(angle);
  const along=(x-e.x)*ca+(y-e.y)*sa;
  const size=e.scale===3?3:1;
  const nearest=Math.max(-43*size,Math.min(56*size,along));
  const dx=x-e.x-nearest*ca,dy=y-e.y-nearest*sa;
  // Collision follows the trunk rather than a large invisible circular barrier.
  const radius=(10+(1-(nearest/size+43)/99)*3)*size;
  return dx*dx+dy*dy<Math.pow(Math.max(0,r)+radius,2);
 });
}
function floodDepth(x,y,year){
 let depth=0;
 for(const e of events){
  if(e.kind!=="flood"||!active(e,year))continue;
  const d=Math.hypot(x-e.x,y-e.y);
  if(d>=e.radius)continue;
  // Shallow inundation grows and recedes; a dry way around remains outside the limited circle.
  const age=Math.max(0,year-e.year);
  const rate=e.paceVersion===PACE?1/PACE:1;
   const scale=Math.min(1,(age+.10*rate)/(.28*rate),Math.max(0,(e.duration-age)/(.35*rate)));
  depth=Math.max(depth,Math.min(.85,(1-d/e.radius)*1.4*scale));
 }
 return depth;
}
function fireIntensity(x,y,year){
 let intensity=0;
 for(const e of events)if(e.kind==="wildfire"&&active(e,year)){
  const d=Math.hypot(x-e.x,y-e.y),age=Math.max(0,year-e.year);
  if(d>=e.radius)continue;
  const rate=e.paceVersion===PACE?1/PACE:1;
   const ramp=Math.min(1,(age+.04*rate)/(.16*rate)),cool=Math.min(1,Math.max(0,(e.duration-age)/(.25*rate)));
  intensity=Math.max(intensity,(1-d/e.radius)*ramp*cool);
 }
 return intensity;
}
function habitatQuality(x,y,year){
 let quality=1;
 for(const e of events){
  if(e.kind!=="wildfire")continue;
  const distance=Math.hypot(x-e.x,y-e.y),age=year-e.year;
  const recoverIn=recoveryYears(e);
   if(distance>=e.radius||age<0||age>e.duration+recoverIn)continue;
  const recovery=Math.max(0,Math.min(1,(age-e.duration)/recoverIn));
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
// One optional rupture per earthquake. Check the playable terrain and keep at
// least three clear escape directions; never block a road, den or the player.
function quakeFissure(api,year,site,fallAngle){
 if(Math.random()>.76)return null;
 const turns=[Math.PI/2,-Math.PI/2,Math.PI*.78,-Math.PI*.78,0,Math.PI];
 for(const offset of turns){
  const a=fallAngle+offset,dist=180+(Math.abs(offset)<.01?65:0);
  const x=site.x+Math.cos(a)*dist,y=site.y+Math.sin(a)*dist;
  if(!safeSite(x,y,api))continue;
  if(events.some(e=>active(e,year)&&Math.hypot(x-e.x,y-e.y)<210))continue;
  return {kind:"fissure",x,y,angle:fallAngle+Math.PI/2,length:110,width:14,
   year,duration:eventDelay(8+Math.random()*6),paceVersion:PACE,permanent:false};
 }
 return null;
}
function schedule(api,year){
 ensureTrees(api);
 const available=standingTrees(year),near=available.filter(t=>{
  const dist=Math.hypot(api.P.x-t.x,api.P.y-t.y);return dist>=330&&dist<=2200;
 });
 const choices=(near.length?near:available).slice();
 for(let k=0;k<Math.min(24,choices.length);k++){
  const index=Math.floor(Math.random()*choices.length),site=choices.splice(index,1)[0];
  if(!site)break;
  const angle=fallingAngle(site,api);
  if(angle===null)continue;
  warning={x:site.x,y:site.y,treeId:site.id,angle,year,seconds:4.5};
  api.notify?.("大木が大きく揺れている！ 倒木に注意");
  persist();return true;
 }
 nextYear=year+retryDelay();persist();return false;
}
function tick(dt,api){
 if(!api?.P||api.mode!=="play")return;
 const year=api.elapsed/120;
 ensureTrees(api);
 seismicSeconds=Math.max(0,seismicSeconds-dt);
 if(year<lastYear)lastYear=year; // Old SAVE_SCHEMA2 resumes must not erase world history.
 if(warning){
  warning.seconds-=dt;
  if(warning.seconds<=0){
   const isGiant=!!warning.treeId,angle=Number(warning.angle)||0;
    const e={x:warning.x+(isGiant?129*Math.cos(angle):0),
     y:warning.y+(isGiant?129*Math.sin(angle):0),
     treeId:warning.treeId||null,angle:isGiant?angle:undefined,
     scale:isGiant?3:1,fallAtSeconds:isGiant?api.elapsed:undefined,
     year,kind:"fallen_tree",radius:isGiant?102:34,duration:eventDelay(5+Math.random()*9),
     paceVersion:PACE,permanent:false};
   const fissure=quakeFissure(api,year,warning,angle);
   events.push(e);if(fissure)events.push(fissure);events=events.slice(-MAX);warning=null;
   history.push({kind:e.kind,year:e.year,x:e.x,y:e.y});
   if(fissure)history.push({kind:"fissure",year,x:fissure.x,y:fissure.y});
   history=history.slice(-60);
   seismicSeconds=3.4;seismicPhase=Math.random()*Math.PI*2;
   api.notify(fissure?"地震発生！地割れが開いた。足元と迂回路に注意":"地震発生！倒木と地割れに警戒");
   if(fissure)announceEscape({...fissure,radius:100},api.mobs);
   for(const m of api.mobs||[])if(m.hp>0&&Math.hypot(m.x-e.x,m.y-e.y)<210){
    const a=Math.atan2(m.y-e.y,m.x-e.x);m.flee=Math.max(m.flee||0,3.6);m.fleeThreatX=e.x;m.fleeThreatY=e.y;m.dir=a;m.resting=false;m.restTime=0;
   }
   persist();
  }
 }else if(year>=nextYear){
  if(canSchedule(year)&&!floodWarning&&!fireWarning){nextYear=year+eventDelay(5+Math.random()*10);schedule(api,year);}
  else nextYear=year+retryDelay();
  persist();
 }
 if(floodWarning){
  floodWarning.seconds-=dt;
  if(floodWarning.seconds<=0){
   const event={kind:"flood",x:floodWarning.x,y:floodWarning.y,radius:floodWarning.radius,
     year,duration:eventDelay(1.4+Math.random()*2.1),paceVersion:PACE,permanent:false};
   events.push(event);events=events.slice(-MAX);
   history.push({kind:"flood",year,x:event.x,y:event.y});history=history.slice(-60);
   floodWarning=null;
   announceEscape(event,api.mobs);
   if(Math.hypot(api.P.x-event.x,api.P.y-event.y)<1100)api.notify("河川が氾濫。冠水した道を迂回");
   persist();
  }
 }else if(year>=nextFloodYear){
  if(canSchedule(year)&&!warning&&!fireWarning){nextFloodYear=year+eventDelay(5+Math.random()*10);
   if(!scheduleFlood(api,year))nextFloodYear=year+retryDelay();}
  else nextFloodYear=year+retryDelay();persist();
 }
 // Animals already in the expanding water retreat; no teleport or damage without warning.
 for(const e of events)if(e.kind==="flood"&&active(e,year)){
  for(const m of api.mobs||[])if(m?.hp>0){
   const depth=floodDepth(m.x,m.y,year);
   if(depth<=.1)continue;
   m.flee=Math.max(m.flee||0,2.0+depth*2);
   m.fleeThreatX=e.x;m.fleeThreatY=e.y;
   m.resting=false;m.restTime=0;m.foragePose=0;
   // Floodwater interrupts feeding and resting until the animal reaches dry ground.
   // Avoid arbitrary HP loss: aquatic species and legacy saves share this path.
  }
 }
 if(fireWarning){
  fireWarning.seconds-=dt;
  if(fireWarning.seconds<=0){
   const e={kind:"wildfire",x:fireWarning.x,y:fireWarning.y,radius:fireWarning.radius,
    year,duration:eventDelay(1.2+Math.random()*1.5),paceVersion:PACE,permanent:false};
   events.push(e);events=events.slice(-MAX);
   history.push({kind:e.kind,year,x:e.x,y:e.y});history=history.slice(-60);
   fireWarning=null;announceEscape(e,api.mobs);
   if(Math.hypot(api.P.x-e.x,api.P.y-e.y)<1100)api.notify("山火事発生！煙と炎から離れろ");
   persist();
  }
 }else if(year>=nextFireYear){
  if(canSchedule(year)&&!warning&&!floodWarning){nextFireYear=year+eventDelay(5+Math.random()*10);
   if(!scheduleFire(api,year))nextFireYear=year+retryDelay();}
  else nextFireYear=year+retryDelay();persist();
 }
 // Existing animals leave scorched habitat and return as vegetation recovers.
 for(const m of api.mobs||[]){
  if(!m||m.hp<=0||habitatQuality(m.x,m.y,year)>=.78)continue;
  const scar=events.find(e=>e.kind==="wildfire"&&year>=e.year&&year<e.year+e.duration+recoveryYears(e)&&Math.hypot(m.x-e.x,m.y-e.y)<e.radius);
  if(!scar)continue;
  m.flee=Math.max(m.flee||0,Math.min(2.8,1.2+dt*2));
  m.fleeThreatX=scar.x;m.fleeThreatY=scar.y;
  m.resting=false;m.foragePose=0;m.habitatDisplaced=true;
 }
 // Existing wildlife remembers the ruptured ground as a navigational obstacle.
 // Only nearby NPCs flee; never teleport the player or modify owned companions.
 for(const e of events)if(e.kind==="fissure"&&active(e,year)){
  for(const m of api.mobs||[]){
   if(!m||m.hp<=0||fissureGap(e,m.x,m.y)>95)continue;
   m.flee=Math.max(m.flee||0,1.8);
   m.fleeThreatX=e.x;m.fleeThreatY=e.y;
   m.resting=false;m.restTime=0;m.foragePose=0;
  }
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
 if(!webglActive)for(const t of standingTrees(year)){
  const p=project(t.x,t.y);if(!p)continue;
  ctx.save();ctx.translate(p.x,p.y);
  ctx.fillStyle="rgba(12,32,21,.28)";ctx.beginPath();ctx.ellipse(25,14,67,24,-.25,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#65503b";ctx.lineWidth=22;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(-7,-105);ctx.stroke();
  for(let i=0;i<5;i++){
   const a=i*2.42,x=-7+Math.cos(a)*37,y=-111+Math.sin(a)*18-(i%3)*8;
   ctx.fillStyle=["#2f5c3e","#416e45","#527b4a","#315e43","#4d754c"][i];
   ctx.beginPath();ctx.ellipse(x,y,40+(i%2)*7,36+(i%3)*4,a*.15,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
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
 // Draw the actual collision segment on the ground in both WebGL and 2D mode.
 // This is a world overlay, not a change to the established HUD layout.
 for(const e of events)if(e.kind==="fissure"&&active(e,year)){
  const mid=project(e.x,e.y);if(!mid)continue;
  const ca=Math.cos(e.angle||0),sa=Math.sin(e.angle||0),half=(e.length||110)*.5;
  ctx.save();ctx.lineJoin="round";ctx.lineCap="round";
  const trace=()=>{ctx.beginPath();for(let i=0;i<=8;i++){
   const t=(i/8*2-1)*half,jitter=i===0||i===8?0:Math.sin(i*5.37+e.x)*4;
   const p=project(e.x+t*ca-jitter*sa,e.y+t*sa+jitter*ca);if(!p)continue;
   if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
  }};
  trace();ctx.strokeStyle="rgba(119,91,72,.88)";ctx.lineWidth=13;ctx.stroke();
  trace();ctx.strokeStyle="rgba(16,17,20,.96)";ctx.lineWidth=7;ctx.stroke();
  ctx.fillStyle="#f5ddba";ctx.font="bold 12px sans-serif";ctx.textAlign="center";
  ctx.fillText("地割れ・迂回",mid.x,mid.y-28);ctx.restore();
 }
 for(const e of events){if(e.kind!=="fallen_tree"||!active(e,year)||webglActive)continue;
  const angle=fallenAngle(e),ca=Math.cos(angle),sa=Math.sin(angle);
  const size=e.scale===3?3:1;
  const root=project(e.x-43*size*ca,e.y-43*size*sa),tip=project(e.x+56*size*ca,e.y+56*size*sa);
  if(!root||!tip)continue;
  const dx=tip.x-root.x,dy=tip.y-root.y,length=Math.hypot(dx,dy);
  if(length<1)continue;
  const seed=Math.sin(e.x*.029+e.y*.013)*19327.17;
  const random=seed-Math.floor(seed),leafy=year-e.year<leafYears(e);
  ctx.save();ctx.translate(root.x,root.y);ctx.rotate(Math.atan2(dy,dx)-(Number.isFinite(e.fallAtSeconds)?(1-Math.min(1,Math.max(0,(year*120-e.fallAtSeconds)/1.4)))*Math.PI/2:0));
  ctx.scale(Math.max(.32,length/99),size===3?3:Math.max(.42,Math.min(1.4,length/99)));
  // Contact shadow and raised, tapered bark. The root end is not a yellow disc.
  ctx.fillStyle="rgba(15,28,21,.3)";ctx.beginPath();ctx.ellipse(49,8,61,16,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#4b4136";ctx.beginPath();ctx.ellipse(0,0,16,12,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<4;i++){
   ctx.strokeStyle=i%2?"#66513c":"#44382e";ctx.lineWidth=3.5;ctx.lineCap="round";
   ctx.beginPath();ctx.moveTo(2,(i-1.5)*5);ctx.lineTo(-14-i*2,(i-1.5)*9);ctx.stroke();
  }
  ctx.fillStyle="#543c2c";ctx.beginPath();ctx.moveTo(0,-12);ctx.bezierCurveTo(27,-11,59,-7,99,-4);
  ctx.lineTo(99,5);ctx.bezierCurveTo(63,7,27,11,0,12);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#9a7854";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(2,-7);
  ctx.bezierCurveTo(35,-6,67,-3,95,-2);ctx.stroke();
  for(let i=0;i<7;i++){
   ctx.strokeStyle=i%3===0?"#3c3027":"#75563d";ctx.lineWidth=1.1;
   ctx.beginPath();ctx.moveTo(7+i*12,-8+i*.45);ctx.lineTo(14+i*12,2+i*.2);ctx.stroke();
  }
  // Root-side end grain: dark concentric rings without the old solid marker.
  ctx.fillStyle="#6d4e37";ctx.beginPath();ctx.ellipse(0,0,6,10,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<3;i++){
   ctx.strokeStyle=i%2?"#9e7752":"#493526";ctx.lineWidth=1;
   ctx.beginPath();ctx.ellipse(0,0,2+i*1.3,3+i*2.2,0,0,Math.PI*2);ctx.stroke();
  }
  for(let i=0;i<5;i++){
   const bx=26+i*14,side=i%2?1:-1,by=side*(17+(i%3)*7);
   ctx.strokeStyle="#684d38";ctx.lineWidth=4-i*.45;ctx.lineCap="round";
   ctx.beginPath();ctx.moveTo(bx,0);ctx.quadraticCurveTo(bx+7,by*.5,bx+19,by);ctx.stroke();
   ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx+12,by*.65);ctx.lineTo(bx+22,by*1.12);ctx.stroke();
   if(leafy)for(let j=0;j<3;j++){
    const xx=bx+13+j*5,yy=by+(j-1)*6;
    ctx.fillStyle=["#345e3d","#507b4c","#416d44"][(i+j)%3];
    ctx.beginPath();ctx.ellipse(xx,yy,10-j,6+j*.6,random*.5,0,Math.PI*2);ctx.fill();
   }
  }
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
window.WildDisaster={tick,draw,quakeShake,blocked,floodDepth,fireIntensity,habitatQuality,history:()=>history.slice(),events:()=>events.slice(),standingTrees:()=>standingTrees(),fixedTrees:()=>worldTrees?.slice()||[],
 getState:()=>({paceVersion:PACE,events:events.slice(),nextYear,warning,nextFloodYear,floodWarning,nextFireYear,fireWarning,history:history.slice()}),
 resetWorld(){
  // Only an explicit NEW GAME resets the world. Continue/retry retain history.
  events=[];history=[];warning=null;floodWarning=null;fireWarning=null;
  lastYear=0;seismicSeconds=0;seismicPhase=0;
  nextYear=eventDelay(5+Math.random()*10);
  nextFloodYear=eventDelay(6+Math.random()*9);
  nextFireYear=eventDelay(7+Math.random()*8);
  persist();return true;
 },
 debugClear(){events=[];warning=null;floodWarning=null;fireWarning=null;seismicSeconds=0;persist();return true;},
 force:(api)=>schedule(api,api.elapsed/120),
 forceFlood:(api,x,y)=>scheduleFlood(api,api.elapsed/120,Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null),
 forceFire:(api,x,y)=>scheduleFire(api,api.elapsed/120,Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null)};
})();
/* WILD RECLAIM: persistent local earthquake and fallen-tree ecology. */
(function(){
"use strict";
const KEY="wild_reclaim_disasters_v1",MAX=12;
let events=[],nextYear=5+Math.random()*10,warning=null,lastYear=0;
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
function restore(){
 try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(!x)return;
 events=Array.isArray(x.events)?x.events.filter(e=>e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.year)).slice(-MAX):[];
 nextYear=Math.max(0,finite(x.nextYear,5));lastYear=Math.max(0,finite(x.lastYear,0));
 warning=x.warning&&Number.isFinite(x.warning.x)?x.warning:null;
 }catch(_){}
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({events,nextYear,lastYear,warning}));}catch(_){}}
function active(e,year){return e.permanent||year-e.year<e.duration;}
function blocked(x,y,r,year){return events.some(e=>active(e,year)&&Math.hypot(x-e.x,y-e.y)<e.radius+r);}
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
 if(year<lastYear)lastYear=year; // Old SAVE_SCHEMA2 resumes must not erase world history.
 if(warning){
  warning.seconds-=dt;
  if(warning.seconds<=0){
   const e={x:warning.x,y:warning.y,year,kind:"fallen_tree",radius:34,duration:5+Math.random()*9,permanent:false};
   events.push(e);events=events.slice(-MAX);warning=null;
   api.notify("倒木が道を塞いだ。迂回できる");
   for(const m of api.mobs||[])if(m.hp>0&&Math.hypot(m.x-e.x,m.y-e.y)<210){
    const a=Math.atan2(m.y-e.y,m.x-e.x);m.fleeTime=Math.max(m.fleeTime||0,3);m.dir=a;
   }
   persist();
  }
 }else if(year>=nextYear){
  nextYear=year+5+Math.random()*10;schedule(api,year);
 }
 if(Math.floor(year)!==Math.floor(lastYear)){
  const before=events.length;events=events.filter(e=>active(e,year));if(events.length!==before)persist();
 }
 lastYear=year;
}
function draw(ctx,project,year){
 for(const e of events){if(!active(e,year))continue;const p=project(e.x,e.y);if(!p)continue;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.45);ctx.fillStyle="#52351e";ctx.strokeStyle="#281e14";ctx.lineWidth=3;
  ctx.fillRect(-43,-9,86,18);ctx.strokeRect(-43,-9,86,18);
  ctx.fillStyle="#60783e";ctx.beginPath();ctx.arc(-35,0,18,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 if(warning){const p=project(warning.x,warning.y);if(p){ctx.save();ctx.strokeStyle="#ffbd4b";ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,45,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#fff0bc";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("地震・倒木に注意",p.x,p.y-52);ctx.restore();}}
}
restore();
window.WildDisaster={tick,draw,blocked,events:()=>events.slice(),getState:()=>({events:events.slice(),nextYear,warning}),force:(api)=>schedule(api,api.elapsed/120)};
})();
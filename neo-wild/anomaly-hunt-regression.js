/* UFO/ghost gameplay regression. Run: node anomaly-hunt-regression.js */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
function run(which,{hidden=false,blocked=false,start=1200,seconds=140,dt=1/60,hideAt=null,render=false}={}){
 const mem=new Map();
 const localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
 const window={WildWorldClock:{eventYear:y=>y*3,eventIntervalYears:y=>y/3}};
 const fixedMath=Object.create(Math);fixedMath.random=()=>.5;
 const code=fs.readFileSync(__dirname+"/"+which+".js","utf8");
 const context=vm.createContext({window,localStorage,Math:fixedMath});
 new vm.Script(code,{filename:which+".js"}).runInContext(context);
 const P={x:3000,y:3000,hp:100,maxHp:100,sp:100,stun:0,hidden,dir:0,r:20,
  speed:145,ghostPossessedUntil:0,squadIndividualId:"player-0001",type:"cat"};
 const events=[],scaleSamples=[],api=which==="apparitions"?window.WildApparitions:window.WildUFO;
 const ctx=new Proxy({}, {get:(_target,name)=>name==="createLinearGradient"||name==="createRadialGradient"?
  ()=>({addColorStop(){}}):()=>{}});
 let liftedSeconds=0;
 for(let i=0;i<Math.ceil(seconds/dt);i++){
  const elapsed=start+(i+1)*dt;
  if(hideAt!==null&&elapsed-start>=hideAt)P.hidden=true;
  api.tick(dt,{P,mobs:[],elapsed,worldYear:elapsed/120,mode:"play",WORLD:{w:15000,h:8000},
   lineBlocked:()=>blocked,isPlayerConcealed:()=>P.hidden,notify:()=>{},
   onEvent:key=>events.push(key),onPossession:()=>{},onPlayerAbductionStart:()=>events.push("capture"),
   beginDeath:()=>events.push("death")});
  if(which==="ufo-events"&&api.active?.lifts?.[0]?.player){
   liftedSeconds=Math.max(liftedSeconds,api.active.lifts[0].seconds);
   if(render&&i%10===0)api.draw(ctx,(x,y)=>({x,y}),{
    mode:"play",drawAbductee:(_c,_actor,_x,_y,scale,isPlayer)=>{if(isPlayer)scaleSamples.push(scale)}});
  }
  if(events.includes("death"))break;
 }
 return {P,events,api,mem,scaleSamples,liftedSeconds};
}
assert(!run("apparitions",{start:0}).events.includes("ghost-possession"));
assert(!run("ufo-events",{start:0}).events.includes("capture"));
const ghost=run("apparitions",{dt:1/60});
assert(ghost.events.includes("ghost-possession"),"Ghost must possess an exposed player");
assert(!run("apparitions",{hidden:true}).events.includes("ghost-possession"),"Hiding prevents ghost possession");
assert(!run("apparitions",{blocked:true}).events.includes("ghost-possession"),"Walls prevent ghost possession");
const early=run("ufo-events",{render:true});
assert(early.events.includes("ufo-player-harass"),"Early UFO must threaten visible player");
assert(early.events.includes("capture"),"Early UFO must start a real player lift");
assert(early.events.includes("ufo-player-lift-start"),"Lift-start event must be emitted");
assert(early.events.includes("ufo-player-abduction"),"Captured player must board the craft");
assert(early.events.includes("death"),"Abduction must reach existing permanent-death callback");
assert.equal(early.P.deathReason,"ufo");
assert.equal(early.P.hp,0);
assert(early.liftedSeconds>1.5,"Actor must remain in tractor beam during lift");
assert(early.scaleSamples.length>=4&&Math.min(...early.scaleSamples)<.5,
 "Captured actor must visibly rise and shrink via 2D/WebGL shared overlay");
const late=run("ufo-events",{start:4200});
assert(late.events.includes("capture")&&late.events.includes("death"),"Late-era abduction still works");
for(const o of [{hidden:true},{blocked:true},{hideAt:83}]){
 const sample=run("ufo-events",o);
 assert(!sample.events.includes("capture"),"Cover must interrupt UFO's tractor-beam lock");
}
const fleet=run("ufo-events",{seconds:0});
for(const [era,formation,disabled,seconds] of [[0,false,0,3],[100,true,0,2],[260,true,0,1],[260,true,1,2],[260,true,3,3]]){
 const event=fleet.api.summon(3000,3000,formation,era);
 Object.assign(event,{stage:"scan",beam:.75});
 for(const wing of event.wingmen.slice(0,disabled))wing.disabled=1;
 const arcs=[];
 const ctx=new Proxy({arc(x,y,r,start,end){if(x===3000&&y===2960&&r===12)arcs.push(end-start);}},
  {get:(obj,key)=>obj[key]??(key==="createLinearGradient"||key==="createRadialGradient"?()=>({addColorStop(){}}):()=>{})});
 fleet.api.draw(ctx,(x,y)=>({x,y}),{mode:"play",P:fleet.P});
 assert(Math.abs(arcs.at(-1)-2*Math.PI*.75/seconds)<1e-8,"Player ring must track active fleet size");
}
const encounter=run("apparitions",{seconds:0});
encounter.api.summon(3200,3200,12);
Object.assign(encounter.api.active,{stage:"manifest",kind:"wraith"});
const protectedMobs=["squadIndividualId","releasedIndividualId","bossIndividualId"].map(key=>({[key]:"animal",hp:10,x:3200,y:3200}));
const prey={hp:10,x:3210,y:3200};
encounter.api.tick(.02,{P:encounter.P,worldYear:12,elapsed:1440,mode:"play",mobs:[...protectedMobs,prey],notify(){}});
assert(prey.hauntedTime>0&&prey.hp<10);
assert(protectedMobs.every(m=>m.hp===10&&!m.flee&&!m.hauntedTime));
console.log("anomaly-hunt-regression PASS: early+late player capture, animated lift, death, stealth, walls, ghost");

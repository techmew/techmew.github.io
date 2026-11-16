/* Regression: player-directed UFO and apparition attacks. Run: node anomaly-hunt-regression.js */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
function run(which,{hidden=false,blocked=false,initial=0,steps=130}={}){
 const mem=new Map();
 const localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
 const worldClock={eventYear:y=>y*3,eventIntervalYears:y=>y/3};
 const window={WildWorldClock:worldClock};
 const randomMath=Object.create(Math);
 randomMath.random=()=>0.5;
 const src=fs.readFileSync(__dirname+"/"+which+".js","utf8");
 const context=vm.createContext({window,localStorage,Math:randomMath});
 new vm.Script(src,{filename:which+".js"}).runInContext(context);
 const P={x:3000,y:3000,hp:100,maxHp:100,sp:100,stun:0,hidden,dir:0,r:20,speed:145,ghostPossessedUntil:0};
 const events=[],api=which==="apparitions"?window.WildApparitions:window.WildUFO;
 for(let i=0;i<steps;i++){
  const elapsed=initial+i+1;
  api.tick(1,{P,mobs:[],elapsed,worldYear:elapsed/120,mode:"play",
   WORLD:{w:15000,h:8000},lineBlocked:()=>blocked,
   isPlayerConcealed:()=>hidden,
   notify:()=>{},onEvent:k=>events.push(k),onPossession:()=>{},
   beginDeath:()=>events.push("death"),onPlayerAbductionStart:()=>events.push("capture")});
 }
 return {P,events,api,mem};
}
const ghost=run("apparitions");
assert(ghost.events.includes("ghost-possession"),"A visible ghost must catch and possess the player");
assert(!run("apparitions",{hidden:true}).events.includes("ghost-possession"),"Hiding must protect against possession");
assert(!run("apparitions",{blocked:true}).events.includes("ghost-possession"),"Solid walls must protect against possession");
const early=run("ufo-events");
assert(early.events.includes("ufo-player-harass"),"Early-era saucer must pursue and strike exposed player");
assert(early.P.hp>=1,"Early-era harassment cannot bypass permanent-death protection");
assert(!run("ufo-events",{hidden:true}).events.includes("ufo-player-harass"),"Hiding must break UFO line-of-sight");
assert(!run("ufo-events",{blocked:true}).events.includes("ufo-player-harass"),"Walls must block UFO attacks");
const late=run("ufo-events",{initial:4200,steps:130});
assert(late.events.includes("capture"),"Later-era UFO must actually start abduction");
console.log("anomaly-hunt-regression PASS: ghost possession, cover, early UFO attack, late capture");

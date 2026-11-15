/* node neo-wild/p2-four-species-regression.js
 * Isolated executable acceptance checks. No real save files are touched.
 */
(function(){
"use strict";
const names=["manul","tibetanFox","shoebill","penguin"];
const assert=(ok,msg)=>{if(!ok)throw Error("P2 regression: "+msg);};
const source=typeof __P2_SOURCES!=="undefined"?__P2_SOURCES:
  typeof require==="function"?(()=>{
   const fs=require("fs"),path=require("path");
   return Object.fromEntries(["squad-core.js","fauna.js","combat-levels.js"].map(name=>[name,fs.readFileSync(path.join(__dirname,name),"utf8")]));
  })():null;
assert(source,"missing module sources");
const data=new Map(),store={
 getItem:key=>data.has(key)?data.get(key):null,
 setItem:(key,val)=>data.set(key,String(val)),
 removeItem:key=>data.delete(key)
};
const w={WildWorldClock:{eventYear:y=>y*3}};
const globals={crypto:{randomUUID:()=>("p2-"+Math.random().toString(36).slice(2))}};
for(const name of ["fauna.js","combat-levels.js","squad-core.js"]){
 assert(typeof source[name]==="string","source missing: "+name);
 new Function("window","localStorage","globalThis",source[name])(w,store,globals);
}
const core=w.WildSquad,fauna=w.WildFauna,combat=w.WildCombatLevels;
assert(core&&fauna&&combat,"module bootstrap");
for(const id of names){
 assert(core.playable.has(id)&&core.gachaReady.has(id),"gacha operability "+id);
 assert(fauna.playableById[id]&&fauna.species[id],"roster/fauna species "+id);
 assert(combat.variants[id],"attack variant "+id);
}
const all=new Set();
for(let i=0;i<2500;i++)all.add(core.rollSpecies(35,40));
for(const id of names)assert(all.has(id),"not drawable after unlock: "+id);
const members=names.slice(0,3).map((species,i)=>({id:"p2-member-"+i,species,alive:true}));
core.newSquad(members,members[0].id);
assert(core.load()?.members?.length===3,"three slots lost");
assert(core.selectActive(members[1].id).ok,"leader selection");
assert(core.load().leaderId===members[1].id,"leader not persisted");
core.kill(members[1].id);
assert(!core.load().members.some(x=>x.id===members[1].id),"dead animal returned");
const stale={...core.load(),members:members.slice(),leaderId:members[1].id};
core.save(stale);
assert(!core.load().members.some(x=>x.id===members[1].id),"stale save resurrected dead ID");
let strokes=0;
const gradient={addColorStop(){}};
const ctx=new Proxy({
 save(){},restore(){},translate(){},rotate(){},scale(){},beginPath(){},ellipse(){strokes++;},
 fill(){},stroke(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},
 closePath(){},fillRect(){},createLinearGradient:()=>gradient,createRadialGradient:()=>gradient
},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true;}});
for(const id of names){
 const actor={type:id,x:200,y:200,hp:100,dir:0,step:1,windup:.2,swing:.24,attackAction:.3,vx:50,vy:0};
 const start=strokes;
 assert(fauna.draw2D(ctx,actor,fauna.species[id].r,fauna.species[id].color,fauna.species[id].belly,2)===true,
   "2D renderer declined "+id);
 assert(strokes>start,"empty 2D geometry "+id);
}
const result={ok:true,species:names,drawn:strokes,checks:["gacha unlock","four species roll","playable roster","combat variants","three slots","leader persistence","death tombstone","stale save anti-resurrection","2D combat poses"]};
if(typeof console!=="undefined")console.log(JSON.stringify(result));
return result;
})();

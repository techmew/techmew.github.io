/* node neo-wild/p2-specialist-foodweb-regression.js
 * Real game.js extraction: NPC hunter -> actual strike -> carcass/feeding claim.
 * Isolated in-memory world, never touches a user's localStorage or save.
 */
"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert");
const source=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");
new Function(source);
const start=source.indexOf("const WILD_PREDATOR_TYPES=");
const stop=source.indexOf("function nearbyVisibleWildPredator(",start);
const begin=source.indexOf("function huntWildPrey(");
const end=source.indexOf("\n// Choose a real road bridge",begin);
assert(start>=0&&stop>start&&begin>0&&end>begin,"live food web anchors missing");
const code=source.slice(start,stop)+source.slice(begin,end);
const factory=new Function("env","with(env){"+code+";return {huntWildPrey,isWildPredator,WILD_DIETS};}");
const types=["manul","tibetanFox","shoebill","penguin"];
for(const type of types){
 const hunter={type,x:500,y:500,hp:100,r:20,dir:0,wildAttack:0};
 const prey={type:"rat",x:515,y:505,hp:5,maxHp:5,r:12,dir:0};
 const carcasses=[],species={rat:{prey:true,food:18},[type]:{damage:20,prey:false}};
 const env={mobs:[hunter,prey],species,elapsed:100,P:{x:5000,y:5000},
  MOUNTAIN:{zone:()=>null},waterDepth:()=>0,weather:"CLEAR",windDirection:0,
  dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lineBlocked:()=>false,
  scentReachTo:()=>200,startlePrey:()=>false,steerPursuit:(a,x,y)=>Math.atan2(y-a.y,x-a.x),
  wildPreyInterceptPoint:(a,b)=>({x:b.x,y:b.y}),clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),
  carcasses,regionAt:()=>0,ecology:[{prey:10}],rnd:()=>0,label:()=>{},move:()=>{},
  claimPredatorKill:(a,b)=>{carcasses.push({type:"corpse",animalType:b.type,amount:18});a.feedClaimToken="mock";a.feedClaimUntil=124;},
  animalRemains:b=>({type:"corpse",animalType:b.type})
 };
 const api=factory(env);
 assert(api.isWildPredator(hunter),"hunter not wired into live AI: "+type);
 assert(api.WILD_DIETS[type].includes("rat"),"missing prey diet: "+type);
 assert(api.huntWildPrey(hunter,species[type],false,1000),"no hunting action: "+type);
 assert.strictEqual(prey.hp,0,"prey not killed: "+type);
 assert.strictEqual(carcasses.length,1,"missing/duplicate corpse: "+type);
 assert(hunter.attackAction>0&&hunter.swing>0,"body attack not animated: "+type);
 assert(hunter.wildAttack>0&&hunter.feedClaimToken,"cooldown/feeding not engaged: "+type);
 hunter.wildAttack=1;
 assert.strictEqual(api.huntWildPrey(hunter,species[type],false,1000),null,"claimed corpse should interrupt repeat hunt");
}
console.log("PASS P2 four specialists: live NPC prey targeting, damage, one carcass, strike pose, cooldown and feeding claim");

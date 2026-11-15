/* node neo-wild/p2-specialist-carcass-contest-regression.js
 * Runs the actual contested kill function from game.js in an isolated
 * in-memory world. No real player saves are read or written.
 */
"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert");
const source=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");
new Function(source);
const start=source.indexOf("const SPECIALIST_HUNTERS=new Set(");
const end=source.indexOf("function nearbyFood()",start);
assert(start>0&&end>start,"specialist contest function absent");
const actual=source.slice(start,end);
for(const type of ["manul","tibetanFox","shoebill","penguin"]){
 for(const mode of ["visible","hidden","wall","owned","released","expired"]){
  const P={x:500,y:500,hidden:mode==="hidden"};
  const meat={x:530,y:500,type:"corpse",amount:30,claimedBy:"kill-a",claimUntil:mode==="expired"?90:120};
  const predator={type,x:550,y:500,hp:40,feedClaimToken:"kill-a",feedClaimUntil:120,
   companion:mode==="owned",releasedIndividualId:mode==="released"?"released-id":null,alert:0};
  const alerts=[];
  const env={P,mobs:[predator],species:{[type]:{name:type}},elapsed:100,
   dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lineBlocked:()=>mode==="wall",
   isPlayerConcealed:()=>mode==="hidden",notify:m=>alerts.push(m)};
  const f=new Function("env","with(env){"+actual+";return contestSpecialistKill;}")(env);
  const expected=mode==="visible";
  assert.strictEqual(f(meat),expected,type+"/"+mode+" contested status");
  assert.strictEqual(meat.amount,30,"meat must not be created or destroyed");
  assert.strictEqual(alerts.length,expected?1:0,"notice only for genuine theft");
  if(expected){
   assert(predator.alert>=5&&predator.search>=5,"predator did not pursue thief");
   assert.strictEqual(meat.claimedBy,null,"claim not released");
   assert.strictEqual(predator.feedClaimToken,null,"owner still feeding");
  }else{
   assert.strictEqual(meat.claimedBy,"kill-a","protected claim altered");
  }
 }
}
console.log("PASS: 4 species x 6 meat contest states; ownership, cover, player chase, meat preservation");

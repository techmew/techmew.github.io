// P2 specialist meat-transport encounter: executable regression, no live saves.
// Run: node neo-wild/p2-specialist-transport-regression.js
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");
new Function(source); // Full JavaScript parser, not bracket counting.
const start=source.indexOf("function updateFoodThief(m,dt,d){");
const end=source.indexOf("function updateChimpanzee(",start);
assert(start>0&&end>start,"live food interception function exists");
assert(source.includes('SPECIALIST_HUNTERS.has(m.type))&&updateFoodThief(m,dt,d)'),"real NPC update loop calls specialist intercept");
const body=source.slice(start,end);
const specialists=["manul","tibetanFox","shoebill","penguin"];
let assertions=0;
function simulate(type,opts={}){
 const P={x:100,y:100,r:20,carry:{type:"meat",animalType:"rabbit",amount:22},hidden:!!opts.hidden,jumpHeight:0,groundZ:0};
 const m={x:140,y:100,r:18,type,hp:100,stun:0,dir:0};
 const carcasses=[],species=Object.fromEntries(["dog",...specialists].map(t=>[t,{speed:120,name:t}]));
 let writes=0;
 const scope={P,carcasses,species,SPECIALIST_HUNTERS:new Set(specialists),
 atDen:()=>!!opts.den,insideShelter:()=>false,lineBlocked:()=>!!opts.blocked,
 waterDepth:()=>opts.deep?1:0,mountainHabitat:()=>true,
 saveAuto:()=>{writes++;return !opts.saveFails},
 notify:()=>{},label:()=>{},syncHUD:()=>{},playEffect:()=>{},
 steerPursuit:()=>0,clearStep:()=>true,move:(actor,dx,dy)=>{actor.x+=dx;actor.y+=dy}};
 const update=new Function(...Object.keys(scope),body+";return updateFoodThief;")(...Object.values(scope));
 for(let i=0;i<20;i++){update(m,.1,Math.hypot(m.x-P.x,m.y-P.y));if(!P.carry)break;}
 return {P,m,carcasses,writes};
}
for(const type of ["dog",...specialists]){
 let r=simulate(type);assert.equal(r.P.carry,null);assert.equal(r.carcasses.length,1);
 assert.equal(r.carcasses[0].amount,22);assert.equal(r.writes,1);assertions+=4;
 for(const blocked of [{hidden:true},{blocked:true},{den:true},{saveFails:true}]){
  r=simulate(type,blocked);assert(r.P.carry,"protected carried meat remains");
  assert.equal(r.carcasses.length,0);assertions+=2;
 }
}
for(const type of ["penguin","shoebill"]){
 const r=simulate(type,{deep:true});assert(r.P.carry);assert.equal(r.carcasses.length,0);assertions+=2;
}
console.log("P2 specialist transport regression PASS: "+assertions+" assertions; full game.js syntax PASS");

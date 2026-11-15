// node neo-wild/random-start-regression.js
// Real geography and spawn code; isolated in-memory collision/food checks.
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const game=fs.readFileSync(path.join(__dirname,"game.js"),"utf8"),mountain=fs.readFileSync(path.join(__dirname,"mountain.js"),"utf8");
new Function(game);new Function(mountain);
const win={};new Function("window",mountain)(win);const M=win.WildMountain;
function take(a,b){const i=game.indexOf(a),j=game.indexOf(b,i+a.length);assert(i>=0&&j>i,"source anchor "+a);return game.slice(i,j)}
const axes=game.match(/^const riverAxis=[^\n]+/m)?.[0];
assert(axes&&axes.includes("canalAxis"),"hydrology axes");
const source=axes+"\n"+take("function regionAt(x,y){","const EXPLORE_SITES=")+take("function waterDepth(x,y){","function shallowWater(")+take("const RANDOM_START_LAND=","let discoveredSites=")+";return {randomizedStart,starterFoodSpot,waterDepth};";
const maker=new Function("env","with(env){"+source+"}");
assert(game.includes("const origin=restoringSavedWorld?"),"Continue must preserve saved origin");
assert(game.includes("randomizedStart(choice);"),"new run must use random origin");
assert(game.includes("const starterFood=starterFoodSpot(P);"),"food must track new origin");
assert(game.includes("elapsed=newWorld?NEW_WORLD_START_ELAPSED"),"NEW GAME clock unchanged");
function rng(n){let x=(n*9973+51)>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}}
const types={cat:16,elephant:55,carp:15,shoebill:27,crow:14,otter:16,pacmanFrog:37};
let tests=0;
function check(x,msg){assert(x,msg);tests++}
for(const [type,r] of Object.entries(types)){
 const env={MOUNTAIN:M,WORLD:{w:13600,h:6000},TWO:Math.PI*2,elapsed:0,
  roadsX:[530,1410,2320,3270,4400,5320,6260,7340,8070],roadsY:[465,1170,1890,2800,3760,4820,5650],
  window:{WildDisaster:null},animals:{[type]:{r}},
  START_LOCATIONS:{home:{x:1860,y:1170,name:"home"},river:{x:7270,y:1700,name:"river"}},
  mountainHabitat:(x,y)=>x>=M.CITY_EDGE&&M.active(x,y),lineBlocked:()=>false};
 const api=maker(env);
 env.fishWaterAt=(x,y)=>api.waterDepth(x,y)>.035;
 env.waterBlocksLand=(x,y)=>api.waterDepth(x,y)>.0001;
 env.collides=(x,y,rad,actor,ignoreWater)=>M.blocked(x,y,rad)||
  (x>3450&&x<3530&&y>1620&&y<1770)||
  (!ignoreWater&&api.waterDepth(x,y)>.0001);
 const seen=new Set();
 for(let n=0;n<240;n++){
  const at=api.randomizedStart(type,rng(n));seen.add(at.id);
  check(at.x>r+20&&at.x<13600-r-20&&at.y>r+20&&at.y<6000-r-20,type+" world bounds "+n);
  check(!M.blocked(at.x,at.y,r+5),type+" blocked mountain "+n);
  check(type==="carp"?api.waterDepth(at.x,at.y)>.09:api.waterDepth(at.x,at.y)<=.0001,type+" water biome "+n);
  const food=api.starterFoodSpot({...at,type,r});
  check(Math.hypot(food.x-at.x,food.y-at.y)<=126,type+" accessible first food "+n);
  check(type==="carp"?api.waterDepth(food.x,food.y)>.035:api.waterDepth(food.x,food.y)<=.0001,type+" food terrain "+n);
 }
 check(seen.size===(type==="carp"?2:15),type+" region coverage "+[...seen].join(","));
}
const dens=take("const DEN_PATTERNS=[","let denSites=");
for(const id of ["northwood","foothill","ravine","alpine"])check(dens.includes('id:"'+id+'"'),"eastern shared den "+id);
console.log("PASS "+tests+" assertions; 15 land environments, 2 fish waterways, starter food, 4 mountain dens, Continue isolation");

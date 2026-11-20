/* P3 17 random start guidance source-backed Node regression (not Android/GPU).
 * Run: node neo-wild/p3-random-start-guidance-regression.cjs */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),east=read("east-expedition.js");
new Function(game);new Function(east);
const window={WildMountain:{height:()=>0}};
new Function("window",east)(window);
const E=window.WildEastExpedition;
const a=game.indexOf("function getObjective(){"),b=game.indexOf("\nfunction ",a+10);
assert(a>=0&&b>a);
const env={window,P:null,mode:"play",mission:0,freeStep:2,freeTarget:0,
 EXPLORE_SITES:[{x:10,y:20,id:"legacy"}],discoveredSites:[],eastWaterMask:0,eastTrailMask:0,
 eastSalvageObjective:()=>null,collides:()=>false,
 swimWaterDepth:(x,y)=>E.aquaticDepth(x,y),nearestGoal:xs=>xs[0],
 plants:[{x:30,y:40}],visibleShrub:()=>true};
const goal=new Function("env","with(env){"+game.slice(a,b)+";return getObjective;}")(env);
let n=0;const ok=(v,msg)=>{assert.ok(v,msg);n++;};
for(const [x,y] of [[8450,1680],[8680,1760],[9120,1870],[9350,1900],[9900,1980],[10320,2250],[10600,2450],[10740,2590],[10960,3280],[11280,3500],[11400,3540],[11980,3340],[12350,3250],[12720,3818],[13220,3797]]){
 env.P={x,y,type:"cat",hp:100};env.mission=0;
 const p=goal();ok(p?.eastTrail===true&&Number.isFinite(p.x)&&Number.isFinite(p.y),"land early "+x);
 env.mission=7;env.freeStep=2;ok(goal()?.eastTrail===true,"land late "+x);
}
for(const s of E.waterStations.slice(0,2)){
 env.P={x:s.x,y:s.y,type:"carp",hp:100};env.mission=0;
 ok(goal()?.label.includes("水"),"fish "+s.id);
}
env.P={x:10800,y:2500,type:"cat",hp:100};env.mission=1;
env.eastSalvageObjective=()=>({x:11111,y:2444,label:"番人",salvagePhase:"fight",eastTrail:true});
ok(goal()?.salvagePhase==="fight","guardian combat");
env.P={x:1000,y:1000,type:"cat",hp:100};
ok(goal()?.label==="緑の茂みで約1秒止まる","west tutorial");
env.mode="menu";ok(goal()===null,"menu");
ok(game.includes('const eastLive=mode==="play"'),"HUD survival info");
console.log("P3 RANDOM START GUIDANCE PASS "+n+" source-backed V8 checks");

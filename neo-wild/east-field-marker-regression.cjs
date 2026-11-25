const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync(__dirname+"/game.js","utf8");
const start=source.indexOf("function drawEastTrailScreenMarkers()");
const marker=source.slice(start,source.indexOf("\n}",start)+2);
const land={x:8360,y:1680,name:"東門",index:0};
const river={x:6880,y:5000,name:"水路",index:0};
const player={...land,type:"cat"};
const calls=[];
const ctx=new Proxy({},{get:(o,key)=>(...args)=>calls.push([key,...args])});
const visible=()=>({x:150,y:100});
const world={window:{WildEastExpedition:{stops:[land],waterStations:[river],visited:()=>true,waterVisited:()=>true}},
 P:player,mode:"play",eastArrival:null,elapsed:12,ctx,dpr:1,vw:390,vh:844,TWO:2*Math.PI,
 eastTrailMask:1,eastWaterMask:1,projectGroundLabel:visible,lineBlocked:()=>false,localizedCanvasLabel:t=>t};
vm.createContext(world);vm.runInContext(marker,world);
function draw(){
 calls.length=0;world.drawEastTrailScreenMarkers();
 assert.ok(!calls.some(([k])=>k==="fillRect"||k==="strokeRect"));
 return calls.filter(([k])=>k==="fillText").map(([,t])=>t);
}
assert.deepEqual(draw(),["東門"]);
Object.assign(player,river,{type:"carp"});
world.eastArrival={site:river,points:120,at:12,actor:player};
assert.deepEqual(draw(),["水路  +120"]);
assert.ok(calls.some(([k])=>k==="ellipse"));
world.elapsed+=2;
assert.deepEqual(draw(),["水路"]);
assert.ok(!calls.some(([k])=>k==="ellipse"));
world.lineBlocked=()=>true;
assert.deepEqual(draw(),[]);
world.lineBlocked=()=>false;world.projectGroundLabel=()=>({x:-90,y:130});
assert.deepEqual(draw(),[]);
console.log("PASS land and water markers, timed arrival, occlusion and viewport");

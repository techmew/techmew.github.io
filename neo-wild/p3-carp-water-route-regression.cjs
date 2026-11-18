/* P3 carp path collision integration; run: node p3-carp-water-route-regression.cjs */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const window={WildMountain:{height:()=>0}};
vm.runInNewContext(fs.readFileSync(__dirname+"/east-expedition.js","utf8"),{window});
const east=window.WildEastExpedition;
const player={x:11200,y:3450,hp:100,type:"carp"};
const target={x:12000,y:3450};
const pass=(x,y)=>x>=11000&&x<=12200&&y>=3350&&y<=3550&&!(x>11500&&x<11700&&y<3450);
const step=east.aquaticStep(player,target,pass);
assert(step.reachable&&pass(step.x,step.y),"first step must be wet and unobstructed");
assert(Math.hypot(step.x-player.x,step.y-player.y)<=114,"first step local");
const blocked=east.aquaticStep(player,target,()=>false);
assert(!blocked.reachable&&blocked.x===player.x,"blocked water never gives dry destination");
const nav=east.navigation(player,0,true,pass);
assert(nav.water&&nav.waterReachable&&pass(nav.x,nav.y),"live carp navigation respects water");
const source=fs.readFileSync(__dirname+"/game.js","utf8");
assert(source.includes('waterDepth(x,y)>.09&&!collides(x,y,15,P,true)'),"live game supplies real depth and collision");
assert(source.includes("route.navigation?.(P,eastTrailMask"),"tick invokes navigation");
console.log("p3 carp water route PASS: 6 assertions");

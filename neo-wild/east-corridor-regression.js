/* Regression for actual P3 navigation module and live HUD integration.
 * Run from neo-wild: node east-corridor-regression.js */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const window={WildMountain:{height:()=>0}};
vm.runInNewContext(fs.readFileSync(__dirname+"/east-expedition.js","utf8"),{window});
const e=window.WildEastExpedition;let checks=0;
function ok(x,m){assert(x,m);checks++;}
ok(e.stops.length===8,"eight original exploration stops");
ok(e.walkway.length===18,"18 existing traversable waypoints");
for(let i=0;i<e.walkway.length-1;i++){
 const [ax,ay]=e.walkway[i],[bx,by]=e.walkway[i+1];
 for(const t of [.1,.35,.65,.9]){
  const player={x:ax+(bx-ax)*t,y:ay+(by-ay)*t,hp:100,type:"cat"};
  const pos=e.routePosition(player),nav=e.navigation(player,0);
  ok(pos.distance<1e-5,"project actual segment "+i);
  ok(!nav.offPath,"do not flag on-corridor player");
  ok(nav.distance>0||i===0,"next waypoint selected");
 }
}
for(let i=0;i<e.walkway.length;i++){
 const [x,y]=e.walkway[i],p={x:x+350,y:y+280,hp:100,type:"cat"};
 const n=e.navigation(p,0);
 ok(Number.isFinite(n.x)&&Number.isFinite(n.y),"rejoin finite "+i);
 ok(n.offPath||n.routeDistance<=105,"detect off-route "+i);
}
for(const s of e.stops){
 const p={...s,hp:100,type:"cat"},n=e.navigation(p,(1<<s.index)-1);
 ok(!!n.stop&&!!n.section.label,"stop and biome guidance");
 ok(e.arrival(p,0)?.id===s.id,"stop arrival persists");
}
const source=fs.readFileSync(__dirname+"/game.js","utf8");
ok(source.includes("navigation?.(P,eastTrailMask,false)"),"navigation called in live tick");
ok(source.includes("guideWisp=waypoint&&!waypoint.blocked"),"route rejoin HUD connected");
ok(source.includes("route.wildlifeResponse?.(P,mobs"),"existing hostile ecology remains active");
ok(source.includes("eastTrailClaim(arrival,false)"),"actual exploration rewards connected");
ok(source.includes("eastTrailSupplyYears"),"save compatible resupply preserved");
console.log("east-corridor-regression PASS: "+checks+" assertions");

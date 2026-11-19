// node neo-wild/east-expedition-regression.js
// Source-backed P3 run tests. No localStorage/roster or browser mocking leaks.
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),mount=read("mountain.js"),routeJS=read("east-expedition.js"),gl=read("webgl3d.js"),index=read("index.html");
for(const s of [game,mount,routeJS,gl])new Function(s);
const win={};new Function("window",mount)(win);new Function("window",routeJS)(win);
const M=win.WildMountain,route=win.WildEastExpedition;
let tests=0;const ok=(x,m)=>{assert(x,m);tests++;},eq=(x,y,m)=>{assert.strictEqual(x,y,m);tests++;};
function part(a,b){let i=game.indexOf(a),j=game.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return game.slice(i,j);}
eq(route.stops.length,8,"stops");
eq(route.stops.map(x=>x.area).join("/"),"廃市街/郊外/原生林/山道/渓谷/水源/雪山/洞窟","world order");
for(const s of route.stops){
 ok(!M.blocked(s.x,s.y,21),s.id+" reachable landmark");ok(s.z>=0,s.id+" altitude");
 eq(route.arrival({x:s.x,y:s.y,hp:100},0)?.id,s.id,s.id+" discover at real collision XY");
}
const make=new Function("env","with(env){"+part("// P3 eastward expedition:","const CLAN_NAMES=")+";return {claim:eastTrailClaim,supply:tryEastTrailSupplies,tick:tickEastTrail,state:()=>({mask:eastTrailMask,years:[...eastTrailSupplyYears]})};}");
function fixture(){
 let api;const e={P:{x:8360,y:1680,r:16,type:"cat",hp:25,maxHp:100,sp:40,maxSp:100,hunger:100},
 mode:"play",WORLD:{w:13600,h:6000},MOUNTAIN:M,TWO:Math.PI*2,weather:"CLEAR",elapsed:0,
 totalScore:0,mobs:[],species:{dog:{prey:false}},carcasses:[],worldEventJournal:[],debugTutorialSession:null,
 window:{WildEastExpedition:route,WildTrophies:{record:()=>{}}},fail:false,saveRecords:[],tickets:[],notices:[],flee:0,
 collides:(x,y,r)=>M.blocked(x,y,r),waterBlocksLand:()=>false,lineBlocked:()=>false,notify:x=>e.notices.push(x),
 label:()=>{},syncHUD:()=>{},persistWorldChronicle:()=>{},startleCaveWildlife:()=>{e.flee++},
 awardGameplayGachaTicket:(k,m)=>e.tickets.push(k+":"+m),
 saveAuto:()=>{if(e.fail)return false;e.saveRecords.push({mask:api.state().mask,score:e.totalScore,foods:e.carcasses.length,hp:e.P.hp,events:e.worldEventJournal.slice()});return true}
 };
 api=make(e);return {e,api};
}
let {e,api}=fixture();
e.fail=true;
eq(api.claim(route.stops[0]),false,"denied save");eq(api.state().mask,0,"rollback progress");
eq(e.totalScore,0,"rollback score");eq(e.carcasses.length,0,"rollback dropped food");eq(e.P.hp,25,"rollback HP");eq(e.P.sp,40,"rollback SP");
eq(e.worldEventJournal.length,0,"rollback events");
e.fail=false;
for(const stop of route.stops){
 e.P.x=stop.x;e.P.y=stop.y;
 eq(api.claim(stop),true,"discover "+stop.id);
 ok(route.visited(api.state().mask,stop.index),"visited bit "+stop.id);
 eq(e.saveRecords.at(-1).mask,api.state().mask,"durable snapshot "+stop.id);
}
eq(route.count(api.state().mask),8,"all stamps");eq(e.tickets.length,4,"4 gacha milestones");
eq(e.worldEventJournal.length,8,"8 milestone world events");ok(e.flee>=3,"wild NPC flee connected");
eq(api.claim(route.stops[7]),false,"no double award");
eq(api.supply(),false,"repeat wait");
e.elapsed=360;eq(api.supply(),true,"3 world years revisit");
eq(e.tickets.length,4,"no ticket duplication on resupply");
e.weather="RAIN";e.P.x=11350;e.P.y=3550;const sp=e.P.sp;api.tick(.52);
ok(e.P.sp<sp,"rainy gorge stamina hazard");
ok(game.includes('eastTrailMask=window.WildEastExpedition?.cleanMask?.(snapshot.eastTrailMask)||0'),"legacy save 0 stamps");
ok(game.includes("eastTrailMask,eastTrailSupplyYears:[...eastTrailSupplyYears]"),"snapshot persists stamps");
ok(game.includes("tickEastTrail(dt);"),"actual game update loop");
ok(game.includes("if(longPress&&!P.carry&&tryEastTrailSupplies())return;"),"real action input");
ok(game.includes("renderedSceneCamera=use3D?"),"shared world camera after 2D/WebGL");
ok(game.includes("const elevation=(window.WildMountain?.height?.(x,y)||0)"),"FX terrain altitude");
ok(game.includes("landmarks:[...EXPLORE_SITES,...(window.WildEastExpedition?.stops||[]),...(window.WildEastExpedition?.waterStations||[])]"),"WebGL pipeline preserves eight terrestrial posts and adds four wet beacons");
ok(game.includes("drawPost2D?.(ctx,site,VIEW,cameraZoom,VIEW_DET,eastTrailMask)"),"2D post pipeline");
ok(gl.includes("if(site.eastRoute)"),"3D route geometry");
ok(index.includes("east-expedition.js?rev="),"index boots route");
console.log("PASS "+tests+" P3 assertions / save rollback, 8 area rewards, 4 tickets, refill, wet gorge hazard, AI, both renderers");

// node neo-wild/p3-connected-aquatic-regression.cjs
// Production-source aquatic graph, physical supply and SAVE_SCHEMA2 regressions.
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),mount=read("mountain.js"),east=read("east-expedition.js"),gl=read("webgl3d.js"),index=read("index.html");
let checks=0;
const ok=(x,m)=>{assert.ok(x,m);checks++;};
const eq=(x,y,m)=>{assert.strictEqual(x,y,m);checks++;};
for(const source of [game,mount,east,gl]){new Function(source);checks++;}
const window={};new Function("window",mount)(window);new Function("window",east)(window);
const M=window.WildMountain,R=window.WildEastExpedition;
const wet=(x,y)=>R.aquaticDepth(x,y)>.09&&!M.blocked(x,y,15,null,true);
eq(R.waterStations.length,4,"four fish supply stations");
ok(R.waterRibbons.length>100,"shared physical water geometry");
for(const site of R.waterStations){
 ok(wet(site.x,site.y),site.id+" is fish-navigable");
 eq(R.waterArrival({...site,type:"carp",hp:80},0)?.id,site.id,"physical discovery");
}
for(const [i,j] of [[0,2],[1,2],[2,3],[0,3],[1,3]]){
 ok(R.aquaticNetworkStep(R.waterStations[i],R.waterStations[j],wet).reachable,"joined route "+i+" "+j);
}
ok(M.blocked(R.waterStations[3].x,R.waterStations[3].y,15),"land bank still blocks");
ok(!M.blocked(R.waterStations[3].x,R.waterStations[3].y,15,null,true),"fish swims headwater");
for(const [i,j] of [[0,2],[1,2],[2,3]]){
 let p={...R.waterStations[i]},arrived=false;
 for(let k=0;k<140;k++){
  const n=R.aquaticNetworkStep(p,R.waterStations[j],wet);
  ok(n.reachable,"route did not fail at "+i+" "+k);
  if(n.targetReached||Math.hypot(p.x-R.waterStations[j].x,p.y-R.waterStations[j].y)<105){arrived=true;break;}
  ok(wet(n.x,n.y),"waypoint stayed underwater");
  ok(Math.hypot(n.x-p.x,n.y-p.y)>.01,"no stuck waypoint");
  p={x:n.x,y:n.y};
 }
 ok(arrived,"wet destination reached");
}
const from=game.indexOf("let eastTrailMask=0,eastTrailSupplyYears"),to=game.indexOf("function tickEastTrail(dt)",from);
ok(from>=0&&to>from,"extract actual claim and food");
let fixture,fail=false;const tickets=[],saves=[];
const env={P:{...R.waterStations[0],type:"carp",hp:24,maxHp:100,sp:26,maxSp:100,r:15},
 mode:"play",debugTutorialSession:null,elapsed:0,WORLD:{w:13600,h:6000},TWO:Math.PI*2,
 carcasses:[],totalScore:0,worldEventJournal:[],mobs:[],species:{},
 window:{WildEastExpedition:R,WildTrophies:{record:()=>{}}},
 swimWaterDepth:(x,y)=>R.aquaticDepth(x,y),
 collides:(x,y,r,actor)=>M.blocked(x,y,r,null,actor?.type==="carp"),
 waterBlocksLand:()=>false,notify:()=>{},label:()=>{},syncHUD:()=>{},
 persistWorldChronicle:()=>{},startleCaveWildlife:()=>{},
 awardGameplayGachaTicket:(k,m)=>tickets.push(k+":"+m),
 saveAuto:()=>{if(fail)return false;saves.push(fixture.state());return true}};
fixture=new Function("env","with(env){"+game.slice(from,to)+";return {claim:eastAquaticClaim,supply:tryEastTrailSupplies,state:()=>({mask:eastWaterMask,years:[...eastWaterSupplyYears],score:totalScore})};}")(env);
eq(fixture.claim(R.waterStations[0]),true,"first submerged reward");
eq(fixture.state().mask,1,"saved first bit");
ok(env.carcasses.length===1&&wet(env.carcasses[0].x,env.carcasses[0].y),"real wet food");
eq(fixture.claim(R.waterStations[0]),false,"no duplicate");
env.P.x=R.waterStations[1].x;env.P.y=R.waterStations[1].y;
eq(fixture.claim(R.waterStations[1]),true,"second submerged reward");
eq(tickets[0],"east-aquatic:1","water milestone ticket");
env.P.x=R.waterStations[2].x;env.P.y=R.waterStations[2].y;
const snapshot={...fixture.state(),food:env.carcasses.length,hp:env.P.hp,sp:env.P.sp,events:env.worldEventJournal.length};
fail=true;eq(fixture.claim(R.waterStations[2]),false,"refused write");
eq(fixture.state().mask,snapshot.mask,"rollback mask");
eq(fixture.state().score,snapshot.score,"rollback score");
eq(env.carcasses.length,snapshot.food,"rollback food");
eq(env.P.hp,snapshot.hp,"rollback HP");
eq(env.P.sp,snapshot.sp,"rollback SP");
eq(env.worldEventJournal.length,snapshot.events,"rollback journal");
fail=false;eq(fixture.claim(R.waterStations[2]),true,"reclaim after failed save");
env.elapsed=360;env.P.x=R.waterStations[0].x;env.P.y=R.waterStations[0].y;
eq(fixture.supply(),true,"3-year underwater resupply");
eq(tickets.length,1,"revisit no extra draw");
const a=game.indexOf("eastWaterMask=window.WildEastExpedition?.cleanWaterMask?.(snapshot.eastWaterMask)||0;");
const b=game.indexOf("eastTrailClock=0;",a);
ok(a>=0&&b>a,"old-save restore actual code");
const restore=new Function("window","snapshot","let eastWaterMask=0,eastWaterSupplyYears=[];"+game.slice(a,b)+";return {mask:eastWaterMask,years:eastWaterSupplyYears};");
const old=restore(window,{}),resumed=restore(window,{eastWaterMask:3,eastWaterSupplyYears:[1,2,-99,-99]});
eq(old.mask,0,"old SAVE_SCHEMA2 default");eq(old.years[0],-99,"old refill default");
eq(resumed.mask,3,"continue persisted discoveries");eq(resumed.years[1],2,"continue persisted year");
ok(game.includes("eastWaterMask,eastWaterSupplyYears:[...eastWaterSupplyYears]"),"saved snapshot fields");
ok(game.includes("tickEastTrail(dt);"),"real update loop");
ok(game.includes("if(longPress&&!P.carry&&tryEastTrailSupplies())return;"),"existing long press action");
ok(game.includes("drawPost2D?.(ctx,site,VIEW,cameraZoom,VIEW_DET,eastWaterMask)"),"Canvas wet beacon");
ok(gl.includes("if(site.waterRoute)"),"3D wet beacon");
ok(game.includes("waterRibbons||[]")&&gl.includes("waterRibbons||[]"),"same geometry 2D and WebGL");
ok(index.includes("east-expedition.js?rev="),"boot script present");
console.log("PASS "+checks+" P3 aquatic production-backed checks; not a real browser/Android/GPU test");

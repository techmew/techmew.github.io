/* P3 weapon sortie priority + mountain-route regression. Run with Node:
 * node neo-wild/p3-sortie-priority-route-regression.cjs
 * V8/DOM-free source test; not a real browser, Android or GPU acceptance. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),east=read("east-expedition.js"),arsenal=read("wild-arsenal.js");
for(const source of [game,east,arsenal])new Function(source);
let tests=0;const ok=(x,m)=>{assert.ok(x,m);tests++},eq=(x,y,m)=>{assert.strictEqual(x,y,m);tests++};
const db=new Map(),localStorage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k)};
const win={localStorage,WildMountain:{height:()=>0}};
new Function("window",east)(win);new Function("window",arsenal)(win);
const E=win.WildEastExpedition,A=win.WildArsenal;
eq(E.stops.length,8,"existing eight expedition stops");
eq(A.owners.length,35,"existing 35 owners");eq(A.MAX,240,"existing 240 vault");
const begin=game.indexOf("function eastSalvageObjective(){"),end=game.indexOf("function getObjective(){",begin);
ok(begin>0&&end>begin,"live source objective code present");
const P={type:"cat",hp:100,x:10740,y:2590,base:{name:"猫"},squadIndividualId:"p3-unit"};
const den={x:9320,y:1877},drop={id:"supply:near",x:10760,y:2600,guardState:"cleared"};
const boss={type:"wolf",hp:1500,maxHp:1500,x:10960,y:3280,strongBoss:true};
const env={P,window:win,weaponScraps:[drop],mobs:[boss],denSites:[den],species:{cat:{name:"猫"},wolf:{name:"狼"}},
 lineBlocked:()=>true,dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)};
const objective=new Function("env","with(env){"+game.slice(begin,end)+"return eastSalvageObjective;}")(env);
eq(objective()?.salvagePhase,"pickup","unarmed player sees real cache");
let catItem;
for(let seed=1;seed<250&& !catItem;seed++){const result=A.open({id:"p3:test:"+seed,seed,x:10600});
 if(result.item?.owner==="cat")catItem=result.item;}
ok(catItem,"legitimate cache reveals matching player gear");
let next=objective();
eq(next.salvagePhase,"equip","equip takes priority over endless nearby scrap");
eq(next.targetX,den.x,"den world target unchanged");
ok(next.routeVia,"mountain corridor guide used for distant den");
ok(A.equip(P,catItem.id).ok,"actual vault equips one living individual");
next=objective();
eq(next.salvagePhase,"boss","live boss takes priority over nearby scrap");
eq(next.targetX,boss.x,"boss uses actual world actor coordinate");
ok(A.damage(P,boss,100)>100,"real boss damage multiplier retained");
const guardian={type:"wolf",hp:210,maxHp:210,x:10770,y:2600,salvageCacheId:drop.id};
env.mobs.push(guardian);drop.guardState="engaged";
next=objective();
eq(next.salvagePhase,"fight","ongoing nearby NPC encounter overrides den/boss");
eq(next.targetX,guardian.x,"live guardian world target retained");
guardian.hp=0;drop.guardState="cleared";
eq(objective()?.salvagePhase,"boss","completed fight returns to boss");
env.mobs=[guardian];eq(objective()?.salvagePhase,"pickup","without boss, nearby cleared cache remains actionable");
for(const s of E.stops){const pos=E.groundGuide(P,s,()=>true);
 ok(pos&&Number.isFinite(pos.x)&&Number.isFinite(pos.y),"all 8 eastern targets have finite route guidance "+s.id);
 eq(pos.goalX,s.x,"guide retains exact original world X "+s.id);}
const clear=E.groundGuide(P,{x:10770,y:2600},()=>false);
eq(clear.via,false,"nearby clear direct line remains direct");
eq(clear.x,10770,"no artificial rerouting on nearby loot");
const away=E.groundGuide({x:8700,y:1764},{x:13220,y:3797},()=>true);
ok(away.via&&away.waypoint>=0&&away.x!==13220,"cliff-spanning objective follows a corridor waypoint");
eq(A.equippedFor(P).id,catItem.id,"individual ID gear persists through goal transitions");
ok(game.includes("SAVE_SCHEMA")&&game.includes("eastTrailMask"),"legacy world save contract retained");
console.log("P3 SORTIE PRIORITY + ROUTE PASS: "+tests+" assertions (V8 production source; not browser/GPU/Android)");

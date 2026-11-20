"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");
const a=src.indexOf("function salvageWaveSize(drop){"),b=src.indexOf("function tickWeaponScraps(dt){",a);
assert.ok(a>=0&&b>a,"production source");const fn=src.slice(a,b);
const P={level:12,x:13100,y:3800,hp:100},mobs=[],WORLD={w:14000,h:7000},species={wolf:{prey:false}};
const env={P,mobs,elapsed:300,mode:"play",WORLD,species,window:{WildArsenal:{},WildFauna:{weight:()=>1}},
 TWO:Math.PI*2,collides:()=>false,waterDepth:()=>0,regionAt:()=> "snow",day:3,weather:"clear",
 notify:()=>{},saveAuto:()=>true,atDen:()=>false,dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),spawnMob:()=>false};
const api=new Function("env","with(env){"+fn+";return {salvageWaveSize,salvageRemaining,wakeWeaponScrapGuardian}}")(env);
let checks=0;const eq=(a,b,m)=>{assert.strictEqual(a,b,m);checks++};
const drop={id:"scrap:pack:recovery",x:13100,y:3800,seed:51,guardState:"pending",guardianAwake:false,siegeTotal:3,siegeDefeated:2};
eq(api.salvageRemaining(drop),1,"saved partial wave");eq(api.salvageWaveSize(drop),3,"original highland size");
const enemy={x:13130,y:3820,hp:30,type:"wolf",alert:0,search:0};mobs.push(enemy);
assert.ok(api.wakeWeaponScrapGuardian(drop));checks++;
eq(drop.guardState,"engaged","resumed");eq(drop.siegeDefeated,2,"kills persisted");
eq(drop.siegeTotal,3,"total persisted");eq(enemy.salvageCacheId,drop.id,"live NPC assigned");

// Source-backed partial-wave quota: one replacement kill cannot bypass
// two still owed kills from the original persisted three-guardian encounter.
const ka=src.indexOf("function recordWeaponScrapGuardianDefeat(m){");
const kb=src.indexOf("function kill(m){",ka);
assert.ok(ka>=0&&kb>ka);
const siege={id:"scrap:quota",guardState:"engaged",guardianAwake:true,siegeTotal:3,siegeDefeated:1};
const world={weaponScraps:[siege],mobs:[{salvageCacheId:siege.id,hp:0}],
 elapsed:350,notify:()=>{},saveAuto:()=>true};
const defeat=new Function("env","with(env){"+src.slice(ka,kb)+
 ";return recordWeaponScrapGuardianDefeat}")(world);
assert.ok(defeat(world.mobs[0]));checks++;
eq(siege.guardState,"pending","first replacement defeat still locked");
eq(siege.siegeDefeated,2,"second credited kill");
eq(siege.guardianAwake,false,"another physical guardian required");
eq(siege.guardRetryAt,352,"re-arm in game time");
world.mobs=[{salvageCacheId:siege.id,hp:0}];
siege.guardState="engaged";siege.guardianAwake=true;
assert.ok(defeat(world.mobs[0]));checks++;
eq(siege.guardState,"cleared","third actual kill unlocks");
eq(siege.siegeDefeated,3,"saved quota fulfilled");

console.log("P3 SIEGE RECOVERY PASS "+checks+" V8 assertions");

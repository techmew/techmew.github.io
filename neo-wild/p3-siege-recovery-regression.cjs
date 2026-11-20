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
console.log("P3 SIEGE RECOVERY PASS "+checks+" V8 assertions");

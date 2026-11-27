/* Production debug boss bridge + final-boss AI/HP persistence, V8 mock.
 * node neo-wild/debug-world-end-regression.cjs
 * Browser/Android and actual WebGL FPS are NOT tested here. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const game=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");
const debug=fs.readFileSync(path.join(__dirname,"debug-mode.js"),"utf8");
const worldSrc=fs.readFileSync(path.join(__dirname,"world-end.js"),"utf8");
const index=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
new Function(game);new Function(debug);new Function(worldSrc);
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++};
const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const win={WildDebugSandbox:{active:true}};
new Function("window","localStorage",worldSrc)(win,storage);
const start=game.indexOf(" listBosses(){"),end=game.indexOf(" listDens(){",start);
ok(start>0&&end>start,"extract production debug boss API");
const env={window:win,mode:"play",P:{x:2500,y:2000,r:20,hp:100,vx:0,vy:0},
 WORLD:{w:13500,h:6000},elapsed:0,mobs:[],STRONG_TRAITS:{alpha:{effect:"test"}},
 STRONG_NAMES:{alpha:"Alpha"},STRONG_REGIONS:{0:["alpha"]},districts:["city"],
 dayLightProfile:()=>({hour:8}),syncHUD(){},saveAuto:()=>true,regionAt:()=>0,
 spawnStrongBoss:()=>false,collides:()=>false,notify(){},
 strongBossAlive:()=>env.mobs.find(m=>m.hp>0&&m.strongBoss)||null};
const api=new Function("env","with(env){return ({"+game.slice(start,end)+"});}")(env);
ok(api.listBosses().some(b=>b.id==="worldEnd"&&b.name.includes("この世の終わり")),"selectable final boss");
ok(api.spawnBoss("worldEnd"),"debug summons boss without advancing YEAR");
ok(env.mobs.length===1&&env.mobs[0].type==="worldEnd"&&env.mobs[0].hp===3600,"real final monster created");
ok(win.WildWorldEnd.read().stage==="active","real boss state persisted");
win.WildWorldEnd.tick({P:env.P,mobs:env.mobs,year:100,elapsed:0,dt:.05,WORLD:env.WORLD,collides:env.collides});
ok(env.mobs[0].worldEndBoss&&env.mobs[0].strongBoss,"real battle AI active");
ok(!api.spawnBoss("worldEnd"),"no duplicate boss");
ok(api.weakenBoss()&&env.mobs[0].hp===1&&win.WildWorldEnd.read().hp===1,"debug boss HP1 persists");
ok(api.clearBoss()&&env.mobs.length===0&&win.WildWorldEnd.read().stage==="defeated","cleared without instant re-spawn");
ok(api.spawnBoss("worldEnd")&&env.mobs.length===1,"re-summon is possible in isolated QA");
win.WildDebugSandbox.active=false;
ok(!api.spawnBoss("worldEnd"),"normal play cannot summon prematurely");
ok(!win.WildWorldEnd.tick({P:env.P,mobs:[],year:5,elapsed:0,dt:0,WORLD:env.WORLD,collides:env.collides}),"normal YEAR100 gate intact");
ok(game.includes("year:Math.max(100,currentWorldYear)"),"main AI loop runs QA boss below YEAR100");
ok(debug.includes("強敵・最終ボス21種類")&&debug.includes('value="SNOW"'),"debug boss and snowfall controls shown");
ok(index.includes("debug-mode.js?rev=debug-end-snow-lod-20261127")&&
 index.includes("game.js?rev=debug-end-snow-lod-20261127"),"fresh assets");
console.log("DEBUG WORLD END PASS "+checks+" conditions (production source/mock, not Android)");

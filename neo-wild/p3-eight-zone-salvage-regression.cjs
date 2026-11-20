/* Eastern eight-site live cache + global objective regression.
 * node neo-wild/p3-eight-zone-salvage-regression.cjs
 * Source-extracted gameplay and persistent weapon vault; not a browser/GPU test. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,name),"utf8");
const game=read("game.js"),arsenal=read("wild-arsenal.js"),east=read("east-expedition.js");
for(const s of [game,arsenal,east])new Function(s);
const part=(a,b)=>{const i=game.indexOf(a),j=game.indexOf(b,i+a.length);assert(i>=0&&j>i);return game.slice(i,j)};
const store=new Map(),localStorage={
 getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const win={localStorage,WildMountain:{height:()=>0}};
new Function("window",east)(win);new Function("window",arsenal)(win);
const E=win.WildEastExpedition,A=win.WildArsenal;
const source=part("function spawnWeaponScrap(","function scrapLivingGuardian(")+
 part("function eastSalvageObjective(){","function getObjective(){");
const env={window:win,elapsed:300,mode:"play",debugTutorialSession:null,scoreRunId:"east-test",
 P:{type:"cat",x:8400,y:1680,hp:100,maxHp:100,level:10},WORLD:{w:13600,h:6000},
 weaponScraps:[],weaponScrapSerial:0,weaponScrapClock:0,weaponGuardianClock:0,
 mobs:[],carcasses:[],denSites:[],species:{cat:{name:"猫"}},TWO:Math.PI*2,
 rnd:(a,b)=>a+(b-a)*.3,collides:()=>false,waterDepth:()=>0,
 dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lineBlocked:()=>false,
 wakeWeaponScrapGuardian:()=>false};
const api=new Function("env","with(env){"+source+
 ";return {spawnWeaponScrap,tickWeaponScraps,eastSalvageObjective};}")(env);
let checks=0;function ok(v,m){assert.ok(v,m);checks++}
ok(E.stops.length===8,"eight source stops");
for(const stop of E.stops){
 env.P.x=Math.max(8400,stop.x);env.P.y=stop.y;
 const before=env.weaponScraps.length;
 api.tickWeaponScraps(.05);
 ok(env.weaponScraps.length===before+1,"arrival creates contested physical cache at "+stop.id);
 const drop=env.weaponScraps.at(-1);
 ok(drop.siteId===stop.id&&drop.guardState==="pending","cache is named and locked "+stop.id);
 ok(drop.x>=8400&&Math.hypot(drop.x-stop.x,drop.y-stop.y)<=260,"cache within region and eastern-only "+stop.id);
 const result=A.open(drop);
 ok(result.ok&&!result.duplicate,"durable species-specific reward "+stop.id);
 env.weaponScraps.pop();
 const count=A.read().vault.items.length;
 api.tickWeaponScraps(.05);
 ok(A.read().vault.items.length===count&&env.weaponScraps.length===before,
  "collected cache cannot reappear on repeat visit "+stop.id);
}
env.P.x=8400;env.P.y=1680;
env.weaponScraps=[{id:"distant-actual-cache",x:13220,y:3797,guardState:"pending",guardianAwake:false}];
const objective=api.eastSalvageObjective();
ok(objective?.scrapId==="distant-actual-cache","objective discovers distant real cache");
ok(objective.salvagePhase==="guard","remote target still requires combat");
ok(objective.targetX===13220&&objective.targetY===3797,"objective preserves physical target coordinates");
const before=A.read().vault.items.length;
const reloaded={localStorage};
new Function("window",arsenal)(reloaded);
ok(reloaded.WildArsenal.read().vault.items.length===before,"reload preserves all 8 site rewards");
ok(reloaded.WildArsenal.read().vault.items.every(i=>i.id.startsWith("scrap-site:east-test:")),"site claims survive reload");
console.log("P3 eight-zone salvage PASS "+checks+" source-backed V8 checks (not Android/WebGL)");

// node neo-wild/weapon-arsenal-regression.js
// Real arsenal + actual game action/eastern spawn code; isolated in-memory storage.
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),arsenal=read("wild-arsenal.js"),mountain=read("mountain.js");
const routeCode=read("east-expedition.js"),webgl=read("webgl3d.js"),backup=read("save-backup.js");
const html=read("index.html"),css=read("visual.css"),fauna=read("fauna.js");
for(const source of [game,arsenal,mountain,routeCode,webgl,backup,fauna])new Function(source);
let tests=0;
function ok(v,m){assert(v,m);tests++}
function eq(a,b,m){assert.strictEqual(a,b,m);tests++}
function part(source,start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 ok(a>=0&&b>a,"source segment "+start);return source.slice(a,b);
}
const db=new Map();
const localStorage={getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k)};
const window={localStorage};new Function("window",arsenal)(window);
new Function("window",mountain)(window);new Function("window",routeCode)(window);
const a=window.WildArsenal,M=window.WildMountain;
const expected=[...fauna.matchAll(/\["([^"]+)","[^"]+","(?:日本|世界)"/g)].map(m=>m[1]);
eq(a.owners.length,35,"35 weapon owners");eq(expected.length,35,"35 gacha roster");
for(const id of expected)ok(a.owners.some(w=>w.id===id),"species "+id);
eq(a.grades.reduce((n,g)=>n+g.weight,0),1000,"weights exactly 100%");
const dist=new Map(a.grades.map(g=>[g.id,0]));let otherThanCat=0;
for(let seed=1;seed<=20000;seed++){
 const item=a.derive({id:"scrap:qa:"+seed,seed});
 ok(item,"every seed reveals a real weapon");
 dist.set(item.rarity,dist.get(item.rarity)+1);
 if(item.owner!=="cat")otherThanCat++;
}
ok(otherThanCat>18000,"weapon may belong to someone else");
ok(dist.get("legendary")<dist.get("epic")&&dist.get("epic")<dist.get("rare"),"rarity decreases");
const drop={id:"scrap:qa:a",x:9300,y:1900,seed:4874};
const found=a.open(drop);
ok(found.ok&&!found.duplicate,"first claim");
ok(a.open(drop).duplicate,"claim is idempotent");
eq(a.read().vault.items.length,1,"durable inventory count");
ok(!a.open({...drop,id:"scrap:qa:city",x:1800}).ok,"no city weapons");
const actor={type:found.item.owner,squadIndividualId:"unit-1"};
ok(a.equip(actor,found.item.id).ok,"equip matching character");
eq(a.equippedFor(actor).id,found.item.id,"individual equipment");
eq(a.equippedFor({...actor,squadIndividualId:"unit-2"}),null,"other individual not equipped");
ok(!a.equip({...actor,type:"NON_MATCH"},found.item.id).ok,"wrong owner");
ok(a.damage(actor,{strongBoss:true},100)>a.damage(actor,{strongBoss:false},100),"boss-specific edge");
eq(a.damage({...actor,squadIndividualId:"unit-2"},{strongBoss:true},100),100,"other individual not powered");
const enemy={x:13550,hp:100,maxHp:100,damageScale:1,speedScale:1};
a.enemyBuff(enemy,{prey:false});eq(enemy.hp,194,"strong eastern cave NPC");
a.enemyBuff(enemy,{prey:false});eq(enemy.hp,194,"no double scaling");
const animal={x:13000,hp:100,maxHp:100};a.enemyBuff(animal,{prey:true});eq(animal.hp,100,"prey excluded");
const handler=part(game,"function equippedWeapon(){","function contextAction(longPress=false){")+
 part(game,"function contextAction(longPress=false){","const RUSH_COST=");
function fixture(id,failWorld=false){
 const env={window,weaponScraps:[{id,x:9320,y:1877,seed:21232,foundAt:2,pulse:0}],
 weaponScrapSerial:44,weaponScrapClock:0,scoreRunId:"attempt-qa-run",
 P:{x:9320,y:1877,type:"cat",hp:100,r:16},mode:"play",elapsed:170,
 TWO:Math.PI*2,MOUNTAIN:M,WORLD:{w:13600,h:6000},carcasses:[],mobs:[],debugTutorialSession:null,
 dist:(x,y)=>Math.hypot(x.x-y.x,x.y-y.y),lineBlocked:()=>false,
 mountainHabitat:(x,y)=>x>=M.CITY_EDGE&&M.active(x,y),
 waterDepth:()=>0,collides:(x,y,r)=>M.blocked(x,y,r),rnd:(lo,hi)=>lo+Math.random()*(hi-lo),
 $:()=>null,notify:()=>{},label:()=>{},syncHUD:()=>{},saveAuto:()=>!failWorld,
 isControlBlocked:()=>false,tryReleaseCaveSeal:()=>false,tryEastTrailSupplies:()=>false,
 atDen:()=>false,nearbyFood:()=>null,markTerritory:()=>false};
 const api=new Function("env","with(env){"+handler+"return {contextAction,pickWeaponScrap,spawnWeaponScrap};}")(env);
 return {env,api};
}
let {env,api}=fixture("scrap:qa:pickup");
api.contextAction(false);
eq(env.weaponScraps.length,0,"action picks scrap");ok(a.alreadyClaimed("scrap:qa:pickup"),"vault claims pickup");
({env,api}=fixture("scrap:qa:write-fail"));
const originalSet=localStorage.setItem;
localStorage.setItem=()=>{throw Error("quota exceeded")};
api.contextAction(false);eq(env.weaponScraps.length,1,"storage error retains ground item");
localStorage.setItem=originalSet;
({env,api}=fixture("scrap:qa:world-fail",true));
api.contextAction(false);eq(env.weaponScraps.length,0,"claimed item removed locally");
ok(a.alreadyClaimed("scrap:qa:world-fail"),"world save error retains verified vault");
({env,api}=fixture("scrap:qa:spawn"));env.weaponScraps=[];
ok(api.spawnWeaponScrap(true),"dynamic east loot spawn");
for(const q of env.weaponScraps){ok(q.x>=8400,"only east spawn");ok(!M.blocked(q.x,q.y,25),"physical collision");}
const backupMethods=part(backup,'const WEAPON_VAULT_KEY=',"function mergeIds(records,key,older){");
const merge=new Function("window",backupMethods+";return mergeWeaponVault;")(window);
const oldVault={version:1,items:[a.derive({id:"scrap:qa:old",seed:123})],equipped:{}};
const merged={"wild-reclaim-weapon-vault-v1":JSON.stringify(oldVault)};
merge(merged,{"wild-reclaim-weapon-vault-v1":db.get(a.KEY)});
const restored=JSON.parse(merged[a.KEY]);
ok(restored.items.some(i=>i.id==="scrap:qa:old"),"imported older finds kept");
ok(restored.items.some(i=>i.id==="scrap:qa:pickup"),"newer local finds kept");
ok(game.includes("weaponScraps:weaponScraps.slice(0,18),weaponScrapSerial"),"drop world snapshot");
ok(game.includes("!window.WildArsenal?.alreadyClaimed?.(d.id)"),"claimed drop omitted after resume");
ok(game.includes("window.WildArsenal?.enemyBuff?.(mobs[mobs.length-1],s)"),"enemy spawn AI linked");
ok(game.includes("const damage=weaponHitDamage(m")&&game.includes("const hit=weaponHitDamage(m"),"melee and specials use gear");
ok(game.includes("drawWeaponScrap2D(scrap)")&&webgl.includes("for(const scrap of o.weaponScraps||[])"),"2D/WebGL scrap models");
ok(webgl.includes("const weapon=o.equippedWeapon"),"3D wearable");
ok(html.indexOf("wild-arsenal.js?rev=")<html.indexOf("game.js?rev="),"asset dependency");
ok(html.includes('id="weapon-vault-list"')&&css.includes(".weapon-vault-list"),"responsive den vault UI");
ok(backup.includes("mergeWeaponVault(merged,before)"),"JSON restore weapons merge");
console.log("PASS "+tests+" weapon assertions; 35 owners, 5 tiers, pickup/save failures, combat, loot, all-den storage and JSON backup");

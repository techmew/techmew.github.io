/* P3 full sortie integration: real extracted gameplay + DOM/Canvas mock.
 * Run with Node: node neo-wild/p3-salvage-sortie-dom-regression.cjs
 * Does not claim GPU pixels, browser frame rendering, Android or FPS. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,name),"utf8");
const game=read("game.js"),arsenal=read("wild-arsenal.js"),east=read("east-expedition.js");
const mountain=read("mountain.js"),backup=read("save-backup.js"),gl=read("webgl3d.js"),html=read("index.html");
for(const source of [game,arsenal,east,mountain,backup,gl])new Function(source);
let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++},eq=(a,b,m)=>{assert.strictEqual(a,b,m);checks++};
function part(source,start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 ok(a>=0&&b>a,"production source "+start);
 return source.slice(a,b);
}
const data=new Map(),localStorage={
 getItem:key=>data.has(key)?data.get(key):null,
 setItem:(key,value)=>data.set(key,String(value)),
 removeItem:key=>data.delete(key),
 get length(){return data.size;},
 key:i=>[...data.keys()][i]||null
};
const win={localStorage};new Function("window",mountain)(win);
new Function("window",east)(win);new Function("window",arsenal)(win);
const A=win.WildArsenal,E=win.WildEastExpedition,M=win.WildMountain;
class Element {
 constructor(tag){this.tagName=tag;this.children=[];this.handlers={};this.textContent="";this.disabled=false;}
 replaceChildren(...xs){this.children=[...xs];}
 append(...xs){this.children.push(...xs);}
 addEventListener(type,cb){this.handlers[type]=cb;}
 click(){if(!this.disabled)this.handlers.click?.();}
}
const nodes=new Map(["weapon-vault-list","weapon-vault-status","weapon-unequip"].map(x=>[x,new Element("div")]));
const document={getElementById:key=>nodes.get(key)||null,createElement:tag=>new Element(tag)};
const canvasLabels=[];
const ctx={
 save(){},restore(){},setTransform(){},translate(){},rotate(){},fillRect(){},strokeRect(){},
 beginPath(){},ellipse(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},
 fillText:(label,x,y)=>canvasLabels.push({label,x,y})
};
const code=part(game,"function nearestWeaponScrap(range=95){","function drawEquippedWeapon2D(actor){")+
 part(game,"function contextAction(longPress=false){","const RUSH_COST=")+
 part(game,"function recordWeaponScrapGuardianDefeat(m){","function kill(m){")+
 part(game,"function eastSalvageObjective(){","function getObjective(){");
const make=new Function("env","with(env){"+code+
 ";return {nearestWeaponScrap,spawnWeaponScrap,wakeWeaponScrapGuardian,tickWeaponScraps,pickWeaponScrap,contextAction,recordWeaponScrapGuardianDefeat,eastSalvageObjective,renderWeaponVault,equipWeaponAtDen,drawWeaponScrapLabels,drawWeaponScrap2D};}");
let seed=1;while(A.derive({id:"scrap:p3-sortie:1",seed}).owner==="cat")seed++;
const notifications=[],saves=[];
const env={
 window:win,document,ctx,dpr:1,vw:320,vh:260,elapsed:240,day:4,mode:"play",
 TWO:Math.PI*2,P:{type:"cat",base:{name:"猫"},squadIndividualId:"living-cat",hp:150,maxHp:150,x:10740,y:2590,r:18},
 WORLD:{w:13600,h:6000},MOUNTAIN:M,weaponScraps:[
  {id:"scrap:p3-sortie:1",seed,x:10740,y:2590,foundAt:2,pulse:0,guardianAwake:false,guardState:"pending"}
 ],weaponScrapClock:0,weaponGuardianClock:0,weaponScrapSerial:1,scoreRunId:"p3-test",
 mobs:[],carcasses:[],species:{cat:{name:"猫",prey:false},wolf:{name:"狼",prey:false},rabbit:{name:"兎",prey:true}},denSites:[{x:9300,y:1900,name:"原生林の巣"}],
 debugTutorialSession:null,dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 lineBlocked:()=>false,collides:(x,y,r)=>M.blocked(x,y,r),
 waterDepth:()=>0,rnd:(a,b)=>a+(b-a)*.37,regionAt:()=>7,
 atDen:()=>Boolean(env.inDen),notify:msg=>notifications.push(msg),
 label:()=>{},syncHUD:()=>{},isControlBlocked:()=>false,
 tryReleaseCaveSeal:()=>false,tryEastTrailSupplies:()=>false,
 nearbyFood:()=>false,markTerritory:()=>false,nearbyFood:()=>null,
 carryFood:()=>false,putDownFood:()=>false,eat:()=>false,
 projectGroundLabel:()=>({x:150,y:150}),
 saveAuto:()=>{
  if(env.failSave)return false;
  const snapshot={version:2,elapsed:env.elapsed,player:{...env.P},weaponScraps:env.weaponScraps.map(q=>({...q})),
   weaponScrapSerial:env.weaponScrapSerial,mobs:env.mobs.map(m=>({...m})),denMeatLots:[{id:"untouched-meat",amount:17}]};
  data.set("wild-reclaim-autosave-v2",JSON.stringify(snapshot));saves.push(snapshot);
  return true;
 },
 spawnMob:(_initial,_preyOnly,_nearby,spot)=>{
  if(env.mobs.length>=8)return false;
  const guard={x:spot.x,y:spot.y,type:"wolf",hp:100,maxHp:100,r:24,
   alert:0,search:0,wander:0,damageScale:1,speedScale:1};
  A.enemyBuff(guard,{prey:false});env.mobs.push(guard);return true;
 },
 $:key=>document.getElementById(key)
};
const api=make(env);
const first=api.eastSalvageObjective();
eq(first.salvagePhase,"guard","right-side start identifies dangerous cache");
eq(first.x,10740,"objective uses physical cache X");
api.tickWeaponScraps(1.6);
const guardian=env.mobs[0];
ok(guardian?.salvageCacheId==="scrap:p3-sortie:1","existing live NPC is assigned to exact cache");
ok(guardian.hp>100&&guardian.alert>=7,"eastern enemy inherits actual threat strength");
const fight=api.eastSalvageObjective();
eq(fight.salvagePhase,"fight","objective now tracks actual living NPC");
eq(fight.x,guardian.x,"guardian objective tracks moving actor position");
api.drawWeaponScrapLabels();
ok(canvasLabels.some(q=>q.label.includes("番人｜討伐対象")),"2D Canvas actually draws live guardian label");
const beforePickup=env.weaponScraps.length;
api.contextAction(false);
eq(env.weaponScraps.length,beforePickup,"locked cache rejects Action before fight");
ok(!A.alreadyClaimed("scrap:p3-sortie:1"),"no weapon granted by failed early Action");
// The normal combat kill calls the same production kill-credit function.
guardian.hp=0;
ok(api.recordWeaponScrapGuardianDefeat(guardian),"actual tagged kill unlocks and saves");
eq(api.eastSalvageObjective().salvagePhase,"pickup","victory updates next objective");
api.contextAction(false);
eq(env.weaponScraps.length,0,"Action now claims physical scrap");
const found=A.read().vault.items.find(x=>x.id==="scrap:p3-sortie:1");
ok(found&&found.owner!=="cat","identified item can belong to another species");
ok(notifications.some(x=>x.includes("別の動物専用")),"wrong-species discovery is explained");
eq(saves.at(-1).weaponScraps.length,0,"claimed scrap absent in persisted world");
const occupiedBefore=A.read().vault.items.length;
// Switch the real species and individual; same vault survives the title scene.
env.P.type=found.owner;env.P.base={name:found.owner};env.P.squadIndividualId="living-other";
const denGoal=api.eastSalvageObjective();
eq(denGoal.salvagePhase,"equip","matching individual is guided to den");
eq(denGoal.targetX,9300,"route preserves physical den X");
ok(denGoal.routeVia,"distant den route uses navigable east corridor");
env.inDen=true;env.mode="inventory";
api.renderWeaponVault();
const inventory=nodes.get("weapon-vault-list");
ok(inventory.children.length>=1,"real DOM list includes the identified weapon");
const weaponRow=inventory.children.find(row=>row.children?.some?.(n=>n.tagName==="button"));
ok(weaponRow,"DOM exposes species-eligible equip button");
const equipButton=weaponRow.children.find(n=>n.tagName==="button");
ok(!equipButton.disabled,"correct-species equip button enabled");
equipButton.click();
eq(A.equippedFor(env.P)?.id,found.id,"DOM click persists loadout under unique individual ID");
eq(A.read().vault.items.length,occupiedBefore,"equip never duplicates the physical weapon");
env.inDen=false;env.mode="play";env.P.x=10780;env.P.y=2595;
const boss={strongBoss:true,type:"wolf",x:11030,y:2600,hp:2200,maxHp:2200};
env.mobs=[boss];
const bossGoal=api.eastSalvageObjective();
eq(bossGoal.salvagePhase,"boss","equipped owner receives live boss objective");
eq(bossGoal.targetX,boss.x,"live boss position follows its actual NPC");
const equippedHit=A.damage(env.P,boss,120);
boss.hp=Math.max(0,boss.hp-equippedHit);
ok(equippedHit>120&&boss.hp<2080,"equipment really reduces a boss's HP");
const vaultBeforeReload=localStorage.getItem(A.KEY);
const savedWorld=JSON.parse(localStorage.getItem("wild-reclaim-autosave-v2"));
eq(savedWorld.version,2,"source-shaped world save schema unchanged");
ok(savedWorld.denMeatLots?.[0]?.id==="untouched-meat","meat data retained in snapshot fixture");
const reload={localStorage};new Function("window",arsenal)(reload);
eq(reload.WildArsenal.equippedFor(env.P)?.id,found.id,"title Continue reload retains individual equipment");
eq(localStorage.getItem(A.KEY),vaultBeforeReload,"Continue does not mutate weapon vault");
const backupPart=part(backup,'const WEAPON_VAULT_KEY=',"function mergeIds(records,key,older){");
const merge=new Function("window",backupPart+";return mergeWeaponVault;")(win);
const restoredArchive={};
merge(restoredArchive,{[A.KEY]:vaultBeforeReload});
const newDeviceData=new Map([[A.KEY,restoredArchive[A.KEY]]]);
const newDevice={localStorage:{
 getItem:k=>newDeviceData.get(k)||null,
 setItem:(k,v)=>newDeviceData.set(k,String(v)),
 removeItem:k=>newDeviceData.delete(k)
}};
new Function("window",arsenal)(newDevice);
eq(newDevice.WildArsenal.equippedFor(env.P)?.id,found.id,"JSON portable backup restores same individual gear");
eq(newDevice.WildArsenal.damage(env.P,boss,120),equippedHit,"backup restores real boss multiplier");
ok(game.includes('const sortie=eastSalvageObjective()'),"production HUD calls the sortie each frame");
ok(game.includes('P.type==="carp"')&&game.includes('navigation?.(P,eastTrailMask,P.type==="carp")'),
 "aquatic player is not led onto dry salvage routes");
ok(game.includes('const cacheAction=cache?.guardState==="engaged"'),"Action UI explains battle first");
ok(gl.includes("m.salvageCacheId")&&gl.includes("q.guardState===\"engaged\""),"WebGL uses real guardian cache ID");
ok(html.includes("game.js?rev=")&&html.includes("webgl3d.js?rev="),"production boot loads both renderers");
// Pre-existing 8-stop and 35-species scope is not reimplemented.
eq(E.stops.length,8,"all eastern destinations retained");
eq(A.owners.length,35,"all equipment species retained");
eq(A.MAX,240,"shared weapon capacity unchanged");
console.log("P3 SALVAGE SORTIE DOM/CANVAS PASS: "+checks+" assertions, combat -> cache -> vault -> species DOM equip -> boss HP -> Continue -> JSON import (V8 mock; not browser/GPU/Android)");

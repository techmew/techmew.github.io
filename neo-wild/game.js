(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas=$("scene"),ctx=canvas.getContext("2d",{alpha:true});
let warned3DFallback=false;
const mini=$("minimap"),mc=mini.getContext("2d");
const bigMap=$("world-map-canvas"),bm=bigMap.getContext("2d");
const MOUNTAIN=window.WildMountain;
const TWO=Math.PI*2, WORLD={w:Math.max(10100,MOUNTAIN?.EAST||10100),h:6000}, CITY_WIDTH=8400;
const animals={
 fox:{name:"アカギツネ",hp:110,speed:285,damage:22,rate:.39,r:19,color:"#d97947",belly:"#f4d3a0",ear:"#c06e42"},
 cat:{name:"ノラネコ",hp:85,speed:320,damage:16,rate:.28,r:16,color:"#abaf9d",belly:"#e7e7da",ear:"#8e998a"},
 wolf:{name:"オオカミ",hp:155,speed:175,damage:34,rate:.56,r:24,color:"#718991",belly:"#cad2c9",ear:"#546973"},
 dog:{name:"野犬",hp:125,speed:240,damage:19,rate:.42,r:22,color:"#9c785a",belly:"#e2c9a3",ear:"#72523c"},
 deer:{name:"ニホンジカ",hp:135,speed:275,damage:12,rate:.54,r:26,color:"#a77d53",belly:"#e4d1b3",ear:"#8e6745"},
 boar:{name:"イノシシ",hp:190,speed:205,damage:26,rate:.62,r:28,color:"#796358",belly:"#af9c87",ear:"#59453c"},
 manul:{name:"マヌルネコ",hp:94,speed:215,damage:21,rate:.37,r:18,color:"#b1a89a",belly:"#dbd4c2",ear:"#8b847a"},
 tibetanFox:{name:"チベットスナギツネ",hp:108,speed:257,damage:22,rate:.40,r:20,color:"#b8a18b",belly:"#f0deca",ear:"#8a7767"},
 shoebill:{name:"ハシビロコウ",hp:148,speed:142,damage:32,rate:.72,r:27,color:"#7d8990",belly:"#acb7ba",ear:"#57646b"}
};
// SOLO5: no lifespan cap. Legacy fields remain readable for SAVE_SCHEMA2 migration.
function initializeLife(player,seconds,restored=false){
 if(!player)return;
 if(!Number.isFinite(player.bornAtWorldSeconds))player.bornAtWorldSeconds=restored?Math.max(0,seconds-240):seconds;
 player.ageYears=Math.max(0,(seconds-player.bornAtWorldSeconds)/120);
 // Age is descriptive only. Never assign or enforce a lifespan.
 delete player.lifespanYears;
 delete player.ageWarningStage;
}

const species={
 rat:{hp:22,r:12,speed:131,damage:0,prey:true,xp:1,food:27,color:"#9b8b81",belly:"#d2bbb0"},
 rabbit:{hp:30,r:15,speed:204,damage:0,prey:true,xp:1,food:33,color:"#c8b899",belly:"#f0e5d5"},
 pigeon:{hp:18,r:12,speed:179,damage:0,prey:true,xp:1,food:19,color:"#738c92",belly:"#e5e4d5"},
 manul:{hp:94,r:18,speed:215,damage:21,prey:false,xp:6,food:28,color:"#b1a89a",belly:"#dbd4c2"},
 tibetanFox:{hp:108,r:20,speed:257,damage:22,prey:false,xp:6,food:32,color:"#b8a18b",belly:"#f0deca"},
 shoebill:{hp:148,r:27,speed:142,damage:32,prey:false,xp:8,food:41,color:"#7d8990",belly:"#acb7ba"},
 dog:{hp:124,r:22,speed:224,damage:16,prey:false,xp:3,food:29,color:"#9c785a",belly:"#e2c9a3"},
 boar:{hp:190,r:28,speed:232,damage:23,prey:false,xp:4,food:45,color:"#796358",belly:"#af9c87"},
 alpha:{hp:335,r:29,speed:231.4,damage:32,prey:false,xp:8,food:55,color:"#485b5c",belly:"#abc0b2"},
 giantSnake:{hp:290,r:32,speed:105,damage:27,prey:false,xp:12,food:68,color:"#426c50",belly:"#b5b884"},
 oldBear:{hp:480,r:43,speed:137,damage:44,prey:false,xp:17,food:100,color:"#654a3c",belly:"#b09a79"},
 giantBoar:{hp:410,r:40,speed:160,damage:37,prey:false,xp:14,food:92,color:"#57463d",belly:"#c9ad88"},
 blackPanther:{hp:270,r:29,speed:238,damage:31,prey:false,xp:13,food:68,color:"#232a31",belly:"#6d7c80"},
 oneEyedWolf:{hp:325,r:31,speed:224,damage:36,prey:false,xp:14,food:74,color:"#6e7276",belly:"#b8b5a8"},
 whiteTiger:{hp:395,r:40,speed:229,damage:41,prey:false,xp:18,food:94,color:"#e4e1d7",belly:"#f6f3e8"},
 giantHyena:{hp:355,r:35,speed:208,damage:33,prey:false,xp:15,food:76,color:"#a68b63",belly:"#d9c69d"},
 giantLion:{hp:465,r:43,speed:207,damage:42,prey:false,xp:19,food:106,color:"#cba56a",belly:"#e6cb96"},
 giantMoose:{hp:510,r:48,speed:156,damage:39,prey:false,xp:18,food:110,color:"#70523f",belly:"#b4a18b"},
 giantBuffalo:{hp:560,r:51,speed:169,damage:43,prey:false,xp:20,food:122,color:"#514237",belly:"#9c846b"},
 giantCrocodile:{hp:530,r:49,speed:148,damage:45,prey:false,xp:20,food:108,color:"#4d6451",belly:"#a5a785"},
 giantHippo:{hp:620,r:55,speed:127,damage:49,prey:false,xp:22,food:135,color:"#71636a",belly:"#b6a5a0"},
 giantAnaconda:{hp:420,r:42,speed:155,damage:35,prey:false,xp:19,food:96,color:"#3d705c",belly:"#b4bd8a"},
 giantLizard:{hp:385,r:37,speed:182,damage:35,prey:false,xp:17,food:85,color:"#60745b",belly:"#bdba91"},
 rhino:{hp:690,r:57,speed:174,damage:50,prey:false,xp:24,food:138,color:"#7e7770",belly:"#b5aca0"},
 giantGorilla:{hp:610,r:52,speed:147,damage:47,prey:false,xp:23,food:132,color:"#484844",belly:"#96918a"},
 giantElephant:{hp:880,r:69,speed:136,damage:55,prey:false,xp:29,food:176,color:"#878b87",belly:"#bfc0b5"},
 albinoWolf:{hp:375,r:33,speed:249,damage:38,prey:false,xp:19,food:83,color:"#e7e7dc",belly:"#faf7ec"},
 giantEagle:{hp:345,r:39,speed:248,damage:43,prey:false,xp:19,food:76,color:"#76583c",belly:"#d2b98a"}
};
Object.assign(species,window.WildFauna?.species||{});
for(const type of ['cat','fox','wolf'])if(!species[type])species[type]={...animals[type],prey:false,xp:4,food:35};
const COMBAT_LEVELS=window.WildCombatLevels;
const STRONG_NAMES={alpha:"アルファウルフ",giantSnake:"大蛇",oldBear:"老熊",giantBoar:"巨大イノシシ",blackPanther:"黒豹",oneEyedWolf:"隻眼の狼",whiteTiger:"白虎",giantHyena:"巨大ハイエナ",giantLion:"巨大ライオン",giantMoose:"巨大ヘラジカ",giantBuffalo:"巨大バッファロー",giantCrocodile:"巨大ワニ",giantHippo:"巨大カバ",giantAnaconda:"巨大アナコンダ",giantLizard:"巨大オオトカゲ",rhino:"サイ",giantGorilla:"巨大ゴリラ",giantElephant:"巨大ゾウ",albinoWolf:"アルビノの狼",giantEagle:"大鷲"};
// The encyclopedia is account-local and independent from SAVE_SCHEMA2 checkpoints.
window.WildBestiary?.configure(species,STRONG_NAMES);
const STRONG_REGIONS={0:["alpha","blackPanther","oneEyedWolf","albinoWolf"],1:["alpha","oldBear","blackPanther","oneEyedWolf","albinoWolf"],2:["giantEagle","giantSnake","oldBear","giantBoar","whiteTiger","giantMoose","giantBuffalo","giantLizard","giantGorilla"],3:["giantEagle","oldBear","blackPanther","alpha","giantSnake","whiteTiger","giantLion","giantLizard","rhino","giantElephant"],4:["giantEagle","giantSnake","giantBoar","giantHyena","giantBuffalo","giantCrocodile","giantHippo","giantAnaconda"],5:["giantEagle","giantSnake","oldBear","giantBoar","blackPanther","whiteTiger","giantLion","giantMoose","giantBuffalo","giantLizard","rhino","giantGorilla","giantElephant"],6:["giantBoar","alpha","blackPanther","giantHyena","giantLion"],7:["giantEagle","giantSnake","blackPanther","giantHyena","giantMoose","giantCrocodile","giantHippo","giantAnaconda","albinoWolf"]};
// Each trophy is earned through an actual boss kill; the first five can be inherited at an LV2 den.
const STRONG_TRAITS={
 alpha:{name:"追跡の脚力",effect:"移動速度 +8%"},
 oldBear:{name:"熊の生命力",effect:"最大生命 +28"},
 blackPanther:{name:"黒豹の爪",effect:"攻撃力 +12%"},
 giantEagle:{name:"大鷲の夜目",effect:"夜間の前方視認距離 +22%"},
 giantLizard:{name:"鱗の止血",effect:"強敵の出血ダメージ -35%"},
 giantSnake:{name:"大蛇の脱皮",effect:"拘束による減速の回復 +50%"},
 giantBoar:{name:"猪の突進力",effect:"飛びつき距離 +14%"},
 oneEyedWolf:{name:"隻眼の奇襲",effect:"未発見からの攻撃 +20%"},
 whiteTiger:{name:"白虎の跳躍",effect:"ジャンプ移動距離 +16%"},
 giantHyena:{name:"ハイエナの持久食",effect:"空腹の減少 -18%"},
 giantLion:{name:"獅子の連撃",effect:"5段目の攻撃力 +22%"},
 giantMoose:{name:"大角の足腰",effect:"ジャンプ持久力消費 -25%"},
 giantBuffalo:{name:"野牛の押し",effect:"攻撃の吹き飛ばし距離 +35%"},
 giantCrocodile:{name:"水辺の活力",effect:"水辺で持久力回復 +4/秒"},
 giantHippo:{name:"河馬の皮膚",effect:"水辺で受ける物理ダメージ -14%"},
 giantAnaconda:{name:"水蛇の柔軟さ",effect:"拘束中の移動速度低下を軽減"},
 rhino:{name:"サイの装甲",effect:"受ける物理ダメージ -10%"},
 giantGorilla:{name:"剛腕の威圧",effect:"攻撃で敵をひるませる時間 +0.15秒"},
 giantElephant:{name:"巨象の休息",effect:"安全な巣で生命回復 +1.7/秒"},
 albinoWolf:{name:"白狼の忍び足",effect:"潜伏移動時の足音 -25%"}
};
// Real gameplay hooks consume the same saved boolean flags as the den inheritance action.
function hasStrongTrait(type){return !!(P&&P.inheritedTraits&&P.inheritedTraits[type]===true);}
function traitEffect(type,base,condition=true){
 if(!condition||!hasStrongTrait(type))return base;
 switch(type){
  case "giantSnake":return base*1.5;
  case "giantBoar":return base*1.14;
  case "oneEyedWolf":return base*1.20;
  case "whiteTiger":return base*1.16;
  case "giantHyena":return base*.82;
  case "giantLion":return base*1.22;
  case "giantMoose":return base*.75;
  case "giantBuffalo":return base*1.35;
  case "giantCrocodile":return base+4;
  case "giantHippo":return base*.86;
  case "giantAnaconda":return Math.min(1,base*1.35);
  case "rhino":return base*.90;
  case "giantGorilla":return base+.15;
  case "giantElephant":return base+1.7;
  case "albinoWolf":return base*.75;
  default:return base;
 }
}
function strongNearWater(){
 return !!P&&((P.y>=0&&P.y<2600&&P.x>6200&&Math.abs(P.x-riverAxis(P.y))<460)||
  (P.x>=5500&&P.y>=2600&&Math.abs(P.y-canalAxis(P.x))<370));
}
function strongDamageTaken(raw){
 const reduced=traitEffect("giantHippo",traitEffect("rhino",raw),strongNearWater());
 // Rare blows hurt, but a single hit still leaves a recovery window.
 return Math.max(1,Math.min(Math.round(reduced),Math.ceil((P?.maxHp||110)*(strongBossLimit()>1?.27:.32))));
}

let strongRolls={},strongTrophies={},strongRegionCurrent=-1;
let vw=1,vh=1,dpr=1,cam={x:0,y:0},mode="menu",choice="fox",P=null,mobs=[],carcasses=[],plants=[],debris=[],buildings=[],lamps=[],particles=[],popups=[],birdFlocks=[],streetProps=[];
let elapsed=0,day=1,kills=0,meals=0,hiddenHold=0,tutorialHuntBase=0,tutorialStashBase=0,expedition=1,freeStep=0,freeTarget=0,questReady=false,mission=0,missionComplete=false,totalScore=0,best=0,weather="CLEAR",scoreTimer=0,spawnTimer=0,uiTimer=0,shake=0,flash=0,toastTime=0,toastMessage="",last=performance.now(),rain=[],worldMade=false;
const AUTOSAVE_KEY="wild-reclaim-autosave-v2",CHECKPOINTS_KEY="wild-reclaim-checkpoints-v2",SAVE_SCHEMA=2;
const WORLD_CHRONICLE_KEY="wild-reclaim-world-chronicle-v1";
// The 85-second daylight loop starts at 06:00. New worlds begin at 08:00.
const NEW_WORLD_START_ELAPSED=85*(8-6)/24;
let worldChronicleSaveClock=0;
function loadWorldChronicle(){
 try{
  const saved=JSON.parse(localStorage.getItem(WORLD_CHRONICLE_KEY)||"null");
  if(saved&&saved.version===1&&Number.isFinite(saved.elapsed)&&saved.elapsed>=0)
   return {elapsed:Math.min(saved.elapsed,1e10),lightningHistory:Array.isArray(saved.lightningHistory)?saved.lightningHistory.slice(-24):[]};
 }catch(_){}
 return {elapsed:0,lightningHistory:[]};
}
function persistWorldChronicle(){
 if(debugTutorialSession)return false;
 const prior=loadWorldChronicle(),seconds=Math.max(prior.elapsed,Math.max(0,elapsed));
 const history=lightningHistory.length?lightningHistory.slice(-24):prior.lightningHistory;
 try{
  localStorage.setItem(WORLD_CHRONICLE_KEY,JSON.stringify({version:1,elapsed:seconds,worldYearsElapsed:Math.floor(seconds/120),lightningHistory:history,savedAt:Date.now()}));
  return true;
 }catch(_){return false}
}
const TUTORIAL_ONCE_KEY="wild-reclaim-auto-tutorial-shown-v1",TUTORIAL_LESSONS_KEY="wild-reclaim-tutorial-lessons-v2";
const TUTORIAL_STAGES=[0,1,2,4];
let automaticTutorialShown=false;const tutorialLessonsSeenEver=new Set();
try{
 automaticTutorialShown=localStorage.getItem(TUTORIAL_ONCE_KEY)==="1";
 const stages=JSON.parse(localStorage.getItem(TUTORIAL_LESSONS_KEY)||"null");
 if(Array.isArray(stages))for(const stage of stages)if(TUTORIAL_STAGES.includes(stage)||stage===7)tutorialLessonsSeenEver.add(stage);
 // Previous flag only recorded the first popup; it must not suppress later lessons.
 if(automaticTutorialShown)tutorialLessonsSeenEver.add(0);
}catch(_){}
function rememberTutorialShown(){automaticTutorialShown=true;if(debugTutorialSession)return;try{localStorage.setItem(TUTORIAL_ONCE_KEY,"1")}catch(_){}}
function rememberTutorialStage(stage){
 tutorialSeen.add(stage);
 if(debugTutorialSession)return;
 tutorialLessonsSeenEver.add(stage);
 try{localStorage.setItem(TUTORIAL_LESSONS_KEY,JSON.stringify([...tutorialLessonsSeenEver]))}catch(_){}
 rememberTutorialShown();
}
function migrateSeenTutorial(snapshot){
 if(!snapshot||(Number(snapshot.mission)<=0&&!(Array.isArray(snapshot.tutorialSeen)&&snapshot.tutorialSeen.length>0)))return;
 tutorialLessonsSeenEver.add(0); // A pre-v2 saved run had already passed the introductory food lesson.
 rememberTutorialShown();
 if(!debugTutorialSession)try{localStorage.setItem(TUTORIAL_LESSONS_KEY,JSON.stringify([...tutorialLessonsSeenEver]))}catch(_){}
}
let autosaveClock=0,weatherTimer=35,nextWeather=null,thunderFlash=0,thunderTimer=10,windDirection=0;
// V1 storm hazard: the strike position and countdown survive SAVE_SCHEMA=2 snapshots.
let lightningStrike=null,lightningHistory=[];
function scheduleLightning(){
 if(!P)return;
 // Near misses dominate. Trees and wild animals are real strike targets.
 const candidates=[{x:P.x+rnd(-235,235),y:P.y+rnd(-235,235),kind:"ground"}];
 for(const m of mobs)if(m.hp>0&&dist(P,m)<480)candidates.push({x:m.x,y:m.y,kind:"animal"});
 for(const tree of plants)if(dist(P,tree)<440)candidates.push({x:tree.x,y:tree.y,kind:"tree"});
 const target=candidates[Math.floor(Math.random()*candidates.length)];
 if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))return;
 lightningStrike={x:clamp(target.x,24,WORLD.w-24),y:clamp(target.y,24,WORLD.h-24),kind:target.kind,countdown:1.65,afterglow:0};
 notify("落雷予兆！ 地面の光から離れろ",1.8);
}
function updateLightning(dt){
 if(weather!=="THUNDER"){lightningStrike=null;return;}
 const e=lightningStrike;if(!e)return;
 if(e.countdown>0){
  e.countdown-=dt;if(e.countdown>0)return;
  e.afterglow=.7;thunderFlash=Math.max(thunderFlash,.9);shake=Math.max(shake,3.2);
  playEffect("thunder",{volume:.8});
  const radius=65;
  if(P&&P.hp>0&&Math.hypot(P.x-e.x,P.y-e.y)<radius&&!insideShelter(P)){
   P.hp=Math.max(0,P.hp-38);P.stun=Math.max(P.stun||0,1.1);
   P.sp=Math.max(0,P.sp-22);notify("落雷！ ダメージと麻痺");
  }
  for(const m of mobs){
   if(m.hp<=0||Math.hypot(m.x-e.x,m.y-e.y)>=radius)continue;
   m.hp=Math.max(0,m.hp-45);m.stun=Math.max(m.stun||0,1.8);
   m.flee=Math.max(m.flee||0,3.5);m.fleeThreatX=e.x;m.fleeThreatY=e.y;
   if(m.hp===0&&species[m.type]&&!m.lightningCorpseMade){
    carcasses.push(animalRemains(m));m.lightningCorpseMade=true;
   }
  }
  lightningHistory.push({year:Math.floor(elapsed/120),x:Math.round(e.x),y:Math.round(e.y),kind:e.kind});
  if(lightningHistory.length>24)lightningHistory.shift();
  saveAuto();return;
 }
 e.afterglow=Math.max(0,e.afterglow-dt);
 if(e.afterglow===0)lightningStrike=null;
}
function drawLightning(){
 const e=lightningStrike;if(!e)return;
 const p=projectGroundLabel(e.x,e.y);if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
 ctx.save();ctx.lineWidth=3;ctx.strokeStyle=e.countdown>0?"#ffe47a":"#e6f7ff";
 ctx.fillStyle=e.countdown>0?"rgba(255,201,62,.24)":"rgba(230,247,255,.35)";
 const radius=65*cameraZoom;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,TWO);ctx.fill();ctx.stroke();
 ctx.textAlign="center";ctx.font="bold 13px sans-serif";ctx.fillStyle="#fff4c7";
 ctx.fillText(e.countdown>0?"落雷予兆！ 逃げろ":"落雷！",p.x,p.y-radius-12);ctx.restore();
}
// Presentation-only state: never stored in SAVE_SCHEMA=2.
const DEATH_SEQUENCE_SECONDS=2.2;
let deathSequenceTime=0;
let debugWeatherOverride=null; // Session-only weather preview; never stored in saves.
let debugTutorialSession=null; // QA-only sandbox; saved progress is restored on exit.
let soundEnabled=true,footstepTimer=0,audioTick=0,keys=new Set(),joy={id:null,x:0,y:0},heldDash=false,navPlansThisFrame=0,huntTarget=null,objectiveBannerTime=0,ambushTarget=null,huntSlowUntil=0,pounceStreaks=[];
const activeTouchPointers=new Map(),touchHoldTimers=new Map(),gamepadAxes={x:0,y:0};
// Transient input flags, never serialized into old save data.
const heldActions={touchAttack:false,padAttack:false,touchSprint:false,padSprint:false};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rnd=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const VIEW={a:.94,b:.20,c:-.28,d:.68};
let VIEW_DET=VIEW.a*VIEW.d-VIEW.b*VIEW.c;
let cameraYaw=0,cameraZoom=.8,guideWisp=null,guideGoal=null;
function updateCameraView(){
 const cs=Math.cos(cameraYaw),sn=Math.sin(cameraYaw),z=cameraZoom;
 VIEW.a=(.94*cs-.28*sn)*z;VIEW.c=(-.94*sn-.28*cs)*z;
 VIEW.b=(.20*cs+.68*sn)*z;VIEW.d=(-.20*sn+.68*cs)*z;
 VIEW_DET=VIEW.a*VIEW.d-VIEW.b*VIEW.c;
}
function project(x,y){const dx=x-cam.x-vw/2,dy=y-cam.y-vh/2;return {x:vw/2+VIEW.a*dx+VIEW.c*dy,y:vh/2+VIEW.b*dx+VIEW.d*dy}}
// Camera tracks the rendered feet, not the flat XY origin. On mountain ridges
// and roofs the model rises in WebGL, otherwise it drifts into the top HUD.
function playerVisualCameraTarget(){
 if(!P)return {x:cam.x,y:cam.y};
 const rise=Math.max(0,(window.WildMountain?.height?.(P.x,P.y)||0)+Math.max(0,P.groundZ||0));
 const screenLift=rise*.93*cameraZoom;
 const targetDX=-VIEW.c*screenLift/VIEW_DET,targetDY=VIEW.a*screenLift/VIEW_DET;
 return {
  x:clamp(P.x-vw/2-targetDX,0,Math.max(0,WORLD.w-vw)),
  y:clamp(P.y-vh/2-targetDY,0,Math.max(0,WORLD.h-vh))
 };
}
function unproject(x,y){const dx=x-vw/2,dy=y-vh/2;return {x:cam.x+vw/2+(VIEW.d*dx-VIEW.c*dy)/VIEW_DET,y:cam.y+vh/2+(-VIEW.b*dx+VIEW.a*dy)/VIEW_DET}}
function screenDepth(x,y){return VIEW.b*x+VIEW.d*y}
// Population is a density budget, not an endless wave-spawner.
const WILDLIFE={initial:10,cap:64,localRadius:700,localCap:7,separation:116,preyNeedRadius:440,farAI:1300,
 localTargetRain:4,localTargetClear:5,spawnInterval:11,packCooldown:130,packChanceEarly:.04,packChanceLate:.10};
let lastPackSpawnAt=-WILDLIFE.packCooldown;
/* Dynamic encounter difficulty. Scale relative to the player's LV, but cap each
 * damage and HP curve so an old long-lived save cannot become impossible. */
const PACK_TYPES=["dog","strayCat","wildFox","raccoonDog","weasel","venomSnake","lion","macaque","chimpanzee"];
function enemyChallengeTier(){return Math.max(0,Math.min(12,(P?.level||1)-1));}
function enemyHealthFactor(){return 1+enemyChallengeTier()*.105+Math.min(16,Math.max(0,day-1))*.035;}
function enemyDamageFactor(){return 1+enemyChallengeTier()*.055;}
/* BOSS-BALANCE-V2: bosses survive multiple full attack chains.
 * Damage-level based budget, not a runaway day counter. */
const BOSS_BALANCE_VERSION=2;
function bossHealthTarget(sp){
 if(!P)return Math.round(sp.hp*.85);
 // Species HP provides a minimum, but must NEVER cap HP to a small number
 // once the player has stacked fang/level damage upgrades. A rare enemy is
 // always a substantial, winnable single-target duel (~27 base-power hits).
 // Preserve each animal's weight class: a giant elephant should outlast a
 // wolf even at high player level, while both scale with player attack upgrades.
 const weight=clamp(Math.pow(sp.hp/420,.34),.92,1.34);
 const budget=Math.max(sp.hp*.85,(P.damage||20)*27*weight*(1+enemyChallengeTier()*.021));
 return Math.round(Math.min(200000,budget));
}
function bossStrikePower(m){
 return (m?.strongBoss?1.44+enemyChallengeTier()*.025:1)*
  (m?.strongBoss&&m.hp<m.maxHp*.45?1.16:1);
}
function bossPoiseBreak(m,damage,heavy=false){
 if(!m?.strongBoss||m.hp<=0)return false;
 // Only accumulated strikes break the boss's stance. Normal pokes
 // no longer cancel a dangerous move on each frame.
 if(elapsed-(m.poiseLastAt||elapsed)>3.1)m.poise=0;
 m.poiseLastAt=elapsed;
 m.poise=clamp((Number(m.poise)||0)+damage*(heavy?2.2:1),0,m.maxHp);
 if(elapsed<(m.guardBreakUntil||0))return false;
 if(m.poise<Math.max(72,m.maxHp*.20))return false;
 m.poise=0;m.guardBreakUntil=elapsed+5.3;
 return true;
}
function strongBossLimit(){return !P||P.level<6?1:P.level<11?2:3;}
function activeStrongBosses(){return mobs.filter(m=>m.hp>0&&(m.strongBoss||Object.prototype.hasOwnProperty.call(STRONG_NAMES,m.type)));}
// When the player purchases a strong attack upgrade, living bosses remain
// proportionally wounded but cannot be trivialized by the new damage tier.
function syncStrongBossChallenge(){
 if(!P)return;
 for(const m of activeStrongBosses()){
  const sp=species[m.type];if(!sp)continue;
  const target=bossHealthTarget(sp),old=Math.max(1,Number(m.maxHp)||sp.hp);
  if(m.bossBalanceVersion!==BOSS_BALANCE_VERSION||target>old*1.08){
   const ratio=clamp(m.hp/old,0,1);
   m.maxHp=target;m.hp=Math.max(1,Math.round(target*ratio));
   m.bossBalanceVersion=BOSS_BALANCE_VERSION;
  }
 }
}
function syncEnemyLevel(m){
 if(!m||m.hp<=0||m.strongBoss||m.type==="alpha"||species[m.type]?.prey)return;
 const spec=species[m.type];if(!spec)return;
 const target=Math.round(spec.hp*enemyHealthFactor());
 if(m.maxHp!==target){
  const ratio=clamp(m.hp/Math.max(1,m.maxHp||spec.hp),0,1);
  m.maxHp=target;m.hp=Math.max(1,Math.min(target,Math.round(target*ratio)));
 }
 m.damageScale=enemyDamageFactor();
 m.speedScale=1+Math.min(10,enemyChallengeTier())*.018;
}
function spawnLocalPack(){
 if(!P||P.level<2||mobs.length>WILDLIFE.cap-3)return false;
 if(elapsed-lastPackSpawnAt<WILDLIFE.packCooldown)return false;
 // At most one coordinated pack in the whole player neighbourhood.
 if(mobs.some(m=>m.hp>0&&m.packId&&dist(P,m)<950))return false;
 const nearby=mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius).length;
 // Lions only inhabit the zoo/greenbelt; no exotic packs appearing in city offices.
 const biome=regionAt(P.x,P.y);
 // Packs in the mountains use the mountain food web, not canal/city species.
 const mountain=mountainHabitat(P.x,P.y);
 const eligible=mountain?PACK_TYPES.filter(t=>["wildFox","raccoonDog","weasel","macaque","chimpanzee"].includes(t)&&
  (t!=="chimpanzee"||P.x>MOUNTAIN.FOOTHILL_END)):
  PACK_TYPES.filter(t=>t!=="macaque"&&t!=="chimpanzee"&&(window.WildFauna?.weight(t,biome,day,weather)||0)>0);
 if(!eligible.length)return false;
 const type=eligible[Math.floor(Math.random()*eligible.length)],before=mobs.length;
 const wanted=P.level>=8&&type!=="lion"?2:1;
 if(nearby>WILDLIFE.localCap-(wanted+1))return false;
 if(!spawnMob(false,false,true,null,type))return false;
 const leader=mobs[mobs.length-1];
 if(mobs.length!==before+1)return false;
 // A den may convert a proposed predator to harmless prey: count it once,
 // not as a failed pack followed by a duplicate spawn.
 if(leader.type!==type||nearDenLocation(leader.x,leader.y,265))return true;
 lastPackSpawnAt=elapsed;
 const id="pack-"+Math.round(elapsed*1000)+"-"+Math.round(leader.x)+"-"+Math.round(leader.y);
 leader.packId=id;leader.packOrder=0;let added=0;
 for(let i=0;i<wanted;i++)for(let attempt=0;attempt<18;attempt++){
  const a=leader.dir+i*Math.PI*1.2+rnd(-.95,.95);
  const r=rnd(110,188),x=leader.x+Math.cos(a)*r,y=leader.y+Math.sin(a)*r;
  if(x<55||y<55||x>WORLD.w-55||y>WORLD.h-55||nearDenLocation(x,y,265))continue;
  const count=mobs.length;
  if(spawnMob(false,false,false,{x,y},type)&&mobs.length===count+1&&mobs[mobs.length-1].type===type){
   const mate=mobs[mobs.length-1];mate.packId=id;mate.packOrder=i+1;added++;break;
  }
 }
 if(!added){delete leader.packId;delete leader.packOrder;}
 return true; // Even a failed companion placement already spawned the leader.
}
function rareEngagementBlocked(m){
 if(!P||!m.strongBoss||strongBossLimit()<2)return false;
 // Several rare animals exist, but only the nearest within battle reach may
 // attack at once. This prevents an unavoidable three-boss damage burst.
 const contenders=activeStrongBosses().filter(q=>dist(P,q)<355).sort((a,b)=>dist(P,a)-dist(P,b));
 return contenders.length>1&&contenders[0]!==m;
}
function signalPack(m,spotted){
 if(!m.packId||!P||species[m.type]?.prey)return;
 const mates=mobs.filter(q=>q!==m&&q.hp>0&&q.packId===m.packId&&dist(q,m)<360);
 if(spotted)for(const q of mates){
  if(territoryDetersDog(q))continue;
  q.lastX=P.x;q.lastY=P.y;q.alert=Math.max(q.alert||0,3.4);
  q.resting=false;q.restTime=0;
 }else if(m.alert<=0){
  const aware=mates.find(q=>q.alert>1.3&&dist(q,P)<460);
  if(aware){m.lastX=aware.lastX;m.lastY=aware.lastY;m.alert=2.5;}
 }
}
const roadsX=[530,1410,2320,3270,4400,5320,6260,7340,8070],roadsY=[465,1170,1890,2800,3760,4820,5650];
const districts=["霞町の廃庁街","桜坂駅跡","蔦ヶ丘の古町","白鷺の獣舎跡","朝霧川の土手","楠の森","汐浜の廃工場","潮見の水路"];
// The foothill shares the existing eighth ecology slot: old saves retain 8 entries.
function mountainHabitat(x,y){return !!MOUNTAIN&&x>=MOUNTAIN.CITY_EDGE&&MOUNTAIN.active(x,y);}
function strongHabitatKey(x,y){return mountainHabitat(x,y)?"7:foothill":regionAt(x,y);}
const FOOTHILL_STRONG=["oldBear","giantBoar","blackPanther","giantEagle"];
function regionAt(x,y){
 if(y<2600){
  if(x<1400)return 0;if(x<2800)return 1;if(x<4200)return 2;if(x<6300)return 3;return 4;
 }
 if(x<2800)return 5;if(x<5600)return 6;return 7;
}
const EXPLORE_SITES=[
 {id:"zoo",x:5250,y:1460,name:"白鷺の獣舎跡",note:"大型動物の気配が残る獣舎"},
 {id:"river",x:7270,y:1700,name:"朝霧川の土手",note:"新たな水場と野鳥の生息地"},
 {id:"forest",x:1550,y:4380,name:"楠の森",note:"食料は豊富だが足元が見えにくい"},
 {id:"factory",x:4380,y:4260,name:"汐浜の廃工場",note:"高い足場と廃機械の残骸"},
 {id:"canal",x:7000,y:4850,name:"潮見の水路",note:"水路沿いの獣道"},
 {id:"ark",x:5520,y:2170,name:"山影の地下道入口",note:"都市の旧設備から異音が聞こえる"}
];
const START_LOCATIONS={
 home:{x:1860,y:1170,name:"霞町・草陰の巣"},
 zoo:{x:5250,y:1460,name:"上野・廃動物園"},
 forest:{x:1550,y:4380,name:"楠の森"},
 factory:{x:4380,y:4260,name:"汐浜の廃工場"},
 canal:{x:7000,y:4850,name:"潮見の水路・水路跡"},
 river:{x:7270,y:1700,name:"朝霧川の土手"}
};
let discoveredSites=[],earnedDiscoveries=[];
const DISCOVERY_PERKS={
 zoo:{name:"強靭な生存力",description:"最大生命 +12"},
 river:{name:"長距離回復",description:"持久力回復 +3/秒"},
 forest:{name:"草地への適応",description:"空腹の進行 -20%"},
 factory:{name:"廃都の脚力",description:"走力 +5%"},
 canal:{name:"悪天候への適応",description:"雨の移動減速を軽減"},
 ark:{name:"研ぎ澄まされた本能",description:"固有能力の再使用 -15%"}
};
function awardDiscovery(id,quiet=false){
 if(!P||earnedDiscoveries.includes(id)||!DISCOVERY_PERKS[id])return false;
 earnedDiscoveries.push(id);
 if(id==="zoo"){P.maxHp+=12;P.hp=Math.min(P.maxHp,P.hp+12)}
 if(id==="river")P.riverPerk=true;
 if(id==="forest")P.foragePerk=true;
 if(id==="factory")P.speed=Math.round(P.speed*1.05);
 if(id==="canal")P.rainGrip=true;
 if(id==="ark")P.instinctBonus=true;
 if(!quiet)notify("発見報酬："+DISCOVERY_PERKS[id].name+"（"+DISCOVERY_PERKS[id].description+"）");
 return true;
}

const CLAN_NAMES=["霞町の野犬","桜坂の群れ","蔦ヶ丘のイノシシ","白鷺の獣群","朝霧川のカラス","楠の森の群れ","汐浜の野犬","潮見の水鳥"];
function initialEcology(){
 const prey=[31,28,43,36,48,59,23,39],predators=[10,13,12,15,8,9,16,9];
 return prey.map((n,i)=>({prey:n,predators:predators[i],food:55+(i%3)*13,pressure:0,dominance:i%2,events:0}));
}
let ecology=initialEcology(),ecologyClock=0,ecologyNews="生態系は変化し続けている";
function simulateEcology(dt){
 ecologyClock+=dt;if(ecologyClock<15)return;
 const tick=Math.min(6,Math.floor(ecologyClock/15));ecologyClock-=tick*15;
 for(let step=0;step<tick;step++)for(let i=0;i<ecology.length;i++){
  const e=ecology[i],oldPrey=e.prey,oldDominance=e.dominance;
  const growing=e.food>35&&e.prey<85?1+Math.floor((e.food-35)/35):0;
  const hunted=Math.min(e.prey,Math.floor(e.predators/8)+(e.pressure>2?1:0));
  e.prey=clamp(e.prey+growing-hunted,4,86);
  // World-year seasons and disasters change actual regional carrying capacity.
  // No new save keys: prey/predator/food remain in the existing 8-district
  // ecology array and therefore survive old SAVE_SCHEMA2 restoration.
  const era=window.WildEraEcology?.state?.(i,elapsed/120);
  const season=window.WildWorldClock?.at?.(elapsed)?.seasonIndex??-1;
  const snow=window.WildWorldClock?.snowpackAt?.(elapsed)??0;
  const foodMultiplier=era?.food??1;
  const drought=foodMultiplier<.85, winter=season===0;
  const seasonalGrowth=winter?-2:season===1?2:season===2?1:0;
  const weatherLoss=(weather==="THUNDER"||weather==="SNOW")?1:0;
  e.food=clamp(e.food+2-Math.floor(e.prey/22)+seasonalGrowth-(drought?2:0)-weatherLoss-Math.round(snow*2),10,94);
  if(era?.animals<.86&&e.prey>12)e.prey=Math.max(4,e.prey-1);
  const foodSupported=e.prey>=e.predators*1.6;
  e.predators=clamp(e.predators+(foodSupported&&step%2===0?1:0)-(!foodSupported?1:0),3,31);
  e.pressure=clamp(e.pressure+(e.prey<oldPrey?1:-1),0,5);
  if(e.pressure>=4&&(e.events+step+i)%3===0){
   e.dominance=(e.dominance+1)%3;e.pressure=0;e.events++;
  }
  if(oldDominance!==e.dominance)ecologyNews=districts[i]+"：群れの勢力が交代";
 }
 // Real inter-district migration: animals leave low-food regions for neighboring
 // higher-food ones. This is population movement, not spawning/teleporting NPCs:
 // live local animals are retained; the destination's future birth pool rises.
 // Transfers are bounded and happen only once per 15-second ecology tick.
 for(let i=0;i<ecology.length;i++){
  const source=ecology[i];
  if(source.food>=31||source.prey<=8)continue;
  const candidates=(i<5?[i-1,i+1,i+5]:[i-5,i-1,i+1])
   .filter(j=>j>=0&&j<ecology.length&&j!==i);
  let best=-1,benefit=12;
  for(const j of candidates){
   const dest=ecology[j];
   const era=window.WildEraEcology?.state?.(j,elapsed/120);
   const food=dest.food*(era?.food??1);
   const diff=food-source.food;
   if(diff>benefit&&dest.prey<78){benefit=diff;best=j;}
  }
  if(best<0)continue;
  const migrating=Math.min(3,Math.floor((31-source.food)/7)+1,source.prey-7,86-ecology[best].prey);
  if(migrating<=0)continue;
  source.prey-=migrating;ecology[best].prey+=migrating;
  source.pressure=clamp(source.pressure+1,0,5);
  ecologyNews=districts[i]+"から"+districts[best]+"へ獣群が移動";
 }
}

const SAFE_DEN={x:1860,y:1170,r:90}; // Legacy location; saved data is unchanged.

const DEN_PATTERNS=[
 {id:"thicket",name:"草陰のねぐら",x:1890,y:1540,kind:"grass"},
 {id:"grove",name:"森の深い草むら",x:1490,y:4410,kind:"forest"},
 {id:"ruin",name:"崩れた塀の陰",x:5460,y:1650,kind:"ruin"},
 {id:"factory",name:"廃工場の裏庭",x:4690,y:4320,kind:"yard"},
 {id:"reeds",name:"水路脇の葦原",x:6920,y:4550,kind:"reeds"},
 {id:"roof",name:"高台の屋上",x:3460,y:1350,kind:"roof"}
];
let denSites=[];
function nearDenLocation(x,y,r=255){return denSites.some(q=>Math.hypot(x-q.x,y-q.y)<r);}
function denAtActor(actor=P){
 if(!actor)return null;
 return denSites.find(q=>Math.abs((actor.groundZ||0)-q.z)<10&&Math.hypot(actor.x-q.x,actor.y-q.y)<=denRadius()+16)||null;
}
function closestDen(actor=P,groundOnly=false){
 if(!actor)return denSites[0]||SAFE_DEN;
 const sites=denSites.filter(q=>!groundOnly||q.z===0);
 const choices=sites.length?sites:denSites;
 return choices.reduce((best,q)=>{
  const score=Math.hypot(actor.x-q.x,actor.y-q.y)+(Math.abs((actor.groundZ||0)-q.z)>12?180:0);
  const old=best?Math.hypot(actor.x-best.x,actor.y-best.y)+(Math.abs((actor.groundZ||0)-best.z)>12?180:0):Infinity;
  return score<old?q:best;
 },null)||SAFE_DEN;
}
function initializeDenSites(){
 if(denSites.length)return denSites;
 const sites=[];
 for(const p of DEN_PATTERNS){
  if(p.kind==="roof"){
   const roofs=buildings.filter(b=>!b.interior&&b.roofZ>=26&&b.roofZ<=44&&b.w>=125&&b.h>=105&&
     !buildingOverlapsWater(b.x,b.y,b.w,b.h)&&
     !sites.some(q=>Math.hypot(q.x-b.x-b.w*.5,q.y-b.y-b.h*.5)<680))
     .sort((a,b)=>Math.hypot(a.x+a.w*.5-p.x,a.y+a.h*.5-p.y)-Math.hypot(b.x+b.w*.5-p.x,b.y+b.h*.5-p.y));
   if(roofs.length){const b=roofs[0];sites.push({...p,x:b.x+b.w*.5,y:b.y+b.h*.5,z:b.roofZ,r:65});}
   continue;
  }
  let found=null;
  for(const radius of [0,65,125,190,260,340,430]){
   for(let j=0;j<(radius===0?1:16);j++){
    const a=j*Math.PI/8,x=p.x+Math.cos(a)*radius,y=p.y+Math.sin(a)*radius;
    if(x<100||y<100||x>WORLD.w-100||y>WORLD.h-100||collides(x,y,54)||
       roadsX.some(road=>Math.abs(road-x)<102)||roadsY.some(road=>Math.abs(road-y)<96)||
       sites.some(q=>Math.hypot(q.x-x,q.y-y)<710))continue;
    found={...p,x,y,z:0,r:72};break;
   }
   if(found)break;
  }
  if(found)sites.push(found);
 }
 denSites=sites;
 return denSites;
}
function ensureDenCover(){
 for(const site of denSites){
  if(site.z>0||plants.some(q=>q.denSite===site.id))continue;
  for(let j=0;j<10;j++){
   const angle=j*TWO/10+.31,spread=122+(j%3)*17;
   const x=site.x+Math.cos(angle)*spread,y=site.y+Math.sin(angle)*spread;
   if(j===2||j===3||collides(x,y,38)||waterBlocksLand(x,y))continue;
   plants.push({x,y,r:47+(j%4)*5,type:2,phase:j*.93,hue:.24,denSite:site.id});
  }
  if(!plants.some(q=>q.denSite===site.id)&&!collides(site.x+76,site.y+30,24))
   plants.push({x:site.x+76,y:site.y+30,r:48,type:2,phase:1.1,denSite:site.id});
 }
}

const DEN_CAP=200, DEN_MAX_LEVEL=3, DEN_COSTS={2:60,3:120};
const FOOD_BALANCE={meat:{satiety:1.5,healing:.5,stash:1.5},berries:{satiety:.6,healing:.08,stash:.6}};
function foodName(c){return c?.type==="berries"?"食草":"肉"}
function foodBalance(c){return FOOD_BALANCE[c?.type==="berries"?"berries":"meat"]}
let denStash=0,denLevel=1,denStores={meat:0,berries:0,legacy:0};
function normalizeDenStores(raw,legacy=0){
 const out={meat:0,berries:0,legacy:0};let remaining=denCapacity();
 if(!raw||typeof raw!=="object"||Array.isArray(raw)){out.legacy=clamp(Math.round(Number(legacy)||0),0,remaining);return out}
 for(const key of ["meat","berries","legacy"]){
  const n=Number(raw[key]);out[key]=Math.min(remaining,Number.isFinite(n)?Math.max(0,Math.round(n)):0);remaining-=out[key];
 }
 return out;
}
function syncDenStash(){denStash=denStores.meat+denStores.berries+denStores.legacy;return denStash}
function loadDenStores(animal){
 let old=0;try{old=Number(localStorage.getItem("wild-reclaim-den-v1-"+animal))||0}catch(_){}
 try{const raw=localStorage.getItem("wild-reclaim-den-stores-v1-"+animal);if(raw){const v=JSON.parse(raw);if(v&&typeof v==="object"&&!Array.isArray(v))return normalizeDenStores(v,old)}}catch(_){}
 return normalizeDenStores(null,old);
}
const TERRITORY_POSTS=[{x:1410,y:1170,name:"西の交差点"},{x:2320,y:1170,name:"東の交差点"},{x:1860,y:1890,name:"南の高架下"}];
let territoryClaims=[false,false,false],territoryLastSupply=[0,0,0];
function loadTerritoryClaims(animal){
 try{const a=JSON.parse(localStorage.getItem("wild-reclaim-territory-v1-"+animal)||"null");return Array.isArray(a)&&a.length===3?a.map(v=>v===true):[false,false,false]}catch(_){return [false,false,false]}
}
function saveTerritoryClaims(){if(debugTutorialSession)return;try{localStorage.setItem("wild-reclaim-territory-v1-"+P.type,JSON.stringify(territoryClaims))}catch(_){}}
function territoryOwned(){return territoryClaims.filter(Boolean).length}
function nearestTerritoryPost(radius=82){
 if(!P)return null;let best=null,d=radius;
 for(let i=0;i<3;i++){const p=TERRITORY_POSTS[i],n=dist(P,p);if(n<d){d=n;best={...p,index:i}}}
 return best;
}
function markTerritory(){
 const site=nearestTerritoryPost();if(!site)return false;
 if(denLevel<2){notify("縄張りの確保は巣LV2から");return true}
 if(territoryClaims[site.index]){notify(site.name+"は確保済み");return true}
 if(P.carry){notify("食料を巣に預けてから縄張りを確保");return true}
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0||(P.groundZ||0)>0){notify("地上に降りてから縄張りを確保");return true}
 if(P.sp<20){notify("縄張りを確保する持久力が不足");return true}
 if(mobs.some(m=>m.hp>0&&!m.companion&&!species[m.type].prey&&dist(m,site)<190)){notify("敵を追い払ってから○長押し");return true}
 P.sp-=20;territoryClaims[site.index]=true;territoryLastSupply[site.index]=day;saveTerritoryClaims();
 notify(site.name+"を確保！ 巣の休息力が上昇・野犬を牽制");label(site.x,site.y-30,"縄張りを確保","#b5f4ba");syncHUD();return true;
}
function territorySupply(){
 if(denLevel<2)return;
 for(let i=0;i<3;i++){
  if(!territoryClaims[i]||territoryLastSupply[i]>=day)continue;
  territoryLastSupply[i]=day;
  const p=TERRITORY_POSTS[i],spot={x:p.x+27,y:p.y+20};
  if(collides(spot.x,spot.y,25)||carcasses.some(c=>dist(c,spot)<65))continue;
  carcasses.push({...spot,r:9,amount:18,type:"berries",ttl:220,phase:0});
 }
}
function territoryDetersDog(m){
 if(m.type!=="dog"||m.windup>0||m.chargeTime>0||m.stun>0)return false;
 return TERRITORY_POSTS.some((p,i)=>territoryClaims[i]&&dist(P,p)<155&&dist(m,p)<155);
}

function denCapacity(){return [0,200,300,450][denLevel]}
function denRadius(){return [0,SAFE_DEN.r,125,165][denLevel]}
function atDen(){return !!denAtActor()}
function denRestRate(){return [0,2.8,4.5,6.5][denLevel]+territoryOwned()*.9}
// Starvation is progressive. An empty stomach cannot be cancelled by passive den healing.
function inflictVenom(m){
 if(!P||P.hp<=0)return;
 const fresh=(P.poisonTime||0)<=0;
 P.poisonTime=Math.max(P.poisonTime||0,7.5);
 if(fresh){notify("毒ヘビに噛まれた！ 毒状態");label(P.x,P.y-55,"☠ 毒","#d3f29c");}
}
function updateVenom(dt){
 if(!P||(P.poisonTime||0)<=0)return;
 const poisonSeconds=Math.min(Math.max(0,dt),P.poisonTime);
 P.poisonTime=Math.max(0,P.poisonTime-poisonSeconds);
 P.hp=Math.max(0,P.hp-poisonSeconds*1.45);
}
function updateSurvivalNeeds(dt){
 const before=P.hunger;
 // Age is measured by the unaccelerated 120-second world year. Senior animals
 // require more food and recover more slowly, without permanently altering
 // inherited/base combat stats or corrupting SAVE_SCHEMA2 snapshots.
 const lifeFraction=Number.isFinite(P.ageYears)&&Number.isFinite(P.lifespanYears)&&P.lifespanYears>0
  ?clamp(P.ageYears/P.lifespanYears,0,1):0;
 const seniorNeed=1;
 const seniorRecovery=1;
 const drain=(.38+Math.min(Math.max(0,day-1),24)*.035)*dt*(P.foragePerk?.80:1)*traitEffect("giantHyena",1)*seniorNeed;
 P.hunger=clamp(before-drain,0,100);
 // Integrate the exact time at zero hunger even when a frame crosses the threshold.
 const emptySeconds=before<=0?dt:drain>0?dt*clamp((drain-before)/drain,0,1):0;
 // Only zero hunger causes starvation damage; a meal immediately stops it.
 if(emptySeconds>0)P.hp=Math.max(0,P.hp-emptySeconds*2.4);
 if(before>0&&P.hunger===0&&P.hp>0)notify("空腹0：生命が減少中。食べ物を探そう");
 if(P.hp<=0)return false;
 if(P.hunger>0&&atDen()&&!denThreatNearby())
  P.hp=Math.min(P.maxHp,P.hp+traitEffect("giantElephant",denRestRate())*dt*seniorRecovery);
 return true;
}
// Only reachable enemies interrupt rooftop rest and wound recovery.
function denThreatNearby(){
 if(!P||!atDen())return false;
 return mobs.some(m=>m.hp>0&&!m.companion&&(!species[m.type]?.prey||WILD_PREDATOR_TYPES.has(m.type))&&dist(P,m)<165&&
  (m.type==="giantEagle"||Math.abs((m.groundZ||0)-(P.groundZ||0))<12)&&
  (m.type==="giantEagle"||!lineBlocked(P,m)));
}
function loadDenLevel(animal){
 try{const n=Number(localStorage.getItem("wild-reclaim-den-level-v1-"+animal));return Number.isInteger(n)?clamp(n,1,DEN_MAX_LEVEL):1}catch(_){return 1}
}
function saveDenLevel(){
 if(debugTutorialSession)return;
 try{localStorage.setItem("wild-reclaim-den-level-v1-"+P.type,String(denLevel))}catch(_){}
}
function loadDenStash(animal){
 try{return clamp(Number(localStorage.getItem("wild-reclaim-den-v1-"+animal))||0,0,denCapacity())}catch(_){return 0}
}
function saveDenStash(){
 syncDenStash();
 if(debugTutorialSession)return;
 try{
  localStorage.setItem("wild-reclaim-den-v1-"+P.type,String(denStash));
  localStorage.setItem("wild-reclaim-den-stores-v1-"+P.type,JSON.stringify(denStores));
 }catch(_){}
}
const STATION={x:2460,y:1170};
const TOP_SCORES_KEY="wild-reclaim-top5-v1";
// A retry from one of the three checkpoints is the same attempt for TOP5 purposes.
let scoreRunId=null;
function createScoreRunId(){return "attempt-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,11);}
function scoreRunIdFromSnapshot(snapshot){
 if(typeof snapshot?.scoreRunId==="string"&&snapshot.scoreRunId.length>=8&&snapshot.scoreRunId.length<=96)return snapshot.scoreRunId;
 // Old SAVE_SCHEMA=2 checkpoints have no lineage ID; retrying one must remain one entry.
 const at=Number.isFinite(snapshot?.savedAt)?Math.max(0,Math.floor(snapshot.savedAt)):0;
 const elapsedAtSave=Number.isFinite(snapshot?.elapsed)?Math.floor(snapshot.elapsed*1000):0;
 return "legacy-"+snapshot.player.type+"-"+at+"-"+elapsedAtSave;
}
try{best=+(localStorage.getItem("wild-reclaim-best")||0)}catch(e){}
if(!Number.isSafeInteger(best)||best<0)best=0;
// Only local best existed before the TOP 5 update. Keep that score as a legacy entry.
function loadTopScores(){
 let list=[];
 try{
  const parsed=JSON.parse(localStorage.getItem(TOP_SCORES_KEY)||"[]");
  if(Array.isArray(parsed))list=parsed.slice(0,30).filter(e=>e&&Number.isSafeInteger(e.score)&&e.score>=0).map((e,i)=>({
   id:typeof e.id==="string"&&e.id.length<=80?e.id:"imported-"+i,
   runId:typeof e.runId==="string"&&e.runId.length<=96?e.runId:null,
   score:e.score,animal:["cat","fox","wolf"].includes(e.animal)?e.animal:null,
   day:Number.isInteger(e.day)&&e.day>0?e.day:0,
   kills:Number.isInteger(e.kills)&&e.kills>=0?e.kills:0,
   level:Number.isInteger(e.level)&&e.level>0?e.level:0,
   at:Number.isFinite(e.at)&&e.at>0?e.at:0,legacy:!!e.legacy
  }));
 }catch(_){}
 if(best>0&&!list.some(e=>e.score===best))list.push({id:"legacy",score:best,animal:null,day:0,kills:0,level:0,at:0,legacy:true});
 return list.sort((a,b)=>b.score-a.score||b.at-a.at).slice(0,5);
}
function recordTopScore(score){
 const previousBest=best,list=loadTopScores();
 if(debugTutorialSession)return {list,id:null,high:false,saved:false,rank:0,test:true};
 if(!scoreRunId)scoreRunId=createScoreRunId();
 const prior=list.find(e=>e.runId===scoreRunId);
 // Keep only the highest score for a checkpoint lineage.
 if(prior&&score<=prior.score)return {list,id:prior.id,high:false,saved:true,rank:list.findIndex(e=>e.id===prior.id)+1,test:false,unchanged:true};
 const id=prior?.id||"run-"+Date.now()+"-"+Math.random().toString(36).slice(2,10);
 const entry={id,runId:scoreRunId,score,animal:P.type,day,kills,level:P.level,at:Date.now(),legacy:false};
 const next=[...list.filter(e=>e.runId!==scoreRunId),entry].sort((a,b)=>b.score-a.score||b.at-a.at).slice(0,5);
 let saved=false;
 try{localStorage.setItem(TOP_SCORES_KEY,JSON.stringify(next));saved=true}catch(_){}
 best=Math.max(previousBest,score);
 try{localStorage.setItem("wild-reclaim-best",String(best))}catch(_){}
 return {list:next,id,high:score>previousBest,saved,rank:next.findIndex(e=>e.id===id)+1,test:false,unchanged:false};
}
function renderTopScores(record){
 $("result-highscore").classList.toggle("hidden",!record.high);
 const list=$("result-top5-list");list.replaceChildren();
 for(const [i,e] of record.list.entries()){
  const row=document.createElement("li");
  if(e.id===record.id)row.classList.add("current");
  const rank=document.createElement("span");rank.className="score-rank";rank.textContent=String(i+1)+"位";
  const info=document.createElement("span");info.className="score-info";
  const animal=document.createElement("b");
  animal.textContent=e.legacy?"以前の最高記録":(animals[e.animal]?.name||"生存記録")+(e.id===record.id?"（今回）":"");
  const meta=document.createElement("small");meta.textContent=e.legacy?"旧データから引き継ぎ":"YEAR "+Math.floor((Math.max(1,Number(e.day)||1)-1)*85/120)+"・狩り "+e.kills+"・LV "+e.level;
  info.append(animal,meta);
  const points=document.createElement("strong");points.className="score-points";points.textContent=e.score.toLocaleString("ja-JP");
  row.append(rank,info,points);list.appendChild(row);
 }
 $("result-top5-status").textContent=record.test?"デバッグ通しテスト中：記録は保存しません":
  !record.saved?"記録を保存できませんでした。ブラウザの保存設定を確認してください。":
  record.unchanged?"同じ挑戦の最高記録を維持（"+record.rank+"位）":
  record.rank?"今回の順位："+record.rank+"位（この端末に保存）":"今回の記録は6位以下（TOP5は維持）";
}
if($("best-score"))$("best-score").textContent="BEST SCORE "+String(best).padStart(6,"0");
function noise(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
function nearBuilding(x,y,r=0){return buildings.some(b=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r)}

/* Visual-only district identity; derived from world coordinates, never overwrites old saves. */
const BIOME_AREAS=[
 [0,0,1400,2600,"#455552","barrier"],[1400,0,1400,2600,"#584f47","rail"],
 [2800,0,1400,2600,"#31533a","ivy"],[4200,0,2100,2600,"#455447","cage"],
 [6300,0,2100,2600,"#69765b","reeds"],[0,2600,2800,3400,"#244c33","forest"],
 [2800,2600,2800,3400,"#554d48","factory"],[5600,2600,2800,3400,"#405960","dock"]
];
const riverAxis=y=>7505+68*Math.sin(y/390),canalAxis=x=>5025+35*Math.sin(x/390);
const WATER_RIBBONS=(()=>{
 const out=[];
 for(let y=0;y<2600;y+=125){const y2=Math.min(2600,y+125),a=riverAxis(y),b=riverAxis(y2);
  out.push({kind:"river",cx:(a+b)/2,cy:(y+y2)/2,pts:[[a-133,y],[a+133,y],[b+133,y2],[b-133,y2]]});}
 for(let x=5600;x<8400;x+=125){const x2=Math.min(8400,x+125),a=canalAxis(x),b=canalAxis(x2);
  out.push({kind:"canal",cx:(x+x2)/2,cy:(a+b)/2,pts:[[x,a-100],[x2,b-100],[x2,b+100],[x,a+100]]});}
 return out;
})();
let scenicProps=[];
function buildScenicProps(){
 if(scenicProps.length)return;
 for(const [zx,zy,zw,zh,color,kind] of BIOME_AREAS){
  const step=kind==="forest"?280:385;
  for(let y=zy+120;y<zy+zh-75;y+=step)for(let x=zx+120;x<zx+zw-75;x+=step){
   const n=noise(x*.011+y*.017,37),px=x+(n-.5)*65,py=y+(noise(x*.013-y*.021,17)-.5)*65;
   if(n<.20||roadsX.some(t=>Math.abs(px-t)<112)||roadsY.some(t=>Math.abs(py-t)<112)||nearBuilding(px,py,65))continue;
   if(kind==="reeds"&&Math.abs(px-riverAxis(py))<177||kind==="dock"&&Math.abs(py-canalAxis(px))<150)continue;
   scenicProps.push({x:px,y:py,kind});
  }
 }
 // Procedural urban rewilding is derived from coordinates and never depends on
 // the saved plants[] array. Old SAVE_SCHEMA2 worlds gain the same visual ruins.
 for(const [zx,zy,zw,zh,color,biome] of BIOME_AREAS){
  const step=biome==="forest"?250:["barrier","rail","ivy","cage"].includes(biome)?175:245;
  for(let yy=zy+96;yy<zy+zh-50;yy+=step)for(let xx=zx+96;xx<zx+zw-50;xx+=step){
   const n=noise(xx*.013+yy*.009,71);
   if(n<.25)continue;
   const px=xx+(noise(xx*.027,yy*.019)-.5)*80;
   const py=yy+(noise(yy*.017,xx*.013)-.5)*80;
   if(waterBlocksLand(px,py)||nearBuilding(px,py,46))continue;
   if(roadsX.some(v=>Math.abs(px-v)<83)||roadsY.some(v=>Math.abs(py-v)<83))continue;
   const kind=n>.91?"sapling":n>.79?"collapsed":"wildGrowth";
   scenicProps.push({x:px,y:py,kind,seed:Math.round((n+1)*1000)});
  }
 }
}
function drawWater2D(){
 for(const seg of WATER_RIBBONS){
  if(!visible(seg.cx,seg.cy,270))continue;
  const p=seg.pts;ctx.save();ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);
  for(let j=1;j<4;j++)ctx.lineTo(p[j][0],p[j][1]);ctx.closePath();
  ctx.lineJoin="round";ctx.strokeStyle=seg.kind==="river"?"#abb392":"#969e93";
  ctx.lineWidth=28;ctx.stroke();ctx.fillStyle=seg.kind==="river"?"#34788b":"#2c687f";ctx.fill();
  ctx.strokeStyle="#a8d2d080";ctx.lineWidth=2;ctx.beginPath();
  if(seg.kind==="river"){ctx.moveTo(seg.cx-32,seg.cy);ctx.lineTo(seg.cx+35,seg.cy);}
  else{ctx.moveTo(seg.cx,seg.cy-30);ctx.lineTo(seg.cx,seg.cy+25);}
  ctx.stroke();ctx.restore();
 }
}
function drawScenery2D(){
 for(const p of scenicProps){if(!visible(p.x,p.y,145))continue;ctx.save();ctx.translate(p.x,p.y);
  if(p.kind==="barrier"){ctx.fillStyle="#999e94";ctx.fillRect(-34,-10,68,20);ctx.fillStyle="#c4a367";for(let k=-2;k<=2;k++)ctx.fillRect(k*12,-10,5,20);}
  else if(p.kind==="rail"){ctx.fillStyle="#a5957c";for(let k=-2;k<=2;k++)ctx.fillRect(k*14,-44,6,88);ctx.fillStyle="#55585a";ctx.fillRect(-37,-22,74,5);ctx.fillRect(-37,19,74,5);}
  else if(p.kind==="ivy"){ctx.fillStyle="#4c9454";for(let k=0;k<6;k++){const a=k*TWO/6;ctx.beginPath();ctx.ellipse(Math.cos(a)*22,Math.sin(a)*21,27,17,a,0,TWO);ctx.fill();}}
  else if(p.kind==="cage"){ctx.strokeStyle="#c1c8b9";ctx.lineWidth=4;ctx.strokeRect(-43,-30,86,60);ctx.lineWidth=2;for(let j=-28;j<=28;j+=14){ctx.beginPath();ctx.moveTo(j,-29);ctx.lineTo(j,29);ctx.stroke();}}
  else if(p.kind==="reeds"){ctx.strokeStyle="#b6bd85";ctx.lineWidth=3;for(let k=-4;k<=4;k++){ctx.beginPath();ctx.moveTo(k*7,22);ctx.lineTo(k*7+5,-18-k%3*6);ctx.stroke();}}
  else if(p.kind==="forest"){ctx.fillStyle="#716045";ctx.fillRect(-6,-32,12,55);ctx.fillStyle="#33834c";for(const [dx,dy] of [[-20,-24],[20,-24],[0,-45],[0,0]]){ctx.beginPath();ctx.ellipse(dx,dy,23,19,0,0,TWO);ctx.fill();}}
  else if(p.kind==="factory"){ctx.fillStyle="#a27e65";ctx.fillRect(-39,-19,78,38);ctx.fillStyle="#c7a884";ctx.fillRect(-39,-23,78,7);ctx.fillStyle="#75695d";ctx.fillRect(-31,19,8,28);ctx.fillRect(23,19,8,28);}
  else if(p.kind==="dock"){ctx.fillStyle="#9f907a";ctx.fillRect(-45,-29,90,58);ctx.strokeStyle="#66584c";ctx.lineWidth=3;for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(k*12,-29);ctx.lineTo(k*12,29);ctx.stroke();}ctx.fillStyle="#abbab4";ctx.fillRect(35,-33,8,65);}
  else if(p.kind==="wildGrowth"){
   ctx.fillStyle="#183e2a78";ctx.beginPath();ctx.ellipse(0,8,35,17,0,0,TWO);ctx.fill();
   for(let j=0;j<15;j++){
    const a=j*2.4,r=8+(j%5)*5,h=21+(j%4)*8,x=Math.cos(a)*r,y=Math.sin(a)*r*.45;
    ctx.fillStyle=j%3?"#477e4f":"#8caa68";ctx.beginPath();ctx.moveTo(x-4,y+9);
    ctx.quadraticCurveTo(x-12,y-h*.45,x+Math.sin(a)*15,y-h);
    ctx.quadraticCurveTo(x+10,y-h*.4,x+5,y+8);ctx.fill();
   }
   for(let j=0;j<3;j++){ctx.fillStyle=j%2?"#d6bc73":"#d9e3ac";ctx.beginPath();ctx.arc((j-1)*13,-25-j%2*9,3.5,0,TWO);ctx.fill();}
  }else if(p.kind==="sapling"){
   ctx.fillStyle="#1f382c70";ctx.beginPath();ctx.ellipse(0,10,29,14,0,0,TWO);ctx.fill();
   ctx.strokeStyle="#63543d";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,9);ctx.lineTo(-4,-47);ctx.stroke();
   for(let k=0;k<5;k++){const a=k*TWO/5;
    ctx.fillStyle=k%2?"#3c7d4d":"#6a9c58";ctx.beginPath();
    ctx.ellipse(-4+Math.cos(a)*24,-47+Math.sin(a)*15,21,16,a,0,TWO);ctx.fill();}
  }else if(p.kind==="collapsed"){
   ctx.fillStyle="#1b333066";ctx.beginPath();ctx.ellipse(0,11,43,20,0,0,TWO);ctx.fill();
   ctx.save();ctx.rotate(-.19);ctx.fillStyle="#646e69";ctx.fillRect(-33,-13,53,25);
   ctx.fillStyle="#424d47";ctx.fillRect(16,-17,14,18);
   ctx.strokeStyle="#9daba073";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-21,-10);ctx.lineTo(-2,1);ctx.lineTo(10,-5);ctx.stroke();ctx.restore();
   ctx.strokeStyle="#52815b";ctx.lineWidth=2;for(const k of [-22,6,25]){ctx.beginPath();ctx.moveTo(k,13);ctx.quadraticCurveTo(k+10,-3,k+4,-20);ctx.stroke();}
  }
  ctx.restore();
 }
}
/* Explicit dawn / noon / sunset / night lighting. Noon is the brightest period.
 * The time axis keeps the existing 85-second DAY cycle; no save/schema changes. */
const DAYLIGHT_KEYS=[
 [0,.12,0,.60,.74,1.11],[4.75,.12,0,.60,.74,1.11],
 [5.5,.30,.34,1.03,.77,.67],[6.5,.55,.74,1.19,.88,.67],
 [8.5,.81,.16,1.12,1.03,.91],[10,1.00,0,1.12,1.12,1.10],
 [12,1.16,0,1.20,1.19,1.14],[14,1.11,0,1.17,1.15,1.11],
 [16,.98,0,1.12,1.06,.96],[17,.72,.58,1.20,.83,.65],
 [18,.48,.91,1.24,.70,.51],[19,.29,.38,.83,.74,.88],
 [20,.12,0,.60,.73,1.08],[24,.12,0,.60,.74,1.11]
];
/* Lunar cycle uses elapsed time, without changing saves, weather or YEAR. */
function moonlightProfile(seconds=elapsed,sky=weather){
 const cycle=29.530588,age=(Math.max(0,seconds)/85)%cycle,phase=age/cycle;
 // One continuous phase controls the moon's side, icon, age and illumination.
 const illumination=(1-Math.cos(phase*TWO))*.5,waxing=phase<.5;
 const visibility=sky==="THUNDER"?.10:sky==="RAIN"?.20:sky==="FOG"?.28:sky==="CLOUDY"?.45:sky==="WIND"?.82:1;
 const name=age<1.5||age>=28.3?"新月":age<5.9?"三日月":age<9?"上弦":age<11.5?"満ちゆく月":age<13.6?"十三夜":age<15.8?"満月":age<17.8?"十六夜":age<20.8?"欠けゆく月":age<23.6?"下弦":"有明月";
 const symbol=["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"][Math.round(phase*8)%8];
 // Storms suppress moonlight but never erase the terrain and nearby animals.
 return {age,phase,illumination,visibility,ambient:.36+.14*illumination*visibility,name,waxing,symbol};
}
function dayLightProfile(seconds=elapsed,sky=weather){
 const hour=(6+((seconds%85+85)%85)/85*24)%24;
 for(let i=1;i<DAYLIGHT_KEYS.length;i++){
  const a=DAYLIGHT_KEYS[i-1],b=DAYLIGHT_KEYS[i];
  if(hour>b[0])continue;
  const t=clamp((hour-a[0])/(b[0]-a[0]),0,1),ease=t*t*(3-2*t);
  const v=j=>a[j]+(b[j]-a[j])*ease;
  // Moonlight blends into the original daylight curve without changing noon.
   const moon=moonlightProfile(seconds,sky);
   const nightWeight=hour<4.75||hour>=20?1:hour<6.5?clamp((6.5-hour)/1.75,0,1):hour>=17.5?clamp((hour-17.5)/2.5,0,1):0;
   return {hour,brightness:v(1)+nightWeight*(moon.ambient-.12),warmth:v(2),tint:[v(3),v(4),v(5)]};
 }
 return {hour,brightness:.12,warmth:0,tint:[.60,.74,1.11]};
}
function worldDaylight(){return dayLightProfile().brightness;}

/* Animal night vision: a soft 120-degree forward acuity field, not emitted light.
 * Shared parameters drive the WebGL material contrast and 2D darkness mask. */
function nightVisionProfile(seconds=elapsed,sky=weather,animalType=P?.type){
 const light=dayLightProfile(seconds,sky),hour=light.hour;
 const nightWeight=hour<4.75||hour>=20?1:hour<6.5?clamp((6.5-hour)/1.75,0,1):hour>=17.5?clamp((hour-17.5)/2.5,0,1):0;
 const lunar=moonlightProfile(seconds,sky);
 const weatherFactor=sky==="THUNDER"?.55:sky==="RAIN"?.68:sky==="FOG"?.72:sky==="CLOUDY"?.80:sky==="WIND"?.94:1;
 const nocturnal=animalType==="cat";
 const baseRange=nocturnal?990:animalType==="wolf"?760:650;
 const inheritedEagle=!!(P&&animalType===P.type&&P.inheritedTraits?.giantEagle);
 const range=baseRange*weatherFactor*(.84+.16*lunar.illumination*lunar.visibility)*(inheritedEagle?1.22:1);
 const strength=clamp(nightWeight*(nocturnal?.83:animalType==="wolf"?.63:.57)*(.84+.16*weatherFactor)*(inheritedEagle?1.10:1),0,1);
 return {range,strength,nightWeight,halfAngle:Math.PI/3,ambient:light.brightness};
}
const nightVisionCanvas=document.createElement("canvas"),nightVisionCtx=nightVisionCanvas.getContext("2d");
function drawNightVision2D(alpha){
 if(alpha<=0||!nightVisionCtx)return;
 const width=Math.max(1,Math.round(vw*dpr)),height=Math.max(1,Math.round(vh*dpr));
 if(nightVisionCanvas.width!==width||nightVisionCanvas.height!==height){nightVisionCanvas.width=width;nightVisionCanvas.height=height;}
 const n=nightVisionCtx;n.setTransform(dpr,0,0,dpr,0,0);n.clearRect(0,0,vw,vh);
 n.fillStyle="rgba(3,10,29,"+alpha+")";n.fillRect(0,0,vw,vh);
 if(P){
  const vision=nightVisionProfile(),origin=project(P.x,P.y);
  if(vision.strength>.001){
   n.save();n.globalCompositeOperation="destination-out";
   // Nested angular masks feather both edges of the 120-degree forward field.
   for(const [halfDeg,opacity] of [[72,.11],[64,.15],[57,.21],[50,.25]]){
    n.save();n.beginPath();n.moveTo(origin.x,origin.y);
    for(let k=0;k<=24;k++){
     const angle=P.dir+(k/24*2-1)*halfDeg*Math.PI/180;
     const pt=project(P.x+Math.cos(angle)*vision.range,P.y+Math.sin(angle)*vision.range);
     n.lineTo(pt.x,pt.y);
    }
    n.closePath();n.clip();
    const radius=Math.max(1,vision.range*cameraZoom*.91);
    const grad=n.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,radius);
    const power=vision.strength*opacity/.57;
    grad.addColorStop(0,"rgba(0,0,0,"+Math.min(.9,power)+")");
    grad.addColorStop(.53,"rgba(0,0,0,"+(power*.90)+")");
    grad.addColorStop(.82,"rgba(0,0,0,"+(power*.48)+")");
    grad.addColorStop(1,"rgba(0,0,0,0)");
    n.fillStyle=grad;n.fillRect(0,0,vw,vh);n.restore();
   }
   // Peripheral vision never drops to absolute black behind the animal.
   const near=n.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,Math.max(145,vision.range*cameraZoom*.55));
   near.addColorStop(0,"rgba(0,0,0,"+Math.min(.85,vision.strength*.72)+")");
   near.addColorStop(.55,"rgba(0,0,0,"+(vision.strength*.40)+")");
   near.addColorStop(1,"rgba(0,0,0,0)");
   n.fillStyle=near;n.fillRect(0,0,vw,vh);n.restore();
  }
 }
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.drawImage(nightVisionCanvas,0,0,vw,vh);ctx.restore();
}

/* Same river/canal geometry in 2D, 3D and movement. Road crossings are dry bridges. */
function waterDepth(x,y){
 // Flooded shorelines share the normal physics, AI route checks and WebGL water surface.
 let depth=window.WildDisaster?.floodDepth?.(x,y,elapsed/120)||0;
 if(y>=0&&y<2600&&x>=6300){
  const offset=Math.abs(x-riverAxis(y));
  if(offset<133&&!roadsY.some(ry=>Math.abs(y-ry)<80))depth=Math.max(depth,Math.min(1,(133-offset)/70));
 }
 if(x>=5600&&y>=2600){
  const offset=Math.abs(y-canalAxis(x));
  if(offset<100&&!roadsX.some(rx=>Math.abs(x-rx)<80))depth=Math.max(depth,Math.min(1,(100-offset)/55));
 }
 return depth;
}
function shallowWater(x,y){return waterDepth(x,y)>0;}
function waterBlocksLand(x,y){return waterDepth(x,y)>.0001;}
function buildingOverlapsWater(x,y,w,h){
 const l=x-18,r=x+w+18,t=y-18,b=y+h+18;
 if(r>6300&&t<2600&&b>0)for(let yy=Math.max(0,t);yy<=Math.min(2600,b)+32;yy+=32){
  const c=riverAxis(Math.min(2600,Math.min(b,yy)));if(l<c+133&&r>c-133)return true;
 }
 if(r>5600&&l<8400&&b>2600)for(let xx=Math.max(5600,l);xx<=Math.min(8400,r)+32;xx+=32){
  const c=canalAxis(Math.min(8400,Math.min(r,xx)));if(t<c+100&&b>c-100)return true;
 }
 return false;
}
function nearestDryBank(x,y,r){
 if(!waterBlocksLand(x,y))return {x,y};
 for(let d=18;d<450;d+=18)for(let k=0;k<24;k++){
  const a=k*Math.PI/12,px=clamp(x+d*Math.cos(a),r+13,WORLD.w-r-13),py=clamp(y+d*Math.sin(a),r+13,WORLD.h-r-13);
  if(!waterBlocksLand(px,py)&&!collides(px,py,r))return {x:px,y:py};
 }
 return null;
}
function waterSoundAt(x,y){
 const river=y>=0&&y<2600&&x>=6300?clamp(1-Math.max(0,Math.abs(x-riverAxis(y))-133)/350,0,1):0;
 const canal=x>=5600&&x<8400&&y>=2600?clamp(1-Math.max(0,Math.abs(y-canalAxis(x))-100)/330,0,1):0;
 return {waterKind:river>=canal?"river":"canal",waterNear:Math.max(river,canal)};
}

function generateWorld(){
 if(worldMade)return;worldMade=true;
 const xs=[80,755,1640,2570,3485],ys=[90,705,1410,2050];
 let k=0;
 for(const y of ys)for(const x of xs){const n=noise(k++,13),w=270+n*175,h=(y>1970?230:240)+noise(k,8)*110;
   const roofZ=k%7===0?60:k%5===0?46:k%4===0?30:0;
    buildings.push({x,y,w,h,seed:k,kind:k%4,sign:k%3===0,broken:k%5===0,roofZ:(x===1640&&y===1410)||(x===2570&&y===705)?0:roofZ,interior:(x===1640&&y===1410)||(x===2570&&y===705)});}
 const addBlock=(x,y,seed,biome)=>{
  if(x<4200&&y<2450)return;
  if(EXPLORE_SITES.some(site=>Math.hypot(site.x-x,site.y-y)<255))return;
  const n=noise(seed,17),w=biome===5?135+120*n:biome===4?155+95*n:205+155*n;
  const h=biome===5?105+92*noise(seed,4):175+155*noise(seed,4);
  if(x+w>WORLD.w-35||y+h>WORLD.h-35)return;
  const roadCollision=roadsX.some(rx=>rx>x-42&&rx<x+w+42)||roadsY.some(ry=>ry>y-42&&ry<y+h+42);
  if(roadCollision||nearBuilding(x+w*.5,y+h*.5,Math.min(w,h)*.35)||buildingOverlapsWater(x,y,w,h))return;
  const roofZ=seed%7===0?70:seed%3===0?50:seed%4===0?32:0;
  buildings.push({x,y,w,h,seed,kind:biome===6?3:biome%4,sign:seed%5===0,broken:seed%4===0,roofZ});
 };
 let extSeed=240;
 for(const y of [125,840,1660]){
  for(const x of [4575,5500,6500,7490,8100])addBlock(x,y,extSeed++,regionAt(x,y));
 }
 for(const y of [2560,3260,4080,5010,5620]){
  for(const x of [100,980,1850,2780,3590,4600,5500,6550,7580,8120])
   addBlock(x,y,extSeed++,regionAt(x,y));
 }
 for(let iy=0;iy<roadsY.length-1;iy++)for(let ix=0;ix<roadsX.length-1;ix++){
  const left=roadsX[ix]+160,right=roadsX[ix+1]-220;
  const top=roadsY[iy]+140,bottom=roadsY[iy+1]-240;
  if(right-left<180||bottom-top<100)continue;
  if(left<4150&&top<2450)continue;
  const seed=++extSeed,biome=regionAt(left,top);
  const span=right-left;
  addBlock(left+noise(seed,51)*65,top+noise(seed,12)*45,++extSeed,biome);
  if(span>400&&biome!==5){
   addBlock(right-205-noise(seed,53)*38,top+noise(seed,13)*65,++extSeed,biome);
  }
 }
 for(let i=0;i<780;i++){
  const x=120+rnd(0,WORLD.w-240),y=2450+rnd(0,WORLD.h-2580);
  if(nearBuilding(x,y,45)||waterBlocksLand(x,y)||x>=CITY_WIDTH)continue;
  const biome=regionAt(x,y),forest=biome===5,shrubs=forest?.46:biome===7?.24:.15;
  plants.push({x,y,r:Math.random()<shrubs?rnd(34,65):rnd(7,24),
   type:Math.random()<shrubs?2:Math.random()<.25?1:0,phase:rnd(0,TWO),hue:Math.random()});
 }
 for(let i=0;i<260;i++){
  const x=4200+rnd(0,WORLD.w-4320),y=90+rnd(0,2400);
  if(x<CITY_WIDTH&&!nearBuilding(x,y,48)&&!waterBlocksLand(x,y))plants.push({x,y,r:rnd(8,46),type:i%5===0?2:i%3===0?1:0,phase:rnd(0,TWO),hue:Math.random()});
 }
 for(let i=0;i<520;i++){
  const x=rnd(80,WORLD.w-80),y=rnd(2500,WORLD.h-70);
  if(x<CITY_WIDTH&&!nearBuilding(x,y,12)&&!waterBlocksLand(x,y))debris.push({x,y,r:rnd(2,12),a:rnd(0,TWO),kind:i%4});
 }
 for(const site of EXPLORE_SITES){
  for(let j=0;j<3;j++){
   const ang=j*TWO/3,xx=site.x+Math.cos(ang)*155,yy=site.y+Math.sin(ang)*145;
   if(!nearBuilding(xx,yy,32)&&!waterBlocksLand(xx,yy))plants.push({x:xx,y:yy,r:40,type:2,phase:j,hue:.3});
  }
 }
 const alley=[
  {x:1990,y:835,w:75,h:210,seed:91,kind:1,sign:false,broken:true,roofZ:0},
  {x:2185,y:835,w:75,h:210,seed:92,kind:2,sign:false,broken:true,roofZ:0},
  {x:2085,y:765,w:85,h:60,seed:93,kind:3,sign:false,broken:false,roofZ:52}
 ];
 buildings.push(...alley); // wall-kick training alley; also serves open-city roof exploration.
 for(let i=0;i<400;i++){let x=rnd(30,WORLD.w-30),y=rnd(30,WORLD.h-30);
   if(nearBuilding(x,y,28)||waterBlocksLand(x,y)||x>=CITY_WIDTH)continue;
   plants.push({x,y,r:rnd(5,17),type:Math.random()<.23?1:0,phase:rnd(0,6),hue:Math.random()});}
 for(let i=0;i<75;i++){const x=rnd(65,WORLD.w-65),y=rnd(65,WORLD.h-65);
  if(x<CITY_WIDTH&&!nearBuilding(x,y,70)&&!waterBlocksLand(x,y))plants.push({x,y,r:rnd(34,67),type:2,phase:rnd(0,6)});}
 for(let i=0;i<330;i++){let x=rnd(0,WORLD.w),y=rnd(0,WORLD.h);
   if(nearBuilding(x,y,8)||waterBlocksLand(x,y)||x>=CITY_WIDTH)continue;
   debris.push({x,y,r:rnd(2,10),a:rnd(0,7),kind:i%4});}
 for(const x of roadsX)for(const y of roadsY)for(const dx of [-100,100])for(const dy of [-87,87])lamps.push({x:x+dx,y:y+dy});
 
 for(let i=0;i<72;i++){
  const along=i%3!==0,road=along?roadsY[Math.floor(i/8)%roadsY.length]:roadsX[i%roadsX.length];
  const x=along?220+(i%8)*1030+(noise(i,7)-.5)*70:road+(noise(i,7)-.5)*40;
  const y=along?road+(noise(i,3)-.5)*35:180+(i%6)*920;
  const type=["car","bicycle","car","barrier","vending","bicycle","sign"][i%7],r=type==="car"?32:13;
  if(Math.hypot(x-SAFE_DEN.x,y-SAFE_DEN.y)>210&&!nearBuilding(x,y,44)&&!waterBlocksLand(x,y))
   streetProps.push({x,y,type,r,dir:along?0:Math.PI/2,seed:i});
 }
 for(let i=0;i<28;i++)birdFlocks.push({x:180+(i*941)%(WORLD.w-400),y:220+(i*677)%(WORLD.h-410),z:55+(i%4)*23,
  dir:i%2?3.0:.13,speed:56+i%4*19,wing:i*1.7,fright:0,type:i%3===0?"crow":"pigeon"});
 for(let i=0;i<85;i++)rain.push({x:rnd(0,2000),y:rnd(0,1200),s:rnd(320,730),z:rnd(9,21)});
 buildScenicProps();
}
function resize(){vw=window.innerWidth;vh=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1.8);canvas.width=Math.floor(vw*dpr);canvas.height=Math.floor(vh*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(mode==="guide"||mode==="milestone")guideNeedsFrame=true;}
window.addEventListener("resize",resize,{passive:true});resize();
// World building is deferred until Play; its failure must never disable title controls.
let worldReady=false;
function ensureWorldReady(){
 if(worldReady)return true;
 try{generateWorld();initializeDenSites();ensureDenCover();worldReady=true;return true;}
 catch(error){
  console.error("World initialization error",error);
  const note=$("menu-landscape-note");
  if(note){note.textContent="ゲームを準備できません。ページを更新してください。";note.setAttribute("data-error","true")}
  return false;
 }
}
function show(id){
 for(const key of ["menu","pause","result","upgrade"])$(key).classList.toggle("hidden",key!==id);
 if(id==="menu"){refreshSaveMenu();$("new-game-confirm")?.classList.add("hidden");}
}
function start(newWorld=false){
 if(!ensureWorldReady())return false;
 window.WildPackTactics?.reset?.();
 scoreRunId=createScoreRunId();
 // Only the first ever playthrough displays tutorial milestones; retry never repeats them.
 previouslyOnboardedAtRunStart=automaticTutorialShown;
 bossPresenceUntil=0;lastBossPresenceAt=-1e9;deathSequenceTime=0;window.WildAudio?.resetDeathFade?.();$("hud").style.opacity="";autosaveClock=0;audioTick=0;mode="play";show("");cameraYaw=0;cameraZoom=.8;guideWisp=null;guideGoal=null;updateCameraView();$('zoom-level').textContent='80%';$("world-map").classList.add("hidden");elapsed=newWorld?NEW_WORLD_START_ELAPSED:loadWorldChronicle().elapsed;day=1+Math.floor(elapsed/85);kills=0;meals=0;hiddenHold=0;tutorialHuntBase=0;tutorialStashBase=0;expedition=1;freeStep=0;freeTarget=0;questReady=false;mission=tutorialLessonsSeenEver.has(7)?7:0;missionComplete=tutorialLessonsSeenEver.has(7);scoreTimer=0;spawnTimer=0;lastPackSpawnAt=-WILDLIFE.packCooldown;lastPopulatedRegion=-1;ecology=initialEcology();ecologyClock=0;ecologyNews="生態系は変化し続けている";discoveredSites=[];earnedDiscoveries=[];debugWeatherOverride=null;weather=tokyoWeatherAt(elapsed);weatherTimer=85-(elapsed%85);nextWeather=null;thunderFlash=0;thunderTimer=10;lightningStrike=null;lightningHistory=newWorld?[]:loadWorldChronicle().lightningHistory;windDirection=rnd(0,TWO);shake=0;flash=0;particles=[];popups=[];mobs=[];carcasses=[];strongRolls={};strongTrophies={};strongRegionCurrent=-1;resetControls();guideCache=null;huntTarget=null;
 objectiveBannerTime=0;$("objective-banner").classList.remove("visible");tutorialSeen.clear();for(const stage of tutorialLessonsSeenEver)tutorialSeen.add(stage);guideNeedsFrame=false;milestoneUntil=0;$("mission-milestone").classList.add("hidden");$("mission-milestone").classList.remove("show");$("app").classList.remove("tutorial-paused");$("tutorial-dialog").classList.add("hidden");$("den-inventory").classList.add("hidden");ambushTarget=null;huntSlowUntil=0;pounceStreaks.length=0;$("hunt-cinematic").classList.remove("show");
 const origin=START_LOCATIONS[$("start-region")?.value]||START_LOCATIONS.home;
 ensureDenCover();
 denLevel=newWorld?1:loadDenLevel(choice);denStores=newWorld?normalizeDenStores(null,0):loadDenStores(choice);syncDenStash();territoryClaims=newWorld?[false,false,false]:loadTerritoryClaims(choice);territoryLastSupply=[day,day,day];
  const a=animals[choice];P={x:origin.x,y:origin.y,dir:0,type:choice,base:a,r:a.r,hp:a.hp,maxHp:a.hp,hunger:100,sp:100,speed:a.speed,damage:a.damage,rate:a.rate,atk:0,dash:0,dashTime:0,dx:1,dy:0,inv:0,level:1,xp:0,nextXp:5,combo:0,comboTimer:0,steps:0,blood:0,eatCD:0,vx:0,vy:0,noise:0,noiseBurst:0,hidden:false,windup:0,pendingStrike:false,ambushStrike:false,revealTimer:0,abilityTime:0,instinctCD:0,pounceTime:0,pounceRemaining:0,pounceDir:0,jumpTime:0,jumpDuration:0,jumpHeight:0,jumpRemaining:0,jumpSpeed:0,jumpDir:0,jumpCD:0,jumpDive:false,jumpAmbush:false,groundZ:0,pounceDuration:0,fallTime:0,fallFromZ:0,carry:null,lastCombatAt:-100,rushStep:0,rushActiveStep:0,rushWindow:0,rushQueued:false,wallKicks:0,wallKickLast:-1,wallKickLock:0,wallKickTime:0,wallKickDir:0,jumpFromHeight:0,jumpPower:0,chargeStrike:false,strongWound:0,poisonTime:0,inheritedTraits:{}};
 if(choice==="cat")P.catSpeedV2=true; // Faster base speed is applied to new cats.
 P.stillTime=0;P.beakStrike=false;P.beakVisual=0;
 initializeLife(P,elapsed);
 // World geometry can change between releases. Never begin a run inside water or a wall.
 if(waterBlocksLand(P.x,P.y)&&!(P.type==="shoebill"&&waterDepth(P.x,P.y)<=.24)){
  const bank=nearestDryBank(P.x,P.y,P.r);
  if(bank){P.x=bank.x;P.y=bank.y;}
 }
 recoverPlayerFromGap(P);
 let roomPrey=0;
 if(origin===START_LOCATIONS.home){
  for(const shelter of buildings.filter(b=>b.interior)){
   const room=shelterInteriorPoint(shelter);
   if(spawnMob(false,true,false,{x:room.x,y:room.y+18}))roomPrey++;
  }
 }
 spawnMob(false,true); // Reserve nearby mission prey before filling the local wildlife slots.
 // A safe starting area contains ordinary wildlife, not only mission prey.
 const startRegion=regionAt(P.x,P.y);
 const starterTypes=startRegion===5?["rabbit","crow","frog"]:
  startRegion===4||startRegion===7?["frog","crow","pigeon"]:
  ["rabbit","pigeon","crow"];
 let starterCount=ensureLocalPredators(startRegion===7?2:1);
 for(const type of starterTypes)if(spawnMob(true,false,true,null,type))starterCount++;
 // Seed several other districts within the same original 13-animal budget.
 // A visitor no longer finds the rest of the world completely empty.
 const districtOrder=[3,5,4,2,7,6,1,0].filter(region=>region!==startRegion);
 const residentBudget=Math.min(districtOrder.length,Math.max(0,WILDLIFE.initial-roomPrey-starterCount-1));
 for(let i=0;i<WILDLIFE.initial-roomPrey-starterCount-residentBudget;i++)spawnMob(true);
 for(const region of districtOrder.slice(0,residentBudget))spawnRegionalResident(region);
 for(let i=0;i<17;i++)spawnFood();
 carcasses.push({x:P.x+105,y:P.y+40,r:9,amount:22,type:"berries",ttl:240,phase:0});
 ensureTrainingCoverNear(P);
 cam.x=clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw));cam.y=clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh));
 enterStrongStage();syncHUD();drawMini();window.WildAudio?.update({weather,area:regionAt(P.x,P.y),danger:false,mode:"play",...waterSoundAt(P.x,P.y)});notify(origin.name+" / 生存開始");
 playEffect("collect");startAmbient();
 return true;
}

/* Local progress snapshots. No remote service is required and saving never advances the clock. */
function isValidSnapshot(s){
 return !!s&&s.version===SAVE_SCHEMA&&s.player&&Object.prototype.hasOwnProperty.call(animals,s.player.type)&&
  Number.isFinite(s.player.x)&&Number.isFinite(s.player.y)&&s.player.x>=0&&s.player.x<=WORLD.w&&s.player.y>=0&&s.player.y<=WORLD.h&&
  Number.isFinite(s.player.hp)&&s.player.hp>0&&Number.isFinite(s.player.level)&&s.player.level>=1&&
  Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<100000000&&
  Array.isArray(s.mobs)&&s.mobs.length<=120&&Array.isArray(s.carcasses)&&s.carcasses.length<=300&&
  Array.isArray(s.plants)&&s.plants.length<=2600&&Array.isArray(s.debris)&&s.debris.length<=1800;
}

// SAVE_SCHEMA=2 compatibility: repair damaged nested records without discarding
// a healthy checkpoint or mutating the original snapshot in localStorage.
function sanitizeSavedWorld(s){
 const point=o=>!!o&&typeof o==="object"&&Number.isFinite(o.x)&&Number.isFinite(o.y)&&
  o.x>=0&&o.x<=WORLD.w&&o.y>=0&&o.y<=WORLD.h;
 const mobs=s.mobs.filter(m=>point(m)&&typeof m.type==="string"&&
  Number.isFinite(m.hp)&&m.hp>0).map(m=>{
   const type=Object.prototype.hasOwnProperty.call(species,m.type)?m.type:"dog";
   const sp=species[type];
   const maxHp=Number.isFinite(m.maxHp)&&m.maxHp>0?clamp(m.maxHp,1,100000):Math.max(sp.hp,m.hp);
   return {...m,type,r:Number.isFinite(m.r)&&m.r>=4&&m.r<=120?m.r:sp.r,
    maxHp,hp:clamp(m.hp,1,maxHp),vx:Number.isFinite(m.vx)?m.vx:0,
    vy:Number.isFinite(m.vy)?m.vy:0,dir:Number.isFinite(m.dir)?m.dir:0};
  });
 const carcasses=s.carcasses.filter(c=>point(c)&&
  ["corpse","meat","berries","bones"].includes(c.type)&&
  (c.type==="bones"||Number.isFinite(c.amount)&&c.amount>0&&c.amount<=5000)).map(c=>({
   ...c,amount:c.type==="bones"?0:c.amount,
   r:Number.isFinite(c.r)&&c.r>0&&c.r<=120?c.r:9,
   ttl:Number.isFinite(c.ttl)?clamp(c.ttl,0,1000):c.type==="bones"?45:150
  }));
 return {mobs,carcasses,plants:s.plants.filter(point),debris:s.debris.filter(point)};
}
function normalizeSavedPlayerStats(p,base){
 const level=clamp(Math.floor(p.level),1,1000);
 let threshold=5;
 for(let i=1;i<level&&threshold<1000000000;i++)threshold=Math.min(1000000000,Math.round(threshold*1.5+2));
 const maxHp=Number.isFinite(p.maxHp)&&p.maxHp>=base.hp?
  clamp(p.maxHp,base.hp,1000000):Math.max(base.hp,p.hp);
 return {
  r:base.r,maxHp,hp:clamp(p.hp,1,maxHp),level,
  sp:Number.isFinite(p.sp)?clamp(p.sp,0,100):100,
  speed:Number.isFinite(p.speed)&&p.speed>0?clamp(p.speed,base.speed*.5,base.speed*20):base.speed,
  damage:Number.isFinite(p.damage)&&p.damage>0?clamp(p.damage,1,1000000):base.damage,
  dir:Number.isFinite(p.dir)?p.dir:0,
  xp:Number.isFinite(p.xp)&&p.xp>=0?clamp(p.xp,0,1000000000):0,
  nextXp:Number.isFinite(p.nextXp)&&p.nextXp>=1?clamp(p.nextXp,1,1000000000):threshold,
  inv:Number.isFinite(p.inv)?clamp(p.inv,0,10):0
 };
}

function squadSnapshotAlive(snapshot){
 if(!isValidSnapshot(snapshot))return false;
 const id=snapshot.player?.squadIndividualId;
 if(!id)return true; // Pre-gacha SAVE_SCHEMA2 remains readable.
 const roster=window.WildSquad?.load?.();
 return !!roster?.members?.some(m=>m.alive!==false); // Living selected stock may replace the saved actor.
}
function getAutoSnapshot(){
 try{const s=JSON.parse(localStorage.getItem(AUTOSAVE_KEY)||"null");return squadSnapshotAlive(s)?s:null}catch(_){return null}
}
function getCheckpoints(){
 try{const list=JSON.parse(localStorage.getItem(CHECKPOINTS_KEY)||"[]");return Array.isArray(list)?list.filter(squadSnapshotAlive).slice(0,3):[]}catch(_){return []}
}
function clearAutoSave(){
 if(debugTutorialSession)return;
 try{localStorage.removeItem(AUTOSAVE_KEY)}catch(_){}
}
function currentSnapshot(){
 if(!P||P.hp<=0||!(mode==="play"||mode==="pause"||mode==="upgrade"||mode==="inventory"||mode==="guide"||mode==="milestone"))return null;
 return {
  version:SAVE_SCHEMA,worldVersion:2,savedAt:Date.now(),savedMode:mode==="upgrade"?"upgrade":"play",scoreRunId,
  player:{...P,base:undefined},camera:{x:cam.x,y:cam.y,yaw:cameraYaw,zoom:cameraZoom},
  elapsed,day,worldYearsElapsed:Math.floor(elapsed/120),worldChronicleElapsed:Math.max(elapsed,loadWorldChronicle().elapsed),kills,meals,hiddenHold,tutorialHuntBase,tutorialStashBase,expedition,freeStep,freeTarget,questVersion:questReady?1:0,mission,missionComplete,totalScore,
  weather,weatherTimer,nextWeather,thunderTimer,windDirection,lightningStrike,lightningHistory,scoreTimer,spawnTimer,packLastSpawnAt:lastPackSpawnAt,denLevel,denStash,denStores:{...denStores},territoryClaims:[...territoryClaims],territoryLastSupply:[...territoryLastSupply],
  tutorialSeen:[...tutorialSeen],mobs,carcasses,plants,debris,birdFlocks,discoveredSites,earnedDiscoveries,ecology,ecologyClock,ecologyNews,strongRolls,strongTrophies
 };
}
function saveAuto(){
 persistSquadVitals();
 const snapshot=currentSnapshot();
 if(!snapshot)return false;
 if(debugTutorialSession)return true;
 try{
  localStorage.setItem(AUTOSAVE_KEY,JSON.stringify(snapshot));
  persistWorldChronicle();
  return true;
 }catch(_){return false}
}
function checkpointLabel(s){
 const animal=animals[s.player.type]?.name||"動物",lv=Math.max(1,Math.floor(s.player.level||1));
 const date=new Date(s.savedAt||0),when=Number.isFinite(date.getTime())?date.toLocaleString("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";
 return animal+" LV"+lv+"　YEAR "+String(Math.floor(Math.max(0,Number(s.elapsed)||0)/120)).padStart(3,"0")+(when?"　"+when:"");
}
function refreshSaveMenu(){
 const auto=getAutoSnapshot(),points=getCheckpoints();
 const aliveSquad=window.WildSquad?.load?.()?.members?.length||0;
 if(!automaticTutorialShown){migrateSeenTutorial(auto);for(const point of points)migrateSeenTutorial(point)}
 const hasSave=!!auto||aliveSquad>0; // Old checkpoints stay preserved but cannot bypass explicit reset from the title.
 $("menu").classList.toggle("has-saved-game",hasSave);
 $("menu").classList.toggle("has-auto-save",!!auto);
 const primary=auto||null;
 $("continue-btn").classList.remove("hidden");
 $("resume-cta-label").textContent="続きからプレイ";
 $("resume-cta-help").textContent=aliveSquad?(window.WildSquad?.load?.()?.pendingStart?"所有する"+aliveSquad+"体から操作個体を選んで開始":"所有する"+aliveSquad+"体から操作個体を選んで再開"):hasSave?"保存した"+(animals[primary?.player?.type]?.name||"動物")+"で再開" :"ガチャで動物を獲得してください";
 $("continue-btn").disabled=!hasSave;
 $("continue-detail").textContent=primary?checkpointLabel(primary):"";
 $("checkpoint-menu-btn").classList.toggle("hidden",!points.length);
 if(!points.length){$("checkpoint-list").classList.add("hidden");$("checkpoint-menu-btn").setAttribute("aria-expanded","false");}
 for(let i=0;i<3;i++){
  const button=$("checkpoint-slot-"+i),snapshot=points[i];
  button.classList.toggle("hidden",!snapshot);
  if(snapshot)button.textContent=(i+1)+". "+checkpointLabel(snapshot);
 }
}
// Reconcile already-completed goals in older saves without replaying lessons.
function reconcileRestoredGoals(){
 const previous=mission;
 if(mission===0&&meals>=1)mission=1;
 if(mission===1&&hiddenHold>=.75&&inVisibleShrubCover(P))mission=2;
 if(mission===2&&kills>tutorialHuntBase)mission=4;
 // Retired station objective: continue old saves at the practical den lesson.
 if(mission===3)mission=4;
 // A single successful deposit finishes the onboarding; territory/exploration are optional play.
 if(mission===4&&denStash>tutorialStashBase)mission=7;
 if(mission===5||mission===6)mission=7; // Old schema-2 optional-goal saves.
 if(mission===7){missionComplete=true;tutorialSeen.add(7)}
 for(let n=0;n<=Math.min(7,mission);n++)tutorialSeen.add(n);
 return mission!==previous;
}
function restoreSnapshot(snapshot){
 if(!squadSnapshotAlive(snapshot))return false;
 migrateSeenTutorial(snapshot);
 choice=snapshot.player.type;
 selectNewGameAnimal(choice);
 let started=false;
 restoringSavedWorld=true;
 try{started=start()}finally{restoringSavedWorld=false}
 if(!started)return false;
 scoreRunId=scoreRunIdFromSnapshot(snapshot);
 const p=snapshot.player;
 P={...P,...p,base:animals[choice],type:choice};
 P.stillTime=clamp(Number(P.stillTime)||0,0,2.5);P.beakStrike=false;P.beakVisual=0;
 Object.assign(P,normalizeSavedPlayerStats(p,animals[choice]));
 // Preserve saved birth year; older SAVE_SCHEMA2 runs migrate without resetting the world clock.
 initializeLife(P,Math.max(Number(snapshot.elapsed)||0,Number(snapshot.worldChronicleElapsed)||0,loadWorldChronicle().elapsed),true);
 // SAVE_SCHEMA=2 predates some survival fields: never resume with NaN hunger.
 P.hunger=p.hunger==null||p.hunger===""?100:Number.isFinite(Number(p.hunger))?clamp(Number(p.hunger),0,100):100;
 if(choice==="cat"&&!p.catSpeedV2){
  // Older SAVE_SCHEMA=2 cat runs retain their upgrades. New 320+ saves are not amplified.
  // All legacy cats used base 239, including upgraded saves above 320.
  // Preserve the earned speed multiplier against the new base exactly once.
  const legacySpeed=Number(p.speed);
  const savedSpeed=Number.isFinite(legacySpeed)&&legacySpeed>0?legacySpeed:239;
  P.speed=Math.max(320,Math.round(savedSpeed*320/239));
  P.catSpeedV2=true;
 }
 P.inheritedTraits=Object.fromEntries(Object.keys(STRONG_TRAITS).map(type=>[type,P.inheritedTraits?.[type]===true]));
 P.carry=normalizeCarry(P.carry); // Legacy corpse/meat/berries compatibility.
 P.strongWound=clamp(Number(P.strongWound)||0,0,5.5);
 P.poisonTime=clamp(Number(P.poisonTime)||0,0,9);
 P.x=clamp(p.x,P.r+12,WORLD.w-P.r-12);
 P.y=clamp(p.y,P.r+12,WORLD.h-P.r-12);
 if(waterBlocksLand(P.x,P.y)&&!(P.type==="shoebill"&&waterDepth(P.x,P.y)<=.24)){const safe=nearestDryBank(P.x,P.y,P.r);if(safe){P.x=safe.x;P.y=safe.y;}}
 const roof=roofAt(P.x,P.y);
 P.groundZ=roof;P.jumpHeight=roof;P.jumpTime=0;P.pounceTime=0;P.pounceRemaining=0;
 P.fallTime=0;P.dashTime=0;P.pendingStrike=false;P.chargeStrike=false;P.windup=0;
 P.vx=0;P.vy=0;P.jumpDive=false;P.jumpAmbush=false;P.wallKickTime=0;P.wallKicks=0;P.wallKickLast=-1;
 elapsed=Math.max(Number(snapshot.elapsed)||0,Number(snapshot.worldChronicleElapsed)||0,loadWorldChronicle().elapsed);day=1+Math.floor(elapsed/85);
 kills=snapshot.kills||0;meals=snapshot.meals||0;hiddenHold=snapshot.hiddenHold||0;
 tutorialHuntBase=Number.isFinite(snapshot.tutorialHuntBase)?clamp(snapshot.tutorialHuntBase,0,kills):kills;
 expedition=snapshot.expedition||1;freeStep=clamp(Math.floor(Number(snapshot.freeStep)||0),0,3);freeTarget=Number(snapshot.freeTarget)||0;questReady=snapshot.questVersion===1;
 mission=snapshot.mission||0;missionComplete=!!snapshot.missionComplete||mission>=7;
 tutorialSeen.clear();
 // Old saves skipped the current lesson (especially stage 4); completed earlier stages are not replayed.
 for(const stage of TUTORIAL_STAGES)if(stage<mission||(!debugTutorialSession&&tutorialLessonsSeenEver.has(stage)))tutorialSeen.add(stage);
 if(mission>=7)tutorialSeen.add(7);
 totalScore=snapshot.totalScore||0;weather=["CLEAR","CLOUDY","RAIN","THUNDER","FOG","WIND","SNOW"].includes(snapshot.weather)?snapshot.weather:"CLEAR";
 lightningStrike=snapshot.lightningStrike&&Number.isFinite(snapshot.lightningStrike.x)&&Number.isFinite(snapshot.lightningStrike.y)&&Number.isFinite(snapshot.lightningStrike.countdown)?
 {x:clamp(snapshot.lightningStrike.x,24,WORLD.w-24),y:clamp(snapshot.lightningStrike.y,24,WORLD.h-24),kind:String(snapshot.lightningStrike.kind||"ground"),countdown:clamp(snapshot.lightningStrike.countdown,0,2),afterglow:clamp(snapshot.lightningStrike.afterglow||0,0,1)}:null;
 lightningHistory=Array.isArray(snapshot.lightningHistory)?snapshot.lightningHistory.filter(e=>e&&Number.isFinite(e.year)&&Number.isFinite(e.x)&&Number.isFinite(e.y)).slice(-24):[];
  if(!lightningHistory.length)lightningHistory=loadWorldChronicle().lightningHistory;
 weatherTimer=Number.isFinite(snapshot.weatherTimer)&&snapshot.weatherTimer>0?snapshot.weatherTimer:rnd(24,45);
 nextWeather=null;weather=tokyoWeatherAt(elapsed);weatherTimer=85-(elapsed%85);
 thunderTimer=Number.isFinite(snapshot.thunderTimer)&&snapshot.thunderTimer>0?snapshot.thunderTimer:9;
 thunderFlash=0;windDirection=Number.isFinite(snapshot.windDirection)?snapshot.windDirection:0;
 scoreTimer=snapshot.scoreTimer||0;spawnTimer=clamp(Number(snapshot.spawnTimer)||0,0,WILDLIFE.spawnInterval);lastPackSpawnAt=Number.isFinite(snapshot.packLastSpawnAt)&&snapshot.packLastSpawnAt<=elapsed?snapshot.packLastSpawnAt:elapsed;lastPopulatedRegion=regionAt(P.x,P.y)+(mountainHabitat(P.x,P.y)?
  ":"+MOUNTAIN.zone(P.x):"");
 denLevel=clamp(Math.floor(snapshot.denLevel||1),1,DEN_MAX_LEVEL);
 denStores=normalizeDenStores(snapshot.denStores,snapshot.denStash||0);syncDenStash();
 tutorialStashBase=Number.isFinite(snapshot.tutorialStashBase)?clamp(snapshot.tutorialStashBase,0,denStash):denStash;
 territoryClaims=Array.isArray(snapshot.territoryClaims)&&snapshot.territoryClaims.length===3?snapshot.territoryClaims.map(Boolean):[false,false,false];
 territoryLastSupply=Array.isArray(snapshot.territoryLastSupply)&&snapshot.territoryLastSupply.length===3?snapshot.territoryLastSupply:[day,day,day];
 const cleanWorld=sanitizeSavedWorld(snapshot);
 mobs=cleanWorld.mobs;carcasses=cleanWorld.carcasses;
 // 旧セーブの同行AIは敵・野生動物としても復活させず、操作個体だけ復元する。
 mobs=mobs.filter(m=>!m.companion && !m.squadIndividualId);

  strongRolls=snapshot.strongRolls&&typeof snapshot.strongRolls==="object"&&!Array.isArray(snapshot.strongRolls)?JSON.parse(JSON.stringify(snapshot.strongRolls)):{};
  strongTrophies=snapshot.strongTrophies&&typeof snapshot.strongTrophies==="object"?{...snapshot.strongTrophies}:{};
  strongRegionCurrent=-1;normalizeStrongBossSave();
 for(const c of carcasses)normalizeRemains(c);
 for(const m of mobs){
  // In-flight special warnings never resolve on load without showing a fresh tell.
  m.signature=null;m.signatureCooldown=clamp(Number(m.signatureCooldown)||0,0,16);
  m.signatureUse=clamp(Math.floor(Number(m.signatureUse)||0),0,1000);
  m.bossPresenceShown=false;
  if(m.type==="mountainGoat"){m.headbuttTell=0;m.headbuttArmed=false;}
  m.cornerTell=0;m.cornerArmed=false;m.defenseTell=0;m.defenseArmed=false;
  if(m.type==="serow"||m.type==="zebra"){m.defenseTell=0;m.defenseArmed=false;}
  m.reactiveUntil=0;m.attackVariation=null;
   if(m.type==="dog"){m.foodTheftTell=0;m.foodTheftArmed=false;m.foodTheftCooldown=Math.max(1,Number(m.foodTheftCooldown)||0);}
  if(m.type==="giantGorilla")m.rock=null;
  if(m.type==="macaque"){m.macaqueStone=null;m.macaqueTell=0;m.treeHeight=0;m.groundZ=0;m.evadeHeight=0;}
  if(m.type==="chimpanzee"){m.chimpStone=null;m.chimpTell=0;m.chimpAttackKind=null;m.treeHeight=0;m.groundZ=0;m.evadeHeight=0;}
  if(m.type==="giantEagle"){m.airPhase="circle";m.airHeight=Math.max(90,Number(m.airHeight)||125);m.airTimer=1.4;m.airTarget=null;m.airHit=false;m.windup=0;}
  if(isAquaticStrong(m)){
   // Keep saved aquatic bosses in the river/canal; never migrate them onto land.
   const safe=nearestAquaticWater(m.x,m.y,m.r||18,m.strongRegion);
   if(safe){m.x=safe.x;m.y=safe.y;}
   // A load must not release a previously queued strike without its warning.
   m.aquaticStrike=false;m.windup=0;m.windupTotal=0;
   m.wildAttack=clamp(Number(m.wildAttack)||0,0,3);
  }else if(m.type!=="giantEagle"&&waterBlocksLand(m.x,m.y)){
   // Aerial species may resume above water; only ground species move to the bank.
   const safe=nearestDryBank(m.x,m.y,m.r||18);if(safe){m.x=safe.x;m.y=safe.y;}
  }
  m.evadeCooldown=clamp(Number(m.evadeCooldown)||0,0,8);
  m.evadeTime=0;m.evadeDuration=0;m.evadeRemaining=0;m.evadeSpeed=0;m.evadeHeight=0;
  m.evadeAngle=Number.isFinite(m.evadeAngle)?m.evadeAngle:0;
  m.restNeed=Number.isFinite(m.restNeed)?clamp(m.restNeed,0,1):null;
  m.restTime=Number.isFinite(m.restTime)?clamp(m.restTime,0,12):0;
  m.restCooldown=Number.isFinite(m.restCooldown)?clamp(m.restCooldown,0,30):0;
  m.resting=m.restTime>0;
  m.shelterDoorX=Number.isFinite(m.shelterDoorX)?m.shelterDoorX:null;
  m.shelterDoorY=Number.isFinite(m.shelterDoorY)?m.shelterDoorY:null;
  m.shelterPhase=m.shelterPhase===1?1:0;
  m.forageNeed=Number.isFinite(m.forageNeed)?clamp(m.forageNeed,0,1):null;
  m.forageCooldown=clamp(Number(m.forageCooldown)||0,0,8);
  m.foragePose=0;
  m.feedAfterKill=clamp(Number(m.feedAfterKill)||0,0,8);
  m.scavengeNeed=Number.isFinite(m.scavengeNeed)?clamp(m.scavengeNeed,0,1):null;
  m.scavengeCooldown=clamp(Number(m.scavengeCooldown)||0,0,8);
  m.thirstNeed=Number.isFinite(m.thirstNeed)?clamp(m.thirstNeed,0,1):null;
  m.drinkCooldown=clamp(Number(m.drinkCooldown)||0,0,10);
  m.drinkPose=0;
  m.feintTime=0;m.feintRemaining=0;m.feintSpeed=0;
  m.feintAngle=Number.isFinite(m.feintAngle)?m.feintAngle:0;
  m.feintCooldown=clamp(Number(m.feintCooldown)||0,0,8);
 }
 const expandedPlants=plants.filter(item=>item.x>4200||item.y>2400);
 const expandedDebris=debris.filter(item=>item.x>4200||item.y>2400);
 plants=snapshot.worldVersion===2?cleanWorld.plants:cleanWorld.plants.concat(expandedPlants);
 ensureDenCover();
 if(mission<=1)ensureTrainingCoverNear(P);
 debris=snapshot.worldVersion===2?cleanWorld.debris:cleanWorld.debris.concat(expandedDebris);
 discoveredSites=Array.isArray(snapshot.discoveredSites)?snapshot.discoveredSites.filter(id=>EXPLORE_SITES.some(s=>s.id===id)):[];
 ecology=Array.isArray(snapshot.ecology)&&snapshot.ecology.length===8?snapshot.ecology.map((e,i)=>({
  prey:clamp(Number(e?.prey)||initialEcology()[i].prey,4,86),
  predators:clamp(Number(e?.predators)||initialEcology()[i].predators,3,31),
  food:clamp(Number(e?.food)||55,10,94),
  pressure:clamp(Number(e?.pressure)||0,0,5),
  dominance:clamp(Math.floor(Number(e?.dominance)||0),0,2),
  events:clamp(Math.floor(Number(e?.events)||0),0,9999)
 })):initialEcology();
 ecologyClock=clamp(Number(snapshot.ecologyClock)||0,0,14.99);
 ecologyNews=typeof snapshot.ecologyNews==="string"?snapshot.ecologyNews.slice(0,100):"生態系は変化し続けている";
 earnedDiscoveries=Array.isArray(snapshot.earnedDiscoveries)?
 snapshot.earnedDiscoveries.filter(id=>typeof id==="string"&&DISCOVERY_PERKS[id]):[];
 for(const id of discoveredSites)awardDiscovery(id,true);
 if(Array.isArray(snapshot.birdFlocks)&&snapshot.birdFlocks.length<=30){
  birdFlocks=snapshot.birdFlocks.filter(normalizeBirdRoost);
 }
 cameraYaw=Number.isFinite(snapshot.camera?.yaw)?snapshot.camera.yaw:0;
 cameraZoom=clamp(Number.isFinite(snapshot.camera?.zoom)?snapshot.camera.zoom:.8,.47,1.6);
 updateCameraView();$("zoom-level").textContent=Math.round(cameraZoom*100)+"%";
 cam.x=clamp(Number.isFinite(snapshot.camera?.x)?snapshot.camera.x:P.x-vw/2,0,Math.max(0,WORLD.w-vw));
 cam.y=clamp(Number.isFinite(snapshot.camera?.y)?snapshot.camera.y:P.y-vh/2,0,Math.max(0,WORLD.h-vh));
 huntTarget=null;ambushTarget=null;huntSlowUntil=0;pounceStreaks.length=0;$("hunt-cinematic").classList.remove("show");guideWisp=null;guideGoal=null;guideCache=null;particles=[];popups=[];autosaveClock=0;
 resetControls();
 try{saveDenLevel();saveDenStash();saveTerritoryClaims()}catch(_){}
 mode=snapshot.savedMode==="upgrade"?"upgrade":"play";show(mode==="upgrade"?"upgrade":"");
 reconcileRestoredGoals();
 // Recover the player and saved wildlife from new cave pillars and mountain rocks.
 // This also repairs old city gaps without changing SAVE_SCHEMA=2 or checkpoint counts.
 const playerRepositioned=recoverPlayerFromGap(P);
 const wildlifeRepositioned=repairRestoredMountainMobs();
 // Saved cameras can belong to an old viewport or be stranded away from the player.
 // Always make the restored animal visible on the first rendered frame.
 cam.x=clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw));
 cam.y=clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh));
 const nearbyPredatorsRestored=ensureLocalPredators(regionAt(P.x,P.y)===7?2:1);
 syncSquadFollowers();
 // Reconcile the saved world with the animal explicitly selected on the title.
 if(window.WildSquad?.load?.()?.members?.length)applySquadLeader();
 restoreReleasedWildlife();enterStrongStage();syncHUD(Math.floor((elapsed%85)/85*24));drawMini();
 if(playerRepositioned||wildlifeRepositioned)notify("地形変更に合わせて安全な位置へ復元");
 saveAuto();if(mission>6)announceObjective();notify("保存した場所から再開");
 return true;
}
function recordCheckpoint(){
 if(debugTutorialSession){$("checkpoint-save-status").textContent="通しテスト中はチェックポイントを変更しません";return false;}
 if(mode!=="pause")return false;
 const snapshot=currentSnapshot();
 if(!snapshot)return false;
 try{
  const points=[snapshot,...getCheckpoints()].slice(0,3);
  localStorage.setItem(CHECKPOINTS_KEY,JSON.stringify(points));
  $("checkpoint-save-status").textContent="保存完了："+checkpointLabel(snapshot);
  saveAuto();
  return true;
 }catch(_){
  $("checkpoint-save-status").textContent="保存できませんでした。端末の保存容量・設定を確認してください。";
  return false;
 }
}



/* STRONG-COMBAT-4-V2: separate timing, impact, binding and charge. */
const STRONG_ATTACK_PROFILES={
 cheetah:{windup:.30,reach:63,cooldown:1.35,damage:.94,tell:"チーターの高速接近！"},
 lion:{windup:.57,reach:79,cooldown:1.57,damage:1.06,tell:"ライオンが構えた！"},
 giraffe:{windup:.63,reach:102,cooldown:1.78,damage:1.06,tell:"キリンが首を振りかぶる！"},
 elephant:{windup:1.07,reach:125,cooldown:2.3,damage:1.08,tell:"ゾウが鼻を振り上げた！"},
 hippo:{windup:.80,reach:112,cooldown:2.0,damage:1.04,tell:"カバの縄張り突進！"},
 strayCat:{windup:.29,reach:58,cooldown:1.24,damage:.90,tell:"猫が飛びかかる！"},
 wildFox:{windup:.36,reach:68,cooldown:1.46,damage:1.03,tell:"狐が飛びかかる！"},
 weasel:{windup:.25,reach:43,cooldown:1.08,damage:.90,tell:"イタチの噛みつき！"},
 raccoonDog:{windup:.45,reach:49,cooldown:1.4,damage:1.03,tell:"タヌキが威嚇！"},
 venomSnake:{windup:.46,reach:46,cooldown:1.65,damage:.87,tell:"毒牙に注意！"},
 giantSnake:{windup:.86,reach:58,cooldown:1.75,damage:1.05,tell:"巻き付き予兆！"},
 oldBear:{windup:.92,reach:58,cooldown:1.62,damage:1.22,tell:"重い爪の予兆！"},
 giantBoar:{windup:.76,reach:125,cooldown:1.46,damage:1.12,tell:"猛突進予兆！"},
 blackPanther:{windup:.43,reach:108,cooldown:1.26,damage:1.06,tell:"飛びかかり予兆！"},
 oneEyedWolf:{windup:.65,reach:108,cooldown:1.48,damage:1.12,tell:"回り込み予兆！"},
 whiteTiger:{windup:.57,reach:132,cooldown:1.67,damage:1.23,tell:"跳躍予兆！"},
 giantHyena:{windup:.48,reach:57,cooldown:1.18,damage:1.03,tell:"執拗な噛み付き！"},
 giantLion:{windup:.72,reach:68,cooldown:2.12,damage:.73,tell:"咆哮！ 連撃に注意！"},
 giantMoose:{windup:.81,reach:130,cooldown:1.83,damage:1.04,tell:"巨大な角が迫る！"},
 giantBuffalo:{windup:.98,reach:145,cooldown:2.05,damage:1.13,tell:"群れを守る猛突進！"},
 giantCrocodile:{windup:.64,reach:142,cooldown:2.4,damage:1.10,tell:"水面から急襲！"},
 giantHippo:{windup:.93,reach:160,cooldown:2.7,damage:1.18,tell:"水辺から突進！"},
 giantAnaconda:{windup:.82,reach:125,cooldown:2.2,damage:.94,tell:"水面の巻き付き！"},
 giantLizard:{windup:.54,reach:69,cooldown:1.63,damage:.93,tell:"大トカゲの噛み付き！"},
 rhino:{windup:.98,reach:157,cooldown:2.35,damage:1.18,tell:"サイが角を下げた！"},
 giantGorilla:{windup:.86,reach:245,cooldown:2.55,damage:1.12,tell:"ゴリラが岩を持ち上げた！"},
 giantElephant:{windup:1.12,reach:162,cooldown:2.65,damage:1.24,tell:"ゾウが踏み鳴らす！"},
 albinoWolf:{windup:.52,reach:118,cooldown:1.43,damage:1.02,tell:"白い影が飛びかかる！"},
 giantEagle:{windup:.84,reach:95,cooldown:3.4,damage:1.08,tell:"大鷲が急降下！"}
};
// Food and safe den rest shorten a strong enemy's bleeding wound.
function sootheStrongWound(foodPoints,atHome=false){
 if(!P||!(P.strongWound>0))return 0;
 const relief=Math.min(P.strongWound,Math.max(0,Number(foodPoints)||0)*(atHome?.15:.08));
 P.strongWound=Math.max(0,P.strongWound-relief);
 return relief;
}
// Single shared contact calculation: telegraph range and strike reach must agree.
// A long-neck giraffe can strike from farther away, but the fixed strike
// direction, line of sight and recovery frames still permit an honest dodge.
// A fully overlapping animal must remain hittable regardless of where either
// sprite is facing. Use the physical radii, not the displayed head/neck position.
function hitboxesOverlap(a,b,distance){
 const d=Number.isFinite(distance)?distance:Math.hypot((a?.x||0)-(b?.x||0),(a?.y||0)-(b?.y||0));
 return d<=Math.max(3,(Number(a?.r)||12)+(Number(b?.r)||12));
}
function ordinaryMeleeReach(m){
 const advertised=STRONG_ATTACK_PROFILES[m.type]?.reach??(m.type==="boar"?115:m.type==="alpha"?112:37);
 const cap=m.type==="giraffe"?135:m.strongBoss?116:112;
 return P.r+m.r+Math.min(cap,Math.max(32,advertised)*Math.min(1.36,m.attackVariation?.reach||1));
}
function applyOrdinaryStrikeEffect(m,angle){
 const alt=!m.strongBoss&&m.attackVariation;
 if(!alt||!P)return;
 if(alt.stamina)P.sp=clamp(P.sp-alt.stamina,0,100);
 if(alt.slow)P.strongSlow=Math.max(P.strongSlow||0,alt.slow);
 if(alt.knock)move(P,Math.cos(angle)*alt.knock,Math.sin(angle)*alt.knock);
 label(P.x,P.y-57,alt.name,"#ffd9aa");
}
function applyStrongStrikeEffect(m,angle,charging=false){
 if(m.type==="giantLizard"){
  P.strongWound=Math.max(P.strongWound||0,5.5);label(P.x,P.y-48,"噛み傷で出血！","#f9b2a2");
 }else if(m.type==="giantGorilla"){
  P.strongSlow=Math.max(P.strongSlow||0,1.4);P.sp=clamp(P.sp-15,0,100);label(P.x,P.y-48,"つかまれた！","#ffd2a6");
 }else if(m.type==="giantElephant"){
  P.sp=clamp(P.sp-20,0,100);move(P,Math.cos(angle)*62,Math.sin(angle)*62);label(P.x,P.y-48,"踏みつけと鼻の一撃！","#ffd2a6");
 }else if(m.type==="giantEagle"){
  P.sp=clamp(P.sp-13,0,100);label(P.x,P.y-48,"大鷲の爪！","#ffd9a6");
 }else if(m.type==="albinoWolf"){
  P.sp=clamp(P.sp-12,0,100);label(P.x,P.y-48,"白狼の急襲！","#ffe3c0");
 }else if(m.type==="rhino"){
  P.sp=clamp(P.sp-16,0,100);move(P,Math.cos(angle)*68,Math.sin(angle)*68);label(P.x,P.y-48,"角突進！","#ffbf91");
 }else if(m.type==="giantCrocodile"){
  P.strongSlow=Math.max(P.strongSlow||0,1.2);
  move(P,Math.cos(angle+Math.PI)*17,Math.sin(angle+Math.PI)*17);
  label(P.x,P.y-48,"水際へ引き込まれる！","#ffca9e");
 }else if(m.type==="giantHippo"){
  move(P,Math.cos(angle)*49,Math.sin(angle)*49);
  P.sp=clamp(P.sp-13,0,100);
  label(P.x,P.y-48,"水辺の強烈な突進！","#ffc69e");
 }else if(m.type==="giantAnaconda"){
  P.strongSlow=Math.max(P.strongSlow||0,2.8);
  P.sp=clamp(P.sp-10,0,100);
  label(P.x,P.y-48,"締め付けで移動低下！","#ffd4a5");
 }else if(m.type==="giantSnake"){
  P.strongSlow=Math.max(P.strongSlow||0,1.9);
  label(P.x,P.y-48,"締め付け！ 動きが鈍る","#ffc7a6");
 }else if(m.type==="giantLion"){
  P.sp=clamp(P.sp-12,0,100);label(P.x,P.y-48,"咆哮で持久力 -12","#ffd2a1");
 }else if(m.type==="giantHyena"){
  P.sp=clamp(P.sp-16,0,100);
  label(P.x,P.y-48,"持久力 -16","#ffc4a2");
 }else if(m.type==="oneEyedWolf"||m.type==="oldBear"||m.type==="giantBoar"||m.type==="blackPanther"||m.type==="whiteTiger"||m.type==="giantMoose"||m.type==="giantBuffalo"){
  const knock=m.type==="oldBear"?39:m.type==="giantBoar"?48:m.type==="whiteTiger"?38:m.type==="giantMoose"?43:m.type==="giantBuffalo"?62:m.type==="oneEyedWolf"?18:23;
  if(m.type==="giantMoose")P.sp=clamp(P.sp-10,0,100);
  move(P,Math.cos(angle)*knock,Math.sin(angle)*knock);
  if(m.type==="oneEyedWolf")P.sp=clamp(P.sp-8,0,100);
  label(P.x,P.y-48,charging?"吹き飛ばされた！":"強烈な一撃！","#ffbf91");
 }
}

/* BOSS-SIGNATURES-V1: 20 species × two distinct, avoidable signature attacks.
 * The patterns are a pure module; all HP and save state remain in game.js. */
const BOSS_PATTERNS=window.WildBossPatterns;
let lastBossPresenceAt=-1e9,bossPresenceUntil=0;
// Strong encounters change the nearby ecology: ordinary wildlife visibly
// scatters without creating any new groups or raising the population cap.
function scatterWildlifeAroundBoss(m,dt){
 if(!m?.strongBoss||!P)return;
 m.auraClock=Math.max(0,(m.auraClock||0)-dt);
 if(m.auraClock>0)return;
 m.auraClock=.83;
 for(const q of mobs){
  if(q===m||q.hp<=0||q.strongBoss||Object.prototype.hasOwnProperty.call(STRONG_NAMES,q.type))continue;
  const radius=species[q.type]?.prey?290:170;
  if(dist(q,m)>radius||lineBlocked(m,q))continue;
  q.flee=Math.max(q.flee||0,1.45);
  q.fleeThreatX=m.x;q.fleeThreatY=m.y;
  q.dir=Math.atan2(q.y-m.y,q.x-m.x);q.escapeTimer=0;
  q.resting=false;q.restTime=0;
 }
}
function revealBossPresence(m,d){
 if(!m?.strongBoss||!P||d>535||m.bossPresenceShown||!visible(m.x,m.y,95)||mode!=="play")return false;
 if(elapsed-lastBossPresenceAt<14)return false;
 m.bossPresenceShown=true;lastBossPresenceAt=elapsed;bossPresenceUntil=elapsed+2.55;
 const panel=$("boss-presence");
 if(panel){
  $("boss-presence-name").textContent=STRONG_NAMES[m.type]||"正体不明の強敵";
  $("boss-presence-sub").textContent="危険な気配。攻撃範囲を見極めろ";
  panel.classList.add("active");
 }
 shake=Math.max(shake,2.7);playEffect("howl",{volume:.13,rate:.69});
 return true;
}
function applyBossSignatureEffect(m,s){
 if(!P||!s)return;
 const outward=Math.atan2(P.y-m.y,P.x-m.x);
 const push=n=>move(P,Math.cos(outward)*n,Math.sin(outward)*n);
 const stamina=n=>{P.sp=clamp(P.sp-n,0,100);};
 const slow=n=>{P.strongSlow=Math.max(P.strongSlow||0,n);};
 const wound=n=>{P.strongWound=Math.max(P.strongWound||0,n);};
 // Each species keeps a distinct consequence beyond damage, with short,
 // reversible debuffs rather than unavoidable death/status stacking.
 switch(m.type){
  case "alpha":stamina(17);P.noiseBurst=Math.max(P.noiseBurst||0,1.3);break;
  case "giantSnake":slow(2.9);break;
  case "oldBear":stamina(25);wound(1.35);break;
  case "giantBoar":push(42);slow(1.15);break;
  case "blackPanther":wound(3.4);break;
  case "oneEyedWolf":stamina(14);push(21);break;
  case "whiteTiger":push(31);wound(1.7);break;
  case "giantHyena":stamina(15);slow(1.65);break;
  case "giantLion":stamina(26);slow(.95);break;
  case "giantMoose":push(61);stamina(12);break;
  case "giantBuffalo":push(51);stamina(18);break;
  case "giantCrocodile":slow(1.55);move(P,Math.cos(outward+Math.PI)*16,Math.sin(outward+Math.PI)*16);break;
  case "giantHippo":push(66);stamina(16);break;
  case "giantAnaconda":slow(3.35);stamina(17);break;
  case "giantLizard":wound(4.3);break;
  case "rhino":push(69);stamina(23);break;
  case "giantGorilla":stamina(21);push(28);break;
  case "giantElephant":stamina(26);push(79);break;
  case "albinoWolf":slow(1.05);P.noiseBurst=Math.max(P.noiseBurst||0,1.25);break;
  case "giantEagle":stamina(16);push(37);break;
 }
 // Each variant is not merely a renamed effect. The second move has a
 // different telegraph shape and exchanges impact for a brief stamina hit.
 if(m.signatureUse%2===0)stamina(4);
}
function updateBossSignature(m,dt,d){
 if(!m?.strongBoss||!P||!BOSS_PATTERNS)return false;
 m.signatureCooldown=Math.max(0,(m.signatureCooldown||0)-dt);
 const active=m.signature;
 if(active&&m.stun>0){
  m.signature=null;m.signatureCooldown=Math.max(m.signatureCooldown,2.8);
  return false;
 }
 if(active){
  m.windup=0;m.chargeTime=0;m.vx=0;m.vy=0;
  if(m.type==="giantGorilla")m.rock=null;
  active.time=Math.max(0,active.time-dt);
  if(active.time>.0001)return true;  // Visible warning remains before impact.
  m.signature=null;m.swing=Math.max(m.swing||0,.28);
  const cover=insideShelter(P)||lineBlocked(m,P);
  const jumping=(P.jumpHeight||0)>Math.max(22,(P.groundZ||0)+17);
  if(!cover&&!jumping&&P.inv<=0&&BOSS_PATTERNS.hit(active,P.x,P.y,P.r*.55)){
   const raw=Math.round(species[m.type].damage*active.power*bossStrikePower(m)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1));
   const amount=strongDamageTaken(raw);
   P.hp=Math.max(0,P.hp-amount);P.lastCombatAt=elapsed;
   interruptRush();P.inv=.58;shake=Math.max(shake,10);flash=Math.max(flash,.22);
   blood(P.x,P.y,"#ec7966",13,115);playEffect("damage");
   applyBossSignatureEffect(m,active);
   label(P.x,P.y-45,active.name+" -"+amount,"#ffd2a8");
  }else if(d<active.range+90){
   m.stun=Math.max(m.stun,.33);
   label(m.x,m.y-m.r-28,"見切った！","#b6f7dc");
  }
  return true;
 }
 if(m.signatureCooldown>0||m.stun>0||m.attack>.08||m.windup>0||m.chargeTime>0||
    P.hidden||insideShelter(P)||d>370||d<1||lineBlocked(m,P))return false;
 const n=m.signatureUse||0,descriptor=BOSS_PATTERNS.pattern(m.type,n);
 if(!descriptor||d>Math.max(195,descriptor.range+100))return false;
 const attack=BOSS_PATTERNS.target(m,P,descriptor);
 if(!attack)return false;
 if(m.hp<m.maxHp*.45){attack.total*=.88;attack.time=attack.total;}
 m.signature=attack;m.signatureUse=n+1;
 m.signatureCooldown=descriptor.cooldown*(m.hp<m.maxHp*.45?.49:.66)+(m.hp<m.maxHp*.45?0:.45);
 m.attack=Math.max(m.attack,attack.total+.46);
 m.windup=0;m.chargeTime=0;m.aquaticStrike=false;m.vx=0;m.vy=0;
 m.dir=attack.dir;
 label(m.x,m.y-m.r-37,"強敵技："+descriptor.name,"#ffae90");
 playEffect("snarl",{volume:.10,rate:.74});
 return true;
}
function drawBossThreats(entities){
 if(!BOSS_PATTERNS)return;
 for(const m of entities){
  if(m===P||!m.strongBoss||m.hp<=0)continue;
  ctx.save();const rhythm=(1+Math.sin(elapsed*3.8+m.r)*.10);
  ctx.strokeStyle=m.hp<m.maxHp*.45?"rgba(255,156,75,.85)":"rgba(255,95,78,.70)";ctx.lineWidth=2.2;
  ctx.beginPath();ctx.arc(m.x,m.y,m.r*rhythm+15,0,TWO);ctx.stroke();
  ctx.textAlign="center";ctx.textBaseline="bottom";
  ctx.font="900 12px sans-serif";ctx.lineWidth=3.2;ctx.strokeStyle="#1b1316";
  const name=STRONG_NAMES[m.type]||"強敵",by=m.y-m.r-58;
  ctx.strokeText("強敵・"+name,m.x,by);ctx.fillStyle="#ffd0bd";ctx.fillText("強敵・"+name,m.x,by);
  const width=76;ctx.fillStyle="#301c22";ctx.fillRect(m.x-width/2,by+5,width,6);
  ctx.fillStyle=m.hp<m.maxHp*.45?"#ff876d":"#d6514c";
  ctx.fillRect(m.x-width/2,by+5,width*clamp(m.hp/Math.max(1,m.maxHp),0,1),6);
  ctx.restore();
  if(m.signature)BOSS_PATTERNS.draw(ctx,m.signature,elapsed,P?.r*.55||0);
 }
}

/* STRONG-WATER-3: water-only movement and bank attacks; dry bridges stay passable. */
const AQUATIC_STRONG_TYPES=new Set(["giantCrocodile","giantHippo","giantAnaconda"]);
function isAquaticStrong(m){return !!m&&AQUATIC_STRONG_TYPES.has(m.type);}
function aquaticStagePoints(region){
 if(!P||region!==4&&region!==7)return [];
 const points=[];
 for(let dx=-840;dx<=840;dx+=105)for(let dy=-840;dy<=840;dy+=105){
  const x=P.x+dx,y=P.y+dy,d=Math.hypot(dx,dy);
  if(d<270||d>980||x<70||y<70||x>WORLD.w-70||y>WORLD.h-70||regionAt(x,y)!==region)continue;
  const depth=waterDepth(x,y);
  if(depth>.09&&depth<.92&&!collides(x,y,55,null,true))points.push({x,y});
 }
 return points;
}
// Restore a water boss at its saved water position, or a nearby valid water tile.
function nearestAquaticWater(x,y,r,region){
 if(waterDepth(x,y)>.035&&!collides(x,y,r,null,true))return {x,y};
 const zone=Number.isInteger(region)?region:regionAt(x,y);
 for(let distance=32;distance<=1800;distance+=32)for(let k=0;k<24;k++){
  const angle=k*Math.PI/12,px=clamp(x+distance*Math.cos(angle),r+13,WORLD.w-r-13);
  const py=clamp(y+distance*Math.sin(angle),r+13,WORLD.h-r-13);
  if(regionAt(px,py)===zone&&waterDepth(px,py)>.09&&!collides(px,py,r,null,true))return {x:px,y:py};
 }
 return null;
}
function aquaticMove(m,dx,dy){
 const allowed=(x,y)=>waterDepth(x,y)>.035&&!collides(x,y,m.r,null,true);
 if(allowed(m.x+dx,m.y+dy)){m.x+=dx;m.y+=dy;return;}
 if(allowed(m.x+dx,m.y))m.x+=dx;
 if(allowed(m.x,m.y+dy))m.y+=dy;
}
// Water predators can catch wildlife at the shoreline without walking on land.
function aquaticBankHunt(m,s,dt,playerDistance){
 m.wildAttack=Math.max(0,(m.wildAttack||0)-dt);
 if(m.wildAttack>0||m.stun>0||m.windup>0||m.aquaticStrike||playerDistance<175)return false;
 let prey=null,closest=Infinity;
 for(const q of mobs){
  if(q===m||q.hp<=0||!(species[q.type]?.prey||q.type==="boar")||waterBlocksLand(q.x,q.y)||lineBlocked(m,q))continue;
  const distance=dist(m,q);
  if(distance<m.r+q.r+24&&distance<closest){closest=distance;prey=q;}
 }
 if(!prey)return false;
 m.wildAttack=m.type==="giantHippo"?2.5:1.8;
 m.swing=Math.max(m.swing||0,.26);
 m.dir=Math.atan2(prey.y-m.y,prey.x-m.x);
 const bite=Math.max(4,Math.round(s.damage*(m.type==="giantHippo"?.26:m.type==="giantCrocodile"?.32:.27)));
 prey.hp=Math.max(0,prey.hp-bite);prey.flash=Math.max(prey.flash||0,.2);
 if(prey.hp>0){
  if(!startlePrey(prey,m,"hit")){prey.flee=Math.max(prey.flee||0,1.8);prey.fleeThreatX=m.x;prey.fleeThreatY=m.y;}
 }else{
  carcasses.push(animalRemains(prey));
  if(species[prey.type]?.prey){const zone=regionAt(prey.x,prey.y);if(ecology[zone])ecology[zone].prey=Math.max(4,ecology[zone].prey-1);}
 }
 if(playerDistance<390)label(prey.x,prey.y-prey.r-20,prey.hp>0?"水辺の襲撃 -"+bite:"水辺の狩り","#f5c7a0");
 return true;
}
function updateAquaticStrong(m,s,dt){
 // Common NPC update already decreases attack/swing/stun once per frame.
 const d=dist(P,m),near=d<330&&!lineBlocked(m,P),angle=Math.atan2(P.y-m.y,P.x-m.x);
 m.windup=Math.max(0,(m.windup||0)-dt);
 const profile=STRONG_ATTACK_PROFILES[m.type];
 if(m.stun>0){m.vx=0;m.vy=0;return;}
 if(m.windup>0){m.vx=0;m.vy=0;return;}
 if(m.aquaticStrike){
  m.aquaticStrike=false;m.swing=.3;
  const facing=Math.atan2(Math.sin(angle-(m.strikeDir||0)),Math.cos(angle-(m.strikeDir||0)));
  if(d<profile.reach+P.r&&Math.abs(facing)<.92&&!lineBlocked(m,P)&&(P.jumpHeight||0)<22&&P.inv<=0){
   const damage=strongDamageTaken(Math.round(s.damage*profile.damage*bossStrikePower(m)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
   P.lastCombatAt=elapsed;P.hp-=damage;interruptRush();P.inv=.45;shake=10;flash=.25;
   label(P.x,P.y-35,"水辺 -"+damage,"#ff9890");blood(P.x,P.y,"#eb6356",12,110);
   playEffect("damage");applyStrongStrikeEffect(m,angle,false);
  }else if(d<profile.reach+80){m.stun=Math.max(m.stun,.22);label(m.x,m.y-m.r-15,"回避成功！","#a6f5d8");}
  return;
 }
 if(near&&d<profile.reach+P.r+26&&m.attack<=0){
  m.attack=profile.cooldown;m.windup=profile.windup;m.windupTotal=profile.windup;
  m.strikeDir=angle;m.aquaticStrike=true;m.dir=angle;
  label(m.x,m.y-m.r-28,profile.tell,"#ffbd83");return;
 }
 const previousX=m.x,previousY=m.y;
 if(near){
  // Crocodile ambushes, hippo makes a straight territorial charge, anaconda coils sideways.
  const lateral=m.type==="giantAnaconda"?Math.sin(elapsed*2.8)*.65:0;
  const approach=m.type==="giantCrocodile"&&d>230?.28:m.type==="giantHippo"?1.65:1;
  m.dir=angle+lateral;
  aquaticMove(m,Math.cos(m.dir)*s.speed*approach*dt,Math.sin(m.dir)*s.speed*approach*dt);
 }else{
  m.wander=(m.wander||0)-dt;
  if(m.wander<=0){m.dir+=rnd(-1.6,1.6);m.wander=rnd(.8,2.4);}
  aquaticMove(m,Math.cos(m.dir)*s.speed*.22*dt,Math.sin(m.dir)*s.speed*.22*dt);
 }
 m.vx=(m.x-previousX)/Math.max(.001,dt);m.vy=(m.y-previousY)/Math.max(.001,dt);
 m.step=(m.step||0)+Math.hypot(m.vx,m.vy)*dt*.05;
 aquaticBankHunt(m,s,dt,d);
 // Nearby terrestrial wildlife recognizes the water predator and leaves the bank.
 for(const q of mobs)if(q!==m&&q.hp>0&&(species[q.type]?.prey||q.type==="boar")&&dist(m,q)<195&&!lineBlocked(m,q)){
  q.flee=Math.max(q.flee||0,1.1);q.fleeThreatX=m.x;q.fleeThreatY=m.y;
 }
}

/* A gorilla's stone moves through the world and can miss or strike cover. */
function updateGorillaRock(m,dt){
 const r=m.rock;if(!r)return;const step=Math.min(Math.max(0,dt),r.ttl||0);
 if(step<=0){m.rock=null;return;}
 const ox=r.x,oy=r.y;r.x+=r.vx*step;r.y+=r.vy*step;r.ttl-=step;
 if(collides(r.x,r.y,10,null)||lineBlocked({x:ox,y:oy},r)){m.rock=null;return;}
 const dx=r.x-ox,dy=r.y-oy,len=dx*dx+dy*dy,t=len>0?clamp(((P.x-ox)*dx+(P.y-oy)*dy)/len,0,1):0;
 if(P.inv<=0&&(P.jumpHeight||0)<25&&Math.hypot(P.x-ox-dx*t,P.y-oy-dy*t)<P.r+13){
  const damage=strongDamageTaken(Math.round(species.giantGorilla.damage*.77*bossStrikePower(m)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
  P.hp-=damage;P.lastCombatAt=elapsed;P.inv=.42;interruptRush();shake=7;flash=.2;P.sp=clamp(P.sp-9,0,100);
  label(P.x,P.y-35,"投石 -"+damage,"#ffaaa0");blood(P.x,P.y,"#a79c8d",8,70);playEffect("damage");m.rock=null;return;
 }
 if(r.ttl<=0)m.rock=null;
}

/* STRONG-EAGLE-FLIGHT: airborne orbit, warning, dive, collision, climb and prey ecology. */

// Mountain macaques share alarms, climb existing trees and use dodgeable stones.
// Sweep each thrown stone across terrain rather than testing only its end point.
// Resolve player contact before any obstacle farther along the same frame.
function traceMacaqueStone(stone,dt,target){
 const ox=stone.x,oy=stone.y,remaining=Math.max(0,Number(stone.ttl)||0);
 const travel=Math.min(Math.max(0,dt),remaining);
 const dx=stone.vx*travel,dy=stone.vy*travel,length=Math.hypot(dx,dy);
 const steps=Math.max(1,Math.ceil(length/6));
 let stop=1,hitWall=false;
 for(let k=1;k<=steps;k++){
  const f=k/steps,x=ox+dx*f,y=oy+dy*f;
  if(x<20||y<20||x>WORLD.w-20||y>WORLD.h-20||collides(x,y,5,null,true,stone.sourceTree||null)){
   stop=f;hitWall=true;break;
  }
 }
 const t=length>0?clamp(((target.x-ox)*dx+(target.y-oy)*dy)/(length*length),0,1):0;
 const contactX=ox+dx*t,contactY=oy+dy*t;
 const hit=length>0&&t<=stop&&Math.hypot(target.x-contactX,target.y-contactY)<target.r+8;
 // Swept collision is authoritative; a source tree's trunk is ignored only
 // for a throw launched from its elevated branch, never other terrain.
 const wall=hitWall;
 stone.x=ox+dx*stop;stone.y=oy+dy*stop;stone.ttl=Math.max(0,remaining-Math.max(0,dt));
 return {hit,blocked:wall||stone.ttl<=0};
}
function updateMacaque(m,dt,d){
 m.macaqueTell=Math.max(0,Number(m.macaqueTell)||0);
 m.treeHeight=Math.max(0,Number(m.treeHeight)||0);
 const spec=species.macaque;
 m.macaqueCooldown=Math.max(0,(m.macaqueCooldown||0)-dt);
 const trees=[...(MOUNTAIN?.trees||[]),...(MOUNTAIN?.pines||[])];
 let tree=null,best=135;
 for(const t of trees){const v=Math.hypot(t.x-m.x,t.y-m.y);if(v<best){best=v;tree=t;}}
 const seen=d<315&&!P.hidden&&!lineBlocked(m,P);
 if(seen){
  m.alert=Math.max(m.alert||0,3);m.lastX=P.x;m.lastY=P.y;
  for(const q of mobs)if(q!==m&&q.type==="macaque"&&q.hp>0&&dist(q,m)<260){
   q.alert=Math.max(q.alert||0,2.3);q.lastX=P.x;q.lastY=P.y;
  }
 }
 if(m.macaqueStone){
  const stone=m.macaqueStone;
  const trace=traceMacaqueStone(stone,dt,P);
  if(trace.hit&&P.inv<=0&&P.hp>0&&!insideShelter(P)){
   const damage=Math.max(3,Math.round(spec.damage*(m.damageScale||enemyDamageFactor())*.8*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
   P.hp=Math.max(0,P.hp-damage);P.inv=.43;P.lastCombatAt=elapsed;
   interruptRush();shake=Math.max(shake,5);flash=Math.max(flash,.13);
   label(P.x,P.y-34,"投石 -"+damage,"#ffc1a4");playEffect("damage");
  }
  if(trace.blocked||trace.hit)m.macaqueStone=null;
 }
 if(m.stun>0||m.hp<m.maxHp*.35){
  m.macaqueTell=0;m.treeHeight=Math.max(0,(m.treeHeight||0)-dt*100);
 }else if(m.macaqueTell>0){
  m.macaqueTell=Math.max(0,m.macaqueTell-dt);
  if(m.macaqueTell===0){
   const aim=Number.isFinite(m.macaqueAim)?m.macaqueAim:Math.atan2(P.y-m.y,P.x-m.x);
   m.macaqueStone={x:m.x+Math.cos(aim)*(m.r+21),y:m.y+Math.sin(aim)*(m.r+21),
    vx:Math.cos(aim)*395,vy:Math.sin(aim)*395,ttl:.95,
    sourceTree:m.treeHeight>12&&tree&&best<tree.r+m.r+24?tree:null};
   m.macaqueCooldown=3.7;m.swing=.24;
  }
 }
 if((m.treeHeight||0)>0){
  m.macaqueTreeTime=Math.max(0,(m.macaqueTreeTime||0)-dt);
  if(m.macaqueTreeTime<=0||!tree||d<65)m.treeHeight=Math.max(0,m.treeHeight-dt*55);
  else m.treeHeight=Math.min(43,m.treeHeight+dt*64);
 }else if(tree&&d<275&&m.alert>0&&m.stun<=0){
  if(best<tree.r+m.r+12){
   m.treeHeight=Math.min(43,(m.treeHeight||0)+dt*64);m.macaqueTreeTime=4.2;
  }else{
   const aim=Math.atan2(tree.y-m.y,tree.x-m.x);
   m.dir=aim;move(m,Math.cos(aim)*spec.speed*.78*dt,Math.sin(aim)*spec.speed*.78*dt);
  }
 }
 m.groundZ=m.treeHeight||0;m.evadeHeight=m.treeHeight||0;
 if(m.treeHeight>0||m.macaqueTell>0){m.vx=0;m.vy=0;}
 else if(m.alert>0&&d<100){
  const away=Math.atan2(m.y-P.y,m.x-P.x);
  m.dir=away;move(m,Math.cos(away)*spec.speed*.65*dt,Math.sin(away)*spec.speed*.65*dt);
 }
 if(seen&&d>75&&d<300&&m.macaqueCooldown<=0&&m.macaqueTell<=0&&!m.macaqueStone&&m.stun<=0){
  m.macaqueTell=.65;m.macaqueAim=Math.atan2(P.y-m.y,P.x-m.x);m.dir=m.macaqueAim;
  label(m.x,m.y-m.r-36,"石を構えた！","#ffe0ac");
 }
 if(!seen&&m.alert>0&&m.treeHeight<=0&&m.macaqueTell<=0&&m.stun<=0){
  const tx=Number.isFinite(m.lastX)?m.lastX:m.x,ty=Number.isFinite(m.lastY)?m.lastY:m.y;
  if(Math.hypot(tx-m.x,ty-m.y)>95){
   m.dir=steerPursuit(m,tx,ty);
   const nx=m.x+Math.cos(m.dir)*spec.speed*.53*dt,ny=m.y+Math.sin(m.dir)*spec.speed*.53*dt;
   if(mountainHabitat(nx,ny))move(m,nx-m.x,ny-m.y);
  }
 }
 if(!seen&&m.alert<=0&&m.treeHeight<=0&&m.stun<=0){
  m.wildAttack=Math.max(0,(m.wildAttack||0)-dt);
  m.feedAfterKill=Math.max(0,(m.feedAfterKill||0)-dt);
  const action=forageWildBerries(m,spec,dt,false,d)||huntWildPrey(m,spec,false,d);
  if(action)move(m,action.vx*dt,action.vy*dt);
  else{
   const leader=m.packId&&m.packOrder>0?mobs.find(q=>q.hp>0&&q.packId===m.packId&&q.packOrder===0):null;
   if(leader&&dist(m,leader)>85)m.dir=Math.atan2(leader.y-m.y,leader.x-m.x);
   else if((m.wander||0)<=0){m.dir+=rnd(-1.4,1.4);m.wander=rnd(.8,2.2);}
   const pace=leader&&dist(m,leader)>85?.58:.22;
   const nx=m.x+Math.cos(m.dir)*spec.speed*pace*dt;
   const ny=m.y+Math.sin(m.dir)*spec.speed*pace*dt;
   if(mountainHabitat(nx,ny))move(m,nx-m.x,ny-m.y);
   else m.dir+=Math.PI*.7;
  }
 }
 m.step=(m.step||0)+dt*(m.treeHeight>0?1.1:2.7);
 m.alert=Math.max(0,(m.alert||0)-dt*.4);
}
// CHIMP-TOOL-FOREST-V1: tree retreat, shared alarm, a dodgeable thrown stone,
// and a short-range branch strike. All phases use existing mob save fields.
// FOOD-THEFT-HUNT-V1: dogs contest meat during the trip back to a den.
// The warning is avoidable; stolen meat remains in the world and can be reclaimed.
function updateFoodThief(m,dt,d){
 m.foodTheftCooldown=Math.max(0,(Number(m.foodTheftCooldown)||0)-dt);
 const carrying=!!P?.carry&&P.carry.type!=="berries"&&P.carry.amount>0;
 const eligible=carrying&&!atDen()&&!insideShelter(P)&&!P.hidden&&d<325&&!lineBlocked(m,P);
 if(!eligible||m.stun>0||m.hp<=0){
  m.foodTheftTell=0;m.foodTheftArmed=false;return false;
 }
 m.alert=Math.max(m.alert||0,3.2);m.lastX=P.x;m.lastY=P.y;
 if((m.foodTheftTell||0)>0){
  m.foodTheftTell=Math.max(0,m.foodTheftTell-dt);
  m.vx=0;m.vy=0;
  if(m.foodTheftTell===0&&m.foodTheftArmed){
   m.foodTheftArmed=false;m.foodTheftCooldown=9.5;m.swing=.27;
   if(P.carry&&P.carry.type!=="berries"&&d<m.r+P.r+34&&!lineBlocked(m,P)&&
    (P.jumpHeight||0)<(P.groundZ||0)+22){
    const food=P.carry;P.carry=null;
    // The stolen meat is recoverable, but leaving it behind lets the dog eat.
    m.scavengeNeed=Math.max(.95,Number(m.scavengeNeed)||0);
    m.feedAfterKill=Math.max(3,Number(m.feedAfterKill)||0);
    carcasses.push({x:m.x,y:m.y,r:11,amount:food.amount,
     type:food.type==="berries"?"berries":"meat",animalType:food.animalType||null,ttl:150,phase:m.dir||0});
    P.revealTimer=Math.max(P.revealTimer||0,.8);
    label(P.x,P.y-42,"肉を奪われた！","#ffc0a2");
    notify("野犬に肉を奪われた！ 地面の肉は拾い直せる");
    syncHUD();playEffect("damage");
   }else label(m.x,m.y-m.r-30,"横取りを回避！","#b4e6c2");
  }
  return true;
 }
 if(m.foodTheftCooldown>0)return false;
 if(d<m.r+P.r+78){
  m.foodTheftTell=.68;m.foodTheftArmed=true;
  m.dir=Math.atan2(P.y-m.y,P.x-m.x);
  label(m.x,m.y-m.r-35,"肉を狙って飛びかかる！","#ffd0a0");
  return true;
 }
 const a=steerPursuit(m,P.x,P.y);m.dir=a;
 const s=species[m.type],nx=m.x+Math.cos(a)*s.speed*.92*dt,ny=m.y+Math.sin(a)*s.speed*.92*dt;
 move(m,nx-m.x,ny-m.y);m.step=(m.step||0)+dt*3;
 return true;
}
function updateChimpanzee(m,dt,d){
 const spec=species.chimpanzee;
 m.chimpCooldown=Math.max(0,(Number(m.chimpCooldown)||0)-dt);
 m.chimpTell=Math.max(0,Number(m.chimpTell)||0);
 m.treeHeight=Math.max(0,Number(m.treeHeight)||0);
 const seen=d<350&&!P.hidden&&!lineBlocked(m,P);
 const forest=[...(MOUNTAIN?.trees||[]),...(MOUNTAIN?.pines||[])];
 let tree=null,best=125;
 for(const t of forest){const n=Math.hypot(t.x-m.x,t.y-m.y);if(n<best){tree=t;best=n;}}
 if(seen){
  m.alert=Math.max(m.alert||0,4.2);m.lastX=P.x;m.lastY=P.y;
  for(const q of mobs)if(q!==m&&q.type==="chimpanzee"&&q.hp>0&&dist(q,m)<330){
   q.alert=Math.max(q.alert||0,3.1);q.lastX=P.x;q.lastY=P.y;
  }
 }
 if(m.chimpStone){
  const trace=traceMacaqueStone(m.chimpStone,dt,P);
  if(trace.hit&&P.inv<=0&&P.hp>0&&!insideShelter(P)){
   const amount=Math.max(4,Math.round(spec.damage*(m.damageScale||enemyDamageFactor())*.78*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
   P.hp=Math.max(0,P.hp-amount);P.inv=.47;P.lastCombatAt=elapsed;
   interruptRush();shake=Math.max(shake,6);flash=Math.max(flash,.16);
   label(P.x,P.y-35,"道具の投石 -"+amount,"#ffd0aa");playEffect("damage");
  }
  if(trace.blocked||trace.hit)m.chimpStone=null;
 }
 if(m.stun>0||m.hp<m.maxHp*.28){
  m.chimpTell=0;m.treeHeight=Math.max(0,m.treeHeight-dt*80);
 }else if(m.chimpTell>0){
  m.chimpTell=Math.max(0,m.chimpTell-dt);
  if(m.chimpTell===0){
   const a=Number.isFinite(m.chimpAim)?m.chimpAim:Math.atan2(P.y-m.y,P.x-m.x);
   if(m.chimpAttackKind==="branch"){
    // A visible .52-second swing is avoidable by moving out of reach.
    if(d<m.r+P.r+48&&!lineBlocked(m,P)&&P.inv<=0&&P.hp>0&&m.treeHeight<8){
     const amount=Math.max(5,Math.round(spec.damage*(m.damageScale||enemyDamageFactor())*1.20*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
     P.hp=Math.max(0,P.hp-amount);P.inv=.52;P.lastCombatAt=elapsed;
     interruptRush();shake=Math.max(shake,7);flash=Math.max(flash,.17);
     label(P.x,P.y-36,"枝の一撃 -"+amount,"#ffc8a1");playEffect("damage");
    }
   }else{
    m.chimpStone={x:m.x+Math.cos(a)*(m.r+22),y:m.y+Math.sin(a)*(m.r+22),
     vx:Math.cos(a)*350,vy:Math.sin(a)*350,ttl:1.02,
     sourceTree:m.treeHeight>12&&tree&&best<tree.r+m.r+24?tree:null};
   }
   m.chimpCooldown=m.chimpAttackKind==="branch"?3.15:4.6;
   m.swing=.25;
  }
 }
 // Climb away from nearby predators; descend before the branch melee.
 if(m.treeHeight>0){
  m.chimpTreeTime=Math.max(0,(m.chimpTreeTime||0)-dt);
  if(m.chimpTreeTime<=0||!tree||d<90||m.hp<m.maxHp*.28)m.treeHeight=Math.max(0,m.treeHeight-dt*66);
  else m.treeHeight=Math.min(54,m.treeHeight+dt*62);
 }else if(tree&&d>150&&d<315&&m.alert>0&&m.stun<=0&&m.chimpTell<=0){
  if(best<tree.r+m.r+10){m.treeHeight=Math.min(54,m.treeHeight+dt*65);m.chimpTreeTime=5;}
  else{const a=Math.atan2(tree.y-m.y,tree.x-m.x);m.dir=a;move(m,Math.cos(a)*spec.speed*.74*dt,Math.sin(a)*spec.speed*.74*dt);}
 }
 m.groundZ=m.treeHeight||0;m.evadeHeight=m.treeHeight||0;
 if(m.treeHeight>0||m.chimpTell>0){m.vx=0;m.vy=0;}
 if(seen&&m.chimpCooldown<=0&&m.chimpTell<=0&&!m.chimpStone&&m.stun<=0){
  if(d<spec.r+P.r+62&&m.treeHeight<8){
   m.chimpAttackKind="branch";m.chimpTell=.52;
  }else if(d>105&&d<340){
   m.chimpAttackKind="stone";m.chimpTell=.76;
  }
  if(m.chimpTell>0){
   m.chimpAim=Math.atan2(P.y-m.y,P.x-m.x);m.dir=m.chimpAim;
   label(m.x,m.y-m.r-41,m.chimpAttackKind==="branch"?"枝を振り上げた！":"石を構えた！","#ffcc92");
  }
 }
 if(m.treeHeight<=0&&m.chimpTell<=0&&m.stun<=0){
  if(seen&&d<125){
   const a=Math.atan2(m.y-P.y,m.x-P.x);m.dir=a;
   move(m,Math.cos(a)*spec.speed*.50*dt,Math.sin(a)*spec.speed*.50*dt);
  }else if(!seen&&m.alert>0){
   // A warned packmate actually investigates the last sighting, rather
   // than standing motionless with an alert icon.
   const tx=Number.isFinite(m.lastX)?m.lastX:m.x,ty=Number.isFinite(m.lastY)?m.lastY:m.y;
   if(Math.hypot(tx-m.x,ty-m.y)>85){
    m.dir=steerPursuit(m,tx,ty);
    const nx=m.x+Math.cos(m.dir)*spec.speed*.58*dt,ny=m.y+Math.sin(m.dir)*spec.speed*.58*dt;
    if(mountainHabitat(nx,ny))move(m,nx-m.x,ny-m.y);
   }
  }else if(!seen&&m.alert<=0){
   m.wildAttack=Math.max(0,(m.wildAttack||0)-dt);
   m.feedAfterKill=Math.max(0,(m.feedAfterKill||0)-dt);
   const action=forageWildBerries(m,spec,dt,false,d)||huntWildPrey(m,spec,false,d)||
    scavengeWildFood(m,spec,dt,false,d)||drinkWildWater(m,spec,dt,false,d);
   if(action)move(m,action.vx*dt,action.vy*dt);
   else{
    const leader=m.packId&&m.packOrder>0?mobs.find(q=>q.hp>0&&q.packId===m.packId&&q.packOrder===0):null;
    if(leader&&dist(m,leader)>95)m.dir=Math.atan2(leader.y-m.y,leader.x-m.x);
    else if((m.wander||0)<=0){m.dir+=rnd(-1.2,1.2);m.wander=rnd(.8,2);}
    const pace=leader&&dist(m,leader)>95?.64:.23;
    const x=m.x+Math.cos(m.dir)*spec.speed*pace*dt,y=m.y+Math.sin(m.dir)*spec.speed*pace*dt;
    if(mountainHabitat(x,y))move(m,x-m.x,y-m.y);else m.dir+=Math.PI*.8;
   }
  }
 }
 m.step=(m.step||0)+dt*(m.treeHeight>0?1.2:2.6);
 m.alert=Math.max(0,(m.alert||0)-dt*.45);
}
function updateFlyingEagle(m,dt){
 if(!P||m.hp<=0)return;
 const s=species.giantEagle;
 m.airHeight=clamp(Number(m.airHeight)||125,10,175);
 m.airOrbit=(Number(m.airOrbit)||0)+dt*.72;
 m.airTimer=Math.max(0,(Number(m.airTimer)||0)-dt);
 // Main wildlife loop already reduces attack cooldown once per frame.
 m.step=(m.step||0)+dt*3.6;
 const phase=m.airPhase||"circle";
 if(phase==="circle"){
  const playerNear=dist(P,m)<510&&!insideShelter(P)&&!lineBlocked(m,P);
  if(playerNear){const pull=Math.min(1,dt*.25);m.airAnchorX+=(P.x-m.airAnchorX)*pull;m.airAnchorY+=(P.y-m.airAnchorY)*pull;}
  const tx=clamp(m.airAnchorX+Math.cos(m.airOrbit)*160,70,WORLD.w-70);
  const ty=clamp(m.airAnchorY+Math.sin(m.airOrbit)*160,70,WORLD.h-70);
  const oldX=m.x,oldY=m.y,dir=Math.atan2(ty-m.y,tx-m.x);
  const speed=Math.min(s.speed*dt,Math.hypot(tx-m.x,ty-m.y));
  m.x+=Math.cos(dir)*speed;m.y+=Math.sin(dir)*speed;
  m.vx=(m.x-oldX)/Math.max(dt,.001);m.vy=(m.y-oldY)/Math.max(dt,.001);m.dir=dir;
  m.airHeight=clamp(m.airHeight+(125-m.airHeight)*Math.min(1,dt*2.8),15,175);
  if(m.airTimer<=0&&m.attack<=0){
   let target=playerNear?P:null;
   if(!target){let best=365;for(const q of mobs){
    if(q===m||q.hp<=0||!species[q.type]?.prey||insideShelter(q))continue;
    const d=dist(m,q);if(d<best&&!lineBlocked(m,q)){best=d;target=q;}
   }}
   if(target){
    m.airTarget=target===P?"player":"prey";m.airTargetX=target.x;m.airTargetY=target.y;
    m.airPhase="warn";m.airTimer=.84;m.airHit=false;m.attack=3.5;
    m.strikeDir=Math.atan2(target.y-m.y,target.x-m.x);
    if(dist(P,m)<560)label(m.x,m.y-m.r-45,"大鷲が急降下！","#ffcc91");
   }
  }
 }else if(phase==="warn"){
  m.airHeight=125;m.dir=m.strikeDir;m.vx=0;m.vy=0;
  if(m.airTarget==="player"&&P.hp>0){m.airTargetX=P.x;m.airTargetY=P.y;}
  if(m.airTimer<=0){m.airPhase="dive";m.airTimer=1.15;}
 }else if(phase==="dive"){
  const oldX=m.x,oldY=m.y;
  const angle=Math.atan2(m.airTargetY-m.y,m.airTargetX-m.x);
  const step=Math.min(s.speed*2.7*dt,Math.hypot(m.airTargetX-m.x,m.airTargetY-m.y));
  m.x=clamp(m.x+Math.cos(angle)*step,60,WORLD.w-60);
  m.y=clamp(m.y+Math.sin(angle)*step,60,WORLD.h-60);
  m.vx=(m.x-oldX)/Math.max(dt,.001);m.vy=(m.y-oldY)/Math.max(dt,.001);m.dir=angle;
  m.airHeight=Math.max(11,m.airHeight-190*dt);
  if(m.airHeight<=29&&!m.airHit){
   if(m.airTarget==="player"&&P.inv<=0&&P.hp>0&&(P.jumpHeight||0)<24&&
      !insideShelter(P)&&!lineBlocked(m,P)&&dist(P,m)<P.r+m.r+28){
    const damage=strongDamageTaken(Math.round(s.damage*1.08*bossStrikePower(m)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
    P.hp-=damage;P.lastCombatAt=elapsed;P.inv=.46;interruptRush();shake=8;flash=.22;
    label(P.x,P.y-37,"大鷲の爪 -"+damage,"#ffada0");blood(P.x,P.y,"#eaa17b",9,80);
    applyStrongStrikeEffect(m,angle,false);playEffect("damage");m.airHit=true;
   }else if(m.airTarget==="prey"){
    const q=mobs.find(q=>q!==m&&q.hp>0&&species[q.type]?.prey&&dist(q,m)<q.r+m.r+22&&!insideShelter(q)&&!lineBlocked(m,q));
    if(q){
     q.hp=Math.max(0,q.hp-Math.round(s.damage*.75));q.flash=.2;m.airHit=true;
     if(q.hp<=0){carcasses.push(animalRemains(q));m.feedAfterKill=8;
      const zone=regionAt(q.x,q.y);ecology[zone].prey=Math.max(4,ecology[zone].prey-1);
     }else startlePrey(q,m,"hit");
     if(dist(P,m)<480)label(q.x,q.y-30,"大鷲の狩り","#ffd7a2");
    }
   }
  }
  if(m.airHeight<=11||m.airTimer<=0||m.airHit){m.airPhase="climb";m.airTimer=.95;m.airTarget=null;}
 }else{
  m.airHeight=Math.min(125,m.airHeight+165*dt);
  m.x=clamp(m.x+Math.cos(m.dir)*s.speed*.4*dt,60,WORLD.w-60);
  m.y=clamp(m.y+Math.sin(m.dir)*s.speed*.4*dt,60,WORLD.h-60);
  if(m.airTimer<=0&&m.airHeight>=120){m.airPhase="circle";m.airTimer=1.1;m.airAnchorX=m.x;m.airAnchorY=m.y;}
 }
}

/* STRONG-STAGE-20P-V1: one draw per district, a single active boss, save-compatible. */
function strongBossAlive(){return activeStrongBosses()[0]||null;}
function strongStageCandidate(region){
 const options=(mountainHabitat(P?.x||0,P?.y||0)?FOOTHILL_STRONG:(STRONG_REGIONS[region]||["alpha"])).filter(t=>!AQUATIC_STRONG_TYPES.has(t)||aquaticStagePoints(region).length>0);
 const hour=(6+Math.floor((elapsed%85)/85*24))%24,night=hour>=19||hour<6;
 const weights=options.map(t=>t==="blackPanther"?(night?3.2:.7):t==="oneEyedWolf"?(night?2.2:1.1):t==="whiteTiger"?(night?.65:1.7):t==="giantHyena"?(weather==="RAIN"||weather==="THUNDER"?.55:1.5):t==="giantLion"?(night?1.8:1.1):t==="giantMoose"?(weather==="THUNDER"?.55:1.4):t==="giantBuffalo"?(weather==="RAIN"?1.5:1.2):t==="giantGorilla"?(weather==="THUNDER"?.55:1.0):t==="giantElephant"?(weather==="RAIN"?1.35:.95):t==="giantEagle"?(weather==="THUNDER"?.25:weather==="RAIN"?.55:night?.65:1.5):t==="albinoWolf"?(night?.48:.18):t==="giantCrocodile"?(night?2.0:1.1):t==="giantHippo"?(weather==="RAIN"?1.8:1.1):t==="giantAnaconda"?(night?1.6:1.0):t==="giantSnake"?(weather==="RAIN"||weather==="THUNDER"?1.7:1.2):t==="oldBear"?(night?.7:1.5):t==="giantBoar"?(weather==="THUNDER"?.65:1.3):1.2);
 let roll=Math.random()*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<options.length;i++){roll-=weights[i];if(roll<=0)return options[i];}
 return options[options.length-1];
}
function spawnStrongBoss(type,region){
 if(!P||!species[type]||activeStrongBosses().length>=strongBossLimit()||mobs.length>=WILDLIFE.cap)return false;
 const sp=species[type],aquatic=AQUATIC_STRONG_TYPES.has(type),waterSpots=aquatic?aquaticStagePoints(region):null;
 if(aquatic&&!waterSpots.length)return false;
 for(let i=0;i<100;i++){
  const angle=rnd(0,TWO),radius=rnd(370,Math.min(930,WILDLIFE.farAI-90));
  const spot=aquatic?waterSpots[Math.floor(Math.random()*waterSpots.length)]:null;
  const x=spot?spot.x:clamp(P.x+Math.cos(angle)*radius,60,WORLD.w-60);
  const y=spot?spot.y:clamp(P.y+Math.sin(angle)*radius,60,WORLD.h-60);
  if(regionAt(x,y)!==region||mountainHabitat(x,y)!==mountainHabitat(P.x,P.y)||collides(x,y,sp.r+6,null,aquatic)||nearDenLocation(x,y,420)||mobs.some(q=>q.hp>0&&Math.hypot(q.x-x,q.y-y)<(q.strongBoss?360:135)))continue;
  // Boss health stays near 7-12 ordinary hits at high LV, not a day-based infinity.
  const hp=bossHealthTarget(sp);
  mobs.push({x,y,type,r:sp.r,color:sp.color,belly:sp.belly,hp,maxHp:hp,attack:0,vx:0,vy:0,dir:angle+Math.PI,wander:0,
   alert:0,search:0,lastX:x,lastY:y,step:rnd(0,8),flee:0,flash:0,windup:0,windupTotal:0,swing:0,
   strikeDir:0,stun:0,evadeTime:0,evadeCooldown:0,escapeTimer:0,fleeEnergy:1,
   chargeTime:0,chargeDir:0,chargeHit:false,staggerGuard:0,feintCooldown:2,
   thirstNeed:.4,drinkCooldown:3,flankSide:Math.random()<.5?-1:1,
   strongBoss:true,strongRegion:region,strongBirthDay:day,bossBalanceVersion:BOSS_BALANCE_VERSION,signature:null,signatureUse:0,signatureCooldown:0,bossPresenceShown:false,poise:0,poiseLastAt:0,guardBreakUntil:0,
   ...(type==="giantEagle"?{airHeight:125,airPhase:"circle",airTimer:1.7,airOrbit:angle,airAnchorX:x,airAnchorY:y,airTarget:null,airHit:false}: {})});
  notify("この地区に"+STRONG_NAMES[type]+"の気配がある");
  return true;
 }
 return false;
}
function enterStrongStage(){
 if(!P)return;
 const region=regionAt(P.x,P.y),habitat=strongHabitatKey(P.x,P.y);strongRegionCurrent=habitat;
 // Keep 2-3 rare encounters in the travelled district rather than filling the
 // global cap with long-abandoned bosses. Retire only unseen, very distant ones.
 if(P.level>=6)for(let i=mobs.length-1;i>=0;i--){
  const m=mobs[i];
  if(m.strongBoss&&m.hp>0&&strongHabitatKey(m.x,m.y)!==habitat&&dist(P,m)>WILDLIFE.farAI)
   mobs.splice(i,1);
 }
 if(!Object.prototype.hasOwnProperty.call(strongRolls,habitat))
  strongRolls[habitat]=Math.random()<.20?{type:strongStageCandidate(region),spawned:false}:{type:null,spawned:true};
 const roll=strongRolls[habitat];
 if(P.level>=6){
  let changed=false,attempts=0;
  while(activeStrongBosses().length<strongBossLimit()&&attempts++<9){
   let type=strongStageCandidate(region);
   const present=new Set(activeStrongBosses().map(m=>m.type));
   if(present.has(type)){
    const alternatives=(mountainHabitat(P.x,P.y)?FOOTHILL_STRONG:(STRONG_REGIONS[region]||[])).filter(t=>!present.has(t)&&(!AQUATIC_STRONG_TYPES.has(t)||aquaticStagePoints(region).length));
    if(alternatives.length)type=alternatives[Math.floor(Math.random()*alternatives.length)];
   }
   if(spawnStrongBoss(type,region))changed=true;
  }
  if(changed)saveAuto();
  return;
 }
 if(roll&&roll.type&&!roll.spawned&&!strongBossAlive()&&spawnStrongBoss(roll.type,region)){
  roll.spawned=true;saveAuto();
 }
}
function normalizeStrongBossSave(){
 let first=null,kept=0;
 for(const m of mobs){
  if(!species[m.type]){m.type="dog";m.r=species.dog.r;}
  if(m.strongBoss||Object.prototype.hasOwnProperty.call(STRONG_NAMES,m.type)){
   if(kept<strongBossLimit()){if(!first)first=m;kept++;m.strongBoss=true;m.color=species[m.type].color;m.belly=species[m.type].belly;m.strongRegion=Number.isInteger(m.strongRegion)?m.strongRegion:regionAt(m.x,m.y);}
   else{m.type="dog";m.strongBoss=false;m.r=species.dog.r;m.maxHp=Math.min(m.maxHp||species.dog.hp,species.dog.hp*2);m.hp=Math.min(m.hp||species.dog.hp,m.maxHp);}
  }
 }
 if(first)strongRolls[strongHabitatKey(first.x,first.y)]={type:first.type,spawned:true};
 // A legacy SAVE_SCHEMA2 monster may have had only 10-14 basic-hit HP.
 // Upgrade it once while retaining the same injury percentage and checkpoints.
 if(P)for(const m of activeStrongBosses()){
  const safe=bossHealthTarget(species[m.type]);
  const ratio=clamp(m.hp/Math.max(1,Number(m.maxHp)||species[m.type].hp),0,1);
  if(m.bossBalanceVersion!==BOSS_BALANCE_VERSION||m.maxHp>safe*1.04){
   m.maxHp=safe;m.hp=Math.max(1,Math.round(safe*ratio));
   m.bossBalanceVersion=BOSS_BALANCE_VERSION;
  }
  m.poise=clamp(Number(m.poise)||0,0,m.maxHp*.25);
  m.poiseLastAt=Number.isFinite(m.poiseLastAt)?Math.min(elapsed,m.poiseLastAt):elapsed;
  m.guardBreakUntil=clamp(Number(m.guardBreakUntil)||0,0,elapsed+5.3);
 }
}

// Under-populated districts need native residents, not an infinite global enemy wave.
const REGIONAL_WILDLIFE={
 0:["pigeon","rat"],1:["pigeon","strayCat"],2:["deer","zebra"],3:["zebra","giraffe","cheetah","lion","elephant"],
 4:["hippo","frog"],5:["deer","zebra","giraffe"],6:["raccoonDog","crow"],7:["hippo","frog"]
};
function spawnRegionalResident(region,kind=null){
 if(!P||mobs.length>=WILDLIFE.cap||!BIOME_AREAS[region])return false;
 const [zx,zy,zw,zh]=BIOME_AREAS[region];
 const choices=REGIONAL_WILDLIFE[region]||["rabbit","pigeon"];
 // Forced residents must obey the same era and habitat locks as random fauna.
 // Otherwise a new world can acquire giraffes, lions or hippos in year zero.
 const eligible=choices.filter(type=>(window.WildFauna?.weight?.(type,region,day,weather)||0)>0);
 const speciesName=kind||eligible[Math.floor(Math.random()*eligible.length)];
 if(!speciesName||(window.WildFauna?.weight?.(speciesName,region,day,weather)||0)<=0)return false;
 for(let attempt=0;attempt<100;attempt++){
  const x=zx+Math.max(70,zw*.07)+Math.random()*Math.max(1,zw-Math.max(140,zw*.14));
  const y=zy+Math.max(70,zh*.07)+Math.random()*Math.max(1,zh-Math.max(140,zh*.14));
  if(regionAt(x,y)!==region||waterBlocksLand(x,y)||nearDenLocation(x,y,275))continue;
  // Deliberately place one resident in an unoccupied safe cell; do not
  // telegraph the entire region by popping five animals into view.
  if(spawnMob(false,false,false,{x,y},speciesName))return true;
 }
 return false;
}
// Retain at least one animal per city district and continuous mountain zone
// when recycling calm wildlife. Neither world nor local caps are increased.
function wildlifeHabitatKey(m){
 return mountainHabitat(m.x,m.y)?"mountain:"+MOUNTAIN.zone(m.x):
  "district:"+regionAt(m.x,m.y);
}
function wildlifeHabitatCounts(){
 const counts=new Map();
 for(const m of mobs)if(m.hp>0&&!m.strongBoss){
  const key=wildlifeHabitatKey(m);
  counts.set(key,(counts.get(key)||0)+1);
 }
 return counts;
}
function retireFarCalmAnimal(){
 if(!P)return false;
 const counts=wildlifeHabitatCounts();
 let index=-1,farthest=-1;
 for(let i=0;i<mobs.length;i++){
  const m=mobs[i],distance=dist(P,m);
  if(m.hp<=0||m.companion||m.strongBoss||Object.prototype.hasOwnProperty.call(STRONG_NAMES,m.type)||
     distance<=Math.max(800,WILDLIFE.localRadius)||visible(m.x,m.y,75)||
     (m.alert||0)>0||(m.windup||0)>0||(m.chargeTime||0)>0||
     (m.flee||0)>0||(m.wildAttack||0)>0||(m.feedAfterKill||0)>0||
     (counts.get(wildlifeHabitatKey(m))||0)<=1)continue;
  if(distance>farthest){farthest=distance;index=i;}
 }
 if(index<0)return false;
 mobs.splice(index,1);
 return true;
}
// Rebalance cave prey/hunters without increasing the shared wildlife cap.
// Never despawn visible, alerted, fleeing or strong wildlife.
function retireCalmCaveOverflow(needPrey,caveAnimals){
 if(!P||!MOUNTAIN||MOUNTAIN.zone(P.x)!=="cave")return false;
 const preyCount=caveAnimals.filter(m=>species[m.type]?.prey&&!isWildPredator(m)).length;
 const hunterCount=caveAnimals.filter(isWildPredator).length;
 const habitatCounts=wildlifeHabitatCounts();
 const candidates=mobs.filter(m=>{
  if(m.hp<=0||m.companion||m.strongBoss||Object.prototype.hasOwnProperty.call(STRONG_NAMES,m.type)||
     (m.alert||0)>0||(m.windup||0)>0||(m.chargeTime||0)>0||
     (m.flee||0)>0||(m.wildAttack||0)>0||(m.feedAfterKill||0)>0||
     dist(P,m)>=WILDLIFE.localRadius||visible(m.x,m.y,75)||
     (habitatCounts.get(wildlifeHabitatKey(m))||0)<=1)return false;
  if(MOUNTAIN.zone(m.x)!=="cave")return true;
  if(caveAnimals.length<4)return false;
  return needPrey?(isWildPredator(m)&&hunterCount>1):
    (species[m.type]?.prey&&!isWildPredator(m)&&preyCount>1);
 });
 candidates.sort((a,b)=>(MOUNTAIN.zone(a.x)==="cave")-(MOUNTAIN.zone(b.x)==="cave")||
   dist(P,b)-dist(P,a));
 if(!candidates.length)return false;
 mobs.splice(mobs.indexOf(candidates[0]),1);
 return true;
}
let lastPopulatedRegion=-1;
function settleNewRegion(){
 if(!P)return false;
 const region=regionAt(P.x,P.y),zone=mountainHabitat(P.x,P.y)?MOUNTAIN.zone(P.x):null;
 const habitat=region+(zone?":"+zone:"");
 if(habitat===lastPopulatedRegion)return false;
 lastPopulatedRegion=habitat;
 const nearby=mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius).length;
 const zoneNearby=zone?mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius&&
  mountainHabitat(m.x,m.y)&&MOUNTAIN.zone(m.x)===zone).length:0;
 // A cave cannot be declared inhabited merely because a distant summit
 // animal happens to be within the shared 700m local-count circle.
 if(nearby>=2&&!(zone&&zoneNearby===0&&nearby<WILDLIFE.localCap))return false;
 if(mobs.length>=WILDLIFE.cap&&!retireFarCalmAnimal())return false;
 return spawnMob(false,zone==="cave",true,null,null,zone);
}
// Early-game sanctuary is anchored to the current squad's starting point, not the camera.
// Predators already present are left untouched; only newly spawned animals are filtered.
function earlySquadSanctuary(){
 if(!P||Number(P.level||1)>3)return null;
 // Sanctuary belongs to the sole directly controlled animal, never a removed
 // three-member squad. Use the actual saved start point when available.
 const start=window.WildSquad?.load?.()?.startPosition;
 return {x:Number.isFinite(P.spawnX)?P.spawnX:Number.isFinite(start?.x)?start.x:P.x,
         y:Number.isFinite(P.spawnY)?P.spawnY:Number.isFinite(start?.y)?start.y:P.y,
         radius:Math.max(300,560-(Math.max(1,Number(P.level)||1)-1)*110)};
}
function earlySquadSpawnType(type,x,y){
 const safe=earlySquadSanctuary();
 if(!safe||Math.hypot(x-safe.x,y-safe.y)>safe.radius)return type;
 if(["rat","rabbit","pigeon","frog","crow","hedgehog"].includes(type))return type;
 return (type==="deer"||type==="boar"||type==="armadillo")?"rabbit":"rat";
}
// Real-time ecological pressure: apex predators need food and hunting space.
// A candidate is rejected rather than silently replaced with an unrelated animal.
const ECO_APEX_TYPES=new Set(["lion","tiger","cheetah","elephant","hippo","gorilla","blackBear","hyena","wildDog","giantBoar","giantBuffalo","rhino"]);
const ECO_HUNTER_TYPES=new Set(["dog","wildFox","strayCat","snake","venomSnake","macaque","chimpanzee","wolf","hyena","wildDog","lion","tiger","cheetah","blackBear","gorilla"]);
function ecologicalSpawnAllowed(type,x,y,initial=false){
 if(!P||initial)return true;
 const radius=470,local=mobs.filter(m=>m.hp>0&&Math.hypot(m.x-x,m.y-y)<radius);
 const predators=local.filter(m=>ECO_HUNTER_TYPES.has(m.type));
 const prey=local.filter(m=>species[m.type]?.prey);
 const apex=local.filter(m=>ECO_APEX_TYPES.has(m.type));
 const lvl=Math.max(1,Number(P.level)||1),year=Math.max(0,elapsed/120);
 // The starter corridor must remain playable even after loading an old save.
 const safe=earlySquadSanctuary();
 const insideSafe=!!safe&&Math.hypot(x-safe.x,y-safe.y)<safe.radius;
 if(insideSafe&&lvl<=3&&(ECO_HUNTER_TYPES.has(type)||ECO_APEX_TYPES.has(type)))return false;
 if(ECO_APEX_TYPES.has(type)){
  if(apex.length>=1||predators.length>=3)return false;
  if(lvl<=2&&Math.hypot(x-P.x,y-P.y)<850)return false;
  if(year<7&&lvl<=3)return false;
  if(prey.length<2&&local.length>=3)return false;
 }
 if(ECO_HUNTER_TYPES.has(type)){
  const limit=lvl<=2?1:year<17?2:3;
  if(predators.length>=limit)return false;
  if(prey.length===0&&local.length>=3)return false;
 }
 // Crowding is rejected before it can create an unnatural dense pack.
 if(local.length>=8)return false;
 return true;
}
function spawnMob(initial=false,preyOnly=false,nearbyOnly=false,forcedSpot=null,forcedType=null,requestedMountainZone=null){
 if(!releasedSpawnBusy&&!restoringSavedWorld&&mode==="play"&&P)restoreReleasedWildlife();
 if(mobs.length>=WILDLIFE.cap)return false; // Never evict living wildlife to spawn another.
 let tries=0,x=0,y=0,valid=false;
 const localCount=P?mobs.filter(m=>m.hp>0&&dist(m,P)<WILDLIFE.localRadius).length:0;
 do{
  if(forcedSpot){x=forcedSpot.x;y=forcedSpot.y}
  else{
   const ridge=nearbyOnly&&P&&mountainHabitat(P.x,P.y)?
    MOUNTAIN.spawnCandidate(P,tries,preyOnly,requestedMountainZone):null;
   if(ridge){x=ridge.x;y=ridge.y;}
   else{
    // City districts keep the existing circular distribution.
    const a=rnd(0,TWO),rad=preyOnly?rnd(160,270):nearbyOnly?rnd(365,Math.min(615,WILDLIFE.localRadius-65)):
     initial?rnd(260,1250):rnd(395,Math.min(665,WILDLIFE.localRadius-20));
    x=clamp((P?P.x:1800)+Math.cos(a)*rad,40,WORLD.w-40);
    y=clamp((P?P.y:1170)+Math.sin(a)*rad,40,WORLD.h-40);
   }
  }
  const candidate={x,y},near=P&&dist(candidate,P)<WILDLIFE.localRadius;
  const caveBirth=requestedMountainZone==="cave"&&P&&MOUNTAIN.zone(P.x)==="cave";
  // Births in a fresh burn scar are suppressed; mature animals migrate out instead.
  const burnQuality=window.WildDisaster?.habitatQuality?.(x,y,elapsed/120)??1;
  const eraQuality=window.WildEraEcology?.state?.(regionAt(x,y),elapsed/120)?.animals??1;
  valid=burnQuality>.35&&(forcedSpot||initial||Math.random()<Math.min(1,eraQuality))&&!collides(x,y,40)&&(!requestedMountainZone||mountainHabitat(x,y)&&MOUNTAIN.zone(x)===requestedMountainZone)&&(!forcedType||forcedType!=="macaque"&&forcedType!=="chimpanzee"||mountainHabitat(x,y)&&(forcedType!=="chimpanzee"||x>MOUNTAIN.FOOTHILL_END))&&(!P||dist(candidate,P)>(caveBirth?(preyOnly?128:105):(preyOnly?145:230)))
   &&!mobs.some(m=>dist(candidate,m)<WILDLIFE.separation)
   &&(!near||localCount<WILDLIFE.localCap)
   &&(!nearbyOnly||!P||regionAt(x,y)===regionAt(P.x,P.y))
   // Prefer off-camera births; desktop-wide views may need a safe distant
   // in-view placement after exhaustive attempts rather than an empty district.
   &&(!nearbyOnly||tries>=30||!visible(x,y,75));
 }while(!valid&&!forcedSpot&&++tries<52);
 if(!valid)return false;
 const biome=regionAt(x,y);
 let type=forcedType&&(releasedSpawnBusy&&species[forcedType]||window.WildFauna?.types.includes(forcedType))?forcedType:mountainHabitat(x,y)?MOUNTAIN.choose(Math.random(),x,y,preyOnly,weather):window.WildFauna?.choose(biome,day,weather,preyOnly);
 if(!species[type])type="rat";
 // Forced/debug/regional births cannot bypass the fauna year and biome rules.
 // The wild pool's own weight is the single source of truth for 30-species unlocks.
 if(!releasedSpawnBusy&&(window.WildFauna?.weight?.(type,biome,day,weather)??1)<=0)return false;
 // Newly generated enemies cannot overwhelm a level-one party in its first minutes.
 if(!forcedType||initial||nearbyOnly)type=earlySquadSpawnType(type,x,y);
 // A denied predator is not turned into free prey or spawned elsewhere:
 // future natural draws will select wildlife matching the local food chain.
 if(!releasedSpawnBusy&&!ecologicalSpawnAllowed(type,x,y,initial))return false;
 // Amphibious and waterside wildlife must appear at actual suitable
 // terrain coordinates, not just anywhere inside a nominal wetland district.
 if(type==="otter"&&(waterDepth(x,y)<=.025||waterDepth(x,y)>.60))return false;
 if(type==="shoebill"&&(waterDepth(x,y)<0||waterDepth(x,y)>.24))return false;
 if(type==="hippo"&&(waterDepth(x,y)<=.035||waterDepth(x,y)>.95))return false;
 // Protect wetland food chains from monocultures. This cap is global and
 // does not count dead animals; all other wildlife remains unaffected.
 if(["otter","shoebill","hippo"].includes(type)){
  const max=type==="otter"?4:type==="shoebill"?3:2;
  if(mobs.filter(m=>m.hp>0&&m.type===type).length>=max)return false;
  // Prevent water-edge animals from stacking at a single shoreline.
  if(mobs.some(m=>m.hp>0&&m.type===type&&Math.hypot(m.x-x,m.y-y)<210))return false;
 }
 // Prevent rare deer from dominating the world, even in a long-lived save.
 if(!releasedSpawnBusy&&type==="deer"&&mobs.filter(m=>m.hp>0&&m.type==="deer").length>=2)type="rabbit";
 // Safe nesting pockets can attract small prey, but never spawn a hostile pack.
 if(!releasedSpawnBusy&&nearDenLocation(x,y,265)&&(!species[type].prey||WILD_PREDATOR_TYPES.has(type)))type=biome===4||biome===7?"pigeon":"rabbit";
 const s=species[type],scale=s.prey?1+Math.min(18,Math.max(0,day-1))*.055:enemyHealthFactor();
 mobs.push({x,y,type,r:s.r,color:s.color,belly:s.belly,hp:s.hp*scale,maxHp:s.hp*scale,attack:0,vx:0,vy:0,dir:rnd(-3,3),wander:rnd(.5,3),alert:0,search:0,lastX:x,lastY:y,step:rnd(0,8),flee:0,flash:0,windup:0,windupTotal:0,swing:0,strikeDir:0,stun:0,evadeTime:0,evadeDuration:0,evadeRemaining:0,evadeSpeed:0,evadeHeight:0,evadeAngle:0,evadeCooldown:0,escapeTimer:0,fleeEnergy:1,evasionSide:Math.random()<.5?-1:1,chargeTime:0,chargeDir:0,chargeHit:false,staggerGuard:0,feintTime:0,feintRemaining:0,feintSpeed:0,feintAngle:0,feintCooldown:rnd(.8,2),thirstNeed:rnd(.25,.68),drinkCooldown:rnd(0,2),drinkPose:0,flankSide:(mobs.filter(q=>q.type==='dog').length%2?1:-1),
  damageScale:s.prey?1:enemyDamageFactor(),speedScale:s.prey?1:1+Math.min(10,enemyChallengeTier())*.018});
 return true;
}
// Released owned animals rejoin the ecosystem under their original names.
// Retry pending entries on subsequent wildlife spawns if terrain is unsuitable.
let releasedSpawnBusy=false,restoringSavedWorld=false;
function restoreReleasedWildlife(){
 if(releasedSpawnBusy||restoringSavedWorld||mode!=="play"||!P||!Array.isArray(mobs))return;
 let pending=[];
 try{pending=JSON.parse(localStorage.getItem("wild-reclaim-released-v1")||"[]")}catch(_){return}
 const archive=JSON.parse(localStorage.getItem("wild-reclaim-released-archive-v1")||"[]");
 if(Array.isArray(archive)){
  const seen=new Set(pending.map(a=>String(a?.id)));
  for(const a of archive)if(a?.id&&!seen.has(String(a.id))){pending.push(a);seen.add(String(a.id));}
 }
 if(!Array.isArray(pending)||!pending.length)return;
 releasedSpawnBusy=true;
 try{
  const remaining=[];
  for(const animal of pending){
   if(!animal?.id||!species[animal.species])continue;
   if(mobs.some(m=>m.releasedIndividualId===animal.id))continue;
   let created=false;
   for(let attempt=0;attempt<5&&!created;attempt++){
    const angle=Math.random()*Math.PI*2, radius=360+Math.random()*250;
    const pos={x:clamp(P.x+Math.cos(angle)*radius,40,WORLD.w-40),y:clamp(P.y+Math.sin(angle)*radius,40,WORLD.h-40)};
    const before=mobs.length;
    if(spawnMob(false,false,false,pos,animal.species)&&mobs.length>before){
     const wild=mobs[mobs.length-1];
     if(wild.type===animal.species){wild.name=animal.name||animal.speciesName;wild.releasedIndividualId=animal.id;const seed=[...String(animal.id)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,17);wild.releasedMood=["aggressive","timid","peaceful","generous"][seed%4];wild.releasedPower=2.5+((seed>>>4)%16)/10;wild.hp=Math.round(wild.hp*wild.releasedPower);wild.maxHp=wild.hp;wild.damageScale=Math.max(wild.damageScale||1,wild.releasedPower);wild.releasedGiftCooldown=elapsed+12+(seed%15);wild.speedScale=Math.max(wild.speedScale||1,1.12);created=true;}
     else mobs.pop();
    }
   }
   if(!created)remaining.push(animal);
  }
  // Keep released identities in the world registry after first appearance.
  // A reload must not erase an animal merely because its initial spawn succeeded.
  const archived=JSON.parse(localStorage.getItem("wild-reclaim-released-archive-v1")||"[]");
  const known=new Map((Array.isArray(archived)?archived:[]).filter(a=>a&&a.id).map(a=>[String(a.id),a]));
  for(const animal of pending)if(animal?.id&&!remaining.some(a=>a.id===animal.id))known.set(String(animal.id),animal);
  localStorage.setItem("wild-reclaim-released-archive-v1",JSON.stringify([...known.values()]));
  localStorage.setItem("wild-reclaim-released-v1",JSON.stringify(remaining));
 }finally{releasedSpawnBusy=false;}
}
window.addEventListener("wild-animal-released",()=>{restoreReleasedWildlife()});
function spawnFood(){
 for(let n=0;n<24;n++){
  const local=P&&Math.random()<.82;
  const angle=rnd(0,TWO),radius=rnd(185,760);
  // Keep edible ground food on the actual cave floor rather than beyond walls.
  const ridge=P&&mountainHabitat(P.x,P.y)&&n<16?
   MOUNTAIN.spawnCandidate(P,n+2,true,MOUNTAIN.zone(P.x)):null;
  const x=ridge?ridge.x:local?clamp(P.x+Math.cos(angle)*radius,70,WORLD.w-70):rnd(70,WORLD.w-70);
  const y=ridge?ridge.y:local?clamp(P.y+Math.sin(angle)*radius,70,WORLD.h-70):rnd(70,WORLD.h-70);
  if(collides(x,y,34)||carcasses.some(c=>dist(c,{x,y})<65))continue;
  // Burned vegetation cannot produce berries until the local ecosystem regrows.
  if(Math.random()>(window.WildDisaster?.habitatQuality?.(x,y,elapsed/120)??1))continue;
  const eraFood=window.WildEraEcology?.state?.(regionAt(x,y),elapsed/120)?.food??1;
  if(Math.random()>Math.min(1,eraFood))continue;
  carcasses.push({x,y,r:9,amount:19,type:"berries",ttl:220,phase:rnd(0,6)});
  return true;
 }
 return false;
}
function shelterWalls(b){
 const t=15,door=b.x+b.w*.5,half=55;
 return [
  {x:b.x,y:b.y,w:door-half-b.x,h:t},
  {x:door+half,y:b.y,w:b.x+b.w-door-half,h:t},
  {x:b.x,y:b.y,w:t,h:b.h},
  {x:b.x+b.w-t,y:b.y,w:t,h:b.h},
  {x:b.x,y:b.y+b.h-t,w:b.w,h:t}
 ];
}
function shelterFurniture(b){
 return [{x:b.x+34,y:b.y+b.h*.57,w:52,h:31},
         {x:b.x+b.w-92,y:b.y+b.h*.58,w:54,h:30}];
}
function shelterInteriorPoint(b){return {x:b.x+b.w*.5,y:b.y+Math.min(b.h*.55,125)}}
function shelterEntrance(b){return {x:b.x+b.w*.5,y:b.y-48}}
function nearestShelterEntrance(){
 if(!P||insideShelter(P))return null;
 let nearest=null,minDistance=255;
 for(const b of buildings){
  if(!b.interior)continue;
  const approach=shelterEntrance(b),distance=dist(P,approach);
  if(distance<minDistance){
   minDistance=distance;nearest={building:b,approach,distance};
  }
 }
 return nearest;
}
function insideShelter(o){
 return !!o&&buildings.some(b=>b.interior&&o.x>b.x+16&&o.x<b.x+b.w-16&&o.y>b.y+16&&o.y<b.y+b.h-16);
}
function circleRect(x,y,r,b){
 const cx=clamp(x,b.x,b.x+b.w),cy=clamp(y,b.y,b.y+b.h);
 return (x-cx)**2+(y-cy)**2<(r*.8)**2;
}
function segmentRect(a,b,rect,pad=0){
 let lo=0,hi=1;
 const dx=b.x-a.x,dy=b.y-a.y;
 for(const [origin,velocity,min,max] of [[a.x,dx,rect.x-pad,rect.x+rect.w+pad],[a.y,dy,rect.y-pad,rect.y+rect.h+pad]]){
  if(Math.abs(velocity)<1e-9){if(origin<min||origin>max)return false;continue}
  const t1=(min-origin)/velocity,t2=(max-origin)/velocity;
  lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));
  if(lo>hi)return false;
 }
 return lo<=1&&hi>=0;
}
function shelterRevealed(b){
 return !!P&&Math.hypot(P.x-b.x-b.w*.5,P.y-b.y-b.h*.5)<Math.max(b.w,b.h)*.92;
}
function roofAt(x,y){
 for(const b of buildings)if(b.roofZ&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)return b.roofZ;
 return 0;
}
function landOnSurface(){
 const old=P.groundZ||0,next=roofAt(P.x,P.y);
 P.groundZ=next;
 if(next<old){P.fallFromZ=old;P.fallTime=.30;P.jumpHeight=old;}
 else{P.fallTime=0;P.jumpHeight=next;}
 return next>old;
}
function collides(x,y,r,actor=null,ignoreWater=false,mountainIgnore=null){
 if(x<r+12||y<r+12||x>WORLD.w-r-12||y>WORLD.h-r-12)return true;
 if(MOUNTAIN?.blocked(x,y,r,mountainIgnore))return true;
 if(window.WildDisaster?.blocked(x,y,r,elapsed/120))return true;
 if(!ignoreWater&&waterBlocksLand(x,y)&&!(actor===P&&actor.type==="shoebill"&&waterDepth(x,y)<=.24))return true;
 for(const prop of streetProps){
  if(prop.type!=="car"&&prop.type!=="vending"&&prop.type!=="barrier")continue;
  if(Math.hypot(x-prop.x,y-prop.y)<prop.r+8+r*.40)return true;
 }
 for(const b of buildings){
  if(b.interior){
   if(x<b.x-r||x>b.x+b.w+r||y<b.y-r||y>b.y+b.h+r)continue;
   if(shelterWalls(b).some(w=>circleRect(x,y,r,w))||shelterFurniture(b).some(w=>circleRect(x,y,r,w)))return true;
   continue;
  }
  if(x>b.x-r*.8&&x<b.x+b.w+r*.8&&y>b.y-r*.8&&y<b.y+b.h+r*.8){
   if(actor&&actor===P&&b.roofZ&&(actor.jumpHeight||0)>=b.roofZ-4&&(actor.jumpTime>0||actor.pounceTime>0||(actor.groundZ||0)===b.roofZ))continue;
   return true;
  }
 }
 if(actor&&actor===P&&(actor.jumpHeight||0)<18&&narrowBuildingPassage(x,y,r))return true;
 return false;
}

// Avoid admitting the player into gaps too tight to turn or walk back out.
// The ordinary open streets and genuine shelter doors remain unaffected.
function narrowBuildingPassage(x,y,r){
 const margin=r*2+16;
 const adjacent=buildings.filter(b=>!b.interior&&x>b.x-margin-12&&x<b.x+b.w+margin+12&&
  y>b.y-margin-12&&y<b.y+b.h+margin+12);
 for(let i=0;i<adjacent.length;i++)for(let j=i+1;j<adjacent.length;j++){
  const a=adjacent[i],b=adjacent[j];
  const left=a.x+a.w<=b.x?a:b.x+b.w<=a.x?b:null;
  const right=left===a?b:left===b?a:null;
  if(left&&right){
   const gap=right.x-(left.x+left.w);
   const lo=Math.max(a.y,b.y),hi=Math.min(a.y+a.h,b.y+b.h);
   if(hi>lo&&gap>=0&&gap<margin&&x>left.x+left.w-1&&x<right.x+1&&y>lo-r*.45&&y<hi+r*.45)return true;
  }
  const top=a.y+a.h<=b.y?a:b.y+b.h<=a.y?b:null;
  const bottom=top===a?b:top===b?a:null;
  if(top&&bottom){
   const gap=bottom.y-(top.y+top.h);
   const lo=Math.max(a.x,b.x),hi=Math.min(a.x+a.w,b.x+b.w);
   if(hi>lo&&gap>=0&&gap<margin&&y>top.y+top.h-1&&y<bottom.y+1&&x>lo-r*.45&&x<hi+r*.45)return true;
  }
 }
 return false;
}
// Recover old saves and rare impact positions already inside an unwalkable alley.
// Only used for a genuinely blocked location, never as a shortcut through an ordinary wall.
// New cave columns and alpine rocks must not trap animals in old SAVE_SCHEMA=2 runs.
// Relocate only living ground wildlife already inside new mountain collision geometry.
function repairRestoredMountainMobs(){
 if(!MOUNTAIN?.blocked)return 0;
 let repaired=0;
 for(const m of mobs){
  if(!m||m.hp<=0||!Number.isFinite(m.x)||!Number.isFinite(m.y)||
     isAquaticStrong(m)||m.type==="giantEagle")continue;
  const radius=Math.max(6,Number(m.r)||18);
  if(!mountainHabitat(m.x,m.y)||!MOUNTAIN.blocked(m.x,m.y,radius))continue;
  const ox=m.x,oy=m.y,zone=MOUNTAIN.zone(ox);
  let safe=null;
  for(let distance=16;distance<=240&&!safe;distance+=16){
   for(let k=0;k<24;k++){
    const angle=k*Math.PI/12;
    const x=clamp(ox+distance*Math.cos(angle),radius+13,WORLD.w-radius-13);
    const y=clamp(oy+distance*Math.sin(angle),radius+13,WORLD.h-radius-13);
    if(!mountainHabitat(x,y)||MOUNTAIN.zone(x)!==zone||collides(x,y,radius))continue;
    if(P&&Math.hypot(x-P.x,y-P.y)<radius+P.r+12)continue;
    if(mobs.some(other=>other!==m&&other.hp>0&&
       Math.hypot(x-other.x,y-other.y)<radius+(other.r||18)+8))continue;
    safe={x,y};break;
   }
  }
  if(!safe)continue; // Never move a saved creature into another wall or region.
  m.x=safe.x;m.y=safe.y;m.lastX=safe.x;m.lastY=safe.y;
  m.vx=0;m.vy=0;m.alert=0;m.search=0;m.windup=0;m.signature=null;
  repaired++;
 }
 return repaired;
}

function recoverPlayerFromGap(o){
 if(o!==P||!collides(o.x,o.y,o.r,o))return false;
 const originX=o.x,originY=o.y,roof=o.groundZ||0;
 for(let radius=14;radius<=450;radius+=14){
  let chosen=null,nearest=Infinity;
  for(let k=0;k<32;k++){
   const angle=k*Math.PI/16;
   const x=clamp(originX+radius*Math.cos(angle),o.r+13,WORLD.w-o.r-13);
   const y=clamp(originY+radius*Math.sin(angle),o.r+13,WORLD.h-o.r-13);
   if(roofAt(x,y)!==roof||collides(x,y,o.r,o))continue;
   const distance=Math.hypot(x-originX,y-originY);
   if(distance<nearest){chosen={x,y};nearest=distance;}
  }
  if(chosen){o.x=chosen.x;o.y=chosen.y;o.vx=0;o.vy=0;return true;}
 }
 return false;
}

function move(o,dx,dy){
 if(Math.max(Math.abs(dx),Math.abs(dy))>10){
  const parts=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/10);
  for(let i=0;i<parts;i++)move(o,dx/parts,dy/parts);
  return;
 }
 // A saved or knockback-displaced player in a gap must have a legal escape.
 if(o===P)recoverPlayerFromGap(o);
 // A complete diagonal step is checked first to avoid axis-order corner jamming.
 // If blocked, slide on the unobstructed axis instead of cutting through walls or water.
 const previous=waterDepth(o.x,o.y),actor=o===P?o:null;
 const allowed=(x,y,d)=>{
   const water=waterDepth(x,y);
   // Shoebills are wading birds: walk into shallows, not across deep channels.
   if(o===P&&o.type==="shoebill"&&water<=.24)return true;
   return water<=.0001||(d>.0001&&water<d-.00001);
  };
 const canStep=(x,y,d)=>allowed(x,y,d)&&!collides(x,y,o.r,actor,true);
 if(dx&&dy&&canStep(o.x+dx,o.y+dy,previous)){
  o.x+=dx;o.y+=dy;
 }else{
  if(canStep(o.x+dx,o.y,previous))o.x+=dx;
  const afterX=waterDepth(o.x,o.y);
  if(canStep(o.x,o.y+dy,afterX))o.y+=dy;
 }
 if(o===P&&o.jumpTime<=0&&o.pounceTime<=0){
  const roof=roofAt(o.x,o.y),previous=o.groundZ||0;
  if(roof!==previous){
   if(roof<previous){
    o.fallFromZ=Math.max(previous,o.jumpHeight||0);
    o.fallTime=.30;
   }else{o.fallTime=0;o.jumpHeight=roof;}
   o.groundZ=roof;
  }
 }
}
function lineBlocked(a,b){
 if(MOUNTAIN?.sightBlocked(a,b))return true;
 for(const box of buildings){
  if(box.interior){
   if(shelterWalls(box).some(w=>segmentRect(a,b,w))||shelterFurniture(box).some(w=>segmentRect(a,b,w)))return true;
   continue;
  }
  let lo=0,hi=1,dx=b.x-a.x,dy=b.y-a.y;
  for(const [p,q] of [[-dx,a.x-box.x],[dx,box.x+box.w-a.x],[-dy,a.y-box.y],[dy,box.y+box.h-a.y]]){
   if(Math.abs(p)<1e-9){if(q<0){lo=2;break}}
   else{const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t)}
  }
  if(lo<=hi&&lo<1&&hi>0)return true;
 }
 return false;
}
// Winter shrubs are intentionally invisible in both renderers: they cannot conceal animals.
function visibleShrubCover(){
 const month=tokyoCalendarDay(1+Math.floor(Math.max(0,elapsed)/85)).month;
 return month>=2&&month<=10; // March-November (zero-based month).
}
function visibleWinterCover(o){
 if(!o||visibleShrubCover())return false;
 const r=Number(o.r)||18;
 for(const p of streetProps){
  if(p.type!=="car"&&p.type!=="barrier"&&p.type!=="vending")continue;
  const d=Math.hypot(p.x-o.x,p.y-o.y);
  if(d>p.r+8+r*.40-2&&d<p.r+58)return true;
 }
 for(const b of buildings){
  if(o.x<b.x-r-40||o.x>b.x+b.w+r+40||o.y<b.y-r-40||o.y>b.y+b.h+r+40)continue;
  // Enterable buildings also provide real exterior wall cover; an open doorway does not.
  if(b.interior){
   for(const wall of shelterWalls(b)){
    const d=Math.hypot(o.x-clamp(o.x,wall.x,wall.x+wall.w),o.y-clamp(o.y,wall.y,wall.y+wall.h));
    if(d>r*.65&&d<r+36)return true;
   }
   continue;
  }
  const d=Math.hypot(o.x-clamp(o.x,b.x,b.x+b.w),o.y-clamp(o.y,b.y,b.y+b.h));
  if(d>r*.65&&d<r+36)return true;
 }
 return false;
}
function visibleShrub(p){
 // Every visibly dense triangular green plant is usable cover, including old saves.
 // Winter's invisible ordinary type-2 shrubs remain non-concealing.
 return !!p&&((p.type===2&&(visibleShrubCover()||!!p.denSite||p.trainingCover===true))||
  ((p.type===0||p.type===1)&&p.r>=18));
}
function inVisibleShrubCover(o){
 return !!o&&(o.groundZ||0)<18&&plants.some(p=>visibleShrub(p)&&Math.hypot(p.x-o.x,p.y-o.y)<p.r*.75);
}
function inCover(o){
 if((o?.groundZ||0)>18)return o===P&&!!denAtActor(o);
 return inVisibleShrubCover(o)||(!visibleShrubCover()&&visibleWinterCover(o));
}
function ensureTrainingCoverNear(actor=P){
 if(!actor)return null;
 const suitable=p=>p.type===2&&Math.hypot(p.x-actor.x,p.y-actor.y)<260&&
  !collides(p.x,p.y,Math.min(20,actor.r))&&!waterBlocksLand(p.x,p.y)&&routeClear(actor,p,actor.r);
 let patch=plants.find(p=>p.trainingCover&&suitable(p))||plants.find(suitable);
 if(patch){patch.trainingCover=true;return patch}
 const candidates=[[170,70],[-150,75],[115,-130],[-130,-105],[210,0],[0,190],[-200,0],[0,-210]];
 for(const radius of [115,165,225,270])for(let i=0;i<16;i++){
  const a=i*Math.PI/8;candidates.push([Math.round(Math.cos(a)*radius),Math.round(Math.sin(a)*radius)]);
 }
 for(const [dx,dy] of candidates){
  const x=actor.x+dx,y=actor.y+dy;
  if(x<40||y<40||x>WORLD.w-40||y>WORLD.h-40||collides(x,y,29)||
    waterBlocksLand(x,y)||!routeClear(actor,{x,y},actor.r))continue;
  patch={x,y,r:65,type:2,phase:1.3,hue:.23,trainingCover:true};
  plants.push(patch);return patch;
 }
 return null;
}
function sharesPlayerElevation(m){
 return !P||(P.groundZ||0)<18||m.type==="giantEagle"||(m.groundZ||0)>=P.groundZ-12;
}
function winterCoverSpotFor(actor,maxRange=1300,avoid=null,accept=null){
 if(!actor||visibleShrubCover())return null;
 let best=null,bestScore=Infinity;
 const consider=(x,y)=>{
  const spot={x,y,r:actor.r},d=dist(actor,spot);
  if(d>maxRange||collides(x,y,actor.r)||!visibleWinterCover(spot)||(avoid&&dist(avoid,spot)<140)||(accept&&!accept(spot))||!routeClear(actor,spot,actor.r))return;
  const score=d;
  if(score<bestScore){bestScore=score;best=spot;}
 };
 for(const p of streetProps){
  if(!["car","barrier","vending"].includes(p.type)||Math.abs(p.x-actor.x)>maxRange+85||Math.abs(p.y-actor.y)>maxRange+85)continue;
  const radius=p.r+actor.r*.4+21;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;consider(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius);}
 }
 for(const b of buildings){
  if(Math.abs(b.x+b.w*.5-actor.x)>maxRange+260||Math.abs(b.y+b.h*.5-actor.y)>maxRange+260)continue;
  const pad=actor.r+22;
  consider(b.x-pad,clamp(actor.y,b.y+10,b.y+b.h-10));
  consider(b.x+b.w+pad,clamp(actor.y,b.y+10,b.y+b.h-10));
  consider(clamp(actor.x,b.x+10,b.x+b.w-10),b.y-pad);
  consider(clamp(actor.x,b.x+10,b.x+b.w-10),b.y+b.h+pad);
  if(b.interior){
   // The front door is open: choose solid wall segments on either side.
   for(const side of [-1,1])consider(b.x+b.w*.5+side*(55+actor.r+12),b.y-pad);
  }
 }
 return best;
}
function winterCoverSpot(){return winterCoverSpotFor(P,1300);}
// WIND-STALK-HUNT-V1: use the saved world wind instead of a separate sine clock.
// The player leaves a scent trail in the downwind direction; rain weakens it.
function scentReachTo(observer,source=P){
 if(!observer||!source)return 0;
 const bearing=Math.atan2(observer.y-source.y,observer.x-source.x);
 const along=Math.cos(bearing-windDirection);
 const base=weather==="RAIN"||weather==="THUNDER"?38:weather==="WIND"?105:75;
 return Math.max(12,base*(along>.35?1.48:along<-.35?.18:.52));
}
function isDownwindStalk(target){
 if(!P||!target||dist(P,target)<25)return false;
 return Math.cos(Math.atan2(P.y-target.y,P.x-target.x)-windDirection)>.5;
}
function detectsPlayer(m,sp,d){
 if(!sharesPlayerElevation(m))return false;
 // Grazer AI: quiet, uninjured animals do not endlessly chase at normal predator sight range.
 if(["giraffe","elephant","hippo"].includes(m.type)){
  const warning=m.type==="hippo"?160:m.type==="elephant"?128:110;
  if(d>warning&&(m.alert||0)<=0&&m.hp>=m.maxHp*.97)return false;
 }
 // The visual clock is authoritative: the old cosine classified midnight as
 // daytime. Daylight, not a second independent clock, now governs visual range.
 const ambient=worldDaylight();
 const lightFactor=clamp(.49+ambient*.49,.55,1.06);
 const nocturnalBonus=sp.prey?0:(m.type==="alpha"?.17:m.type==="dog"?.13:.08);
 const vision=clamp(lightFactor+nocturnalBonus*(1-clamp(ambient,0,1)),.55,1.06);
 const sightRange=(sp.prey?185:m.strongBoss?430:265)*(weather==="FOG"?.62:weather==="RAIN"||weather==="THUNDER"?.78:weather==="CLOUDY"?.94:1)*vision*(P.hidden?.29:1)*(P.type==="manul"&&P.abilityTime>0?.72:1);
 const los=!lineBlocked(m,P);
 const facing=Math.atan2(P.y-m.y,P.x-m.x);
 const delta=Math.atan2(Math.sin(facing-m.dir),Math.cos(facing-m.dir));
 const inSight=Math.abs(delta)<(sp.prey?2.22:m.strongBoss?2.05:1.37)||d<(m.strongBoss?85:57);
 const visibleNow=los&&inSight&&d<Math.max(42,sightRange);
 const heard=d<(los?38:24)+P.noise*(los?(m.strongBoss?195:116):58);
  const smelled=d<scentReachTo(m);
 return visibleNow||heard||smelled||(los&&d<P.r+m.r+17);
}
// Direct-control steering: both facing and velocity follow the input without a turning arc.
// Scripted jump, pounce and dash trajectories are handled by separate update branches.
function applyDirectionalInput(actor,axis,targetSpeed,dt,foxTurbo=false){
 const inputLength=Math.hypot(axis.x,axis.y);
 const snow=actor===P&&!insideShelter(P)?currentSnowpack():0;
 if(inputLength>.08&&snow>.08){
  // The head faces input immediately; ice delays actual body velocity.
  actor.dir=Math.atan2(axis.y,axis.x);
  const response=Math.min(1,dt*(2.8+(1-snow)*8.2));
  actor.vx+=(axis.x*targetSpeed-actor.vx)*response;
  actor.vy+=(axis.y*targetSpeed-actor.vy)*response;
 }else if(inputLength>.08){
  actor.dir=Math.atan2(axis.y,axis.x);
  actor.vx=axis.x*targetSpeed;
  actor.vy=axis.y*targetSpeed;
 }else{
  // Original braking is retained on release.
  const speed=Math.hypot(actor.vx,actor.vy);
  const brake=(snow>.08?(55+(1-snow)*260):(actor.type==="wolf"?900:actor.type==="cat"?1720:foxTurbo?2750:1550))*dt;
  const ratio=speed>0?Math.max(0,speed-brake)/speed:0;
  actor.vx*=ratio;actor.vy*=ratio;
 }
}

function getAxes(){
 const keyboardX=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);
 const keyboardY=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0);
 // Active pad axes override other controls on that axis instead of cancelling
 // them; facing and velocity then follow the selected direction this frame.
 let x=Math.abs(gamepadAxes.x)>.08?gamepadAxes.x:keyboardX+joy.x;
 let y=Math.abs(gamepadAxes.y)>.08?gamepadAxes.y:keyboardY+joy.y;
 const strength=Math.min(1,Math.hypot(x,y));
  const wx=(VIEW.d*x-VIEW.c*y)/VIEW_DET,wy=(-VIEW.b*x+VIEW.a*y)/VIEW_DET,n=Math.hypot(wx,wy);
  return n>1e-5?{x:wx/n*strength,y:wy/n*strength}:{x:0,y:0};
}
function blood(x,y,color,count=9,speed=125){for(let i=0;i<count;i++){const a=rnd(0,TWO),v=rnd(speed*.2,speed);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(.25,.8),max:.8,size:rnd(1.6,4.4),color});}}
function label(x,y,t,color="#ffffff"){popups.push({x,y,t,color,life:1.1})}
function notify(t,duration=2.1){toastMessage=t;toastTime=duration;$("toast").textContent=t;$("toast").classList.add("show")}
function startAmbient(){window.WildAudio?.unlock();}
function playEffect(kind,options){if(soundEnabled)window.WildAudio?.play(kind,options||{});}
function instinct(){
 if(mode!=="play"||!P||P.instinctCD>0||P.sp<18)return;
 const level=P.level||1;P.sp-=18;
 P.instinctCD=(P.type==="wolf"?13:P.type==="fox"?9:P.type==="manul"?11:P.type==="tibetanFox"?9.5:P.type==="shoebill"?12:8.5)*(P.instinctBonus?.85:1);
 P.abilityTime=P.type==="cat"?3.4+Math.min(1.7,(level-1)*.18):P.type==="fox"?4.4+Math.min(1.8,(level-1)*.18):P.type==="manul"?5:P.type==="tibetanFox"?4.5:P.type==="shoebill"?5:4+Math.min(1.2,(level-1)*.1);
 if(P.type==="fox"){
  P.noiseBurst=Math.max(P.noiseBurst,.85);
  notify("狐・疾風！ 爆速で駆け抜けろ");
  blood(P.x,P.y,"#e7ddae",10,70);playEffect("attack");
 }else if(P.type==="cat"){
  P.dash=Math.min(P.dash,.15);
  notify("猫・壁際でジャンプを連打して三角飛び");
  playEffect("jump");
 }else if(P.type==="wolf"){
  P.noiseBurst=1.8;
  for(const m of mobs){
   if(m.hp<=0||dist(P,m)>Math.min(420,255+(level-1)*18)||lineBlocked(P,m))continue;
   if(m.type==="alpha"||m.type==="boar"){m.alert=Math.max(m.alert,1.8);continue}
   m.flee=2.7;m.dir=Math.atan2(m.y-P.y,m.x-P.x);m.alert=0;m.search=0;
   if(m.type==="dog")m.stun=Math.max(m.stun,.35);
  }
  blood(P.x,P.y,"#dce3db",19,145);
  notify("狼・咆哮！ 次の突進で敵を引き倒せ");
  playEffect("howl");
 }else if(P.type==="manul"){
  // A manul stays flat and cryptic: no unrealistic speed burst or roar.
  P.noiseBurst=0;P.revealTimer=0;
  notify("マヌルネコ：伏せて擬態。茂みと岩陰から獲物を奇襲");
  playEffect("step",{volume:.1});
 }else if(P.type==="tibetanFox"){
  // Tibetan sand foxes specialize in pikas/rodents; flush nearby small prey.
  const small=mobs.filter(m=>m.hp>0&&species[m.type]?.prey&&["rat","rabbit","frog","pigeon"].includes(m.type)&&dist(P,m)<420&&!lineBlocked(P,m))
    .sort((a,b)=>dist(P,a)-dist(P,b))[0];
  if(small){huntTarget=small;small.flee=Math.max(1.5,small.flee||0);small.dir=Math.atan2(small.y-P.y,small.x-P.x);small.alert=Math.max(.7,small.alert||0);label(small.x,small.y-25,"小動物を追い出した","#e6d5ae");}
  notify(small?"チベットスナギツネ：小動物を追い出して追撃":"チベットスナギツネ：小動物の痕跡を探す");
  playEffect("attack",{volume:.16});
 }else if(P.type==="shoebill"){
  // A shoebill wins with patient stillness followed by a very fast bill strike.
  P.stillTime=Math.max(P.stillTime||0,1.0);
  notify("ハシビロコウ：静止して照準、△で嘴の一撃");
  playEffect("step",{volume:.12});
 }
}
function combatAim(maxTurn=.56,maxRange=105){
 let best=null,bestScore=Infinity,aim=P.dir;
 for(const m of mobs){
  if(m.hp<=0||m.companion||dist(P,m)>P.r+m.r+maxRange||lineBlocked(P,m))continue;
  const angle=Math.atan2(m.y-P.y,m.x-P.x);
  const diff=Math.atan2(Math.sin(angle-P.dir),Math.cos(angle-P.dir));
  if(Math.abs(diff)>1.28)continue;
  const score=dist(P,m)+(huntTarget===m?-24:0)+Math.abs(diff)*28;
  if(score<bestScore){best=m;bestScore=score;aim=P.dir+clamp(diff,-maxTurn,maxTurn)}
 }
 if(best)P.dir=aim;
 return best;
}

function combatEngaged(){
 if(!P)return false;
 if(P.pendingStrike||P.pounceTime>0||elapsed-P.lastCombatAt<3)return true;
 return mobs.some(m=>m.hp>0&&!m.companion&&!lineBlocked(P,m)&&
  (species[m.type].prey?dist(P,m)<P.r+m.r+70:
   dist(P,m)<240&&(m.alert>0||m.windup>0||m.chargeTime>0)));
}
function edibleFood(c){return c&&c.type!=="bones"&&Number(c.amount)>0}
// Old save food has no groundZ and remains on the ground, not the roof.
function foodAtActorLevel(c,actor=P){
 return !!actor&&edibleFood(c)&&Math.abs((Number(c.groundZ)||0)-(actor.groundZ||0))<12;
}
function scavengeWildFood(m,sp,dt,spotted,playerDistance){
 m.scavengePose=Math.max(0,(m.scavengePose||0)-dt);
 m.scavengeCooldown=Math.max(0,(m.scavengeCooldown||0)-dt);
 m.scavengeNeed=Number.isFinite(m.scavengeNeed)?
  clamp(m.scavengeNeed+dt*.009,0,1):.67+noise(Math.floor(m.x),Math.floor(m.y))*.31;
 const freshKill=(m.feedAfterKill||0)>0;
 if(sp.prey||(!freshKill&&m.scavengeNeed<.69)||spotted||m.alert>0||m.flee>0||
    m.stun>0||m.windup>0||m.chargeTime>0||(m.evadeTime||0)>0||playerDistance<110)return null;
 if(!freshKill&&mobs.some(q=>q!==m&&q.hp>0&&species[q.type].prey&&
    Math.abs(q.x-m.x)<175&&Math.abs(q.y-m.y)<175&&dist(m,q)<175))return null;
 let target=null,best=290*290;
 for(const c of carcasses){
  if(!edibleFood(c)||(c.type!=="corpse"&&c.type!=="meat"))continue;
  const dx=c.x-m.x,dy=c.y-m.y,d2=dx*dx+dy*dy;
  if(d2<best&&(d2>Math.pow(m.r+(c.r||9)+18,2)||!lineBlocked(m,c))){best=d2;target=c}
 }
 if(!target)return null;
 const biteRange=m.r+(target.r||9)+18;
 if(best>biteRange*biteRange){
  m.dir=steerPursuit(m,target.x,target.y);
  return {vx:Math.cos(m.dir)*sp.speed*.60,vy:Math.sin(m.dir)*sp.speed*.60};
 }
 if(lineBlocked(m,target))return null; // Never feed through a room wall.
 if(m.scavengeCooldown<=0){
  const bite=Math.min(target.amount,Math.max(5,Math.round(sp.damage*.32)+4));
  target.amount=Math.max(0,target.amount-bite);
  if(target.amount<=0){
   if(target.type==="corpse")toBones(target);
   else carcasses.splice(carcasses.indexOf(target),1);
  }
  m.hp=Math.min(m.maxHp||m.hp,m.hp+Math.min(5,bite*.4));
  m.scavengeNeed=Math.max(0,m.scavengeNeed-.065);
  m.scavengeCooldown=1.8;m.scavengePose=.9;m.navPath=null;m.feedAfterKill=0;
  if(playerDistance<360)label(m.x,m.y-m.r-25,"死骸を食べる","#d9f0b9");
 }
 return {vx:0,vy:0};
}
function forageWildBerries(m,sp,dt,spotted,playerDistance){
 m.foragePose=Math.max(0,(m.foragePose||0)-dt);
 m.forageCooldown=Math.max(0,(m.forageCooldown||0)-dt);
 m.forageNeed=Number.isFinite(m.forageNeed)?
  clamp(m.forageNeed+dt*.013,0,1):clamp(.56+noise(Math.floor(m.x),Math.floor(m.y))*.30,0,1);
 const eraFood=window.WildEraEcology?.state?.(regionAt(m.x,m.y),elapsed/120)?.food??1;
 const foodRadius=clamp(245*eraFood,.72*245,1.3*245);
 if(!WILD_FORAGERS.has(m.type)||m.forageNeed<.70||spotted||m.alert>0||m.flee>0||
    m.stun>0||(m.evadeTime||0)>0||playerDistance<115||
    ((weather==="RAIN"||weather==="THUNDER")&&!insideShelter(m)))return null;
 // Feeding stops near predators; no food is consumed through walls.
 if(WILD_FORAGERS.has(m.type)&&nearbyAwareWildPredator(m,175))return null;
 let target=null,best=foodRadius*foodRadius;
 for(const c of carcasses){
  if(c.type!=="berries"||!edibleFood(c))continue;
  const dx=c.x-m.x,dy=c.y-m.y,d2=dx*dx+dy*dy;
  if(d2<best&&(d2>Math.pow(m.r+(c.r||9)+12,2)||!lineBlocked(m,c))){best=d2;target=c}
 }
 // Browsing is renewable: herbivores and boars also eat actual grass/shrubs.
 if(!target)for(const p of plants){
  if(p.type===1||(p.type===2&&!visibleShrubCover())||waterBlocksLand(p.x,p.y))continue;
  const dx=p.x-m.x,dy=p.y-m.y,d2=dx*dx+dy*dy;
  if(d2<best&&(d2>Math.pow(m.r+(p.r||9)+12,2)||!lineBlocked(m,p))){best=d2;target=p;}
 }
 // Mountain forage is actual visible ground vegetation, not a hidden urban
 // plant array. The animal must be able to reach it without crossing a cliff.
 if(!target&&mountainHabitat(m.x,m.y))for(const p of MOUNTAIN.forageSites||[]){
  const dx=p.x-m.x,dy=p.y-m.y,d2=dx*dx+dy*dy;
  if(d2<best&&!collides(p.x,p.y,m.r)&&routeClear(m,p,m.r)){
   best=d2;target=p;
  }
 }
 if(!target)return null;
 const grazing=!Object.prototype.hasOwnProperty.call(target,"amount");
 const biteRange=m.r+(target.r||9)+12;
 if(best>biteRange*biteRange){
  m.dir=steerPursuit(m,target.x,target.y);
  return {vx:Math.cos(m.dir)*sp.speed*.48,vy:Math.sin(m.dir)*sp.speed*.48};
 }
 if(lineBlocked(m,target))return null;
 if(m.forageCooldown<=0){
  if(!grazing){
   const bite=Math.min(target.amount,5);
   target.amount=Math.max(0,target.amount-bite);
   if(target.amount<=0)carcasses.splice(carcasses.indexOf(target),1);
  }
  m.forageNeed=Math.max(0,m.forageNeed-(grazing?.32:.21)*clamp(eraFood,.62,1.35));
  m.forageCooldown=1.9;m.foragePose=1.05;m.navPath=null;
  if(playerDistance<320)label(m.x,m.y-m.r-24,"食事","#d9f0b9");
 }
 return {vx:0,vy:0};
}
// NPCs approach the existing river/canal shoreline on foot and drink when safe.
function drinkWildWater(m,sp,dt,spotted,playerDistance){
 m.drinkPose=Math.max(0,(m.drinkPose||0)-dt);
 m.drinkCooldown=Math.max(0,(m.drinkCooldown||0)-dt);
 m.thirstNeed=Number.isFinite(m.thirstNeed)?clamp(m.thirstNeed+dt*.009,0,1):clamp(.30+noise(Math.floor(m.x),Math.floor(m.y))*.42,0,1);
 if(m.thirstNeed<.72||m.drinkCooldown>0||spotted||m.alert>0||m.flee>0||
    m.stun>0||m.windup>0||m.chargeTime>0||(m.evadeTime||0)>0||
    playerDistance<105||((weather==="RAIN"||weather==="THUNDER")&&!insideShelter(m)))return null;
 if((sp.prey||m.type==="boar")&&nearbyAwareWildPredator(m,170))return null;
 // Approach the real dry river/canal bank, not an exploration marker.
 let goal=null,best=310*310;
 const banks=[];
 if(m.y>=0&&m.y<2600&&m.x>=6300){
  for(const offset of [0,110,-110,220,-220]){
   const y=clamp(m.y+offset,32,2568),axis=riverAxis(y);
   const side=m.x<axis?-1:1,edge=axis+side*133;
   const x=edge+side*(m.r+10);
   if(!waterBlocksLand(edge-side*3,y))continue; // Bridges are not water.
   banks.push({x,y});
  }
 }
 if(m.x>=5600&&m.x<8400&&m.y>=2600){
  for(const offset of [0,110,-110,220,-220]){
   const x=clamp(m.x+offset,5632,8368),axis=canalAxis(x);
   const side=m.y<axis?-1:1,edge=axis+side*100;
   const y=edge+side*(m.r+10);
   if(!waterBlocksLand(x,edge-side*3))continue;
   banks.push({x,y});
  }
 }
 for(const bank of banks){
  const d2=(bank.x-m.x)**2+(bank.y-m.y)**2;
  if(d2>=best||collides(bank.x,bank.y,m.r+4))continue;
  goal=bank;best=d2;
 }
 if(!goal)return null;
 if(best>12*12){
  m.dir=steerPursuit(m,goal.x,goal.y);
  if(!clearStep(m,m.dir,Math.min(35,Math.sqrt(best))))return null;
  return {vx:Math.cos(m.dir)*sp.speed*.42,vy:Math.sin(m.dir)*sp.speed*.42};
 }
 if(lineBlocked(m,goal))return null;
 m.thirstNeed=Math.max(0,m.thirstNeed-.65);
 m.drinkCooldown=7;m.drinkPose=1.1;m.navPath=null;
 if(playerDistance<320)label(m.x,m.y-m.r-24,"水を飲む","#b5e8f1");
 return {vx:0,vy:0};
}
function animalRemains(m){const n=species[m.type].food;return {x:m.x,y:m.y,r:Math.max(9,m.r*.78),type:"corpse",animalType:m.type,amount:n,initialAmount:n,ttl:150,phase:rnd(0,6)};}
const BONE_LIFETIME=45; // Seconds of actual unpaused game time.
function toBones(c){c.type="bones";c.amount=0;c.ttl=BONE_LIFETIME;}
function normalizeRemains(c){
 if(!c||typeof c!=="object")return;
 if(c.type==="bones")c.ttl=clamp(Number.isFinite(c.ttl)?c.ttl:BONE_LIFETIME,0,BONE_LIFETIME);
 if(c.type==="corpse"&&(!Number.isFinite(c.initialAmount)||c.initialAmount<=0))
  c.initialAmount=Math.max(1,Number(c.amount)||1);
}
function normalizeCarry(c){
 if(!c||typeof c!=="object"||!Number.isFinite(Number(c.amount))||Number(c.amount)<=0)return null;
 return {type:c.type==="berries"?"berries":"meat",animalType:typeof c.animalType==="string"?c.animalType:null,amount:clamp(Number(c.amount),0,500)};
}
function nearbyFood(){
 return carcasses.some(f=>foodAtActorLevel(f)&&dist(P,f)<65&&!lineBlocked(P,f));
}
function putDownFood(){
 if(!P?.carry||mode!=="play")return;
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0||(P.jumpHeight||0)>20||(P.groundZ||0)>0){notify("着地してから置く");return false;}
 const c=P.carry;
 carcasses.push({x:P.x,y:P.y,r:11,amount:c.amount,type:c.type==="berries"?"berries":"meat",animalType:c.animalType||null,ttl:150,phase:P.dir||0});
 P.carry=null;notify("食料を置いた / ○短押しで食べる・長押しで拾う");syncHUD();return true;
}
function contextAction(longPress=false){
 if(mode!=="play"||!P)return;
 if(atDen()){
  if(P.carry){carryFood();return}
  if(longPress&&denLevel<DEN_MAX_LEVEL){upgradeDen();return}
  openDenInventory();return;
 }
 if(longPress){
  if(P.carry){putDownFood();return}
  if(!nearbyFood()&&markTerritory())return;
  carryFood();return;
 }
 if(P.carry){if(P.eatCD<=0){P.eatCD=.34;eat()}return}
 if(nearbyFood()&&P.eatCD<=0){P.eatCD=.34;eat();return}
 notify("食草・肉の近くで○を押す");
}
const RUSH_COST=[0,5,5,8,10,14],RUSH_POWER=[0,.65,.75,1,.9,1.45];
function nextRushStep(step,window){return step>=1&&step<5&&window>0?step+1:1}
function resetRush(){P.rushStep=0;P.rushWindow=0;P.rushQueued=false}
function interruptRush(){resetRush();P.chargeStrike=false;P.pendingStrike=false;P.ambushStrike=false;P.windup=0;P.rushActiveStep=0;P.atk=Math.max(P.atk,.2)}
function unawareOfPlayer(m){
 return !!m&&m.hp>0&&(m.alert||0)<=0&&(m.search||0)<=0&&(m.flee||0)<=0
  &&!detectsPlayer(m,species[m.type],dist(P,m));
}
function showHuntCinematic(finisher){
 if(!P||mode!=="play")return;
 const splash=$("hunt-cinematic");
 $("hunt-cinematic-title").textContent=finisher?"PHANTOM HUNT":"SHADOW HUNT";
 $("hunt-cinematic-sub").textContent=finisher?"UNSEEN TAKEDOWN":"UNDETECTED STRIKE";
 splash.classList.remove("show");void splash.offsetWidth;splash.classList.add("show");
 huntSlowUntil=performance.now()+780;shake=Math.max(shake,7);
 playEffect("impact",{volume:.34});
}
function attack(){
 if(mode!=="play"||!P)return;
 if(P.atk>0||P.pendingStrike){if(P.rushStep>0&&P.rushStep<5&&P.rushWindow>0)P.rushQueued=true;return}
 const step=nextRushStep(P.rushStep,P.rushWindow);
 const cost=RUSH_COST[step]+(P.type==="shoebill"?3:0);
 if(P.sp<cost){resetRush();P.atk=.18;if((P.tiredNotice||0)<=0){P.tiredNotice=1.5;notify("息切れ / 少し間合いを取れ")}return}
 P.lastCombatAt=elapsed;P.sp-=cost;P.rushStep=step;P.rushActiveStep=step;P.rushQueued=false;
  P.atk=P.rate*(step===5?1.32:step===4?1.15:1);P.rushWindow=P.atk+.45;
 P.windup=Math.min(step===5?.20:.15,P.rate*(step===5?.46:.38));P.pendingStrike=true;
 // Shoebill's pre-aimed bill strike is fast only after waiting without moving.
 P.beakStrike=P.type==="shoebill"&&(P.stillTime||0)>=1.15;
 if(P.beakStrike){P.windup=.055;P.beakVisual=.32;}
 P.stillTime=0;
  P.jumpDive=P.jumpTime>0;
  const concealed=(P.hidden&&P.revealTimer<=0)||(P.jumpDive&&P.jumpAmbush);
  if(P.jumpDive)P.windup=Math.max(P.windup,P.jumpTime);
 const target=combatAim(P.type==="cat"?.72:P.type==="wolf"?.32:P.type==="shoebill"?.30:P.type==="tibetanFox"?.72:.55,P.type==="shoebill"?145:105);
  ambushTarget=concealed&&target&&unawareOfPlayer(target)?target:null;
  P.ambushStrike=!!ambushTarget;
 if((P.type==="fox"||P.type==="tibetanFox")&&P.abilityTime>0&&target&&!P.jumpDive){
  const distance=dist(P,target),angle=Math.atan2(target.y-P.y,target.x-P.x);
  const travel=Math.min(P.type==="tibetanFox"?88:53,Math.max(0,distance-(P.r+target.r+30)));
  if(travel>4&&routeClear(P,{x:P.x+Math.cos(angle)*travel,y:P.y+Math.sin(angle)*travel},P.r)){
   P.pounceTime=.18;P.pounceDuration=.18;P.pounceRemaining=travel;P.pounceDir=angle;
   P.windup=Math.max(P.windup,.24);
   blood(P.x,P.y,"#ffe6a6",5,38);
  }
 }
 P.hidden=false;P.revealTimer=1.15;P.steps+=.1;
 P.noiseBurst=Math.max(P.noiseBurst,P.type==="manul"?.46:P.type==="shoebill"?.75:1.05);playEffect("attack",{volume:.22});
}
// BOAR_DASH_RAM_V1: physical collision makes the boar's run a real attack.
// Both a short-tap dash and a held sprint use the same swept body hitbox.
function resolveBoarDashImpact(x0,y0,x1,y1,isCharging){
 if(!P||P.type!=="boar")return 0;
 const dx=x1-x0,dy=y1-y0,travel2=dx*dx+dy*dy;
 let count=0;
 for(const m of mobs){
  if(m.hp<=0||m.companion)continue;
  const radius=P.r+m.r+3;
  const distance=Math.hypot(P.x-m.x,P.y-m.y);
  if(distance>radius+12)m.boarRamTouching=false;
  if(!isCharging||travel2<Math.max(.75,P.speed*.006)**2||
    m.boarRamTouching||elapsed<(m.boarRamNextAt||0)||
    Math.abs((P.jumpHeight||0)-(m.groundZ||0))>=22)continue;
  const t=clamp(((m.x-x0)*dx+(m.y-y0)*dy)/Math.max(1e-8,travel2),0,1);
  const contactX=x0+t*dx,contactY=y0+t*dy;
  if(Math.hypot(m.x-contactX,m.y-contactY)>radius)continue;
  // The charge must actually approach/cross the body; standing still while
  // holding the sprint input is not an attack.
  const startDistance=Math.hypot(m.x-x0,m.y-y0);
  if(startDistance<=radius&&distance>startDistance+2)continue;
  if(!hitboxesOverlap(P,m,distance)&&lineBlocked({x:contactX,y:contactY},m))continue;
  m.boarRamTouching=true;
  m.boarRamNextAt=elapsed+1.1;
  const levelFactor=COMBAT_LEVELS?.outgoing(m.type,P.level)||1;
  const damage=Math.max(1,Math.round(P.damage*1.25*levelFactor*(m.strongBoss?.72:1)*rnd(.9,1.1)));
  m.hp=Math.max(0,m.hp-damage);
  m.flash=.24;m.alert=Math.max(m.alert||0,3);
  m.lastX=P.x;m.lastY=P.y;m.search=0;
  m.reactiveUntil=Math.max(m.reactiveUntil||0,elapsed+2.5);
  const broken=m.strongBoss?bossPoiseBreak(m,damage,true):false;
  if(!m.strongBoss||broken){
   m.stun=Math.max(m.stun||0,m.strongBoss?.35:.44);
   m.windup=0;m.chargeTime=0;
  }
  m.attack=Math.max(m.attack||0,m.strongBoss?.25:.38);
  P.swing=Math.max(P.swing||0,.23);
  const angle=Math.atan2(dy,dx),push=m.strongBoss?(broken?18:6):25;
  move(m,Math.cos(angle)*push,Math.sin(angle)*push);
  blood(m.x,m.y,"#db9d71",9,125);
  label(m.x,m.y-m.r-27,"体当たり -"+damage,"#ffd49d");
  shake=Math.max(shake,4);flash=Math.max(flash,.075);
  P.noiseBurst=Math.max(P.noiseBurst,1.25);P.lastCombatAt=elapsed;
  playEffect("impact",{volume:.25});
  if(m.hp<=0)kill(m);
  else if(species[m.type]?.prey)provokePreyAfterPlayerHit(m);
  count++;
 }
 return count;
}
function resolveAttack(){
 if(mode!=="play"||!P.pendingStrike)return;
 P.pendingStrike=false;P.swing=.18;let hit=0;const stealthHit=P.ambushStrike;P.ambushStrike=false;
 mobs.forEach(m=>{
  if(m.hp<=0||m.companion)return;
  const d=dist(P,m),overlap=hitboxesOverlap(P,m,d),theta=d>.001?Math.atan2(m.y-P.y,m.x-P.x):P.dir,angle=Math.atan2(Math.sin(theta-P.dir),Math.cos(theta-P.dir));
  const wolfCharge=P.type==="wolf"&&P.chargeStrike;
   const reach=(P.type==="wolf"?55:P.type==="cat"?39:P.type==="manul"?37:P.type==="tibetanFox"?57:P.type==="shoebill"?96:51)+(P.rushActiveStep===5?18:0)+(wolfCharge?34:0);
  const arc=P.type==="wolf"?1.18:P.type==="cat"?.95:P.type==="shoebill"?.68:P.type==="manul"?.91:1.03;
  if(d<P.r+m.r+reach&&(overlap||Math.abs(angle)<arc)&&Math.abs((P.jumpHeight||0)-(m.groundZ||0))<22&&(overlap||!lineBlocked(P,m))){
   const foxBurst=P.type==="fox"&&P.abilityTime>0;
   const dive=P.jumpDive;
    const silentHit=stealthHit&&ambushTarget===m;
     const downwindStrike=silentHit&&isDownwindStalk(m);
     const bonus=(foxBurst?1.4:1)*(silentHit?(downwindStrike?1.75:1.55)*traitEffect("oneEyedWolf",1):1)*(dive?1.4:1)*(wolfCharge?1.6+Math.min(.45,(P.level-1)*.06):1)*(P.rushActiveStep===5?traitEffect("giantLion",1):1);
   // Species-specific attacks follow natural hunting behavior instead of cosmetic labels.
   const small=!!species[m.type]?.prey&&["rat","rabbit","frog","pigeon","crow","snake"].includes(m.type);
   const manulAmbush=P.type==="manul"&&silentHit;
   const foxPreySnap=P.type==="tibetanFox"&&small&&P.abilityTime>0;
   const billStrike=P.type==="shoebill"&&P.beakStrike;
   const speciesPower=(manulAmbush?(small?2.05:1.55):1)*(foxPreySnap?1.58:1)*(billStrike?(small?2.24:1.85):1);
   const rawDamage=Math.max(1,Math.round(P.damage*RUSH_POWER[P.rushActiveStep||1]*bonus*speciesPower*rnd(.86,1.16)));
   const armored=m.type==="rhino"&&!silentHit&&!dive&&!wolfCharge&&Math.cos(theta-(m.dir||0))<-.2;
   const bossHide=(m.strongBoss&&!silentHit&&!dive&&!wolfCharge)?0.84:1;
   const damage=Math.max(1,Math.round(rawDamage*(armored?.48:1)*bossHide*(COMBAT_LEVELS?.outgoing(m.type,P.level)||1)));
   m.hp-=damage;if(armored)label(m.x,m.y-m.r-44,"正面の厚い皮で軽減","#dfd6c5");
   if(foxBurst)P.abilityTime=0;
   // A creature that was physically hit remembers the attack even when it
   // could not see the player before the strike (behind, fog or night).
   m.flash=.16;m.alert=Math.max(3,m.alert||0);m.lastX=P.x;m.lastY=P.y;
   m.reactiveUntil=Math.max(m.reactiveUntil||0,elapsed+2.3);
   m.search=0;if(!species[m.type].prey)m.flee=0;
   const heavy=silentHit||dive||wolfCharge||P.beakStrike||P.rushActiveStep===5;
   const gap=COMBAT_LEVELS?.gap(m.type,P.level)||0;
   const bossBroken=m.strongBoss?bossPoiseBreak(m,damage,heavy):false;
   const disrupt=m.strongBoss?bossBroken:!armored&&(COMBAT_LEVELS?
    COMBAT_LEVELS.canInterrupt(m.type,P.level,heavy,m.staggerGuard<=0,species[m.type].prey):
    (species[m.type].prey||m.staggerGuard<=0||silentHit||dive));
    if(disrupt){
     if(m.strongBoss&&m.signature){
      m.signature=null;m.signatureCooldown=Math.max(m.signatureCooldown||0,3.0);
      label(m.x,m.y-m.r-41,"固有技を阻止！","#befbd6");
     }
     m.windup=0;m.chargeTime=0;m.swing=0;
     m.stun=traitEffect("giantGorilla",m.strongBoss?.54:P.beakStrike?.92:silentHit?.70:dive?.56:P.type==="wolf"?.40:P.type==="cat"?.16:.24);
     m.staggerGuard=species[m.type].prey?0:1.15;m.attack=Math.max(m.attack,m.strongBoss?.40:.22);
     if(m.strongBoss)label(m.x,m.y-m.r-42,"体勢を崩した！","#bee6cf");
    }else if(!m.strongBoss&&gap<3)m.stun=Math.max(m.stun,.035);
    // Repeated light attacks cannot freeze a stronger hunter behind its
    // cooldown. It still signals a full windup before the retaliatory hit.
    if(!m.strongBoss&&!species[m.type].prey&&gap>=1&&m.hp>0&&
       m.windup<=0&&m.chargeTime<=0&&m.stun<=0){
     const recovery=COMBAT_LEVELS?.retaliationWindow(m.type,P.level);
     if(recovery!==null&&recovery!==undefined)m.attack=Math.min(m.attack||0,recovery);
    }
    hit++;
   
    if(species[m.type].prey&&m.hp>0)provokePreyAfterPlayerHit(m);
     if(silentHit){showHuntCinematic(m.hp<=0);label(m.x,m.y-m.r-37,downwindStrike?"風下からの奇襲！":"奇襲成功！","#bdf9c7");blood(m.x,m.y,"#c7f3b7",8,90);if(downwindStrike&&m.hp<=0)m.windStalkReward=true;}
    if(dive){label(m.x,m.y-m.r-51,"飛びかかり！","#ffe1a3");blood(m.x,m.y,"#ffe1a3",9,84)}
   blood(m.x,m.y,m.hp>0?"#f7c77c":"#c65b4f",12,155);label(m.x,m.y-28,"-"+damage,"#ffe5b4");
   const knock=((P.type==="wolf"?17:P.type==="cat"?3:8)+(P.rushActiveStep===5?16:P.rushActiveStep===4?4:0)+(wolfCharge?39:0))*traitEffect("giantBuffalo",1);
   const pushResistance=m.strongBoss?(bossBroken?.48:.07):(COMBAT_LEVELS?.knockback(m.type,P.level)||1);
   move(m,Math.cos(theta)*knock*pushResistance,Math.sin(theta)*knock*pushResistance);
   if(P.type==="wolf"&&m.hp>0)label(m.x,m.y-m.r-28,"よろめき","#ffe0a6");
   if(P.type==="manul"&&manulAmbush)label(m.x,m.y-m.r-54,"低姿勢の伏撃！","#e7e1c6");
   if(P.type==="tibetanFox"&&foxPreySnap)label(m.x,m.y-m.r-54,"小動物への急襲！","#f7daaf");
   if(P.type==="shoebill"&&billStrike)label(m.x,m.y-m.r-54,"嘴の高速突き！","#c8eced");
   if(m.hp<=0)kill(m);
  }
 });
 if(hit){shake=P.jumpDive?6:4;flash=.1;playEffect("bite");playEffect("impact",{volume:.18})}else{playEffect("attack",{volume:.15})}
 P.jumpDive=false;P.jumpAmbush=false;P.chargeStrike=false;P.beakStrike=false;ambushTarget=null;
 if(P.rushActiveStep===5){P.rushWindow=0;P.rushQueued=false;}
}
function kill(m){
 // A defeated entity grants exactly one carcass, trophy, XP reward and bestiary entry.
 if(!m||m.hp>0||m._killRegistered)return;
 m._killRegistered=true;
 if(!debugTutorialSession)window.WildBestiary?.recordKill(m.type);
 kills++;window.WildTrophies?.record?.("hunt",{kills},notify);
 // Eight genuine hunts grant a gacha ticket for vacant party slots only.
 if(!debugTutorialSession&&P?.squadIndividualId&&kills>0&&kills%8===0&&window.WildSquad?.grantTickets){
  const roster=window.WildSquad.grantTickets(1);
  if(roster)notify("狩猟達成：ガチャ権 +1（巣・タイトルで欠員補充）");
 }
 window.WildTrophies?.record?.("kill",{type:m.type},notify);
 P.combo=P.comboTimer>0?P.combo+1:1;P.comboTimer=4.5;
 const remains=animalRemains(m);
 if(isAquaticStrong(m)){
  const bank=nearestDryBank(m.x,m.y,Math.min(m.r,30));
  if(bank){remains.x=bank.x;remains.y=bank.y;}
 }
 carcasses.push(remains);
 if(m.strongBoss){
  strongTrophies[m.type]=(Number(strongTrophies[m.type])||0)+1;
  const material=STRONG_NAMES[m.type]||m.type;
  label(m.x,m.y-m.r-65,"希少素材 "+material+" +1","#ffd68c");
  notify("強敵を討伐："+material+"の希少素材を獲得");
 }
 const windDNA=m.windStalkReward?Math.max(1,Math.round(species[m.type].xp*.25)):0;
  const earnedDNA=species[m.type].xp+windDNA;
  P.xp+=earnedDNA;
  if(P.squadIndividualId&&window.WildSquad?.addXp){
   // One hunt awards XP to all living individuals. Apply each individual's earned
   // levels to real actors immediately, not just the saved roster or gacha screen.
   const roster=window.WildSquad.addXp(earnedDNA);
   for(const member of roster?.members||[]){
    const actor=member.id===P.squadIndividualId?P:mobs.find(q=>q.squadIndividualId===member.id&&q.hp>0);
    if(!actor)continue;
    const previous=Math.max(1,Math.floor(actor.squadGrowthLevel||1));
    const next=Math.max(previous,Math.floor(member.level||1));
    const gained=next-previous;
    if(gained>0){
     const ratio=actor.hp/Math.max(1,actor.maxHp);
     actor.maxHp=Math.round(actor.maxHp*(1+.045*gained));
     actor.hp=Math.max(1,Math.min(actor.maxHp,Math.round(actor.maxHp*ratio)));
     if(actor===P){
      actor.damage=Math.round(actor.damage*(1+.025*gained)*100)/100;
      actor.speed=Math.round(actor.speed*(1+.012*gained)*100)/100;
     }else{
      actor.squadAttackIV=(member.iv?.attack||1)*(1+.025*(next-1));
      actor.squadSpeedIV=(member.iv?.speed||1)*(1+.012*(next-1));
     }
    }
    actor.squadGrowthLevel=next;
    actor.squadLevel=next;
   }
  }
  label(m.x,m.y-50,"+"+earnedDNA+" DNA"+(windDNA?"（風下狩猟）":""),"#9aeac7");
 if(P.xp>=P.nextXp){P.xp-=P.nextXp;P.level++;P.nextXp=Math.round(P.nextXp*1.5+2);mode="upgrade";show("upgrade");playEffect("level")}
 if(kills===3||kills===9)notify("狩猟成功 / 食物連鎖が変化する");
 checkMission();
}

function catWallContact(){
 if(!P||P.type!=="cat")return null;
 let best=null,distance=Infinity;
 for(let i=0;i<buildings.length;i++){
  const b=buildings[i];
  if(P.wallKicks>0&&P.wallKickLast===i)continue;
  if((P.groundZ||0)>0&&roofAt(P.x,P.y)>0)continue;
  const x=clamp(P.x,b.x,b.x+b.w),y=clamp(P.y,b.y,b.y+b.h);
  let dx=P.x-x,dy=P.y-y,d=Math.hypot(dx,dy);
  if(d>P.r+29||d>=distance)continue;
  if(d<.001){
   const edges=[[Math.abs(P.x-b.x),-1,0],[Math.abs(P.x-(b.x+b.w)),1,0],[Math.abs(P.y-b.y),0,-1],[Math.abs(P.y-(b.y+b.h)),0,1]];
   edges.sort((a,b)=>a[0]-b[0]);dx=edges[0][1];dy=edges[0][2];d=1;
  }
  best={nx:dx/d,ny:dy/d,id:i};distance=d;
 }
 return best;
}
function catWallKick(){
 if(!P||P.type!=="cat"||P.jumpTime<=0||P.wallKickLock>0||P.fallTime>0)return false;
 const limit=Math.min(5,2+Math.floor((P.level-1)/2))+(P.abilityTime>0?1:0);
 if(P.wallKicks>=limit)return false;
 const wall=catWallContact(),cost=P.abilityTime>0?8:11;
 if(!wall||P.sp<cost)return false;
 const axes=getAxes(),want=Math.hypot(axes.x,axes.y);
 const ux=want>.18?axes.x:Math.cos(P.dir),uy=want>.18?axes.y:Math.sin(P.dir);
 const dot=ux*wall.nx+uy*wall.ny;
 const tx=ux-dot*wall.nx,ty=uy-dot*wall.ny;
 let vx=wall.nx*.79+tx*.85,vy=wall.ny*.79+ty*.85;
 const mag=Math.hypot(vx,vy)||1;vx/=mag;vy/=mag;
 if(!collides(P.x+wall.nx*5,P.y+wall.ny*5,P.r,P)){P.x+=wall.nx*5;P.y+=wall.ny*5;}
 P.sp-=cost;P.wallKicks++;P.wallKickLast=wall.id;P.wallKickLock=.15;
 P.wallKickTime=.43;P.wallKickDir=Math.atan2(vy,vx);P.dir=P.wallKickDir;
 P.jumpFromHeight=Math.max(0,P.jumpHeight-(P.groundZ||0));
 P.jumpPower=92+Math.min(32,(P.level-1)*4)+(P.abilityTime>0?20:0);
 P.jumpDuration=.46;P.jumpTime=P.jumpDuration;
 P.jumpRemaining=145+Math.min(85,(P.level-1)*10)+(P.abilityTime>0?42:0);
 P.jumpSpeed=P.jumpRemaining/P.jumpDuration;P.jumpDir=P.wallKickDir;
 P.jumpCD=.12;P.vx=0;P.vy=0;P.hidden=false;P.revealTimer=.9;
 P.noiseBurst=Math.max(P.noiseBurst,.9);
 blood(P.x,P.y,"#e4edc1",9,70);playEffect("jump");
 if(P.wallKicks===1||P.wallKicks===limit)label(P.x,P.y-28,P.wallKicks===limit?"連続壁蹴り！":"三角飛び！","#dbf8c6");
 return true;
}
function jump(){
 if(mode!=="play"||!P)return false;
 if(P.type==="cat"&&P.jumpTime>0)return catWallKick();
 if(P.jumpTime>0||P.jumpCD>0||P.dashTime>0||P.pounceTime>0||P.fallTime>0||P.pendingStrike)return false;
 const cat=P.type==="cat",wolf=P.type==="wolf",cost=traitEffect("giantMoose",cat?14:wolf?22:17);
 if(P.sp<cost){notify("持久力不足 / ジャンプできない");return false}
 const axis=getAxes(),moving=Math.hypot(axis.x,axis.y)>.18;
 if(moving)P.dir=Math.atan2(axis.y,axis.x);
 const distance=(cat?109+Math.min(46,(P.level-1)*5):wolf?70:P.type==="shoebill"?165:112)*traitEffect("whiteTiger",1);
 P.jumpDuration=cat?.44:wolf?.49:P.type==="shoebill"?.71:.45;
 P.jumpTime=P.jumpDuration;P.jumpHeight=P.groundZ||0;
 P.jumpFromHeight=0;P.jumpPower=cat?83+Math.min(20,(P.level-1)*3):wolf?43:P.type==="shoebill"?98:58;
 P.jumpRemaining=moving?distance:0;P.jumpSpeed=distance/P.jumpDuration;
 P.jumpDir=P.dir;P.jumpDive=false;P.jumpAmbush=P.hidden&&P.revealTimer<=0;
 P.wallKicks=0;P.wallKickLast=-1;P.wallKickTime=0;
 P.jumpCD=cat?.56:wolf?1.16:.81;P.sp-=cost;
 P.vx=0;P.vy=0;
 P.hidden=false;P.revealTimer=.85;P.noiseBurst=Math.max(P.noiseBurst,.8);
 playEffect("jump");
 return true;
}
function pounceImpactOnSegment(x0,y0,x1,y1){
 const dx=x1-x0,dy=y1-y0,a=dx*dx+dy*dy;
 if(a<1e-7)return null;
 let nearest=null;
 for(const m of mobs){
  if(m.hp<=0||Math.abs((P.groundZ||0)-(m.groundZ||0))>=22)continue;
  if(Math.cos(Math.atan2(m.y-y0,m.x-x0)-P.pounceDir)<.35)continue;
  const ox=x0-m.x,oy=y0-m.y,r=P.r+m.r+10;
  const b=2*(ox*dx+oy*dy),c=ox*ox+oy*oy-r*r,disc=b*b-4*a*c;
  if(c>0&&disc<0)continue;
  const t=c<=0?0:(-b-Math.sqrt(Math.max(0,disc)))/(2*a);
  if(t<0||t>1||(nearest&&t>=nearest.t))continue;
  const x=x0+dx*t,y=y0+dy*t,point={x,y};
  if(collides(x,y,P.r,P)||!routeClear({x:x0,y:y0},point,P.r)||
     lineBlocked(point,m)||!routeClear(point,m,3))continue;
  nearest={mob:m,x,y,t};
 }
 return nearest;
}
function dash(){
 if(mode!=="play"||P.jumpTime>0||P.pounceTime>0||P.fallTime>0||P.pendingStrike||P.dash>0)return false;
 const cost=P.type==="wolf"?27:P.type==="cat"?19:22;
 if(P.sp<cost){notify("持久力が足りない");return false}
 const axis=getAxes();if(Math.hypot(axis.x,axis.y)>.15)P.dir=Math.atan2(axis.y,axis.x);
 const target=combatAim(.78,345);
 const angle=target?Math.atan2(target.y-P.y,target.x-P.x):P.dir;
 const maximum=P.type==="manul"?190+Math.min(35,(P.level-1)*3):P.type==="shoebill"?160+Math.min(35,(P.level-1)*3):P.type==="cat"?235+Math.min(75,(P.level-1)*5)
  :P.type==="wolf"?300+Math.min(100,(P.level-1)*8)
  :235+Math.min(65,(P.level-1)*5);
 const travel=(target?clamp(dist(P,target)-(P.r+target.r-2),20,maximum):maximum)*.70*traitEffect("giantBoar",1);
 ambushTarget=target&&unawareOfPlayer(target)?target:null;
 P.dir=angle;P.sp-=cost;P.dash=P.type==="cat"?.65:P.type==="wolf"?1.3:.88;P.chargeStrike=P.type==="wolf";
 P.pounceDir=angle;P.pounceDuration=P.type==="wolf"?.37:P.type==="cat"?.31:.30;
 P.pounceTime=P.pounceDuration;P.pounceRemaining=travel;
 P.vx=0;P.vy=0;P.atk=Math.max(P.atk,P.rate);
 // Boar dash deals damage at physical contact instead of a delayed bite.
 P.windup=P.type==="boar"?0:P.pounceDuration+.04;
 P.pendingStrike=P.type!=="boar";P.jumpDive=P.type!=="boar";
 P.ambushStrike=P.type!=="boar"&&!!ambushTarget; // No phantom follow-up hit after a boar ram.
 P.hidden=false;P.revealTimer=1.1;
 P.noiseBurst=Math.max(P.noiseBurst,1.2);playEffect(P.type==="wolf"?"impact":"attack");
 return true;
}
function upgradeDen(){
 if(mode!=="play")return false;
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0){notify("巣に着地してから強化");return false}
 if(!atDen()){notify("巣の中心に近づいて○長押しで強化");return false}
 if(denLevel>=DEN_MAX_LEVEL){notify("巣は最大LV3まで成長済み");return false}
 const cost=DEN_COSTS[denLevel+1];
 if(denStash<cost){notify("巣の成長には備蓄 "+cost+"pt必要（あと"+(cost-denStash)+"pt）");return false}
 denLevel++; // The stockpile is an unlock requirement, not a consumable upgrade currency.
 saveDenLevel();saveDenStash();
 notify("巣 LV"+denLevel+"！ 食料は消費せず残ります。上限 "+denCapacity()+"pt");
 checkMission();saveAuto();syncHUD();return true;
}
function carryFood(){
 if(mode!=="play")return false;
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0||(P.jumpHeight||0)>(P.groundZ||0)+20){notify("着地してから運ぶ");return false}
 if((P.groundZ||0)>0&&!atDen()){notify("地上で食草・肉を運ぶ");return false}
 if(atDen()){
  if(P.carry){
   const kind=foodName(P.carry),value=Math.max(1,Math.round(P.carry.amount*foodBalance(P.carry).stash));
   const added=Math.min(value,denCapacity()-denStash);
   if(added<=0){notify("巣の備蓄が満杯");return false}
   denStores[P.carry.type==="berries"?"berries":"meat"]+=added;syncDenStash();
   if(added>=value)P.carry=null;
   else P.carry.amount=Math.max(.01,Number((P.carry.amount*(1-added/value)).toFixed(2)));
   saveDenStash();saveAuto();checkMission();syncHUD();
   notify(kind+"を備蓄 +"+added+"pt（合計 "+denStash+"pt）");
   if(mission===4)announceObjective();
   return true;
  }
  openDenInventory();return true;
 }
 if(P.carry)return putDownFood();
 let selected=null,nearest=65;
 for(const f of carcasses){const d=dist(P,f);if(foodAtActorLevel(f)&&d<nearest&&!lineBlocked(P,f)){selected=f;nearest=d}}
 if(!selected){notify("運べる食草・肉が近くにない");return false}
 if(selected.type==="corpse"){
  const portion=Math.min(24,Math.max(0,selected.amount-1));
  if(portion<1){notify("死骸に運べる肉が残っていない");return false}
  selected.amount-=portion;P.carry={type:"meat",animalType:selected.animalType||null,amount:portion};
 }else{
  P.carry={type:selected.type==="berries"?"berries":"meat",animalType:selected.animalType||null,amount:selected.amount};
  carcasses.splice(carcasses.indexOf(selected),1);
 }
 notify(foodName(P.carry)+"をくわえた。巣の中で○を押すと備蓄");
 if(mission===4)announceObjective();
 syncHUD();return true;
}
function eat(){
 if(mode!=="play")return;
 if((P.jumpHeight||0)>(P.groundZ||0)+20||P.jumpTime>0||P.pounceTime>0||P.fallTime>0){notify("着地してから食べる");return}
 let c=P.carry||null,near=65,carried=!!c;
 if(!c)for(const f of carcasses){const d=dist(P,f);if(foodAtActorLevel(f)&&d<near&&!lineBlocked(P,f)){near=d;c=f}}
 if(!c){notify("食草・肉が近くにない");return}
 const bite=Math.min(12,c.amount),balance=foodBalance(c);
 const gain=Math.round(bite*balance.satiety*(P.type==="tibetanFox"&&c.type!=="berries"?1.18:1)),heal=Math.round(bite*balance.healing);
 P.hunger=clamp(P.hunger+gain,0,100);P.hp=clamp(P.hp+heal,0,P.maxHp);const woundRelief=sootheStrongWound(bite);meals++;
 if(carried){c.amount=Math.max(0,c.amount-bite);if(c.amount===0)P.carry=null}
 else if(c.type==="corpse"){c.amount=Math.max(0,c.amount-bite);if(c.amount===0)toBones(c)}
 else{c.amount=Math.max(0,c.amount-bite);if(c.amount===0)carcasses.splice(carcasses.indexOf(c),1)}
 label(P.x,P.y-30,foodName(c)+" 満腹+"+gain+" 生命+"+heal+(woundRelief>0?" 出血緩和":""),"#bfe89e");
 blood(P.x,P.y,"#d6c17f",7,45);playEffect("collect");checkMission();syncHUD();saveAuto();
}
function inheritStrongTrait(type){
 if(mode!=="inventory"||!P||!atDen()||!STRONG_TRAITS[type])return false;
 if(denLevel<2){notify("能力継承には巣LV2が必要");return false;}
 if(P.inheritedTraits?.[type]){notify("この能力は継承済み");return false;}
 const available=Math.max(0,Math.floor(Number(strongTrophies[type])||0));
 if(available<1){notify("必要な希少素材がありません");return false;}
 // Commit the cost and the benefit in the same autosave; the trait cannot be learned twice.
 strongTrophies[type]=available-1;
 P.inheritedTraits={...(P.inheritedTraits||{}),[type]:true};
 if(type==="alpha")P.speed=Math.round(P.speed*1.08);
 else if(type==="oldBear"){P.maxHp+=28;P.hp=Math.min(P.maxHp,P.hp+28);}
 else if(type==="blackPanther")P.damage=Math.round(P.damage*1.12);
 // Eagle and lizard traits are applied in nightVisionProfile/update, not as a one-time stat.
 renderDenInventory();syncHUD();saveAuto();
 notify("能力継承："+STRONG_TRAITS[type].name+"（"+STRONG_TRAITS[type].effect+"）");
 playEffect("level");
 return true;
}
// Explicit recruitment: den meat is spent only after pressing the pantry button.
function companionOfPlayer(){return P?mobs.find(m=>window.WildCompanions?.isAlly?.(m,P.type)):null;}
function recruitCompanion(){
 if(P?.squadIndividualId){notify('編成仲間はガチャで決定します');return false;}
 if(mode!=="inventory"||!P||!atDen())return false;
 const helper=window.WildCompanions;
 if(!helper||denLevel<2){notify("巣LV2で仲間を迎えられます");return false;}
 if(companionOfPlayer()){notify("仲間はすでに同行中");return false;}
 if(denStores.meat<helper.cost){notify("仲間には肉24ptが必要");return false;}
 if(mobs.length>=WILDLIFE.cap)retireFarCalmAnimal();
 if(mobs.length>=WILDLIFE.cap||mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius).length>=WILDLIFE.localCap){
  notify("周辺の動物が多い。少し時間を置こう");return false;
 }
 const sp=species[helper.speciesFor[P.type]];let spot=null;
 for(const radius of [75,105,140,185,230,280]){
  for(let k=0;k<16;k++){
   const a=(P.dir||0)+k*Math.PI/8,x=P.x+Math.cos(a)*radius,y=P.y+Math.sin(a)*radius;
   if(x<35||y<35||x>WORLD.w-35||y>WORLD.h-35||waterBlocksLand(x,y)||
      collides(x,y,(sp?.r||20)+5)||mobs.some(m=>m.hp>0&&Math.hypot(m.x-x,m.y-y)<(m.r||18)+(sp?.r||20)+12))continue;
   spot={x,y};break;
  }
  if(spot)break;
 }
 if(!spot){notify("巣の周囲に仲間が立てる場所がない");return false;}
 const ally=helper.create(P.type,spot.x,spot.y,species);
 if(!ally)return false;
 mobs.push(ally);denStores.meat-=helper.cost;syncDenStash();saveDenStash();saveAuto();
 renderDenInventory();syncHUD();drawMini();
 notify("仲間が加わった！ 一緒に移動し、戦闘を援護する");
 label(ally.x,ally.y-ally.r-26,"仲間になった！","#9eeadf");playEffect("collect");
 return true;
}
function renderDenInventory(){
 if(!P)return;
 $("den-inventory-total").textContent="合計 "+denStash+" / "+denCapacity()+"pt";
 const trophyText=Object.entries(strongTrophies).filter(([type,count])=>STRONG_NAMES[type]&&Number(count)>0).map(([type,count])=>STRONG_NAMES[type]+"×"+Math.floor(Number(count))).join(" / ");
 $("den-inventory-help").textContent=(atDen()?"食べたい種類を選んでください。選択しなければ減りません。":"巣の外では閲覧のみ。食べるには巣へ戻ってください。")+(trophyText?" 希少素材："+trophyText:"");
 const traitSummary=$("strong-inheritance-summary");
 if(traitSummary)traitSummary.textContent=denLevel<2?"巣LV2で解放。強敵の希少素材を1個消費して能力を継承。":"強敵の希少素材1個で1能力を継承（各能力1回）。";
 for(const btn of document.querySelectorAll("[data-strong-trait]")){
  const type=btn.dataset.strongTrait,trait=STRONG_TRAITS[type];
  if(!trait)continue;
  const learned=!!P.inheritedTraits?.[type],count=Math.max(0,Math.floor(Number(strongTrophies[type])||0));
  btn.textContent=learned?"継承済み":trait.name+"（"+trait.effect+"）｜素材 "+count+"個";
  btn.disabled=learned||denLevel<2||!atDen()||count<1;
  btn.setAttribute("aria-label",trait.name+" "+trait.effect+(learned?" 継承済み":" 必要素材1個、所持"+count+"個"));
 }
 const oldRecruit=$("den-companion-btn")?.closest(".den-food-row");if(oldRecruit)oldRecruit.classList.toggle("hidden",!!P?.squadIndividualId);
  const ally=companionOfPlayer(),allyButton=$("den-companion-btn"),allyStatus=$("den-companion-status");
 if(allyStatus)allyStatus.textContent=ally?"仲間が同行中｜生命 "+Math.ceil(ally.hp)+"/"+ally.maxHp:"巣LV2で肉24ptを使い、同行する仲間を1匹迎えられます。";
 if(allyButton){allyButton.disabled=!atDen()||denLevel<2||denStores.meat<(window.WildCompanions?.cost||24)||!!ally||mobs.length>=WILDLIFE.cap;
  allyButton.textContent=ally?"仲間が同行中":"仲間を迎える（肉24pt）";}
 const canEat=atDen()&&(P.hunger<100||P.hp<P.maxHp||(P.strongWound||0)>0);
 for(const key of ["meat","berries","legacy"]){
  $("den-row-"+key).classList.toggle("hidden",key==="legacy"&&denStores.legacy<=0);
  $("den-qty-"+key).textContent=denStores[key]+"pt";
  $("den-eat-"+key).disabled=!canEat||denStores[key]<=0;
 }
}
function openDenInventory(){
 if(mode!=="play"||!P)return false;
 window.__wildSquadAtDen=!!atDen();
 saveAuto();resetControls();mode="inventory";$("den-inventory").classList.remove("hidden");
 renderDenInventory();$("den-inventory-close").focus({preventScroll:true});return true;
}
function closeDenInventory(){
 window.__wildSquadAtDen=false;
 if(mode!=="inventory")return;
 $("den-inventory").classList.add("hidden");mode="play";resetControls();syncHUD();saveAuto();
 if(mission<=3&&!tutorialSeen.has(mission))announceObjective();
}
function eatFromDen(kind){
 if(mode!=="inventory"||!P||!atDen()||!["meat","berries","legacy"].includes(kind))return false;
 if(P.hunger>=100&&P.hp>=P.maxHp&&!(P.strongWound>0)){notify("満腹で体力も最大です");return false}
 const points=Math.min(kind==="meat"?18:kind==="berries"?7:12,denStores[kind]);
 if(points<=0){notify("その食料はありません");return false}
 denStores[kind]-=points;syncDenStash();
 const heal=Math.round(points*(kind==="meat"?1/3:kind==="berries"?1/7:1/4));
 P.hunger=clamp(P.hunger+points,0,100);P.hp=clamp(P.hp+heal,0,P.maxHp);const woundRelief=sootheStrongWound(points,true);meals++;
 saveDenStash();checkMission();saveAuto();syncHUD();renderDenInventory();
 notify((kind==="meat"?"肉":kind==="berries"?"食草":"以前の備蓄")+"を食べた：満腹+"+points+"・生命+"+heal+(woundRelief>0?"・出血緩和":""));
 return true;
}
function stockpileStep(){
 if(!P||mission!==4)return null;
 if(P.carry)return {step:2,text:atDen()?"② ここで○を押して備蓄":"② 巣の中心へ戻り○で備蓄（短押し・長押し可）",label:"巣"};
 return {step:1,text:"① 食草・肉のそばで○長押しして運ぶ",label:"食草・肉"};
}
// Optional post-tutorial survival expeditions, not a forced story or ending.
// Counters are saved in existing optional SAVE_SCHEMA2 fields; old saves start
// at their current baseline so a restored LV4 animal cannot auto-complete.
function fieldQuestCounter(step){
 if(step===0)return kills;
 if(step===1)return meals;
 if(step===2)return freeTarget>=EXPLORE_SITES.length?P.steps:discoveredSites.length;
 return elapsed;
}
function fieldQuestInfo(){
 const step=clamp(freeStep|0,0,3),base=questReady?freeTarget:fieldQuestCounter(step);
 const stepTravel=step===2&&freeTarget>=EXPLORE_SITES.length;
 const required=step===0?2:step===1?3:step===2?(stepTravel?32:1):90;
 const progress=Math.max(0,fieldQuestCounter(step)-base);
 const fraction=clamp(progress/required,0,1);
 const name=step===0?"食物連鎖の狩人":step===1?"冬を越す食料確保":step===2?(stepTravel?"街道踏破":"未知の場所を発見"):"世界の時を生きる";
 const detail=step===0?"野生動物を2匹狩る":step===1?"食草・肉を3回食べる":
  step===2?(stepTravel?"世界を歩いて32歩分の距離を踏破":"まだ見つけていない探索地点へ行く"):
  "現実時間90秒を生き抜く";
 return {stage:"探索依頼 "+Math.max(1,expedition)+"｜"+(step+1)+"/4",
  title:name,detail:detail+"　報酬：得点・体力・食料",next:"",
  progress:fraction,summary:name+" "+Math.min(required,Math.floor(progress))+"/"+required};
}
function updateFieldQuest(){
 if(mission<7||mode!=="play"||!P)return;
 if(!questReady){freeStep=0;freeTarget=fieldQuestCounter(0);questReady=true;return;}
 const goal=fieldQuestInfo();
 if(goal.progress<1)return;
 const reward=150+Math.min(350,expedition*22);
 totalScore+=reward;
 P.hp=Math.min(P.maxHp,P.hp+Math.max(5,Math.round(P.maxHp*.09)));
 P.hunger=Math.min(100,P.hunger+12);
 P.sp=Math.min(100,P.sp+24);
 const done=goal.title;
 expedition+=1;freeStep=(freeStep+1)%4;
 freeTarget=freeStep===2?(discoveredSites.length>=EXPLORE_SITES.length?P.steps:discoveredSites.length):fieldQuestCounter(freeStep);
 notify("探索達成："+done+"／"+reward+"点",3.0);
 label(P.x,P.y-P.r-32,"探索報酬 +"+reward,"#d4f1c4");
 saveAuto();
}
function missionInfo(){
 if(mission>=7)return fieldQuestInfo();
 switch(mission){
  case 0:return {stage:"チュートリアル 1 / 4",title:"食草か肉を食べよう",detail:"近くの食草・肉を食べる / ○・E",next:"身を隠せ",progress:Math.min(1,meals)};
  case 1:return {stage:"チュートリアル 2 / 4",title:"緑の茂みで身を隠す",detail:"緑の葉がある茂みに入って約1秒止まる",next:"獲物を仕留めろ",progress:Math.min(1,hiddenHold/.75)};
  case 2:return {stage:"チュートリアル 3 / 4",title:"獲物を仕留めろ",detail:"獲物に近づいて攻撃 / ×・J",next:"巣に食料を備蓄しよう",progress:Math.min(1,kills)};
  case 3:return {stage:"チュートリアル 4 / 4",title:"巣に食料を備蓄しよう",detail:"食草か肉を運んで巣に備蓄し、巣を強化する",next:"巣をLV2に強化",progress:denLevel>=2?1:Math.min(1,denStash/DEN_COSTS[2])};
  case 4:{
   const step=stockpileStep();
   return {stage:"チュートリアル 4 / 4・巣に備蓄",
    title:step.step===1?"食料をくわえて巣へ持ち帰ろう":"食料を巣に預けよう",
    detail:step.text+(step.step===1?"（約0.6秒）":"")+"。1回備蓄すれば終了",
    next:step.step===2?"巣で○短押し":"食料を運んで備蓄",
    progress:denStash>tutorialStashBase?1:0};
  }
  case 5:return {stage:"生存目標 2 / 3",title:"縄張りを1か所確保せよ",detail:"地図の縄張り標識で○長押し。周囲の敵に注意",next:"探索地点を2か所発見せよ",progress:Math.min(1,territoryOwned())};
  case 6:return {stage:"生存目標 3 / 3",title:"探索地点を2か所発見せよ",detail:"地図の未発見地点を訪れ、生存能力を得る",next:"探索を続ける",progress:Math.min(1,discoveredSites.length/2)};
  default:return {stage:"目標",title:"探索・狩猟・巣の発展",detail:"",next:"",progress:0};
 }
}
// Two help pages only: the current mission, then an optional one-screen control reminder.
const GUIDE_GOALS=[
 {title:"食事をする",what:"食べ物に近づき、○を押す。",how:"食べると空腹が回復する。"},
 {title:"茂みに隠れる",what:"緑の草むらに入り、少し止まる。",how:"隠れると体が薄くなる。"},
 {title:"獲物を狩る",what:"△で攻撃、□で飛びつく。",how:"獲物を仕留めて肉を得る。"},
 {title:"巣の作り方",what:"食草・肉で○長押しして運ぶ。",how:"巣の中心で○短押しして備蓄し、○長押しでLV2に強化。"},
 {title:"巣に備蓄する",what:"食料を○長押しで運ぶ。",how:"巣に戻り、○で預ける。"},
 {title:"縄張りを取る",what:"標識で○長押し。",how:"巣の安全性が上がる。"},
 {title:"探索地点を見つける",what:"未発見の地点を2か所訪れる。",how:"最後の目標へ進む。"},
 {title:"探索依頼に挑む",what:"狩りや食事、未発見の場所を巡り、報酬を獲得する。",how:"各依頼を達成して、巣と群れを守る。"}
];
let tutorialPage=0;const tutorialSeen=new Set();let guideNeedsFrame=false,milestoneUntil=0,previouslyOnboardedAtRunStart=false;
function renderTutorial(){
 const index=TUTORIAL_STAGES.indexOf(mission),info=GUIDE_GOALS[clamp(mission,0,GUIDE_GOALS.length-1)];
 $("tutorial-stage").textContent=index>=0?"チュートリアル "+(index+1)+" / 4":"生存ガイド";
 $("tutorial-title").textContent=info.title;$("tutorial-what").textContent=info.what;$("tutorial-how").textContent=info.how;
 // Warn once, on the first onboarding screen, before the player risks a rare gacha animal.
 $("tutorial-permadeath")?.classList.toggle("hidden",mission!==0);
 $("tutorial-progress-label").textContent="いまやること";$("tutorial-counter").textContent=index>=0?(index+1)+" / 4":"自由探索";
 $("tutorial-prev").disabled=true;$("tutorial-next").disabled=true;
}
function openTutorial(page=0,automatic=false){
 if(!P||!(mode==="play"||mode==="guide"))return false;
 if(automatic&&(!TUTORIAL_STAGES.includes(mission)||tutorialSeen.has(mission)||(!debugTutorialSession&&tutorialLessonsSeenEver.has(mission))))return false;
 tutorialPage=0;
 if(automatic)rememberTutorialStage(mission);
 if(mode==="play"){saveAuto();resetControls();mode="guide"}
 guideNeedsFrame=true;$("app").classList.add("tutorial-paused");
 $("tutorial-dialog").classList.remove("hidden");$("objective-banner").classList.remove("visible");objectiveBannerTime=0;
 window.WildAudio?.update({weather,area:P?regionAt(P.x,P.y):0,danger:false,mode:"guide"});
 renderTutorial();$("tutorial-close").focus({preventScroll:true});return true;
}
function closeTutorial(){
 if(mode!=="guide")return;
 $("tutorial-dialog").classList.add("hidden");$("app").classList.remove("tutorial-paused");
 guideNeedsFrame=false;mode="play";objectiveBannerTime=0;resetControls();syncHUD();saveAuto();
 window.WildAudio?.update({weather,area:P?regionAt(P.x,P.y):0,danger:false,mode:"play"});
}
function tutorialMove(delta){if(mode==="guide"&&delta>0)closeTutorial()}
function announceObjective(){
 if(!P)return;
 if(mission>=7){objectiveBannerTime=0;$("objective-banner").classList.remove("visible");return}
 if(mission<=6){
  objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
  if(TUTORIAL_STAGES.includes(mission)&&mode==="play")openTutorial(0,true);
  return;
 }
 if(mode!=="play"){objectiveBannerTime=0;return}
 const info=missionInfo();
 $("objective-banner-stage").textContent=info.stage;
 $("objective-banner-title").textContent=info.title;
 $("objective-banner-next").textContent="次の目的："+info.next;
 $("objective-banner").classList.remove("visible");void $("objective-banner").offsetWidth;
 $("objective-banner").classList.add("visible");objectiveBannerTime=performance.now()+2600;
}
// Award first, then open the next lesson; do not rely on closing a lesson to show success.
function showMissionMilestone(previous,next){
 if(!P||mode!=="play"||next!==7||![4,6].includes(previous)||(!debugTutorialSession&&tutorialLessonsSeenEver.has(7)))return false;
 const duration=1250;
 $("mission-milestone-kicker").textContent="";
 $("mission-milestone-title").textContent="チュートリアル終了";
 const el=$("mission-milestone");
 el.style.setProperty("--milestone-duration",duration+"ms");
 el.classList.remove("hidden");el.classList.remove("show");void el.offsetWidth;el.classList.add("show");
 milestoneUntil=performance.now()+duration;rememberTutorialStage(7);
 resetControls();mode="milestone";guideNeedsFrame=true;
 objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
 window.WildAudio?.update({weather,area:P?regionAt(P.x,P.y):0,danger:false,mode:"milestone"});
 return true;
}
function finishMissionMilestone(){
 if(mode!=="milestone")return false;
 $("mission-milestone").classList.remove("show");$("mission-milestone").classList.add("hidden");
 milestoneUntil=0;mode="play";announceObjective();syncHUD();return true;
}
// One-time gameplay gacha rights. Independent ledger preserves SAVE_SCHEMA2.
const GACHA_REWARD_KEY="wild-reclaim-gacha-rewards-v1";
function awardGameplayGachaTicket(kind,milestone){
 const squad=window.WildSquad?.load?.();
 if(debugTutorialSession||!P?.squadIndividualId||!squad?.members?.length||!window.WildSquad?.grantTickets)return false;
 const token=String(squad.members.map(m=>m.id).sort().join("|"))+"::"+kind+":"+milestone;
 let ledger={};
 try{ledger=JSON.parse(localStorage.getItem(GACHA_REWARD_KEY)||"{}")||{}}catch(_){}
 if(ledger[token])return false;
 try{localStorage.setItem(GACHA_REWARD_KEY,JSON.stringify({...ledger,[token]:1}))}catch(_){return false}
 const credited=window.WildSquad.grantTickets(1);
 if(!credited){try{localStorage.setItem(GACHA_REWARD_KEY,JSON.stringify(ledger))}catch(_){}return false}
 notify("達成報酬：ガチャ権 +1（巣・タイトルで空き枠補充）");
 return true;
}
function advanceMission(next){
 const previous=mission;
 if(next===1)hiddenHold=0;
 if(next===2)tutorialHuntBase=kills;
 if(next===4)tutorialStashBase=denStash;
 mission=next;
 if(next===7){missionComplete=true;tutorialSeen.add(7);awardGameplayGachaTicket("mission","tutorial-complete")}
 const milestone=next===7&&showMissionMilestone(previous,next);
 if(!milestone&&next!==7){
  announceObjective();
  if(next===4&&mode==="play")notify("巣へ食料を運び、○で備蓄",2.6);
 }
 syncHUD();saveAuto();
}
function checkMission(){
 if(mission===0&&meals>=1){advanceMission(1);return}
 if(mission===1&&hiddenHold>=.75&&inVisibleShrubCover(P)){advanceMission(2);return}
 if(mission===2&&kills>tutorialHuntBase){advanceMission(4);return}
 if(mission===3){advanceMission(4);return}
 if(mission===4&&denStash>tutorialStashBase){advanceMission(7);return}
 if(mission===5&&territoryOwned()>=1){advanceMission(6);return}
 if(mission===6&&discoveredSites.length>=2){advanceMission(7);return}
 // Post-tutorial exploration missions are updated by updateFieldQuest().
}
function nearestGoal(list){
 if(!P||!list.length)return null;
 let bestItem=null,bestDist=Infinity;
 for(const q of list){const d=dist(P,q);if(d<bestDist){bestDist=d;bestItem=q}}
 return bestItem;
}
function objectiveShortLabel(){
 if(mission>=7)return "探索目標";
 if(mission===0){const f=nearestGoal(carcasses.filter(c=>edibleFood(c)));return f?foodName(f):"食草・肉"}
 if(mission===1)return visibleShrubCover()?"潜伏する茂み":"建物・車の陰";
 if(mission===2)return "獲物";
 if(mission===3)return "巣";
 if(mission===4){const step=stockpileStep();if(step?.step===1){const f=nearestGoal(carcasses.filter(c=>c.ttl>0&&edibleFood(c)));return f?foodName(f):"食草・肉"}return "巣"}
 if(mission===5)return "縄張り標識";
 if(mission===6)return "探索地点";
 return "目標";
}
function getObjective(){
 if(!P||mode==="menu"||mode==="over"||mode==="clear")return null;
 if(mission>=7){
  if(freeStep===2&&freeTarget<EXPLORE_SITES.length&&discoveredSites.length<EXPLORE_SITES.length){
   const destination=nearestGoal(EXPLORE_SITES.filter(q=>!discoveredSites.includes(q.id)));
   return destination?{x:destination.x,y:destination.y,label:"未発見の探索地点"}:null;
  }
  return null;
 }
 if(mission===1){
  const p=nearestGoal(plants.filter(visibleShrub));
  return p?{x:p.x,y:p.y,label:"緑の茂みで約1秒止まる"}:null;
 }
 if(mission===3){const site=denAtActor()||closestDen(P,true);return {x:site.x,y:site.y,label:"巣へ食料を備蓄する"};}
 if(mission===4){
  if(P.carry){const site=denAtActor()||closestDen(P,true);return {x:site.x,y:site.y,label:"巣に備蓄する"};}
  const food=nearestGoal(carcasses.filter(c=>c.ttl>0&&edibleFood(c)));
  if(food)return {x:food.x,y:food.y,label:foodName(food)+"を○長押しで運ぶ"};
  const prey=nearestGoal(mobs.filter(m=>m.hp>0&&species[m.type].prey));
  return prey?{x:prey.x,y:prey.y,label:"獲物を倒して食料を運ぶ"}:null;
 }
 if(mission===5){const post=nearestGoal(TERRITORY_POSTS.filter((site,i)=>!territoryClaims[i]));return post?{x:post.x,y:post.y,label:"縄張り標識で○長押し"}:null;}
 if(mission===6){const site=nearestGoal(EXPLORE_SITES.filter(site=>!discoveredSites.includes(site.id)));return site?{x:site.x,y:site.y,label:"未発見の探索地点"}:null;}
 const findFood=mission===0;
 if(findFood){
  const f=nearestGoal(carcasses.filter(q=>q.ttl>0&&edibleFood(q)));
  return f?{x:f.x,y:f.y,label:foodName(f)+"を食べる / ○・E"}:null;
 }
 if(!huntTarget||huntTarget.hp<=0||!mobs.includes(huntTarget)||dist(P,huntTarget)>420)
  huntTarget=nearestGoal(mobs.filter(q=>q.hp>0&&species[q.type].prey));
 if(!huntTarget)return null;
 const lead=.22,px=clamp(huntTarget.x+(huntTarget.vx||0)*lead,35,WORLD.w-35);
 const py=clamp(huntTarget.y+(huntTarget.vy||0)*lead,35,WORLD.h-35);
 const safe=!collides(px,py,P.r+5);
 return {x:safe?px:huntTarget.x,y:safe?py:huntTarget.y,label:"獲物を追う / △・Jで攻撃"};
}
function beginDeath(){
 if(!P||mode!=="play"||P.hp>0)return false;
 persistSquadVitals();
 if(P.squadIndividualId&&window.WildSquad){
  const next=window.WildSquad.kill(P.squadIndividualId);
  window.__wildSquadPendingLeader=!!next?.members?.length;
 }
 P.hp=0;deathSequenceTime=0;mode="dying";
 window.WildTrophies?.record?.("death",{reason:P.deathReason||"unknown"},notify);
 // Discard the dead run immediately, not after the shortened death fade; checkpoints stay intact.
 persistWorldChronicle();
 clearAutoSave();
 resetControls();P.deathPose=0;P.hidden=false;P.vx=0;P.vy=0;
 // A lethal hit cancels every attack/dash pose; the body must not keep striking or sprinting while falling.
 P.dash=0;P.dashTime=0;P.swing=0;P.atk=0;P.windup=0;P.rushActiveStep=0;
 P.rushQueued=false;P.rushWindow=0;P.abilityTime=0;P.chargeStrike=false;P.jumpDive=false;P.ambushStrike=false;
 P.jumpTime=0;P.pounceTime=0;P.fallTime=0;P.jumpHeight=P.groundZ||0;
 P.pendingStrike=false;P.strongWound=0;huntSlowUntil=0;objectiveBannerTime=0;
 // Clear the last hit effects before the quiet death sequence.
 shake=0;flash=0;popups.length=0;pounceStreaks.length=0;
 $("hunt-cinematic").classList.remove("show");
 $("objective-banner").classList.remove("visible");
 playEffect("death");window.WildAudio?.fadeForDeath?.();
 syncHUD(Math.floor(dayLightProfile(elapsed).hour));
 return true;
}
function advanceDeath(dt){
 if(mode!=="dying"||!P)return false;
 // Keep invalid deltas from poisoning the timer; low-FPS frames are handled by loop().
 const step=Number.isFinite(dt)?Math.max(0,dt):0;
 deathSequenceTime=Math.min(DEATH_SEQUENCE_SECONDS,deathSequenceTime+step);
 // 0.2 * 11 may round just below 2.2, delaying the result by another frame.
 if(deathSequenceTime>=DEATH_SEQUENCE_SECONDS-1e-6)deathSequenceTime=DEATH_SEQUENCE_SECONDS;
 P.deathPose=clamp(deathSequenceTime/.65,0,1);
 $("hud").style.opacity=String(1-.95*clamp((deathSequenceTime-.22)/1.30,0,1));
 if(deathSequenceTime>=DEATH_SEQUENCE_SECONDS)finish(false);
 return true;
}
function finish(won=false){
 if(!P||mode==="over"||mode==="clear")return;
 const deathAlreadyPlayed=mode==="dying";
 // The autosave was cleared when death began, exactly once.
 resetControls();mode=won?"clear":"over";
 totalScore=Math.floor(elapsed*4+kills*88+(P.level-1)*110+totalScore);
 const scoreRecord=recordTopScore(totalScore);
 $("result-kicker").textContent=won?"生存の記録":"SURVIVAL REPORT";
 $("result-title").textContent=won?"生き延びた！":"死んでしまった";
 $("result-title").style.color=won?"#a1edbe":"#f5ede0";
 $("result-reason").textContent=won?"生存記録を残しました。":"命を落としました。残る仲間がいれば引き継げます。";
 const partySurvivors=P.squadIndividualId?window.WildSquad?.load?.():null;
 $("retry-btn").textContent=partySurvivors?(partySurvivors.members.length?"仲間から新リーダーを選択":"新しいガチャ編成"):(getCheckpoints().some(s=>s.player.type===P.type)?"リトライ（同じ動物のチェックポイント）":"リトライ（同じ動物）");
 $("result-score").textContent=String(totalScore).padStart(6,"0");
 $("result-stats").innerHTML="<span>YEAR "+String(Math.floor(elapsed/120)).padStart(3,"0")+"</span><span>HUNT "+String(kills).padStart(2,"0")+"</span><span>LEVEL "+String(P.level).padStart(2,"0")+"</span>";
 renderTopScores(scoreRecord);
 if($("best-score"))$("best-score").textContent="BEST SCORE "+String(best).padStart(6,"0");
 $("squad-party-hud")?.classList.add("hidden");show("result");if(!won&&partySurvivors?.members?.length)showSquadDeathPicker(partySurvivors);
 else $("squad-death-choice")?.classList.add("hidden");
 if(!deathAlreadyPlayed)playEffect(won?"level":"death");
}
function clearStep(m,angle,step){
 const dx=Math.cos(angle),dy=Math.sin(angle);
 return !collides(m.x+dx*step*.45,m.y+dy*step*.45,m.r+4)&&!collides(m.x+dx*step,m.y+dy*step,m.r+4);
}
function chooseEscape(m,away,threat=P){
 const angles=[0,.44,-.44,.88,-.88,1.35,-1.35,1.9,-1.9,2.5,-2.5];
 let best=away,bestScore=-Infinity;
 // A blocked 78px sprint must not strand prey against a wall or canal bank.
 // Try shorter real routes, but favour the longest safe forward escape.
 for(const step of [78,44,24])for(const off of angles){
  const angle=away+off,x=m.x+Math.cos(angle)*step,y=m.y+Math.sin(angle)*step;
  if(!clearStep(m,angle,step))continue;
  const cover=visibleShrubCover()&&plants.some(p=>p.type===2&&Math.hypot(x-p.x,y-p.y)<p.r*.75)?1:0;
  const distance=threat?Math.hypot(x-threat.x,y-threat.y):0;
  const coverWeight=m.type==="rat"?3.3:m.type==="rabbit"?.5:.25;
  const forwardWeight=m.type==="rabbit"?3.3:m.type==="rat"?1.65:1.55;
  const sideStep=m.type==="pigeon"?Math.sin(off)*(m.evasionSide||1)*1.35:0;
  const score=Math.cos(off)*forwardWeight+distance*.003+cover*coverWeight+sideStep-Math.abs(off)*.1+step*.012;
  if(score>bestScore&&routeClear(m,{x,y},m.r)){bestScore=score;best=angle}
 }
 return best;
}
function startlePrey(m,threat,reason="alarm"){
 if(!m||m.hp<=0||!species[m.type]?.prey||!threat)return false;
 const away=Math.atan2(m.y-threat.y,m.x-threat.x);
 m.flee=Math.max(m.flee||0,reason==="hit"?2.6:2.15);
 m.fleeEnergy=Math.max(.42,m.fleeEnergy||0);
 m.evasionSide=-(m.evasionSide||1);
 m.dir=chooseEscape(m,away,threat);
 m.escapeTimer=.40;m.wander=0;m.navPath=null;
 m.restTime=0;m.resting=false;
 m.fleeThreatX=threat.x;m.fleeThreatY=threat.y;
 m.restCooldown=Math.max(m.restCooldown||0,11);
 m.restNeed=Math.min(Number.isFinite(m.restNeed)?m.restNeed:.6,.34);
 if(reason==="wake"&&P&&dist(P,m)<260)label(m.x,m.y-m.r-28,"目覚めた！","#ffe8ac");
 return true;
}
// A struck herd member warns nearby peaceful animals. Alarm spreads only one hop,
// with a per-animal cooldown and a hard budget; it never provokes the entire herd
// into attacking the player and never creates new wildlife.
const HERD_ALARM_FAMILIES=Object.freeze({
 deer:"grazer",serow:"grazer",zebra:"grazer",mountainGoat:"grazer",
 rabbit:"small",rat:"small",hedgehog:"small",armadillo:"small",
 pigeon:"bird",crow:"bird",frog:"wetland",carp:"wetland"
});
function alertNearbyPreyHerd(source,threat,reason="hit"){
 if(!source||!threat||!Array.isArray(mobs)||!Number.isFinite(elapsed))return 0;
 const family=HERD_ALARM_FAMILIES[source.type];
 if(!family||elapsed<(source.herdAlarmCooldown||0))return 0;
 source.herdAlarmCooldown=elapsed+3.5;
 const radius=family==="grazer"?230:family==="bird"?175:family==="wetland"?135:145;
 let warned=0;
 for(const other of mobs){
  if(warned>=5)break;
  if(other===source||other.hp<=0||other.companion||!species[other.type]?.prey||
     HERD_ALARM_FAMILIES[other.type]!==family||elapsed<(other.herdAlarmCooldown||0))continue;
  if(Math.hypot(other.x-source.x,other.y-source.y)>radius)continue;
  // Only alarm animals on the same side of walls; no impossible sound teleport.
  if(lineBlocked(source,other))continue;
  // Water animals must remain in their habitat; no land-based panic routing.
  if(other.type==="carp"&&waterDepth(other.x,other.y)<.035)continue;
  other.herdAlarmCooldown=elapsed+2.5;
  startlePrey(other,threat,"alarm");
  warned++;
 }
 return warned;
}
// Normally harmless wildlife becomes briefly defensive when the player hits it.
// The timer is only set by actual player damage; sight/noise never starts a chase.
const PREY_PROVOKE_SECONDS=Object.freeze({
 rat:4.5,rabbit:4.5,pigeon:4.2,crow:5.0,frog:3.5,snake:5.5,
 carp:3.8,armadillo:5.8,hedgehog:5.4,
 deer:7.2,serow:7.6,mountainGoat:7.8,zebra:7.5
});
function provokePreyAfterPlayerHit(m){
 const duration=PREY_PROVOKE_SECONDS[m.type]||6.0;
 const wasProvoked=elapsed<(m.provokedUntil||0);
 m.provokedUntil=Math.max(m.provokedUntil||0,elapsed+duration);
 m.counterFleeUntil=Math.max(m.counterFleeUntil||0,m.provokedUntil);
 m.provokedPauseUntil=Math.max(m.provokedPauseUntil||0,elapsed+.36);
 startlePrey(m,P,"hit"); // Initial flinch and evasive step before the charge.
 alertNearbyPreyHerd(m,P,"hit"); // Bystanders flee; only the struck animal retaliates.
 if(!wasProvoked)label(m.x,m.y-m.r-36,"反撃してくる！","#ffd39e");
}
function isProvokedPrey(m,sp,d){
 return !!sp?.prey&&m.hp>0&&elapsed<(m.provokedUntil||0)&&
  d<340&&(m.type!=="carp"||(waterDepth(P.x,P.y)>.035&&waterDepth(m.x,m.y)>.035));
}
// Wounded prey can strike backward while escaping. Most choose flight and only
// counter if the attacker stays close. No pursuit, teleport, or permanent aggro.
const PREY_WITH_OWN_DEFENSE=new Set(["mountainGoat","rat","rabbit","pigeon","crow","frog","snake","zebra","serow","deer"]);
function updateWoundedPreyDefense(m,sp,dt,d,spotted,angle){
 if(!sp?.prey||PREY_WITH_OWN_DEFENSE.has(m.type)||m.hp<=0)return;
 m.counterFleeCooldown=Math.max(0,(m.counterFleeCooldown||0)-dt);
 if(m.counterFleeArmed){
  // A stunned animal cannot execute a counterattack until it recovers.
  if(m.stun>0)return;
  m.counterFleeTell=Math.max(0,(m.counterFleeTell||0)-dt);
  if(m.counterFleeTell<=0){
   m.counterFleeArmed=false;
   m.swing=Math.max(m.swing||0,.24);
   const nearby=d<P.r+m.r+(m.type==="hedgehog"?24:38);
   const inWater=m.type!=="carp"||waterDepth(P.x,P.y)>.035;
   if(nearby&&inWater&&P.inv<=0&&(P.jumpHeight||0)<22&&!lineBlocked(m,P)){
    const base=m.type==="hedgehog"?4:m.type==="armadillo"?3:m.type==="carp"?2:Math.max(2,Math.round((sp.damage||2)*.46));
    const damage=Math.max(1,Math.round(base*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
    P.hp=Math.max(0,P.hp-damage);P.inv=.34;P.lastCombatAt=elapsed;
    shake=Math.max(shake,3);playEffect("damage");
    label(P.x,P.y-30,(m.type==="hedgehog"?"針の反撃":m.type==="armadillo"?"体当たり":m.type==="carp"?"尾びれの反撃":"逃走中の反撃")+" -"+damage,"#ffdbab");
   }else if(d<190)label(m.x,m.y-m.r-22,"反撃をかわした","#c4edcc");
   m.flee=Math.max(m.flee||0,1.6);
   m.dir=chooseEscape(m,angle+Math.PI,P);
  }
  return;
 }
 const recentlyStruck=elapsed<(m.counterFleeUntil||0)||elapsed<(m.provokedUntil||0);
 if(!recentlyStruck||!spotted||m.stun>0||m.counterFleeCooldown>0||(m.flee<=0&&!isProvokedPrey(m,sp,d))||
    d>P.r+m.r+(m.type==="hedgehog"?20:30)||P.inv>0||(m.type==="carp"&&waterDepth(P.x,P.y)<=.035))return;
 m.counterFleeArmed=true;
 m.counterFleeTell=m.type==="hedgehog"?.23:m.type==="carp"?.24:.30;
 m.counterFleeCooldown=m.type==="hedgehog"?3.0:3.8;
 m.swing=Math.max(m.swing||0,.12);
 label(m.x,m.y-m.r-23,m.type==="hedgehog"?"針を立てて反撃！":m.type==="armadillo"?"身を守りながら反撃！":"逃げながら反撃！","#ffdc9d");
}
// Prey lateral feints: real collision-checked movement, no teleport or invulnerability.
function advancePreyFeint(m,dt){
 const remaining=Math.max(0,m.feintRemaining||0),time=Math.max(0,m.feintTime||0);
 const travel=Math.min(remaining,Math.max(0,m.feintSpeed||0)*Math.min(dt,time));
 const steps=Math.max(1,Math.ceil(travel/7)),piece=travel/steps,angle=m.feintAngle||0;
 const ox=m.x,oy=m.y;
 for(let i=0;i<steps;i++){
  const x=m.x,y=m.y;
  move(m,Math.cos(angle)*piece,Math.sin(angle)*piece);
  if(Math.hypot(m.x-x,m.y-y)<piece*.45){m.feintTime=0;break}
 }
 const moved=Math.hypot(m.x-ox,m.y-oy);
 m.feintRemaining=Math.max(0,remaining-moved);
 m.feintTime=m.feintRemaining<.5?0:Math.max(0,m.feintTime-dt);
 m.vx=(m.x-ox)/Math.max(.001,dt);m.vy=(m.y-oy)/Math.max(.001,dt);
 m.step=(m.step||0)+moved*.05;m.flee=Math.max(m.flee,.45);
 return true;
}
function tryPreyFeint(m,sp,d,spotted,dt){
 if(!sp.prey)return false;
 m.feintCooldown=Math.max(0,(m.feintCooldown||0)-dt);
 if((m.feintTime||0)>0){
  if(m.stun>0||m.hp<=0){m.feintTime=0;return false}
  return advancePreyFeint(m,dt);
 }
 if(m.feintCooldown>0||m.stun>0||m.hp<=0||m.flee<=0||(m.fleeEnergy||0)<.28||m.defenseArmed||m.headbuttArmed||m.cornerArmed||m.counterFleeArmed)return false;
 const hunter=nearbyAwareWildPredator(m,150);
 const playerThreat=!!P&&spotted&&d<160&&!lineBlocked(m,P);
 if(!hunter&&!playerThreat)return false;
 const urgent=playerThreat&&(P.pendingStrike||P.pounceTime>0||P.jumpTime>0);
 const chance=Math.min(.11,dt*(urgent?(m.type==="rabbit"?1.55:m.type==="pigeon"?1.1:.82):(m.type==="rabbit"?.82:m.type==="pigeon"?.70:.64)));
 if(Math.random()>=chance)return false;
 m.feintCooldown=4.1+rnd(0,1.8);
 const threat=playerThreat?P:hunter,away=Math.atan2(m.y-threat.y,m.x-threat.x);
 const side=m.evasionSide||1,travel=m.type==="rabbit"?62:m.type==="rat"?40:48;
 for(const offset of [side*1.23,-side*1.23,side*.77,-side*.77]){
  const angle=away+offset,goal={x:m.x+Math.cos(angle)*travel,y:m.y+Math.sin(angle)*travel};
  if(collides(goal.x,goal.y,m.r+3)||!routeClear(m,goal,m.r+3))continue;
  m.feintAngle=angle;m.feintTime=.24;m.feintRemaining=travel;m.feintSpeed=travel/.24;
  m.fleeEnergy=Math.max(0,m.fleeEnergy-.25);m.evasionSide=-side;m.navPath=null;m.dir=angle;
  if(d<340)label(m.x,m.y-m.r-27,"フェイント！","#d7f3c6");
  return advancePreyFeint(m,dt);
 }
 return false;
}
// One dodge roll per cooldown, with species-specific agility. Huge herbivores
// do not side-hop like cats; elite agile predators still retain dangerous moves.
const WILD_EMERGENCY_EVASION=Object.freeze({
 strayCat:.24,wildFox:.14,weasel:.27,raccoonDog:.12,venomSnake:.15,dog:.33,
 cheetah:.31,lion:.20,tiger:.24,giraffe:.04,elephant:.02,hippo:.02,
 macaque:.25,chimpanzee:.22,blackBear:.07,gorilla:.09,
 hyena:.19,wildDog:.27,tanuki:.12,badger:.10,otter:.23,
 alpha:.49,oneEyedWolf:.39,albinoWolf:.65,blackPanther:.32,
 whiteTiger:.38,giantElephant:.02,giantGorilla:.06,rhino:.025,
 giantMoose:.05,giantBuffalo:.04,giantBoar:.07,oldBear:.09
});
function tryEnemyEmergencyEvade(m,sp,d,spotted){
 if(sp.prey||!spotted||!P||!P.pendingStrike||P.ambushStrike||m.hp<=0||
    m.stun>0||m.windup>0||m.chargeTime>0||(m.evadeTime||0)>0||(m.evadeCooldown||0)>0)return false;
 const range=P.pounceTime>0?210:Math.min(155,P.r+m.r+111);
 if(d>range||lineBlocked(m,P)||Math.cos(Math.atan2(m.y-P.y,m.x-P.x)-P.dir)<.38)return false;
 m.evadeCooldown=m.type==="wildFox"?2.2:1.4; // Failed evasions also incur recovery.
 if(Math.random()>=(WILD_EMERGENCY_EVASION[m.type]??(m.strongBoss?.35:.20)))return false;
 const away=Math.atan2(m.y-P.y,m.x-P.x),side=m.evasionSide||1;
 const travel=m.type==="boar"?58:m.type==="alpha"?74:m.type==="albinoWolf"?98:67;
 for(const offset of [side*1.26,-side*1.26,side*.75,-side*.75]){
  const angle=away+offset,goal={x:m.x+Math.cos(angle)*travel,y:m.y+Math.sin(angle)*travel};
  if(collides(goal.x,goal.y,m.r+3)||!routeClear(m,goal,m.r+3))continue;
  m.evadeAngle=angle;m.evadeTime=.29;m.evadeDuration=.29;
  m.evadeRemaining=travel;m.evadeSpeed=travel/.29;
  m.evadeCooldown=(m.type==="albinoWolf"?3.1:m.type==="wildFox"?5.2:4.0)+rnd(0,1.2);m.evasionSide=-side;
  m.windup=0;m.chargeTime=0;m.sheltered=false;m.shelterX=null;m.shelterY=null;m.shelterDoorX=null;m.shelterDoorY=null;m.shelterPhase=0;
  m.navPath=null;m.attack=Math.max(m.attack,.45);m.alert=Math.max(m.alert,2);
  m.dir=angle;label(m.x,m.y-m.r-29,"飛び逃げ！","#e4ffbc");
  playEffect("jump",{volume:.14});
  return true;
 }
 return false;
}
function advanceEnemyEvade(m,dt){
 const duration=Math.max(.01,m.evadeDuration||.29),time=Math.max(0,m.evadeTime||0);
 const travel=Math.min(Math.max(0,m.evadeRemaining||0),Math.max(0,m.evadeSpeed||0)*Math.min(dt,time));
 const ox=m.x,oy=m.y,steps=Math.max(1,Math.ceil(travel/7)),angle=m.evadeAngle||0;
 let blocked=false;
 for(let i=0;i<steps;i++){
  const x=m.x,y=m.y;
  move(m,Math.cos(angle)*travel/steps,Math.sin(angle)*travel/steps);
  if(Math.hypot(m.x-x,m.y-y)<travel/steps*.5){blocked=true;break;}
 }
 const moved=Math.hypot(m.x-ox,m.y-oy);
 m.evadeRemaining=Math.max(0,(m.evadeRemaining||0)-moved);
 m.evadeTime=blocked||m.evadeRemaining<.5?0:Math.max(0,time-dt);
 m.evadeHeight=m.evadeTime>0?Math.max(0,Math.sin(Math.PI*(1-m.evadeTime/duration))*19):0;
 m.vx=(m.x-ox)/Math.max(.001,dt);m.vy=(m.y-oy)/Math.max(.001,dt);
 m.step=(m.step||0)+moved*.05;
}
// Wild predators intercept moving prey from a flank, but never route through walls.
function wildPreyInterceptPoint(m,prey,sp,distance){
 const direct={x:prey.x,y:prey.y};
 const cave=MOUNTAIN?.zone(m.x)==="cave"&&MOUNTAIN.zone(prey.x)==="cave";
 const caveHunter=cave&&["weasel","wildFox","raccoonDog"].includes(m.type);
 // Calm prey can be approached from downwind. This is an actual walkable
 // waypoint, not teleportation; pursuit reverts to direct chase on alarm.
 if(!cave&&distance>125&&distance<255&&(prey.flee||0)<=0){
  const current=Math.cos(Math.atan2(m.y-prey.y,m.x-prey.x)-windDirection);
  if(current<.20){
   const lead=clamp(distance*.40,64,102);
   const x=clamp(prey.x+Math.cos(windDirection)*lead,35,WORLD.w-35);
   const y=clamp(prey.y+Math.sin(windDirection)*lead,35,WORLD.h-35);
   if(Math.hypot(x-m.x,y-m.y)>55&&!collides(x,y,m.r+5)&&routeClear(m,{x,y},m.r+5))
    return {x,y};
  }
 }
 const flanker=["dog","alpha","blackPanther","oneEyedWolf","whiteTiger","albinoWolf"].includes(m.type);
 if((!flanker&&!caveHunter)||distance<(caveHunter?48:115)||distance>(caveHunter?325:235)||(prey.flee||0)<=0)return direct;
 const speed=Math.hypot(prey.vx||0,prey.vy||0);
 const heading=speed>38?Math.atan2(prey.vy,prey.vx):prey.dir;
 if(!Number.isFinite(heading))return direct;
 const lead=clamp(distance/(sp.speed+100),.18,caveHunter?.34:.45);
 const forward=clamp(speed*lead,caveHunter?12:25,caveHunter?48:65);
 const sideOffset=caveHunter?clamp(distance*.13,12,32):clamp(distance*.27,35,58);
 const preferred=m.flankSide||1;
 for(const side of [preferred,-preferred]){
  const x=clamp(prey.x+Math.cos(heading)*forward-Math.sin(heading)*side*sideOffset,35,WORLD.w-35);
  const y=clamp(prey.y+Math.sin(heading)*forward+Math.cos(heading)*side*sideOffset,35,WORLD.h-35);
  if((!caveHunter||MOUNTAIN.zone(x)==="cave")&&!collides(x,y,m.r+5)&&
     routeClear(m,{x,y},m.r+5))return {x,y};
 }
 return direct;
}
/* WILD-PREDATOR-CHAIN-V1: Strong predators share real prey, escape, collision and corpse ecology.
 * Giant boars remain grazers. A wild kill never grants player DNA or trophies. */
const WILD_PREDATOR_TYPES=new Set(["strayCat","wildFox","weasel","raccoonDog","cheetah","lion","venomSnake","snake","giantLizard","dog","alpha","giantSnake","oldBear","blackPanther","oneEyedWolf","whiteTiger","giantHyena","giantLion","giantCrocodile","giantHippo","giantAnaconda","albinoWolf","giantEagle","macaque","chimpanzee"]);
const WILD_DIETS={
 lion:["deer","zebra","boar","serow","mountainGoat"],
 cheetah:["rabbit","deer","serow","mountainGoat"],
 dog:["rabbit","rat","deer","boar"],
 alpha:["deer","boar","rabbit","zebra","serow"],
 wildFox:["rat","rabbit","pigeon","crow","frog","weasel"],
 strayCat:["rat","pigeon","crow","rabbit","frog"],
 weasel:["rat","rabbit","frog"],
 snake:["rat","frog","rabbit"],
 venomSnake:["rat","frog","rabbit"],
 raccoonDog:["rat","rabbit","frog","pigeon"],
 blackPanther:["deer","boar","zebra","serow"],
 oneEyedWolf:["deer","boar","rabbit","zebra"],
 albinoWolf:["deer","boar","rabbit","serow"],
 whiteTiger:["deer","boar","zebra","serow"],
 oldBear:["deer","boar","rabbit","rat"],
 giantLion:["deer","zebra","boar","serow"],
 giantHyena:["deer","zebra","boar","rabbit"],
 giantLizard:["rabbit","rat","boar"],
 giantSnake:["rabbit","rat","deer"],
 macaque:["rat","frog","pigeon"],
 chimpanzee:["rat","rabbit","frog"]
};
const WILD_FORAGERS=new Set(["serow","mountainGoat","rat","rabbit","pigeon","crow","frog","deer","zebra","giraffe","elephant","hippo","boar","giantBoar","giantMoose","giantBuffalo","rhino","giantGorilla","giantElephant","macaque","chimpanzee"]);
function isWildPredator(m){return !!m&&m.hp>0&&!m.companion&&WILD_PREDATOR_TYPES.has(m.type);}
function nearbyVisibleWildPredator(m,range=165){
 let nearest=null,best=range;
 for(const q of mobs){if(q===m||!isWildPredator(q)||((m.type==="macaque"||m.type==="chimpanzee")&&q.type===m.type))continue;const d=dist(m,q);if(d<best&&!lineBlocked(m,q)){nearest=q;best=d;}}
 return nearest;
}
// NPC scent uses the same saved wind and weather as player stealth.
// Smell may pass a wall, but movement and every attack still use collision/LOS.
function nearbyAwareWildPredator(m,range=165){
 let nearest=null,best=range;
 for(const q of mobs){
  if(q===m||!isWildPredator(q)||((m.type==="macaque"||m.type==="chimpanzee")&&q.type===m.type))continue;
  const d=dist(m,q);
  if(d>=best)continue;
  const visible=!lineBlocked(m,q);
  const smelled=d<Math.min(range,scentReachTo(m,q)*1.5);
  if(visible||smelled){nearest=q;best=d;}
 }
 return nearest;
}
function defendBuffaloHerd(m){
 if(m.type!=="giantBuffalo"||(m.wildAttack||0)>0||m.hp<=0)return false;
 const q=mobs.find(q=>q!==m&&isWildPredator(q)&&dist(m,q)<m.r+q.r+35&&!lineBlocked(m,q));
 if(!q)return false;
 m.wildAttack=2.3;m.swing=.22;m.dir=Math.atan2(q.y-m.y,q.x-m.x);
 q.hp=Math.max(0,q.hp-22);q.stun=Math.max(q.stun||0,.65);q.flee=Math.max(q.flee||0,1.1);
 if(q.hp<=0)carcasses.push(animalRemains(q));
 for(const v of mobs)if(v!==m&&v.hp>0&&v.type==="boar"&&dist(m,v)<195){v.flee=Math.max(v.flee||0,1.6);v.fleeThreatX=q.x;v.fleeThreatY=q.y;}
 if(P&&dist(P,m)<390)label(m.x,m.y-m.r-28,"群れを守る角突き！","#ffcf96");
 return true;
}
function huntWildPrey(m,sp,spotted,playerDistance){
 if(!isWildPredator(m)||(m.feedAfterKill||0)>0||spotted||(m.alert||0)>0||(m.flee||0)>0||
    (m.windup||0)>0||(m.chargeTime||0)>0||(m.stun||0)>0||
    (m.evadeTime||0)>0){
  m.wildTargetX=null;m.wildTargetY=null;m.wildTargetAt=-1;
  return null;
 } // Inactive hunters must not reserve stale prey.
 const caveScent=MOUNTAIN?.zone(m.x)==="cave";
 const diet=WILD_DIETS[m.type]||null;
 const maxRangeBase=["strayCat","weasel","snake","venomSnake","macaque","chimpanzee"].includes(m.type)?165:m.type==="cheetah"?360:m.type==="lion"?320:m.type==="wildFox"?215:m.type==="albinoWolf"?335:m.type==="giantLizard"?285:m.type==="giantLion"?345:m.type==="blackPanther"?320:m.type==="oneEyedWolf"?315:m.type==="whiteTiger"?335:m.type==="giantHyena"?355:m.type==="giantSnake"?215:m.type==="oldBear"?255:250;
 const maxRange=caveScent?Math.max(330,maxRangeBase):maxRangeBase;
 let prey=null,best=maxRange,bestScore=Infinity;
 for(const q of mobs){
  if(q===m||q.hp<=0||!(species[q.type]?.prey||(q.type==="boar"&&m.type!=="giantSnake"))||(diet&&!diet.includes(q.type)))continue;
  if(!diet&&["strayCat","wildFox","weasel","snake","venomSnake","raccoonDog","macaque","chimpanzee"].includes(m.type)){
   const smallPrey=["rat","frog","pigeon","crow","weasel"];
   if(["wildFox","weasel","raccoonDog"].includes(m.type))smallPrey.push("rabbit"); // Cave mammal predators can hunt cave rabbits.
   if(!smallPrey.includes(q.type))continue;
  }
  const distance=dist(m,q);
  // Scent can cross a pillar; the existing bite check still needs clear LOS.
  const caveTrail=caveScent&&MOUNTAIN.zone(q.x)==="cave"&&distance<=325;
  const windTrail=distance<=Math.min(maxRange,scentReachTo(m,q)*1.65);
  if(distance>=maxRange||!(caveTrail||windTrail||!lineBlocked(m,q)))continue;
  // Nearby cave hunters split live prey instead of crowding one target.
  // Last target coordinates already serialize safely in SAVE_SCHEMA2.
  let claimed=0;
  if(caveScent)for(const h of mobs){
   if(h===m||h.hp<=0||!isWildPredator(h)||(h.alert||0)>0||
      (h.feedAfterKill||0)>0||!Number.isFinite(h.wildTargetAt)||
      elapsed-h.wildTargetAt>1.2||dist(h,q)>235||
      !Number.isFinite(h.wildTargetX)||!Number.isFinite(h.wildTargetY))continue;
   if(Math.hypot(h.wildTargetX-q.x,h.wildTargetY-q.y)<Math.max(28,q.r+15))claimed++;
   if(claimed>=2)break;
  }
  // Maintain a moving target without switching between nearby prey.
  // Existing target coordinates and timestamp are SAVE_SCHEMA2-compatible.
  const tracked=Number.isFinite(m.wildTargetAt)&&elapsed-m.wildTargetAt<.8&&
   Number.isFinite(m.wildTargetX)&&Number.isFinite(m.wildTargetY)&&
   Math.hypot(m.wildTargetX-q.x,m.wildTargetY-q.y)<Math.max(36,q.r+sp.speed*.30);
  const chosenDiet=diet?Math.max(0,diet.indexOf(q.type)):0;
  const score=distance+chosenDiet*17+claimed*68-(tracked?Math.min(65,38+distance*.07):0);
  if(score<bestScore){bestScore=score;best=distance;prey=q;}
 }
 if(!prey){m.wildTargetX=null;m.wildTargetY=null;m.wildTargetAt=-1;return null;}
 if(best<220&&(prey.flee||0)<=0&&species[prey.type]?.prey)startlePrey(prey,m,"alarm");
 // Lions and cheetahs have brief high-speed bursts, not permanent max-speed cruising.
 m.huntSprintLeft=Math.max(0,(m.huntSprintLeft||0));
 m.huntSprintCooldown=Math.max(0,(m.huntSprintCooldown||0));
 if(["lion","cheetah","wildFox"].includes(m.type)&&best<260&&best>m.r+prey.r+25&&m.huntSprintCooldown<=0){
  m.huntSprintLeft=m.type==="lion"?1.7:m.type==="cheetah"?1.25:1.15;
  m.huntSprintCooldown=m.type==="lion"?6:m.type==="cheetah"?6.5:5;
  if(P&&dist(P,m)<380)label(m.x,m.y-m.r-34,m.type==="lion"?"獅子の短距離加速！":m.type==="cheetah"?"チーターの疾走！":"狐の跳躍！","#fbd6a1");
 }
 const intercept=wildPreyInterceptPoint(m,prey,sp,best);
 m.dir=steerPursuit(m,intercept.x,intercept.y);
 m.wildTargetX=prey.x;m.wildTargetY=prey.y;m.wildTargetAt=elapsed;
 if(best<m.r+prey.r+20&&(m.wildAttack||0)<=0&&!lineBlocked(m,prey)){
  m.wildAttack=["strayCat","weasel","snake","venomSnake"].includes(m.type)?2.1:m.type==="wildFox"?1.7:m.type==="albinoWolf"?1.38:m.type==="blackPanther"?1.35:m.type==="whiteTiger"?1.4:m.type==="giantLion"?1.55:m.type==="giantHyena"?1.2:m.type==="oneEyedWolf"?1.65:m.type==="giantSnake"?2.1:m.type==="oldBear"?2.0:m.type==="giantLizard"?1.45:m.type==="dog"?1.6:1.8;
  const bite=["strayCat","wildFox","weasel","snake","venomSnake","raccoonDog"].includes(m.type)?Math.max(2,Math.round(sp.damage*.70)):m.type==="dog"?Math.max(2,Math.round(sp.damage*.22)):
   m.type==="alpha"?Math.max(5,Math.round(sp.damage*.45)):
   Math.max(6,Math.round(sp.damage*(m.type==="albinoWolf"?.42:m.type==="oldBear"?.32:m.type==="giantSnake"?.35:.38)));
  prey.hp=Math.max(0,prey.hp-bite);
  // A cornered larger grazer can counter a predator. Damage is real and cooldown-limited.
  if(prey.hp>0&&["boar","deer","zebra","serow","mountainGoat"].includes(prey.type)&&
     (prey.attack||0)<=0&&!lineBlocked(prey,m)){
   const guard=prey.type==="boar"?18:prey.type==="zebra"?15:prey.type==="mountainGoat"?13:prey.type==="serow"?11:8;
   m.hp=Math.max(0,m.hp-guard);prey.attack=2.8;prey.swing=.26;
   m.stun=Math.max(m.stun||0,.21);m.flee=Math.max(m.flee||0,.24);
   if(P&&dist(P,prey)<380)label(prey.x,prey.y-prey.r-24,"反撃！ -"+guard,"#f6d8a7");
   if(m.hp<=0){carcasses.push(animalRemains(m));m.wildTargetX=null;m.wildTargetY=null;m.wildTargetAt=-1;}
  }
  prey.flash=Math.max(prey.flash||0,.18);m.swing=Math.max(m.swing||0,.18);
  if(prey.hp>0){
   if(!startlePrey(prey,m,"hit")){prey.flee=1.8;prey.dir=Math.atan2(prey.y-m.y,prey.x-m.x);}
  }else{
   carcasses.push(animalRemains(prey));
   m.wildTargetX=null;m.wildTargetY=null;m.wildTargetAt=-1;
   m.feedAfterKill=8;m.scavengeNeed=Math.max(.82,Number(m.scavengeNeed)||0);
   if(species[prey.type].prey){
    const zone=regionAt(prey.x,prey.y);
    ecology[zone].prey=Math.max(4,ecology[zone].prey-1);
   }
  }
  if(P&&dist(P,m)<380)label(prey.x,prey.y-prey.r-20,prey.hp>0?"野生の狩り -"+bite:"野生の狩り","#eac6a1");
 }
 if(m.hp<=0)return null;
 const sprint=(m.huntSprintLeft||0)>0?(m.type==="lion"?1.36:m.type==="cheetah"?1.42:1.14):1;
 const pace=m.type==="lion"?.91:m.type==="cheetah"?.90:m.type==="albinoWolf"?.99:m.type==="blackPanther"?.92:m.type==="whiteTiger"?.95:m.type==="giantLion"?.90:m.type==="giantHyena"?.98:m.type==="oneEyedWolf"?.91:m.type==="giantSnake"?.76:.75;
 return {vx:Math.cos(m.dir)*sp.speed*pace*sprint,vy:Math.sin(m.dir)*sp.speed*pace*sprint};
}
// Choose a real road bridge before generic A* when wildlife crosses open water.
function wildlifeBridgeWaypoint(m,goal){
 let best=null;
 const consider=(near,far)=>{
  if(collides(near.x,near.y,m.r+4)||collides(far.x,far.y,m.r+4)||!routeClear(near,far,m.r))return;
  const farVisible=routeClear(m,far,m.r);
  if(!farVisible&&!routeClear(m,near,m.r))return;
  const cost=dist(m,near)+dist(near,far)+dist(far,goal);
  if(!best||cost<best.cost)best={point:farVisible?far:near,cost};
 };
 if(m.y>=0&&m.y<2600&&goal.y>=0&&goal.y<2600){
  const side=Math.sign(m.x-riverAxis(m.y)),other=Math.sign(goal.x-riverAxis(goal.y));
  if(side&&side===-other&&Math.abs(goal.x-riverAxis(goal.y))>133){
   for(const y of roadsY){if(y>=2600)continue;
    const axis=riverAxis(y),offset=133+m.r+24;
    consider({x:axis+side*offset,y},{x:axis-side*offset,y});
   }
  }
 }
 if(m.x>=5600&&m.x<8400&&goal.x>=5600&&goal.x<8400&&m.y>=2600&&goal.y>=2600){
  const side=Math.sign(m.y-canalAxis(m.x)),other=Math.sign(goal.y-canalAxis(goal.x));
  if(side&&side===-other&&Math.abs(goal.y-canalAxis(goal.x))>100){
   for(const x of roadsX){if(x<5600||x>=8400)continue;
    const axis=canalAxis(x),offset=100+m.r+24;
    consider({x,y:axis+side*offset},{x,y:axis-side*offset});
   }
  }
 }
 return best?.point||null;
}
// Small cave-only path graph follows real stone collision without rebuilding
// the full world grid for every NPC hunting or scavenging behind a pillar.
function caveWildlifePath(m,goal){
 if(!MOUNTAIN?.cave||m.r>34||MOUNTAIN.zone(m.x)!=="cave"||MOUNTAIN.zone(goal.x)!=="cave")return null;
 const {start,end}=MOUNTAIN.cave,anchors=[];
 for(let x=start+24;x<end;x+=38){const p={x,y:MOUNTAIN.center(x)};if(!collides(p.x,p.y,m.r+5))anchors.push(p);}
 const starts=[],ends=[];
 for(let i=0;i<anchors.length;i++){
  const p=anchors[i];if(routeClear(m,p,m.r))starts.push({i,cost:dist(m,p)});
  if(routeClear(p,goal,m.r))ends.push({i,cost:dist(p,goal)});
 }
 let best=null,bestCost=Infinity;
 for(const a of starts)for(const b of ends){
  const cost=a.cost+b.cost+Math.abs(a.i-b.i)*40;
  if(cost<bestCost){bestCost=cost;best={a:a.i,b:b.i};}
 }
 if(!best)return null;
 const path=[],step=best.a<=best.b?1:-1;
 for(let i=best.a;;i+=step){path.push(anchors[i]);if(i===best.b)break;}
 for(let i=1;i<path.length;i++)if(!routeClear(path[i-1],path[i],m.r))return null;
 return path.concat([{x:goal.x,y:goal.y}]);
}
function steerPursuit(m,tx,ty){
 const goal={x:tx,y:ty},desired=Math.atan2(ty-m.y,tx-m.x),distance=dist(m,goal);
 const look=clamp(distance*.45,42,94);
 const caveChase=MOUNTAIN?.zone(m.x)==="cave"&&MOUNTAIN.zone(tx)==="cave";
 if(caveChase&&distance>60){
  // Replan if a pillar blocks progress; never teleport an animal.
  if(!Number.isFinite(m.navProbeAt)||elapsed-m.navProbeAt>=.72){
   if(Number.isFinite(m.navProbeAt)&&
      Math.hypot(m.x-m.navProbeX,m.y-m.navProbeY)<9&&!routeClear(m,goal,m.r)){
    m.navPath=null;m.navIndex=0;m.navRetry=0;m.avoidSide=-(m.avoidSide||1);
   }
   m.navProbeAt=elapsed;m.navProbeX=m.x;m.navProbeY=m.y;
  }
 }else m.navProbeAt=-1;
 if(routeClear(m,goal,m.r)){m.navPath=null;return desired}
 const bridge=wildlifeBridgeWaypoint(m,goal);
 if(bridge){m.navPath=null;return Math.atan2(bridge.y-m.y,bridge.x-m.x)}
 const stale=!m.navGoal||dist(m.navGoal,goal)>70;
 if((stale||!m.navPath||m.navIndex>=m.navPath.length)&&elapsed>=(m.navRetry||0)&&navPlansThisFrame<2){
   navPlansThisFrame++;
  m.navPath=caveWildlifePath(m,goal)||routeTo(goal,m);m.navGoal={x:tx,y:ty};m.navIndex=0;
  m.navRetry=elapsed+(caveChase?.48:1.05);
 }
 if(m.navPath&&m.navPath.length){
  while(m.navIndex<m.navPath.length-1&&dist(m,m.navPath[m.navIndex])<30&&
   routeClear(m,m.navPath[m.navIndex+1],m.r))m.navIndex++;
  const next=m.navPath[m.navIndex];
  if(next&&routeClear(m,next,m.r))return Math.atan2(next.y-m.y,next.x-m.x);
 }
 if(!m.avoidSide)m.avoidSide=((Math.floor(m.x/90)+Math.floor(m.y/90))%2?1:-1);
 let best=null,bestScore=-Infinity;
 for(const offset of [.42,.82,1.22,1.65,2.12]){
  for(const side of [m.avoidSide,-m.avoidSide]){
   const angle=desired+offset*side;
   if(!clearStep(m,angle,look))continue;
   const score=Math.cos(offset)*2.4+(side===m.avoidSide?.38:0);
   if(score>bestScore){bestScore=score;best=angle}
  }
 }
 if(best!==null){m.avoidSide=Math.sign(Math.atan2(Math.sin(best-desired),Math.cos(best-desired)))||m.avoidSide;return best}
 return desired+Math.PI*.65*m.avoidSide;
}
const WEATHER_NAMES={CLEAR:"晴れ",CLOUDY:"曇り",RAIN:"雨",THUNDER:"雷雨",FOG:"霧",WIND:"強風",SNOW:"雪"};
function currentSnowpack(){return window.WildWorldClock?.snowpackAt?.(elapsed)||0;}
/* JMA Tokyo monthly normal days with >=1.0 mm precipitation (1991-2020).
 * A game DAY samples a stable Tokyo-style climate day; rainfall occupies a
 * short episode of the day rather than making every wet day rain constantly.
 * The 365-day climate calendar repeats independently of future YEAR mechanics.
 * Reference: JMA Tokyo station 47662 nml_sfc_ym 1991-2020.
 */
const TOKYO_MONTH_LENGTHS=[31,28,31,30,31,30,31,31,30,31,30,31];
const TOKYO_RAIN_DAYS=[4.5,5.2,9.2,9.5,10.1,11.6,10.5,7.9,11.0,10.5,7.4,5.2];
const tokyoRainCache=new Map();
function climateHash(year,month,day,salt=0){
 let n=Math.imul(year+1,374761393)^Math.imul(month+1,668265263)^
       Math.imul(day+1,1274126177)^Math.imul(salt+1,2246822519);
 n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;
 return (n>>>0)/4294967296;
}
function tokyoCalendarDay(gameDay){
 const year=Math.floor((gameDay-1)/365);
 let remaining=(gameDay-1)%365,month=0;
 while(month<11&&remaining>=TOKYO_MONTH_LENGTHS[month])remaining-=TOKYO_MONTH_LENGTHS[month++];
 return {year,month,day:remaining+1};
}
function tokyoRainCalendar(year,month){
 const key=year*12+month;
 if(tokyoRainCache.has(key))return tokyoRainCache.get(key);
 const days=TOKYO_MONTH_LENGTHS[month],normal=TOKYO_RAIN_DAYS[month];
 const count=Math.floor(normal)+(climateHash(year,month,40,1)<normal%1?1:0);
 const ranked=Array.from({length:days},(_,i)=>({i,rank:climateHash(year,month,i+1,2)}))
  .sort((a,b)=>a.rank-b.rank);
 const result=new Uint8Array(days);
 for(let j=0;j<count;j++)result[ranked[j].i]=1;
 if(tokyoRainCache.size>36)tokyoRainCache.clear();
 tokyoRainCache.set(key,result);
 return result;
}
function tokyoWeatherAt(seconds){
 const clockWeather=window.WildWorldClock?.weatherAt?.(seconds);
 if(clockWeather)return clockWeather;
 const absoluteDay=1+Math.floor(Math.max(0,seconds)/85);
 const {year,month,day:dayOfMonth}=tokyoCalendarDay(absoluteDay);
 const phase=((seconds%85)+85)%85/85;
 const wet=tokyoRainCalendar(year,month)[dayOfMonth-1]===1;
 const roll=climateHash(year,month,dayOfMonth,5);
 const fair=roll<.67?"CLEAR":roll<.89?"CLOUDY":roll<.965?"WIND":"FOG";
 if(!wet)return fair;
 const start=.16+climateHash(year,month,dayOfMonth,7)*.39;
 const end=Math.min(.94,start+.14+climateHash(year,month,dayOfMonth,8)*.20);
 if(phase>=start&&phase<end){
  const thunderRate=month>=5&&month<=9?.10:.022;
  return climateHash(year,month,dayOfMonth,9)<thunderRate?"THUNDER":"RAIN";
 }
 if(phase>=start-.10&&phase<end+.10)return "CLOUDY";
 return roll<.70?"CLOUDY":"CLEAR";
}
// Old SAVE_SCHEMA2 worlds can still contain many groups from the previous
// aggressive spawn settings. Disband surplus groups without deleting visible
// animals, and gradually retire only unseen, unengaged surplus wildlife.
function easeOldOvercrowding(){
 if(!P)return;
 const groups=new Map();
 for(const m of mobs){
  if(!m.packId||m.hp<=0)continue;
  const distance=dist(P,m);
  if(distance>950)continue;
  groups.set(m.packId,Math.min(groups.get(m.packId)??Infinity,distance));
 }
 if(groups.size>1){
  const keep=[...groups].sort((a,b)=>a[1]-b[1])[0][0];
  for(const m of mobs)if(m.packId&&groups.has(m.packId)&&m.packId!==keep){
   delete m.packId;delete m.packOrder; // Existing animal stays and behaves independently.
  }
 }
 let nearCount=mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius).length;
 let excessNearby=Math.max(0,nearCount-WILDLIFE.localCap);
 let excessWorld=Math.max(0,mobs.length-WILDLIFE.cap);
 if(!excessNearby&&!excessWorld)return;
 const candidates=mobs.filter(m=>{
  if(m.hp<=0||m.strongBoss||Object.prototype.hasOwnProperty.call(STRONG_NAMES,m.type))return false;
  const d=dist(P,m);
  if(d<365||visible(m.x,m.y,75)||m.alert>0||m.windup>0||m.chargeTime>0||m.flee>0)return false;
  if(mission===2&&species[m.type]?.prey&&d<WILDLIFE.preyNeedRadius)return false;
  return (excessNearby>0&&d<WILDLIFE.localRadius)||(excessWorld>0&&d>Math.max(800,WILDLIFE.localRadius));
 }).sort((a,b)=>dist(P,b)-dist(P,a));
 let retired=0;
 for(const m of candidates){
  if(retired>=2)break;
  const d=dist(P,m);
  if(d<WILDLIFE.localRadius&&excessNearby>0){excessNearby--;excessWorld=Math.max(0,excessWorld-1);}
  else if(d>Math.max(800,WILDLIFE.localRadius)&&excessWorld>0)excessWorld--;
  else continue;
  const i=mobs.indexOf(m);if(i<0)continue;
  mobs.splice(i,1);retired++;
 }
}
// Replenish reachable predators near the player, including waterfront and old-save starts.
// When an old save fills all nine nearby slots with prey, a calm off-camera animal
// may migrate away to make room for a predator. Visible/engaged animals are never removed.
function migrateUnseenLocalPreyForPredator(){
 if(!P)return false;
 const prey=mobs.filter(m=>m.hp>0&&!m.companion&&species[m.type]?.prey&&dist(P,m)<WILDLIFE.localRadius);
 if(prey.length<3)return false;
 const candidate=prey.filter(m=>dist(P,m)>340&&!visible(m.x,m.y,85)&&
  (m.alert||0)<=0&&(m.flee||0)<=0&&(m.windup||0)<=0&&(m.stun||0)<=0)
  .sort((a,b)=>dist(P,b)-dist(P,a))[0];
 if(!candidate)return false;
 mobs.splice(mobs.indexOf(candidate),1);
 return true;
}

// Respect local/global caps, den safety, real collision, water and regional habitat.
function ensureLocalPredators(target=1){
 if(!P||mountainHabitat(P.x,P.y))return 0;
 const region=regionAt(P.x,P.y);
 const pool=region===7?["strayCat","dog","venomSnake","raccoonDog"]:
  region===5?["wildFox","raccoonDog","strayCat"]:region===4?["dog","strayCat","venomSnake"]:
  region===6?["dog","strayCat","raccoonDog"]:["strayCat","dog","wildFox"];
 const localAnimals=()=>mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius);
 const predators=()=>localAnimals().filter(m=>!m.companion&&!m.strongBoss&&!species[m.type]?.prey).length;
 const sanctuary=earlySquadSanctuary();
 const want=sanctuary?0:clamp(Math.floor(target),0,2);
 let placed=0;
 for(let slot=0;slot<want;slot++){
  if(predators()>=want)break;
  if(localAnimals().length>=WILDLIFE.localCap&&!migrateUnseenLocalPreyForPredator())break;
  if(mobs.length>=WILDLIFE.cap&&!retireFarCalmAnimal())break;
  const type=pool[(slot+region)%pool.length];
  let settled=false;
  for(const radius of [288,360,440,540,610]){
   if(settled)break;
   for(let k=0;k<20;k++){
    const angle=((k*7+slot*3)%20)*TWO/20;
    const x=clamp(P.x+Math.cos(angle)*radius,45,WORLD.w-45);
    const y=clamp(P.y+Math.sin(angle)*radius,45,WORLD.h-45);
    if(regionAt(x,y)!==region||mountainHabitat(x,y)||dist(P,{x,y})<245||
      nearDenLocation(x,y,268)||collides(x,y,40)||
      mobs.some(m=>m.hp>0&&Math.hypot(m.x-x,m.y-y)<WILDLIFE.separation)||
      !routeClear(P,{x,y},Math.min(P.r,25)))continue;
    if(!spawnMob(false,false,false,{x,y},type))continue;
    // Forced species are verified, not just presumed; old den protection may replace a predator.
    const born=mobs[mobs.length-1];
    if(born.type!==type||species[born.type]?.prey){mobs.pop();continue;}
    placed++;settled=true;break;
   }
  }
  if(!settled)break;
 }
 return placed;
}
function maintainLocalWildlife(){
 if(!P)return;
 easeOldOvercrowding();
 const hunting=mission===2||mission>=7;
 const preyNearby=mobs.some(m=>m.hp>0&&["rat","rabbit","pigeon","frog"].includes(m.type)&&dist(P,m)<WILDLIFE.preyNeedRadius);
 const local=mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius).length;
 const zone=mountainHabitat(P.x,P.y)?MOUNTAIN.zone(P.x):null;
 const caveAnimals=zone==="cave"?mobs.filter(m=>m.hp>0&&MOUNTAIN.zone(m.x)==="cave"&&dist(P,m)<WILDLIFE.localRadius):[];
 // A snake can hunt; a cave of snakes alone has no actual prey population.
 const cavePrey=caveAnimals.filter(m=>species[m.type]?.prey&&!isWildPredator(m)).length;
 const caveHunter=caveAnimals.filter(isWildPredator).length;
 const caveNeedsPrey=zone==="cave"&&cavePrey===0;
 const caveNeedsHunter=zone==="cave"&&caveHunter===0;
 const caveNeedsBalance=caveNeedsPrey||caveNeedsHunter;
 const weatherTarget=(weather==="RAIN"||weather==="THUNDER")?WILDLIFE.localTargetRain:WILDLIFE.localTargetClear;
 const eraState=window.WildEraEcology?.state?.(regionAt(P.x,P.y),elapsed/120);
 const target=Math.max(2,Math.min(WILDLIFE.localCap,Math.round(weatherTarget*(eraState?.animals??1))));
 // An old save with many distant creatures must not leave the current district empty.
 if(!zone)ensureLocalPredators(regionAt(P.x,P.y)===7?2:1);
 if(caveNeedsBalance&&local>=WILDLIFE.localCap)retireCalmCaveOverflow(caveNeedsPrey,caveAnimals);
 const localNow=mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius).length;
 if(mobs.length>=WILDLIFE.cap&&(localNow<Math.min(3,target)||
    (caveNeedsBalance&&localNow<WILDLIFE.localCap)))retireFarCalmAnimal();
 if(mobs.length<WILDLIFE.cap){
  if(caveNeedsBalance&&localNow<WILDLIFE.localCap){
   if(caveNeedsPrey)spawnMob(false,true,true,null,null,"cave");
   else{
    const hunters=["weasel","wildFox","raccoonDog"];
    spawnMob(false,false,true,null,hunters[Math.floor(Math.random()*hunters.length)],"cave");
   }
  }else if(zone==="cave"&&caveAnimals.length<3&&localNow<WILDLIFE.localCap){
   spawnMob(false,false,true,null,null,"cave");
  }else if(hunting&&!preyNearby)spawnMob(false,true,true,null,null,zone==="cave"?"cave":null);
  else if(localNow<target){
   if(P.level>=2&&localNow<=WILDLIFE.localCap-2&&Math.random()<(P.level>=5?WILDLIFE.packChanceLate:WILDLIFE.packChanceEarly))
    spawnLocalPack()||spawnMob(false,false,true);
   else spawnMob(false,false,true);
  }
 }
 for(const m of mobs)if(m.hp>0&&!m.companion&&!m.strongBoss&&!species[m.type]?.prey)syncEnemyLevel(m);
 if(carcasses.filter(c=>c.type==="berries").length<14)spawnFood();
}
function updateWeather(dt){
 const target=debugWeatherOverride||tokyoWeatherAt(elapsed);
 if(weather!==target){
  const previous=weather;weather=target;windDirection=rnd(0,TWO);
  if(weather==="THUNDER")thunderTimer=rnd(5,11);else lightningStrike=null;
  if(weather==="SNOW"&&previous!=="SNOW")notify("雪が降り始めた。凍った地面では滑る");
  else if(weather==="THUNDER"&&previous!=="RAIN")notify("遠雷と雨雲が近づいている");
  else if(weather==="RAIN"&&previous!=="THUNDER")notify("天候変化：雨");
  else notify("天候変化："+WEATHER_NAMES[weather]);
 }
 // Legacy save fields remain for compatibility, but no longer drive rain odds.
 weatherTimer=85-(elapsed%85);nextWeather=null;
 thunderFlash=Math.max(0,thunderFlash-dt*2.6);
 if(weather==="THUNDER"){
  thunderTimer-=dt;
  if(thunderTimer<=0){
   thunderTimer=rnd(8,16);
   if(!lightningStrike)scheduleLightning();
  }
 }
}
function rainShelterPoint(m){
 let bestRoom=null,bestRoomDistance=470;
 for(const b of buildings)if(b.interior){
  const entry=shelterEntrance(b),inside=shelterInteriorPoint(b);
  const distance=dist(m,entry);
  const inThisRoom=m.x>b.x+16&&m.x<b.x+b.w-16&&m.y>b.y+16&&m.y<b.y+b.h-16;
  if(distance<bestRoomDistance&&(inThisRoom||routeClear(m,entry,m.r))&&!collides(inside.x,inside.y,m.r+3)){
   bestRoom={x:inside.x,y:inside.y,doorX:entry.x,doorY:entry.y,room:true};bestRoomDistance=distance;
  }
 }
 if(bestRoom)return bestRoom;
 let best=null,bestDist=470;
 for(const b of buildings){
  if(Math.abs(m.x-(b.x+b.w*.5))>470+b.w*.5||Math.abs(m.y-(b.y+b.h*.5))>470+b.h*.5)continue;
  const gap=m.r*.8+10;
  const candidates=[
   {x:b.x-gap,y:b.y+b.h*.5},{x:b.x+b.w+gap,y:b.y+b.h*.5},
   {x:b.x+b.w*.5,y:b.y-gap},{x:b.x+b.w*.5,y:b.y+b.h+gap}
  ];
  for(const q of candidates){
   const distance=dist(m,q);
   if(distance>=bestDist||collides(q.x,q.y,m.r)||!routeClear(m,q,m.r))continue;
   bestDist=distance;best=q;
  }
 }
 return best;
}
// Rain sheltering: approach a real doorway before moving to the indoor rest point.
function followRainShelter(m,sp,dt){
 m.shelterRefresh=Math.max(0,(m.shelterRefresh||0)-dt);
 if(m.shelterRefresh===0){
  const spot=rainShelterPoint(m);
  const same=!!spot&&Number.isFinite(m.shelterX)&&Number.isFinite(m.shelterY)&&Math.hypot(spot.x-m.shelterX,spot.y-m.shelterY)<8;
  const oldPhase=m.shelterPhase===1;
  m.shelterX=spot?spot.x:null;m.shelterY=spot?spot.y:null;
  m.shelterDoorX=spot?.room?spot.doorX:null;m.shelterDoorY=spot?.room?spot.doorY:null;
  m.shelterPhase=spot?.room&&(insideShelter(m)||(same&&oldPhase))?1:0;
  m.shelterRefresh=2.8+rnd(0,1.5);
 }
 if(!Number.isFinite(m.shelterX)||!Number.isFinite(m.shelterY))return null;
 const hasDoor=Number.isFinite(m.shelterDoorX)&&Number.isFinite(m.shelterDoorY);
 if(hasDoor&&m.shelterPhase!==1){
  const tolerance=clamp(55-m.r-10,18,30);
  if(insideShelter(m)||Math.hypot(m.shelterDoorX-m.x,m.shelterDoorY-m.y)<tolerance)m.shelterPhase=1;
 }
 const tx=hasDoor&&m.shelterPhase!==1?m.shelterDoorX:m.shelterX;
 const ty=hasDoor&&m.shelterPhase!==1?m.shelterDoorY:m.shelterY;
 if(Math.hypot(tx-m.x,ty-m.y)<=m.r+8&&(!hasDoor||m.shelterPhase===1)){
  m.sheltered=true;return {vx:0,vy:0};
 }
 m.dir=steerPursuit(m,tx,ty);
 m.sheltered=insideShelter(m);
 return {vx:Math.cos(m.dir)*sp.speed*.62,vy:Math.sin(m.dir)*sp.speed*.62};
}
/* Diurnal wildlife seeks visible cover on dry nights; no new save schema. */
function nightRestSeason(){
 return worldDaylight()<.30; // Winter rests use visible solid objects.
}
// Night rest must not route prey into a visible dog/alpha's hunting radius.
// A concealed player can still approach for a stealth ambush.
function nightCoverThreatened(m,x,y,includePlayer=true){
 if(includePlayer&&P&&Math.hypot(P.x-x,P.y-y)<140)return true;
 return mobs.some(q=>q!==m&&q.hp>0&&isWildPredator(q)&&
  Math.hypot(q.x-x,q.y-y)<165&&!lineBlocked(q,{x,y}));
}
function followNightCover(m,sp,dt){
 if((m.type!=="rabbit"&&m.type!=="pigeon")||!nightRestSeason()||
    weather==="RAIN"||weather==="THUNDER"||(m.restNeed||0)<.68)return null;
 if(inCover(m)&&!nightCoverThreatened(m,m.x,m.y,false))return {vx:0,vy:0};
 if(Number.isFinite(m.nightCoverX)&&Number.isFinite(m.nightCoverY)&&
    (nightCoverThreatened(m,m.nightCoverX,m.nightCoverY)||
     (!visibleShrubCover()&&!visibleWinterCover({x:m.nightCoverX,y:m.nightCoverY,r:m.r}))))m.nightCoverRefresh=0;
 m.nightCoverRefresh=Math.max(0,(m.nightCoverRefresh||0)-dt);
 if(m.nightCoverRefresh<=0){
  m.nightCoverRefresh=4+rnd(0,1);
  let nearest=null;
  if(!visibleShrubCover())nearest=winterCoverSpotFor(m,300,P,spot=>!nightCoverThreatened(m,spot.x,spot.y));
  else{
   let best=300;
   for(const p of plants){
    if(p.type!==2)continue;
    const d=Math.hypot(p.x-m.x,p.y-m.y);
    if(d>=best||d<20||nightCoverThreatened(m,p.x,p.y))continue;
    if(collides(p.x,p.y,m.r+3)||!routeClear(m,p,m.r+3))continue;
    best=d;nearest=p;
   }
  }
  m.nightCoverX=nearest?nearest.x:null;
  m.nightCoverY=nearest?nearest.y:null;
 }
 if(!Number.isFinite(m.nightCoverX)||!Number.isFinite(m.nightCoverY)||nightCoverThreatened(m,m.nightCoverX,m.nightCoverY))return null;
 m.dir=steerPursuit(m,m.nightCoverX,m.nightCoverY);
 return {vx:Math.cos(m.dir)*sp.speed*.44,vy:Math.sin(m.dir)*sp.speed*.44};
}
function updateIndoorRest(m,sp,dt,spotted,d){
 if(!Number.isFinite(m.restNeed))m.restNeed=clamp(.32+noise(Math.floor(m.x),Math.floor(m.y))*.55,0,1);
 if(!Number.isFinite(m.restTime))m.restTime=0;
 if(!Number.isFinite(m.restCooldown))m.restCooldown=0;
 m.restNeed=clamp(m.restNeed+dt*.012,0,1);
 m.restCooldown=Math.max(0,m.restCooldown-dt);
 const indoors=insideShelter(m),rainy=weather==="RAIN"||weather==="THUNDER";
 const naturalNightCover=!rainy&&nightRestSeason()&&
  ["rabbit","pigeon","strayCat","wildFox","weasel","deer","raccoonDog"].includes(m.type)&&inCover(m);
 const safeRest=(indoors&&rainy)||naturalNightCover;
 const hunterAnimal=sp.prey?nearbyAwareWildPredator(m,155):null;
 const hunter=!!hunterAnimal;
 // Awake prey also reacts immediately to a nearby visible wild predator.
 if(sp.prey&&hunterAnimal&&m.restTime<=0&&m.flee<=0)startlePrey(m,hunterAnimal,"alarm");
 const danger=spotted||m.alert>0||m.flee>0||m.stun>0||m.windup>0||
  m.chargeTime>0||(m.evadeTime||0)>0||hunter||
  (d<115&&sharesPlayerElevation(m)&&!lineBlocked(m,P));
 if(m.restTime>0&&(!safeRest||danger)){
  m.restTime=0;m.restCooldown=danger?12:5;
  m.restNeed=Math.min(m.restNeed,danger?.38:.65);
  const wakeThreat=hunterAnimal&&(!spotted||dist(m,hunterAnimal)<d)?hunterAnimal:(spotted||d<115?P:null);
  if(danger&&sp.prey&&wakeThreat)startlePrey(m,wakeThreat,"wake");
 }
 if(m.restTime<=0&&safeRest&&!danger&&m.restCooldown<=0&&m.restNeed>=(naturalNightCover?.68:.80)){
  m.restTime=5+noise(Math.floor(m.x*.37),Math.floor(m.y*.29))*4;
  m.navPath=null; // Do not keep a stale walking route after waking.
 }
 m.resting=m.restTime>0;
 if(!m.resting)return false;
 m.restTime=Math.max(0,m.restTime-dt);
 m.restNeed=Math.max(0,m.restNeed-dt*.14);
 m.sheltered=indoors;m.vx=0;m.vy=0;m.wander=Math.max(m.wander,.4);
 if(m.restTime===0){m.resting=false;m.restCooldown=8;}
 return true;
}
function findBirdPerch(bird){
 let best=null,nearest=950;
 for(const b of buildings){
  if(b.interior)continue;
  const height=b.roofZ||135+(b.kind%4)*75;
  if(height>305)continue; // Keep all roosts within the save and 3D height budget.
  const x=b.x+b.w*.46,y=b.y+b.h*.47,d=Math.hypot(x-bird.x,y-bird.y);
  if(d<nearest){nearest=d;best={x,y,z:height+11,kind:"roof"};}
 }
 const forest=EXPLORE_SITES.find(site=>site.id==="forest");
 if(forest)for(let i=0;i<12;i++){
  const a=i*TWO/12,x=forest.x+Math.cos(a)*182,y=forest.y+Math.sin(a)*182;
  const d=Math.hypot(x-bird.x,y-bird.y);
  if(d<nearest){nearest=d;best={x,y,z:113,kind:"branch"};}
 }
 return best;
}
function normalizeBirdRoost(bird){
 if(!Number.isFinite(bird.x)||!Number.isFinite(bird.y))return false;
 bird.z=clamp(Number.isFinite(bird.z)?bird.z:60,35,360);
 bird.wing=Number.isFinite(bird.wing)?bird.wing:0;
 bird.fright=clamp(Number(bird.fright)||0,0,4);
 bird.flightClock=clamp(Number(bird.flightClock)||0,0,35);
 bird.restClock=clamp(Number(bird.restClock)||0,0,35);
 bird.departClock=clamp(Number(bird.departClock)||0,0,3);
 if(!["fly","approach","rest"].includes(bird.roostState))bird.roostState="fly";
 const q=bird.perch;
 if(bird.roostState!=="fly"&&(!q||!Number.isFinite(q.x)||!Number.isFinite(q.y)||!Number.isFinite(q.z)||
  q.x<0||q.x>WORLD.w||q.y<0||q.y>WORLD.h||q.z<30||q.z>350)){
  bird.roostState="fly";bird.perch=null;
 }
 return true;
}
function updateBirdFlocks(dt){
 const storm=weather==="THUNDER",rainy=storm||weather==="RAIN";
 for(const bird of birdFlocks){
  if(!Number.isFinite(bird.z)||!bird.roostState)normalizeBirdRoost(bird);
  bird.flightClock=Math.max(0,(bird.flightClock||0)-dt);
  bird.fright=Math.max(0,(bird.fright||0)-dt);
  bird.departClock=Math.max(0,(bird.departClock||0)-dt);
  if(P&&bird.fright<=0&&Math.hypot(P.x-bird.x,P.y-bird.y)<110){
   bird.fright=2.2;bird.roostState="fly";bird.perch=null;
   bird.flightClock=3.4;bird.departClock=2.3;playEffect("wing");
  }
  if(bird.roostState==="rest"){
   bird.wing+=dt*.45;
   bird.restClock=Math.max(0,(bird.restClock||0)-dt);
   if(storm||(rainy&&bird.restClock>0))continue;
   bird.roostState="fly";bird.perch=null;
   bird.flightClock=rainy?8+rnd(0,7):3;
   bird.departClock=2.3;
  }
  if(bird.roostState==="approach"){
   if(!rainy||bird.fright>0||!bird.perch){
    bird.roostState="fly";bird.perch=null;bird.flightClock=rainy?3:2;
   }else{
    const q=bird.perch,dx=q.x-bird.x,dy=q.y-bird.y,d=Math.hypot(dx,dy);
    bird.dir=Math.atan2(dy,dx);
    const targetZ=d<=8?q.z:q.z+18;
    bird.z+=clamp(targetZ-bird.z,-65*dt,85*dt);
    if(bird.z>=q.z+11&&d>0){
     const step=Math.min(d,bird.speed*.86*dt);
     bird.x+=dx/d*step;bird.y+=dy/d*step;
    }
    bird.wing+=dt*15;
    if(d<=8&&Math.abs(bird.z-q.z)<4){
     bird.x=q.x;bird.y=q.y;bird.z=q.z;
     bird.roostState="rest";bird.restClock=storm?0:7+rnd(0,7);
    }
    continue;
   }
  }
  if(rainy&&bird.fright<=0&&bird.flightClock<=0&&bird.departClock<=0){
   if(storm||Math.random()<.62){
    const q=findBirdPerch(bird);
    if(q){bird.perch=q;bird.roostState="approach";continue;}
   }
   bird.flightClock=storm?4:6+rnd(0,5);
  }
  bird.wing+=dt*(bird.fright>0?25:rainy?11:14);
  const speed=bird.speed*(bird.fright>0?1.6:rainy?.73:1);
  bird.x+=Math.cos(bird.dir)*speed*dt;bird.y+=Math.sin(bird.dir)*speed*dt;
  if(bird.departClock>0)bird.z+=35*dt;
  else{
   const targetZ=bird.fright>0?105:rainy?72:58;
   bird.z+=clamp(targetZ-bird.z,-28*dt,28*dt);
  }
  bird.z=clamp(bird.z,35,360);
  if(bird.x<20||bird.x>WORLD.w-20||bird.y<20||bird.y>WORLD.h-20){
   bird.dir+=Math.PI*.8;bird.x=clamp(bird.x,20,WORLD.w-20);bird.y=clamp(bird.y,20,WORLD.h-20);
  }
 }
}
// Companion uses actual collision, saved NPC data and retaliatory damage.
function updateCompanion(m,dt){
 if(!P||m.hp<=0)return;
 const sp=species[m.type],helper=window.WildCompanions;
 m.swing=Math.max(0,(m.swing||0)-dt);m.flash=Math.max(0,(m.flash||0)-dt);
 m.companionAttackCD=Math.max(0,(m.companionAttackCD||0)-dt);
 m.companionHurtCD=Math.max(0,(m.companionHurtCD||0)-dt);
 const order=m.squadIndividualId?(m.squadOrder||squadOrder):"follow";
 let enemy=order==="wait"||order==="flee"?null:helper?.threat?.(m,P,mobs,species,(a,b)=>!lineBlocked(a,b),elapsed)||null;
 if(m.squadIndividualId&&order==="attack"&&!enemy)
  enemy=mobs.filter(q=>q!==m&&q.hp>0&&!q.companion&&!species[q.type]?.prey&&dist(q,m)<300&&!lineBlocked(m,q)).sort((a,b)=>dist(a,m)-dist(b,m))[0]||null;
 let goal=enemy||helper?.followGoal?.(m,P);
 if(m.squadIndividualId){
  const allies=mobs.filter(q=>q.squadIndividualId&&q.hp>0),index=allies.findIndex(q=>q.squadIndividualId===m.squadIndividualId);
  const face=P.dir||0,side=index%2===0?1:-1;
  if(!enemy&&order==="follow")goal={x:P.x-Math.cos(face)*90+Math.sin(face)*55*side,y:P.y-Math.sin(face)*90-Math.cos(face)*55*side};
  if(order==="wait")goal=m.squadWait||{x:m.x,y:m.y};
  if(order==="flee"){
   const threat=mobs.filter(q=>q.hp>0&&!q.companion&&!species[q.type]?.prey&&dist(q,m)<300).sort((a,b)=>dist(a,m)-dist(b,m))[0];
   goal=threat?{x:clamp(m.x+(m.x-threat.x)*1.2,35,WORLD.w-35),y:clamp(m.y+(m.y-threat.y)*1.2,35,WORLD.h-35)}:
    {x:P.x-Math.cos(face)*165,y:P.y-Math.sin(face)*165};
  }
 }
 const d=goal?dist(m,goal):0;
 if(m.squadIndividualId&&order==="follow"&&dist(P,m)>850&&!partyCombat()){
  const mates=mobs.filter(q=>q.squadIndividualId&&q.hp>0);
  const spot=partySpawnPosition(Math.max(0,mates.findIndex(q=>q.squadIndividualId===m.squadIndividualId)));
  m.x=spot.x;m.y=spot.y;
 }
 const ox=m.x,oy=m.y;
 if(goal&&d>(enemy?m.r+enemy.r+21:m.squadIndividualId?28:70)&&d<1500){
  const a=routeClear(m,goal,m.r)?Math.atan2(goal.y-m.y,goal.x-m.x):steerPursuit(m,goal.x,goal.y);
  m.dir=a;const speed=(m.squadIndividualId?(animals[m.type]?.speed||sp.speed)*(m.squadSpeedIV||1):sp.speed)*(enemy?1.07:d>270?1.9:1.13);
  move(m,Math.cos(a)*speed*dt,Math.sin(a)*speed*dt);
 }
 m.vx=(m.x-ox)/Math.max(.001,dt);m.vy=(m.y-oy)/Math.max(.001,dt);
 m.step=(m.step||0)+Math.hypot(m.x-ox,m.y-oy)*.05;
 if(enemy&&m.companionAttackCD<=0&&dist(m,enemy)<m.r+enemy.r+24&&!lineBlocked(m,enemy)){
  m.companionAttackCD=1.4;m.swing=.25;
  const raw=Math.max(3,Math.round((m.squadIndividualId?(animals[m.type]?.damage||sp.damage||12)*(m.squadAttackIV||1):(sp.damage||12))*.76));
  const bite=enemy.strongBoss?Math.min(2,raw):raw;
  enemy.hp=enemy.strongBoss?Math.max(1,enemy.hp-bite):Math.max(0,enemy.hp-bite);
  enemy.flash=.17;enemy.stun=Math.max(enemy.stun||0,.12);
  if(dist(P,enemy)<360)label(enemy.x,enemy.y-enemy.r-24,"仲間の援護 -"+bite,"#a5eadd");
  if(enemy.hp<=0&&!enemy._killRegistered){
   enemy._killRegistered=true;carcasses.push(animalRemains(enemy));
   if(dist(P,enemy)<350)label(enemy.x,enemy.y-35,"仲間が敵を撃退","#b4f3d5");
  }
 }
 if(m.companionHurtCD<=0){
  const attacker=mobs.find(q=>q!==m&&q.hp>0&&!q.companion&&!species[q.type]?.prey&&
   (q.alert||0)>0&&dist(q,m)<(q.r||20)+m.r+25&&!lineBlocked(q,m));
  if(attacker){
   const damage=Math.max(2,Math.min(18,Math.round((species[attacker.type]?.damage||10)*.24)));
   m.hp=Math.max(0,m.hp-damage);m.flash=.26;m.companionHurtCD=1.8;
   if(dist(P,m)<350)label(m.x,m.y-m.r-30,"仲間 -"+damage,"#f9c6a7");
  }
 }
 if(m.hp<=0){
  if(!m._killRegistered){
   m._killRegistered=true;carcasses.push(animalRemains(m));
   if(m.squadIndividualId){window.WildSquad?.kill?.(m.squadIndividualId);notify((m.squadName||"仲間")+"は永久に離脱");saveAuto();syncSquadHud();}
   else notify("仲間が倒れた");
  }
 }else if(atDen()&&dist(P,m)<120&&!denThreatNearby())m.hp=Math.min(m.maxHp,m.hp+dt*2.8);
}
// Persistent disaster encounter ledger, separate from legacy SAVE_SCHEMA2.
const DISASTER_TROPHY_KEY="wild-reclaim-disaster-trophy-events-v1";
let disasterTrophyLedger={};
try{const v=JSON.parse(localStorage.getItem(DISASTER_TROPHY_KEY)||"{}");if(v&&typeof v==="object"&&!Array.isArray(v))disasterTrophyLedger=v;}catch(_){}
function recordDisasterEncounters(){
 if(!P||P.hp<=0)return;
 const active=window.WildDisaster?.events?.()||[],year=elapsed/120;
 let changed=false;
 for(const e of active){
  if(!["fallen_tree","flood","wildfire"].includes(e.kind)||year<e.year||year>=e.year+e.duration)continue;
  const id=[e.kind,Math.round(e.year*100),Math.round(e.x),Math.round(e.y)].join(":");
  const radius=Number(e.radius)||34,distance=Math.hypot(P.x-e.x,P.y-e.y);
  const entry=disasterTrophyLedger[id]||{kind:e.kind,year:e.year,seen:false,exposed:false,escaped:false};
  if(!entry.seen&&distance<=radius+250){
   entry.seen=true;changed=true;
   window.WildTrophies?.record?.("disaster-witness",{kind:e.kind,distance,radius},notify);
  }
  if(!entry.exposed&&distance<=radius){entry.exposed=true;changed=true;}
  if(entry.exposed&&!entry.escaped&&distance>radius+35&&P.hp>0){
   entry.escaped=true;changed=true;
   window.WildTrophies?.record?.("disaster-escape",{kind:e.kind,exposed:true,alive:true},notify);
  }
  disasterTrophyLedger[id]=entry;
 }
 if(changed){
  const all=new Set(Object.values(disasterTrophyLedger).filter(v=>v.seen).map(v=>v.kind));
  if(["fallen_tree","flood","wildfire"].every(k=>all.has(k)))
   window.WildTrophies?.record?.("disaster-triple",{all:true},notify);
  try{localStorage.setItem(DISASTER_TROPHY_KEY,JSON.stringify(Object.fromEntries(Object.entries(disasterTrophyLedger).slice(-160))))}catch(_){}
 }
}
function update(dt){
 if(objectiveBannerTime<0)announceObjective();
 navPlansThisFrame=0;
 for(let i=pounceStreaks.length-1;i>=0;i--){pounceStreaks[i].life-=dt;if(pounceStreaks[i].life<=0)pounceStreaks.splice(i,1)}
 const previousWorldYear=Math.floor(elapsed/120);
 elapsed+=dt;day=1+Math.floor(elapsed/85);simulateEcology(dt);
 if(P){
  initializeLife(P,elapsed,true);
  // SOLO5: age is cosmetic only; no lifespan countdown or old-age warning.
 }
 worldChronicleSaveClock+=dt;
 if(worldChronicleSaveClock>=12){worldChronicleSaveClock=0;persistWorldChronicle();}
 const currentWorldYear=Math.floor(elapsed/120);
 // Regional event epochs advance 3x faster, but world clock and animal age do not.
 const ecologyPeriod=window.WildEraEcology?.periodYears||5;
 const epochBefore=Math.floor(((elapsed-dt)/120+1e-9)/ecologyPeriod);
 const epochAfter=Math.floor((elapsed/120+1e-9)/ecologyPeriod);
 if(epochAfter!==epochBefore){
  const region=regionAt(P.x,P.y),change=window.WildEraEcology?.state?.(region,elapsed/120);
  if(change&&change.kind!=="stable")notify("世界"+currentWorldYear+"年：この地域の生態が変化（"+change.name+"）");
 }
 window.WildTrophies?.record?.("year",{year:currentWorldYear},notify);
 window.WildTrophies?.record?.("weather",{weather},notify);
 window.WildTrophies?.record?.("progress",{level:P.level},notify);
 if(currentWorldYear!==previousWorldYear)notify(currentWorldYear+"年目",2.6);
 const phase=elapsed%85;const hr=(6+Math.floor(phase/85*24))%24;
 updateWeather(dt);
 updateLightning(dt);
 window.WildDisaster?.tick?.(dt,{P,mobs,elapsed,mode,notify,collides,WORLD,roadsX,roadsY,buildings,riverAxis,canalAxis,weather,
  isSheltered:insideShelter,
  onAnimalDeath:(m,cause)=>{if(species[m.type])carcasses.push(animalRemains(m));}});
 recordDisasterEncounters();
 window.WildUFO?.tick?.(dt,{P,mobs,elapsed,mode,notify,lineBlocked,beginDeath,
   onEvent:(event,data)=>{
    window.WildTrophies?.record?.(event,data,notify);
    if(event==="ufo-npc-abduction"){
     const kind=data?.species||data?.type||"unknown";
     const entry={year:Math.floor(elapsed/120),kind,at:Date.now()};
     try{
      const key="wild-reclaim-ufo-abduction-history-v1";
      const old=JSON.parse(localStorage.getItem(key)||"[]");
      const history=Array.isArray(old)?old.slice(-79):[];
      history.push(entry);localStorage.setItem(key,JSON.stringify(history));
     }catch(_){}
    }
   }});
 window.WildApparitions?.tick?.(dt,{P,mobs,elapsed,worldYear:elapsed/120,mode,notify,lineBlocked,onEvent:(event,data)=>window.WildTrophies?.record?.(event,data,notify)});
 if(P.hp<=0){beginDeath();return;}
 updateBirdFlocks(dt);
 for(const site of EXPLORE_SITES)if(!discoveredSites.includes(site.id)&&dist(P,site)<125){
  discoveredSites.push(site.id);
  awardDiscovery(site.id);
  if(discoveredSites.length>0&&discoveredSites.length%2===0)awardGameplayGachaTicket("explore",Math.floor(discoveredSites.length/2));
  window.WildTrophies?.record?.("explore",{sites:discoveredSites.length},notify);
  ecologyNews=site.name+"で新しい知識を獲得";
  label(P.x,P.y-38,"探索 "+discoveredSites.length+"/"+EXPLORE_SITES.length,"#d6e9b3");
  saveAuto();
 }
 const oldDay=day; // accounted above
 if(Math.floor((elapsed-dt)/85)<Math.floor(elapsed/85)){
  // DAY is used only for the independent 85-second light cycle.
  // Day transition must not heal an empty stomach or revive a defeated player.
  if(P.hp>0&&P.hunger>0)P.hp=Math.min(P.maxHp,P.hp+18);
 }
 P.jumpCD=Math.max(0,P.jumpCD-dt);P.wallKickLock=Math.max(0,(P.wallKickLock||0)-dt);P.wallKickTime=Math.max(0,(P.wallKickTime||0)-dt);
 if(P.fallTime>0&&P.jumpTime<=0&&P.pounceTime<=0){
  P.fallTime=Math.max(0,P.fallTime-dt);
  const part=P.fallTime/.30;
  P.jumpHeight=(P.groundZ||0)+(P.fallFromZ-(P.groundZ||0))*part*part;
  if(P.fallTime===0&&P.pendingStrike&&P.jumpDive)resolveAttack();
 }
 
  P.atk=Math.max(0,P.atk-dt);P.dash=Math.max(0,P.dash-dt);P.dashTime=Math.max(0,P.dashTime-dt);P.inv=Math.max(0,P.inv-dt);P.revealTimer=Math.max(0,P.revealTimer-dt);P.instinctCD=Math.max(0,P.instinctCD-dt);P.abilityTime=Math.max(0,P.abilityTime-dt);P.swing=Math.max(0,(P.swing||0)-dt);P.comboTimer=Math.max(0,P.comboTimer-dt);P.rushWindow=Math.max(0,P.rushWindow-dt);if(P.pendingStrike){P.windup=Math.max(0,P.windup-dt);if(P.windup===0&&P.jumpTime<=0&&P.pounceTime<=0&&P.fallTime<=0)resolveAttack()}
 if(P.rushQueued&&P.atk<=0&&!P.pendingStrike){if(P.rushWindow>0&&P.rushStep<5)attack();else P.rushQueued=false;}
 // Holding the upper face button automatically advances the five-hit chain.
 if((heldActions.touchAttack||heldActions.padAttack)&&P.atk<=0&&!P.pendingStrike&&P.sp>=5)attack();
 P.sp=clamp(P.sp+((weather==="THUNDER"&&!insideShelter(P)?10:weather==="WIND"?13:17)+(P.riverPerk?3:0)+traitEffect("giantCrocodile",0,strongNearWater()))*dt,0,100);P.tiredNotice=Math.max(0,(P.tiredNotice||0)-dt);if(!updateSurvivalNeeds(dt)){beginDeath();return;}
 P.stun=Math.max(0,(P.stun||0)-dt);
 const a=P.stun>0?{x:0,y:0}:getAxes(),sneaking=keys.has("c")||keys.has("control");
  const boarStartX=P.x,boarStartY=P.y;
  let boarDashActive=false;
  if(P.jumpTime>0){
    const jumpLeft=Math.max(0,P.jumpTime-dt);
    const jumpProgress=clamp(1-jumpLeft/Math.max(.01,P.jumpDuration),0,1);
    P.jumpHeight=(P.groundZ||0)+Math.max(0,(P.jumpFromHeight||0)*(1-jumpProgress)+Math.sin(Math.PI*jumpProgress)*(P.jumpPower||(P.type==="cat"?83:P.type==="wolf"?43:58)));
    const ox=P.x,oy=P.y;
    const step=Math.min(P.jumpRemaining,P.jumpSpeed*dt);
    if(step>0)move(P,Math.cos(P.jumpDir)*step,Math.sin(P.jumpDir)*step);
    const covered=Math.hypot(P.x-ox,P.y-oy);
    const landingRoof=roofAt(P.x,P.y);
    const touchesRoof=landingRoof>(P.groundZ||0)&&jumpLeft<=P.jumpDuration*.5&&P.jumpHeight<=landingRoof+4;
    P.jumpTime=touchesRoof?0:jumpLeft;
    P.jumpRemaining=touchesRoof?0:Math.max(0,P.jumpRemaining-covered);
    P.steps+=covered*.052;
    if(P.jumpTime===0){
     const reachedRoof=landOnSurface();P.vx=0;P.vy=0;P.wallKicks=0;P.wallKickLast=-1;P.wallKickTime=0;
     if(reachedRoof)notify("屋上に到着");
     blood(P.x,P.y,"#b7be9e",5,26);
     if(P.pendingStrike&&P.jumpDive&&P.fallTime===0)resolveAttack();
     else P.jumpAmbush=false;
    }
   }else if(P.pounceTime>0){
   boarDashActive=P.type==="boar";
   const step=Math.min(P.pounceRemaining,P.pounceRemaining/Math.max(P.pounceTime,dt)*dt);
   const ox=P.x,oy=P.y;
   move(P,Math.cos(P.pounceDir)*step,Math.sin(P.pounceDir)*step);
   let moved=Math.hypot(P.x-ox,P.y-oy);
   P.pounceRemaining=Math.max(0,P.pounceRemaining-moved);
   P.pounceTime=Math.max(0,P.pounceTime-dt);
   if(moved<step*.5||P.pounceRemaining<.5){
    P.pounceTime=0;P.pounceRemaining=0;P.vx=0;P.vy=0;
   }else{
    P.vx=(P.x-ox)/Math.max(dt,.001);P.vy=(P.y-oy)/Math.max(dt,.001);
   }
   const impact=P.pendingStrike?pounceImpactOnSegment(ox,oy,P.x,P.y):null;
   if(impact){
    P.x=impact.x;P.y=impact.y;moved=Math.hypot(P.x-ox,P.y-oy);
    P.pounceTime=0;P.pounceRemaining=0;P.jumpHeight=P.groundZ||0;P.vx=0;P.vy=0;
   }
   P.steps+=moved*.052;
    const progress=1-P.pounceTime/Math.max(.001,P.pounceDuration||.18);
   P.jumpHeight=(P.groundZ||0)+Math.sin(Math.PI*clamp(progress,0,1))*(P.type==="cat"?11:P.type==="wolf"?8:10);
   pounceStreaks.push({x:P.x,y:P.y,z:P.jumpHeight,life:.17});
   if(pounceStreaks.length>11)pounceStreaks.shift();
   if(P.pounceTime===0){landOnSurface();if(P.pendingStrike&&P.fallTime===0)resolveAttack();}
  }else if(P.dashTime>0){
   boarDashActive=P.type==="boar";
   P.vx=0;P.vy=0;move(P,P.dx*P.speed*(P.type==="cat"?4.35:P.type==="wolf"?3.05:3.8)*dt,P.dy*P.speed*(P.type==="cat"?4.35:P.type==="wolf"?3.05:3.8)*dt);
   if(Math.random()<.7)blood(P.x,P.y,"#d5e4bb",1,25);
  }else{
   const foxTurbo=P.type==="fox"&&P.abilityTime>0&&!sneaking;
   const boost=foxTurbo?2.32+Math.min(.72,(P.level-1)*.09):P.type==="cat"&&P.abilityTime>0?1.52:1;
   const traction=(weather==="RAIN"||weather==="THUNDER")&&!insideShelter(P)?(P.rainGrip?.98:.89):weather==="WIND"?.96:1;
   P.hauntedTime=Math.max(0,(P.hauntedTime||0)-dt);
   const wantsSprint=heldActions.touchSprint||heldActions.padSprint;
   if(!wantsSprint)P.sprintExhausted=false;
   const sprinting=wantsSprint&&!P.sprintExhausted&&!sneaking&&Math.hypot(a.x,a.y)>.2&&P.sp>10;
   boarDashActive=P.type==="boar"&&sprinting;
   if(sprinting){
    P.sp=Math.max(0,P.sp-43*dt);
    if(P.sp<=10)P.sprintExhausted=true;
   }
   const target=P.speed*(sneaking?.34:1)*(P.pendingStrike?.7:1)*boost*(sprinting?1.62:1)*(P.type==="shoebill"&&waterDepth(P.x,P.y)>.0001?.79:1)*traction*(P.strongSlow>0?traitEffect("giantAnaconda",.54):1)*(P.hauntedTime>0?.72:1);
   applyDirectionalInput(P,a,target,dt,foxTurbo);
   const oldX=P.x,oldY=P.y;move(P,P.vx*dt,P.vy*dt);
   if(P.x===oldX)P.vx=0;if(P.y===oldY)P.vy=0;
   const speed=Math.hypot(P.vx,P.vy);
   if(speed>8){
    P.steps+=speed*dt*.052;
    if((P.type==="fox"||P.type==="tibetanFox")&&P.abilityTime>0&&speed>360&&Math.random()<dt*24)blood(P.x,P.y,"#d9c99d",2,18);
   }
  }
  if(P.type==="boar")resolveBoarDashImpact(boarStartX,boarStartY,P.x,P.y,boarDashActive);
  const speed=Math.hypot(P.vx,P.vy);
  if(P.type==="shoebill"){P.stillTime=speed<12&&!P.pendingStrike&&!P.pounceTime?Math.min(2.5,(P.stillTime||0)+dt):0;}
  P.beakVisual=Math.max(0,(P.beakVisual||0)-dt);
  footstepTimer=Math.max(0,footstepTimer-dt);
  if(speed>70&&!P.jumpTime&&!P.pounceTime&&!P.fallTime&&footstepTimer<=0){
   footstepTimer=P.type==="wolf"?.39:P.type==="cat"?.27:.34;
   playEffect(roadsX.some(x=>Math.abs(P.x-x)<78)||roadsY.some(y=>Math.abs(P.y-y)<78)?"stepHard":"step",{volume:.045});
  }
  P.noiseBurst=Math.max(0,P.noiseBurst-dt*1.6);
  P.noise=clamp(speed/P.speed*(sneaking?traitEffect("albinoWolf",.28):.94)*(P.type==="manul"?.48:1)+P.noiseBurst,0,1.8);
  P.hidden=(P.jumpHeight||0)<(P.groundZ||0)+20&&P.revealTimer<=0&&(inCover(P)||(P.type==="manul"&&P.abilityTime>0&&speed<P.speed*.32))&&(sneaking||speed<P.speed*.45)&&P.dashTime<=0&&P.jumpTime<=0&&P.pounceTime<=0&&P.fallTime<=0;hiddenHold=(mission===1?P.hidden&&inVisibleShrubCover(P):P.hidden)?hiddenHold+dt:Math.max(0,hiddenHold-dt*.6);
  if((keys.has("j")||keys.has(" "))&&P.atk<=0)attack();
 
 if((P.strongWound||0)>0){
  const bleed=Math.min(dt,P.strongWound);
  P.hp-=bleed*2.6*(P.inheritedTraits?.giantLizard?.65:1);
  const safeDen=atDen()&&!denThreatNearby();
  P.strongWound=Math.max(0,P.strongWound-dt*(safeDen?2.2:1));
 }
 updateVenom(dt);
 P.eatCD=Math.max(0,(P.eatCD||0)-dt);P.strongSlow=Math.max(0,(P.strongSlow||0)-dt*traitEffect("giantSnake",1));
  // A fatal bleed ends the frame before another region can roll/spawn a boss.
 if(P.hp<=0){P.hp=0;beginDeath();return}
 settleNewRegion();
 updateFieldQuest();
 if(strongRegionCurrent!==strongHabitatKey(P.x,P.y))enterStrongStage();
 const chaseRange=weather==="FOG"?195:260;
 for(const m of mobs){
  if(P.hp<=0)break; // A fatal hit ends this frame; no extra attackers or stacked damage.
  if(m.hp<=0){
   if(m.squadIndividualId&&!m._killRegistered){
    m._killRegistered=true;window.WildSquad?.kill?.(m.squadIndividualId);
    carcasses.push(animalRemains(m));notify((m.squadName||"仲間")+"は死亡し永久離脱");saveAuto();syncSquadHud();
   }
   continue;
  }
  if(m.companion){updateCompanion(m,dt);continue;}
  const s=species[m.type];m.huntSprintLeft=Math.max(0,(m.huntSprintLeft||0)-dt);m.huntSprintCooldown=Math.max(0,(m.huntSprintCooldown||0)-dt);if(m.type==="cheetah")m.sprintTime=Math.max(0,(m.sprintTime||0)-dt);m.staggerGuard=Math.max(0,(m.staggerGuard||0)-dt);m.wander-=dt;m.attack=Math.max(0,m.attack-dt);m.swing=Math.max(0,(m.swing||0)-dt);m.flash=Math.max(0,m.flash-dt);m.stun=Math.max(0,m.stun-dt);m.escapeTimer=Math.max(0,m.escapeTimer-dt);m.evadeCooldown=Math.max(0,(m.evadeCooldown||0)-dt);if(s.prey)m.fleeEnergy=clamp(m.fleeEnergy+(m.flee>0?-dt*.32:dt*.2),0,1);
  const d=dist(P,m);
  if(m.releasedIndividualId){
   const mood=m.releasedMood;
   if(mood==="aggressive"&&d<410){m.alert=Math.max(m.alert||0,2.4);m.search=Math.max(m.search||0,2.4);m.reactiveUntil=elapsed+2.4;}
   else if(mood==="timid"&&d<420){m.flee=Math.max(m.flee||0,2.2);m.alert=0;const a=Math.atan2(m.y-P.y,m.x-P.x);const ox=m.x,oy=m.y;move(m,Math.cos(a)*s.speed*1.3*dt,Math.sin(a)*s.speed*1.3*dt);m.vx=(m.x-ox)/Math.max(dt,.001);m.vy=(m.y-oy)/Math.max(dt,.001);m.step+=Math.hypot(m.x-ox,m.y-oy)*.05;continue;}
   else if(mood==="peaceful"&&d<300&&!m.provokedUntil){m.alert=0;m.search=0;m.vx=0;m.vy=0;continue;}
   else if(mood==="generous"&&d<145&&!m.provokedUntil){m.alert=0;m.search=0;if(elapsed>=m.releasedGiftCooldown){const giftType=(m.type==="deer"||m.type==="boar"||m.type==="giraffe"||m.type==="zebra")?"berries":(Math.random()<.5?"berries":"meat");carcasses.push({x:clamp(P.x+40,40,WORLD.w-40),y:clamp(P.y+30,40,WORLD.h-40),r:9,amount:20,type:giftType,ttl:160,phase:0});notify((m.name||"野生の動物")+"が食べ物を持ってきた",2.5);m.releasedGiftCooldown=elapsed+45+Math.random()*25;}m.vx=0;m.vy=0;continue;}
  }
  if(m.type==="giantGorilla")updateGorillaRock(m,dt);
  if(m.type==="dog"&&updateFoodThief(m,dt,d))continue;
  if(m.type==="macaque"){if(d<WILDLIFE.farAI)updateMacaque(m,dt,d);else{m.macaqueStone=null;m.macaqueTell=0;m.treeHeight=0;m.groundZ=0;m.evadeHeight=0;}continue;}
  if(m.type==="chimpanzee"){if(d<WILDLIFE.farAI)updateChimpanzee(m,dt,d);else{m.chimpStone=null;m.chimpTell=0;m.treeHeight=0;m.groundZ=0;m.evadeHeight=0;}continue;}
  if(d>WILDLIFE.farAI){m.signature=null;m.signatureCooldown=Math.max(m.signatureCooldown||0,1.2);m.vx=0;m.vy=0;m.evadeHeight=0;continue;}
  if(rareEngagementBlocked(m)){
   m.signature=null;m.signatureCooldown=Math.max(m.signatureCooldown||0,.9);
   m.alert=0;m.search=0;m.windup=0;m.chargeTime=0;
   m.attack=Math.max(m.attack,.35);m.vx=0;m.vy=0;
   continue;
  }
  if(m.strongBoss){
   scatterWildlifeAroundBoss(m,dt);
   revealBossPresence(m,d);
   if(m.hp<m.maxHp*.45&&!m.enragedAnnounced&&d<490&&visible(m.x,m.y,95)){
    m.enragedAnnounced=true;
    label(m.x,m.y-m.r-62,"激怒！ 攻撃速度が上がる","#ffa280");
    playEffect("snarl",{volume:.12,rate:.66});
    shake=Math.max(shake,4);
   }
   if(updateBossSignature(m,dt,d))continue;
  }
  if(m.type==="giantEagle"){updateFlyingEagle(m,dt);continue;}
  if(isAquaticStrong(m)){updateAquaticStrong(m,s,dt);continue;}
  const angle=Math.atan2(P.y-m.y,P.x-m.x);
  if(s.prey&&m.provokedUntil>0&&elapsed>=m.provokedUntil){
   m.provokedUntil=0;m.counterFleeUntil=0;
   startlePrey(m,P,"alarm"); // At the end of aggression it returns to normal flight.
  }
  const provoked=(m.releasedIndividualId&&m.releasedMood==="aggressive"&&d<410&&!lineBlocked(m,P))||isProvokedPrey(m,s,d);
  const spotted=(m.releasedIndividualId&&m.releasedMood==="aggressive"&&d<410&&!lineBlocked(m,P))||detectsPlayer(m,s,d)||
   (elapsed<(m.reactiveUntil||0)&&d<Math.max(190,P.r+m.r+125)&&!lineBlocked(m,P))||
   (provoked&&d<330&&!lineBlocked(m,P));
  if(m.type==="cheetah"){
   m.sprintCooldown=Math.max(0,(m.sprintCooldown||0)-dt);
   if(spotted&&d>95&&d<420&&m.sprintCooldown<=0&&m.alert>0){
    m.sprintTime=1.05;m.sprintCooldown=5.8;
    label(m.x,m.y-m.r-33,"瞬間加速！","#f4d29a");
   }
  }
  signalPack(m,spotted);
  // A pack member can now be alerted by another member on the same frame.
    if(territoryDetersDog(m)){m.flee=Math.max(m.flee,1.25);m.dir=Math.atan2(m.y-P.y,m.x-P.x);m.alert=0;m.search=0;}
   if(spotted){m.lastX=P.x;m.lastY=P.y;m.alert=s.prey?1.8:5.5;m.search=0}
   if(updateIndoorRest(m,s,dt,spotted,d))continue;
   let vx=0,vy=0;
   if(!s.prey)tryEnemyEmergencyEvade(m,s,d,spotted);
   if((m.evadeTime||0)>0){advanceEnemyEvade(m,dt);continue;}
   // Defensive goat: visible warning, stationary windup, real range/LOS hit,
   // then escape. It remains edible prey, not a permanently hostile monster.
   if(m.type==="mountainGoat"){
    m.headbuttTell=Math.max(0,(m.headbuttTell||0)-dt);
    if(m.headbuttTell>0&&d<P.r+m.r+120)m.dir=angle;
    if(m.headbuttTell===0&&m.headbuttArmed){
     m.headbuttArmed=false;m.swing=.28;
     if(d<P.r+m.r+36*(m.attackVariation?.reach||1)&&P.inv<=0&&(P.jumpHeight||0)<22&&!lineBlocked(m,P)){
      const damage=Math.max(3,Math.round(s.damage*enemyDamageFactor()*.78*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)*(m.attackVariation?.power||1)));
      P.hp=Math.max(0,P.hp-damage);P.inv=.48;P.lastCombatAt=elapsed;
      interruptRush();shake=Math.max(shake,6);applyOrdinaryStrikeEffect(m,angle);
      label(P.x,P.y-35,"角突き -"+damage,"#ffd0a1");playEffect("damage");
     }else if(d<230)label(m.x,m.y-m.r-24,"角突きを回避！","#b4e6c2");
     m.flee=Math.max(m.flee,2.4);m.dir=angle+Math.PI;
    }
    if(!m.headbuttArmed&&m.headbuttTell===0&&spotted&&d<P.r+m.r+38&&m.attack<=0&&P.inv<=0&&
       (elapsed<(m.counterFleeUntil||0)||(m.flee>0&&d<P.r+m.r+35))){
     m.attackVariation=COMBAT_LEVELS?.nextAttack(m);
     m.headbuttTell=.54*(m.attackVariation?.windup||1);m.headbuttArmed=true;
     m.attack=3.4*(m.attackVariation?.cooldown||1);m.dir=angle;
     label(m.x,m.y-m.r-32,m.attackVariation?.name||"角突きの予兆！","#ffc68c");
    }
   }
   // Small wildlife fights only when trapped or injured: bite, kick, peck or wing slap.
   // Prey normally flees; this move has a visible windup and can miss.
   if(["rat","rabbit","pigeon","crow","frog","snake"].includes(m.type)){
    m.cornerTell=Math.max(0,(Number(m.cornerTell)||0)-dt);
    if(m.cornerArmed&&m.cornerTell===0){
     m.cornerArmed=false;m.swing=.22;
     const biteRange=P.r+m.r+27*(m.attackVariation?.reach||1);
     const aimDelta=Math.atan2(Math.sin(angle-(m.cornerDir||0)),Math.cos(angle-(m.cornerDir||0)));
     if(d<biteRange&&P.inv<=0&&(P.jumpHeight||0)<22&&!lineBlocked(m,P)&&Math.abs(aimDelta)<1.2){
      const base=m.type==="rat"?2:m.type==="rabbit"?4:m.type==="pigeon"?2:m.type==="crow"?4:m.type==="frog"?1:4;
      const damage=Math.max(1,Math.round(base*(m.attackVariation?.power||1)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)));
      P.hp=Math.max(0,P.hp-damage);P.inv=.28;P.lastCombatAt=elapsed;
      if(m.type==="crow")P.strongWound=Math.max(P.strongWound||0,.45);
      if(m.type==="rabbit")move(P,Math.cos(angle)*9,Math.sin(angle)*9);
      if(m.type==="pigeon")P.sp=Math.max(0,P.sp-4);
      label(P.x,P.y-29,(m.attackVariation?.name||({rat:"噛みつき",rabbit:"後脚蹴り",pigeon:"翼の威嚇",crow:"くちばし",frog:"跳ね飛び",snake:"噛みつき"}[m.type]))+" -"+damage,"#ffd2a2");
     }
     m.flee=Math.max(m.flee||0,2.2);m.dir=angle+Math.PI;
    }
    if(!m.cornerArmed&&m.cornerTell===0&&spotted&&
       d<P.r+m.r+24&&m.attack<=0&&P.inv<=0&&
       ((m.flee||0)>0||m.hp<m.maxHp*.85)){
     m.attackVariation=COMBAT_LEVELS?.nextAttack(m)||null;
     m.cornerTell=(m.type==="snake"?.43:.51)*(m.attackVariation?.windup||1);
     m.cornerArmed=true;m.attack=(m.type==="snake"?2.1:2.8)*(m.attackVariation?.cooldown||1);
     m.cornerDir=angle;m.dir=angle;
     label(m.x,m.y-m.r-30,m.attackVariation?.name||"追い詰められた動物が反撃！","#ffe1a1");
    }
   }
   // Zebra and serow alternate distinct, telegraphed defensive moves.
   if(m.type==="zebra"||m.type==="serow"||m.type==="deer"){
    m.defenseTell=Math.max(0,(m.defenseTell||0)-dt);
    if(m.defenseArmed&&m.defenseTell===0){
     m.defenseArmed=false;m.swing=.28;
     const reach=(m.type==="zebra"?62:m.type==="deer"?57:54)*Math.min(1.32,m.attackVariation?.reach||1);
     if(d<P.r+m.r+reach&&P.inv<=0&&(P.jumpHeight||0)<22&&!lineBlocked(m,P)){
      const damage=Math.max(4,Math.round(s.damage*enemyDamageFactor()*(m.type==="zebra"?.92:m.type==="deer"?.96:.96)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1)*(m.attackVariation?.power||1)));
      P.hp=Math.max(0,P.hp-damage);P.inv=.46;P.lastCombatAt=elapsed;
      interruptRush();shake=Math.max(shake,5);applyOrdinaryStrikeEffect(m,angle);
      label(P.x,P.y-38,(m.type==="zebra"?"後ろ蹴り":m.type==="deer"?(m.attackVariation?"角の突き上げ":"後脚の蹴り"):"角突き")+" -"+damage,"#ffd2a5");playEffect("damage");
     }else if(d<230)label(m.x,m.y-m.r-25,"反撃を回避！","#b4e6c2");
     m.flee=Math.max(m.flee,1.8);m.dir=angle+Math.PI;
    }
    if(!m.defenseArmed&&m.defenseTell===0&&spotted&&d<P.r+m.r+65&&m.attack<=0&&P.inv<=0&&
       (elapsed<(m.counterFleeUntil||0)||(m.flee>0&&d<P.r+m.r+40))){
     m.attackVariation=COMBAT_LEVELS?.nextAttack(m);
     m.defenseTell=(m.type==="zebra"?.58:m.type==="deer"?.68:.62)*(m.attackVariation?.windup||1);
     m.defenseArmed=true;m.attack=(m.type==="zebra"?2.55:m.type==="deer"?3:3.20)*(m.attackVariation?.cooldown||1);
     m.dir=angle;label(m.x,m.y-m.r-32,m.attackVariation?.name||(m.type==="zebra"?"後ろ蹴りの予兆！":m.type==="deer"?"鹿の後ろ蹴り！":"カモシカの角突き！"),"#ffc68c");
    }
   }
   updateWoundedPreyDefense(m,s,dt,d,spotted,angle);
   if(s.prey&&!provoked&&spotted&&(d<135||P.noise>.65&&d<185||m.hp<m.maxHp)){
     m.flee=Math.max(m.flee,1.7);
     if(m.escapeTimer<=0||!clearStep(m,m.dir,65)){
       m.evasionSide=-(m.evasionSide||1);
       m.dir=chooseEscape(m,angle+Math.PI);m.escapeTimer=m.type==="rat"?.23:m.type==="pigeon"?.32:.64;
     }
    }
   if(provoked){
    // Counterattack for a few seconds, not endless pursuit. Stay on navigable
    // terrain; close enough for each species' existing bite/kick/headbutt AI.
    const preparing=m.cornerArmed||m.defenseArmed||m.headbuttArmed||m.counterFleeArmed;
    const recovering=m.stun>0||(m.swing||0)>0;
    const pause=elapsed<(m.provokedPauseUntil||0);
    if(preparing||recovering){vx=0;vy=0;}
    else if(pause){
     m.dir=chooseEscape(m,angle+Math.PI,P);
     vx=Math.cos(m.dir)*s.speed*.72;vy=Math.sin(m.dir)*s.speed*.72;
    }else if(d>P.r+m.r+12){
     m.dir=steerPursuit(m,P.x,P.y);
     const pace=m.type==="deer"||m.type==="zebra"||m.type==="serow"?.83:
       m.type==="mountainGoat"?.80:m.type==="carp"?.76:.88;
     vx=Math.cos(m.dir)*s.speed*pace;vy=Math.sin(m.dir)*s.speed*pace;
    }else{
     m.dir=angle;vx=0;vy=0;
    }
    m.flee=Math.max(0,(m.flee||0)-dt);
   }else if(m.flee>0){
    if((s.prey||m.type==="boar")&&!spotted&&(m.escapeTimer<=0||!clearStep(m,m.dir,56))){
      m.evasionSide=-(m.evasionSide||1);
      const hunter=nearbyAwareWildPredator(m,175);
      const threat=hunter||(Number.isFinite(m.fleeThreatX)&&Number.isFinite(m.fleeThreatY)?{x:m.fleeThreatX,y:m.fleeThreatY}:P);
      if(hunter){m.fleeThreatX=hunter.x;m.fleeThreatY=hunter.y;}
      m.dir=chooseEscape(m,Math.atan2(m.y-threat.y,m.x-threat.x),threat);
      m.escapeTimer=m.type==="rat"?.23:m.type==="pigeon"?.32:.64;
    }
    m.flee=Math.max(0,m.flee-dt);const burst=s.prey?(m.type==="serow"?1.08+1.07*m.fleeEnergy:m.type==="mountainGoat"?.82+.82*m.fleeEnergy:m.type==="rabbit"?.83+1.02*m.fleeEnergy:m.type==="pigeon"?.85+.87*m.fleeEnergy:.84+.57*m.fleeEnergy):1.3;vx=Math.cos(m.dir)*s.speed*burst;vy=Math.sin(m.dir)*s.speed*burst;
   }else if(s.prey&&spotted){
    m.dir=angle;m.wander=Math.max(m.wander,.3);vx=0;vy=0;
   }else if(!s.prey&&m.alert>0){
    m.alert=Math.max(0,m.alert-dt);
    const aim=Math.atan2(m.lastY-m.y,m.lastX-m.x);
    if(!spotted&&Math.hypot(m.lastX-m.x,m.lastY-m.y)<30){m.search=Math.max(m.search,1.15);m.alert=Math.min(m.alert,1.15)}
    if(m.search>0&&!spotted){
     m.search=Math.max(0,m.search-dt);
     if(m.wander<0){m.dir=aim+rnd(-1.6,1.6);m.wander=rnd(.3,.8)}
     vx=Math.cos(m.dir)*s.speed*.32;vy=Math.sin(m.dir)*s.speed*.32;
     }else{
      let targetX=m.lastX,targetY=m.lastY;
      // Hostile pack members take opposite reachable flanks; leader presses head-on.
      const packGoal=spotted?window.WildPackTactics?.flankGoal?.(m,P,mobs,(x,y,r)=>!collides(x,y,r+5)&&routeClear(m,{x,y},r)):null;
      if(packGoal){targetX=packGoal.x;targetY=packGoal.y;}
      else if((m.type==="dog"||m.type==="oneEyedWolf"||m.type==="albinoWolf")&&spotted&&d>120&&d<375){
       const heading=Math.hypot(P.vx,P.vy)>50?Math.atan2(P.vy,P.vx):P.dir,side=m.flankSide||1;
       const flankBack=m.type==="oneEyedWolf"?76:m.type==="albinoWolf"?95:48,flankSide=m.type==="oneEyedWolf"?125:m.type==="albinoWolf"?150:82;
       const fx=P.x-Math.cos(heading)*flankBack-Math.sin(heading)*side*flankSide;
       const fy=P.y-Math.sin(heading)*flankBack+Math.cos(heading)*side*flankSide;
       if(!collides(fx,fy,m.r+5)){targetX=fx;targetY=fy}
      }
      m.dir=steerPursuit(m,targetX,targetY);const chaseBoost=m.strongBoss?(m.hp<m.maxHp*.45?1.40:1.24):m.type==="giantHyena"?1.13:m.type==="giantLizard"&&d<215?1.17:m.type==="albinoWolf"?1.09:1;const cheetahBoost=m.type==="cheetah"&&m.sprintTime>0?1.58:1;
      vx=Math.cos(m.dir)*s.speed*chaseBoost*(m.speedScale||1)*cheetahBoost;
      vy=Math.sin(m.dir)*s.speed*chaseBoost*(m.speedScale||1)*cheetahBoost;
      if((m.type==="dog"||m.type==="alpha"||m.type==="oneEyedWolf"||m.type==="albinoWolf")&&spotted&&d>75&&d<235&&m.attack>.22){
       const around=m.dir+(m.flankSide||1)*1.08;
       if(clearStep(m,around,40)){m.dir=around;vx=Math.cos(around)*s.speed*.88;vy=Math.sin(around)*s.speed*.88;}
      }
     }
   }else{
    m.alert=Math.max(0,m.alert-dt);
    if(m.wander<0){m.dir+=rnd(-2.5,2.5);m.wander=rnd(.5,2.5)}
    vx=Math.cos(m.dir)*s.speed*.23;vy=Math.sin(m.dir)*s.speed*.23;
    if(m.packId&&m.packOrder>0&&!s.prey){
     const leader=mobs.find(q=>q.hp>0&&q.packId===m.packId&&q.packOrder===0);
     if(leader&&dist(m,leader)>85&&dist(m,leader)<440){
      const offset=(m.packOrder===1?1:-1)*58;
      const heading=leader.dir||0;
      const targetX=leader.x-Math.sin(heading)*offset,targetY=leader.y+Math.cos(heading)*offset;
      m.dir=steerPursuit(m,targetX,targetY);
      vx=Math.cos(m.dir)*s.speed*.68;vy=Math.sin(m.dir)*s.speed*.68;
     }
    }
   }
   m.wildAttack=Math.max(0,(m.wildAttack||0)-dt);
   m.feedAfterKill=Math.max(0,(m.feedAfterKill||0)-dt);
   if((s.prey||m.type==="boar")&&!provoked&&!spotted){
    const hunter=nearbyAwareWildPredator(m,140);
    if(hunter){
     m.fleeThreatX=hunter.x;m.fleeThreatY=hunter.y;
     m.dir=chooseEscape(m,Math.atan2(m.y-hunter.y,m.x-hunter.x),hunter);
     m.flee=Math.max(m.flee,1);
     vx=Math.cos(m.dir)*s.speed*1.15;vy=Math.sin(m.dir)*s.speed*1.15;
    }
   }
   if(s.prey&&!provoked&&tryPreyFeint(m,s,d,spotted,dt))continue;
   defendBuffaloHerd(m);
   const wildHunt=huntWildPrey(m,s,spotted,d);
   if(wildHunt){vx=wildHunt.vx;vy=wildHunt.vy;}
   const scavenging=!wildHunt&&!s.prey&&m.type!=="boar"&&m.type!=="giantBoar"&&m.type!=="giantMoose"&&m.type!=="giantBuffalo"&&m.type!=="rhino"&&m.type!=="giantGorilla"&&m.type!=="giantElephant"?scavengeWildFood(m,s,dt,spotted,d):null;
   const foraging=!provoked&&WILD_FORAGERS.has(m.type)?forageWildBerries(m,s,dt,spotted,d):null;
   const drinking=!provoked&&!wildHunt&&!scavenging&&!foraging?drinkWildWater(m,s,dt,spotted,d):null;
   if(scavenging||foraging||drinking){
    const feeding=scavenging||foraging||drinking;
    vx=feeding.vx;vy=feeding.vy;
    m.wander=Math.max(m.wander,.25);
   }
   // Day-active prey travels to nearby real cover before sleeping at night.
   if(!provoked&&!scavenging&&!foraging&&!drinking&&!spotted&&m.alert<=0&&m.flee<=0&&
      m.stun<=0&&m.windup<=0&&m.chargeTime<=0){
    const nightCover=followNightCover(m,s,dt);
    if(nightCover){vx=nightCover.vx;vy=nightCover.vy;m.wander=Math.max(m.wander,.25);}
   }
   if(weather==="RAIN"||weather==="THUNDER"){
    const calm=!spotted&&m.alert<=0&&m.flee<=0&&m.windup<=0&&m.stun<=0&&m.chargeTime<=0;
    const hunting=!!wildHunt||!!scavenging||!!foraging||(!s.prey&&mobs.some(q=>q!==m&&q.hp>0&&species[q.type].prey&&dist(m,q)<170));
    m.sheltered=insideShelter(m);
    if(calm&&!hunting){
     const retreat=followRainShelter(m,s,dt);
     if(retreat){vx=retreat.vx;vy=retreat.vy;}
    }
   }else{
    m.sheltered=false;m.shelterX=null;m.shelterY=null;m.shelterRefresh=0;
    m.shelterDoorX=null;m.shelterDoorY=null;m.shelterPhase=0;
   }
   if(!s.prey&&m.windup>0){
    vx=0;vy=0;m.windup=Math.max(0,m.windup-dt);
    if(m.windup===0){
     m.swing=.22; // Physical strike pose even if the attack misses.
     if((m.type==="boar"||m.type==="alpha"||m.type==="strayCat"||m.type==="wildFox"||m.type==="giantBoar"||m.type==="blackPanther"||m.type==="oneEyedWolf"||m.type==="whiteTiger"||m.type==="giantMoose"||m.type==="giantBuffalo"||m.type==="rhino"||m.type==="albinoWolf")&&m.stun<=0){
      m.chargeTime=m.type==="alpha"?.24:m.type==="strayCat"?.20:m.type==="wildFox"?.24:m.type==="blackPanther"?.31:m.type==="oneEyedWolf"?.28:m.type==="whiteTiger"?.39:m.type==="giantBoar"?.45:m.type==="giantMoose"?.46:m.type==="giantBuffalo"?.53:m.type==="rhino"?.57:m.type==="albinoWolf"?.33:.36;m.chargeDir=m.strikeDir;m.chargeHit=false;
      label(m.x,m.y-m.r-24,(m.type==="alpha"||m.type==="strayCat"||m.type==="wildFox"||m.type==="blackPanther"||m.type==="whiteTiger"||m.type==="oneEyedWolf")?"飛びかかり！":"突進！","#ffbf81");
     }else{
      const reach=ordinaryMeleeReach(m),dStrike=dist(P,m),overlap=hitboxesOverlap(P,m,dStrike),aim=dStrike>.001?Math.atan2(P.y-m.y,P.x-m.x):(m.strikeDir||m.dir||0);
      const delta=Math.atan2(Math.sin(aim-m.strikeDir),Math.cos(aim-m.strikeDir));
      if(m.type==="giantGorilla"&&m.stun<=0&&dist(P,m)>P.r+m.r+37){
       const dir=m.strikeDir,rx=m.x+Math.cos(dir)*m.r*.9,ry=m.y+Math.sin(dir)*m.r*.9;
       m.rock={x:rx,y:ry,vx:Math.cos(dir)*540,vy:Math.sin(dir)*540,ttl:.52};label(m.x,m.y-m.r-35,"投石！","#f1d5b6");
      }else if(m.stun<=0&&P.inv<=0&&(P.jumpHeight||0)<22&&dStrike<reach&&(overlap||Math.abs(delta)<(m.attackVariation?.arc||.92))&&(overlap||!lineBlocked(m,P))){
       const damage=(P.lastCombatAt=elapsed,strongDamageTaken(Math.round(s.damage*(m.strongBoss?bossStrikePower(m):(m.damageScale||enemyDamageFactor()))*(STRONG_ATTACK_PROFILES[m.type]?.damage||1)*(m.attackVariation?.power||1)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1))));
       {P.hp-=damage;interruptRush();P.inv=.42;shake=9;flash=.23;
       label(P.x,P.y-35,"-"+damage,"#ff9890");
       blood(P.x,P.y,"#eb6356",12,125);playEffect("damage");applyStrongStrikeEffect(m,aim,false);applyOrdinaryStrikeEffect(m,aim);
       if(m.type==="venomSnake")inflictVenom(m);
       if(m.type==="giraffe"&&m.attackVariation?.neckStrike){
        // The ossicone/neck hit has longer reach and a different knockback from hoof kicks.
        move(P,Math.cos(aim)*32,Math.sin(aim)*32);
        P.sp=clamp(P.sp-18,0,100);
        label(P.x,P.y-47,"首と頭の一撃！","#ffd9a5");
       }else if(m.type==="elephant"||m.type==="hippo"){
        const shove=m.type==="elephant"?48:33;
        move(P,Math.cos(aim)*shove,Math.sin(aim)*shove);
        P.sp=clamp(P.sp-(m.type==="elephant"?12:8),0,100);
        label(P.x,P.y-45,m.type==="elephant"?"鼻で吹き飛ばされた！":"カバの体当たり！","#ffd9ad");
       }else if(m.type==="giraffe"){
        P.sp=clamp(P.sp-8,0,100);
       }
       if(m.type==="giantLion"){if(m.lionCombo){m.lionCombo=0;}else{m.lionCombo=1;m.windup=.48;m.windupTotal=.48;m.strikeDir=aim;label(m.x,m.y-m.r-24,"連撃！","#ffc589");}}}
      }else if(dist(P,m)<reach+50){m.stun=Math.max(m.stun,.24);label(m.x,m.y-m.r-16,"空振りの隙！","#a6f5d8");}
     }
    }
   }
   // A missed, blocked or interrupted lion follow-up ends the combo; no stale save state.
   if(m.type==="giantLion"&&m.lionCombo&&m.windup<=0)m.lionCombo=0;
   const charging=!s.prey&&m.chargeTime>0&&m.stun<=0;
   const chargeSpeed=m.type==="alpha"?2.3:m.type==="strayCat"?2.15:m.type==="wildFox"?2.27:m.type==="blackPanther"?2.85:m.type==="oneEyedWolf"?2.65:m.type==="whiteTiger"?3.05:m.type==="giantBoar"?3.25:m.type==="giantMoose"?2.85:m.type==="giantBuffalo"?3.15:m.type==="albinoWolf"?2.85:3.65;
   if(charging){
    m.chargeTime=Math.max(0,m.chargeTime-dt);
    m.dir=m.chargeDir;vx=Math.cos(m.chargeDir)*s.speed*chargeSpeed;vy=Math.sin(m.chargeDir)*s.speed*chargeSpeed;
   }
   if(m.stun>0){vx=0;vy=0;m.chargeTime=0}
   if((m.type==="mountainGoat"&&m.headbuttTell>0)||((m.type==="zebra"||m.type==="serow"||m.type==="deer")&&m.defenseTell>0)||m.cornerTell>0){vx=0;vy=0;}
   const ox=m.x,oy=m.y;move(m,vx*dt,vy*dt);m.vx=(m.x-ox)/Math.max(.001,dt);m.vy=(m.y-oy)/Math.max(.001,dt);m.step+=Math.hypot(m.x-ox,m.y-oy)*.05;
   if(charging){
    const ddx=m.x-ox,ddy=m.y-oy,denom=ddx*ddx+ddy*ddy;
    const t=denom>0?clamp(((P.x-ox)*ddx+(P.y-oy)*ddy)/denom,0,1):0;
    if(!m.chargeHit&&(P.jumpHeight||0)<22&&Math.hypot(P.x-ox-t*ddx,P.y-oy-t*ddy)<P.r+m.r+4&&!lineBlocked(m,P)){
     m.chargeHit=true;m.chargeTime=0;
     if(P.inv<=0){
      const damage=(P.lastCombatAt=elapsed,strongDamageTaken(Math.round(s.damage*(m.strongBoss?bossStrikePower(m):(m.damageScale||enemyDamageFactor()))*(STRONG_ATTACK_PROFILES[m.type]?.damage||1)*(m.attackVariation?.power||1)*(COMBAT_LEVELS?.incoming(m.type,P.level)||1))));
      if(damage===0){P.inv=.12;shake=3;flash=0;}
       else{P.hp-=damage;interruptRush();P.inv=.52;shake=11;flash=.27;
      label(P.x,P.y-35,"突進 -"+damage,"#ff9890");
      blood(P.x,P.y,"#eb6356",15,150);playEffect("damage");applyStrongStrikeEffect(m,m.chargeDir,true);applyOrdinaryStrikeEffect(m,m.chargeDir);}
     }else label(P.x,P.y-35,"無傷","#a6f5d8");
    }
    const forward=ddx*Math.cos(m.chargeDir)+ddy*Math.sin(m.chargeDir);
    if(forward<s.speed*chargeSpeed*dt*.4){
     m.chargeTime=0;m.stun=Math.max(m.stun,.7);
     label(m.x,m.y-m.r-20,"激突！","#bdf6cc");
    }else if(m.chargeTime<=0){
     m.stun=Math.max(m.stun,.55);
     label(m.x,m.y-m.r-20,"隙！","#bdf6cc");
    }
   }
   if(ox===m.x&&oy===m.y&&!charging){m.dir+=1.7;m.wander=0;if(!s.prey)m.avoidSide=-(m.avoidSide||1)}
   if(!s.prey&&m.windup<=0&&m.chargeTime<=0&&m.stun<=0&&d<P.r+m.r+(STRONG_ATTACK_PROFILES[m.type]?.reach??(m.type==="boar"?115:m.type==="alpha"?112:29))&&(spotted||m.alert>0)&&m.attack<=0&&!lineBlocked(m,P)){
    const variant=!m.strongBoss?COMBAT_LEVELS?.nextAttack(m):null;
    m.attackVariation=variant;
    m.windupTotal=(STRONG_ATTACK_PROFILES[m.type]?.windup??(m.type==="boar"?.68:m.type==="alpha"?.60:.45))*(variant?.windup||1);
    m.windup=m.windupTotal;P.lastCombatAt=elapsed;m.strikeDir=angle;
    m.attack=(STRONG_ATTACK_PROFILES[m.type]?.cooldown??(m.type==="boar"?1.32:m.type==="alpha"?1.42:.98))*(variant?.cooldown||1);
    m.dir=angle;label(m.x,m.y-m.r-24,variant?.name||(STRONG_ATTACK_PROFILES[m.type]?.tell??(m.type==="boar"?"突進予兆！":m.type==="alpha"?"跳躍予兆！":"危険！")),"#ffb76d");
    playEffect("snarl");
   }
 }
 // Pack pressure is an avoidable combat event: leave the ring, hide, or break LOS.
 window.WildPackTactics?.update?.(dt,P,mobs,(a,b)=>!lineBlocked(a,b),{
  warn:()=>{label(P.x,P.y-57,"群れが包囲してくる！","#ffcd9c");playEffect("snarl",{volume:.12});},
  hit:()=>{P.sp=Math.max(0,P.sp-14);P.revealTimer=Math.max(P.revealTimer||0,.9);P.noiseBurst=Math.max(P.noiseBurst||0,.8);label(P.x,P.y-54,"包囲の威圧！ 持久力 -14","#ffb68e");notify("群れに囲まれた！ 距離と遮蔽物で回避");},
  escape:()=>{label(P.x,P.y-50,"包囲を回避！","#b8f1ce");}
 });
 if(P.hp<=0){P.hp=0;beginDeath();return;}
 for(let i=mobs.length-1;i>=0;i--)if(mobs[i].hp<=0)mobs.splice(i,1); // Only dead animals are removed.
 for(let i=carcasses.length-1;i>=0;i--)if((carcasses[i].ttl-=dt)<=0){if(carcasses[i].type==="corpse")toBones(carcasses[i]);else carcasses.splice(i,1)}
 for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.life-=dt;q.x+=(q.vx||0)*dt;q.y+=(q.vy||0)*dt;if(q.life<=0)particles.splice(i,1)}
 for(let i=popups.length-1;i>=0;i--){popups[i].life-=dt;popups[i].y-=28*dt;if(popups[i].life<=0)popups.splice(i,1)}
 spawnTimer+=dt;
 if(spawnTimer>WILDLIFE.spawnInterval){spawnTimer=0;maintainLocalWildlife();syncStrongBossChallenge();enterStrongStage();}
 territorySupply();checkMission();shake*=Math.max(0,1-dt*9);flash=Math.max(0,flash-dt);
 if(toastTime>0){toastTime-=dt;if(toastTime<=0)$("toast").classList.remove("show")}

 const visualTarget=playerVisualCameraTarget(),cameraFollow=Math.min(1,dt*(P.type==="fox"&&P.abilityTime>0?11:6));
 cam.x+=(visualTarget.x-cam.x)*cameraFollow;
 cam.y+=(visualTarget.y-cam.y)*cameraFollow;
 audioTick+=dt;
 if(audioTick>.35){
  audioTick=0;
  window.WildAudio?.update({weather,area:regionAt(P.x,P.y),mode:"play",...waterSoundAt(P.x,P.y),
   danger:mobs.some(m=>m.hp>0&&!m.companion&&!species[m.type].prey&&dist(P,m)<(m.strongBoss?515:290))});
 }
 uiTimer+=dt;if(uiTimer>.14){uiTimer=0;syncHUD(hr);drawMini()}
 autosaveClock+=dt;if(autosaveClock>=1){autosaveClock=0;saveAuto();}
}
function syncHUD(hour){
 if(!P)return;
 syncSquadHud();
 const setBar=(name,v)=>$(name).style.width=clamp(v,0,100)+"%";
 setBar("hp-bar",P.hp/P.maxHp*100);setBar("food-bar",P.hunger);setBar("sp-bar",P.sp);
 $("hp-text").textContent=Math.ceil(P.hp)+" / "+P.maxHp+(P.strongWound>0?"｜出血 "+Math.ceil(P.strongWound)+"秒":"")+(Number.isFinite(P.ageYears)?(P.squadIndividualId?"｜年齢 "+P.ageYears.toFixed(1)+"歳":"｜年齢 "+P.ageYears.toFixed(1)+"歳"):"");
 $("poison-status").classList.toggle("hidden",!(P.poisonTime>0));
 if(P.poisonTime>0)$("poison-status").textContent="☠ 毒 "+Math.ceil(P.poisonTime)+"秒｜生命が減少";
 $("food-text").textContent=Math.ceil(P.hunger)+"%"+(P.hunger<=0?"｜飢餓：生命 -2.4/秒":P.hunger<=16?"｜空腹に注意":"");$("sp-text").textContent=Math.ceil(P.sp)+"%";
  $("den-status").textContent="巣 LV"+denLevel+"｜運搬 "+(P.carry?foodName(P.carry)+" "+Math.ceil(P.carry.amount):"なし")+"｜縄張り "+territoryOwned()+"/3"+(insideShelter(P)?"｜屋内":"");
 const target=denLevel<3?DEN_COSTS[denLevel+1]:denCapacity();
 $("den-stash-count").textContent="備蓄 "+Math.round(denStash)+" / "+target+"pt"+(denLevel<DEN_MAX_LEVEL?"（LV"+(denLevel+1)+"まで・消費なし）":"（容量）");
 setBar("den-stash-bar",denStash/target*100);
 $("den-stash-bar").parentElement.setAttribute("aria-valuenow",String(Math.round(denStash)));
 $("den-stash-bar").parentElement.setAttribute("aria-valuemax",String(target));
 const entrance=nearestShelterEntrance();
 const nearDoor=!!entrance&&entrance.distance<112;
 $("shelter-hint").classList.toggle("hidden",!nearDoor);
 if(nearDoor)$("shelter-hint").textContent=(weather==="RAIN"||weather==="THUNDER"?
  "青い「建物入口」へ進むと雨宿りできます（ボタン不要）":
  "青い「建物入口」から歩いて入れます（ボタン不要）");

 $("level").textContent="LV "+String(P.level).padStart(2,"0");setBar("xp-bar",P.xp/P.nextXp*100);
 const zone=regionAt(P.x,P.y);$("district-tag").textContent="AREA "+String(zone+1).padStart(2,"0")+" / 08";$("district").textContent=districts[zone];
  const windArrow=["→","↘","↓","↙","←","↖","↑","↗"][Math.round(((windDirection%(Math.PI*2)+Math.PI*2)%(Math.PI*2))/(Math.PI/4))%8];
  $("day-label").textContent="YEAR "+String(Math.floor(elapsed/120)).padStart(3,"0");
 const moon=moonlightProfile(elapsed,weather);
 $("moon-label").textContent=moon.symbol+" 月齢 "+moon.age.toFixed(1)+" · "+moon.name+(currentSnowpack()>.08?" · 積雪 "+Math.round(currentSnowpack()*100)+"%":"");
 const info=missionInfo();
 const stock=stockpileStep();
 const carryGuide=P.carry?(atDen()?"巣の中：○で"+foodName(P.carry)+"を備蓄":"運搬中 "+foodName(P.carry)+"：○短押し 食べる／長押し 置く／巣で備蓄"):null;
 const lessonHint=mission===1?"緑の茂みの中で約1秒止まろう":mission===2?"獲物を△で狩ろう。□で飛びつき":null;
 $("stockpile-guide").classList.toggle("hidden",(!stock&&!carryGuide&&!lessonHint)||mode!=="play");
 if(carryGuide||stock||lessonHint)$("stockpile-guide").textContent=carryGuide||(stock?stock.text+"（巣に1回預けたら完了）":lessonHint);
 $("mission-progress").textContent=info.stage;
 $("mission-title").textContent=info.title;
 $("survival-goal").classList.toggle("hidden",mission<7||mode!=="play");
 if(mission>=7)$("survival-goal").textContent=fieldQuestInfo().summary;
 $("mission-sub").textContent=info.detail;
 $("mission-next").textContent=info.next?"次の目的："+info.next:"";
 $("mission-next").classList.toggle("hidden",mission>=7);
 $("mission-nav").classList.toggle("hidden",mission>=7);
 $("mission-bar").parentElement.classList.toggle("hidden",false);
 setBar("mission-bar",info.progress*100);
 const objective=getObjective(),waypoint=objective&&guidancePoint(objective);
 guideWisp=waypoint&&!waypoint.blocked?{x:waypoint.x,y:waypoint.y}:null;
 guideGoal=objective&&Number.isFinite(objective.x)&&Number.isFinite(objective.y)?{x:objective.x,y:objective.y,label:objectiveShortLabel()}:null;
 $("nav-distance").textContent=waypoint&&!waypoint.blocked?"目的地まで約"+Math.round(dist(P,objective))+"m":"目的地を探索中";
 const speciesSkill=$("species-skill-status");
 if(speciesSkill){
  const text=P.type==="manul"?"伏撃：しゃがみ・岩陰からの初撃が強力":
   P.type==="tibetanFox"?"小動物を探して急襲｜肉・腐肉の回復効率＋18%":
   P.type==="shoebill"?"静止照準 "+Math.round(Math.min(1,(P.stillTime||0)/1.15)*100)+"%｜構えて嘴の高速突き":"";
  speciesSkill.textContent=text;
  speciesSkill.classList.toggle("hidden",!text);
 }
 const contextLabel=$("context-action-label");
 if(contextLabel){const home=atDen();
  contextLabel.textContent=home&&P.carry?"備蓄":home&&denLevel<DEN_MAX_LEVEL&&denStash>=DEN_COSTS[denLevel+1]?"長押し強化":home?"食料庫":P.carry?"食べる/置く":nearbyFood()?(mission===4?"長押し運ぶ":"食べる"):nearestTerritoryPost()?"縄張り":"行動";}
  $("kill-line").textContent="HUNT "+String(kills).padStart(2,"0");
 $("score-line").textContent="SCORE "+String(Math.floor(elapsed*4+kills*88+(P.level-1)*110+totalScore)).padStart(6,"0");
 $("combo-line").textContent=P.comboTimer>0&&P.combo>1?"COMBO ×"+P.combo:"";
 $("jump-touch").style.opacity=P.jumpCD>0||P.sp<(P.type==="cat"?14:P.type==="wolf"?22:17)?".45":"1";
 $("dash-touch").style.opacity=P.dash>0||P.sp<(P.type==="wolf"?27:P.type==="cat"?19:22)?".5":"1";
}
function drawWorldMap(){
 if(!P)return;
 const nearby=mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius);
 const prey=nearby.filter(m=>species[m.type].prey).length;
 $("map-place").textContent="周辺の動物 "+nearby.length+"匹（獲物 "+prey+"・敵 "+(nearby.length-prey)+"）／全域で生存 "+mobs.filter(m=>m.hp>0).length+"匹。遠方の個体も保持。"+
  ((weather==="RAIN"||weather==="THUNDER")?"　野鳥の羽休め "+birdFlocks.filter(b=>b.roostState==="rest").length+"/"+birdFlocks.length+"羽。":"");
 const width=bigMap.width,height=bigMap.height,X=x=>x/WORLD.w*width,Y=y=>y/WORLD.h*height;
 bm.clearRect(0,0,width,height);bm.fillStyle="#142b28";bm.fillRect(0,0,width,height);
 const regions=BIOME_AREAS.map((a,i)=>[a[0],a[1],a[2],a[3],districts[i],a[4]]);
 for(const [x,y,w,h,name,color] of regions){
  bm.fillStyle=color;bm.fillRect(X(x),Y(y),X(w),Y(h));
  bm.fillStyle="#d2dfd5";bm.font="10px sans-serif";bm.textAlign="center";
  bm.fillText(name,X(x+w/2),Y(y)+17);
 }
 if(MOUNTAIN){
  bm.fillStyle="#334d3b";bm.fillRect(X(MOUNTAIN.WEST),0,X(MOUNTAIN.EAST-MOUNTAIN.WEST),height);
  bm.strokeStyle="#b5aa82";bm.lineWidth=4;bm.beginPath();
  for(let x=MOUNTAIN.WEST;x<=MOUNTAIN.EAST;x+=60){
   const y=MOUNTAIN.trail(x);
   if(x===MOUNTAIN.WEST)bm.moveTo(X(x),Y(y));else bm.lineTo(X(x),Y(y));
  }bm.stroke();
  bm.fillStyle="#e0eac9";bm.font="bold 12px sans-serif";bm.textAlign="center";
  bm.fillText("山麓の森",X(9200),Y(3000));
  if(MOUNTAIN.gorge){bm.fillStyle="#c4d2c5";bm.fillText("山腹・渓谷",X(10950),Y(2900));}
  if(MOUNTAIN.SUMMIT_START){bm.fillText("山頂の岩場",X(12420),Y(2900));bm.fillText("山頂洞窟",X(13200),Y(3150));}
 }
 for(const seg of WATER_RIBBONS){bm.fillStyle=seg.kind==="river"?"#4d9ca9":"#3c87a3";bm.beginPath();seg.pts.forEach((p,i)=>i?bm.lineTo(X(p[0]),Y(p[1])):bm.moveTo(X(p[0]),Y(p[1])));bm.closePath();bm.fill();}
  bm.fillStyle="#586666";
 for(const x of roadsX)bm.fillRect(X(x-75),0,Math.max(2,X(150)),height);
 for(const y of roadsY)bm.fillRect(0,Y(y-75),width,Math.max(2,Y(150)));
 for(const b of buildings){
  bm.fillStyle=b.roofZ?"#8277a4":"#394b4e";
  bm.fillRect(X(b.x),Y(b.y),Math.max(2,X(b.w)),Math.max(2,Y(b.h)));
 }
 const mark=(x,y,color,r=6)=>{
  bm.fillStyle=color;bm.strokeStyle="#0c1515";bm.lineWidth=2;
  bm.beginPath();bm.arc(X(x),Y(y),r,0,TWO);bm.fill();bm.stroke();
 };
 for(const site of EXPLORE_SITES){
  const found=discoveredSites.includes(site.id);
  // The departure location can coincide exactly with a discovery point.
  if(dist(P,site)>65)mark(site.x,site.y,found?"#99e9c7":"#c0b9a2",found?5:4);
  bm.fillStyle=found?"#d5f8db":"#f6e1c6";bm.font="bold 10px sans-serif";bm.textAlign="left";
  bm.fillText(found?site.name:"未踏の探索地点",clamp(X(site.x)+7,8,width-94),clamp(Y(site.y)-7,24,height-4));
 }
 bm.fillStyle="rgba(139,226,168,.12)";bm.strokeStyle="#a0e7bc";bm.lineWidth=1.5;
 for(const site of denSites){
  bm.beginPath();bm.arc(X(site.x),Y(site.y),X(denRadius()),0,TWO);bm.fill();bm.stroke();
  mark(site.x,site.y,site.z>0?"#90d7fc":"#9ee5ac",site.z>0?7:8);
 }
 mark(STATION.x,STATION.y,"#83cde3",7);
 for(let i=0;i<3;i++){
  const p=TERRITORY_POSTS[i],owned=territoryClaims[i];
  mark(p.x,p.y,owned?"#8cf3ae":"#c7a476",5);
  bm.fillStyle=owned?"#b7f6c4":"#f4d5a4";bm.font="bold 10px sans-serif";
  bm.fillText((owned?"確保 ":"未確保 ")+p.name,X(p.x)+7,Y(p.y)-8);
 }
 bm.font="bold 12px sans-serif";bm.textAlign="left";bm.fillStyle="#e9f7e3";
 for(const site of denSites)bm.fillText(site.name+" LV"+denLevel,X(site.x)+12,Y(site.y)-10);
 bm.fillText("桜坂駅跡",X(STATION.x)+10,Y(STATION.y)+22);
 for(const q of carcasses)if(q.ttl>0&&edibleFood(q)&&dist(P,q)<650)mark(q.x,q.y,"#f9da7c",3);
 for(const m of mobs)if(m.hp>0&&dist(P,m)<650){
   if(species[m.type].prey){if(dist(P,m)<260)mark(m.x,m.y,"#e7dcb1",3)}
   else mark(m.x,m.y,"#eb847b",4);
  }
 for(const e of window.WildDisaster?.events?.()||[]){
  if(!["flood","wildfire"].includes(e.kind)||elapsed/120-e.year>=e.duration)continue;
  const isFire=e.kind==="wildfire";
  bm.save();bm.fillStyle=isFire?"rgba(229,91,24,.38)":"rgba(35,143,190,.38)";bm.strokeStyle=isFire?"#ffc07b":"#90e7ff";bm.lineWidth=2;
  bm.beginPath();bm.ellipse(X(e.x),Y(e.y),X(e.radius),Y(e.radius),0,0,TWO);bm.fill();bm.stroke();bm.restore();
 }
 const obj=getObjective();if(obj&&mission!==3&&dist(P,obj)>85)mark(obj.x,obj.y,"#f1d885",4);
 // High-contrast directional marker in true world coordinates (including waterfront).
 bm.save();bm.translate(X(P.x),Y(P.y));
 const facing=Number.isFinite(P.dir)?P.dir:0;
 const mapHeading=Math.atan2(Math.sin(facing)*height/WORLD.h,Math.cos(facing)*width/WORLD.w);
 bm.rotate(mapHeading+Math.PI/2);
 bm.beginPath();bm.arc(0,0,12,0,TWO);bm.fillStyle="#0d342e";bm.fill();
 bm.strokeStyle="#eaffb2";bm.lineWidth=2.5;bm.stroke();
 bm.beginPath();bm.moveTo(0,-9);bm.lineTo(6,7);bm.lineTo(0,3);bm.lineTo(-6,7);bm.closePath();
 bm.fillStyle="#ffffff";bm.fill();bm.strokeStyle="#13382c";bm.lineWidth=1.8;bm.stroke();bm.restore();
 bm.fillStyle="#fff";bm.font="bold 13px sans-serif";
 bm.fillText("現在地",clamp(X(P.x)+11,8,width-64),clamp(Y(P.y)-10,35,height-5));
 bm.lineWidth=1;bm.strokeStyle="#839d8f";bm.strokeRect(.5,.5,width-1,height-1);
 const zone=regionAt(P.x,P.y),area=mountainHabitat(P.x,P.y)?({foothill:"山麓の森",slope:"山腹・渓谷",summit:"山頂の岩場",cave:"山頂洞窟"}[MOUNTAIN.zone(P.x)]||"山地"):districts[zone],eco=ecology[zone];
 $("map-place").textContent="現在地："+area+"｜探索 "+discoveredSites.length+"/"+EXPLORE_SITES.length+
 "｜獲物 "+eco.prey+"・捕食者 "+eco.predators+"｜勢力 "+CLAN_NAMES[zone]+(eco.dominance?"（交代"+eco.dominance+"）":"")+
 "｜"+ecologyNews;
 $("map-perks").textContent="探索能力 "+earnedDiscoveries.length+"/6：" +
 (earnedDiscoveries.length?earnedDiscoveries.map(id=>DISCOVERY_PERKS[id].name).join("・"):"未解放。未踏地点を訪れると成長します");
}
function toggleWorldMap(){
 if(mode==="play"){
  resetControls();mode="map";$("world-map").classList.remove("hidden");drawWorldMap();
 }else if(mode==="map"){mode="play";$("world-map").classList.add("hidden")}
}
const MINI_SPANS=[1270,1905,2800],MINI_SCALE_NAMES=["標準","遠目","広域"];
let miniScaleIndex=0;
function drawMini(){
 if(!P)return;
 const w=mini.width,h=mini.height,span=MINI_SPANS[miniScaleIndex];
 const X=x=>(x-P.x+span/2)/span*w,Y=y=>(y-P.y+span*h/w/2)/span*w;
 mc.fillStyle="#19332e";mc.fillRect(0,0,w,h);
 if(MOUNTAIN&&P.x>7800){
  mc.fillStyle="#35523b";mc.fillRect(X(MOUNTAIN.WEST),0,w*(MOUNTAIN.EAST-MOUNTAIN.WEST)/span,h);
  mc.fillStyle="#759364";
  for(let x=10620;x<=11530;x+=65){const cy=MOUNTAIN.center(x),reach=MOUNTAIN.southReach(x);
   mc.fillRect(X(x),Y(cy+620),Math.max(1,65/span*w),Math.max(0,(reach-650)/span*w));
  }
  mc.strokeStyle="#c5ad83";mc.lineWidth=2;mc.beginPath();
  for(let x=10380;x<=11360;x+=60){if(x===10380)mc.moveTo(X(x),Y(MOUNTAIN.meadowTrail(x)));else mc.lineTo(X(x),Y(MOUNTAIN.meadowTrail(x)));}mc.stroke();
  mc.strokeStyle="#b1a27a";mc.lineWidth=3;mc.beginPath();
  for(let x=MOUNTAIN.WEST;x<=MOUNTAIN.EAST;x+=70){
   const px=X(x),py=Y(MOUNTAIN.trail(x));
   if(x===MOUNTAIN.WEST)mc.moveTo(px,py);else mc.lineTo(px,py);
  }mc.stroke();
 }
 for(const seg of WATER_RIBBONS){if(Math.abs(seg.cx-P.x)>span||Math.abs(seg.cy-P.y)>span)continue;mc.fillStyle=seg.kind==="river"?"#4897a7":"#387f9a";mc.beginPath();seg.pts.forEach((p,i)=>i?mc.lineTo(X(p[0]),Y(p[1])):mc.moveTo(X(p[0]),Y(p[1])));mc.closePath();mc.fill();}
  mc.fillStyle="#465553";
 for(const x of roadsX)if(Math.abs(x-P.x)<span)mc.fillRect(X(x-75),0,w*150/span,h);
 for(const y of roadsY)if(Math.abs(y-P.y)<span)mc.fillRect(0,Y(y-75),w,w*150/span);
 mc.fillStyle="#344d45";
 for(const b of buildings)if(Math.hypot(b.x+b.w/2-P.x,b.y+b.h/2-P.y)<span){
  mc.fillStyle=b.interior?"#b7d9a5":"#344d45";
  mc.fillRect(X(b.x),Y(b.y),Math.max(2,b.w/span*w),Math.max(2,b.h/span*w));
  if(b.interior){mc.fillStyle="#152d29";mc.fillRect(X(b.x+16),Y(b.y+16),Math.max(2,(b.w-32)/span*w),Math.max(2,(b.h-32)/span*w))}
 }
 // Live flood boundaries are shown on the minimap, including their dry bypasses.
 for(const e of window.WildDisaster?.events?.()||[]){
  if(!["flood","wildfire"].includes(e.kind)||elapsed/120-e.year>=e.duration)continue;
  const isFire=e.kind==="wildfire";
  mc.save();mc.strokeStyle=isFire?"#ffad62":"#7bdcf6";mc.fillStyle=isFire?"rgba(229,91,24,.30)":"rgba(35,143,190,.30)";mc.lineWidth=1.6;
  mc.beginPath();mc.arc(X(e.x),Y(e.y),e.radius*w/span,0,TWO);mc.fill();mc.stroke();mc.restore();
 }
 // Classify live wildlife by actual species, alert state and strength relative to the player.
 const visibleMobs=mobs.filter(m=>m.hp>0&&Math.abs(m.x-P.x)<span/2&&Math.abs(m.y-P.y)<span/2)
  .sort((a,b)=>dist(P,a)-dist(P,b)).slice(0,30);
 for(const m of visibleMobs){
  const sp=species[m.type],powerful=!!m.strongBoss||m.type==="alpha"||
   (!sp.prey&&m.type!=="boar"&&m.maxHp>P.maxHp*1.65&&sp.damage>P.damage*1.35)||
   (m.type==="boar"&&m.maxHp>P.maxHp*1.65&&sp.damage>P.damage*1.35);
  const calmBoar=m.type==="boar"&&!powerful&&(m.alert||0)<=0&&(m.windup||0)<=0&&(m.search||0)<=0;
  const kind=m.companion?"ally":sp.prey?"prey":powerful?"strong":calmBoar?"caution":"hostile";
  const x=X(m.x),y=Y(m.y);
  mc.save();mc.translate(x,y);mc.lineWidth=1.3;mc.strokeStyle="#0b1c1b";
  mc.fillStyle=kind==="ally"?"#5ce8e3":kind==="prey"?"#78e59c":kind==="strong"?"#f15b62":kind==="caution"?"#f3d56c":"#f7a05c";
  mc.beginPath();
  if(kind==="strong"){mc.moveTo(0,-5.5);mc.lineTo(5.5,0);mc.lineTo(0,5.5);mc.lineTo(-5.5,0);mc.closePath();}
  else if(kind==="hostile"){mc.moveTo(0,-4.5);mc.lineTo(4.5,4);mc.lineTo(-4.5,4);mc.closePath();}
  else if(kind==="caution"){mc.rect(-3.2,-3.2,6.4,6.4);}
  else{mc.arc(0,0,3.2,0,TWO);}
  mc.fill();mc.stroke();mc.restore();
 }
 for(const site of EXPLORE_SITES)if(Math.hypot(site.x-P.x,site.y-P.y)<span*.7&&Math.hypot(site.x-P.x,site.y-P.y)>65){
  mc.fillStyle=discoveredSites.includes(site.id)?"#83e7c4":"#d5bea1";
  mc.fillRect(X(site.x)-2,Y(site.y)-2,4,4);
 }
 // Den and mission target use world coordinates and are never cached between goals.
 for(const site of denSites)if(Math.abs(site.x-P.x)<span/2&&Math.abs(site.y-P.y)<span/2){
  mc.fillStyle=site.z>0?"#e9c6ff":"#76baff";mc.beginPath();mc.arc(X(site.x),Y(site.y),3.5,0,TWO);mc.fill();
 }
 const goal=getObjective();
 if(goal&&dist(P,goal)>85){
  const dx=(goal.x-P.x)*w/span,dy=(goal.y-P.y)*w/span;
  const radius=Math.min(w,h)/2-10,range=Math.hypot(dx,dy);
  const factor=Math.min(1,radius/Math.max(1,range));
  const gx=w/2+dx*factor,gy=h/2+dy*factor;
  mc.fillStyle="#65e3ff";mc.strokeStyle="#10282e";mc.lineWidth=1.5;
  mc.save();mc.translate(gx,gy);
  if(factor<1){mc.rotate(Math.atan2(dy,dx)+Math.PI/2);
   mc.beginPath();mc.moveTo(0,-6);mc.lineTo(4,4);mc.lineTo(-4,4);mc.closePath();
  }else{mc.beginPath();mc.arc(0,0,4,0,TWO);}
  mc.fill();mc.stroke();mc.restore();
 }
 // Dedicated player marker: the canal starting landmark and other icons never cover it.
 mc.save();mc.translate(w/2,h/2);mc.rotate((Number.isFinite(P.dir)?P.dir:0)+Math.PI/2);
 mc.beginPath();mc.arc(0,0,9,0,TWO);mc.fillStyle="rgba(9,43,38,.82)";mc.fill();
 mc.strokeStyle="#eaffb2";mc.lineWidth=2.1;mc.stroke();
 mc.fillStyle="#f6fce5";mc.strokeStyle="#102a25";mc.lineWidth=1.8;
 mc.beginPath();mc.moveTo(0,-7);mc.lineTo(5,5);mc.lineTo(0,2);mc.lineTo(-5,5);mc.closePath();
 mc.fill();mc.stroke();mc.restore();
 mc.strokeStyle="#b6e1c5";mc.lineWidth=1;mc.strokeRect(.5,.5,w-1,h-1);
}
function visible(x,y,r=50){const q=project(x,y),m=Math.max(100,r*1.9);return q.x>-m&&q.x<vw+m&&q.y>-m&&q.y<vh+m}
function roadDraw(){
 ctx.fillStyle="#273639";
 for(const y of roadsY){ctx.fillRect(0,y-75,CITY_WIDTH,150);ctx.fillStyle="#576460";ctx.fillRect(0,y-77,CITY_WIDTH,5);ctx.fillRect(0,y+73,CITY_WIDTH,5);ctx.fillStyle="#273639"}
 for(const x of roadsX){ctx.fillRect(x-76,0,152,WORLD.h);ctx.fillStyle="#576460";ctx.fillRect(x-78,0,5,WORLD.h);ctx.fillRect(x+74,0,5,WORLD.h);ctx.fillStyle="#273639"}
 ctx.save();ctx.setLineDash([24,22]);ctx.strokeStyle="#b1a98357";ctx.lineWidth=3;
 for(const y of roadsY){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CITY_WIDTH,y);ctx.stroke()}
 for(const x of roadsX){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,WORLD.h);ctx.stroke()}ctx.restore();
 for(const x of roadsX)for(const y of roadsY){ctx.strokeStyle="#a6ab9b38";ctx.lineWidth=5;
  for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(x-110+k*24,y-98);ctx.lineTo(x-110+k*24,y-82);ctx.stroke();ctx.beginPath();ctx.moveTo(x+82,y-110+k*24);ctx.lineTo(x+98,y-110+k*24);ctx.stroke()}
 }
 ctx.save();ctx.lineWidth=1.4;
 for(const y of roadsY)for(let i=0;i<35;i++){
  const x=58+i*118+noise(i,y)*37;if(!visible(x,y,90))continue;
  const bend=(noise(i+5,y)-.5)*19,side=noise(i+8,y)>.5?1:-1;
  ctx.strokeStyle="#b0b3a12c";ctx.beginPath();ctx.moveTo(x,y+side*14);
  ctx.lineTo(x+bend,y+side*30);ctx.lineTo(x+bend+15,y+side*42);ctx.stroke();
  if(i%5===0){ctx.fillStyle="#55764c75";ctx.beginPath();ctx.ellipse(x,y+side*69,10,3,.2,0,TWO);ctx.fill()}
 }
 for(const x of roadsX)for(let i=0;i<23;i++){
  const y=52+i*102+noise(i,x)*26;if(!visible(x,y,90))continue;
  const bend=(noise(i+2,x)-.5)*17,side=noise(i+6,x)>.5?1:-1;
  ctx.strokeStyle="#abb5aa30";ctx.beginPath();ctx.moveTo(x+side*11,y);
  ctx.lineTo(x+side*27,y+bend);ctx.lineTo(x+side*40,y+bend+13);ctx.stroke();
  if(i%4===0){ctx.fillStyle="#55764c6b";ctx.beginPath();ctx.ellipse(x+side*69,y,3,11,.2,0,TWO);ctx.fill()}
 }
 ctx.restore();
}
function drawStreetProp(o){
 ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.dir);
 ctx.fillStyle="#0d1916bb";ctx.beginPath();ctx.ellipse(4,7,o.type==="car"?47:22,o.type==="car"?27:15,0,0,TWO);ctx.fill();
 if(o.type==="car"){
  ctx.fillStyle=o.seed%2?"#8b7365":"#637570";ctx.fillRect(-34,-20,68,40);
  ctx.fillStyle="#263e43";ctx.fillRect(-6,-17,28,34);ctx.strokeStyle="#a9a89a";ctx.lineWidth=2;ctx.strokeRect(-34,-20,68,40);
  ctx.fillStyle="#1b2928";for(const s of [-1,1])for(const side of [-1,1])ctx.fillRect(s*23-6,side*20-7,12,14);
 }else if(o.type==="bicycle"){
  ctx.strokeStyle="#a7b0a3";ctx.lineWidth=2.5;
  for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*13,0,8,10,0,0,TWO);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(0,-10);ctx.lineTo(13,0);ctx.lineTo(-13,0);ctx.lineTo(0,0);ctx.lineTo(0,-10);ctx.stroke();
 }else{
  ctx.fillStyle=o.type==="vending"?"#9a5e4c":o.type==="sign"?"#a18e67":"#807a6d";ctx.fillRect(-13,-8,26,16);
  if(o.type==="vending"){ctx.fillStyle="#c6d2c1";ctx.fillRect(-5,-7,14,11);}
  if(o.type==="barrier"){ctx.strokeStyle="#e9c08a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-13,-6);ctx.lineTo(13,6);ctx.stroke();}
 }
 ctx.restore();
}
function drawFlyingBird(o){
 ctx.save();ctx.translate(o.x,o.y);ctx.translate(VIEW.c*o.z*.93*cameraZoom/VIEW_DET,-VIEW.a*o.z*.93*cameraZoom/VIEW_DET);
 ctx.rotate(o.dir);ctx.fillStyle=o.type==="crow"?"#1c292b":"#859c9b";ctx.beginPath();ctx.ellipse(0,0,9,3,0,0,TWO);ctx.fill();
 const resting=o.roostState==="rest",wing=resting?0:Math.sin(o.wing)*12;
 ctx.strokeStyle=o.type==="crow"?"#293333":"#a9b7b3";ctx.lineWidth=resting?5:4;
 ctx.beginPath();ctx.moveTo(-3,0);ctx.quadraticCurveTo(resting?-8:-13,resting?-3:-8-wing,resting?-11:-18,resting?-3:-8-wing);
 ctx.moveTo(3,0);ctx.quadraticCurveTo(resting?8:13,resting?3:8+wing,resting?11:19,resting?3:8+wing);ctx.stroke();ctx.restore();
}
function bayDecayed(b,decay){return b.broken||decay>.26;}
function drawBuilding(b){
 if(b.interior&&shelterRevealed(b)){
  ctx.fillStyle="#182f2e";ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.strokeStyle="#486d64";ctx.lineWidth=3;ctx.strokeRect(b.x+19,b.y+19,b.w-38,b.h-38);
  ctx.fillStyle="#4c6862";for(const w of shelterWalls(b))ctx.fillRect(w.x,w.y,w.w,w.h);
  ctx.fillStyle="#596b60";for(const f of shelterFurniture(b))ctx.fillRect(f.x,f.y,f.w,f.h);
  const door=b.x+b.w*.5;
  ctx.fillStyle="#e3d08c";ctx.fillRect(door-55,b.y-3,110,5);
  ctx.textAlign="center";ctx.font="800 16px sans-serif";ctx.fillStyle="#fff0ae";ctx.fillText("入口",door,b.y-20);
  ctx.font="800 13px sans-serif";ctx.fillStyle="#c1d9c5";ctx.fillText("屋内避難所",door,b.y+b.h*.35);
  return;
 }
 const gx=b.x,gy=b.y,w=b.w,h=b.h,rise=b.roofZ||85+(b.kind%4)*17;
 const roofLift=rise*.93*cameraZoom;
  const x=gx+VIEW.c*roofLift/VIEW_DET,y=gy-VIEW.a*roofLift/VIEW_DET;
 const polygon=(v,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(v[0],v[1]);for(let j=2;j<v.length;j+=2)ctx.lineTo(v[j],v[j+1]);ctx.closePath();ctx.fill()};
 ctx.fillStyle="#050f13ab";ctx.fillRect(gx+20,gy+25,w,h);
 const face=ctx.createLinearGradient(x,y+h,gx,gy+h);
 face.addColorStop(0,b.kind%2?"#56666a":"#65716b");
 face.addColorStop(.48,b.kind%2?"#344850":"#425455");
 face.addColorStop(1,"#192c32");
 polygon([x,y+h,x+w,y+h,gx+w,gy+h,gx,gy+h],face);
 const side=ctx.createLinearGradient(x+w,y,gx+w,gy);
 side.addColorStop(0,"#40565c");side.addColorStop(1,"#101f29");
 polygon([x+w,y,x+w,y+h,gx+w,gy+h,gx+w,gy],side);
 for(let row=1;row<5;row++){
  const t=row/5,lx=x+(gx-x)*t,ly=y+h+(gy-y)*t;
  for(let col=0;col<5;col++){
   ctx.fillStyle=noise(col+row,b.seed)>.79?"#c9aa745f":"#96a69e67";
   ctx.fillRect(lx+(col+.5)*w/5-9,ly-5,17,9);
  }
 }
 ctx.strokeStyle="#a7b3a559";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(gx,gy+h);
 ctx.moveTo(x+w,y+h);ctx.lineTo(gx+w,gy+h);ctx.stroke();
 ctx.fillStyle=b.kind%2?"#465459":"#34494b";ctx.fillRect(x,y,w,h);
 ctx.fillStyle="#23373c";ctx.fillRect(x+9,y+9,w-18,h-18);
 ctx.fillStyle="#57655e";ctx.fillRect(x+9,y+9,w-18,12);
 ctx.strokeStyle="#99ada352";ctx.lineWidth=2;ctx.strokeRect(x+13,y+13,w-26,h-26);
 ctx.fillStyle="#192c31";ctx.fillRect(x+w*.13,y+h*.16,w*.29,h*.35);ctx.fillRect(x+w*.58,y+h*.22,w*.25,h*.27);
 ctx.fillStyle="#688078";ctx.fillRect(x+w*.14,y+h*.17,w*.27,4);ctx.fillRect(x+w*.59,y+h*.23,w*.23,4);
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){const wx=x+22+col*(w-44)/4,wy=y+h*.59+row*29;ctx.fillStyle=noise(row+col,b.seed)>.78?"#ac997050":"#77958a28";ctx.fillRect(wx,wy,19,10)}
 ctx.fillStyle="#7d8672";ctx.fillRect(x+w*.52,y+h*.6,43,15);ctx.fillStyle="#19282c";ctx.fillRect(x+w*.52+5,y+h*.6+3,33,8);
 ctx.strokeStyle="#9a9e7950";ctx.beginPath();ctx.moveTo(x+w*.52,y+h*.55);ctx.lineTo(x+w*.72,y+h*.38);ctx.stroke();
 if(b.broken){ctx.fillStyle="#0c171b";ctx.beginPath();ctx.moveTo(x+w*.73,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h*.24);ctx.lineTo(x+w*.87,y+h*.15);ctx.fill()}
 // Cracks, dangling ivy and missing masonry show decades of abandonment.
 const decay=noise(b.seed,271);
 if(bayDecayed(b,decay)){
  for(let k=0;k<5;k++){
   const xx=x+14+w*(.10+k*.17),length=19+noise(k,b.seed)*h*.24;
   ctx.strokeStyle=k%2?"#385f45":"#5d824e";ctx.lineWidth=4;
   ctx.beginPath();ctx.moveTo(xx,y+5);ctx.bezierCurveTo(xx+8,y+length*.35,xx-9,y+length*.66,xx+5,y+length);ctx.stroke();
   for(let j=0;j<3;j++){const yy=y+length*(j+1)/4;
    ctx.fillStyle=j%2?"#46754a":"#75975f";ctx.beginPath();ctx.ellipse(xx+(j%2?8:-6),yy,7,4,j%2?.3:-.4,0,TWO);ctx.fill();}
  }
  ctx.strokeStyle="#131f22a5";ctx.lineWidth=2.2;
  for(let k=0;k<3;k++){const cx=x+w*(.20+noise(k,b.seed)*.55),cy=y+h*(.4+k*.17);
   ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+13,cy+15);ctx.lineTo(cx-4,cy+29);ctx.stroke();}
  ctx.fillStyle="#526e49";for(let k=0;k<8;k++){const tx=x+8+(k+.5)*w/9;
   ctx.beginPath();ctx.ellipse(tx,y+10,5+(k%3)*3,3+(k%2)*3,0,0,TWO);ctx.fill();}
 }
 if(b.sign){ctx.save();ctx.translate(x+w-19,y+32);ctx.rotate(Math.PI/2);ctx.fillStyle="#c18c5760";ctx.fillRect(0,0,95,19);ctx.fillStyle="#1e2626";ctx.font="700 11px monospace";ctx.fillText("EXIT •  TOKYO",6,13);ctx.restore()}
 for(let i=0;i<3;i++){ctx.strokeStyle="#5a6657";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+18+i*31,y+h-1);ctx.lineTo(x+15+i*29,y+h+17);ctx.stroke()}
}
function drawLandmark2D(site){
 const x=site.x,y=site.y;
 ctx.save();ctx.translate(x,y);
 if(site.id==="zoo"){
  ctx.strokeStyle="#b0b7a6";ctx.lineWidth=5;ctx.strokeRect(-128,-104,256,208);
  for(let i=-105;i<128;i+=36){ctx.beginPath();ctx.moveTo(i,-103);ctx.lineTo(i,104);ctx.stroke();}
 }else if(site.id==="forest"){
  for(let i=0;i<12;i++){
   const t=i*TWO/12,tx=Math.cos(t)*180,ty=Math.sin(t)*180;
   ctx.fillStyle="#305f3f";ctx.beginPath();ctx.arc(tx,ty,34,0,TWO);ctx.fill();
   ctx.strokeStyle="#88a580";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(tx-9,ty-5);ctx.lineTo(tx+14,ty+12);ctx.stroke();
  }
 }else if(site.id==="factory"){
  ctx.fillStyle="#6d726e";for(let i=0;i<3;i++)ctx.fillRect(-137+i*113,-105,40,140);
  ctx.fillStyle="#876554";for(let i=0;i<3;i++)ctx.fillRect(-139+i*110,86,95,44);
 }else if(site.id==="canal"||site.id==="river"){
  ctx.fillStyle="#356975";ctx.fillRect(-224,-116,448,232);
  ctx.fillStyle="#aab0a0";ctx.fillRect(-188,-14,376,28);
  if(site.id==="canal"){ctx.strokeStyle="#d5d2c0";ctx.lineWidth=4;
   for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-214,side*111);ctx.lineTo(214,side*111);ctx.stroke();}
  }
 }else if(site.id==="ark"){
  ctx.fillStyle="#596763";ctx.fillRect(-96,-70,192,140);
  ctx.fillStyle="#1e363c";ctx.fillRect(-61,-40,122,80);
  ctx.strokeStyle="#9aa69c";ctx.lineWidth=5;for(let i=-52;i<62;i+=17){ctx.beginPath();ctx.moveTo(i,-40);ctx.lineTo(i,40);ctx.stroke();}
 }
 ctx.fillStyle="#f1e9c4";ctx.font="900 14px sans-serif";ctx.textAlign="center";
 ctx.fillText(site.name,0,-145);ctx.restore();
}
function drawPlant(p){
 if(p.type===2&&window.WildSeasonClouds?.season?.index===0&&!p.denSite&&!p.trainingCover)return;
 ctx.save();ctx.translate(p.x,p.y);
 const dense=visibleShrub(p),r=p.r*(p.type===2?.74:dense?.94:.70);
 const count=p.type===2?36:dense?26:9;
 // Small decorative grass stays short; large formerly triangular plants are
 // now readable, dense grass clumps with the same concealment footprint.
 ctx.fillStyle="#172820a6";ctx.beginPath();ctx.ellipse(0,Math.max(2,r*.14),r*1.03,r*.49,0,0,TWO);ctx.fill();
 for(let n=0;n<count;n++){
  const spread=((n*.61803398875)%1)*2-1,layer=n%3;
  const baseX=spread*r*.84+Math.sin(n*3.7+p.phase)*r*.07;
  const baseY=(layer-1)*r*.14+Math.cos(n*1.8)*r*.06;
  const tall=r*(dense?.80:.48)*(.80+(n%5)*.13);
  const bend=spread*r*.24+Math.sin(elapsed*1.6+p.phase+n)*r*.045;
  const tipX=baseX+bend,tipY=baseY-tall,half=Math.max(.65,r*(.052+(n%3)*.012));
  const winter=window.WildSeasonClouds?.season?.index===0;
  ctx.fillStyle=winter?(n%3===0?"#71946c":n%2?"#315a49":"#4c7858"):(n%4===0?"#83a86a":n%3===0?"#436e47":n%2?"#527f4f":"#6c9655");
  ctx.beginPath();ctx.moveTo(baseX-half,baseY);
  ctx.quadraticCurveTo(baseX-half*1.3,baseY-tall*.62,tipX,tipY);
  ctx.quadraticCurveTo(baseX+half*1.6,baseY-tall*.52,baseX+half,baseY);
  ctx.closePath();ctx.fill();
  if(dense){ctx.strokeStyle="#bad29b87";ctx.lineWidth=.85;ctx.beginPath();
   ctx.moveTo(baseX,baseY-2);ctx.quadraticCurveTo(baseX+bend*.36,baseY-tall*.62,tipX,tipY);ctx.stroke();}
 }
 ctx.restore();
}
function drawCoverForeground(p){
 if(!visibleShrub(p))return;
 const r=p.r*.68,sway=Math.sin(elapsed*1.8+p.phase)*r*.028;
 ctx.save();ctx.translate(p.x,p.y);
 if(P&&Math.hypot(P.x-p.x,P.y-p.y)<110)ctx.globalAlpha*=.38;
 for(let i=0;i<11;i++){
  const u=(i-5)/5,xx=u*r*.93,yy=r*(.29+.16*Math.cos(u*1.2)),tall=r*(.42+(i%3)*.065);
  ctx.fillStyle=i%3===0?"#78986d":i%2?"#385f42":"#547b4d";
  ctx.beginPath();ctx.moveTo(xx-r*.21,yy);
  ctx.quadraticCurveTo(xx-r*.13+sway,yy-tall*.82,xx+sway,yy-tall);
  ctx.quadraticCurveTo(xx+r*.24+sway,yy-tall*.47,xx+r*.22,yy);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle="#d3e0a15e";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+sway*.7,yy-tall*.55);ctx.stroke();
 }ctx.restore();
}
function drawDenBedding2D(roofOnly=false){
 if(!P)return;
 for(const site of denSites){
 if((site.z>0)!==roofOnly||!visible(site.x,site.y,135))continue;
 const x=site.x,y=site.y,cat=P.type==="cat",fox=P.type==="fox";
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle="#25332a";ctx.beginPath();ctx.ellipse(0,3,55+denLevel*7,40+denLevel*4,0,0,TWO);ctx.fill();
 ctx.fillStyle=cat?"#938e75":fox?"#937448":"#615e47";
 ctx.beginPath();ctx.ellipse(0,0,43+denLevel*5,29+denLevel*3,0,0,TWO);ctx.fill();
 for(let i=0;i<12+denLevel*5;i++){
  const a=i*2.4,rad=19+(i%5)*8;
  ctx.save();ctx.translate(Math.cos(a)*rad,Math.sin(a)*rad*.7);ctx.rotate(a);
  ctx.fillStyle=cat?"#c1b09b":fox?(i%2?"#b9894d":"#cfac70"):"#9e9266";
  ctx.beginPath();ctx.ellipse(0,0,7,2,0,0,TWO);ctx.fill();ctx.restore();
 }
 if(cat){ctx.strokeStyle="#b8a17f";ctx.lineWidth=3;ctx.strokeRect(-42,-25,84,50)}
 if(!cat&&!fox){ctx.strokeStyle="#695b40";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-40,-25);ctx.lineTo(43,-25);ctx.moveTo(-40,26);ctx.lineTo(43,26);ctx.stroke()}
 if(denStash>0){ctx.fillStyle="#bba27d";ctx.fillRect(16,12,Math.min(31,8+denStash*.1),7)}
 // Site-specific nesting materials are visible in 2D without changing collisions.
 if(site.kind==="roof"){
  ctx.strokeStyle="#d6e4df";ctx.lineWidth=2;ctx.strokeRect(-40,-26,80,52);
  ctx.fillStyle="#71888f";for(let j=0;j<4;j++)ctx.fillRect(-39+j*22,24,14,3);
 }else if(site.kind==="ruin"||site.kind==="yard"){
  ctx.fillStyle=site.kind==="ruin"?"#837d6a":"#677d77";
  for(let j=0;j<5;j++)ctx.fillRect(-53+j*24,-37+(j%2)*6,11,7);
 }else if(site.kind==="reeds"){
  ctx.strokeStyle="#bbbf81";ctx.lineWidth=2;
  for(let j=0;j<6;j++){ctx.beginPath();ctx.moveTo(-56+j*22,26);ctx.lineTo(-48+j*22,-40-(j%3)*8);ctx.stroke();}
 }
 ctx.restore();
 }
}
function drawCarriedFood2D(){
 if(!P?.carry||P.carry.amount<=0)return;
 const dir=P.dir||0,dx=Math.cos(dir),dy=Math.sin(dir);
 ctx.save();ctx.translate(P.x+dx*P.r*1.45,P.y+dy*P.r*1.45);
 const carryZ=MOUNTAIN?.height(P.x,P.y)||0;
 if(carryZ>0)ctx.translate(VIEW.c*carryZ*.93*cameraZoom/VIEW_DET,-VIEW.a*carryZ*.93*cameraZoom/VIEW_DET);
 ctx.rotate(dir);
 const r=Math.min(13,7+Math.sqrt(P.carry.amount));
 ctx.fillStyle=P.carry.type==="berries"?"#58734c":"#592327";
 ctx.beginPath();ctx.ellipse(0,1,r+2,7,-.15,0,TWO);ctx.fill();
 ctx.fillStyle=P.carry.type==="berries"?"#b98c5e":"#bb5049";
 ctx.beginPath();ctx.ellipse(-1,-1,r,5.8,-.18,0,TWO);ctx.fill();
 ctx.fillStyle=P.carry.type==="berries"?"#d5b37b":"#e78f79";
 ctx.beginPath();ctx.ellipse(-r*.35,-3,r*.45,1.8,-.2,0,TWO);ctx.fill();
 ctx.fillStyle="#f0cdb6";ctx.beginPath();ctx.arc(r*.7,-1,2.7,0,TWO);ctx.fill();
 ctx.restore();
}
function drawItem(c){
 const pulse=Math.sin(elapsed*3+(c.phase||0))*2;
 ctx.save();ctx.translate(c.x,c.y);
 const terrainZ=MOUNTAIN?.height(c.x,c.y)||0;
 if(terrainZ>0)ctx.translate(VIEW.c*terrainZ*.93*cameraZoom/VIEW_DET,-VIEW.a*terrainZ*.93*cameraZoom/VIEW_DET);
 ctx.fillStyle="#081a1694";ctx.beginPath();ctx.ellipse(1,5,Math.max(16,(c.r||9)*1.6),8,0,0,TWO);ctx.fill();
 if(c.type==="corpse"||c.type==="bones"){
  const r=Math.max(15,Math.min(36,(c.r||9)*1.28)),fur=species[c.animalType]?.color||"#988b78";
  const fraction=clamp(Number(c.amount)/Math.max(1,Number(c.initialAmount)||Number(c.amount)||1),0,1);
  ctx.save();ctx.rotate(c.phase||0);ctx.lineCap="round";
  if(c.type==="bones"){
   ctx.strokeStyle="#f1ebdc";ctx.lineWidth=Math.max(3,r*.13);ctx.beginPath();ctx.moveTo(-r*.9,0);ctx.lineTo(r*.8,0);
   for(let i=0;i<4;i++){const x=(-.55+i*.35)*r;for(const side of [-1,1]){ctx.moveTo(x,0);ctx.quadraticCurveTo(x+r*.13,side*r*.54,x+r*.28,side*r*.40);}}ctx.stroke();
   ctx.fillStyle="#f1ebdc";ctx.beginPath();ctx.ellipse(r*.99,0,r*.38,r*.32,0,0,TWO);ctx.fill();
   ctx.fillStyle="#3b443e";for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(r*1.07,side*r*.15,r*.08,r*.08,0,0,TWO);ctx.fill();}
  }else{
   ctx.strokeStyle=fur;ctx.lineWidth=Math.max(3,r*.20);ctx.beginPath();ctx.moveTo(-r*.9,0);ctx.quadraticCurveTo(-r*1.5,-r*.2,-r*1.65,-r*.5);ctx.stroke();
   ctx.fillStyle=fur;
   for(const side of [-1,1])for(const front of [-1,1]){ctx.beginPath();ctx.ellipse(front*r*.55,side*r*.67,r*.24,r*.46,front*.20,0,TWO);ctx.fill();}
   ctx.beginPath();ctx.ellipse(-r*.08,0,r*(.9+.17*fraction),r*.60,0,0,TWO);ctx.fill();
   ctx.fillStyle=species[c.animalType]?.belly||"#bcae99";ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(r*.05,r*.18,r*.63,r*.23,0,0,TWO);ctx.fill();ctx.globalAlpha=1;
   ctx.fillStyle=fur;ctx.beginPath();ctx.ellipse(r*.84,-r*.07,r*.45,r*.38,0,0,TWO);ctx.fill();
   for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(r*.75,side*r*.40,r*.19,c.animalType==="rabbit"?r*.47:r*.24,side*.25,0,TWO);ctx.fill();}
   ctx.strokeStyle="#2b302b";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r*1.02,-r*.21);ctx.lineTo(r*1.16,-r*.19);ctx.stroke();
  }
  ctx.restore();
 }else if(c.type==="meat"){
  ctx.fillStyle="#a75247";ctx.beginPath();ctx.ellipse(0,-2,9+pulse*.2,6,-.25,0,TWO);ctx.fill();
  ctx.fillStyle="#e8bdb0";ctx.fillRect(7,-6,9,3);
 }else{
  ctx.fillStyle="#648f66";ctx.beginPath();ctx.arc(0,0,12,0,TWO);ctx.fill();
  for(let i=0;i<4;i++){ctx.fillStyle=i%2?"#d6b17b":"#d77d5b";ctx.beginPath();ctx.arc(Math.sin(i*3)*6,Math.cos(i*2)*5,3,0,TWO);ctx.fill()}
 }
 if(P&&edibleFood(c)&&dist(P,c)<64){
  ctx.strokeStyle="#e7e1a7a6";ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,19+pulse,0,TWO);ctx.stroke();
 }
 ctx.restore();
}

/* Separate readable top-down anatomy for the first four strong enemies. */
function drawStrongCreature2D(o,r,fur,light,pace,oval,triangle,attackReach){
 const t=o.type;
 if(t!=="giantSnake"&&t!=="oldBear"&&t!=="giantBoar"&&t!=="blackPanther"&&t!=="oneEyedWolf"&&t!=="whiteTiger"&&t!=="giantHyena"&&t!=="giantLion"&&t!=="giantMoose"&&t!=="giantBuffalo"&&t!=="giantCrocodile"&&t!=="giantHippo"&&t!=="giantAnaconda"&&t!=="giantLizard"&&t!=="rhino"&&t!=="giantGorilla"&&t!=="giantElephant"&&t!=="albinoWolf"&&t!=="giantEagle")return false;
 if(t==="giantEagle"){
  const flap=Math.sin((o.step||0)*2.4),spread=.9+.16*flap;
  oval(-r*.20,0,r*.88,r*.38,fur);oval(r*.65,0,r*.45,r*.36,light);
  for(const side of [-1,1]){
   triangle([-r*.4,side*r*.22,-r*.96,side*r*2.15*spread,r*.48,side*r*1.35*spread],side<0?"#59452f":"#8e6e48");
   for(let k=0;k<5;k++)triangle([(-.78+k*.26)*r,side*r*1.30*spread,(-1.05+k*.25)*r,side*r*(2.0+(.22*(k%2)))*spread,(-.59+k*.24)*r,side*r*1.40*spread],"#493a2d");
   oval(r*.96,side*r*.18,r*.08,r*.09,"#f0d795");
  }
  for(let k=-2;k<=2;k++)triangle([-r*.84,k*r*.14,-r*1.75,k*r*.25,-r*.95,(k+.5)*r*.16],"#a39070");
  triangle([r*1.03,-r*.12,r*1.50,0,r*1.03,r*.12],"#e8bd65");
  for(const side of [-1,1])for(let k=0;k<3;k++)triangle([r*.32,side*r*.18,r*.53+k*r*.10,side*r*.30,r*.50,side*r*.08],"#dfbd71");
 }else if(t==="giantGorilla"){
  for(const side of [-1,1]){oval(-r*.2,side*r*.83+pace*side,r*.4,r*.61,"#30332f");oval(r*.72,side*r*.81,r*.48,r*.38,fur);}
  oval(-r*.26,0,r*1.25,r*.91,fur);oval(r*.55,0,r*.89,r*.78,light);
  for(const side of [-1,1]){oval(r*.1,side*r*.99,r*.55,r*.29,fur);oval(r*1.06,side*r*.28,r*.12,r*.10,"#252827");}
  oval(r*1.19,0,r*.44,r*.40,"#8d8076");oval(r*1.41,0,r*.24,r*.19,"#35332f");
  if(o.rock){const c=Math.cos(o.dir||0),s=Math.sin(o.dir||0),dx=o.rock.x-o.x,dy=o.rock.y-o.y;oval(dx*c+dy*s,-dx*s+dy*c,12,12,"#b5aa9b");}
 }else if(t==="giantElephant"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.68,side*r*.7+pace*side,r*.42,r*.42,"#6b716d");
  oval(-r*.21,0,r*1.47,r*1.04,fur);oval(r*.78,0,r*.96,r*.87,light);
  for(const side of [-1,1]){oval(r*.88,side*r*.89,r*.56,r*.62,"#777d79");oval(r*1.14,side*r*.45,r*.12,r*.12,"#323936");triangle([r*1.31,side*r*.3,r*2.18,side*r*.47,r*1.45,side*r*.08],"#e9e0cc");}
  for(let k=0;k<6;k++)oval(r*(1.35+k*.18),Math.sin(k*.5)*r*.10,r*(.32-k*.035),r*(.28-k*.03),fur);
 }else if(t==="albinoWolf"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.63,side*r*.45+pace*side,r*.25,r*.27,"#cdd0c7");
  oval(-r*.19,0,r*1.22,r*.59,fur);oval(r*.74,0,r*.67,r*.48,light);
  for(const side of [-1,1]){triangle([r*.49,side*r*.33,r*.32,side*r*.88,r*.89,side*r*.46],fur);oval(r*1.06,side*r*.29,r*.12,r*.10,"#cf9e9e");oval(r*1.09,side*r*.3,r*.055,r*.055,"#9e4c55");}
  oval(r*1.24,0,r*.42,r*.24,light);oval(-r*1.4,0,r*.7,r*.2,fur);
 }else if(t==="giantLizard"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.57,side*r*.73+pace*side,r*.40,r*.24,"#52644e");
  for(let i=0;i<8;i++)triangle([(-1.35+i*.28)*r,-r*.50,(-1.20+i*.28)*r,-r*.87,(-1.02+i*.28)*r,-r*.48],"#364d3a");
  oval(-r*.26,0,r*1.25,r*.65,fur);oval(r*.70,0,r*.75,r*.48,fur);oval(r*1.32,0,r*.65,r*.34,light);
  for(let i=0;i<7;i++)oval(-r*(1.08+i*.25),Math.sin(i*.7+(o.step||0)*.15)*r*.18,r*(.34-i*.025),r*(.26-i*.022),i%2?"#536c50":"#8c966c");
  for(const side of [-1,1]){oval(r*1.43,side*r*.27,r*.13,r*.09,"#d8bc75");oval(r*1.46,side*r*.28,r*.06,r*.06,"#1c2b23");}
  if(attackReach>.1)triangle([r*1.72,0,r*2.02,-r*.09,r*1.91,0,r*2.02,r*.09],"#c67576");
 }else if(t==="rhino"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.66,side*r*.62+pace*side,r*.36,r*.34,"#66615b");
  oval(-r*.21,0,r*1.36,r*.89,fur);oval(r*.66,0,r*.98,r*.79,"#68645f");oval(r*1.35,0,r*.66,r*.57,light);
  for(const side of [-1,1]){oval(r*.72,side*r*.64,r*.24,r*.21,fur);oval(r*1.23,side*r*.47,r*.10,r*.09,"#282723");}
  triangle([r*1.35,-r*.21,r*2.13,-r*.10,r*1.50,r*.09],"#e7dbbf");
  triangle([r*.95,-r*.23,r*1.36,-r*.10,r*1.06,r*.10],"#c9bda7");
  oval(-r*1.50,0,r*.37,r*.15,"#66615b");
 }else if(t==="giantCrocodile"){
  for(let k=0;k<7;k++)triangle([-r*(1.1+k*.26),-r*.24,-r*(1.28+k*.28),0,-r*(1.1+k*.26),r*.24],k%2?"#395a45":"#60795a");
  for(const side of [-1,1])for(const x of [-.57,.48])oval(r*x,side*r*.75+pace*side,r*.31,r*.25,"#405849");
  oval(-r*.17,0,r*1.35,r*.73,fur);for(let k=-3;k<=3;k++)oval(r*k*.25,-r*.25,r*.11,r*.10,"#314d3b");
  oval(r*1.02,0,r*.88,r*.43,fur);oval(r*1.65,0,r*.46,r*.36,light);
  for(const side of [-1,1]){oval(r*1.10,side*r*.31,r*.12,r*.10,"#f0cf87");oval(r*1.12,side*r*.31,r*.045,r*.07,"#14251d");}
  for(let k=-3;k<=3;k++)triangle([r*1.62,k*r*.09,r*1.90,k*r*.09+r*.04,r*1.68,k*r*.09+r*.08],"#e9dfc0");
 }else if(t==="giantHippo"){
  for(const side of [-1,1])for(const x of [-.64,.53])oval(r*x,side*r*.73+pace*side,r*.36,r*.34,"#60535a");
  oval(-r*.22,0,r*1.32,r*.94,fur);oval(r*.68,0,r*.82,r*.79,"#88747c");
  oval(r*1.35,0,r*.78,r*.61,light);oval(r*1.78,0,r*.45,r*.37,"#8e7d81");
  for(const side of [-1,1]){oval(r*.85,side*r*.65,r*.19,r*.22,fur);oval(r*1.19,side*r*.53,r*.12,r*.12,"#302b30");oval(r*1.72,side*r*.22,r*.12,r*.12,"#4d3d40");}
  if(attackReach>.1)oval(r*1.64,r*.11,r*.55,r*.15,"#422d32");
 }else if(t==="giantAnaconda"){
  for(let i=0;i<13;i++){const q=i/12;oval(-r*2.5+q*r*3.4,Math.sin(q*9+(o.step||0)*.28)*r*.49,r*(.25+.14*Math.sin(q*Math.PI)),r*(.24+.12*Math.sin(q*Math.PI)),i%3?"#3d705c":"#9cae7e");}
  oval(r*1.08,0,r*.65,r*.45,fur);oval(r*1.51,0,r*.50,r*.34,light);
  for(const side of [-1,1]){oval(r*1.26,side*r*.28,r*.12,r*.10,"#e3d390");oval(r*1.28,side*r*.28,r*.05,r*.06,"#172b22");}
  triangle([r*1.86,0,r*2.18,-r*.10,r*2.06,0,r*2.18,r*.10],"#d37d81");
 }else if(t==="giantSnake"){
  for(let i=0;i<8;i++)oval(-r*1.76+i*r*.34,Math.sin(i*.76+(o.step||0)*.21)*r*.29,r*(.14+.07*i),r*(.16+.055*i),i%2?fur:"#365e47",Math.sin(i*.8)*.25);
  oval(r*.74,0,r*.63,r*.45,fur);oval(r*1.21,0,r*.47,r*.36,light);
  for(const side of [-1,1]){oval(r*1.04,side*r*.28,r*.11,r*.09,"#ffdf88");oval(r*1.08,side*r*.28,r*.04,r*.07,"#172620");}
  triangle([r*1.54,0,r*1.96,-r*.13,r*1.8,0,r*1.96,r*.13],"#c97078");
  if(attackReach>.1)oval(r*1.48,r*.12,r*.35,r*.10,"#21362b");
 }else if(t==="oldBear"){
  for(const side of [-1,1])for(const x of [-.67,.60])oval(r*x,side*r*.68+pace*side,r*.34,r*.38,"#473b32");
  oval(-r*.08,0,r*1.15,r*.89,fur);oval(r*.32,0,r*.77,r*.77,"#503d32");oval(r*.88,0,r*.65,r*.61,fur);
  for(const side of [-1,1]){oval(r*.61,side*r*.57,r*.24,r*.22,fur);oval(r*1.02,side*r*.33,r*.075,r*.09,"#f4c58d");}
  oval(r*1.38,0,r*.38,r*.33,light);oval(r*1.68,0,r*.13,r*.11,"#251c1a");
  for(const side of [-1,1])for(let k=0;k<3;k++)triangle([r*.82,side*r*(.62+k*.13),r*1.05,side*r*(.71+k*.13),r*.98,side*r*(.54+k*.13)],"#e7d9b7");
 }else if(t==="giantBoar"){
  for(const side of [-1,1])for(const x of [-.62,.57])oval(r*x,side*r*.61+pace*side,r*.32,r*.37,"#3f332c");
  for(let k=0;k<8;k++)triangle([r*(-.85+k*.24),-r*.62,r*(-.74+k*.24),-r*.98,r*(-.58+k*.24),-r*.65],"#44382d");
  oval(-r*.10,0,r*1.17,r*.80,fur);oval(r*.77,0,r*.68,r*.59,"#655146");
  oval(r*1.31,0,r*.36,r*.41,light);oval(r*1.52,-r*.12,r*.08,r*.08,"#42342e");oval(r*1.52,r*.12,r*.08,r*.08,"#42342e");
  for(const side of [-1,1])triangle([r*.94,side*r*.36,r*1.38,side*r*.82,r*1.32,side*r*.18],"#f5e5bc");
 }else if(t==="oneEyedWolf"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.62,side*r*.45+pace*side,r*.23,r*.25,"#555a5e");
  oval(-r*.15,0,r*1.10,r*.55,fur);oval(r*.70,0,r*.58,r*.49,"#858581");
  for(const side of [-1,1])triangle([r*.43,side*r*.30,r*.37,side*r*.83,r*.81,side*r*.39],"#656a6b");
  oval(r*1.10,0,r*.37,r*.24,light);
  oval(r*.93,-r*.28,r*.12,r*.09,"#e4d3ab");oval(r*.93,r*.28,r*.12,r*.09,"#e4d3ab");
  oval(r*.96,-r*.28,r*.05,r*.05,"#25292c");
  triangle([r*.66,r*.14,r*1.18,r*.40,r*1.12,r*.47,r*.60,r*.21],"#b89b91");
  oval(-r*1.15,0,r*.55,r*.19,"#4b5055");
 }else if(t==="whiteTiger"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.60,side*r*.49+pace*side,r*.27,r*.29,"#ddd8cb");
  oval(-r*.12,0,r*1.20,r*.75,fur);oval(r*.62,0,r*.72,r*.62,light);
  for(let k=-3;k<=3;k++)for(const side of [-1,1])
   triangle([k*r*.26,side*r*.70,(k+.24)*r*.26,side*r*.30,(k+.54)*r*.26,side*r*.68],"#3c4649");
  for(const side of [-1,1]){oval(r*.78,side*r*.46,r*.24,r*.23,fur);oval(r*1.12,side*r*.31,r*.13,r*.11,"#d5b56e");}
  oval(r*1.25,0,r*.40,r*.32,light);oval(r*1.57,0,r*.15,r*.11,"#554e49");
  ctx.strokeStyle="#ece7d9";ctx.lineWidth=r*.18;ctx.lineCap="round";ctx.beginPath();
  ctx.moveTo(-r*1.05,0);ctx.bezierCurveTo(-r*1.48,-r*.67,-r*1.93,r*.59,-r*2.20,r*.02);ctx.stroke();
  for(let i=0;i<3;i++)oval(-r*(1.31+i*.32),Math.sin(i)*r*.18,r*.11,r*.16,"#353e40");
 }else if(t==="giantLion"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.62,side*r*.52+pace*side,r*.28,r*.31,"#b48a50");
  oval(-r*.2,0,r*1.14,r*.68,fur);oval(r*.60,0,r*.88,r*.91,"#8b6037");
  for(let i=0;i<12;i++){const a=i*TWO/12;triangle([r*.60+Math.cos(a)*r*.75,Math.sin(a)*r*.78,r*.60+Math.cos(a+.2)*r*1.15,Math.sin(a+.2)*r*1.11,r*.60+Math.cos(a+.4)*r*.75,Math.sin(a+.4)*r*.78],"#9c6a37");}
  oval(r*1.03,0,r*.56,r*.45,fur);oval(r*1.40,0,r*.36,r*.26,light);
  for(const side of [-1,1]){oval(r*1.04,side*r*.30,r*.10,r*.10,"#f5d29a");triangle([r*.78,side*r*.40,r*.84,side*r*.70,r*1.05,side*r*.44],fur);}
  ctx.strokeStyle="#b88b4b";ctx.lineWidth=r*.18;ctx.beginPath();ctx.moveTo(-r*1.05,0);ctx.bezierCurveTo(-r*1.8,-r*.5,-r*1.75,r*.7,-r*2.12,r*.18);ctx.stroke();
 }else if(t==="giantMoose"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.70,side*r*.50+pace*side,r*.23,r*.27,"#46372f");
  oval(-r*.20,0,r*1.32,r*.72,fur);oval(r*.70,0,r*.59,r*.49,light);oval(r*1.25,0,r*.63,r*.32,fur);
  for(const side of [-1,1]){triangle([r*.70,side*r*.31,r*.50,side*r*1.30,r*.93,side*r*1.14,r*1.08,side*r*.40],"#d4b989");
   for(let k=0;k<3;k++)triangle([r*(.60+k*.18),side*r*(.83+k*.10),r*(.49+k*.18),side*r*1.42,r*(.72+k*.18),side*r*(.94+k*.10)],"#d4b989");
   oval(r*1.12,side*r*.22,r*.08,r*.08,"#221d1b");}
 }else if(t==="giantBuffalo"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.66,side*r*.57+pace*side,r*.32,r*.34,"#3b302b");
  oval(-r*.25,0,r*1.25,r*.82,fur);oval(r*.42,0,r*1.02,r*1.02,"#49372d");oval(r*1.18,0,r*.70,r*.63,fur);
  for(let i=0;i<8;i++)triangle([(-.75+i*.24)*r,-r*.72,(-.65+i*.24)*r,-r*1.04,(-.49+i*.24)*r,-r*.69],"#3d3028");
  for(const side of [-1,1]){triangle([r*.92,side*r*.36,r*1.10,side*r*1.10,r*1.47,side*r*.94,r*1.24,side*r*.40],"#e3d4ad");oval(r*1.31,side*r*.29,r*.10,r*.09,"#e5c98d");}
  oval(r*1.53,0,r*.40,r*.34,light);
 }else if(t==="giantHyena"){
  for(const side of [-1,1])for(const front of [-1,1])oval(front*r*.61,side*r*.47+pace*side,r*.25,r*.29,"#74684f");
  oval(-r*.30,0,r*.83,r*.50,fur);oval(r*.31,0,r*.93,r*.75,"#98805d");
  for(let k=0;k<8;k++)triangle([(-.77+k*.23)*r,-r*.44,(-.67+k*.23)*r,-r*.87,(-.54+k*.23)*r,-r*.43],"#4d483b");
  for(const side of [-1,1])triangle([r*.67,side*r*.35,r*.69,side*r*.86,r*.96,side*r*.36],"#554c3c");
  oval(r*1.00,0,r*.49,r*.39,fur);oval(r*1.40,0,r*.41,r*.31,light);
  for(const side of [-1,1])oval(r*1.10,side*r*.25,r*.10,r*.09,"#f0d392");
  oval(-r*1.26,0,r*.49,r*.18,"#4a463c");
 }else{
  for(const side of [-1,1])for(const x of [-.62,.48])oval(r*x,side*r*.43+pace*side,r*.22,r*.29,fur);
  ctx.strokeStyle=fur;ctx.lineWidth=r*.20;ctx.lineCap="round";ctx.beginPath();
  ctx.moveTo(-r*.94,0);ctx.bezierCurveTo(-r*1.55,-r*.76,-r*1.86,r*.66,-r*2.28,r*.03);ctx.stroke();
  oval(-r*.18,0,r*1.17,r*.43,fur);oval(r*.68,0,r*.51,r*.44,fur);
  for(const side of [-1,1]){triangle([r*.42,side*r*.31,r*.50,side*r*.90,r*.79,side*r*.38],fur);oval(r*.91,side*r*.23,r*.12,r*.10,"#f6d58e");}
  oval(r*1.17,0,r*.32,r*.20,light);oval(r*1.43,0,r*.12,r*.09,"#171d1d");
 }
 return true;
}

// Distinct silhouettes for the new small fauna. All geometry uses the existing Canvas2D camera.
function drawOrdinaryCreature2D(o,r,fur,belly,pace,oval,triangle){
 const t=o.type;
 if(t==="snake"){
  ctx.strokeStyle=fur;ctx.lineCap="round";ctx.lineWidth=r*.77;
  ctx.beginPath();ctx.moveTo(-r*1.9,r*.55);
  ctx.bezierCurveTo(-r*.8,-r*.85,-r*.3,r*1.07,r*.46,r*.12);
  ctx.bezierCurveTo(r*.79,-r*.35,r*1.15,-r*.18,r*1.21,-r*.1);ctx.stroke();
  oval(r*.95,-r*.09,r*.44,r*.33,fur);
  oval(r*1.12,-r*.25,r*.09,r*.10,"#f3d698");oval(r*1.14,-r*.25,r*.035,r*.08,"#1e261f");
  ctx.strokeStyle="#c87b6b";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(r*1.33,0);ctx.lineTo(r*1.63,0);ctx.moveTo(r*1.51,0);ctx.lineTo(r*1.67,-r*.12);ctx.stroke();
 }else if(t==="frog"){
  for(const sign of [-1,1]){
   oval(-r*.55,sign*r*.65,r*.41,r*.30,fur,sign*.24);
   oval(-r*.88,sign*r*.87+pace*sign,r*.38,r*.18,belly,sign*.20);
   oval(r*.54,sign*r*.44,r*.23,r*.22,fur);
  }
  oval(-r*.05,0,r*.93,r*.65,fur);oval(r*.53,0,r*.57,r*.55,fur);
  for(const sign of [-1,1]){
   oval(r*.74,sign*r*.41,r*.18,r*.21,"#d6eabd");
   oval(r*.79,sign*r*.43,r*.075,r*.12,"#1f3425");
  }
  ctx.strokeStyle="#355f35";ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(r*.79,0,r*.26,.15,Math.PI-.15);ctx.stroke();
 }else if(t==="crow"){
  oval(-r*.22,0,r*.87,r*.50,fur);
  for(const sign of [-1,1])oval(-r*.36,sign*r*.29+pace*.14,r*.68,r*.21,"#4e5865",sign*.31);
  triangle([-r*.8,0,-r*1.55,-r*.37,-r*1.41,r*.34],fur);
  oval(r*.58,0,r*.42,r*.39,fur);
  triangle([r*.86,-r*.13,r*1.35,-r*.08,r*.86,r*.17],"#353a40");
  oval(r*.65,-r*.19,r*.10,r*.10,"#c8d1c7");oval(r*.66,-r*.19,r*.045,r*.06,"#1a2121");
 }else if(t==="weasel"){
  ctx.strokeStyle=fur;ctx.lineWidth=r*.20;ctx.beginPath();
  ctx.moveTo(-r*1.03,.0);ctx.bezierCurveTo(-r*1.55,-r*.55,-r*1.8,r*.28,-r*2.17,r*.04);ctx.stroke();
  for(const sign of [-1,1])for(const px of [-.69,.55])oval(px*r,sign*r*.42+pace*sign,r*.15,r*.20,"#6b543b");
  oval(-r*.1,0,r*1.25,r*.40,fur);oval(r*.75,0,r*.41,r*.32,fur);
  oval(r*.68,-r*.19,r*.12,r*.09,"#171f1c");triangle([r*.97,-r*.13,r*1.29,0,r*.97,r*.13],belly);
 }else if(t==="raccoonDog"){
  oval(-r*1.18,0,r*.56,r*.48,"#685d4c");
  for(const sign of [-1,1])for(const px of [-.59,.53])oval(px*r,sign*r*.58+pace*sign,r*.23,r*.31,"#413d38");
  oval(-r*.13,0,r*1.10,r*.73,fur);oval(r*.79,0,r*.56,r*.51,fur);
  for(const sign of [-1,1]){
   oval(r*.95,sign*r*.27,r*.33,r*.23,"#403d38",sign*.22);
   triangle([r*.58,sign*r*.32,r*.65,sign*r*.73,r*.97,sign*r*.42],"#4a4540");
   oval(r*.98,sign*r*.25,r*.08,r*.07,"#e8e1d6");
  }
  oval(r*1.24,0,r*.25,r*.20,"#39342f");
 }else if(t==="deer"){
  for(const sign of [-1,1])for(const px of [-.55,.48]){
   const x=r*px,y=sign*r*.40+pace*sign;
   oval(x,y,r*.15,r*.56,fur);oval(x-r*.06,y+sign*r*.39,r*.21,r*.13,"#3e3833");
  }
  oval(-r*.1,0,r*1.06,r*.49,fur);oval(r*.82,0,r*.54,r*.34,fur);
  triangle([r*.92,-r*.25,r*1.52,-r*.13,r*1.02,r*.21],belly);
  for(const sign of [-1,1]){
   triangle([r*.58,sign*r*.21,r*.48,sign*r*.70,r*.87,sign*r*.39],fur);
   ctx.strokeStyle="#c2aa83";ctx.lineWidth=r*.085;ctx.lineCap="round";ctx.beginPath();
   ctx.moveTo(r*.66,sign*r*.36);ctx.lineTo(r*.39,sign*r*1.09);
   ctx.lineTo(r*.06,sign*r*1.34);ctx.moveTo(r*.37,sign*r*1.10);
   ctx.lineTo(r*.60,sign*r*1.41);ctx.stroke();
   oval(r*1.06,sign*r*.10,r*.09,r*.08,"#222323");
  }
  oval(r*1.42,0,r*.12,r*.10,"#3c3330");
 }else return false;
 return true;
}


/* Accurate-to-silhouette procedural 2D forms for the three new playable species.
 * All features are actual geometric details: no sprites or external images. */
function drawRarePlayer2D(o,r,fur,light,pace,oval,triangle){
 const t=o.type;if(!["manul","tibetanFox","shoebill"].includes(t))return false;
 const line=(points,color,width=1.5)=>{
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";
  ctx.beginPath();ctx.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);ctx.stroke();
 };
 if(t==="manul"){
  // Pallas's cat: very short legs, thick frosted fur, round eyes and low-set ears.
  for(let k=4;k>=0;k--){
   const x=-r*(1.01+k*.34),band=k%2?"#6c6f6b":"#c8c5b8";
   oval(x,Math.sin(k*.7)*r*.10,r*(.37-k*.034),r*(.25-k*.02),band,-.12);
  }
  for(const side of [-1,1])for(const front of [-1,1])
   oval(front*r*.55,side*r*.53+pace*side*.20,r*.21,r*.18,"#77776f");
  oval(-r*.21,0,r*1.30,r*.73,fur);
  for(let k=0;k<14;k++){
   const x=-r*.95+k*r*.145;
   triangle([x,-r*.60,x+r*.07,-r*(.78+(k%3)*.055),x+r*.23,-r*.57],k%3?"#c8c5b7":"#8d9088");
   triangle([x,r*.60,x+r*.12,r*(.82+(k%3)*.03),x+r*.23,r*.58],k%2?"#d0cbbd":"#96998f");
  }
  oval(r*.46,0,r*.82,r*.73,"#a4a49d"); // broad face
  oval(r*.56,0,r*.66,r*.63,"#d4d0c3");
  for(const side of [-1,1]){
   oval(r*.22,side*r*.68,r*.20,r*.22,"#8c857b");
   oval(r*.22,side*r*.72,r*.11,r*.12,"#a8948d");
   oval(r*.74,side*r*.25,r*.15,r*.17,"#dcbf71");
   oval(r*.78,side*r*.25,r*.082,r*.090,"#1c221e"); // round pupils
   line([r*.50,side*r*.18,r*.30,side*r*.36],"#545c59",2);
   line([r*.40,side*r*.42,r*.18,side*r*.53],"#626863",1.4);
   for(let j=0;j<3;j++)line([r*.98,side*r*.09,r*(1.30+j*.14),side*r*(.12+j*.12)],"#e9e7dc",.85);
  }
  triangle([r*1.05,-r*.08,r*1.18,0,r*1.05,r*.08],"#8e6d70");
  line([r*.98,0,r*.80,r*.12],"#5b5651",1.2);
 }else if(t==="tibetanFox"){
  // Tibetan sand fox: wide, nearly rectangular cheeks, narrow eyes, thick sand coat.
  for(let k=5;k>=0;k--){
   const x=-r*(1.04+k*.29);
   oval(x,Math.sin(k*.4)*r*.10,r*(.30-k*.027),r*(.22-k*.016),k%2?"#c1a68a":"#e0c8a6");
  }
  for(const side of [-1,1])for(const front of [-1,1])
   oval(front*r*.59,side*r*.53+pace*side*.22,r*.19,r*.25,"#8b7565");
  oval(-r*.22,0,r*1.18,r*.56,"#b9a18b");
  oval(r*.22,0,r*.90,r*.42,"#e4d1b9");
  for(let j=0;j<10;j++)triangle([-r*.96+j*r*.21,-r*.5,-r*.87+j*r*.21,-r*.68,-r*.74+j*r*.21,-r*.52],j%2?"#ccb59c":"#a78d7c");
  for(const side of [-1,1]){
   triangle([r*.30,side*r*.38,r*.23,side*r*.88,r*.68,side*r*.45],"#82756d");
   triangle([r*.39,side*r*.48,r*.31,side*r*.73,r*.54,side*r*.49],"#dfbaa7");
   oval(r*.78,side*r*.34,r*.51,r*.27,"#9c958b");
   oval(r*.97,side*r*.37,r*.45,r*.26,"#eee4d4");
   oval(r*.90,side*r*.10,r*.20,r*.12,"#ded2c1");
   oval(r*1.01,side*r*.15,r*.11,r*.055,"#282c2b",side*.13); // narrow gaze
   line([r*.81,side*r*.20,r*1.17,side*r*.21],"#6d6761",1.6);
  }
  // The squared broad cheek line is defining (not a standard pointed fox head).
  triangle([r*.95,-r*.53,r*1.51,-r*.39,r*1.51,r*.39,r*.95,r*.53],"#e5d5be");
  oval(r*1.48,0,r*.18,r*.16,"#4d443e");
  line([r*1.17,r*.20,r*1.4,r*.12],"#867a70",1.1);
 }else{
  // Shoebill: rigid upright stance, elongated legs, giant hooked shoe-shaped bill.
  const thrust=o.beakVisual>0?.40:0,flap=o.jumpTime>0||o.pounceTime>0;
  for(const side of [-1,1]){
   line([-r*.25,side*r*.12,-r*.56,side*r*(.94+Math.sin((o.steps||0)*.7)*.1)],"#8b8e83",r*.14);
   for(let toe=-1;toe<=1;toe++)
    line([-r*.56,side*r*.92,-r*(.78+toe*.08),side*r*(.97+toe*.14)],"#6b7978",r*.085);
  }
  triangle([-r*1.18,-r*.28,-r*1.63,0,-r*1.16,r*.31],"#58686c");
  oval(-r*.17,0,r*.84,r*.57,fur);
  for(const side of [-1,1]){
   oval(-r*.36,side*r*(flap?.75:.36),r*(flap?.98:.72),r*(flap?.37:.21),"#687982",side*.14);
   for(let k=0;k<5;k++)line([-r*.80+k*r*.15,side*r*.40,-r*1.12+k*r*.13,side*r*(flap?1.01:.64)],"#9ba8aa",1.2);
  }
  oval(r*.55,0,r*.41,r*.44,"#87969b"); // short thick neck
  oval(r*.88,0,r*.35,r*.32,"#a0adb0");
  for(const side of [-1,1]){oval(r*.85,side*r*.26,r*.09,r*.085,"#efd396");oval(r*.88,side*r*.26,r*.043,r*.045,"#161c1d");}
  // Oversized shoe bill with thick upper ridge and a sharply hooked tip.
  triangle([r*1.03,-r*.38,r*(1.92+thrust),-r*.35,r*(2.10+thrust),0,r*(1.90+thrust),r*.35,r*1.03,r*.38],"#c3bb98");
  oval(r*(1.47+thrust),0,r*.49,r*.35,"#b7b299");
  line([r*1.16,-r*.18,r*(1.96+thrust),-r*.15],"#827f6b",r*.042);
  triangle([r*(2.02+thrust),-r*.11,r*(2.21+thrust),0,r*(2.02+thrust),r*.12],"#625e54");
  oval(r*(1.44+thrust),-r*.24,r*.045,r*.035,"#4a514b");
  for(let k=0;k<3;k++)triangle([r*.31,-r*.24+k*r*.12,r*.42,-r*.48+k*r*.12,r*.58,-r*.28+k*r*.12],"#bdc7bf");
 }
 return true;
}

function drawCreature(o,isPlayer){
 const s=isPlayer?P.base:species[o.type],r=o.r;
 const t=!isPlayer&&o.type==="strayCat"?"cat":!isPlayer&&o.type==="wildFox"?"fox":o.type;
 const hit=!isPlayer&&o.flash>0,fur=hit?"#ffe4bc":s.color,light=s.belly;
 const gait=(isPlayer?o.steps:o.step)||0;
 const motion=isPlayer&&P.dashTime>0?1.5:clamp(Math.hypot(o.vx||0,o.vy||0)/Math.max(1,s.speed),0,1.5);
 const attackPrep=isPlayer&&o.pendingStrike?clamp(1-o.windup/Math.max(.001,Math.min(.15,o.rate*.38)),0,1):(!isPlayer&&o.windup>0?clamp(1-o.windup/Math.max(.01,o.windupTotal||.53),0,1):0);
 const swingDuration=isPlayer?.18:.22,swingLeft=clamp(o.swing||0,0,swingDuration);
 const attackSnap=swingLeft>0?clamp((swingDuration-swingLeft)/.033,0,1)*clamp(swingLeft/.12,0,1):0;
 const attackLeap=isPlayer&&o.jumpDive&&o.jumpTime>0?.35:0;
 const attackCharge=!isPlayer&&(t==="boar"||t==="alpha"||t==="oneEyedWolf"||t==="whiteTiger"||t==="giantMoose"||t==="giantBuffalo"||t==="rhino")?clamp((o.chargeTime||0)/(t==="alpha"?.24:t==="oneEyedWolf"?.28:t==="whiteTiger"?.39:t==="giantMoose"?.46:t==="giantBuffalo"?.53:t==="rhino"?.57:.36),0,1)*.55:0;
 const attackReach=Math.max(attackSnap,attackCharge)+attackLeap;
 const rushPose=isPlayer&&(o.pendingStrike||o.swing>0)?(o.rushActiveStep||0):0;
 const foreDrive=(side,base)=>rushPose===1||rushPose===2?attackReach*(side===(rushPose===1?-1:1)?1:.08):rushPose===3?attackReach*.15:rushPose===4?attackReach*.06:rushPose===5?attackReach*.62:base;
 const hindDrive=side=>rushPose===4?-attackReach*(side<0?.78:.22):0;
 const stride=t==="cat"?1.46:t==="fox"?1.08:t==="wolf"?.62:.9;
 const pace=Math.sin(gait*stride)*r*(t==="cat"?.37:t==="fox"?.32:t==="wolf"?.25:.23)*motion;
 const tailSway=Math.sin(gait*(t==="cat"?.88:t==="fox"?.55:.62))*r*(t==="cat"?.29:t==="fox"?.19:.15)*motion;
 const oval=(x,y,w,h,color,rot=0)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.5,w),Math.max(.5,h),rot,0,TWO);ctx.fill();
 };
 const triangle=(pts,color)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);
  for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);
  ctx.closePath();ctx.fill();
 };
 ctx.save();ctx.translate(o.x,o.y);
 if(isPlayer&&o.hidden)ctx.globalAlpha*=.46; // Match WebGL stealth translucency.
 const lift2D=z=>ctx.translate(VIEW.c*z*.93*cameraZoom/VIEW_DET,-VIEW.a*z*.93*cameraZoom/VIEW_DET);
 const baseZ=isPlayer?(P.groundZ||0):0;
 const floorZ=baseZ+(MOUNTAIN?.height(o.x,o.y)||0);
 if(floorZ>0)lift2D(floorZ);
 oval(r*.37,r*.66,r*1.32,r*.53,"#030c10a0");
 oval(r*.19,r*.32,r*.96,r*.4,"#0b1d2083");
 if(isPlayer&&P.jumpHeight>baseZ)lift2D(P.jumpHeight-baseZ);
 if(!isPlayer&&(o.evadeHeight||0)>0)lift2D(o.evadeHeight);
 if(!isPlayer&&o.type==="giantEagle")lift2D(Math.max(10,Number(o.airHeight)||125)); // Real sideways leap also clears the ground in Canvas2D.
 // Stealth alpha was already applied before shadow/body drawing.
 ctx.rotate(o.dir||0);
 if(!isPlayer&&o.resting){ctx.scale(1.07,.68);ctx.translate(0,r*.15);}
 const bound=t==="fox"?Math.abs(Math.sin(gait*1.08))*.19:t==="cat"?Math.abs(Math.sin(gait*1.46))*.13:t==="wolf"?Math.abs(Math.sin(gait*.62))*.105:Math.abs(Math.sin(gait*.9))*.09;
 ctx.translate(r*(attackReach*(t==="wolf"?.25:t==="cat"?.19:.29)-attackPrep*.12),bound*motion*r+attackPrep*r*.09);
 if(isPlayer){
  ctx.scale(1.14,1.14);
  if(P.deathPose>0){const fall=clamp(P.deathPose,0,1),ease=fall*fall*(3-2*fall);ctx.rotate(ease*1.08);ctx.scale(1+ease*.10,1-ease*.43);ctx.translate(-r*.14*ease,r*.42*ease);}
  else if(P.wallKickTime>0&&t==="cat"){
    const kick=Math.min(1,P.wallKickTime/.43);
    ctx.rotate(Math.sin((1-kick)*Math.PI)*.32);
    ctx.scale(1+.30*kick,.76+.15*(1-kick));
   }else if(P.jumpTime>0)ctx.scale(1+(P.jumpDive?.30:.15),P.jumpDive?.70:.82);
   else if(P.pounceTime>0)ctx.scale(t==="wolf"?1.34:1.16,t==="wolf"?0.73:0.86);
   else if(t==="fox"&&P.abilityTime>0&&Math.hypot(P.vx,P.vy)>325)ctx.scale(1.24,.79);
  else if(P.pendingStrike){
   if(t==="cat"){ctx.translate(-r*.10,0);ctx.scale(.95,1.10)}
   else if(t==="wolf"){ctx.translate(-r*.09,0);ctx.scale(.91,1.13)}
   else{ctx.translate(-r*.13,0);ctx.scale(1.10,.87)}
  }else if(P.swing>0){
   if(t==="cat")ctx.scale(1.12,.88);
   else if(t==="wolf")ctx.scale(1.20,1.12);
   else ctx.scale(1.13,.92);
  }
 }
 if(drawRarePlayer2D(o,r,fur,light,pace,oval,triangle)){
  // Each playable species has its own body/face/special attack silhouette.
 }else if((!isPlayer||t==="deer")&&window.WildFauna?.draw2D?.(ctx,o,r,fur,light,pace)){
  // Common wildlife has species-specific silhouettes.
 }else if(drawStrongCreature2D(o,r,fur,light,pace,oval,triangle,attackReach)){
  // Unique strong enemy silhouette.
 }else if(!isPlayer&&drawOrdinaryCreature2D(o,r,fur,light,pace,oval,triangle)){
  // Distinct regular wildlife silhouette.
 }else if(t==="pigeon"){
  oval(-r*.3,0,r*.8,r*.58,fur);
  oval(-r*.48,-r*.38+pace,r*.63,r*.3,"#526d77",-.35);
  oval(-r*.48,r*.38-pace,r*.63,r*.3,"#9cb5ae",.35);
  oval(r*.6,0,r*.32,r*.28,"#839ca4");
  triangle([r*.77,-3,r*1.23,0,r*.77,3],"#ebc27a");
  triangle([-r,0,-r*1.55,-r*.29,-r*1.45,r*.32],"#adc6c3");
  oval(r*.69,-r*.16,1.4,1.5,"#eaf6ef");
 }else if(t==="rat"){
  ctx.strokeStyle="#c08b87";ctx.lineWidth=3;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-r*.8,0);ctx.bezierCurveTo(-r*1.55,-r*.65,-r*2.0,r*.55,-r*2.5,r*.08);ctx.stroke();
  oval(-r*.25,0,r*.82,r*.49,fur);
  oval(r*.39,0,r*.53,r*.43,fur);
  oval(r*.35,-r*.46,r*.23,r*.25,"#cba6a4");oval(r*.35,r*.46,r*.23,r*.25,"#cba6a4");
  triangle([r*.67,-r*.2,r*1.13,0,r*.67,r*.2],"#c1a39e");oval(r*1.13,0,1.8,1.8,"#db9ca0");
  oval(r*.72,-r*.19,1.8,1.7,"#181a1e");
 }else if(t==="rabbit"){
  oval(-r*.98,0,r*.25,r*.28,"#fff1dc");
  oval(-r*.15,0,r*.94,r*.56,fur);
  oval(r*.57,0,r*.44,r*.43,fur);
  for(const sign of [-1,1]){
   oval(r*.48,sign*r*.99,r*.26,r*.69,fur,sign*.18);
   oval(r*.48,sign*r*.99,r*.11,r*.48,"#e9ada7",sign*.18);
   oval(-r*.42,sign*r*.49+pace*sign,r*.41,r*.31,fur);
   oval(-r*.76,sign*r*.54+pace*sign,r*.39,r*.18,"#a99b87");
  }
  oval(r*.79,-r*.15,2,2,"#322d2a");oval(r*.96,0,1.8,1.7,"#d894a0");
 }else if(t==="boar"){
  triangle([-r*.8,-r*.55,-r*1.2,-r*.22,-r*.98,0], "#4f4640");
  for(let i=0;i<7;i++)triangle([-r*.7+i*r*.21,-r*.63,-r*.6+i*r*.21,-r*.94,-r*.45+i*r*.21,-r*.66],"#4f4339");
  for(const sign of [-1,1]){
   oval(-r*.4,sign*r*.64+pace*sign,r*.34,r*.31,"#4d4137");
   oval(r*.54,sign*r*.61-pace*sign,r*.32,r*.34,"#55433b");
  }
  oval(-r*.05,0,r*1.01,r*.83,fur);
  oval(r*.67,0,r*.63,r*.57,"#766058");
  oval(r*1.25,0,r*.31,r*.37,"#c7a78e");
  oval(r*1.39,-r*.12,r*.07,r*.09,"#56453f");oval(r*1.39,r*.12,r*.07,r*.09,"#56453f");
  for(const sign of [-1,1])triangle([r*.95,sign*r*.34,r*1.32,sign*r*.63,r*1.17,sign*r*.16],"#f1dfb6");
  oval(r*.86,-r*.35,2.8,2.4,"#1c1f1d");
 }else if(t==="cat"){
  ctx.strokeStyle=fur;ctx.lineWidth=r*.18;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-r*.7,-r*.06);ctx.bezierCurveTo(-r*1.6,-r*.7,-r*1.8,r*.68+tailSway,-r*2.25,-r*.26+tailSway);ctx.stroke();
  for(const sign of [-1,1]){
   oval(r*(-.44+hindDrive(sign)),sign*r*.48+pace*sign,r*.2,r*.28,fur);
   oval(r*(.36+foreDrive(sign,attackReach*(sign<0?1:.52))),sign*r*(.44-attackReach*.10)-pace*sign,r*.19,r*.27,fur);
  }
  oval(-r*.14,0,r*.96,r*.42,fur);
  for(const q of [-.42,-.06,.3]){
   ctx.strokeStyle="#6c776e";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q*r,-r*.49);ctx.lineTo((q-.1)*r,-r*.19);ctx.stroke();
  }
  oval(r*.55,0,r*.49,r*.46,fur);
  for(const sign of [-1,1]){
   triangle([r*.27,sign*r*.29,r*.28,sign*r*.85,r*.7,sign*r*.41],fur);
   triangle([r*.37,sign*r*.42,r*.34,sign*r*.69,r*.58,sign*r*.44],"#c49e9b");
  }
  oval(r*.78,-r*.18,r*.13,r*.1,"#d0ed82");oval(r*.78,r*.18,r*.13,r*.1,"#d0ed82");
  oval(r*.83,-r*.18,1.5,2.4,"#1a241f");oval(r*.83,r*.18,1.5,2.4,"#1a241f");
  triangle([r*.95,-r*.07,r*1.13,0,r*.95,r*.07],"#d78f88");
  ctx.strokeStyle="#eae7d8";ctx.lineWidth=1;
  for(const side of [-1,1])for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(r*.95,side*r*.14);ctx.lineTo(r*1.42,side*r*(.14+k*.1));ctx.stroke()}
 }else if(t==="fox"){
  ctx.fillStyle=fur;ctx.beginPath();ctx.moveTo(-r*.55,-r*.4);ctx.bezierCurveTo(-r*1.15,-r*.79,-r*1.8,-r*.85+tailSway,-r*2.5,-r*.26+tailSway);
  ctx.bezierCurveTo(-r*2.9,r*.15+tailSway,-r*1.65,r*.71,-r*.63,r*.38);ctx.closePath();ctx.fill();
  triangle([-r*2.18,-r*.47+tailSway,-r*2.62,-r*.21+tailSway,-r*2.29,r*.15+tailSway],"#fff2d7");
  for(const side of [-1,1])for(const px of [-.47,.3]){
   oval((px+(px>0?foreDrive(side,attackReach*.62):hindDrive(side)))*r,side*r*(.52-(px>0?attackReach*.10:0))+pace*side,r*.16,r*.31,"#292a26");
  }
  oval(-r*.1,0,r*1.08,r*.40,fur);
  oval(r*.23,0,r*.50,r*.30,light);
  oval(r*.62,0,r*.42,r*.35,fur);
  for(const side of [-1,1])triangle([r*.36,side*r*.34,r*.45,side*r*1.0,r*.85,side*r*.42],fur);
  triangle([r*.76,-r*.23,r*1.82,0,r*.76,r*.23],light);
  triangle([r*1.53,-r*.075,r*1.78,0,r*1.53,r*.075],"#252526");
  oval(r*.83,-r*.23,2.2,2.4,"#1a201c");oval(r*.83,r*.23,2.2,2.4,"#1a201c");
 }else{
  const wolf=t==="wolf"||t==="alpha",alpha=t==="alpha";
  ctx.fillStyle=fur;ctx.beginPath();ctx.moveTo(-r*.62,-r*.31);ctx.lineTo(-r*1.54,-r*.64);ctx.lineTo(-r*1.7,-r*.33+tailSway);ctx.lineTo(-r*1.4,r*.39);ctx.lineTo(-r*.62,r*.33);ctx.fill();
  for(const side of [-1,1])for(const px of [-.44,.43])oval((px+(px>0?foreDrive(side,attackReach*.45):hindDrive(side)))*r,side*r*(.62-(px>0?attackReach*.10:0))+pace*side,r*.3,r*.35,wolf?"#4a5658":"#765d4c");
  oval(-r*.14,0,r*.99,r*.74,fur);
  oval(r*.1,-r*.04,r*.66,r*.57,wolf?"#576c73":"#8d6c51");
  if(wolf)for(const side of [-1,1])for(let k=0;k<3;k++)
   triangle([r*.01-k*r*.24,side*r*.52,-r*.08-k*r*.25,side*r*.92,r*.24-k*r*.25,side*r*.57],fur);
  if(alpha)for(const side of [-1,1])for(let k=0;k<4;k++)
   triangle([r*(.26-k*.24),side*r*.64,r*(.1-k*.26),side*r*1.25,r*(.48-k*.24),side*r*.66],k%2?"#344a4a":"#546c68");
  oval(r*.7,0,r*.58,r*.58,fur);
  for(const side of [-1,1]){
   if(wolf)triangle([r*.38,side*r*.39,r*.49,side*r*1.03,r*.92,side*r*.44],fur);
   else oval(r*.41,side*r*.59,r*.23,r*.48,"#684d41",side*.44);
  }
  oval(r*1.03,0,r*.39,r*.23,light);oval(r*1.36,0,r*.12,r*.11,"#171d1d");
  oval(r*.9,-r*.26,2.7,2.4,alpha?"#eeaa8f":"#e1dab1");
  oval(r*.9,r*.26,2.7,2.4,alpha?"#eeaa8f":"#e1dab1");
  if(alpha){for(const side of [-1,1])triangle([r*1.06,side*r*.16,r*1.26,side*r*.38,r*1.22,side*r*.08],"#f4dfc3");ctx.strokeStyle="#e6d5c5";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(r*.56,-r*.36);ctx.lineTo(r*.91,-r*.06);ctx.moveTo(r*.72,-r*.48);ctx.lineTo(r*1.05,-r*.19);ctx.stroke();}
 }
 if(attackPrep>0||attackReach>0){
  if(t==="cat"){
   const side=rushPose===2?1:rushPose===1?-1:attackSnap>.44?-1:1;
   if(attackReach>.15&&(rushPose===0||rushPose<=2))triangle([r*(.50+attackReach),side*r*.34,r*(.70+attackReach),side*r*.24,r*(.51+attackReach),side*r*.13],"#eee7d5");
  }else if(t==="fox"&&(rushPose===0||rushPose===3||rushPose===5)){
   oval(r*(1.1+attackReach*.36),0,r*.39,r*(.11+attackReach*.08),"#f4ead7");
  }else if((t==="wolf"||t==="alpha"||t==="dog")&&(rushPose===0||rushPose===3||rushPose===5)){
   oval(r*(1.11+attackReach*.44),r*(.08+attackReach*.15),r*.35,r*(.09+attackReach*.14),"#222a2a");
   oval(r*(1.16+attackReach*.43),-r*.04,r*.39,r*.14,light);
  }
 }
 ctx.save();ctx.globalAlpha=hit?.1:isPlayer?.4:.24;
 const sheen=ctx.createLinearGradient(-r*.8,-r*.8,r*.6,r*.2);
 sheen.addColorStop(0,"#eef7df");sheen.addColorStop(1,"#eef7df00");
 ctx.fillStyle=sheen;ctx.beginPath();ctx.ellipse(-r*.1,-r*.25,r*.73,r*.19,-.15,0,TWO);ctx.fill();ctx.restore();
 if(isPlayer&&mode!=="dying"){
  // For SOLO5, the gold ring/label is drawn once by drawSquadFieldMarkers.
  // Keep the legacy 2D outline only for pre-gacha / SAVE_SCHEMA2 characters.
  if(!P.squadIndividualId){
   ctx.strokeStyle=P.inv>0?"#f5b668a8":"#b5f1c8bd";ctx.lineWidth=1.3;
   ctx.beginPath();ctx.arc(0,0,r+5,0,TWO);ctx.stroke();
   ctx.font="900 10px sans-serif";ctx.textAlign="center";ctx.fillStyle="#f5fce8";
   ctx.fillText(P.hidden?"潜伏中":"YOU",0,-r-21);
  }
  if(P.abilityTime>0){ctx.strokeStyle="#ffe0a0";ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(0,0,r+10,0,TWO);ctx.stroke();ctx.setLineDash([])}
 }
 ctx.restore();
 if(!isPlayer&&!s.prey&&o.hp<o.maxHp){ctx.fillStyle="#101719c9";ctx.fillRect(o.x-21,o.y-r-17,42,4);ctx.fillStyle="#e9a077";ctx.fillRect(o.x-21,o.y-r-17,42*o.hp/o.maxHp,4)}
 
}
let guideCache=null,navGrid=new Map();
function routeClear(a,b,radius=P.r){
 const radiusForRoute=radius,pad=(radius+5)*.8,border=radius+17;
 if(a.x<border||a.y<border||b.x<border||b.y<border||
    a.x>WORLD.w-border||b.x>WORLD.w-border||a.y>WORLD.h-border||b.y>WORLD.h-border)return false;
 const dx=b.x-a.x,dy=b.y-a.y;
 if(Math.max(a.x,b.x)>5500){
  const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/32));
  for(let k=0;k<=n;k++){const t=k/n;if(waterBlocksLand(a.x+dx*t,a.y+dy*t))return false;}
 }
 // A straight NPC route must respect the same mountain cliffs, trees and
 // bridge openings as player collision. Sample only near mountain terrain.
 if(MOUNTAIN&&Math.max(a.x,b.x)>=MOUNTAIN.CITY_EDGE&&
    Math.min(a.x,b.x)<=MOUNTAIN.EAST&&Math.max(a.y,b.y)>=2450&&Math.min(a.y,b.y)<=5250){
  const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/22));
  for(let k=1;k<n;k++){
   const t=k/n;
   if(MOUNTAIN.blocked(a.x+dx*t,a.y+dy*t,radiusForRoute))return false;
  }
 }
 for(const box of buildings){
  if(box.interior){
   if(shelterWalls(box).some(w=>segmentRect(a,b,w,pad))||shelterFurniture(box).some(w=>segmentRect(a,b,w,pad)))return false;
   continue;
  }
  let enter=0,exit=1;
  const axes=[[a.x,dx,box.x-pad,box.x+box.w+pad],[a.y,dy,box.y-pad,box.y+box.h+pad]];
  for(const [origin,velocity,min,max] of axes){
   if(Math.abs(velocity)<1e-9){if(origin<min||origin>max){enter=2;break}continue}
   const t1=(min-origin)/velocity,t2=(max-origin)/velocity;
   enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));
   if(enter>exit)break;
  }
  if(enter<=exit&&enter<=1&&exit>=0)return false;
 }
 for(const prop of streetProps){
  if(prop.type!=="car"&&prop.type!=="vending"&&prop.type!=="barrier")continue;
  const clearance=prop.r+8+radiusForRoute*.40;
  const vx=b.x-a.x,vy=b.y-a.y,length2=vx*vx+vy*vy;
  const t=length2>1e-9?clamp(((prop.x-a.x)*vx+(prop.y-a.y)*vy)/length2,0,1):0;
  const nx=a.x+vx*t-prop.x,ny=a.y+vy*t-prop.y;
  if(nx*nx+ny*ny<clearance*clearance)return false;
 }
 return true;
}
function navSetup(radius=P.r){
 const cell=72,cols=Math.ceil(WORLD.w/cell),rows=Math.ceil(WORLD.h/cell);
 if(navGrid.has(radius))return navGrid.get(radius);
 const pass=new Uint8Array(cols*rows);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)pass[y*cols+x]=collides((x+.5)*cell,(y+.5)*cell,radius+8)?0:1;
 const grid={cell,cols,rows,pass,radius};navGrid.set(radius,grid);return grid;
}
function routeTo(goal,actor=P){
 const {cell,cols,rows,pass}=navSetup(actor.r),size=cols*rows;
 const center=i=>({x:(i%cols+.5)*cell,y:(Math.floor(i/cols)+.5)*cell});
 const nearest=p=>{
  const cx=clamp(Math.floor(p.x/cell),0,cols-1),cy=clamp(Math.floor(p.y/cell),0,rows-1);
  let best=-1,bestDist=Infinity;
  for(let r=0;r<=5;r++){
   for(let yy=Math.max(0,cy-r);yy<=Math.min(rows-1,cy+r);yy++)for(let xx=Math.max(0,cx-r);xx<=Math.min(cols-1,cx+r);xx++){
    if(r>0&&Math.max(Math.abs(xx-cx),Math.abs(yy-cy))!==r)continue;
    const id=yy*cols+xx;if(!pass[id])continue;
    const q=center(id),d=dist(p,q);
    if(d<bestDist&&routeClear(p,q,actor.r)){best=id;bestDist=d}
   }
   if(best>=0)return best;
  }
  return best;
 };
 const start=nearest(actor),end=nearest(goal);if(start<0||end<0)return null;
 const score=new Float64Array(size);score.fill(Infinity);score[start]=0;
 const from=new Int32Array(size);from.fill(-1);
 const closed=new Uint8Array(size),heap=[];
 const heuristic=i=>{const dx=Math.abs(i%cols-end%cols),dy=Math.abs(Math.floor(i/cols)-Math.floor(end/cols));return Math.max(dx,dy)+(Math.SQRT2-1)*Math.min(dx,dy)};
 function push(id,f){
  const n={id,f};let i=heap.length;heap.push(n);
  while(i>0){const parent=(i-1)>>1;if(heap[parent].f<=n.f)break;heap[i]=heap[parent];i=parent}
  heap[i]=n;
 }
 function pop(){
  const top=heap[0],last=heap.pop();
  if(heap.length){let i=0;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}
  return top.id;
 }
 push(start,heuristic(start));
 const dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
 let expanded=0;
 while(heap.length&&expanded++<size){
  const cur=pop();if(closed[cur])continue;closed[cur]=1;
  if(cur===end){
   const nodes=[];let id=end;
   while(id!==start&&id>=0&&nodes.length<size){nodes.push(center(id));id=from[id]}
   if(id!==start)return null;
   nodes.push(center(start));nodes.reverse();nodes.push({x:goal.x,y:goal.y});
   return nodes;
  }
  const x=cur%cols,y=Math.floor(cur/cols);
  for(const [dx,dy] of dirs){
   const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=cols||ny>=rows)continue;
   const next=ny*cols+nx;if(!pass[next]||closed[next])continue;
   if(dx&&dy&&(!pass[y*cols+nx]||!pass[ny*cols+x]))continue;
   if(!routeClear(center(cur),center(next),actor.r))continue;
   const waypoint=center(next);
   const value=score[cur]+(dx&&dy?Math.SQRT2:1);
   if(value>=score[next])continue;
   score[next]=value;from[next]=cur;push(next,value+heuristic(next));
  }
 }
 return null;
}
function reachableObjective(goal){
 if(!goal||!P||!collides(goal.x,goal.y,P.r+5))return goal;
 let best=null,cost=Infinity;
 for(const radius of [42,54,63])for(let k=0;k<16;k++){
  const a=k*Math.PI/8,c={x:goal.x+Math.cos(a)*radius,y:goal.y+Math.sin(a)*radius};
  if(collides(c.x,c.y,P.r+5)||lineBlocked(c,goal))continue;
  const score=dist(P,c)+dist(c,goal)*.1;
  if(score<cost){cost=score;best=c}
 }
 return best?{x:best.x,y:best.y,label:goal.label,approach:true}:goal;
}
function guidancePoint(goal){
 if(!goal||!P)return null;
 const destination=reachableObjective(goal);
 if(routeClear(P,destination)){guideCache=null;return destination}
 if(guideCache&&elapsed-guideCache.time<.48&&Math.hypot(guideCache.px-P.x,guideCache.py-P.y)<72&&Math.hypot(guideCache.gx-goal.x,guideCache.gy-goal.y)<58)return guideCache.point;
 const route=routeTo(destination);
 let point=null;
 if(route){for(let i=route.length-1;i>=0;i--)if(routeClear(P,route[i])){point={x:route[i].x,y:route[i].y,label:goal.label,detour:true};break}}
 if(!point)point={x:P.x,y:P.y,label:goal.label,detour:true,blocked:true};
 guideCache={time:elapsed,px:P.x,py:P.y,gx:goal.x,gy:goal.y,point};
 return point;
}
function drawOccludedSilhouettes(entities){
 for(const b of buildings){
  if(b.interior)continue; // Room is not a solid block; do not ghost actors behind its absent roof.
  if(!visible(b.x+b.w/2,b.y+b.h/2,Math.max(b.w,b.h)+180))continue;
  const rise=b.roofZ||85+(b.kind%4)*17,offset=rise*.93*cameraZoom;
  const ox=VIEW.c*offset/VIEW_DET,oy=-VIEW.a*offset/VIEW_DET;
  const x=b.x,y=b.y,w=b.w,h=b.h,points=[];
  for(const [dx,dy] of [[0,0],[w,0],[w,h],[0,h]])points.push([x+dx,y+dy],[x+dx+ox,y+dy+oy]);
  points.sort((a,c)=>a[0]-c[0]||a[1]-c[1]);
  const cross=(a,c,d)=>(c[0]-a[0])*(d[1]-a[1])-(c[1]-a[1])*(d[0]-a[0]);
  const lower=[],upper=[];
  for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(let k=points.length-1;k>=0;k--){const p=points[k];while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  const hull=lower.slice(0,-1).concat(upper.slice(0,-1));if(hull.length<3)continue;
  const behind=o=>screenDepth(o.x,o.y)<screenDepth(x+w/2,y+h)-2&&
   Math.abs(o.x-(x+w/2))<w/2+350&&Math.abs(o.y-(y+h/2))<h/2+350&&
   !(o===P&&(P.groundZ||0)>=rise-3&&P.x>=x&&P.x<=x+w&&P.y>=y&&P.y<=y+h);
  const hiddenAnimals=entities.filter(behind),hiddenFood=carcasses.filter(o=>visible(o.x,o.y,45)&&behind(o));
  if(!hiddenAnimals.length&&!hiddenFood.length)continue;
  ctx.save();ctx.beginPath();ctx.moveTo(hull[0][0],hull[0][1]);
  for(let k=1;k<hull.length;k++)ctx.lineTo(hull[k][0],hull[k][1]);
  ctx.closePath();ctx.clip();ctx.globalAlpha*=.36;
  for(const e of hiddenAnimals)drawCreature(e,e===P);
  for(const food of hiddenFood)drawItem(food);
  ctx.restore();
 }
}
// Route-aware mission navigation: two discreet direction chevrons, never a large floating HUD.
function drawMissionChevrons(){
 if(!P||mode!=="play"||mission>=7||!guideWisp||!guideGoal)return;
 const dx=guideWisp.x-P.x,dy=guideWisp.y-P.y,waypointDistance=Math.hypot(dx,dy);
 const goalDistance=Math.hypot(guideGoal.x-P.x,guideGoal.y-P.y);
 if(!Number.isFinite(waypointDistance)||!Number.isFinite(goalDistance)||waypointDistance<12||goalDistance<42)return;
 const ux=dx/waypointDistance,uy=dy/waypointDistance;
 const start=projectGroundLabel(P.x,P.y),forward=projectGroundLabel(P.x+ux*100,P.y+uy*100);
 const bearing=Math.atan2(forward.y-start.y,forward.x-start.x);
 if(Math.hypot(forward.x-start.x,forward.y-start.y)<8)return;
 const count=waypointDistance>=155&&goalDistance>=190?2:1;
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
 ctx.font="900 "+(vh<=520?18:21)+"px sans-serif";
 for(let i=0;i<count;i++){
  const step=Math.min(waypointDistance*.82,62+i*64);
  const pos=projectGroundLabel(P.x+ux*step,P.y+uy*step);
  if(!Number.isFinite(pos.x)||!Number.isFinite(pos.y)||pos.x<30||pos.x>vw-30||
     pos.y<Math.min(72,vh*.16)||pos.y>vh-42)continue;
  ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(bearing);
  ctx.globalAlpha=.68+.15*(.5+.5*Math.sin(elapsed*4-i*.8));
  ctx.strokeStyle="rgba(4,28,32,.88)";ctx.lineWidth=3.6;ctx.strokeText("〉〉",0,0);
  ctx.fillStyle="#9ef4de";ctx.fillText("〉〉",0,0);ctx.restore();
 }
 ctx.restore();
}

function drawShelterEntranceMarker(){
 if(mode!=="play")return;
 const entry=nearestShelterEntrance();
 if(!entry)return;
 const b=entry.building,door={x:entry.approach.x,y:b.y-10},raw=projectGroundLabel(door.x,door.y);
 const top=vh<=520?104:Math.min(190,vh*.23),bottom=vh<=520?90:Math.min(175,vh*.21);
 const px=clamp(raw.x,52,Math.max(53,vw-52));
 const py=clamp(raw.y,top,Math.max(top+1,vh-bottom));
 const offscreen=Math.hypot(px-raw.x,py-raw.y)>6,pulse=.5+.5*Math.sin(elapsed*3.9);
 ctx.save();ctx.globalCompositeOperation="source-over";
 const halo=ctx.createRadialGradient(px,py,2,px,py,offscreen?24:37);
 halo.addColorStop(0,"rgba(124,246,255,"+(.17+.07*pulse)+")");
 halo.addColorStop(.48,"rgba(63,187,255,.07)");
 halo.addColorStop(1,"rgba(63,187,255,0)");
 ctx.fillStyle=halo;ctx.beginPath();ctx.arc(px,py,offscreen?24:37,0,TWO);ctx.fill();
 ctx.lineWidth=2;ctx.strokeStyle="rgba(124,246,255,.65)";ctx.shadowColor="#57dfff";ctx.shadowBlur=4;
 ctx.beginPath();ctx.ellipse(px,py+3,offscreen?15:22,offscreen?12:10,0,0,TWO);ctx.stroke();
 if(!offscreen){
  ctx.beginPath();ctx.moveTo(px-18,py-3);ctx.lineTo(px-18,py-20);
  ctx.lineTo(px+18,py-20);ctx.lineTo(px+18,py-3);ctx.stroke();
 }
 ctx.restore();
 const label=offscreen?"入口方向":"建物入口";
 ctx.save();ctx.font="900 13px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.lineWidth=4;ctx.strokeStyle="#05202d";ctx.lineJoin="round";
 ctx.strokeText(label,px,py-34);ctx.fillStyle="#affaff";ctx.fillText(label,px,py-34);
 ctx.restore();
}
// World-space labels need the SAME elevation as the visible WebGL/Canvas
// objects. Flat project(x,y) puts mountain remains hundreds of pixels below
// the model, and also makes labels appear through cliffs.
function projectGroundLabel(x,y,above=0){
 const p=project(x,y),z=window.WildMountain?.height?.(x,y)||0;
 return {x:p.x,y:p.y-(z+Math.max(0,above))*.93*cameraZoom};
}
function drawRemainsLabels(){
 if(!P||mode!=="play")return;
 ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="900 13px sans-serif";let shown=0;
 for(const c of carcasses){
  if((c.type!=="corpse"&&c.type!=="bones")||dist(P,c)>205||!visible(c.x,c.y,65))continue;
  // An object behind solid geometry should not have a floating, always-on
  // screen label. The visual model and the UI must agree on visibility.
  if(lineBlocked(P,c))continue;
  const r=Math.max(15,Math.min(36,(c.r||9)*1.28));
  const p=projectGroundLabel(c.x,c.y,r*.55),y=p.y-13;
  if(p.x<27||p.x>vw-27||y<22||y>vh-24)continue;
  ctx.fillStyle=c.type==="bones"?"#263330e8":"#382c29e8";ctx.fillRect(p.x-24,y-11,48,22);
  ctx.strokeStyle=c.type==="bones"?"#f1ebd8":"#e8c2a1";ctx.lineWidth=1.5;ctx.strokeRect(p.x-24,y-11,48,22);
  ctx.fillStyle=c.type==="bones"?"#fff8e8":"#ffe1c3";ctx.fillText(c.type==="bones"?"骨":"死骸",p.x,y+1);
  if(++shown>=5)break;
 }ctx.restore();
}
const ENEMY_LABEL_NAMES={strayCat:"野良猫",wildFox:"野生キツネ",weasel:"イタチ",raccoonDog:"タヌキ",venomSnake:"☠ 毒ヘビ",cheetah:"チーター",lion:"ライオン",giraffe:"キリン",zebra:"シマウマ",elephant:"ゾウ",hippo:"カバ",giantEagle:"強敵・大鷲",dog:"野犬",boar:"イノシシ",alpha:"強敵・アルファ",giantSnake:"強敵・大蛇",oldBear:"強敵・老熊",giantBoar:"強敵・巨大イノシシ",blackPanther:"強敵・黒豹",oneEyedWolf:"強敵・隻眼の狼",whiteTiger:"強敵・白虎",giantHyena:"強敵・巨大ハイエナ",giantCrocodile:"強敵・巨大ワニ",giantHippo:"強敵・巨大カバ",giantAnaconda:"強敵・巨大アナコンダ"};
function drawThreatNames(use3D=false){
 if(!P||mode!=="play")return;
 ctx.save();ctx.textAlign="center";ctx.font="700 10px sans-serif";
 for(const m of mobs){
  if(m.hp<=0||(use3D&&m.strongBoss)||(species[m.type].prey&&m.type!=="zebra"&&!m.releasedIndividualId)||dist(P,m)>280||!visible(m.x,m.y,55)||lineBlocked(P,m))continue;
  const rise=m.type==="giantEagle"?(m.airHeight||125):Math.max(0,m.evadeHeight||0);
  const pos=projectGroundLabel(m.x,m.y,rise),names=ENEMY_LABEL_NAMES,y=pos.y-m.r*cameraZoom-20;
  const targetLevel=COMBAT_LEVELS?.level(m.type)||1,levelGap=Math.max(0,targetLevel-P.level);
  const threatName=(m.releasedIndividualId&&m.name?m.name+"（野生に帰還）":names[m.type]||STRONG_NAMES[m.type]||"危険")+(m.packId?"・群れ":"")+(m.damageScale>1.23&&!m.strongBoss?" 強化":"");
  ctx.globalAlpha=m.windup>0||m.alert>0?.95:.78;ctx.fillStyle="#172321";ctx.fillRect(pos.x-69,y-14,138,31);
  ctx.fillStyle=m.type==="venomSnake"?"#e2e98a":m.windup>0?"#ffad9a":"#ecdfca";ctx.fillText(threatName,pos.x,y-2);
  ctx.fillStyle=levelGap>=5?"#ffad91":levelGap>0?"#ffe19b":"#b6e8c7";
  ctx.fillText("推奨LV"+targetLevel+(levelGap>=5?"｜非常に危険":levelGap>0?"｜格上":"｜適正"),pos.x,y+10);
 }
 ctx.restore();
}
// Screen-space vignette works identically over WebGL and Canvas2D.

const ACTOR_TOP_SCALE={giraffe:4.4,elephant:2.8,giantElephant:2.8,shoebill:3.05,hippo:2.15,giantHippo:2.15,giantEagle:2.1,deer:2.35,serow:2.35,mountainGoat:2.35,giantGorilla:2.4};
function drawAligned3DActorStatus(){
 // All 3D text and rings use the same model projected foot position, native zoom and terrain Z.
 // Allocate status/name/HP independently but without overlapping within or between animals.
 const upper=vh<=540?75:104,claimed=[];
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
 const reserve=(x,y,w,h)=>{
  if(!Number.isFinite(x)||!Number.isFinite(y)||x-w/2<8||x+w/2>vw-8||y-h/2<upper||y+h/2>vh-14)return false;
  const r={l:x-w/2-3,t:y-h/2-3,r:x+w/2+3,b:y+h/2+3};
  if(claimed.some(a=>a.l<r.r&&a.r>r.l&&a.t<r.b&&a.b>r.t))return false;
  claimed.push(r);return true;
 };
 // Preserve nearby enemy labels during melee. The player ownership label has
 // its own fixed anchor and must not suppress enemy names or health bars.
 const ordered=P?mobs.filter(m=>m.hp>0&&visible(m.x,m.y,130)&&!lineBlocked(P,m))
  .sort((a,b)=>Number(!!b.strongBoss)-Number(!!a.strongBoss)||dist(P,a)-dist(P,b)):[];
 for(const m of ordered){
  const distance=dist(P,m);
  if(distance>900)continue;
  const rise=m.type==="giantEagle"?Math.max(0,m.airHeight||125):Math.max(0,m.evadeHeight||0);
  const feet=projectGroundLabel(m.x,m.y,rise),ground=projectGroundLabel(m.x,m.y);
  const radius=Math.max(7,Math.max(1,m.r)*cameraZoom);
  if(feet.x<10||feet.x>vw-10||feet.y<15||feet.y>vh+100)continue;
  const scale=ACTOR_TOP_SCALE[m.type]||1.85;
  let cursor=feet.y-radius*scale-6;
  const prey=!!species[m.type]?.prey;
  const boss=!!m.strongBoss;
  if(boss){
   const pulse=1+Math.sin(elapsed*3.8+m.r)*.10;
   ctx.lineWidth=2.2;ctx.strokeStyle=m.hp<m.maxHp*.45?"#ff9c4bd9":"#ff5f4eb3";
   ctx.beginPath();ctx.ellipse(ground.x,ground.y+4,(radius+15)*pulse,(radius*.53+6)*pulse,0,0,TWO);ctx.stroke();
  }
  if(m.type==="dog"&&(m.foodTheftTell||0)>0){
   ctx.strokeStyle="#ffc38e";ctx.lineWidth=3;ctx.setLineDash([8,5]);
   ctx.beginPath();ctx.ellipse(ground.x,ground.y+3,(m.r+P.r+34)*cameraZoom,(m.r+P.r+34)*cameraZoom*.48,0,0,TWO);ctx.stroke();ctx.setLineDash([]);
  }
  const named=boss||!!m.releasedIndividualId||(!prey||m.type==="zebra")&&distance<=280;
  const damaged=!prey&&(boss||m.hp<m.maxHp)&&distance<=550;
  if(damaged){
   const w=boss?76:48,y=cursor-8;
   if(reserve(feet.x,y,w,8)){
    ctx.fillStyle="#091517d9";ctx.fillRect(feet.x-w/2,y-3,w,6);
    ctx.fillStyle=boss?"#ee7e71":"#ee9d79";
    ctx.fillRect(feet.x-w/2,y-3,w*clamp(m.hp/Math.max(1,m.maxHp),0,1),6);
   }
   cursor-=18;
  }
  if(named){
   const y=cursor-17,w=boss?142:138;
   if(reserve(feet.x,y,w,32)){
    const lv=COMBAT_LEVELS?.level(m.type)||1,gap=Math.max(0,lv-(P.level||1));
    const name=m.releasedIndividualId&&m.name?m.name+"（野生に帰還）":boss?"強敵・"+(STRONG_NAMES[m.type]||"危険"):
     (ENEMY_LABEL_NAMES[m.type]||STRONG_NAMES[m.type]||animals[m.type]?.name||"野生動物")+
     (m.packId?"・群れ":"")+(m.damageScale>1.23&&!m.strongBoss?" 強化":"");
    ctx.globalAlpha=m.windup>0||m.alert>0?.95:.87;
    ctx.fillStyle="#172321";ctx.fillRect(feet.x-w/2,y-16,w,32);
    ctx.font="700 10px sans-serif";ctx.fillStyle=m.windup>0?"#ffad9a":"#ecdfca";
    ctx.fillText(name,feet.x,y-7);
    ctx.fillStyle=gap>=5?"#ffad91":gap>0?"#ffe19b":"#b6e8c7";
    ctx.fillText("推奨LV"+lv+(gap>=5?"｜非常に危険":gap>0?"｜格上":"｜適正"),feet.x,y+7);
    ctx.globalAlpha=1;
   }
   cursor-=40;
  }
  const symbol=m.windup>0&&!prey?"!":m.resting?"Zz":(m.drinkPose||0)>0?"水":
   (m.scavengePose||0)>0||(m.foragePose||0)>0?"食":
   prey?(m.flee>0?"!":m.alert>0?"?":null):(m.search>0?"?":m.alert>0?"!":null);
  if(symbol&&distance<=550){
   const y=cursor-13;
   if(reserve(feet.x,y,30,22)){
    ctx.font="900 15px sans-serif";ctx.lineWidth=3;ctx.strokeStyle="#13201a";
    ctx.fillStyle=m.windup>0?"#ffbc9c":m.resting?"#c8e7ff":
     (m.drinkPose||0)>0?"#b5e8f1":symbol==="食"?"#d9f0b9":
     prey?"#ffe4a3":symbol==="?"?"#d6e8af":"#ffad8c";
    ctx.strokeText(symbol,feet.x,y);ctx.fillText(symbol,feet.x,y);
   }
  }
 }
 if(P&&mode==="play"&&P.dashTime>0){
  const f=projectGroundLabel(P.x,P.y,Math.max(0,P.groundZ||0));
  ctx.strokeStyle="#b4f7d88b";ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(f.x,f.y+3,(P.r+14)*cameraZoom,(P.r+14)*cameraZoom*.55,0,0,TWO);ctx.stroke();
 }
 for(const q of particles){
  const p=projectGroundLabel(q.x,q.y),alpha=clamp(q.life/Math.max(.001,q.max),0,1);
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>vw||p.y<0||p.y>vh)continue;
  ctx.globalAlpha=alpha;ctx.beginPath();
  if(q.ring){ctx.strokeStyle=q.color;ctx.lineWidth=3;ctx.arc(p.x,p.y,(1-alpha)*390*cameraZoom,0,TWO);ctx.stroke();}
  else{ctx.fillStyle=q.color;ctx.arc(p.x,p.y,q.size*cameraZoom,0,TWO);ctx.fill();}
 }
 ctx.globalAlpha=1;
 for(const f of popups){
  const p=projectGroundLabel(f.x,f.y);
  if(p.x<15||p.x>vw-15||p.y<upper||p.y>vh-15)continue;
  ctx.globalAlpha=clamp(f.life,0,1);ctx.font="900 14px Barlow Condensed,sans-serif";
  ctx.shadowColor="#00100c";ctx.shadowBlur=7;ctx.fillStyle=f.color;
  ctx.fillText(f.t,p.x,p.y);ctx.shadowBlur=0;
 }
 ctx.restore();
}
function drawDeathVignette(){
 if(mode!=="dying"&&mode!=="over")return;
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
 if(mode==="over"){
  ctx.fillStyle="rgba(5,9,12,.96)";ctx.fillRect(0,0,vw,vh);
 }else{
  // Let the body finish falling before the surrounding world fades to black.
  const quiet=clamp((deathSequenceTime-.58)/1.28,0,1);
  if(quiet>0){
   const pos=P?project(P.x,P.y):{x:vw*.5,y:vh*.5};
   const cx=clamp(pos.x,0,vw),cy=clamp(pos.y,0,vh),radius=Math.max(vw,vh)*.86;
   // Match the result screen's darkness during the final 340ms,
   // rather than abruptly obscuring the fallen animal at the transition.
   const finalQuiet=clamp((deathSequenceTime-1.86)/.34,0,1);
   const fade=ctx.createRadialGradient(cx,cy,radius*.05,cx,cy,radius);
   fade.addColorStop(0,"rgba(5,9,12,"+((.79+.17*finalQuiet)*quiet).toFixed(3)+")");
   fade.addColorStop(.55,"rgba(5,9,12,"+((.89+.07*finalQuiet)*quiet).toFixed(3)+")");
   fade.addColorStop(1,"rgba(5,9,12,"+(.96*quiet).toFixed(3)+")");
   ctx.fillStyle=fade;ctx.fillRect(0,0,vw,vh);
  }
 }
 ctx.restore();
}
function drawScene(){
 // Earthquakes affect the world view only; never transform the app or HUD.
 // Keep motion under two pixels to avoid motion sickness on mobile.
 const quake=mode==="play"?window.WildDisaster?.quakeShake?.(elapsed):null;
 const quakeOffset=quake?{x:Math.max(-1.5,Math.min(1.5,quake.x*.12)),y:Math.max(-1.2,Math.min(1.2,quake.y*.12))}:{x:0,y:0};
 const appSurface=$("app");
 if(appSurface&&appSurface.style.transform)appSurface.style.transform="";
 const presence=$("boss-presence");
 if(presence)presence.classList.toggle("active",mode==="play"&&elapsed<bossPresenceUntil);
 $("vignette").classList.toggle("boss-close",mode==="play"&&P&&activeStrongBosses().some(m=>dist(P,m)<370));
 const x=cam.x+quakeOffset.x+(mode==="dying"?0:shake?rnd(-shake,shake):0),y=cam.y+quakeOffset.y+(mode==="dying"?0:shake?rnd(-shake,shake):0);
 let use3D=false;
 if(window.Wild3D?.available&&debugRendererPreference!=="2d")use3D=window.Wild3D.render({vw,vh,dpr,cam,VIEW,cameraZoom,buildings,plants,mobs,P,elapsed,weather,snowpack:currentSnowpack(),WORLD,species,carcasses,streetProps,birdFlocks,scenicProps,disasterEvents:window.WildDisaster?.events?.()||[],roadsX,roadsY,landmarks:EXPLORE_SITES,waterAt:waterDepth,lightProfile:dayLightProfile(elapsed),nightVision:P?nightVisionProfile():null,dens:denSites.map(site=>({x:site.x,y:site.y,z:site.z,kind:site.kind,level:denLevel,stash:denStash,type:choice}))});
 // Keep Canvas2D shadows fixed to world coordinates and actual paused game time.
 if(!use3D)window.WildSeasonClouds?.capture2D?.({vw,vh,cam:{x,y},VIEW:{a:VIEW.a,b:VIEW.b,c:VIEW.c,d:VIEW.d},cameraZoom,plants,elapsed,weather,lightProfile:dayLightProfile(elapsed)});
 if(!use3D&&mode==="play"&&!warned3DFallback){warned3DFallback=true;notify("3D描画を開始できないため2D表示中です");}
 ctx.setTransform(dpr,0,0,dpr,0,0);
 if(use3D)ctx.clearRect(0,0,vw,vh);else{ctx.fillStyle="#152423";ctx.fillRect(0,0,vw,vh)}
 const entities=mobs.filter(m=>visible(m.x,m.y,70));if(P)entities.push(P);
 ctx.save();ctx.translate(vw/2,vh/2);ctx.transform(VIEW.a,VIEW.b,VIEW.c,VIEW.d,0,0);ctx.translate(-x-vw/2,-y-vh/2);
 if(!use3D){
  const farLeft=Math.max(0,Math.floor((x-vw*.7)/180)*180-180),farTop=Math.max(0,Math.floor((y-vh*1.3)/180)*180-180);
 for(const [x,y,w,h,col] of BIOME_AREAS){ctx.fillStyle=col;ctx.fillRect(x,y,w,h);}
 MOUNTAIN?.draw2D(ctx,visible);
 for(let xx=farLeft;xx<x+vw*1.8+180;xx+=180)for(let yy=farTop;yy<y+vh*2.3+180;yy+=180){
  const n=noise(xx/180,yy/180);ctx.fillStyle=n>.5?"#536a4214":"#b6a8850a";ctx.beginPath();ctx.ellipse(xx+78,yy+65,75+n*30,45+n*19,n,0,TWO);ctx.fill();
 }
 drawWater2D();
  roadDraw();
  // Canvas2D fallback receives the same world-year snow cover as native 3D.
  const snowCover=currentSnowpack();
  if(snowCover>.06){
   for(let xx=farLeft;xx<x+vw*1.8+180;xx+=90)
    for(let yy=farTop;yy<y+vh*2.3+180;yy+=90){
     if(noise(xx*.073,yy*.091)>snowCover||waterDepth(xx+44,yy+41)>.005)continue;
     ctx.fillStyle=(Math.floor(xx/90)+Math.floor(yy/90))%3?"#dceaf0dd":"#f1f4f6db";
     ctx.fillRect(xx+5,yy+8,81,78);
    }
  }
  drawScenery2D();
 drawDenBedding2D(false);
 // Foot-level water wake, visible only while an animal is actually moving.
 for(const e of entities)if(waterDepth(e.x,e.y)>.10&&Math.hypot(e.vx||0,e.vy||0)>25){
  ctx.save();ctx.strokeStyle="#b4dedaaf";ctx.lineWidth=2;ctx.beginPath();
  ctx.ellipse(e.x,e.y,Math.max(11,e.r*1.35),Math.max(5,e.r*.64),0,0,TWO);ctx.stroke();ctx.restore();
 }
 for(const site of EXPLORE_SITES)if(visible(site.x,site.y,500))drawLandmark2D(site);
 for(const d of debris){if(!visible(d.x,d.y,16))continue;ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.a);ctx.fillStyle=d.kind===0?"#b5a47a45":d.kind===1?"#314945":"#66756b75";ctx.fillRect(-d.r*.5,-d.r*.2,d.r*1.8,d.r*.7);ctx.restore()}
 const layers=[],covers=new Map();
 for(const e of entities)covers.set(e,[]);
 for(const p of plants){
  if(!visible(p.x,p.y,p.r))continue;
  let depth=screenDepth(p.x,p.y+p.r*.12);
  if(visibleShrub(p))for(const e of entities)if(Math.hypot(e.x-p.x,e.y-p.y)<p.r*.82){
   covers.get(e).push(p);
   depth=Math.min(depth,screenDepth(e.x,e.y)-.1);
  }
  layers.push({depth,kind:0,o:p});
 }
 for(const b of buildings)if(visible(b.x+b.w/2,b.y+b.h/2,Math.max(b.w,b.h)+140))
  layers.push({depth:screenDepth(b.x+b.w/2,b.y+b.h),kind:1,o:b});
 for(const c of carcasses)if(visible(c.x,c.y,40))layers.push({depth:screenDepth(c.x,c.y),kind:2,o:c});
 for(const lamp of lamps)if(visible(lamp.x,lamp.y,35))layers.push({depth:screenDepth(lamp.x,lamp.y),kind:3,o:lamp});
 for(const o of streetProps)if(visible(o.x,o.y,75))layers.push({depth:screenDepth(o.x,o.y+o.r*.2),kind:5,o});
 for(const e of entities)layers.push({depth:screenDepth(e.x,e.y),kind:4,o:e});
 layers.sort((a,b)=>a.depth-b.depth||a.kind-b.kind);
 for(const layer of layers){
  const o=layer.o;
  if(layer.kind===0)drawPlant(o);
  else if(layer.kind===1)drawBuilding(o);
  else if(layer.kind===2)drawItem(o);
  else if(layer.kind===5)drawStreetProp(o);
  else if(layer.kind===3){
   ctx.strokeStyle="#849587";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(o.x,o.y+7);ctx.lineTo(o.x,o.y-15);ctx.stroke();
   ctx.fillStyle="#c8aa6f";ctx.fillRect(o.x-7,o.y-18,14,5);
  }else{
   drawCreature(o,o===P);
   if(o===P&&mode!=="dying"&&mode!=="over")drawCarriedFood2D();
   for(const p of covers.get(o))drawCoverForeground(p);
  }
 }
 drawDenBedding2D(true); // Rooftop beds must be drawn above building roofs in 2D.
 for(const bird of birdFlocks)if(visible(bird.x,bird.y,90))drawFlyingBird(bird);
 drawOccludedSilhouettes(entities);
 }
 if(!use3D)drawBossThreats(entities);
 else if(BOSS_PATTERNS)for(const m of entities)if(m!==P&&m.strongBoss&&m.hp>0&&m.signature)BOSS_PATTERNS.draw(ctx,m.signature,elapsed,P?.r*.55||0);
 if(!use3D)for(const m of entities)if(m.companion&&m.hp>0){
  ctx.save();ctx.textAlign="center";ctx.font="900 13px sans-serif";
  ctx.lineWidth=3;ctx.strokeStyle="#123b37";ctx.strokeText("仲間",m.x,m.y-m.r-29);
  ctx.fillStyle="#9af5e9";ctx.fillText(m.squadIndividualId?(m.squadName||"仲間"):"仲間",m.x,m.y-m.r-29);ctx.restore();
 }
 if(!use3D)for(const m of entities)if(m.type==="dog"&&m.hp>0&&(m.foodTheftTell||0)>0){
  ctx.save();ctx.strokeStyle="#ffc38e";ctx.lineWidth=4;ctx.setLineDash([12,8]);
  ctx.beginPath();ctx.arc(m.x,m.y,m.r+P.r+34,0,TWO);ctx.stroke();ctx.restore();
 }
 if(!use3D)for(const m of entities)if(["macaque","chimpanzee"].includes(m.type)&&m.hp>0&&((m.macaqueTell||0)>0||(m.chimpTell||0)>0)){
  const a=Number.isFinite(m.chimpAim)&&m.type==="chimpanzee"?m.chimpAim:m.macaqueAim||0,reach=(m.type==="chimpanzee"?(m.chimpAttackKind==="branch"?m.r+P.r+48:350*1.02):395*.95);
  ctx.save();ctx.strokeStyle="#f0c486";ctx.lineWidth=4;ctx.setLineDash([15,11]);
  ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x+Math.cos(a)*reach,m.y+Math.sin(a)*reach);ctx.stroke();
  ctx.setLineDash([]);ctx.restore();
 }
 if(!use3D)for(const m of entities)if(["macaque","chimpanzee"].includes(m.type)&&(m.macaqueStone||m.chimpStone)){
  const stone=m.macaqueStone||m.chimpStone;
  ctx.save();ctx.fillStyle="#c1b7a0";ctx.strokeStyle="#574e44";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(stone.x,stone.y,7,0,TWO);ctx.fill();ctx.stroke();ctx.restore();
 }
 if(!use3D)for(const m of entities){
  if(m===P||m.hp<=0||m.windup>0)continue;
  const symbol=m.resting?"Zz":(m.drinkPose||0)>0?"水":(m.scavengePose||0)>0||(m.foragePose||0)>0?"食":species[m.type].prey?(m.flee>0?"!":m.alert>0?"?":null):(m.search>0?"?":m.alert>0?"!":null);
  if(!symbol)continue;
  ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillStyle=m.resting?"#c8e7ff":(m.drinkPose||0)>0?"#b5e8f1":(m.scavengePose||0)>0||(m.foragePose||0)>0?"#d9f0b9":m.sheltered?"#a5ddec":species[m.type].prey?"#ffe4a3":symbol==="?"?"#d6e8af":"#ffad8c";
  ctx.strokeStyle="#13201a";ctx.lineWidth=3;ctx.font="900 15px sans-serif";
  const py=m.y-m.r-29;ctx.strokeText(symbol,m.x,py);ctx.fillText(symbol,m.x,py);ctx.restore();
 }
  if(!use3D)for(const m of entities){
   if(m===P||species[m.type].prey||m.windup<=0)continue;
   ctx.save();ctx.textAlign="center";ctx.font="900 15px sans-serif";
   ctx.fillStyle=m.windup<.22?"#fff0b4":"#ffbc9c";
   ctx.fillText("!",m.x,m.y-m.r-24);ctx.restore();
  }
  if(!use3D&&P&&mode==="play"&&P.dashTime>0){ctx.strokeStyle="#b4f7d88b";ctx.lineWidth=4;ctx.beginPath();ctx.arc(P.x,P.y,P.r+14,0,TWO);ctx.stroke()}
 if(!use3D)for(const q of particles){const alpha=clamp(q.life/q.max,0,1);ctx.globalAlpha=alpha;
  if(q.ring){ctx.strokeStyle=q.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(q.x,q.y,(1-alpha)*390,0,TWO);ctx.stroke()}
  else{ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,TWO);ctx.fill()}}ctx.globalAlpha=1;
 if(!use3D)for(const f of popups){ctx.globalAlpha=clamp(f.life,0,1);ctx.font="900 14px Barlow Condensed,sans-serif";ctx.textAlign="center";ctx.shadowColor="#00100c";ctx.shadowBlur=7;ctx.fillStyle=f.color;ctx.fillText(f.t,f.x,f.y);ctx.shadowBlur=0}ctx.globalAlpha=1;
 const light=dayLightProfile(elapsed),nightAlpha=clamp((1-light.brightness)*.80,0,.76);
 if(!use3D){
  // Darkness is composed in screen space after world drawing, then feathered by night vision.
  if(light.warmth>.02){ctx.fillStyle="rgba(253,123,61,"+(light.warmth*.19)+")";ctx.fillRect(0,0,WORLD.w,WORLD.h);}
  if(light.brightness>1){ctx.save();ctx.globalCompositeOperation="screen";ctx.fillStyle="rgba(255,252,222,"+((light.brightness-1)*.52)+")";ctx.fillRect(0,0,WORLD.w,WORLD.h);ctx.restore();}
 }
 // Abandoned streetlights do not cast glowing ground halos.
 if(weather==="FOG"){
  ctx.fillStyle="rgba(164,176,162,.20)";
  if(use3D){ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillRect(0,0,vw,vh);ctx.restore();}
  else ctx.fillRect(0,0,WORLD.w,WORLD.h);
 }
 ctx.restore();
 if(use3D)drawAligned3DActorStatus();
 if(!use3D)drawNightVision2D(nightAlpha);
 
 if(P&&pounceStreaks.length>=2){
  ctx.save();ctx.lineCap="round";
  for(let i=1;i<pounceStreaks.length;i++){
   const a=pounceStreaks[i-1],b=pounceStreaks[i],pa=project(a.x,a.y),pb=project(b.x,b.y),alpha=Math.min(a.life,b.life)/.17;
   ctx.strokeStyle="rgba(237,243,207,"+(alpha*.38)+")";ctx.lineWidth=2.8*alpha;
   ctx.beginPath();ctx.moveTo(pa.x,pa.y-a.z*.93*cameraZoom);ctx.lineTo(pb.x,pb.y-b.z*.93*cameraZoom);ctx.stroke();
  }
  ctx.restore();
 }
 if(P?.squadIndividualId&&mode!=="dying")drawSquadFieldMarkers(use3D);
  if(use3D&&P&&mode!=="dying"&&!P.squadIndividualId){
  const pos=project(P.x,P.y);ctx.save();
  // The WebGL animal stands on the terrain elevation plus roof/jump height.
  // Keep the HUD ring and YOU anchored to the very same 3D surface.
  const terrainHeight=window.WildMountain?.height?.(P.x,P.y)||0;
  const renderFeet=terrainHeight+Math.max(0,P.groundZ||0);
  const renderBody=terrainHeight+Math.max(0,P.jumpHeight||0);
  const ringY=pos.y-renderFeet*.93*cameraZoom,headY=pos.y-renderBody*.93*cameraZoom;
  ctx.strokeStyle=P.hidden?"#a9e2ac":"#cbefd5";ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(pos.x,ringY+4,P.r*1.18,P.r*.52,0,0,TWO);ctx.stroke();
  ctx.textAlign="center";ctx.font="900 11px sans-serif";ctx.lineWidth=3;
  if(!P.hidden&&!P.squadIndividualId){
   ctx.strokeStyle="#102222";ctx.strokeText("YOU",pos.x,headY-52);
   ctx.fillStyle="#e7f7e4";ctx.fillText("YOU",pos.x,headY-52);
  }
  ctx.restore();
 }
 if(weather==="CLOUDY"||weather==="RAIN"||weather==="THUNDER"||weather==="WIND"){
  ctx.fillStyle=weather==="THUNDER"?"rgba(15,25,35,.22)":weather==="RAIN"?"rgba(26,38,47,.15)":weather==="CLOUDY"?"rgba(32,42,50,.12)":"rgba(44,48,43,.07)";
  ctx.fillRect(0,0,vw,vh);
 }
 if((weather==="RAIN"||weather==="THUNDER")&&mode!=="dying"){
  ctx.save();ctx.globalAlpha=insideShelter(P)?.14:1;
  ctx.strokeStyle=weather==="THUNDER"?"#c9e1e7ab":"#9dc9cb79";
  ctx.lineWidth=weather==="THUNDER"?1.8:1.2;ctx.beginPath();
  const horizontal=weather==="THUNDER"?21:10;
  for(const r of rain){
   const rx=(r.x+elapsed*r.s*.37)%vw,ry=(r.y+elapsed*r.s*(weather==="THUNDER"?1.55:1))%vh;
   ctx.moveTo(rx,ry);ctx.lineTo(rx-horizontal,ry+r.z*(weather==="THUNDER"?1.4:1));
  }
  ctx.stroke();ctx.restore();
 }
 if(weather==="SNOW"&&mode!=="dying"){
  ctx.save();ctx.globalAlpha=.90;ctx.fillStyle="#e5f4fa";
  for(let i=0;i<145;i++){
   const speed=32+(i*17%58),drift=(i%7-3)*.12;
   const py=((i*73.73+elapsed*speed)%(vh+30)+vh+30)%(vh+30)-15;
   const px=((i*131.7+Math.sin(elapsed*.43+i)*22+elapsed*drift*10)%(vw+30)+vw+30)%(vw+30)-15;
   const radius=i%9===0?2.2:i%4===0?1.5:.95;
   ctx.beginPath();ctx.arc(px,py,radius,0,TWO);ctx.fill();
  }ctx.restore();
 }
 if(weather==="WIND"&&mode!=="dying"){
  ctx.strokeStyle="#d2c8a73b";ctx.lineWidth=1.4;ctx.beginPath();
  for(let i=0;i<22;i++){
   const y=(i*93+elapsed*49)%Math.max(1,vh),x=(i*131+elapsed*210)%Math.max(1,vw);
   ctx.moveTo(x,y);ctx.lineTo(x+24,y-6);
  }ctx.stroke();
 }
 if(thunderFlash>0&&weather==="THUNDER"&&mode!=="dying"){
  ctx.fillStyle="rgba(230,240,255,"+(thunderFlash*.44)+")";
  ctx.fillRect(0,0,vw,vh);
 }
 if(flash>0&&mode!=="dying"){ctx.fillStyle="rgba(255,97,71,"+(flash*.35)+")";ctx.fillRect(0,0,vw,vh)}
 if(P&&P.hunger<22&&mode==="play"){ctx.fillStyle="rgba(138,30,20,"+(.06+Math.sin(elapsed*5)*.03)+")";ctx.fillRect(0,0,vw,vh)}
 
 if(P&&P.hidden&&mode==="play"){
  const pos=projectGroundLabel(P.x,P.y,Math.max(0,P.groundZ||0,P.jumpHeight||0)),labelY=pos.y;ctx.save();ctx.fillStyle="#102c23e8";ctx.strokeStyle="#c5e4a8";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(pos.x-39,labelY-80,78,25,8);ctx.fill();ctx.stroke();
  ctx.fillStyle="#e9f9d9";ctx.textAlign="center";ctx.font="800 12px sans-serif";ctx.fillText("潜伏中",pos.x,labelY-62);ctx.restore();
 }

 if(mode!=="dying"){
  window.WildUFO?.draw?.(ctx,project,{mode});
  window.WildApparitions?.draw?.(ctx,project,{mode});
  window.WildDisaster?.draw?.(ctx,project,elapsed/120,use3D);
  drawLightning();drawMissionChevrons();drawShelterEntranceMarker();if(!use3D)drawThreatNames(false);drawRemainsLabels();
  if(mode==="play"&&P)window.WildPackTactics?.draw?.(ctx,project(P.x,P.y),dpr,elapsed);
 } // Keep mission and enemy labels off the dying animal.
 // Let the dying animal remain visible briefly before the world closes in.
 drawDeathVignette();
}
function loop(t){
 try {
 // Keep simulation capped, but let the 2.2s death animation track real time on slow phones.
 const frameSeconds=Math.max(0,(t-last)/1000||.016);
 let dt=Math.min(.035,frameSeconds);last=t;
 if(objectiveBannerTime>0&&t>=objectiveBannerTime){
  objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
 }
 if(huntSlowUntil>0&&(t>=huntSlowUntil+520||mode!=="play")){
  huntSlowUntil=0;$("hunt-cinematic").classList.remove("show");
 }
 if(mode==="milestone"&&t>=milestoneUntil)finishMissionMilestone();
 // The QA panel is a pause surface: no time, hunger, enemy AI, or Pad actions
 // advance while selecting a scenario. Closing it resumes the actual event.
 if(!window.WildDebugMode?.open)window.WildGamepad?.poll?.(dt);
 if(mode==="play"&&!window.WildDebugMode?.open)update(dt*(t<huntSlowUntil?.28:1));
 else if(mode==="dying"&&!window.WildDebugMode?.open)advanceDeath(Math.min(.20,frameSeconds));
 else huntSlowUntil=0;
 // Freeze 2D/WebGL gameplay behind achievement and tutorial.
 if((mode!=="guide"&&mode!=="milestone")||guideNeedsFrame){drawScene();guideNeedsFrame=false}
 } catch(error) {
  // An NPC or GPU exception must never permanently stop input and the animation loop.
  console.error("WILD RECLAIM: frame failed",error);
  if(mode==="play"||mode==="dying"){
   resetControls();mode="pause";show("pause");
  }
  // After a renderer failure, retry on Canvas2D instead of keeping a blank WebGL surface.
  if(window.Wild3D?.available){window.Wild3D.available=false;const gpu=document.getElementById("scene3d");if(gpu)gpu.style.display="none";}
 } finally {requestAnimationFrame(loop);}
}
requestAnimationFrame(loop);
const act=code=>{if(mode!=="play")return;if(code==="jump")jump();if(code==="dash")dash();if(code==="instinct")instinct();if(code==="carry"){if(P.carry)putDownFood();else carryFood();}if(code==="den")upgradeDen();if(code==="eat"&&P.eatCD<=0){P.eatCD=.34;eat()}if(code==="attack")attack()};
function keyDown(e){
 const k=e.key.toLowerCase();
 if(["arrowup","arrowdown","arrowleft","arrowright"," ","shift"].includes(k))e.preventDefault();
 if(e.repeat&&["shift","q","p","escape","f","l","m","g","h"].includes(k))return;
 const alreadyHeld=keys.has(k);
 if(mode==="play")keys.add(k);
 
 if(mode==="inventory"){if(k==="escape")closeDenInventory();return}
 if(mode==="guide"){if(k==="enter"||k===" "||k==="escape")closeTutorial();return}
 if(k==="shift"||k==="k")act("dash");if(k==="l")act("jump");
 if(k==="r")act("instinct");
 if(k==="e")act("eat");if(k==="g")act("carry");if(k==="h")act("den");
 if(k==="escape"&&mode==="map")toggleWorldMap();else if(k==="p"||k==="escape")togglePause();
 if(k==="f")fullScreen();if(k==="m")toggleWorldMap();if(k==="-"||k==="_")adjustZoom(-.13);if(k==="="||k==="+")adjustZoom(.13);
}
document.addEventListener("keydown",keyDown);document.addEventListener("keyup",e=>{keys.delete(e.key.toLowerCase())});
window.addEventListener("blur",()=>{
 // Mobile browser chrome, orientation controls and native dialogs may blur while visible.
 // Only a genuinely hidden page should auto-pause; visibilitychange handles app switching.
 if(!document.hidden)return;
 if(mode==="play"){resetControls();mode="pause";show("pause");saveAuto();}
 else if(mode==="upgrade"||mode==="guide"||mode==="inventory"||mode==="milestone")saveAuto();
});
document.addEventListener("visibilitychange",()=>{
 if(document.hidden){
  if(mode==="play"){resetControls();mode="pause";show("pause");saveAuto();}
  else if(mode==="pause"||mode==="upgrade"||mode==="guide"||mode==="inventory"||mode==="milestone"){saveAuto();if(mode==="guide"||mode==="milestone")guideNeedsFrame=true;}
 }
});
window.addEventListener("pagehide",saveAuto);
window.addEventListener("beforeunload",saveAuto);
function resetControls(){
 keys.clear();if(P){resetRush();P.sprintExhausted=false;}joy.id=null;joy.x=0;joy.y=0;gamepadAxes.x=0;gamepadAxes.y=0;
 heldActions.touchAttack=false;heldActions.padAttack=false;heldActions.touchSprint=false;heldActions.padSprint=false;
 for(const timer of touchHoldTimers.values())clearTimeout(timer);touchHoldTimers.clear();
 for(const [id,pointers] of activeTouchPointers){
  for(const pointerId of [...pointers]){try{$(id).releasePointerCapture?.(pointerId)}catch(_){}}
  pointers.clear();
 }
  for(const id of orbitPointers.keys()){try{gameSurface.releasePointerCapture?.(id)}catch(_){}}
  orbitPointers.clear();lastPinchDistance=0;
 if(knob)knob.style.transform="translate(0,0)";
 for(const id of ["attack-touch","dash-touch","jump-touch","action-touch","species-skill-touch"])$(id).classList.remove("down");
}
function togglePause(){
 if(mode==="play"){
  resetControls();mode="pause";show("pause");objectiveBannerTime=0;huntSlowUntil=0;$("hunt-cinematic").classList.remove("show");$("objective-banner").classList.remove("visible");window.WildAudio?.update({mode:"pause",weather,area:P?regionAt(P.x,P.y):0,danger:false});
  $("checkpoint-save-status").textContent=saveAuto()?"現在の状態を自動保存しました":"自動保存に失敗しました";
 }else if(mode==="pause"){mode="play";show("");autosaveClock=0;}
}
function fullScreen(){
 if(!document.fullscreenElement){document.documentElement.requestFullscreen?.().catch(()=>{});return}
 try{screen.orientation?.unlock?.()}catch(e){}
 document.exitFullscreen?.().catch(()=>{});
}
function updateRotationButton(){
 const b=$("rotate-btn");
 if(b)b.textContent=window.innerWidth>window.innerHeight?"縦画面に戻す":"横画面にする";

}
async function setFullscreenOrientation(target,note){
 if(note)note.textContent="";
 let fullscreenReady=!!document.fullscreenElement;
 if(!fullscreenReady){
  try{
   if(!document.documentElement.requestFullscreen)throw Error("fullscreen unavailable");
   await document.documentElement.requestFullscreen({navigationUI:"hide"});
   fullscreenReady=!!document.fullscreenElement;
  }catch(e){
   if(note)note.textContent="全画面にできません。端末を横向きにすると横画面で遊べます。";
  }
 }
 // Keep fullscreen even when the device/browser blocks orientation lock.
 // iOS Safari and some Android WebViews require physical rotation instead.
 try{
  if(!screen.orientation?.lock)throw Error("orientation lock unavailable");
  await screen.orientation.lock(target);
  if(note)note.textContent=(target==="landscape"?"横画面":"縦画面")+"に切り替えました。開始・続きからを選んでください。";
  resize();updateRotationButton();
  return true;
 }catch(e){
  if(note&&fullscreenReady)note.textContent="全画面にしました。自動回転をONにして端末を横向きにしてください。";
  else if(note&&!note.textContent)note.textContent="端末の自動回転をONにして横向きにしてください。";
  updateRotationButton();
  return false;
 }
}
async function rotateScreen(){
 const target=window.innerWidth>window.innerHeight?"portrait":"landscape";
 await setFullscreenOrientation(target,$("rotate-help"));
}
document.addEventListener("fullscreenchange",()=>{
 if(!document.fullscreenElement){try{screen.orientation?.unlock?.()}catch(e){}}
 updateRotationButton();
});
window.addEventListener("resize",updateRotationButton);
window.addEventListener("orientationchange",updateRotationButton);
function selectNewGameAnimal(type){
 if(!Object.prototype.hasOwnProperty.call(animals,type))return false;
 choice=type;
 document.querySelectorAll(".animal-card").forEach(c=>{
  const selected=c.dataset.animal===choice;
  c.classList.toggle("selected",selected);
  c.setAttribute("aria-pressed",String(selected));
 });
 const selected=$("new-game-animal-label");
 if(selected)selected.textContent="新規ゲームの操作動物："+animals[choice].name;
 return true;
}
document.querySelectorAll(".animal-card").forEach(b=>b.addEventListener("click",()=>{selectNewGameAnimal(b.dataset.animal);playEffect("menu")}));
function resetWorldHistoryForNewGame(){
 // Distinct from Continue, checkpoint restore, and same-world retry.
 // Reset the persisted clock BEFORE the next saveAuto() reads its max elapsed.
 const fresh={version:1,elapsed,worldYearsElapsed:0,lightningHistory:[],savedAt:Date.now()};
 localStorage.setItem(WORLD_CHRONICLE_KEY,JSON.stringify(fresh));
 localStorage.removeItem("wild-reclaim-ufo-abduction-history-v1");
 window.WildDisaster?.resetWorld?.();
 window.WildApparitions?.resetWorld?.();
 window.WildUFO?.resetWorld?.();
 lightningHistory=[];worldChronicleSaveClock=0;
 // A new world also begins with an empty den; old snapshots keep their own stores.
 denLevel=1;denStores=normalizeDenStores(null,0);syncDenStash();
 territoryClaims=[false,false,false];territoryLastSupply=[day,day,day];
 saveDenLevel();saveDenStash();saveTerritoryClaims();
}
function reportLaunchFailure(error){
 console.error("WILD RECLAIM launch failed",error);
 resetControls();mode="menu";show("menu");
 const note=$("menu-landscape-note");
 note.textContent="ゲームを開始できません。ページを更新して再度お試しください。";
 note.setAttribute("data-error","true");
}
function launchGame(snapshot=null,newWorld=false){
 const note=$("menu-landscape-note");
 note.removeAttribute("data-error");
 try{
  if(snapshot){
   if(restoreSnapshot(snapshot))return true;
   reportLaunchFailure(new Error("snapshot restore returned false"));
   note.textContent="保存データを再開できません。最初からプレイを選んでください。";
   note.setAttribute("data-error","true");return false;
  }
  if(start(newWorld)){if(newWorld)resetWorldHistoryForNewGame();announceObjective();return true}
  reportLaunchFailure(new Error("world initialization returned false"));return false;
 }catch(error){reportLaunchFailure(error);return false}
}
// An in-page confirmation works in Android in-app browsers where window.confirm is blocked.
function hideNewGameConfirmation(){
 const panel=$("new-game-confirm");
 if(panel)panel.classList.add("hidden");
}


let squadOrder="follow";
const PARTY_COMMANDS={follow:"追従",attack:"攻撃",wait:"待機",flee:"逃走"};
function persistSquadVitals(){
 if(!P?.squadIndividualId)return;
 const core=window.WildSquad,r=core?.load?.();if(!r)return;
 for(const m of r.members){
  const actor=m.id===P.squadIndividualId?P:mobs.find(q=>q.squadIndividualId===m.id&&q.hp>0);
  if(actor){
   m.hpRatio=Math.max(0,Math.min(1,actor.hp/Math.max(1,actor.maxHp)));
   if(actor===P){m.level=Math.max(1,actor.level||m.level||1);m.xp=Math.max(0,Number(actor.xp)||0);}
  }
 }
 core.save(r);
}
function partySpawnPosition(i){
 for(const distance of [80,110,155,210,270])for(let k=0;k<12;k++){
  const a=(P.dir||0)+Math.PI+(i?.65:-.65)+k*Math.PI/6;
  const x=P.x+Math.cos(a)*distance,y=P.y+Math.sin(a)*distance;
  if(x<40||y<40||x>WORLD.w-40||y>WORLD.h-40||collides(x,y,33)||waterBlocksLand(x,y))continue;
  if(mobs.some(m=>m.hp>0&&Math.hypot(m.x-x,m.y-y)<(m.r||20)+35))continue;
  return {x,y};
 }
 return {x:P.x,y:P.y};
}
function makePartyMate(member,i,pos=null,hp=null){
 const a=animals[member.species];if(!a)return null;
 const spot=pos||partySpawnPosition(i);
 const template=window.WildCompanions?.create?.(P.type,spot.x,spot.y,species)||{};
 const maxHp=Math.max(1,Math.round(a.hp*(member.iv?.hp||1)*Math.pow(1.045,Math.max(0,(member.level||1)-1))));
 return {...template,x:spot.x,y:spot.y,type:member.species,r:a.r,color:a.color,belly:a.belly,
  hp:hp==null?Math.max(1,Math.round(maxHp*(member.hpRatio??1))):Math.max(1,Math.min(maxHp,hp)),maxHp,
  companion:true,companionOwner:P.type,squadIndividualId:member.id,squadName:member.name,
  squadOrder,squadSpeedIV:(member.iv?.speed||1)*(1+.012*Math.max(0,(member.level||1)-1)),squadAttackIV:(member.iv?.attack||1)*(1+.025*Math.max(0,(member.level||1)-1)),
  level:member.level||1,xp:member.xp||0,squadGrowthLevel:member.level||1,squadLevel:member.level||1,dir:P.dir||0,vx:0,vy:0,step:0,flash:0,swing:0,
  companionAttackCD:0,companionHurtCD:1};
}
function syncSquadFollowers(){
 // SOLO5: stored animals never spawn as AI actors. Remove legacy companion mobs
 // restored from SAVE_SCHEMA2 before gameplay can update or render them.
 mobs=mobs.filter(m=>!m.companion&&!m.squadIndividualId);
 syncSquadHud();
}

function partyCombat(){
 return !!P&&(elapsed-(P.lastCombatAt??-100)<4||mobs.some(m=>m.hp>0&&!m.companion&&!species[m.type]?.prey&&(m.alert>0||m.windup>0)&&dist(P,m)<230));
}
function squadCommand(cmd){
 if(!PARTY_COMMANDS[cmd]||!P?.squadIndividualId)return;
 squadOrder=cmd;
 for(const m of mobs)if(m.squadIndividualId&&m.hp>0){m.squadOrder=cmd;m.squadWait=cmd==="wait"?{x:m.x,y:m.y}:null;}
 syncSquadHud();saveAuto();notify("仲間："+PARTY_COMMANDS[cmd]);
}
function syncSquadHud(){
 // The old party/AI command HUD is retired. Ownership is shown in the title UI.
 const root=$("squad-party-hud");if(root){root.classList.add("hidden");root.style.display="none";}
}

function switchSquadLeader(id,death=false){
 const roster=window.WildSquad?.load?.(),member=roster?.members?.find(m=>m.id===id);
 const mate=mobs.find(m=>m.squadIndividualId===id&&m.hp>0);
 if(!member||!mate||!animals[member.species])return false;
 if(!death&&(mode!=="play"||partyCombat())){notify("戦闘中は交代できません");return false;}
 if(!death&&P.hp>0){
  const former=roster.members.find(m=>m.id===P.squadIndividualId);
  if(former){const ally=makePartyMate(former,0,{x:P.x,y:P.y},P.hp);if(ally)mobs.push(ally);}
 }
 mobs.splice(mobs.indexOf(mate),1);
 const a=animals[member.species];choice=member.species;P.type=choice;P.base=a;P.r=a.r;
 P.x=mate.x;P.y=mate.y;P.dir=mate.dir;P.squadIndividualId=id;P.squadName=member.name;
 P.maxHp=mate.maxHp;P.hp=Math.max(1,mate.hp);P.damage=a.damage*(member.iv?.attack||1)*(1+.025*Math.max(0,(member.level||1)-1));
 P.speed=a.speed*(member.iv?.speed||1)*(1+.012*Math.max(0,(member.level||1)-1));P.maxSp=100*(member.iv?.stamina||1);P.sp=Math.min(P.maxSp,P.sp||100);
 P.level=member.level||1;P.xp=member.xp||0;P.lastCombatAt=elapsed-100;
 P.deathPose=0;P.atk=0;P.dash=0;P.dashTime=0;P.pounceTime=0;P.jumpTime=0;P.fallTime=0;P.pendingStrike=false;
 P.groundZ=roofAt(P.x,P.y);P.jumpHeight=P.groundZ;P.vx=0;P.vy=0;P.hidden=false;P.carry=null;
 initializeLife(P,elapsed,false);resetControls();
 roster.leaderId=id;window.WildSquad.save(roster);
 if(death){mode="play";show("");deathSequenceTime=0;$("hud").style.opacity="";window.WildAudio?.resetDeathFade?.();}
 syncSquadFollowers();cam.x=clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw));cam.y=clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh));
 syncSquadHud();syncHUD();saveAuto();notify((member.name||member.speciesName)+"を操作中");return true;
}
function showSquadDeathPicker(roster){
 const panel=$("squad-death-choice");if(!panel)return;
 panel.classList.remove("hidden");panel.replaceChildren();
 const label=document.createElement("strong");label.textContent="残った仲間からリーダーを選択";panel.append(label);
 for(const m of roster.members){const b=document.createElement("button");b.type="button";
  b.textContent=(m.name||m.speciesName)+"　"+(m.grade||"")+"評価";
  b.addEventListener("click",()=>switchSquadLeader(m.id,true));panel.append(b);
 }
}
// The selected animal has exactly ONE identification ring. Previously the
// yellow squad ring ignored terrain Z, while a second cyan 3D ring followed
// the feet. On mountain slopes they visibly split into two circles.
function drawSquadFieldMarkers(use3D=false){
 if(!P||P.hp<=0)return;
 const m=P,p=project(m.x,m.y);
 const feet=projectGroundLabel(m.x,m.y,Math.max(0,m.groundZ||0));
 const head=projectGroundLabel(m.x,m.y,Math.max(0,m.groundZ||0,m.jumpHeight||0));
 const ringY=feet.y+4;
 // Both the identification ellipse and the label must scale with zoom.
 // Otherwise the ellipse changes size relative to the animal in 3D.
 const screenRadius=Math.max(6,m.r*cameraZoom);
 const jumpOffset=Math.max(0,feet.y-head.y);
 const labelY=head.y-Math.max(25,screenRadius*1.3+9);
 ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.strokeStyle="#ffe98e";ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(p.x,ringY,screenRadius*1.22,screenRadius*.56,0,0,TWO);ctx.stroke();
 const name="▼ 操作中 "+(m.squadName||animals[m.type]?.name||"動物");
 const fontSize=clamp(Math.round(15*cameraZoom),14,21);
 ctx.font="900 "+fontSize+"px sans-serif";ctx.strokeStyle="#071c1a";ctx.lineWidth=5;
 // Don't leave an off-screen/player-HUD label floating at the screen edge.
 // The ground ring remains visible and anchored even when the title hides.
 if(labelY>Math.min(130,vh*.18)&&labelY<vh-25){
  ctx.strokeText(name,p.x,labelY);ctx.fillStyle="#ffe98e";
  ctx.fillText(name,p.x,labelY);
 }
 ctx.restore();
}
$("squad-party-hud")?.addEventListener("click",e=>{
 const b=e.target.closest?.("button");if(!b)return;
 if(b.dataset.squadOrder)squadCommand(b.dataset.squadOrder);
 if(b.dataset.squadId)switchSquadLeader(b.dataset.squadId);
});

// ガチャ編成と既存の移動・戦闘・セーブ経路を結ぶ。
// 未実装種の専用移動を陸上種に偽装しないため開始を保留する。
function applySquadLeader(){
 const roster=window.WildSquad?.load?.();if(!P||!roster?.members?.length)return false;
 const member=roster.members.find(m=>m.id===roster.leaderId)||roster.members[0];
 if(!animals[member.species]){notify(member.speciesName+"の操作は準備中");return false;}
 choice=member.species;const a=animals[choice];
 P.type=choice;P.base=a;P.r=a.r;P.squadIndividualId=member.id;
 P.squadName=member.name;P.squadGrowthRate=member.growthRate;
 P.maxHp=Math.max(1,Math.round(a.hp*member.iv.hp*Math.pow(1.045,Math.max(0,(member.level||1)-1))));P.hp=Math.max(1,Math.round(P.maxHp*(member.hpRatio??1)));
 P.damage=a.damage*member.iv.attack*(1+.025*Math.max(0,(member.level||1)-1));P.speed=a.speed*member.iv.speed*(1+.012*Math.max(0,(member.level||1)-1));
 P.maxSp=100*member.iv.stamina;P.sp=Math.min(P.maxSp,100);
 P.level=member.level||1;P.xp=member.xp||0;
 initializeLife(P,elapsed,false);
 syncSquadFollowers();syncSquadHud();saveAuto();return true;
}
window.addEventListener("wild-squad-updated",()=>{if(mode==="menu")refreshSaveMenu();});
window.addEventListener("wild-squad-selected",event=>{
 if(!P||!["play","pause","inventory"].includes(mode))return;
 if(event.detail?.memberId===P.squadIndividualId)return;
 persistSquadVitals();
 if(applySquadLeader()){syncHUD();notify("選択した動物で操作を再開");}
});
window.addEventListener("wild-squad-released",event=>{
 if(!P||event.detail?.memberId!==P.squadIndividualId)return;
 if(["play","pause","inventory"].includes(mode)){
  const r=window.WildSquad?.load?.();
  if(r?.members?.length){applySquadLeader();syncHUD();}
  else{persistWorldChronicle();clearAutoSave();resetControls();mode="menu";show("menu");refreshSaveMenu();}
 }
});
window.addEventListener("wild-squad-reset",()=>{clearAutoSave();if(mode==="menu")refreshSaveMenu();});
window.addEventListener("wild-squad-refilled",()=>{
 if(mode!=="inventory"||!P||!atDen())return;
 syncSquadFollowers();syncSquadHud();saveAuto();
});
window.addEventListener("wild-squad-start",()=>{
 const r=window.WildSquad?.load?.();const m=r?.members?.find(x=>x.id===r.leaderId);
 if(!m||!animals[m.species]){notify("この種の操作は未実装です");return;}
 choice=m.species;window.__wildSquadStartAuthorized=true;
 try{startSelectedNewGame()}finally{window.__wildSquadStartAuthorized=false}
});

function startSelectedNewGame(){
 if(window.WildSquad && !window.__wildSquadStartAuthorized){window.WildSquadGachaUI?.open?.();return false;}
 if(mode!=="menu")return false;
 hideNewGameConfirmation();
 // Use the CURRENT selection, never the species from the continue/checkpoint slot.
 if(!selectNewGameAnimal(choice))return false;
 if(!launchGame(null,true))return false; // Only explicit NEW GAME resets the world; old checkpoints remain.
 applySquadLeader();
 saveAuto();
 return true;
}
// The title gacha UI owns reset confirmation and the button event independently of the game engine.
$("confirm-new-game-btn").addEventListener("click",startSelectedNewGame);
$("cancel-new-game-btn").addEventListener("click",hideNewGameConfirmation);
selectNewGameAnimal(choice);
$("continue-btn").addEventListener("click",()=>{
 if(mode!=="menu")return;
 const roster=window.WildSquad?.load?.();
 if(roster?.pendingStart&&roster.members?.length){
  const leader=roster.members.find(m=>m.id===roster.leaderId)||roster.members[0];
  if(!leader||!animals[leader.species]){notify("操作できる動物を選んでください");return;}
  choice=leader.species;
  if(launchGame(null,roster.newWorldOnStart!==false)){applySquadLeader();window.WildSquad?.markStarted?.();saveAuto();}
  return;
 }
 const snapshot=getAutoSnapshot(); // Checkpoints are retained for compatibility but not offered as a title resume path.
 if(roster?.members?.length&&!snapshot){
  const leader=roster.members.find(m=>m.id===roster.leaderId)||roster.members[0];
  if(!leader||!animals[leader.species]){notify("編成リーダーを復旧できません");return;}
  choice=leader.species;
  // Resume the persistent world clock; only explicit NEW GAME resets to YEAR 0.
  if(launchGame(null,false)){applySquadLeader();saveAuto();}
  return;
 }
 if(window.WildSquad&&!snapshot){window.WildSquadGachaUI?.open?.();return;}
 if(launchGame(snapshot||null,!snapshot)&&!snapshot)saveAuto();
});
$("checkpoint-menu-btn").addEventListener("click",()=>{
 const target=$("checkpoint-list"),open=target.classList.contains("hidden");
 target.classList.toggle("hidden",!open);
 $("checkpoint-menu-btn").setAttribute("aria-expanded",String(open));
});
for(let i=0;i<3;i++)$("checkpoint-slot-"+i).addEventListener("click",()=>{
 if(mode!=="menu")return;
 const snapshot=getCheckpoints()[i];if(snapshot)launchGame(snapshot);else refreshSaveMenu();
});
$("checkpoint-save-btn").addEventListener("click",recordCheckpoint);
$("den-inventory-btn").addEventListener("click",openDenInventory);
$("den-inventory-close").addEventListener("click",closeDenInventory);
document.querySelectorAll("[data-strong-trait]").forEach(b=>b.addEventListener("click",()=>inheritStrongTrait(b.dataset.strongTrait)));
$("den-companion-btn").addEventListener("click",recruitCompanion);
for(const key of ["meat","berries","legacy"])$("den-eat-"+key).addEventListener("click",()=>eatFromDen(key));
$("objective-toggle").addEventListener("click",()=>openTutorial());
$("tutorial-close").addEventListener("click",closeTutorial);
$("mission-close").addEventListener("click",()=>{
 $("mission").classList.add("hidden");
 $("objective-toggle").setAttribute("aria-expanded","false");
 $("objective-toggle").textContent="目標を見る";
});
// Pause BGM picker: works with touch, keyboard and gamepad-focused DOM controls.
const bgmPicker=$("pause-bgm-select"),bgmStatus=$("pause-bgm-status");
if(bgmPicker&&window.WildAudio){
 const options=window.WildAudio.tracks||[];
 if(options.length===5){
  bgmPicker.replaceChildren(...options.map(track=>{
   const option=document.createElement("option");
   option.value=track.id;option.textContent=track.name;return option;
  }));
 }
 bgmPicker.value=window.WildAudio.getMusicChoice?.()||"default";
 const volumeSlider=$("pause-bgm-volume"),volumeLabel=$("pause-bgm-volume-value");
 if(volumeSlider){
  const current=window.WildAudio.getMusicVolume?.()??55;
  volumeSlider.value=String(current);
  if(volumeLabel)volumeLabel.textContent=current+"%";
  volumeSlider.addEventListener("input",()=>{
   const level=window.WildAudio.setMusicVolume?.(volumeSlider.value)??55;
   if(volumeLabel)volumeLabel.textContent=level+"%";
   if(bgmStatus)bgmStatus.textContent="BGM音量 "+level+"%（次回も保存）";
  });
 }
 bgmPicker.addEventListener("change",()=>{
  const selected=window.WildAudio.setMusicChoice?.(bgmPicker.value);
  if(!selected){bgmPicker.value=window.WildAudio.getMusicChoice?.()||"default";return;}
  if(bgmStatus)bgmStatus.textContent=soundEnabled?"選択した曲を再生中・次回も保持します":"選択を保存しました。右上の♪で音楽をONにできます。";
 });
}
$("resume-btn").addEventListener("click",togglePause);
$("pause-btn").addEventListener("click",togglePause);
$("quit-btn").addEventListener("click",()=>{saveAuto();resetControls();mode="menu";$("world-map").classList.add("hidden");show("menu")});
$("retry-btn").addEventListener("click",()=>{
 if(mode!=="over"&&mode!=="clear")return; // Ignore queued double taps after resuming.
 if(P?.squadIndividualId){
  const r=window.WildSquad?.load?.();
  if(r?.members?.length){showSquadDeathPicker(r);return;}
  returnToTitleFromDeath();window.WildSquadGachaUI?.open?.();return;
 }
 const save=getCheckpoints().find(s=>s.player.type===P?.type);
 if(save){if(launchGame(save))notify("チェックポイントからリトライ");return;}
 if(launchGame())saveAuto();
});
function returnToTitleFromDeath(){
 if(mode!=="over"&&mode!=="clear")return false;
 deathSequenceTime=0;
 window.WildAudio?.resetDeathFade?.();
 $("hud").style.opacity="";
 resetControls();mode="menu";$("squad-party-hud")?.classList.add("hidden");show("menu");
 return true;
}
$("menu-btn").addEventListener("click",()=>{
 if(returnToTitleFromDeath())$("new-game-options")?.scrollIntoView?.({block:"nearest",behavior:"smooth"});
});
$("death-title-btn").addEventListener("click",returnToTitleFromDeath);
$("full-btn").addEventListener("click",fullScreen);
$("rotate-btn").addEventListener("click",rotateScreen);
function selectMenuOrientation(target){
 const portrait=target==="portrait";
 for(const [id,selected] of [["menu-portrait-btn",portrait],["menu-landscape-btn",!portrait]]){
  const button=$(id);button.classList.toggle("selected",selected);button.setAttribute("aria-pressed",String(selected));
 }
 $("menu-orientation-status").textContent="✓ 選択中："+(portrait?"縦画面":"横画面");
 const note=$("menu-landscape-note");
 if(portrait){
  try{screen.orientation?.unlock?.()}catch(e){}
  if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
  note.textContent="縦画面を選択しました。端末を縦にしてください。";
 }else setFullscreenOrientation("landscape",note);
}
$("menu-portrait-btn").addEventListener("click",()=>selectMenuOrientation("portrait"));
$("menu-landscape-btn").addEventListener("click",()=>selectMenuOrientation("landscape"));
updateRotationButton();
$("sound-btn").addEventListener("click",()=>{
 soundEnabled=!soundEnabled;$("sound-btn").textContent=soundEnabled?"♪":"×";
 window.WildAudio?.setEnabled(soundEnabled);
 $("sound-btn").title=soundEnabled?"BGM・環境音・効果音 ON":"BGM・環境音・効果音 OFF";
});
const miniControl=$("mini-map-control"),miniScaleLabel=$("mini-map-scale");
function setMiniScale(step){
 if(mode!=="play")return;
 miniScaleIndex=(miniScaleIndex+step+MINI_SPANS.length)%MINI_SPANS.length;
 miniScaleLabel.textContent=MINI_SCALE_NAMES[miniScaleIndex];
 miniControl.setAttribute("aria-label","周辺地図："+MINI_SCALE_NAMES[miniScaleIndex]+"。タップで表示範囲切替、長押しで詳細地図");
 drawMini();
}
let miniPressTimer=null,miniPressAt=null,miniLongPressed=false;
function clearMiniPress(){if(miniPressTimer!==null)clearTimeout(miniPressTimer);miniPressTimer=null;}
miniControl.addEventListener("pointerdown",e=>{
 if(mode!=="play"||e.button>0)return;
 e.preventDefault();e.stopPropagation();clearMiniPress();miniLongPressed=false;
 miniPressAt={id:e.pointerId,x:e.clientX,y:e.clientY};
 miniControl.setPointerCapture?.(e.pointerId);
 miniPressTimer=setTimeout(()=>{
  miniPressTimer=null;miniLongPressed=true;miniPressAt=null;
  if(mode==="play")toggleWorldMap();
 },550);
});
miniControl.addEventListener("pointermove",e=>{
 if(miniPressAt?.id===e.pointerId&&Math.hypot(e.clientX-miniPressAt.x,e.clientY-miniPressAt.y)>14){
  clearMiniPress();miniPressAt=null;
 }
});
miniControl.addEventListener("pointerup",e=>{
 if(!miniPressAt||miniPressAt.id!==e.pointerId){clearMiniPress();return;}
 e.preventDefault();e.stopPropagation();const wasLong=miniLongPressed;
 clearMiniPress();miniPressAt=null;if(!wasLong)setMiniScale(1);
});
miniControl.addEventListener("pointercancel",()=>{clearMiniPress();miniPressAt=null;});
miniControl.addEventListener("contextmenu",e=>e.preventDefault());
miniControl.addEventListener("keydown",e=>{
 if(e.key==="Enter"||e.key===" "){e.preventDefault();e.stopPropagation();setMiniScale(1);}
});

$("map-close").addEventListener("click",toggleWorldMap);
function adjustZoom(delta){if(mode!=="play")return;cameraZoom=clamp(Math.round((cameraZoom+delta)*100)/100,.47,1.6);updateCameraView();$("zoom-level").textContent=Math.round(cameraZoom*100)+"%";}
$("zoom-out").addEventListener("click",()=>adjustZoom(-.13));
$("zoom-in").addEventListener("click",()=>adjustZoom(.13));
document.querySelectorAll("[data-upgrade]").forEach(b=>b.addEventListener("click",()=>{if(mode!=="upgrade")return;const up=b.dataset.upgrade;
 if(up==="fang")P.damage=Math.round(P.damage*1.25);else if(up==="fleet")P.speed=Math.round(P.speed*1.15);else{P.maxHp+=30;P.hp=Math.min(P.maxHp,P.hp+65)}
 mode="play";show("");notify("適応完了 / "+b.querySelector("b").textContent);playEffect("level")
}));
const stick=$("joystick"),knob=$("joy-knob");
function updateStick(e){
 // Use the rendered disc dimensions: landscape CSS resizes the stick without scaling its hitbox.
 const disc=stick.querySelector(".joy-disc").getBoundingClientRect();
 const cx=disc.left+disc.width/2,cy=disc.top+disc.height/2;
 const lim=Math.max(18,(disc.width-knob.offsetWidth)/2-3);
 const dx=e.clientX-cx,dy=e.clientY-cy,mag=Math.hypot(dx,dy);
 joy.x=clamp(dx/lim,-1,1);joy.y=clamp(dy/lim,-1,1);const l=Math.hypot(joy.x,joy.y);if(l>1){joy.x/=l;joy.y/=l}
 knob.style.transform="translate("+(joy.x*lim)+"px,"+(joy.y*lim)+"px)";
}
stick.addEventListener("pointerdown",e=>{if(mode!=="play"||joy.id!==null)return;e.preventDefault();joy.id=e.pointerId;stick.setPointerCapture(e.pointerId);updateStick(e)});
stick.addEventListener("pointermove",e=>{if(mode==="play"&&e.pointerId===joy.id)updateStick(e)});
function clearStick(e){if(e.pointerId!==joy.id)return;joy.id=null;joy.x=0;joy.y=0;knob.style.transform="translate(0,0)"}
stick.addEventListener("pointerup",clearStick);stick.addEventListener("pointercancel",clearStick);stick.addEventListener("lostpointercapture",e=>{if(e.pointerId===joy.id){joy.id=null;joy.x=0;joy.y=0;knob.style.transform="translate(0,0)"}});
for(const [id,action] of [["action-touch","context"],["dash-touch","dash"],["jump-touch","jump"],["attack-touch","attack"],["species-skill-touch","instinct"]]){
 const b=$(id),pointers=new Set();activeTouchPointers.set(id,pointers);
 let longFired=false,pressStarted=0;
 b.addEventListener("pointerdown",e=>{
  if(mode!=="play"||pointers.has(e.pointerId))return;
  e.preventDefault();const first=pointers.size===0;pointers.add(e.pointerId);
  b.classList.add("down");b.setPointerCapture(e.pointerId);
  if(!first)return;
  pressStarted=performance.now();longFired=false;
  
  if(action==="jump"){act("jump");return}
  if(action==="instinct"){act("instinct");return}
  if(action==="attack"){heldActions.touchAttack=true;act("attack");return}
  if(action==="dash"||action==="context"){
   const timer=setTimeout(()=>{
    touchHoldTimers.delete(id);
    if(mode!=="play"||pointers.size===0)return;
    longFired=true;
    if(action==="dash")heldActions.touchSprint=true;
    else contextAction(true);
   },action==="dash"?450:550);
   touchHoldTimers.set(id,timer);
  }
 });
 const end=e=>{
  if(!pointers.delete(e.pointerId))return;
  if(pointers.size!==0)return;
  b.classList.remove("down");
  const timer=touchHoldTimers.get(id);
  if(timer!==undefined){clearTimeout(timer);touchHoldTimers.delete(id)}
  
  if(action==="attack")heldActions.touchAttack=false;
  if(action==="dash")heldActions.touchSprint=false;
  if(mode!=="play"||longFired)return;
  const duration=performance.now()-pressStarted;
  if(action==="dash"&&duration<450)act("dash");
  if(action==="context")contextAction(duration>=550);
 };
 b.addEventListener("pointerup",end);b.addEventListener("pointercancel",e=>{
  if(!pointers.delete(e.pointerId)||pointers.size!==0)return;
  b.classList.remove("down");
  if(action==="attack")heldActions.touchAttack=false;
  if(action==="dash")heldActions.touchSprint=false;
  const timer=touchHoldTimers.get(id);if(timer!==undefined){clearTimeout(timer);touchHoldTimers.delete(id)}
  
 });
 b.addEventListener("lostpointercapture",e=>{
  if(!pointers.delete(e.pointerId)||pointers.size!==0)return;
  b.classList.remove("down");
  if(action==="attack")heldActions.touchAttack=false;
  if(action==="dash")heldActions.touchSprint=false;
  const timer=touchHoldTimers.get(id);if(timer!==undefined){clearTimeout(timer);touchHoldTimers.delete(id)}
  
 });
}
const gameSurface=$("app"),orbitPointers=new Map();
let lastPinchDistance=0;
gameSurface.addEventListener("pointerdown",e=>{
 if(mode!=="play"||e.target!==gameSurface)return;
 e.preventDefault();gameSurface.setPointerCapture(e.pointerId);
 orbitPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinchDistance=0;
});
gameSurface.addEventListener("wheel",e=>{if(mode!=="play")return;e.preventDefault();adjustZoom(e.deltaY>0?-.09:.09)},{passive:false});
gameSurface.addEventListener("pointermove",e=>{
 if(mode!=="play"||!orbitPointers.has(e.pointerId))return;
 const previous=orbitPointers.get(e.pointerId),dx=e.clientX-previous.x;
 orbitPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(orbitPointers.size===1){cameraYaw+=dx*.008;updateCameraView();}
 else if(orbitPointers.size===2){
  const [a,b]=[...orbitPointers.values()],gap=Math.hypot(a.x-b.x,a.y-b.y);
  if(lastPinchDistance>12&&gap>12){cameraZoom=clamp(cameraZoom*gap/lastPinchDistance,.47,1.6);updateCameraView();$("zoom-level").textContent=Math.round(cameraZoom*100)+"%";}
  lastPinchDistance=gap;
 }
});
function stopCameraPointer(e){orbitPointers.delete(e.pointerId);lastPinchDistance=0;}
gameSurface.addEventListener("pointerup",stopCameraPointer);
gameSurface.addEventListener("pointercancel",stopCameraPointer);
gameSurface.addEventListener("lostpointercapture",stopCameraPointer);
document.addEventListener("contextmenu",e=>e.preventDefault());
refreshSaveMenu();drawMini();
window.WildGameReady=true;
/* Opt-in debugging interface. Display UI is unlocked by seven title taps.
 * No debug flag is serialized; normal save schema, input and autosave remain intact. */
window.WildDebugBridge={
 getState(){
  const active=!!P&&mode!=="menu"&&mode!=="result";
  const loc=active?{x:P.x,y:P.y}:null;
  return {
   mode,day,hour:Math.floor(dayLightProfile(elapsed).hour),
   region:loc?districts[regionAt(loc.x,loc.y)]:null,position:loc,
   weather:WEATHER_NAMES[weather]||weather,weatherOverride:!!debugWeatherOverride,
   mobCount:mobs.filter(m=>m.hp>0).length,carcassCount:carcasses.length,
   hp:active?Math.ceil(P.hp):null,hunger:active?Math.ceil(P.hunger):null,denLevel,denStash,animal:animals[choice]?.name||choice,
   mission,debugTutorialActive:!!debugTutorialSession,strongBoss:strongBossAlive()?STRONG_NAMES[strongBossAlive().type]:null
  };
 },
 setHour(hour){
  if(mode!=="play"||!P||!Number.isInteger(hour)||hour<0||hour>23)return false;
  elapsed=Math.floor(elapsed/85)*85+(((hour-6+24)%24)/24)*85;
  day=1+Math.floor(elapsed/85);
  updateWeather(0);syncHUD(hour);
  return saveAuto();
 },
 setWeather(name){
  if(name!==null&&!["CLEAR","CLOUDY","RAIN","THUNDER","WIND","FOG","SNOW"].includes(name))return false;
  debugWeatherOverride=name;
  if(mode!=="play"||!P)return name===null;
  updateWeather(0);syncHUD(Math.floor(dayLightProfile(elapsed).hour));
  return true;
 },
 warp(place){
  if(mode!=="play"||!P||!Object.prototype.hasOwnProperty.call(START_LOCATIONS,place))return false;
  const source=START_LOCATIONS[place],p=nearestDryBank(source.x,source.y,P.r);
  if(!p||collides(p.x,p.y,P.r,P))return false;
  P.x=p.x;P.y=p.y;P.groundZ=roofAt(P.x,P.y);
  P.jumpHeight=P.groundZ;P.jumpTime=0;P.pounceTime=0;P.pounceRemaining=0;
  P.fallTime=0;P.vx=0;P.vy=0;resetControls();
  cam.x=P.x-vw*.5;cam.y=P.y-vh*.5;
  syncHUD(Math.floor(dayLightProfile(elapsed).hour));
  return saveAuto();
 },
 heal(){
  if(mode!=="play"||!P)return false;
  P.hp=P.maxHp;P.hunger=100;P.sp=100;
  syncHUD(Math.floor(dayLightProfile(elapsed).hour));
  return saveAuto();
 },
 listBosses(){return Object.keys(STRONG_TRAITS).map(id=>({id,name:STRONG_NAMES[id],effect:STRONG_TRAITS[id].effect,regions:Object.entries(STRONG_REGIONS).filter(([,types])=>types.includes(id)).map(([index])=>districts[Number(index)])}));},
 bossState(){const boss=strongBossAlive();return boss?{id:boss.type,name:STRONG_NAMES[boss.type]||boss.type,hp:Math.max(0,Math.ceil(boss.hp))}:null;},
 spawnBoss(type){
  if(mode!=="play"||!P||!Object.prototype.hasOwnProperty.call(STRONG_TRAITS,type)||strongBossAlive())return false;
  const success=spawnStrongBoss(type,regionAt(P.x,P.y));
  if(success){syncHUD(Math.floor(dayLightProfile(elapsed).hour));saveAuto();}
  return success;
 },
 clearBoss(){
  if(mode!=="play"||!P)return false;
  const boss=strongBossAlive();if(!boss)return false;
  const index=mobs.indexOf(boss);if(index<0)return false;
  mobs.splice(index,1);saveAuto();return true;
 },
 weakenBoss(){
  if(mode!=="play"||!P)return false;
  const boss=strongBossAlive();if(!boss)return false;
  boss.hp=1;boss.attack=0;boss.windup=0;boss.chargeTime=0;saveAuto();return true;
 },
 giveTrophy(type){
  if(mode!=="play"||!P||!Object.prototype.hasOwnProperty.call(STRONG_TRAITS,type))return false;
  strongTrophies[type]=(Number(strongTrophies[type])||0)+1;
  saveAuto();return true;
 },
 warpBossArea(type){
  if(mode!=="play"||!P||!STRONG_TRAITS[type])return false;
  const allowed=Object.keys(STRONG_REGIONS).filter(key=>STRONG_REGIONS[key].includes(type)).map(Number);
  const spots=Object.entries(START_LOCATIONS).filter(([,p])=>allowed.includes(regionAt(p.x,p.y)));
  if(!spots.length)return false;
  spots.sort((a,b)=>Math.hypot(a[1].x-P.x,a[1].y-P.y)-Math.hypot(b[1].x-P.x,b[1].y-P.y));
  return this.warp(spots[0][0]);
 },
 listDens(){return denSites.map(site=>({id:site.id,name:site.name,roof:site.kind==="roof"}));},
 warpDen(id){
  if(mode!=="play"||!P)return false;
  const site=denSites.find(q=>q.id===id);if(!site)return false;
  P.x=site.x;P.y=site.y;P.groundZ=site.z;P.jumpHeight=site.z;
  P.jumpTime=0;P.pounceTime=0;P.pounceRemaining=0;P.fallTime=0;P.vx=0;P.vy=0;
  resetControls();cam.x=P.x-vw*.5;cam.y=P.y-vh*.5;syncHUD(Math.floor(dayLightProfile(elapsed).hour));return saveAuto();
 },
 setHunger(value){
  if(mode!=="play"||!P||!Number.isFinite(value))return false;
  P.hunger=clamp(value,0,100);syncHUD(Math.floor(dayLightProfile(elapsed).hour));return saveAuto();
 },
 setHp(value){
  if(mode!=="play"||!P||!Number.isFinite(value))return false;
  P.hp=clamp(value,0,P.maxHp);
  if(P.hp===0){beginDeath();return true;}
  syncHUD(Math.floor(dayLightProfile(elapsed).hour));return saveAuto();
 },
 setDenLevel(level){
  if(mode!=="play"||!P||!Number.isInteger(level)||level<1||level>DEN_MAX_LEVEL)return false;
  denLevel=level;saveDenLevel();syncHUD(Math.floor(dayLightProfile(elapsed).hour));return saveAuto();
 },
 setDenFood(points){
  if(mode!=="play"||!P||!Number.isFinite(points))return false;
  denStores=normalizeDenStores(null,clamp(points,0,denCapacity()));
  saveDenStash();syncHUD(Math.floor(dayLightProfile(elapsed).hour));return saveAuto();
 },
 tutorialStart(){
  if(debugTutorialSession||!(mode==="play"||mode==="menu"||mode==="pause"))return false;
  const original=currentSnapshot();
  const storage={};
  try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith("wild-reclaim-"))storage[key]=localStorage.getItem(key);}}catch(_){}
  debugTutorialSession={original:original?JSON.parse(JSON.stringify(original)):null,storage,choice,shown:automaticTutorialShown,onboarded:previouslyOnboardedAtRunStart};
  start();
  denLevel=1;denStores=normalizeDenStores(null,0);syncDenStash();territoryClaims=[false,false,false];territoryLastSupply=[day,day,day];
  automaticTutorialShown=false;previouslyOnboardedAtRunStart=false;
  mission=0;missionComplete=false;tutorialSeen.clear();meals=0;hiddenHold=0;kills=0;tutorialHuntBase=0;tutorialStashBase=denStash;
  syncHUD(Math.floor(dayLightProfile(elapsed).hour));openTutorial(0,false);
  return true;
 },
 tutorialStage(stage){
  if(!debugTutorialSession||!P||![0,1,2,4,7].includes(stage)||["menu","over","dying","clear"].includes(mode))return false;
  if(mode==="guide")closeTutorial();
  if(mode==="milestone"){milestoneUntil=0;$("mission-milestone").classList.remove("show");$("mission-milestone").classList.add("hidden");mode="play";}
  if(mode!=="play")return false;
  if(stage===7){
   mission=4;missionComplete=false;previouslyOnboardedAtRunStart=false;
   advanceMission(7);return true;
  }
  mission=stage;missionComplete=false;tutorialSeen.delete(7);
  if(stage===0){meals=0;hiddenHold=0;kills=0;}
  if(stage===1)hiddenHold=0;
  if(stage===2)tutorialHuntBase=kills;
  if(stage===4){denLevel=1;denStores=normalizeDenStores(null,0);syncDenStash();tutorialStashBase=denStash;}
  if(stage===5){denLevel=Math.max(2,denLevel);territoryClaims=[false,false,false];}
  if(stage===6){denLevel=Math.max(2,denLevel);territoryClaims=[true,false,false];discoveredSites=[];}
  objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
  // The sandbox must show the same compact lesson in every selected stage.
  if(TUTORIAL_STAGES.includes(stage)){tutorialSeen.delete(stage);openTutorial(0,true);}
  syncHUD(Math.floor(dayLightProfile(elapsed).hour));return true;
 },
 tutorialStep(direction){
  if(!debugTutorialSession||![-1,1].includes(direction))return false;
  const stages=[0,1,2,4,7],current=stages.indexOf(mission);
  if(current<0)return false;
  const target=current+direction;
  if(target<0||target>=stages.length)return false;
  return this.tutorialStage(stages[target]);
 },
 tutorialStop(){
  if(!debugTutorialSession)return false;
  const session=debugTutorialSession;debugTutorialSession=null;
  automaticTutorialShown=session.shown;previouslyOnboardedAtRunStart=session.onboarded;
  if(session.original){restoreSnapshot(session.original);}
  else{resetControls();mode="menu";P=null;show("menu");}
  try{
   const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith("wild-reclaim-"))keys.push(key);}
   for(const key of keys)localStorage.removeItem(key);
   for(const [key,value] of Object.entries(session.storage))localStorage.setItem(key,value);
  }catch(_){}
  best=+(session.storage["wild-reclaim-best"]||0);
  automaticTutorialShown=session.shown;previouslyOnboardedAtRunStart=session.onboarded;
  if(mode==="menu")refreshSaveMenu();else syncHUD(Math.floor(dayLightProfile(elapsed).hour));
  return true;
 },
 save(){return saveAuto();}
};


/* QA registry: case list mirrors actual engine features. Missing V1 features
 * remain explicitly unavailable, never represented by decorative fake events. */
let debugRendererPreference="auto";
const DEBUG_MISSING_FEATURES=["隕石衝突・クレーター","津波・地形変化","地割れ・崩落の地形変更",
 "伝染病の群れ感染","異星基地と敵対AI","怪獣の建物破壊","突然変異種の操作",
 "繁殖・遺伝・子孫交代","200種類の固有トロフィー","水生・飛行動物の操作"];
function debugCaseList(){
 const out=[],add=(group,id,label)=>out.push({group,id,label,available:true});
 for(const y of [20,50,100,200,300])add("世界時計・季節","year:"+y,"世界"+y+"年へ");
 for(const [m,label] of [[1,"冬"],[4,"春"],[7,"夏"],[10,"秋"]])add("世界時計・季節","season:"+m,label+"へ進める");
 for(const [id,label] of Object.entries({CLEAR:"晴",CLOUDY:"曇",RAIN:"雨",THUNDER:"雷雨",WIND:"強風",FOG:"霧",SNOW:"雪・凍結",auto:"自動"}))add("天候・災害","weather:"+id,label);
 for(const [id,label] of Object.entries({lightning:"落雷（予兆→着弾）",quake:"地震・倒木",flood:"洪水・冠水",fire:"山火事",clear:"進行中の災害を解除"}))add("天候・災害","disaster:"+id,label);
 for(const [id,label] of Object.entries({ufo:"UFO接近と拉致",ghost:"亡霊・幻覚・憑依",resetUFO:"UFO退去",resetGhost:"亡霊消去"}))add("異常存在","anomaly:"+id,label);
 for(const [id,label] of Object.entries({pack:"群れ生成",prey:"獲物生成",food:"食草生成",corpse:"死骸・腐敗・骨化",migration:"生態圧・地域移住",alert:"動物を警戒させる",flee:"動物を逃走させる",rest:"動物を休息させる",feed:"動物を採食させる",injure:"動物を負傷させる"}))add("動物・生態","ecology:"+id,label);
 for(const id of window.WildFauna?.types||[])if(species[id])add("動物を個別生成","animal:"+id,id);
 for(const [id,label] of Object.entries({poison:"毒",wound:"重傷",stun:"麻痺",exhaust:"持久力0",starve:"空腹0",heal:"全回復",hide:"茂みに潜伏",carry:"肉をくわえる",nearDeath:"HP1",death:"死亡・リトライ",level2:"LV2",level10:"LV10",level20:"LV20",oldAge:"寿命直前",invincible:"無敵6秒"}))add("自キャラ状態","player:"+id,label);
 for(let i=0;i<8;i++)add("地域移動","area:"+i,districts[i]);
 for(const [id,label] of Object.entries({foothill:"山麓",slope:"山腹",summit:"山頂",cave:"洞窟"}))add("地域移動","mountain:"+id,label);
 for(const label of DEBUG_MISSING_FEATURES)out.push({group:"未実装",id:"missing:"+label,label,available:false});
 return out;
}
function debugSafePosition(x,y,r=P?.r||20,accept=null){
 for(let range=0;range<=840;range+=35)for(let k=0;k<(range?20:1);k++){
  const a=k*Math.PI/10,xx=clamp(Math.round(x+range*Math.cos(a)),r+14,WORLD.w-r-14);
  const yy=clamp(Math.round(y+range*Math.sin(a)),r+14,WORLD.h-r-14);
  if((accept&&!accept(xx,yy))||collides(xx,yy,r,null,true)||waterBlocksLand(xx,yy))continue;
  return {x:xx,y:yy};
 }return null;
}
function debugTeleport(x,y,accept=null){
 if(mode!=="play"||!P)return false;
 const pos=debugSafePosition(x,y,P.r,accept);if(!pos)return false;
 P.x=pos.x;P.y=pos.y;P.groundZ=roofAt(P.x,P.y);P.jumpHeight=P.groundZ;
 P.jumpTime=0;P.pounceTime=0;P.pounceRemaining=0;P.fallTime=0;P.vx=0;P.vy=0;
 resetControls();cam.x=P.x-vw/2;cam.y=P.y-vh/2;syncHUD();return true;
}
function debugDiagnostics(){
 const clock=window.WildWorldClock?.at?.(elapsed),dis=window.WildDisaster?.getState?.()||{};
 const alive=mobs.filter(m=>m.hp>0),types={};
 for(const m of alive)types[m.type]=(types[m.type]||0)+1;
 return {
  state:mode,worldYear:clock?.year??Math.floor(elapsed/120),month:clock?.month,season:clock?.season,
  day,elapsed:Math.round(elapsed),weather,weatherOverride:debugWeatherOverride,
  actor:P?{type:P.type,level:P.level,hp:Math.round(P.hp),maxHp:Math.round(P.maxHp),
   hunger:Math.round(P.hunger),stamina:Math.round(P.sp||0),age:Math.round((P.ageYears||0)*10)/10,
   lifespan:P.lifespanYears,poison:P.poisonTime||0,wound:P.strongWound||0,stun:P.stun||0,
   hidden:!!P.hidden,carrying:!!P.carry,x:Math.round(P.x),y:Math.round(P.y)}:null,
  wildlife:{alive:alive.length,byType:types,packs:new Set(alive.map(m=>m.packId).filter(Boolean)).size,
   corpses:carcasses.filter(c=>c.type==="corpse").length,bones:carcasses.filter(c=>c.type==="bones").length},
  ecosystem:P?{district:districts[regionAt(P.x,P.y)],...ecology[regionAt(P.x,P.y)]}:null,
  disasters:{active:(dis.events||[]).filter(e=>e.permanent||elapsed/120-e.year<e.duration).map(e=>e.kind),
   quakeWarning:!!dis.warning,floodWarning:!!dis.floodWarning,fireWarning:!!dis.fireWarning},
  lightning:lightningStrike?{kind:lightningStrike.kind,countdown:lightningStrike.countdown}:null,
  ufo:window.WildUFO?.active?.stage||null,ghost:window.WildApparitions?.active?.stage||null,
  renderer:debugRendererPreference,webglAvailable:!!window.Wild3D?.available,
  saves:{schema:SAVE_SCHEMA,auto:!!getAutoSnapshot(),checkpoints:getCheckpoints().length},
  missing:DEBUG_MISSING_FEATURES
 };
}
function debugRunCase(id){
 const ok=message=>{syncHUD();saveAuto();return {ok:true,message}};
 const no=message=>({ok:false,message});
 if(mode!=="play"||!P)return no("ゲーム開始後に実行してください");
 if(typeof id!=="string"||id.startsWith("missing:"))return no("この機能は現在未実装です");
 const part=id.split(":"),group=part[0],key=part.slice(1).join(":");
 if(group==="year"||group==="season"){
  const n=Number(key);if(!Number.isInteger(n))return no("値が不正");
  let next;
  if(group==="year"){if(n<0||n>1000)return no("範囲外");next=n*120+elapsed%120;if(next<elapsed)return no("時間の巻き戻しは不可。QAバックアップから復元してください");}
  else{if(![1,4,7,10].includes(n))return no("季節が不正");next=Math.floor(elapsed/120)*120+(n-1)*10+1;if(next<elapsed)next+=120;}
  const jump=next-elapsed;elapsed=next;day=1+Math.floor(elapsed/85);
  if(Number.isFinite(P.bornAtWorldSeconds))P.bornAtWorldSeconds+=jump;
  initializeLife(P,elapsed,true);debugWeatherOverride=null;updateWeather(0);
  return ok("世界"+Math.floor(elapsed/120)+"年・"+(window.WildWorldClock?.at?.(elapsed)?.season||"")+"へ");
 }
 if(group==="weather"){
  const target=key==="auto"?null:key;
  return window.WildDebugBridge.setWeather(target)?ok("天候："+(target||"自動")):no("設定できない天候です");
 }
 if(group==="disaster"){
  if(key==="clear")return window.WildDisaster?.debugClear?.()?ok("進行中の災害と予兆を解除（履歴は保持）"):no("災害を解除できません");
  if(key==="lightning"){
   debugWeatherOverride="THUNDER";updateWeather(0);
   lightningStrike={x:clamp(P.x+Math.cos(P.dir)*110,25,WORLD.w-25),
    y:clamp(P.y+Math.sin(P.dir)*110,25,WORLD.h-25),kind:"ground",countdown:2.8,afterglow:0};
   return ok("2.8秒後に実着弾。予兆から避難可能");
  }
  const method={quake:"force",flood:"forceFlood",fire:"forceFire"}[key];
  if(!method||!window.WildDisaster?.[method])return no("この災害は未実装");
  if(key==="fire"&&["RAIN","THUNDER"].includes(weather)){debugWeatherOverride="CLEAR";updateWeather(0);}
  const api={P,mobs,elapsed,mode,notify,collides,WORLD,roadsX,roadsY,buildings,riverAxis,canalAxis,weather,
   isSheltered:insideShelter,onAnimalDeath:m=>{if(species[m.type])carcasses.push(animalRemains(m))}};
  return window.WildDisaster[method](api)?ok("予兆を発生。避難後に実イベント開始"):no("同種災害が進行中か、安全な発生地点がありません");
 }
 if(group==="anomaly"){
  if(key==="ufo"){
   if(window.WildUFO?.active)return no("UFOは出現中");
   return window.WildUFO?.summon?.(clamp(P.x+165,50,WORLD.w-50),P.y)?ok("UFO接近→追尾・誘拐イベント"):no("UFO生成不可");
  }
  if(key==="ghost"){
   if(window.WildApparitions?.active)return no("亡霊は出現中");
   return window.WildApparitions?.summon?.(clamp(P.x+130,50,WORLD.w-50),P.y,elapsed/120)?ok("亡霊発生→幻覚・憑依イベント"):no("亡霊生成不可");
  }
  if(key==="resetUFO"){window.WildUFO?.resetTransient?.();return ok("UFO退去");}
  if(key==="resetGhost")return window.WildApparitions?.debugClear?.()?ok("亡霊を解除"):no("解除APIなし");
  return no("未実装イベント");
 }
 if(group==="animal"){
  if(!window.WildFauna?.types?.includes(key)||!species[key])return no("未登録の種類");
  return spawnMob(false,false,true,null,key,mountainHabitat(P.x,P.y)?MOUNTAIN.zone(P.x):null)?
   ok(key+"を出現させました"):no("地域の密度上限・地形などで出現不可");
 }
 if(group==="ecology"){
  if(key==="prey")return spawnMob(false,true,true)?ok("獲物生成"):no("人口上限などで生成不可");
  if(key==="pack"){
   const level=P.level,old=lastPackSpawnAt;let success=false;
   try{P.level=Math.max(P.level,2);lastPackSpawnAt=elapsed-WILDLIFE.packCooldown-1;success=spawnLocalPack();}
   finally{P.level=level;if(!success)lastPackSpawnAt=old;}
   return success?ok("群れを出現"):no("地形・密度上限、既存の群れにより生成不可");
  }
  if(key==="migration"){
   const from=regionAt(P.x,P.y),to=from<5?(from===4?3:from+1):(from===7?6:from-1);
   ecology[from].food=8;ecology[from].prey=Math.max(45,ecology[from].prey);
   ecology[to].food=94;ecology[to].prey=20;ecologyClock=15;simulateEcology(0);
   return ok("生態移動判定："+ecologyNews);
  }
  if(key==="food"||key==="corpse"){
   const loc=debugSafePosition(P.x+95,P.y+45,16);if(!loc)return no("設置できる地形がありません");
   if(key==="food")carcasses.push({x:loc.x,y:loc.y,r:9,amount:19,type:"berries",ttl:220,phase:0});
   else carcasses.push(animalRemains({type:"rabbit",x:loc.x,y:loc.y,r:15}));
   return ok(key==="food"?"食べられる草を配置":"死骸を配置。腐敗と骨化を観察");
  }
  const m=mobs.filter(a=>a.hp>0&&!a.strongBoss).sort((a,b)=>dist(P,a)-dist(P,b))[0];
  if(!m)return no("状態を与える動物がいません");
  if(key==="alert"){m.alert=8;m.search=4;m.lastX=P.x;m.lastY=P.y;}
  else if(key==="flee"){m.flee=8;m.fleeThreatX=P.x;m.fleeThreatY=P.y;}
  else if(key==="rest"){m.resting=true;m.restTime=5;m.alert=0;}
  else if(key==="feed"){m.foragePose=4;m.resting=false;}
  else if(key==="injure"){m.hp=Math.max(1,m.maxHp*.22);m.flash=.5;}
  else return no("未実装の行動");
  return ok(m.type+"： "+key+"を適用");
 }
 if(group==="player"){
  if(key==="heal"){P.hp=P.maxHp;P.hunger=100;P.sp=100;P.poisonTime=0;P.strongWound=0;P.stun=0;}
  else if(key==="poison")P.poisonTime=9;
  else if(key==="wound")P.strongWound=15;
  else if(key==="stun")P.stun=3;
  else if(key==="exhaust")P.sp=0;
  else if(key==="starve")P.hunger=0;
  else if(key==="nearDeath")P.hp=1;
  else if(key==="invincible")P.inv=6;
  else if(key==="carry")P.carry={type:"meat",animalType:"rabbit",amount:22};
  else if(key==="oldAge")return no("寿命・老衰死は廃止されています");
  else if(key==="hide"){
   const cover=plants.filter(visibleShrub).sort((a,b)=>dist(P,a)-dist(P,b)).find(p=>dist(P,p)<1100&&!collides(p.x,p.y,P.r,P)&&!waterBlocksLand(p.x,p.y));
   if(!cover||!debugTeleport(cover.x,cover.y))return no("潜伏できる茂みが見つかりません");
   P.hidden=true;P.revealTimer=0;
  }else if(/^level[1-9][0-9]*$/.test(key)){
   const level=Number(key.slice(5));if(level>1000)return no("レベル上限は1000です");
   P.level=level;P.xp=0;
   let threshold=5;for(let n=1;n<level&&threshold<1e9;n++)threshold=Math.min(1e9,Math.round(threshold*1.5+2));
   P.nextXp=threshold;syncStrongBossChallenge();
  }else if(key==="death"){P.hp=0;beginDeath();return {ok:true,message:"死亡演出からリトライを確認"};}
  else return no("状態が未実装");
  return ok("自キャラ状態："+key);
 }
 if(group==="area"){
  const i=Number(key);if(!Number.isInteger(i)||i<0||i>7)return no("地区が不正");
  const [x,y,w,h]=BIOME_AREAS[i];
  return debugTeleport(x+w/2,y+h/2,(xx,yy)=>regionAt(xx,yy)===i)?ok(districts[i]+"へ移動"):no("安全な到達地点がありません");
 }
 if(group==="mountain"){
  const xx={foothill:MOUNTAIN?.CITY_EDGE+650,slope:MOUNTAIN?.FOOTHILL_END+520,
   summit:MOUNTAIN?.SUMMIT_START+350,cave:(MOUNTAIN?.cave?.start+MOUNTAIN?.cave?.end)/2}[key];
  if(!Number.isFinite(xx)||!MOUNTAIN?.zone||!MOUNTAIN?.center)return no("山岳の座標を取得できません");
  return debugTeleport(xx,MOUNTAIN.center(xx),(x,y)=>MOUNTAIN.zone(x,y)===key&&MOUNTAIN.active(x,y))?
    ok("山岳："+key+"へ移動"):no("このエリアに安全な地点がありません");
 }
 return no("未実装の検証操作です");
}
Object.assign(window.WildDebugBridge,{
 listCases:debugCaseList,diagnostics:debugDiagnostics,runCase:debugRunCase,
 teleportTo(x,y){
  if(mode!=="play"||!P||!Number.isFinite(x)||!Number.isFinite(y)||x<20||y<20||x>WORLD.w-20||y>WORLD.h-20)
   return {ok:false,message:"ゲーム中にマップ内の座標を指定してください"};
  if(!debugTeleport(x,y))return {ok:false,message:"この地点の周囲に移動できる地形がありません"};
  saveAuto();return {ok:true,message:"移動座標："+Math.round(P.x)+", "+Math.round(P.y)};
 },
 getRenderer:()=>debugRendererPreference,
 setRenderer(value){if(!["auto","2d"].includes(value))return false;
  debugRendererPreference=value;
  const gpu=document.getElementById("scene3d");if(gpu)gpu.style.display=value==="2d"?"none":"";
  return true;}
});

/* Gamepad adapter invokes the same gameplay and UI functions as touch/keyboard. */
window.WildGamepadBridge={
 getMode:()=>mode,
 setMove(x,y){gamepadAxes.x=clamp(Number(x)||0,-1,1);gamepadAxes.y=clamp(Number(y)||0,-1,1)},
 turnCamera(v){if(mode!=="play"||!Number.isFinite(v))return;cameraYaw=(cameraYaw+v)%TWO;updateCameraView()},
 zoom(v){if(mode==="play"&&Number.isFinite(v))adjustZoom(v)},
 action(kind,long=false){
  if(kind==="attack"){heldActions.padAttack=!!long;if(mode==="play"&&long)act("attack");return;}
  if(kind==="sprint"){heldActions.padSprint=mode==="play"&&!!long;return;}
  if(mode!=="play")return;
  if(kind==="jump")act("jump");
  else if(kind==="pounce")act("dash");
  else if(kind==="context")contextAction(!!long);
 },
 pause(){if(mode==="play"||mode==="pause")togglePause()},
 map(){if(mode==="play"||mode==="map")toggleWorldMap()}
};
})();

// Read-only active-play clock for the world chronology UI; never advances while offline.
window.WildGameWorldTime=()=>elapsed;

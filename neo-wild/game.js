(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas=$("scene"),ctx=canvas.getContext("2d",{alpha:true});
let warned3DFallback=false;
const mini=$("minimap"),mc=mini.getContext("2d");
const bigMap=$("world-map-canvas"),bm=bigMap.getContext("2d");
const TWO=Math.PI*2, WORLD={w:8400,h:6000};
const animals={
 fox:{name:"アカギツネ",hp:110,speed:285,damage:22,rate:.39,r:19,color:"#d97947",belly:"#f4d3a0",ear:"#c06e42"},
 cat:{name:"ノラネコ",hp:85,speed:320,damage:16,rate:.28,r:16,color:"#abaf9d",belly:"#e7e7da",ear:"#8e998a"},
 wolf:{name:"オオカミ",hp:155,speed:175,damage:34,rate:.56,r:24,color:"#718991",belly:"#cad2c9",ear:"#546973"}
};
const species={
 rat:{hp:22,r:12,speed:105,damage:0,prey:true,xp:1,food:27,color:"#9b8b81",belly:"#d2bbb0"},
 rabbit:{hp:30,r:15,speed:150,damage:0,prey:true,xp:1,food:33,color:"#c8b899",belly:"#f0e5d5"},
 pigeon:{hp:18,r:12,speed:125,damage:0,prey:true,xp:1,food:19,color:"#738c92",belly:"#e5e4d5"},
 dog:{hp:124,r:22,speed:161,damage:16,prey:false,xp:3,food:29,color:"#9c785a",belly:"#e2c9a3"},
 boar:{hp:190,r:28,speed:122,damage:23,prey:false,xp:4,food:45,color:"#796358",belly:"#af9c87"},
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
const STRONG_NAMES={alpha:"アルファウルフ",giantSnake:"大蛇",oldBear:"老熊",giantBoar:"巨大イノシシ",blackPanther:"黒豹",oneEyedWolf:"隻眼の狼",whiteTiger:"白虎",giantHyena:"巨大ハイエナ",giantLion:"巨大ライオン",giantMoose:"巨大ヘラジカ",giantBuffalo:"巨大バッファロー",giantCrocodile:"巨大ワニ",giantHippo:"巨大カバ",giantAnaconda:"巨大アナコンダ",giantLizard:"巨大オオトカゲ",rhino:"サイ",giantGorilla:"巨大ゴリラ",giantElephant:"巨大ゾウ",albinoWolf:"アルビノの狼",giantEagle:"大鷲"};
const STRONG_REGIONS={0:["alpha","blackPanther","oneEyedWolf","albinoWolf"],1:["alpha","oldBear","blackPanther","oneEyedWolf","albinoWolf"],2:["giantEagle","giantSnake","oldBear","giantBoar","whiteTiger","giantMoose","giantBuffalo","giantLizard","giantGorilla"],3:["giantEagle","oldBear","blackPanther","alpha","giantSnake","whiteTiger","giantLion","giantLizard","rhino","giantElephant"],4:["giantEagle","giantSnake","giantBoar","giantHyena","giantBuffalo","giantCrocodile","giantHippo","giantAnaconda"],5:["giantEagle","giantSnake","oldBear","giantBoar","blackPanther","whiteTiger","giantLion","giantMoose","giantBuffalo","giantLizard","rhino","giantGorilla","giantElephant"],6:["giantBoar","alpha","blackPanther","giantHyena","giantLion"],7:["giantEagle","giantSnake","blackPanther","giantHyena","giantMoose","giantCrocodile","giantHippo","giantAnaconda","albinoWolf"]};
let strongRolls={},strongTrophies={},strongRegionCurrent=-1;
let vw=1,vh=1,dpr=1,cam={x:0,y:0},mode="menu",choice="fox",P=null,mobs=[],carcasses=[],plants=[],debris=[],buildings=[],lamps=[],particles=[],popups=[],birdFlocks=[],streetProps=[];
let elapsed=0,day=1,kills=0,meals=0,hiddenHold=0,expedition=1,freeStep=0,freeTarget=0,mission=0,missionComplete=false,totalScore=0,best=0,weather="CLEAR",scoreTimer=0,spawnTimer=0,uiTimer=0,shake=0,flash=0,toastTime=0,toastMessage="",last=performance.now(),rain=[],worldMade=false;
const AUTOSAVE_KEY="wild-reclaim-autosave-v2",CHECKPOINTS_KEY="wild-reclaim-checkpoints-v2",SAVE_SCHEMA=2;
const TUTORIAL_ONCE_KEY="wild-reclaim-auto-tutorial-shown-v1";
let automaticTutorialShown=false;
try{automaticTutorialShown=localStorage.getItem(TUTORIAL_ONCE_KEY)==="1"}catch(_){}
function rememberTutorialShown(){automaticTutorialShown=true;try{localStorage.setItem(TUTORIAL_ONCE_KEY,"1")}catch(_){}}
function migrateSeenTutorial(snapshot){if(snapshot&&(Number(snapshot.mission)>0||(Array.isArray(snapshot.tutorialSeen)&&snapshot.tutorialSeen.length>0)))rememberTutorialShown();}
let autosaveClock=0,weatherTimer=35,nextWeather=null,thunderFlash=0,thunderTimer=10,windDirection=0;
let debugWeatherOverride=null; // Session-only weather preview; never stored in saves.
let soundEnabled=true,footstepTimer=0,audioTick=0,keys=new Set(),joy={id:null,x:0,y:0},heldDash=false,navPlansThisFrame=0,huntTarget=null,objectiveBannerTime=0,ambushTarget=null,huntSlowUntil=0,pounceStreaks=[];
const activeTouchPointers=new Map(),touchHoldTimers=new Map(),gamepadAxes={x:0,y:0};
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
function unproject(x,y){const dx=x-vw/2,dy=y-vh/2;return {x:cam.x+vw/2+(VIEW.d*dx-VIEW.c*dy)/VIEW_DET,y:cam.y+vh/2+(-VIEW.b*dx+VIEW.a*dy)/VIEW_DET}}
function screenDepth(x,y){return VIEW.b*x+VIEW.d*y}
const WILDLIFE={initial:12,cap:96,localRadius:670,localCap:7,separation:115,preyNeedRadius:440,farAI:1300,localTargetRain:6,localTargetClear:5};
const roadsX=[530,1410,2320,3270,4400,5320,6260,7340,8070],roadsY=[465,1170,1890,2800,3760,4820,5650];
const districts=["霞ヶ関封鎖区","旧新宿駅周辺","緑化侵食区域","上野廃動物園","荒川河川敷","代々木緑地","湾岸旧工業区","江東運河"];
function regionAt(x,y){
 if(y<2600){
  if(x<1400)return 0;if(x<2800)return 1;if(x<4200)return 2;if(x<6300)return 3;return 4;
 }
 if(x<2800)return 5;if(x<5600)return 6;return 7;
}
const EXPLORE_SITES=[
 {id:"zoo",x:5250,y:1460,name:"上野・動物園跡",note:"大型動物の気配が残る獣舎"},
 {id:"river",x:7270,y:1700,name:"荒川河川敷",note:"新たな水場と野鳥の生息地"},
 {id:"forest",x:1550,y:4380,name:"代々木・深緑の森",note:"食料は豊富だが足元が見えにくい"},
 {id:"factory",x:4380,y:4260,name:"湾岸・旧工業区",note:"高い足場と廃機械の残骸"},
 {id:"canal",x:7000,y:4850,name:"江東運河",note:"水路沿いの獣道"},
 {id:"ark",x:5520,y:2170,name:"地下管理区画の入口",note:"都市の旧設備から異音が聞こえる"}
];
const START_LOCATIONS={
 home:{x:1860,y:1170,name:"東京・巣周辺"},
 zoo:{x:5250,y:1460,name:"上野・廃動物園"},
 forest:{x:1550,y:4380,name:"代々木・深緑の森"},
 factory:{x:4380,y:4260,name:"湾岸・旧工業区"},
 canal:{x:7000,y:4850,name:"江東運河・水路跡"},
 river:{x:7270,y:1700,name:"荒川河川敷"}
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

const CLAN_NAMES=["封鎖区の野犬","駅裏の群れ","緑地のイノシシ","上野の獣群","河川のカラス","森の群れ","工業区の野犬","運河の渡り鳥"];
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
  e.food=clamp(e.food+2-Math.floor(e.prey/22),10,94);
  const foodSupported=e.prey>=e.predators*1.6;
  e.predators=clamp(e.predators+(foodSupported&&step%2===0?1:0)-(!foodSupported?1:0),3,31);
  e.pressure=clamp(e.pressure+(e.prey<oldPrey?1:-1),0,5);
  if(e.pressure>=4&&(e.events+step+i)%3===0){
   e.dominance=(e.dominance+1)%3;e.pressure=0;e.events++;
  }
  if(oldDominance!==e.dominance)ecologyNews=districts[i]+"：群れの勢力が交代";
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
function saveTerritoryClaims(){try{localStorage.setItem("wild-reclaim-territory-v1-"+P.type,JSON.stringify(territoryClaims))}catch(_){}}
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
 if(mobs.some(m=>m.hp>0&&!species[m.type].prey&&dist(m,site)<190)){notify("敵を追い払ってから△長押し");return true}
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
function loadDenLevel(animal){
 try{const n=Number(localStorage.getItem("wild-reclaim-den-level-v1-"+animal));return Number.isInteger(n)?clamp(n,1,DEN_MAX_LEVEL):1}catch(_){return 1}
}
function saveDenLevel(){
 try{localStorage.setItem("wild-reclaim-den-level-v1-"+P.type,String(denLevel))}catch(_){}
}
function loadDenStash(animal){
 try{return clamp(Number(localStorage.getItem("wild-reclaim-den-v1-"+animal))||0,0,denCapacity())}catch(_){return 0}
}
function saveDenStash(){
 syncDenStash();
 try{
  localStorage.setItem("wild-reclaim-den-v1-"+P.type,String(denStash));
  localStorage.setItem("wild-reclaim-den-stores-v1-"+P.type,JSON.stringify(denStores));
 }catch(_){}
}
const STATION={x:2460,y:1170};
try{best=+(localStorage.getItem("wild-reclaim-best")||0)}catch(e){}
$("best-score").textContent="BEST SCORE "+String(best).padStart(6,"0");
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
  ctx.restore();
 }
}
/* Explicit dawn / noon / sunset / night lighting. Noon is the brightest period.
 * The time axis keeps the existing 85-second DAY cycle; no save/schema changes. */
const DAYLIGHT_KEYS=[
 [0,.12,0,.60,.74,1.11],[4.75,.12,0,.60,.74,1.11],
 [5.5,.23,.34,1.03,.77,.67],[6.5,.45,.74,1.19,.88,.67],
 [8.5,.81,.16,1.12,1.03,.91],[10,1.00,0,1.12,1.12,1.10],
 [12,1.16,0,1.20,1.19,1.14],[14,1.11,0,1.17,1.15,1.11],
 [16,.98,0,1.12,1.06,.96],[17,.72,.58,1.20,.83,.65],
 [18,.37,.91,1.24,.70,.51],[19,.29,.38,.83,.74,.88],
 [20,.12,0,.60,.73,1.08],[24,.12,0,.60,.74,1.11]
];
/* Lunar cycle uses elapsed time, without changing saves, weather or YEAR. */
function moonlightProfile(seconds=elapsed,sky=weather){
 const age=(Math.max(0,seconds)/85)%29.530588,phase=age/29.530588;
 const illumination=(1-Math.cos(phase*TWO))*.5;
 const visibility=sky==="THUNDER"?.10:sky==="RAIN"?.20:sky==="FOG"?.28:sky==="CLOUDY"?.45:sky==="WIND"?.82:1;
 const name=phase<.06||phase>=.94?"新月":phase<.20?"満ちゆく月":phase<.31?"上弦":phase<.44?"満ちゆく月":phase<.56?"満月":phase<.69?"欠けゆく月":phase<.81?"下弦":"欠けゆく月";
 return {age,phase,illumination,visibility,ambient:.22+.09*illumination*visibility,name};
}
function dayLightProfile(seconds=elapsed){
 const hour=(6+((seconds%85+85)%85)/85*24)%24;
 for(let i=1;i<DAYLIGHT_KEYS.length;i++){
  const a=DAYLIGHT_KEYS[i-1],b=DAYLIGHT_KEYS[i];
  if(hour>b[0])continue;
  const t=clamp((hour-a[0])/(b[0]-a[0]),0,1),ease=t*t*(3-2*t);
  const v=j=>a[j]+(b[j]-a[j])*ease;
  // Moonlight blends into the original daylight curve without changing noon.
   const moon=moonlightProfile(seconds,weather);
   const nightWeight=hour<4.75||hour>=20?1:hour<6.5?clamp((6.5-hour)/1.75,0,1):hour>=18?clamp((hour-18)/2,0,1):0;
   return {hour,brightness:v(1)+nightWeight*(moon.ambient-.12),warmth:v(2),tint:[v(3),v(4),v(5)]};
 }
 return {hour,brightness:.12,warmth:0,tint:[.60,.74,1.11]};
}
function worldDaylight(){return dayLightProfile().brightness;}

/* Animal night vision: a soft 120-degree forward acuity field, not emitted light.
 * Shared parameters drive the WebGL material contrast and 2D darkness mask. */
function nightVisionProfile(seconds=elapsed,sky=weather,animalType=P?.type){
 const light=dayLightProfile(seconds),hour=light.hour;
 const nightWeight=hour<4.75||hour>=20?1:hour<6.5?clamp((6.5-hour)/1.75,0,1):hour>=18?clamp((hour-18)/2,0,1):0;
 const lunar=moonlightProfile(seconds,sky);
 const weatherFactor=sky==="THUNDER"?.55:sky==="RAIN"?.68:sky==="FOG"?.72:sky==="CLOUDY"?.80:sky==="WIND"?.94:1;
 const nocturnal=animalType==="cat";
 const baseRange=nocturnal?820:animalType==="wolf"?610:510;
 const range=baseRange*weatherFactor*(.84+.16*lunar.illumination*lunar.visibility);
 const strength=nightWeight*(nocturnal?.57:animalType==="wolf"?.39:.35)*(.82+.18*weatherFactor);
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
    grad.addColorStop(.60,"rgba(0,0,0,"+(power*.88)+")");
    grad.addColorStop(1,"rgba(0,0,0,0)");
    n.fillStyle=grad;n.fillRect(0,0,vw,vh);n.restore();
   }
   // Peripheral vision never drops to absolute black behind the animal.
   const near=n.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,Math.max(75,125*cameraZoom));
   near.addColorStop(0,"rgba(0,0,0,"+(vision.strength*.25)+")");
   near.addColorStop(1,"rgba(0,0,0,0)");
   n.fillStyle=near;n.fillRect(0,0,vw,vh);n.restore();
  }
 }
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.drawImage(nightVisionCanvas,0,0,vw,vh);ctx.restore();
}

/* Same river/canal geometry in 2D, 3D and movement. Road crossings are dry bridges. */
function waterDepth(x,y){
 let depth=0;
 if(y>=0&&y<2600&&x>=6300){
  const offset=Math.abs(x-riverAxis(y));
  if(offset<133&&!roadsY.some(ry=>Math.abs(y-ry)<80))depth=Math.min(1,(133-offset)/70);
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
  if(nearBuilding(x,y,45)||waterBlocksLand(x,y))continue;
  const biome=regionAt(x,y),forest=biome===5,shrubs=forest?.46:biome===7?.24:.15;
  plants.push({x,y,r:Math.random()<shrubs?rnd(34,65):rnd(7,24),
   type:Math.random()<shrubs?2:Math.random()<.25?1:0,phase:rnd(0,TWO),hue:Math.random()});
 }
 for(let i=0;i<260;i++){
  const x=4200+rnd(0,WORLD.w-4320),y=90+rnd(0,2400);
  if(!nearBuilding(x,y,48)&&!waterBlocksLand(x,y))plants.push({x,y,r:rnd(8,46),type:i%5===0?2:i%3===0?1:0,phase:rnd(0,TWO),hue:Math.random()});
 }
 for(let i=0;i<520;i++){
  const x=rnd(80,WORLD.w-80),y=rnd(2500,WORLD.h-70);
  if(!nearBuilding(x,y,12)&&!waterBlocksLand(x,y))debris.push({x,y,r:rnd(2,12),a:rnd(0,TWO),kind:i%4});
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
   if(nearBuilding(x,y,28)||waterBlocksLand(x,y))continue;
   plants.push({x,y,r:rnd(5,17),type:Math.random()<.23?1:0,phase:rnd(0,6),hue:Math.random()});}
 for(let i=0;i<75;i++){const x=rnd(65,WORLD.w-65),y=rnd(65,WORLD.h-65);
  if(!nearBuilding(x,y,70)&&!waterBlocksLand(x,y))plants.push({x,y,r:rnd(34,67),type:2,phase:rnd(0,6)});}
 for(let i=0;i<330;i++){let x=rnd(0,WORLD.w),y=rnd(0,WORLD.h);
   if(nearBuilding(x,y,8)||waterBlocksLand(x,y))continue;
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
 for(let i=0;i<20;i++)birdFlocks.push({x:160+i*380,y:290+(i%6)*850,z:55+(i%4)*23,
  dir:i%2?3.0:.13,speed:56+i%4*19,wing:i*1.7,fright:0,type:i%3===0?"crow":"pigeon"});
 for(let i=0;i<85;i++)rain.push({x:rnd(0,2000),y:rnd(0,1200),s:rnd(320,730),z:rnd(9,21)});
 buildScenicProps();
}
function resize(){vw=window.innerWidth;vh=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1.8);canvas.width=Math.floor(vw*dpr);canvas.height=Math.floor(vh*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(mode==="guide"||mode==="milestone")guideNeedsFrame=true;}
window.addEventListener("resize",resize,{passive:true});resize();generateWorld();initializeDenSites();ensureDenCover();
function show(id){
 for(const key of ["menu","pause","result","upgrade"])$(key).classList.toggle("hidden",key!==id);
 if(id==="menu")refreshSaveMenu();
}
function start(){
 // Only the first ever playthrough displays tutorial milestones; retry never repeats them.
 previouslyOnboardedAtRunStart=automaticTutorialShown;
 autosaveClock=0;audioTick=0;startAmbient();mode="play";show("");cameraYaw=0;cameraZoom=.8;guideWisp=null;guideGoal=null;updateCameraView();$('zoom-level').textContent='80%';$("world-map").classList.add("hidden");elapsed=0;day=1;kills=0;meals=0;hiddenHold=0;expedition=1;freeStep=0;freeTarget=0;mission=0;missionComplete=false;scoreTimer=0;spawnTimer=0;ecology=initialEcology();ecologyClock=0;ecologyNews="生態系は変化し続けている";discoveredSites=[];earnedDiscoveries=[];debugWeatherOverride=null;weather=tokyoWeatherAt(0);weatherTimer=85;nextWeather=null;thunderFlash=0;thunderTimer=10;windDirection=rnd(0,TWO);shake=0;flash=0;particles=[];popups=[];mobs=[];carcasses=[];strongRolls={};strongTrophies={};strongRegionCurrent=-1;resetControls();guideCache=null;huntTarget=null;
 objectiveBannerTime=0;$("objective-banner").classList.remove("visible");tutorialSeen.clear();guideNeedsFrame=false;milestoneUntil=0;$("mission-milestone").classList.add("hidden");$("mission-milestone").classList.remove("show");$("app").classList.remove("tutorial-paused");$("tutorial-dialog").classList.add("hidden");$("den-inventory").classList.add("hidden");ambushTarget=null;huntSlowUntil=0;pounceStreaks.length=0;$("hunt-cinematic").classList.remove("show");
 const origin=START_LOCATIONS[$("start-region")?.value]||START_LOCATIONS.home;
 ensureDenCover();
 denLevel=loadDenLevel(choice);denStores=loadDenStores(choice);syncDenStash();territoryClaims=loadTerritoryClaims(choice);territoryLastSupply=[day,day,day];
  const a=animals[choice];P={x:origin.x,y:origin.y,dir:0,type:choice,base:a,r:a.r,hp:a.hp,maxHp:a.hp,hunger:100,sp:100,speed:a.speed,damage:a.damage,rate:a.rate,atk:0,dash:0,dashTime:0,dx:1,dy:0,inv:0,level:1,xp:0,nextXp:5,combo:0,comboTimer:0,steps:0,blood:0,eatCD:0,vx:0,vy:0,noise:0,noiseBurst:0,hidden:false,windup:0,pendingStrike:false,ambushStrike:false,revealTimer:0,abilityTime:0,instinctCD:0,pounceTime:0,pounceRemaining:0,pounceDir:0,jumpTime:0,jumpDuration:0,jumpHeight:0,jumpRemaining:0,jumpSpeed:0,jumpDir:0,jumpCD:0,jumpDive:false,jumpAmbush:false,groundZ:0,pounceDuration:0,fallTime:0,fallFromZ:0,carry:null,lastCombatAt:-100,rushStep:0,rushActiveStep:0,rushWindow:0,rushQueued:false,wallKicks:0,wallKickLast:-1,wallKickLock:0,wallKickTime:0,wallKickDir:0,jumpFromHeight:0,jumpPower:0,chargeStrike:false,strongWound:0};
 if(choice==="cat")P.catSpeedV2=true; // Faster base speed is applied to new cats.
 let roomPrey=0;
 if(origin===START_LOCATIONS.home){
  for(const shelter of buildings.filter(b=>b.interior)){
   const room=shelterInteriorPoint(shelter);
   if(spawnMob(false,true,false,{x:room.x,y:room.y+18}))roomPrey++;
  }
 }
 spawnMob(false,true); // Reserve nearby mission prey before filling the local wildlife slots.
 for(let i=0;i<WILDLIFE.initial-roomPrey;i++)spawnMob(true);
 for(let i=0;i<17;i++)spawnFood();
 carcasses.push({x:P.x+105,y:P.y+40,r:9,amount:22,type:"berries",ttl:240,phase:0});
 if(!plants.some(q=>q.type===2&&Math.hypot(q.x-(P.x+193),q.y-(P.y+72))<48))plants.push({x:P.x+193,y:P.y+72,r:60,type:2,phase:1.3});
 cam.x=clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw));cam.y=clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh));
 enterStrongStage();syncHUD();drawMini();window.WildAudio?.update({weather,area:regionAt(P.x,P.y),danger:false,mode:"play",...waterSoundAt(P.x,P.y)});notify(origin.name+" / 生存開始");
 playEffect("collect");
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
function getAutoSnapshot(){
 try{const s=JSON.parse(localStorage.getItem(AUTOSAVE_KEY)||"null");return isValidSnapshot(s)?s:null}catch(_){return null}
}
function getCheckpoints(){
 try{const list=JSON.parse(localStorage.getItem(CHECKPOINTS_KEY)||"[]");return Array.isArray(list)?list.filter(isValidSnapshot).slice(0,3):[]}catch(_){return []}
}
function clearAutoSave(){
 try{localStorage.removeItem(AUTOSAVE_KEY)}catch(_){}
}
function currentSnapshot(){
 if(!P||P.hp<=0||!(mode==="play"||mode==="pause"||mode==="upgrade"||mode==="inventory"||mode==="guide"||mode==="milestone"))return null;
 return {
  version:SAVE_SCHEMA,worldVersion:2,savedAt:Date.now(),savedMode:mode==="upgrade"?"upgrade":"play",
  player:{...P,base:undefined},camera:{x:cam.x,y:cam.y,yaw:cameraYaw,zoom:cameraZoom},
  elapsed,day,kills,meals,hiddenHold,expedition,freeStep,freeTarget,mission,missionComplete,totalScore,
  weather,weatherTimer,nextWeather,thunderTimer,windDirection,scoreTimer,spawnTimer,denLevel,denStash,denStores:{...denStores},territoryClaims:[...territoryClaims],territoryLastSupply:[...territoryLastSupply],
  tutorialSeen:[...tutorialSeen],mobs,carcasses,plants,debris,birdFlocks,discoveredSites,earnedDiscoveries,ecology,ecologyClock,ecologyNews,strongRolls,strongTrophies
 };
}
function saveAuto(){
 const snapshot=currentSnapshot();
 if(!snapshot)return false;
 try{
  localStorage.setItem(AUTOSAVE_KEY,JSON.stringify(snapshot));
  return true;
 }catch(_){return false}
}
function checkpointLabel(s){
 const animal=animals[s.player.type]?.name||"動物",lv=Math.max(1,Math.floor(s.player.level||1));
 const date=new Date(s.savedAt||0),when=Number.isFinite(date.getTime())?date.toLocaleString("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";
 return animal+" LV"+lv+"　DAY "+(s.day||1)+(when?"　"+when:"");
}
function refreshSaveMenu(){
 const auto=getAutoSnapshot(),points=getCheckpoints();
 if(!automaticTutorialShown){migrateSeenTutorial(auto);for(const point of points)migrateSeenTutorial(point)}
 const hasSave=!!auto||points.length>0;
 $("menu").classList.toggle("has-saved-game",hasSave);
 $("menu").classList.toggle("has-auto-save",!!auto);
 $("new-game-options").open=!hasSave;
 $("continue-btn").classList.toggle("hidden",!auto);
 $("continue-detail").textContent=auto?checkpointLabel(auto):"";
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
 if(mission===1&&hiddenHold>=.75)mission=2;
 if(mission===2&&kills>=1)mission=4;
 // Retired station objective: continue old saves at the practical den lesson.
 if(mission===3)mission=4;
 if(mission===4&&denLevel>=2)mission=5;
 if(mission===5&&territoryOwned()>=1)mission=6;
 if(mission===6&&discoveredSites.length>=2){
  mission=7;missionComplete=true;tutorialSeen.add(7);
 }
 for(let n=0;n<=Math.min(7,mission);n++)tutorialSeen.add(n);
 return mission!==previous;
}
function restoreSnapshot(snapshot){
 if(!isValidSnapshot(snapshot))return false;
 migrateSeenTutorial(snapshot);
 choice=snapshot.player.type;
 document.querySelectorAll(".animal-card").forEach(b=>b.classList.toggle("selected",b.dataset.animal===choice));
 start();
 const p=snapshot.player;
 P={...P,...p,base:animals[choice],type:choice};
 if(choice==="cat"&&!p.catSpeedV2){
  // Older SAVE_SCHEMA=2 cat runs retain their upgrades. New 320+ saves are not amplified.
  // All legacy cats used base 239, including upgraded saves above 320.
  // Preserve the earned speed multiplier against the new base exactly once.
  const legacySpeed=Number(p.speed);
  const savedSpeed=Number.isFinite(legacySpeed)&&legacySpeed>0?legacySpeed:239;
  P.speed=Math.max(320,Math.round(savedSpeed*320/239));
  P.catSpeedV2=true;
 }
 P.carry=normalizeCarry(P.carry); // Legacy corpse/meat/berries compatibility.
 P.strongWound=clamp(Number(P.strongWound)||0,0,5.5);
 P.x=clamp(p.x,P.r+12,WORLD.w-P.r-12);
 P.y=clamp(p.y,P.r+12,WORLD.h-P.r-12);
 if(waterBlocksLand(P.x,P.y)){const safe=nearestDryBank(P.x,P.y,P.r);if(safe){P.x=safe.x;P.y=safe.y;}}
 const roof=roofAt(P.x,P.y);
 P.groundZ=roof;P.jumpHeight=roof;P.jumpTime=0;P.pounceTime=0;P.pounceRemaining=0;
 P.fallTime=0;P.dashTime=0;P.pendingStrike=false;P.chargeStrike=false;P.windup=0;
 P.vx=0;P.vy=0;P.jumpDive=false;P.jumpAmbush=false;P.wallKickTime=0;P.wallKicks=0;P.wallKickLast=-1;
 elapsed=snapshot.elapsed;day=Math.max(1,Math.floor(snapshot.day||1));
 kills=snapshot.kills||0;meals=snapshot.meals||0;hiddenHold=snapshot.hiddenHold||0;
 expedition=snapshot.expedition||1;freeStep=snapshot.freeStep||0;freeTarget=snapshot.freeTarget||0;
 mission=snapshot.mission||0;missionComplete=!!snapshot.missionComplete||mission>=7;
 tutorialSeen.clear();
 // A resumed run has already reached and seen the current objective; never auto-replay it.
 for(let n=0;n<=Math.min(6,Math.max(0,Math.floor(Number(mission)||0)));n++)tutorialSeen.add(n);
 if(Array.isArray(snapshot.tutorialSeen))for(const n of snapshot.tutorialSeen){if(Number.isInteger(n)&&n>=0&&n<=6)tutorialSeen.add(n)}
 totalScore=snapshot.totalScore||0;weather=["CLEAR","CLOUDY","RAIN","THUNDER","FOG","WIND"].includes(snapshot.weather)?snapshot.weather:"CLEAR";
 weatherTimer=Number.isFinite(snapshot.weatherTimer)&&snapshot.weatherTimer>0?snapshot.weatherTimer:rnd(24,45);
 nextWeather=null;weather=tokyoWeatherAt(elapsed);weatherTimer=85-(elapsed%85);
 thunderTimer=Number.isFinite(snapshot.thunderTimer)&&snapshot.thunderTimer>0?snapshot.thunderTimer:9;
 thunderFlash=0;windDirection=Number.isFinite(snapshot.windDirection)?snapshot.windDirection:0;
 scoreTimer=snapshot.scoreTimer||0;spawnTimer=snapshot.spawnTimer||0;
 denLevel=clamp(Math.floor(snapshot.denLevel||1),1,DEN_MAX_LEVEL);
 denStores=normalizeDenStores(snapshot.denStores,snapshot.denStash||0);syncDenStash();
 territoryClaims=Array.isArray(snapshot.territoryClaims)&&snapshot.territoryClaims.length===3?snapshot.territoryClaims.map(Boolean):[false,false,false];
 territoryLastSupply=Array.isArray(snapshot.territoryLastSupply)&&snapshot.territoryLastSupply.length===3?snapshot.territoryLastSupply:[day,day,day];
 mobs=snapshot.mobs;carcasses=snapshot.carcasses;
  strongRolls=snapshot.strongRolls&&typeof snapshot.strongRolls==="object"&&!Array.isArray(snapshot.strongRolls)?JSON.parse(JSON.stringify(snapshot.strongRolls)):{};
  strongTrophies=snapshot.strongTrophies&&typeof snapshot.strongTrophies==="object"?{...snapshot.strongTrophies}:{};
  strongRegionCurrent=-1;normalizeStrongBossSave();
 for(const c of carcasses)normalizeRemains(c);
 for(const m of mobs){
  // Resume boss position/HP without an unseen projectile immediately striking on load.
  if(m.type==="giantGorilla")m.rock=null;
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
 plants=snapshot.worldVersion===2?snapshot.plants:snapshot.plants.concat(expandedPlants);
 ensureDenCover();
 debris=snapshot.worldVersion===2?snapshot.debris:snapshot.debris.concat(expandedDebris);
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
 enterStrongStage();syncHUD(Math.floor((elapsed%85)/85*24));drawMini();
 saveAuto();if(mission>6)announceObjective();notify("保存した場所から再開");
 return true;
}
function recordCheckpoint(){
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
   const damage=Math.round(s.damage*profile.damage*(1+Math.max(0,day-1)*.15));
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
  const damage=Math.round(species.giantGorilla.damage*.68*(1+Math.max(0,day-1)*.15));
  P.hp-=damage;P.lastCombatAt=elapsed;P.inv=.42;interruptRush();shake=7;flash=.2;P.sp=clamp(P.sp-9,0,100);
  label(P.x,P.y-35,"投石 -"+damage,"#ffaaa0");blood(P.x,P.y,"#a79c8d",8,70);playEffect("damage");m.rock=null;return;
 }
 if(r.ttl<=0)m.rock=null;
}

/* STRONG-EAGLE-FLIGHT: airborne orbit, warning, dive, collision, climb and prey ecology. */

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
    const damage=Math.round(s.damage*1.08*(1+Math.max(0,day-1)*.15));
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
function strongBossAlive(){return mobs.find(m=>m.hp>0&&(m.strongBoss||m.type==="alpha"))||null;}
function strongStageCandidate(region){
 const options=(STRONG_REGIONS[region]||["alpha"]).filter(t=>!AQUATIC_STRONG_TYPES.has(t)||aquaticStagePoints(region).length>0);
 const hour=(6+Math.floor((elapsed%85)/85*24))%24,night=hour>=19||hour<6;
 const weights=options.map(t=>t==="blackPanther"?(night?3.2:.7):t==="oneEyedWolf"?(night?2.2:1.1):t==="whiteTiger"?(night?.65:1.7):t==="giantHyena"?(weather==="RAIN"||weather==="THUNDER"?.55:1.5):t==="giantLion"?(night?1.8:1.1):t==="giantMoose"?(weather==="THUNDER"?.55:1.4):t==="giantBuffalo"?(weather==="RAIN"?1.5:1.2):t==="giantGorilla"?(weather==="THUNDER"?.55:1.0):t==="giantElephant"?(weather==="RAIN"?1.35:.95):t==="giantEagle"?(weather==="THUNDER"?.25:weather==="RAIN"?.55:night?.65:1.5):t==="albinoWolf"?(night?.48:.18):t==="giantCrocodile"?(night?2.0:1.1):t==="giantHippo"?(weather==="RAIN"?1.8:1.1):t==="giantAnaconda"?(night?1.6:1.0):t==="giantSnake"?(weather==="RAIN"||weather==="THUNDER"?1.7:1.2):t==="oldBear"?(night?.7:1.5):t==="giantBoar"?(weather==="THUNDER"?.65:1.3):1.2);
 let roll=Math.random()*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<options.length;i++){roll-=weights[i];if(roll<=0)return options[i];}
 return options[options.length-1];
}
function spawnStrongBoss(type,region){
 if(!P||!species[type]||strongBossAlive()||mobs.length>=WILDLIFE.cap)return false;
 const sp=species[type],aquatic=AQUATIC_STRONG_TYPES.has(type),waterSpots=aquatic?aquaticStagePoints(region):null;
 if(aquatic&&!waterSpots.length)return false;
 for(let i=0;i<100;i++){
  const angle=rnd(0,TWO),radius=rnd(370,Math.min(930,WILDLIFE.farAI-90));
  const spot=aquatic?waterSpots[Math.floor(Math.random()*waterSpots.length)]:null;
  const x=spot?spot.x:clamp(P.x+Math.cos(angle)*radius,60,WORLD.w-60);
  const y=spot?spot.y:clamp(P.y+Math.sin(angle)*radius,60,WORLD.h-60);
  if(regionAt(x,y)!==region||collides(x,y,sp.r+6,null,aquatic)||nearDenLocation(x,y,420)||mobs.some(q=>q.hp>0&&Math.hypot(q.x-x,q.y-y)<135))continue;
  const hp=Math.round(sp.hp*(1+Math.max(0,day-1)*.10));
  mobs.push({x,y,type,r:sp.r,color:sp.color,belly:sp.belly,hp,maxHp:hp,attack:0,vx:0,vy:0,dir:angle+Math.PI,wander:0,
   alert:0,search:0,lastX:x,lastY:y,step:rnd(0,8),flee:0,flash:0,windup:0,windupTotal:0,swing:0,
   strikeDir:0,stun:0,evadeTime:0,evadeCooldown:0,escapeTimer:0,fleeEnergy:1,
   chargeTime:0,chargeDir:0,chargeHit:false,staggerGuard:0,feintCooldown:2,
   thirstNeed:.4,drinkCooldown:3,flankSide:Math.random()<.5?-1:1,
   strongBoss:true,strongRegion:region,strongBirthDay:day,
   ...(type==="giantEagle"?{airHeight:125,airPhase:"circle",airTimer:1.7,airOrbit:angle,airAnchorX:x,airAnchorY:y,airTarget:null,airHit:false}: {})});
  notify("この地区に"+STRONG_NAMES[type]+"の気配がある");
  return true;
 }
 return false;
}
function enterStrongStage(){
 if(!P)return;
 const region=regionAt(P.x,P.y);strongRegionCurrent=region;
 if(!Object.prototype.hasOwnProperty.call(strongRolls,region))
  strongRolls[region]=Math.random()<.20?{type:strongStageCandidate(region),spawned:false}:{type:null,spawned:true};
 const roll=strongRolls[region];
 if(roll&&roll.type&&!roll.spawned&&!strongBossAlive()&&spawnStrongBoss(roll.type,region)){
  roll.spawned=true;saveAuto();
 }
}
function normalizeStrongBossSave(){
 let first=null;
 for(const m of mobs){
  if(!species[m.type]){m.type="dog";m.r=species.dog.r;}
  if(m.strongBoss||m.type==="alpha"){
   if(!first){first=m;m.strongBoss=true;m.color=species[m.type].color;m.belly=species[m.type].belly;m.strongRegion=Number.isInteger(m.strongRegion)?m.strongRegion:regionAt(m.x,m.y);}
   else{m.type="dog";m.strongBoss=false;m.r=species.dog.r;m.maxHp=Math.min(m.maxHp||species.dog.hp,species.dog.hp*2);m.hp=Math.min(m.hp||species.dog.hp,m.maxHp);}
  }
 }
 if(first)strongRolls[first.strongRegion]={type:first.type,spawned:true};
}

function spawnMob(initial=false,preyOnly=false,nearbyOnly=false,forcedSpot=null){
 if(mobs.length>=WILDLIFE.cap)return false; // Never evict living wildlife to spawn another.
 let tries=0,x=0,y=0,valid=false;
 const localCount=P?mobs.filter(m=>m.hp>0&&dist(m,P)<WILDLIFE.localRadius).length:0;
 do{
  if(forcedSpot){x=forcedSpot.x;y=forcedSpot.y}
  else{
   const a=rnd(0,TWO),rad=preyOnly?rnd(160,270):nearbyOnly?rnd(220,Math.min(550,WILDLIFE.localRadius-40)):initial?rnd(260,1250):rnd(Math.max(vw,vh)*.61,Math.max(vw,vh)*1.16);
   x=clamp((P?P.x:1800)+Math.cos(a)*rad,40,WORLD.w-40);
   y=clamp((P?P.y:1170)+Math.sin(a)*rad,40,WORLD.h-40);
  }
  const candidate={x,y},near=P&&dist(candidate,P)<WILDLIFE.localRadius;
  valid=!collides(x,y,40)&&(!P||dist(candidate,P)>(preyOnly?145:230))
   &&!mobs.some(m=>dist(candidate,m)<WILDLIFE.separation)
   &&(!near||localCount<WILDLIFE.localCap+(preyOnly?1:0));
 }while(!valid&&!forcedSpot&&++tries<52);
 if(!valid)return false;
 let roll=Math.random(),type;
 const biome=regionAt(x,y);
 if(preyOnly)type=biome===5?(roll<.20?"rat":"rabbit"):biome===4?(roll<.72?"pigeon":"rabbit"):roll<.4?"rat":roll<.78?"rabbit":"pigeon";
 else if(biome===5)type=roll<.45?"rabbit":roll<.65?"rat":roll<.85?"boar":"dog";
 else if(biome===6)type=roll<.32?"rat":roll<.62?"dog":roll<.88?"boar":"dog";
 else if(biome===4||biome===7)type=roll<.50?"pigeon":roll<.72?"rabbit":roll<.9?"dog":"boar";
 else if(day<2)type=roll<.4?"rat":roll<.72?"rabbit":roll<.87?"pigeon":"dog";
 else if(day<3)type=roll<.28?"rat":roll<.52?"rabbit":roll<.65?"pigeon":roll<.91?"dog":"boar";
 else type=roll<.2?"rat":roll<.38?"rabbit":roll<.52?"dog":roll<.86?"boar":"dog";
 // Safe nesting pockets can attract small prey, but never spawn a hostile pack.
 if(nearDenLocation(x,y,265)&&!species[type].prey)type=biome===4||biome===7?"pigeon":"rabbit";
 const s=species[type],scale=1+Math.max(0,day-1)*.13;
 mobs.push({x,y,type,r:s.r,hp:s.hp*scale,maxHp:s.hp*scale,attack:0,vx:0,vy:0,dir:rnd(-3,3),wander:rnd(.5,3),alert:0,search:0,lastX:x,lastY:y,step:rnd(0,8),flee:0,flash:0,windup:0,windupTotal:0,swing:0,strikeDir:0,stun:0,evadeTime:0,evadeDuration:0,evadeRemaining:0,evadeSpeed:0,evadeHeight:0,evadeAngle:0,evadeCooldown:0,escapeTimer:0,fleeEnergy:1,evasionSide:Math.random()<.5?-1:1,chargeTime:0,chargeDir:0,chargeHit:false,staggerGuard:0,feintTime:0,feintRemaining:0,feintSpeed:0,feintAngle:0,feintCooldown:rnd(.8,2),thirstNeed:rnd(.25,.68),drinkCooldown:rnd(0,2),drinkPose:0,flankSide:(mobs.filter(q=>q.type==='dog').length%2?1:-1)});
 return true;
}
function spawnFood(){
 for(let n=0;n<24;n++){
  const local=P&&Math.random()<.82;
  const angle=rnd(0,TWO),radius=rnd(185,760);
  const x=local?clamp(P.x+Math.cos(angle)*radius,70,WORLD.w-70):rnd(70,WORLD.w-70);
  const y=local?clamp(P.y+Math.sin(angle)*radius,70,WORLD.h-70):rnd(70,WORLD.h-70);
  if(collides(x,y,34)||carcasses.some(c=>dist(c,{x,y})<65))continue;
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
function collides(x,y,r,actor=null,ignoreWater=false){
 if(x<r+12||y<r+12||x>WORLD.w-r-12||y>WORLD.h-r-12)return true;
 if(!ignoreWater&&waterBlocksLand(x,y))return true;
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
 return false;
}
function move(o,dx,dy){
 if(o===P&&Math.max(Math.abs(dx),Math.abs(dy))>10){
  const parts=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/10);
  for(let i=0;i<parts;i++)move(o,dx/parts,dy/parts);
  return;
 }
 // River and canal banks are solid for land animals; old saved positions can exit.
 const previous=waterDepth(o.x,o.y);
 const allowed=(x,y,d)=>!waterBlocksLand(x,y)||(d>.0001&&waterDepth(x,y)<d-.00001);
 if(allowed(o.x+dx,o.y,previous)&&!collides(o.x+dx,o.y,o.r,o===P?o:null,true))o.x+=dx;
 const afterX=waterDepth(o.x,o.y);
 if(allowed(o.x,o.y+dy,afterX)&&!collides(o.x,o.y+dy,o.r,o===P?o:null,true))o.y+=dy;
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
function inCover(o){
 return visibleShrubCover()?plants.some(p=>p.type===2&&Math.hypot(p.x-o.x,p.y-o.y)<p.r*.75):visibleWinterCover(o);
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
function detectsPlayer(m,sp,d){
 // The visual clock is authoritative: the old cosine classified midnight as
 // daytime. Daylight, not a second independent clock, now governs visual range.
 const ambient=worldDaylight();
 const lightFactor=clamp(.49+ambient*.49,.55,1.06);
 const nocturnalBonus=sp.prey?0:(m.type==="alpha"?.17:m.type==="dog"?.13:.08);
 const vision=clamp(lightFactor+nocturnalBonus*(1-clamp(ambient,0,1)),.55,1.06);
 const sightRange=(sp.prey?185:265)*(weather==="FOG"?.62:weather==="RAIN"||weather==="THUNDER"?.78:weather==="CLOUDY"?.94:1)*vision*(P.hidden?.29:1);
 const los=!lineBlocked(m,P);
 const facing=Math.atan2(P.y-m.y,P.x-m.x);
 const delta=Math.atan2(Math.sin(facing-m.dir),Math.cos(facing-m.dir));
 const inSight=Math.abs(delta)<(sp.prey?2.22:1.37)||d<57;
 const visibleNow=los&&inSight&&d<Math.max(42,sightRange);
 const heard=d<(los?38:24)+P.noise*(los?116:58);
 const wind=Math.sin(elapsed*.022)*Math.PI;
 const smelled=d<(weather==="RAIN"||weather==="THUNDER"?38:weather==="WIND"?105:75)&&Math.cos(Math.atan2(m.y-P.y,m.x-P.x)-wind)>.45;
 return visibleNow||heard||smelled||(los&&d<P.r+m.r+17);
}
// Direct-control steering: both facing and velocity follow the input without a turning arc.
// Scripted jump, pounce and dash trajectories are handled by separate update branches.
function applyDirectionalInput(actor,axis,targetSpeed,dt,foxTurbo=false){
 const inputLength=Math.hypot(axis.x,axis.y);
 if(inputLength>.08){
  actor.dir=Math.atan2(axis.y,axis.x);
  actor.vx=axis.x*targetSpeed;
  actor.vy=axis.y*targetSpeed;
 }else{
  // Original braking is retained on release.
  const speed=Math.hypot(actor.vx,actor.vy);
  const brake=(actor.type==="wolf"?900:actor.type==="cat"?1720:foxTurbo?2750:1550)*dt;
  const ratio=speed>0?Math.max(0,speed-brake)/speed:0;
  actor.vx*=ratio;actor.vy*=ratio;
 }
}

function getAxes(){
 let x=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0)+joy.x+gamepadAxes.x;
 let y=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0)+joy.y+gamepadAxes.y;
 const strength=Math.min(1,Math.hypot(x,y));
  const wx=(VIEW.d*x-VIEW.c*y)/VIEW_DET,wy=(-VIEW.b*x+VIEW.a*y)/VIEW_DET,n=Math.hypot(wx,wy);
  return n>1e-5?{x:wx/n*strength,y:wy/n*strength}:{x:0,y:0};
}
function blood(x,y,color,count=9,speed=125){for(let i=0;i<count;i++){const a=rnd(0,TWO),v=rnd(speed*.2,speed);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(.25,.8),max:.8,size:rnd(1.6,4.4),color});}}
function label(x,y,t,color="#ffffff"){popups.push({x,y,t,color,life:1.1})}
function notify(t){toastMessage=t;toastTime=2.1;$("toast").textContent=t;$("toast").classList.add("show")}
function startAmbient(){window.WildAudio?.unlock();}
function playEffect(kind,options){if(soundEnabled)window.WildAudio?.play(kind,options||{});}
function instinct(){
 if(mode!=="play"||!P||P.instinctCD>0||P.sp<18)return;
 const level=P.level||1;P.sp-=18;
 P.instinctCD=(P.type==="wolf"?13:P.type==="fox"?9:8.5)*(P.instinctBonus?.85:1);
 P.abilityTime=P.type==="cat"?3.4+Math.min(1.7,(level-1)*.18):P.type==="fox"?4.4+Math.min(1.8,(level-1)*.18):4+Math.min(1.2,(level-1)*.1);
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
 }
}
function combatAim(maxTurn=.56,maxRange=105){
 let best=null,bestScore=Infinity,aim=P.dir;
 for(const m of mobs){
  if(m.hp<=0||dist(P,m)>P.r+m.r+maxRange||lineBlocked(P,m))continue;
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
 return mobs.some(m=>m.hp>0&&!lineBlocked(P,m)&&
  (species[m.type].prey?dist(P,m)<P.r+m.r+70:
   dist(P,m)<240&&(m.alert>0||m.windup>0||m.chargeTime>0)));
}
function edibleFood(c){return c&&c.type!=="bones"&&Number(c.amount)>0}
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
 if(!(sp.prey||m.type==="boar"||m.type==="giantBoar")||m.forageNeed<.70||spotted||m.alert>0||m.flee>0||
    m.stun>0||(m.evadeTime||0)>0||playerDistance<115||
    ((weather==="RAIN"||weather==="THUNDER")&&!insideShelter(m)))return null;
 // Feeding stops near predators; no food is consumed through walls.
 if((sp.prey||m.type==="boar")&&nearbyVisibleWildPredator(m,175))return null;
 let target=null,best=245*245;
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
  m.forageNeed=Math.max(0,m.forageNeed-(grazing?.32:.21));
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
 if((sp.prey||m.type==="boar")&&nearbyVisibleWildPredator(m,170))return null;
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
 return carcasses.some(f=>edibleFood(f)&&dist(P,f)<65&&!lineBlocked(P,f));
}
function putDownFood(){
 if(!P?.carry||mode!=="play")return;
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0||(P.jumpHeight||0)>20||(P.groundZ||0)>0){notify("着地してから置く");return false;}
 const c=P.carry;
 carcasses.push({x:P.x,y:P.y,r:11,amount:c.amount,type:c.type==="berries"?"berries":"meat",animalType:c.animalType||null,ttl:150,phase:P.dir||0});
 P.carry=null;notify("食料を置いた / △短押しで食べる・長押しで拾う");syncHUD();return true;
}
function contextAction(longPress=false){
 if(mode!=="play"||!P)return;
 if(atDen()){
  if(P.carry){carryFood();return}
  if(longPress&&denLevel<DEN_MAX_LEVEL&&denStash>=DEN_COSTS[denLevel+1]){upgradeDen();return}
  openDenInventory();return;
 }
 if(longPress){
  if(P.carry){putDownFood();return}
  if(!nearbyFood()&&markTerritory())return;
  carryFood();return;
 }
 if(P.carry){if(P.eatCD<=0){P.eatCD=.34;eat()}return}
 if(nearbyFood()&&P.eatCD<=0){P.eatCD=.34;eat();return}
 notify("食草・肉の近くで△を押す");
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
 const cost=RUSH_COST[step];
 if(P.sp<cost){resetRush();P.atk=.18;if((P.tiredNotice||0)<=0){P.tiredNotice=1.5;notify("息切れ / 少し間合いを取れ")}return}
 P.lastCombatAt=elapsed;P.sp-=cost;P.rushStep=step;P.rushActiveStep=step;P.rushQueued=false;
  P.atk=P.rate*(step===5?1.32:step===4?1.15:1);P.rushWindow=P.atk+.45;
 P.windup=Math.min(step===5?.20:.15,P.rate*(step===5?.46:.38));P.pendingStrike=true;
  P.jumpDive=P.jumpTime>0;
  const concealed=(P.hidden&&P.revealTimer<=0)||(P.jumpDive&&P.jumpAmbush);
  if(P.jumpDive)P.windup=Math.max(P.windup,P.jumpTime);
 const target=combatAim(P.type==="cat"?.72:P.type==="wolf"?.32:.55);
  ambushTarget=concealed&&target&&unawareOfPlayer(target)?target:null;
  P.ambushStrike=!!ambushTarget;
 if(P.type==="fox"&&P.abilityTime>0&&target&&!P.jumpDive){
  const distance=dist(P,target),angle=Math.atan2(target.y-P.y,target.x-P.x);
  const travel=Math.min(53,Math.max(0,distance-(P.r+target.r+30)));
  if(travel>4&&routeClear(P,{x:P.x+Math.cos(angle)*travel,y:P.y+Math.sin(angle)*travel},P.r)){
   P.pounceTime=.18;P.pounceDuration=.18;P.pounceRemaining=travel;P.pounceDir=angle;
   P.windup=Math.max(P.windup,.24);
   blood(P.x,P.y,"#ffe6a6",5,38);
  }
 }
 P.hidden=false;P.revealTimer=1.15;P.steps+=.1;
 P.noiseBurst=Math.max(P.noiseBurst,1.05);playEffect("attack",{volume:.22});
}
function resolveAttack(){
 if(mode!=="play"||!P.pendingStrike)return;
 P.pendingStrike=false;P.swing=.18;let hit=0;const stealthHit=P.ambushStrike;P.ambushStrike=false;
 mobs.forEach(m=>{
  if(m.hp<=0)return;
  const d=dist(P,m),theta=Math.atan2(m.y-P.y,m.x-P.x),angle=Math.atan2(Math.sin(theta-P.dir),Math.cos(theta-P.dir));
  const wolfCharge=P.type==="wolf"&&P.chargeStrike;
   const reach=(P.type==="wolf"?55:P.type==="cat"?39:51)+(P.rushActiveStep===5?18:0)+(wolfCharge?34:0);
  const arc=P.type==="wolf"?1.18:P.type==="cat"?.95:1.03;
  if(d<P.r+m.r+reach&&Math.abs(angle)<arc&&Math.abs((P.jumpHeight||0)-(m.groundZ||0))<22&&!lineBlocked(P,m)){
   const foxBurst=P.type==="fox"&&P.abilityTime>0;
   const dive=P.jumpDive;
    const silentHit=stealthHit&&ambushTarget===m;
    const bonus=(foxBurst?1.4:1)*(silentHit?1.55:1)*(dive?1.4:1)*(wolfCharge?1.6+Math.min(.45,(P.level-1)*.06):1);
   const rawDamage=Math.max(1,Math.round(P.damage*RUSH_POWER[P.rushActiveStep||1]*bonus*rnd(.86,1.16)));
   const armored=m.type==="rhino"&&!silentHit&&!dive&&!wolfCharge&&Math.cos(theta-(m.dir||0))<-.2;
   const damage=armored?Math.max(1,Math.round(rawDamage*.48)):rawDamage;
   m.hp-=damage;if(armored)label(m.x,m.y-m.r-44,"正面の厚い皮で軽減","#dfd6c5");
   if(foxBurst)P.abilityTime=0;
   m.flash=.16;m.alert=3;m.lastX=P.x;m.lastY=P.y;m.search=0;if(!species[m.type].prey)m.flee=0;
    const disrupt=!armored&&(species[m.type].prey||m.staggerGuard<=0||silentHit||dive);
    if(disrupt){
     m.windup=0;m.chargeTime=0;m.swing=0;
     m.stun=silentHit?.70:dive?.56:P.type==="wolf"?.40:P.type==="cat"?.16:.24;
     m.staggerGuard=species[m.type].prey?0:1.15;m.attack=Math.max(m.attack,.22);
    }else m.stun=Math.max(m.stun,.035);
    hit++;
   
    if(species[m.type].prey&&m.hp>0)startlePrey(m,P,"hit");
     if(silentHit){showHuntCinematic(m.hp<=0);label(m.x,m.y-m.r-37,"奇襲成功！","#bdf9c7");blood(m.x,m.y,"#c7f3b7",8,90)}
    if(dive){label(m.x,m.y-m.r-51,"飛びかかり！","#ffe1a3");blood(m.x,m.y,"#ffe1a3",9,84)}
   blood(m.x,m.y,m.hp>0?"#f7c77c":"#c65b4f",12,155);label(m.x,m.y-28,"-"+damage,"#ffe5b4");
   const knock=(P.type==="wolf"?17:P.type==="cat"?3:8)+(P.rushActiveStep===5?16:P.rushActiveStep===4?4:0)+(wolfCharge?39:0);
   move(m,Math.cos(theta)*knock,Math.sin(theta)*knock);
   if(P.type==="wolf"&&m.hp>0)label(m.x,m.y-m.r-28,"よろめき","#ffe0a6");
   if(m.hp<=0)kill(m);
  }
 });
 if(hit){shake=P.jumpDive?6:4;flash=.1;playEffect("bite");playEffect("impact",{volume:.18})}else{playEffect("attack",{volume:.15})}
 P.jumpDive=false;P.jumpAmbush=false;P.chargeStrike=false;ambushTarget=null;
 if(P.rushActiveStep===5){P.rushWindow=0;P.rushQueued=false;}
}
function kill(m){
 kills++;P.combo=P.comboTimer>0?P.combo+1:1;P.comboTimer=4.5;
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
 P.xp+=species[m.type].xp;
 label(m.x,m.y-50,"+"+species[m.type].xp+" DNA","#9aeac7");
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
 const cat=P.type==="cat",wolf=P.type==="wolf",cost=cat?14:wolf?22:17;
 if(P.sp<cost){notify("持久力不足 / ジャンプできない");return false}
 const axis=getAxes(),moving=Math.hypot(axis.x,axis.y)>.18;
 if(moving)P.dir=Math.atan2(axis.y,axis.x);
 const distance=cat?109+Math.min(46,(P.level-1)*5):wolf?70:112;
 P.jumpDuration=cat?.44:wolf?.49:.45;
 P.jumpTime=P.jumpDuration;P.jumpHeight=P.groundZ||0;
 P.jumpFromHeight=0;P.jumpPower=cat?83+Math.min(20,(P.level-1)*3):wolf?43:58;
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
 const maximum=P.type==="cat"?235+Math.min(75,(P.level-1)*5)
  :P.type==="wolf"?300+Math.min(100,(P.level-1)*8)
  :235+Math.min(65,(P.level-1)*5);
 const travel=(target?clamp(dist(P,target)-(P.r+target.r-2),20,maximum):maximum)*.70;
 ambushTarget=target&&unawareOfPlayer(target)?target:null;
 P.dir=angle;P.sp-=cost;P.dash=P.type==="cat"?.65:P.type==="wolf"?1.3:.88;P.chargeStrike=P.type==="wolf";
 P.pounceDir=angle;P.pounceDuration=P.type==="wolf"?.37:P.type==="cat"?.31:.30;
 P.pounceTime=P.pounceDuration;P.pounceRemaining=travel;
 P.vx=0;P.vy=0;P.atk=Math.max(P.atk,P.rate);
 P.windup=P.pounceDuration+.04;P.pendingStrike=true;P.jumpDive=true;
 P.ambushStrike=!!ambushTarget; // Concealment alone does not imply an unaware victim.
 P.hidden=false;P.revealTimer=1.1;
 P.noiseBurst=Math.max(P.noiseBurst,1.2);playEffect(P.type==="wolf"?"impact":"attack");
 return true;
}
function upgradeDen(){
 if(mode!=="play")return false;
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0){notify("巣に着地してから強化");return false}
 if(!atDen()){notify("巣の中心に近づいて△長押しで強化");return false}
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
 for(const f of carcasses){const d=dist(P,f);if(edibleFood(f)&&d<nearest&&!lineBlocked(P,f)){selected=f;nearest=d}}
 if(!selected){notify("運べる食草・肉が近くにない");return false}
 if(selected.type==="corpse"){
  const portion=Math.min(24,Math.max(0,selected.amount-1));
  if(portion<1){notify("死骸に運べる肉が残っていない");return false}
  selected.amount-=portion;P.carry={type:"meat",animalType:selected.animalType||null,amount:portion};
 }else{
  P.carry={type:selected.type==="berries"?"berries":"meat",animalType:selected.animalType||null,amount:selected.amount};
  carcasses.splice(carcasses.indexOf(selected),1);
 }
 notify(foodName(P.carry)+"をくわえた。巣の中で△を押すと備蓄");
 if(mission===4)announceObjective();
 syncHUD();return true;
}
function eat(){
 if(mode!=="play")return;
 if((P.jumpHeight||0)>20||P.jumpTime>0||P.pounceTime>0||P.fallTime>0||(P.groundZ||0)>0){notify("着地してから食べる");return}
 let c=P.carry||null,near=65,carried=!!c;
 if(!c)for(const f of carcasses){const d=dist(P,f);if(edibleFood(f)&&d<near&&!lineBlocked(P,f)){near=d;c=f}}
 if(!c){notify("食草・肉が近くにない");return}
 const bite=Math.min(12,c.amount),balance=foodBalance(c);
 const gain=Math.round(bite*balance.satiety),heal=Math.round(bite*balance.healing);
 P.hunger=clamp(P.hunger+gain,0,100);P.hp=clamp(P.hp+heal,0,P.maxHp);const woundRelief=sootheStrongWound(bite);meals++;
 if(carried){c.amount=Math.max(0,c.amount-bite);if(c.amount===0)P.carry=null}
 else if(c.type==="corpse"){c.amount=Math.max(0,c.amount-bite);if(c.amount===0)toBones(c)}
 else{c.amount=Math.max(0,c.amount-bite);if(c.amount===0)carcasses.splice(carcasses.indexOf(c),1)}
 label(P.x,P.y-30,foodName(c)+" 満腹+"+gain+" 生命+"+heal+(woundRelief>0?" 出血緩和":""),"#bfe89e");
 blood(P.x,P.y,"#d6c17f",7,45);playEffect("collect");checkMission();syncHUD();saveAuto();
}
function renderDenInventory(){
 if(!P)return;
 $("den-inventory-total").textContent="合計 "+denStash+" / "+denCapacity()+"pt";
 const trophyText=Object.entries(strongTrophies).filter(([type,count])=>STRONG_NAMES[type]&&Number(count)>0).map(([type,count])=>STRONG_NAMES[type]+"×"+Math.floor(Number(count))).join(" / ");
 $("den-inventory-help").textContent=(atDen()?"食べたい種類を選んでください。選択しなければ減りません。":"巣の外では閲覧のみ。食べるには巣へ戻ってください。")+(trophyText?" 希少素材："+trophyText:"");
 const canEat=atDen()&&(P.hunger<100||P.hp<P.maxHp||(P.strongWound||0)>0);
 for(const key of ["meat","berries","legacy"]){
  $("den-row-"+key).classList.toggle("hidden",key==="legacy"&&denStores.legacy<=0);
  $("den-qty-"+key).textContent=denStores[key]+"pt";
  $("den-eat-"+key).disabled=!canEat||denStores[key]<=0;
 }
}
function openDenInventory(){
 if(mode!=="play"||!P)return false;
 saveAuto();resetControls();mode="inventory";$("den-inventory").classList.remove("hidden");
 renderDenInventory();$("den-inventory-close").focus({preventScroll:true});return true;
}
function closeDenInventory(){
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
 if(denStash>=DEN_COSTS[2])return {step:3,text:"③ 巣で△長押ししてLV2に強化",label:"巣"};
 if(P.carry)return {step:2,text:"② 巣の中心へ戻り△で備蓄（短押し・長押し可）",label:"巣"};
 return {step:1,text:"① 食草・肉のそばで△長押しして運ぶ",label:"食草・肉"};
}
function missionInfo(){
 switch(mission){
  case 0:return {stage:"チュートリアル 1 / 4",title:"食草か肉を食べよう",detail:"近くの食草・肉を食べる / △・E",next:"身を隠せ",progress:Math.min(1,meals)};
  case 1:return {stage:"チュートリアル 2 / 4",title:"身を隠せ",detail:visibleShrubCover()?"茂みで静止して潜伏 / C":"建物・車の陰で静止して潜伏 / C",next:"獲物を仕留めろ",progress:Math.min(1,hiddenHold/.75)};
  case 2:return {stage:"チュートリアル 3 / 4",title:"獲物を仕留めろ",detail:"獲物に近づいて攻撃 / ×・J",next:"巣に食料を備蓄しよう",progress:Math.min(1,kills)};
  case 3:return {stage:"チュートリアル 4 / 4",title:"巣に食料を備蓄しよう",detail:"食草か肉を運んで巣に備蓄し、巣を強化する",next:"巣をLV2に強化",progress:denLevel>=2?1:Math.min(1,denStash/DEN_COSTS[2])};
  case 4:{
   const step=stockpileStep();
   return {stage:"チュートリアル 4 / 4・巣と備蓄",
    title:step.step===1?"食料をくわえて巣に持ち帰ろう":step.step===2?"食料を巣に預けよう":"備蓄で巣をLV2にしよう",
    detail:step.text+(step.step===1?"（約0.6秒）":"")+" / 備蓄 "+denStash+"/"+DEN_COSTS[2],
    next:step.step===3?"巣をLV2に強化":step.step===2?"巣で△短押し":"食料を運んで備蓄",
    progress:denLevel>=2?1:Math.min(1,denStash/DEN_COSTS[2])};
  }
  case 5:return {stage:"生存目標 2 / 3",title:"縄張りを1か所確保せよ",detail:"地図の縄張り標識で△長押し。周囲の敵に注意",next:"探索地点を2か所発見せよ",progress:Math.min(1,territoryOwned())};
  case 6:return {stage:"生存目標 3 / 3",title:"探索地点を2か所発見せよ",detail:"地図の未発見地点を訪れ、生存能力を得る",next:"生き残れ！",progress:Math.min(1,discoveredSites.length/2)};
  default:return {stage:"目標",title:"生き残れ！",detail:"",next:"",progress:0};
 }
}
// Two help pages only: the current mission, then an optional one-screen control reminder.
const GUIDE_GOALS=[
 {title:"食草か肉を食べる",what:"食草・肉の近くで△短押し。",how:"空腹が回復する。"},
 {title:"身を隠す",what:"春〜秋は茂み、冬は建物・車の陰で約1秒止まる。",how:"敵に見つかりにくくなる。"},
 {title:"獲物を狩る",what:"×で攻撃、□で飛びつき。",how:"死骸から肉を取れる。"},
 {title:"巣の作り方",what:"食草・肉で△長押しして運ぶ。",how:"巣の中心で△短押しして備蓄し、△長押しでLV2に強化。"},
 {title:"巣に食料を貯める",what:"食草・肉で△長押し → 巣で△。",how:"60ptで巣LV2。強化しても食料は減らない。"},
 {title:"縄張りを取る",what:"標識で△長押し。",how:"巣の安全性が上がる。"},
 {title:"探索地点を見つける",what:"未発見の地点を2か所訪れる。",how:"最後の目標へ進む。"},
 {title:"生き残れ！",what:"狩り・食事・休息を続け、生存日数を伸ばす。",how:"食料庫の備蓄も活用できる。"}
];
const TUTORIAL_PAGES=[
 null, // Page 1 always shows the CURRENT goal; not a long sequence of seven lessons.
 {stage:"操作早見表",title:"操作・食料の基本",what:"△ 食べる・運ぶ ／ × 攻撃 ／ □ 飛びつき ／ ○ ジャンプ",how:"巣で△：備蓄。手ぶらで△：食料庫。"}
];
let tutorialPage=0;const tutorialSeen=new Set();let guideNeedsFrame=false,milestoneUntil=0,previouslyOnboardedAtRunStart=false;
function renderTutorial(){
 const info=tutorialPage===0
  ?{stage:missionInfo().stage,...GUIDE_GOALS[clamp(mission,0,GUIDE_GOALS.length-1)]}
  :TUTORIAL_PAGES[tutorialPage];
 $("tutorial-stage").textContent=info.stage;
 $("tutorial-title").textContent=info.title;
 $("tutorial-what").textContent=info.what;
 $("tutorial-how").textContent=info.how;
 $("tutorial-progress-label").textContent=tutorialPage===0?"いまやること":"必要なときだけ確認";
 $("tutorial-counter").textContent=(tutorialPage+1)+" / "+TUTORIAL_PAGES.length;
 $("tutorial-prev").disabled=tutorialPage===0;
 $("tutorial-next").disabled=tutorialPage===TUTORIAL_PAGES.length-1;
}
function openTutorial(page=0,automatic=false){
 if(!P||!(mode==="play"||mode==="guide"))return false;
 // Survival objectives are HUD-only; completed lessons never auto-reopen.
 if(automatic&&(automaticTutorialShown||mission>=4||tutorialSeen.has(mission)))return false;
 tutorialPage=clamp(Math.floor(page),0,TUTORIAL_PAGES.length-1);
 if(automatic){tutorialSeen.add(mission);rememberTutorialShown();}
 if(mode==="play"){saveAuto();resetControls();mode="guide"}
 guideNeedsFrame=true; // Render the scene once behind the popup, then freeze its frame.
 $("app").classList.add("tutorial-paused");
 $("tutorial-dialog").classList.remove("hidden");$("objective-banner").classList.remove("visible");objectiveBannerTime=0;
 window.WildAudio?.update({weather,area:P?regionAt(P.x,P.y):0,danger:false,mode:"guide"});
 renderTutorial();$("tutorial-close").focus({preventScroll:true});return true;
}
function closeTutorial(){
 if(mode!=="guide")return;
 $("tutorial-dialog").classList.add("hidden");
 $("app").classList.remove("tutorial-paused");
 guideNeedsFrame=false;mode="play";objectiveBannerTime=0;resetControls();syncHUD();saveAuto();
 window.WildAudio?.update({weather,area:P?regionAt(P.x,P.y):0,danger:false,mode:"play"});
}
function tutorialMove(delta){
 if(mode!=="guide")return;
 tutorialPage=clamp(tutorialPage+delta,0,TUTORIAL_PAGES.length-1);renderTutorial();
}
function announceObjective(){
 if(!P)return;
 if(mission>=7){objectiveBannerTime=0;$("objective-banner").classList.remove("visible");return}
 if(mission<=6){
  objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
  if(mission<=3&&mode==="play"&&!tutorialSeen.has(mission))openTutorial(0,true);
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
 if(previouslyOnboardedAtRunStart)return false;
 if(!P||mode!=="play"||(next!==previous+1&&!(previous===2&&next===4))||previous<0||previous>6)return false;
 const finalTutorial=previous===6&&next===7;
 const duration=finalTutorial?1900:previous===3&&next===4?1000:780;
 $("mission-milestone-kicker").textContent=finalTutorial?"":previous<3?"NICE WORK":"SURVIVAL";
 $("mission-milestone-title").textContent=finalTutorial?"チュートリアル終了":"EXCELLENT!";
 const el=$("mission-milestone");
 el.style.setProperty("--milestone-duration",duration+"ms");
 el.classList.remove("hidden");el.classList.remove("show");void el.offsetWidth;el.classList.add("show");
 milestoneUntil=performance.now()+duration;
 resetControls();mode="milestone";guideNeedsFrame=true;
 objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
 window.WildAudio?.update({weather,area:P?regionAt(P.x,P.y):0,danger:false,mode:"milestone"});
 return true;
}
function finishMissionMilestone(){
 if(mode!=="milestone")return false;
 $("mission-milestone").classList.remove("show");$("mission-milestone").classList.add("hidden");
 milestoneUntil=0;mode="play";
 if(mission<=3&&!tutorialSeen.has(mission))openTutorial(0,true);
 else announceObjective();
 // Reveal the final survival HUD on the exact frame that the one-time notice ends.
 syncHUD();
 return true;
}
function advanceMission(next){
 const previous=mission;
 mission=next;
 if(next===7){missionComplete=true;tutorialSeen.add(7)}
 if(!showMissionMilestone(previous,next)&&next!==7)announceObjective();
 syncHUD();saveAuto();
}
function checkMission(){
 if(mission===0&&meals>=1){advanceMission(1);return}
 if(mission===1&&hiddenHold>=.75){advanceMission(2);return}
 if(mission===2&&kills>=1){advanceMission(4);return}
 if(mission===3){advanceMission(4);return}
 if(mission===4&&denLevel>=2){advanceMission(5);return}
 if(mission===5&&territoryOwned()>=1){advanceMission(6);return}
 if(mission===6&&discoveredSites.length>=2){advanceMission(7);return}
 // No recurring missions after the final survival goal.
}
function nearestGoal(list){
 if(!P||!list.length)return null;
 let bestItem=null,bestDist=Infinity;
 for(const q of list){const d=dist(P,q);if(d<bestDist){bestDist=d;bestItem=q}}
 return bestItem;
}
function objectiveShortLabel(){
 if(mission>=7)return "生き残れ！";
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
 if(!P||mission>=7||mode==="menu"||mode==="over"||mode==="clear")return null;
 if(mission===1){
  if(!visibleShrubCover()){
   const p=winterCoverSpot();
   return p?{x:p.x,y:p.y,label:"建物・車の陰で静止 / Cで潜伏"}:null;
  }
  const p=nearestGoal(plants.filter(p=>p.type===2));
  return p?{x:p.x,y:p.y,label:"茂みで静止 / Cで潜伏"}:null;
 }
 if(mission===3){const site=closestDen(P,true);return {x:site.x,y:site.y,label:"巣へ食料を備蓄する"};}
 if(mission===4){
  if(P.carry||denStash>=DEN_COSTS[2]){const site=closestDen(P,true);return {x:site.x,y:site.y,label:denStash>=DEN_COSTS[2]?"巣をLV2に強化":"巣に備蓄する"};}
  const food=nearestGoal(carcasses.filter(c=>c.ttl>0&&edibleFood(c)));
  if(food)return {x:food.x,y:food.y,label:foodName(food)+"を△長押しで運ぶ"};
  const prey=nearestGoal(mobs.filter(m=>m.hp>0&&species[m.type].prey));
  return prey?{x:prey.x,y:prey.y,label:"獲物を倒して食料を運ぶ"}:null;
 }
 if(mission===5){const post=nearestGoal(TERRITORY_POSTS.filter((site,i)=>!territoryClaims[i]));return post?{x:post.x,y:post.y,label:"縄張り標識で△長押し"}:null;}
 if(mission===6){const site=nearestGoal(EXPLORE_SITES.filter(site=>!discoveredSites.includes(site.id)));return site?{x:site.x,y:site.y,label:"未発見の探索地点"}:null;}
 const findFood=mission===0;
 if(findFood){
  const f=nearestGoal(carcasses.filter(q=>q.ttl>0&&edibleFood(q)));
  return f?{x:f.x,y:f.y,label:foodName(f)+"を食べる / △・E"}:null;
 }
 if(!huntTarget||huntTarget.hp<=0||!mobs.includes(huntTarget)||dist(P,huntTarget)>420)
  huntTarget=nearestGoal(mobs.filter(q=>q.hp>0&&species[q.type].prey));
 if(!huntTarget)return null;
 const lead=.22,px=clamp(huntTarget.x+(huntTarget.vx||0)*lead,35,WORLD.w-35);
 const py=clamp(huntTarget.y+(huntTarget.vy||0)*lead,35,WORLD.h-35);
 const safe=!collides(px,py,P.r+5);
 return {x:safe?px:huntTarget.x,y:safe?py:huntTarget.y,label:"獲物を追う / ×・Jで攻撃"};
}
function finish(won=false){
 if(!P)return;
 clearAutoSave();
 resetControls();mode=won?"clear":"over";
 totalScore=Math.floor(elapsed*4+kills*88+(P.level-1)*110+(day-1)*170);
 if(totalScore>best){best=totalScore;try{localStorage.setItem("wild-reclaim-best",String(best))}catch(e){}}
 $("result-kicker").textContent=won?"TOKYO RECLAIMED":"SURVIVAL REPORT";
 $("result-title").textContent=won?"生き延びた！":"死んでしまった";
 $("result-title").style.color=won?"#a1edbe":"#f5ede0";
 $("result-reason").textContent=won?"生存記録を残しました。":"命を落としました。リトライか、最初から始めるかを選んでください。";
 $("retry-btn").textContent=getCheckpoints().some(s=>s.player.type===P.type)?"リトライ（同じ動物のチェックポイント）":"リトライ（同じ動物）";
 $("result-score").textContent=String(totalScore).padStart(6,"0");
 $("result-stats").innerHTML="<span>DAY "+String(day).padStart(2,"0")+"</span><span>HUNT "+String(kills).padStart(2,"0")+"</span><span>LEVEL "+String(P.level).padStart(2,"0")+"</span>";
 $("best-score").textContent="BEST SCORE "+String(best).padStart(6,"0");
 show("result");playEffect(won?"level":"death");
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
 if(m.feintCooldown>0||m.stun>0||m.hp<=0||m.flee<=0||(m.fleeEnergy||0)<.28)return false;
 const hunter=nearbyVisibleWildPredator(m,150);
 const playerThreat=!!P&&spotted&&d<160&&!lineBlocked(m,P);
 if(!hunter&&!playerThreat)return false;
 const urgent=playerThreat&&(P.pendingStrike||P.pounceTime>0||P.jumpTime>0);
 const chance=urgent?.57:Math.min(1,dt*(m.type==="rabbit"?1.65:m.type==="pigeon"?1.2:1.4));
 if(Math.random()>=chance)return false;
 m.feintCooldown=3.1+rnd(0,1.4);
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
function tryEnemyEmergencyEvade(m,sp,d,spotted){
 if(sp.prey||!spotted||!P||!P.pendingStrike||P.ambushStrike||m.hp<=0||
    m.stun>0||m.windup>0||m.chargeTime>0||(m.evadeTime||0)>0||(m.evadeCooldown||0)>0)return false;
 const range=P.pounceTime>0?210:Math.min(155,P.r+m.r+111);
 if(d>range||lineBlocked(m,P)||Math.cos(Math.atan2(m.y-P.y,m.x-P.x)-P.dir)<.38)return false;
 m.evadeCooldown=1.1; // Even a failed reaction cannot retry every frame.
 if(Math.random()>=(m.type==="albinoWolf"?.79:m.type==="alpha"?.62:m.type==="dog"?.52:.38))return false;
 const away=Math.atan2(m.y-P.y,m.x-P.x),side=m.evasionSide||1;
 const travel=m.type==="boar"?58:m.type==="alpha"?74:m.type==="albinoWolf"?98:67;
 for(const offset of [side*1.26,-side*1.26,side*.75,-side*.75]){
  const angle=away+offset,goal={x:m.x+Math.cos(angle)*travel,y:m.y+Math.sin(angle)*travel};
  if(collides(goal.x,goal.y,m.r+3)||!routeClear(m,goal,m.r+3))continue;
  m.evadeAngle=angle;m.evadeTime=.29;m.evadeDuration=.29;
  m.evadeRemaining=travel;m.evadeSpeed=travel/.29;
  m.evadeCooldown=(m.type==="albinoWolf"?2.6:3.5)+rnd(0,1.2);m.evasionSide=-side;
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
 if((m.type!=="dog"&&m.type!=="alpha"&&m.type!=="blackPanther"&&m.type!=="oneEyedWolf"&&m.type!=="whiteTiger"&&m.type!=="albinoWolf")||distance<115||distance>235||(prey.flee||0)<=0)return direct;
 const speed=Math.hypot(prey.vx||0,prey.vy||0);
 const heading=speed>38?Math.atan2(prey.vy,prey.vx):prey.dir;
 if(!Number.isFinite(heading))return direct;
 const lead=clamp(distance/(sp.speed+100),.18,.45);
 const forward=clamp(speed*lead,25,65),sideOffset=clamp(distance*.27,35,58);
 const preferred=m.flankSide||1;
 for(const side of [preferred,-preferred]){
  const x=clamp(prey.x+Math.cos(heading)*forward-Math.sin(heading)*side*sideOffset,35,WORLD.w-35);
  const y=clamp(prey.y+Math.sin(heading)*forward+Math.cos(heading)*side*sideOffset,35,WORLD.h-35);
  if(!collides(x,y,m.r+5)&&routeClear(m,{x,y},m.r+5))return {x,y};
 }
 return direct;
}
/* WILD-PREDATOR-CHAIN-V1: Strong predators share real prey, escape, collision and corpse ecology.
 * Giant boars remain grazers. A wild kill never grants player DNA or trophies. */
const WILD_PREDATOR_TYPES=new Set(["giantLizard","dog","alpha","giantSnake","oldBear","blackPanther","oneEyedWolf","whiteTiger","giantHyena","giantLion","giantCrocodile","giantHippo","giantAnaconda","albinoWolf","giantEagle"]);
function isWildPredator(m){return !!m&&m.hp>0&&WILD_PREDATOR_TYPES.has(m.type);}
function nearbyVisibleWildPredator(m,range=165){
 let nearest=null,best=range;
 for(const q of mobs){if(q===m||!isWildPredator(q))continue;const d=dist(m,q);if(d<best&&!lineBlocked(m,q)){nearest=q;best=d;}}
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
    (m.evadeTime||0)>0||playerDistance<=140)return null;
 const maxRange=m.type==="albinoWolf"?335:m.type==="giantLizard"?285:m.type==="giantLion"?345:m.type==="blackPanther"?320:m.type==="oneEyedWolf"?315:m.type==="whiteTiger"?335:m.type==="giantHyena"?355:m.type==="giantSnake"?215:m.type==="oldBear"?255:250;
 let prey=null,best=maxRange;
 for(const q of mobs){
  if(q===m||q.hp<=0||!(species[q.type]?.prey||(q.type==="boar"&&m.type!=="giantSnake")))continue;
  const distance=dist(m,q);
  if(distance<best&&!lineBlocked(m,q)){best=distance;prey=q;}
 }
 if(!prey)return null;
 const intercept=wildPreyInterceptPoint(m,prey,sp,best);
 m.dir=steerPursuit(m,intercept.x,intercept.y);
 m.wildTargetX=prey.x;m.wildTargetY=prey.y;
 if(best<m.r+prey.r+20&&(m.wildAttack||0)<=0&&!lineBlocked(m,prey)){
  m.wildAttack=m.type==="albinoWolf"?1.38:m.type==="blackPanther"?1.35:m.type==="whiteTiger"?1.4:m.type==="giantLion"?1.55:m.type==="giantHyena"?1.2:m.type==="oneEyedWolf"?1.65:m.type==="giantSnake"?2.1:m.type==="oldBear"?2.0:m.type==="giantLizard"?1.45:m.type==="dog"?1.6:1.8;
  const bite=m.type==="dog"?Math.max(2,Math.round(sp.damage*.22)):
   m.type==="alpha"?Math.max(5,Math.round(sp.damage*.45)):
   Math.max(6,Math.round(sp.damage*(m.type==="albinoWolf"?.42:m.type==="oldBear"?.32:m.type==="giantSnake"?.35:.38)));
  prey.hp=Math.max(0,prey.hp-bite);
  prey.flash=Math.max(prey.flash||0,.18);m.swing=Math.max(m.swing||0,.18);
  if(prey.hp>0){
   if(!startlePrey(prey,m,"hit")){prey.flee=1.8;prey.dir=Math.atan2(prey.y-m.y,prey.x-m.x);}
  }else{
   carcasses.push(animalRemains(prey));
   m.feedAfterKill=8;m.scavengeNeed=Math.max(.82,Number(m.scavengeNeed)||0);
   if(species[prey.type].prey){
    const zone=regionAt(prey.x,prey.y);
    ecology[zone].prey=Math.max(4,ecology[zone].prey-1);
   }
  }
  if(P&&dist(P,m)<380)label(prey.x,prey.y-prey.r-20,prey.hp>0?"野生の狩り -"+bite:"野生の狩り","#eac6a1");
 }
 return {vx:Math.cos(m.dir)*sp.speed*(m.type==="albinoWolf"?.99:m.type==="blackPanther"?.92:m.type==="whiteTiger"?.95:m.type==="giantLion"?.90:m.type==="giantHyena"?.98:m.type==="oneEyedWolf"?.91:m.type==="giantSnake"?.76:.75),
         vy:Math.sin(m.dir)*sp.speed*(m.type==="albinoWolf"?.99:m.type==="blackPanther"?.92:m.type==="whiteTiger"?.95:m.type==="giantLion"?.90:m.type==="giantHyena"?.98:m.type==="oneEyedWolf"?.91:m.type==="giantSnake"?.76:.75)};
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
function steerPursuit(m,tx,ty){
 const goal={x:tx,y:ty},desired=Math.atan2(ty-m.y,tx-m.x),distance=dist(m,goal);
 const look=clamp(distance*.45,42,94);
 if(routeClear(m,goal,m.r)){m.navPath=null;return desired}
 const bridge=wildlifeBridgeWaypoint(m,goal);
 if(bridge){m.navPath=null;return Math.atan2(bridge.y-m.y,bridge.x-m.x)}
 const stale=!m.navGoal||dist(m.navGoal,goal)>70;
 if((stale||!m.navPath||m.navIndex>=m.navPath.length)&&elapsed>=(m.navRetry||0)&&navPlansThisFrame<2){
   navPlansThisFrame++;
  m.navPath=routeTo(goal,m);m.navGoal={x:tx,y:ty};m.navIndex=0;
  m.navRetry=elapsed+1.05;
 }
 if(m.navPath&&m.navPath.length){
  while(m.navIndex<m.navPath.length-1&&dist(m,m.navPath[m.navIndex])<30)m.navIndex++;
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
const WEATHER_NAMES={CLEAR:"晴れ",CLOUDY:"曇り",RAIN:"雨",THUNDER:"雷雨",FOG:"霧",WIND:"強風"};
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
function maintainLocalWildlife(){
 if(!P)return;
 const hunting=mission===2||mission>=7;
 const preyNearby=mobs.some(m=>m.hp>0&&species[m.type].prey&&dist(P,m)<WILDLIFE.preyNeedRadius);
 const local=mobs.filter(m=>m.hp>0&&dist(P,m)<WILDLIFE.localRadius).length;
 const target=(weather==="RAIN"||weather==="THUNDER")?WILDLIFE.localTargetRain:WILDLIFE.localTargetClear;
 if(mobs.length<WILDLIFE.cap){
  if(hunting&&!preyNearby)spawnMob(false,true,true);
  else if(local<target)spawnMob(false,false,true);
 }
 if(carcasses.filter(c=>c.type==="berries").length<14)spawnFood();
}
function updateWeather(dt){
 const target=debugWeatherOverride||tokyoWeatherAt(elapsed);
 if(weather!==target){
  const previous=weather;weather=target;windDirection=rnd(0,TWO);
  if(weather==="THUNDER")thunderTimer=rnd(5,11);
  if(weather==="THUNDER"&&previous!=="RAIN")notify("遠雷と雨雲が近づいている");
  else if(weather==="RAIN"&&previous!=="THUNDER")notify("天候変化：雨");
  else notify("天候変化："+WEATHER_NAMES[weather]);
 }
 // Legacy save fields remain for compatibility, but no longer drive rain odds.
 weatherTimer=85-(elapsed%85);nextWeather=null;
 thunderFlash=Math.max(0,thunderFlash-dt*2.6);
 if(weather==="THUNDER"){
  thunderTimer-=dt;
  if(thunderTimer<=0){
   thunderFlash=.8+rnd(0,.2);thunderTimer=rnd(5,13);
   shake=Math.max(shake,1.4);playEffect("thunder",{volume:.65});
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
  (m.type==="rabbit"||m.type==="pigeon")&&inCover(m);
 const safeRest=(indoors&&rainy)||naturalNightCover;
 const hunterAnimal=sp.prey?nearbyVisibleWildPredator(m,155):null;
 const hunter=!!hunterAnimal;
 // Awake prey also reacts immediately to a nearby visible wild predator.
 if(sp.prey&&hunterAnimal&&m.restTime<=0&&m.flee<=0)startlePrey(m,hunterAnimal,"alarm");
 const danger=spotted||m.alert>0||m.flee>0||m.stun>0||m.windup>0||
  m.chargeTime>0||(m.evadeTime||0)>0||hunter||
  (d<115&&!lineBlocked(m,P));
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
function update(dt){
 if(objectiveBannerTime<0)announceObjective();
 navPlansThisFrame=0;
 for(let i=pounceStreaks.length-1;i>=0;i--){pounceStreaks[i].life-=dt;if(pounceStreaks[i].life<=0)pounceStreaks.splice(i,1)}
 elapsed+=dt;day=1+Math.floor(elapsed/85);simulateEcology(dt);
 const phase=elapsed%85;const hr=(6+Math.floor(phase/85*24))%24;
 updateWeather(dt);
 updateBirdFlocks(dt);
 for(const site of EXPLORE_SITES)if(!discoveredSites.includes(site.id)&&dist(P,site)<125){
  discoveredSites.push(site.id);
  awardDiscovery(site.id);
  ecologyNews=site.name+"で新しい知識を獲得";
  label(P.x,P.y-38,"探索 "+discoveredSites.length+"/"+EXPLORE_SITES.length,"#d6e9b3");
  saveAuto();
 }
 const oldDay=day; // accounted above
 if(Math.floor((elapsed-dt)/85)<Math.floor(elapsed/85)){notify("DAY "+String(day).padStart(2,"0")+" / 野生はさらに凶暴になる");P.hp=Math.min(P.maxHp,P.hp+18)}
 P.jumpCD=Math.max(0,P.jumpCD-dt);P.wallKickLock=Math.max(0,(P.wallKickLock||0)-dt);P.wallKickTime=Math.max(0,(P.wallKickTime||0)-dt);
 if(P.fallTime>0&&P.jumpTime<=0&&P.pounceTime<=0){
  P.fallTime=Math.max(0,P.fallTime-dt);
  const part=P.fallTime/.30;
  P.jumpHeight=(P.groundZ||0)+(P.fallFromZ-(P.groundZ||0))*part*part;
  if(P.fallTime===0&&P.pendingStrike&&P.jumpDive)resolveAttack();
 }
 
  P.atk=Math.max(0,P.atk-dt);P.dash=Math.max(0,P.dash-dt);P.dashTime=Math.max(0,P.dashTime-dt);P.inv=Math.max(0,P.inv-dt);P.revealTimer=Math.max(0,P.revealTimer-dt);P.instinctCD=Math.max(0,P.instinctCD-dt);P.abilityTime=Math.max(0,P.abilityTime-dt);P.swing=Math.max(0,(P.swing||0)-dt);P.comboTimer=Math.max(0,P.comboTimer-dt);P.rushWindow=Math.max(0,P.rushWindow-dt);if(P.pendingStrike){P.windup=Math.max(0,P.windup-dt);if(P.windup===0&&P.jumpTime<=0&&P.pounceTime<=0&&P.fallTime<=0)resolveAttack()}
 if(P.rushQueued&&P.atk<=0&&!P.pendingStrike){if(P.rushWindow>0&&P.rushStep<5)attack();else P.rushQueued=false;}
 P.sp=clamp(P.sp+((weather==="THUNDER"&&!insideShelter(P)?10:weather==="WIND"?13:17)+(P.riverPerk?3:0))*dt,0,100);P.tiredNotice=Math.max(0,(P.tiredNotice||0)-dt);P.hunger=clamp(P.hunger-(.38+(day-1)*.035)*dt*(P.foragePerk?.80:1),0,100);
 if(P.hunger<16)P.hp-=(P.hunger===0?7:1.2)*dt;
 if(atDen()&&!mobs.some(m=>m.hp>0&&!species[m.type].prey&&dist(P,m)<165))
  P.hp=Math.min(P.maxHp,P.hp+denRestRate()*dt);
 const a=getAxes(),sneaking=keys.has("c")||keys.has("control");
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
   P.vx=0;P.vy=0;move(P,P.dx*P.speed*(P.type==="cat"?4.35:P.type==="wolf"?3.05:3.8)*dt,P.dy*P.speed*(P.type==="cat"?4.35:P.type==="wolf"?3.05:3.8)*dt);
   if(Math.random()<.7)blood(P.x,P.y,"#d5e4bb",1,25);
  }else{
   const foxTurbo=P.type==="fox"&&P.abilityTime>0&&!sneaking;
   const boost=foxTurbo?2.32+Math.min(.72,(P.level-1)*.09):P.type==="cat"&&P.abilityTime>0?1.52:1;
   const traction=(weather==="RAIN"||weather==="THUNDER")&&!insideShelter(P)?(P.rainGrip?.98:.89):weather==="WIND"?.96:1;
   const target=P.speed*(sneaking?.34:1)*(P.pendingStrike?.7:1)*boost*traction*(P.strongSlow>0?.54:1);
   applyDirectionalInput(P,a,target,dt,foxTurbo);
   const oldX=P.x,oldY=P.y;move(P,P.vx*dt,P.vy*dt);
   if(P.x===oldX)P.vx=0;if(P.y===oldY)P.vy=0;
   const speed=Math.hypot(P.vx,P.vy);
   if(speed>8){
    P.steps+=speed*dt*.052;
    if(P.type==="fox"&&P.abilityTime>0&&speed>360&&Math.random()<dt*24)blood(P.x,P.y,"#d9c99d",2,18);
   }
  }
  const speed=Math.hypot(P.vx,P.vy);
  footstepTimer=Math.max(0,footstepTimer-dt);
  if(speed>70&&!P.jumpTime&&!P.pounceTime&&!P.fallTime&&footstepTimer<=0){
   footstepTimer=P.type==="wolf"?.39:P.type==="cat"?.27:.34;
   playEffect(roadsX.some(x=>Math.abs(P.x-x)<78)||roadsY.some(y=>Math.abs(P.y-y)<78)?"stepHard":"step",{volume:.045});
  }
  P.noiseBurst=Math.max(0,P.noiseBurst-dt*1.6);
  P.noise=clamp(speed/P.speed*(sneaking?.28:.94)+P.noiseBurst,0,1.8);
  P.hidden=(P.jumpHeight||0)<20&&P.revealTimer<=0&&inCover(P)&&(sneaking||speed<P.speed*.45)&&P.dashTime<=0&&P.jumpTime<=0&&P.pounceTime<=0&&P.fallTime<=0;hiddenHold=P.hidden?hiddenHold+dt:Math.max(0,hiddenHold-dt*.6);
  if((keys.has("j")||keys.has(" "))&&P.atk<=0)attack();
 
 if((P.strongWound||0)>0){
  const bleed=Math.min(dt,P.strongWound);
  P.hp-=bleed*2.6;
  const safeDen=atDen()&&!mobs.some(m=>m.hp>0&&!species[m.type].prey&&dist(P,m)<165);
  P.strongWound=Math.max(0,P.strongWound-dt*(safeDen?2.2:1));
 }
 P.eatCD=Math.max(0,(P.eatCD||0)-dt);P.strongSlow=Math.max(0,(P.strongSlow||0)-dt);
  if(strongRegionCurrent!==regionAt(P.x,P.y))enterStrongStage();
 if(P.hp<=0){P.hp=0;finish(false);return}
 const chaseRange=weather==="FOG"?195:260;
 for(const m of mobs){
  if(m.hp<=0)continue;
  const s=species[m.type];m.staggerGuard=Math.max(0,(m.staggerGuard||0)-dt);m.wander-=dt;m.attack=Math.max(0,m.attack-dt);m.swing=Math.max(0,(m.swing||0)-dt);m.flash=Math.max(0,m.flash-dt);m.stun=Math.max(0,m.stun-dt);m.escapeTimer=Math.max(0,m.escapeTimer-dt);m.evadeCooldown=Math.max(0,(m.evadeCooldown||0)-dt);if(s.prey)m.fleeEnergy=clamp(m.fleeEnergy+(m.flee>0?-dt*.32:dt*.2),0,1);
  const d=dist(P,m);
  if(m.type==="giantGorilla")updateGorillaRock(m,dt);
  if(d>WILDLIFE.farAI){m.vx=0;m.vy=0;m.evadeHeight=0;continue;}
  if(m.type==="giantEagle"){updateFlyingEagle(m,dt);continue;}
  if(isAquaticStrong(m)){updateAquaticStrong(m,s,dt);continue;}
  const angle=Math.atan2(P.y-m.y,P.x-m.x),spotted=detectsPlayer(m,s,d);
    if(territoryDetersDog(m)){m.flee=Math.max(m.flee,1.25);m.dir=Math.atan2(m.y-P.y,m.x-P.x);m.alert=0;m.search=0;}
   if(spotted){m.lastX=P.x;m.lastY=P.y;m.alert=s.prey?1.8:5.5;m.search=0}
   if(updateIndoorRest(m,s,dt,spotted,d))continue;
   let vx=0,vy=0;
   if(!s.prey)tryEnemyEmergencyEvade(m,s,d,spotted);
   if((m.evadeTime||0)>0){advanceEnemyEvade(m,dt);continue;}
   if(s.prey&&spotted&&(d<135||P.noise>.65&&d<185||m.hp<m.maxHp)){
     m.flee=Math.max(m.flee,1.7);
     if(m.escapeTimer<=0||!clearStep(m,m.dir,65)){
       m.evasionSide=-(m.evasionSide||1);
       m.dir=chooseEscape(m,angle+Math.PI);m.escapeTimer=m.type==="rat"?.23:m.type==="pigeon"?.32:.64;
     }
    }
   if(m.flee>0){
    if((s.prey||m.type==="boar")&&!spotted&&(m.escapeTimer<=0||!clearStep(m,m.dir,56))){
      m.evasionSide=-(m.evasionSide||1);
      const hunter=nearbyVisibleWildPredator(m,175);
      const threat=hunter||(Number.isFinite(m.fleeThreatX)&&Number.isFinite(m.fleeThreatY)?{x:m.fleeThreatX,y:m.fleeThreatY}:P);
      if(hunter){m.fleeThreatX=hunter.x;m.fleeThreatY=hunter.y;}
      m.dir=chooseEscape(m,Math.atan2(m.y-threat.y,m.x-threat.x),threat);
      m.escapeTimer=m.type==="rat"?.23:m.type==="pigeon"?.32:.64;
    }
    m.flee=Math.max(0,m.flee-dt);const burst=s.prey?(m.type==="rabbit"?.83+1.02*m.fleeEnergy:m.type==="pigeon"?.85+.87*m.fleeEnergy:.84+.57*m.fleeEnergy):1.3;vx=Math.cos(m.dir)*s.speed*burst;vy=Math.sin(m.dir)*s.speed*burst;
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
      if((m.type==="dog"||m.type==="oneEyedWolf"||m.type==="albinoWolf")&&spotted&&d>120&&d<375){
       const heading=Math.hypot(P.vx,P.vy)>50?Math.atan2(P.vy,P.vx):P.dir,side=m.flankSide||1;
       const flankBack=m.type==="oneEyedWolf"?76:m.type==="albinoWolf"?95:48,flankSide=m.type==="oneEyedWolf"?125:m.type==="albinoWolf"?150:82;
       const fx=P.x-Math.cos(heading)*flankBack-Math.sin(heading)*side*flankSide;
       const fy=P.y-Math.sin(heading)*flankBack+Math.cos(heading)*side*flankSide;
       if(!collides(fx,fy,m.r+5)){targetX=fx;targetY=fy}
      }
      m.dir=steerPursuit(m,targetX,targetY);const chaseBoost=m.type==="giantHyena"?1.13:m.type==="giantLizard"&&d<215?1.17:m.type==="albinoWolf"?1.09:1;vx=Math.cos(m.dir)*s.speed*chaseBoost;vy=Math.sin(m.dir)*s.speed*chaseBoost;
      if((m.type==="dog"||m.type==="alpha"||m.type==="oneEyedWolf"||m.type==="albinoWolf")&&spotted&&d>75&&d<235&&m.attack>.22){
       const around=m.dir+(m.flankSide||1)*1.08;
       if(clearStep(m,around,40)){m.dir=around;vx=Math.cos(around)*s.speed*.88;vy=Math.sin(around)*s.speed*.88;}
      }
     }
   }else{
    m.alert=Math.max(0,m.alert-dt);
    if(m.wander<0){m.dir+=rnd(-2.5,2.5);m.wander=rnd(.5,2.5)}
    vx=Math.cos(m.dir)*s.speed*.23;vy=Math.sin(m.dir)*s.speed*.23;
   }
   m.wildAttack=Math.max(0,(m.wildAttack||0)-dt);
   m.feedAfterKill=Math.max(0,(m.feedAfterKill||0)-dt);
   if((s.prey||m.type==="boar")&&!spotted){
    const hunter=nearbyVisibleWildPredator(m,140);
    if(hunter){
     m.fleeThreatX=hunter.x;m.fleeThreatY=hunter.y;
     m.dir=chooseEscape(m,Math.atan2(m.y-hunter.y,m.x-hunter.x),hunter);
     m.flee=Math.max(m.flee,1);
     vx=Math.cos(m.dir)*s.speed*1.15;vy=Math.sin(m.dir)*s.speed*1.15;
    }
   }
   if(s.prey&&tryPreyFeint(m,s,d,spotted,dt))continue;
   defendBuffaloHerd(m);
   const wildHunt=huntWildPrey(m,s,spotted,d);
   if(wildHunt){vx=wildHunt.vx;vy=wildHunt.vy;}
   const scavenging=!wildHunt&&!s.prey&&m.type!=="boar"&&m.type!=="giantBoar"&&m.type!=="giantMoose"&&m.type!=="giantBuffalo"&&m.type!=="rhino"&&m.type!=="giantGorilla"&&m.type!=="giantElephant"?scavengeWildFood(m,s,dt,spotted,d):null;
   const foraging=(s.prey||m.type==="boar"||m.type==="giantBoar"||m.type==="giantMoose"||m.type==="giantBuffalo"||m.type==="rhino"||m.type==="giantGorilla"||m.type==="giantElephant")?forageWildBerries(m,s,dt,spotted,d):null;
   const drinking=!wildHunt&&!scavenging&&!foraging?drinkWildWater(m,s,dt,spotted,d):null;
   if(scavenging||foraging||drinking){
    const feeding=scavenging||foraging||drinking;
    vx=feeding.vx;vy=feeding.vy;
    m.wander=Math.max(m.wander,.25);
   }
   // Day-active prey travels to nearby real cover before sleeping at night.
   if(!scavenging&&!foraging&&!drinking&&!spotted&&m.alert<=0&&m.flee<=0&&
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
     if((m.type==="boar"||m.type==="alpha"||m.type==="giantBoar"||m.type==="blackPanther"||m.type==="oneEyedWolf"||m.type==="whiteTiger"||m.type==="giantMoose"||m.type==="giantBuffalo"||m.type==="rhino"||m.type==="albinoWolf")&&m.stun<=0){
      m.chargeTime=m.type==="alpha"?.24:m.type==="blackPanther"?.31:m.type==="oneEyedWolf"?.28:m.type==="whiteTiger"?.39:m.type==="giantBoar"?.45:m.type==="giantMoose"?.46:m.type==="giantBuffalo"?.53:m.type==="rhino"?.57:m.type==="albinoWolf"?.33:.36;m.chargeDir=m.strikeDir;m.chargeHit=false;
      label(m.x,m.y-m.r-24,(m.type==="alpha"||m.type==="blackPanther"||m.type==="whiteTiger"||m.type==="oneEyedWolf")?"飛びかかり！":"突進！","#ffbf81");
     }else{
      const reach=m.type==="giantElephant"?P.r+m.r+79:P.r+m.r+37,aim=Math.atan2(P.y-m.y,P.x-m.x);
      const delta=Math.atan2(Math.sin(aim-m.strikeDir),Math.cos(aim-m.strikeDir));
      if(m.type==="giantGorilla"&&m.stun<=0&&dist(P,m)>P.r+m.r+37){
       const dir=m.strikeDir,rx=m.x+Math.cos(dir)*m.r*.9,ry=m.y+Math.sin(dir)*m.r*.9;
       m.rock={x:rx,y:ry,vx:Math.cos(dir)*540,vy:Math.sin(dir)*540,ttl:.52};label(m.x,m.y-m.r-35,"投石！","#f1d5b6");
      }else if(m.stun<=0&&P.inv<=0&&(P.jumpHeight||0)<22&&dist(P,m)<reach&&Math.abs(delta)<.92&&!lineBlocked(m,P)){
       const damage=(P.lastCombatAt=elapsed,Math.round(s.damage*(STRONG_ATTACK_PROFILES[m.type]?.damage||1)*(1+Math.max(0,day-1)*.15)));
       {P.hp-=damage;interruptRush();P.inv=.42;shake=9;flash=.23;
       label(P.x,P.y-35,"-"+damage,"#ff9890");
       blood(P.x,P.y,"#eb6356",12,125);playEffect("damage");applyStrongStrikeEffect(m,aim,false);
       if(m.type==="giantLion"){if(m.lionCombo){m.lionCombo=0;}else{m.lionCombo=1;m.windup=.48;m.windupTotal=.48;m.strikeDir=aim;label(m.x,m.y-m.r-24,"連撃！","#ffc589");}}}
      }else if(dist(P,m)<reach+50){m.stun=Math.max(m.stun,.24);label(m.x,m.y-m.r-16,"空振りの隙！","#a6f5d8");}
     }
    }
   }
   // A missed, blocked or interrupted lion follow-up ends the combo; no stale save state.
   if(m.type==="giantLion"&&m.lionCombo&&m.windup<=0)m.lionCombo=0;
   const charging=!s.prey&&m.chargeTime>0&&m.stun<=0;
   const chargeSpeed=m.type==="alpha"?2.3:m.type==="blackPanther"?2.85:m.type==="oneEyedWolf"?2.65:m.type==="whiteTiger"?3.05:m.type==="giantBoar"?3.25:m.type==="giantMoose"?2.85:m.type==="giantBuffalo"?3.15:m.type==="albinoWolf"?2.85:3.65;
   if(charging){
    m.chargeTime=Math.max(0,m.chargeTime-dt);
    m.dir=m.chargeDir;vx=Math.cos(m.chargeDir)*s.speed*chargeSpeed;vy=Math.sin(m.chargeDir)*s.speed*chargeSpeed;
   }
   if(m.stun>0){vx=0;vy=0;m.chargeTime=0}
   const ox=m.x,oy=m.y;move(m,vx*dt,vy*dt);m.vx=(m.x-ox)/Math.max(.001,dt);m.vy=(m.y-oy)/Math.max(.001,dt);m.step+=Math.hypot(m.x-ox,m.y-oy)*.05;
   if(charging){
    const ddx=m.x-ox,ddy=m.y-oy,denom=ddx*ddx+ddy*ddy;
    const t=denom>0?clamp(((P.x-ox)*ddx+(P.y-oy)*ddy)/denom,0,1):0;
    if(!m.chargeHit&&(P.jumpHeight||0)<22&&Math.hypot(P.x-ox-t*ddx,P.y-oy-t*ddy)<P.r+m.r+4&&!lineBlocked(m,P)){
     m.chargeHit=true;m.chargeTime=0;
     if(P.inv<=0){
      const damage=(P.lastCombatAt=elapsed,Math.round(s.damage*(STRONG_ATTACK_PROFILES[m.type]?.damage||1)*(1+Math.max(0,day-1)*.15)));
      if(damage===0){P.inv=.12;shake=3;flash=0;}
       else{P.hp-=damage;interruptRush();P.inv=.52;shake=11;flash=.27;
      label(P.x,P.y-35,"突進 -"+damage,"#ff9890");
      blood(P.x,P.y,"#eb6356",15,150);playEffect("damage");applyStrongStrikeEffect(m,m.chargeDir,true);}
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
    m.windupTotal=STRONG_ATTACK_PROFILES[m.type]?.windup??(m.type==="boar"?.68:m.type==="alpha"?.60:.45);
    m.windup=m.windupTotal;P.lastCombatAt=elapsed;m.strikeDir=angle;m.attack=STRONG_ATTACK_PROFILES[m.type]?.cooldown??(m.type==="boar"?1.32:m.type==="alpha"?1.42:.98);
    m.dir=angle;label(m.x,m.y-m.r-24,STRONG_ATTACK_PROFILES[m.type]?.tell??(m.type==="boar"?"突進予兆！":m.type==="alpha"?"跳躍予兆！":"危険！"),"#ffb76d");
    playEffect("snarl");
   }
 }
 for(let i=mobs.length-1;i>=0;i--)if(mobs[i].hp<=0)mobs.splice(i,1); // Only dead animals are removed.
 for(let i=carcasses.length-1;i>=0;i--)if((carcasses[i].ttl-=dt)<=0){if(carcasses[i].type==="corpse")toBones(carcasses[i]);else carcasses.splice(i,1)}
 for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.life-=dt;q.x+=(q.vx||0)*dt;q.y+=(q.vy||0)*dt;if(q.life<=0)particles.splice(i,1)}
 for(let i=popups.length-1;i>=0;i--){popups[i].life-=dt;popups[i].y-=28*dt;if(popups[i].life<=0)popups.splice(i,1)}
 spawnTimer+=dt;
 if(spawnTimer>3.6){spawnTimer=0;maintainLocalWildlife();enterStrongStage();}
 territorySupply();checkMission();shake*=Math.max(0,1-dt*9);flash=Math.max(0,flash-dt);
 if(toastTime>0){toastTime-=dt;if(toastTime<=0)$("toast").classList.remove("show")}

 cam.x+=(clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw))-cam.x)*Math.min(1,dt*(P.type==="fox"&&P.abilityTime>0?11:6));
 cam.y+=(clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh))-cam.y)*Math.min(1,dt*(P.type==="fox"&&P.abilityTime>0?11:6));
 audioTick+=dt;
 if(audioTick>.35){
  audioTick=0;
  window.WildAudio?.update({weather,area:regionAt(P.x,P.y),mode:"play",...waterSoundAt(P.x,P.y),
   danger:mobs.some(m=>m.hp>0&&!species[m.type].prey&&dist(P,m)<290)});
 }
 uiTimer+=dt;if(uiTimer>.14){uiTimer=0;syncHUD(hr);drawMini()}
 autosaveClock+=dt;if(autosaveClock>=1){autosaveClock=0;saveAuto();}
}
function syncHUD(hour){
 if(!P)return;
 const setBar=(name,v)=>$(name).style.width=clamp(v,0,100)+"%";
 setBar("hp-bar",P.hp/P.maxHp*100);setBar("food-bar",P.hunger);setBar("sp-bar",P.sp);
 $("hp-text").textContent=Math.ceil(P.hp)+" / "+P.maxHp+(P.strongWound>0?"｜出血 "+Math.ceil(P.strongWound)+"秒":"");
 $("food-text").textContent=Math.ceil(P.hunger)+"%";$("sp-text").textContent=Math.ceil(P.sp)+"%";
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
 $("day-label").textContent="DAY "+String(day).padStart(2,"0")+" · "+String(hour===undefined?6:hour).padStart(2,"0")+":00 "+(hour===undefined||hour<5||hour>=19?"夜":hour<9?"朝":hour<17?"昼":"夕")+" · "+WEATHER_NAMES[weather];
 const moon=moonlightProfile(elapsed,weather);
 $("moon-label").textContent="月齢 "+moon.age.toFixed(1)+" · "+moon.name;
 const info=missionInfo();
 const stock=stockpileStep();
 const carryGuide=P.carry?(atDen()?"巣の中：△で"+foodName(P.carry)+"を備蓄":"運搬中 "+foodName(P.carry)+"：△短押し 食べる／長押し 置く／巣で備蓄"):null;
 $("stockpile-guide").classList.toggle("hidden",(!stock&&!carryGuide)||mode!=="play");
 if(carryGuide||stock)$("stockpile-guide").textContent=carryGuide||(stock.text+"（備蓄 "+denStash+"/"+DEN_COSTS[2]+"）");
 $("mission-progress").textContent=info.stage;
 $("mission-title").textContent=info.title;
 $("survival-goal").classList.toggle("hidden",mission<7||mode!=="play");
 $("mission-sub").textContent=info.detail;
 $("mission-next").textContent=info.next?"次の目的："+info.next:"";
 $("mission-next").classList.toggle("hidden",mission>=7);
 $("mission-nav").classList.toggle("hidden",mission>=7);
 $("mission-bar").parentElement.classList.toggle("hidden",mission>=7);
 setBar("mission-bar",info.progress*100);
 const objective=getObjective(),waypoint=objective&&guidancePoint(objective);
 guideWisp=waypoint&&!waypoint.blocked?{x:waypoint.x,y:waypoint.y}:null;
 guideGoal=objective&&Number.isFinite(objective.x)&&Number.isFinite(objective.y)?{x:objective.x,y:objective.y,label:objectiveShortLabel()}:null;
 $("nav-distance").textContent=waypoint&&!waypoint.blocked?"目的地まで約"+Math.round(dist(P,objective))+"m":"目的地を探索中";
 const contextLabel=$("context-action-label");
 if(contextLabel){const home=atDen();
  contextLabel.textContent=home&&P.carry?"備蓄":home&&denLevel<DEN_MAX_LEVEL&&denStash>=DEN_COSTS[denLevel+1]?"長押し強化":home?"食料庫":P.carry?"食べる/置く":nearbyFood()?(mission===4?"長押し運ぶ":"食べる"):nearestTerritoryPost()?"縄張り":"行動";}
  $("kill-line").textContent="HUNT "+String(kills).padStart(2,"0");
 $("score-line").textContent="SCORE "+String(Math.floor(elapsed*4+kills*88+(P.level-1)*110)).padStart(6,"0");
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
  mark(site.x,site.y,found?"#99e9c7":"#c0b9a2",found?5:4);
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
 bm.fillText("旧新宿駅",X(STATION.x)+10,Y(STATION.y)+22);
 for(const q of carcasses)if(q.ttl>0&&edibleFood(q)&&dist(P,q)<650)mark(q.x,q.y,"#f9da7c",3);
 for(const m of mobs)if(m.hp>0&&dist(P,m)<650){
   if(species[m.type].prey){if(dist(P,m)<260)mark(m.x,m.y,"#e7dcb1",3)}
   else mark(m.x,m.y,"#eb847b",4);
  }
 const obj=getObjective();if(obj&&mission!==3)mark(obj.x,obj.y,"#f1d885",4);
 mark(P.x,P.y,"#f7fbf4",8);
 bm.fillStyle="#fff";bm.font="bold 13px sans-serif";
 bm.fillText("現在地",clamp(X(P.x)+11,8,width-64),clamp(Y(P.y)-10,35,height-5));
 bm.lineWidth=1;bm.strokeStyle="#839d8f";bm.strokeRect(.5,.5,width-1,height-1);
 const zone=regionAt(P.x,P.y),area=districts[zone],eco=ecology[zone];
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
 // Classify live wildlife by actual species, alert state and strength relative to the player.
 const visibleMobs=mobs.filter(m=>m.hp>0&&Math.abs(m.x-P.x)<span/2&&Math.abs(m.y-P.y)<span/2)
  .sort((a,b)=>dist(P,a)-dist(P,b)).slice(0,30);
 for(const m of visibleMobs){
  const sp=species[m.type],powerful=!!m.strongBoss||m.type==="alpha"||
   (!sp.prey&&m.type!=="boar"&&m.maxHp>P.maxHp*1.65&&sp.damage>P.damage*1.35)||
   (m.type==="boar"&&m.maxHp>P.maxHp*1.65&&sp.damage>P.damage*1.35);
  const calmBoar=m.type==="boar"&&!powerful&&(m.alert||0)<=0&&(m.windup||0)<=0&&(m.search||0)<=0;
  const kind=sp.prey?"prey":powerful?"strong":calmBoar?"caution":"hostile";
  const x=X(m.x),y=Y(m.y);
  mc.save();mc.translate(x,y);mc.lineWidth=1.3;mc.strokeStyle="#0b1c1b";
  mc.fillStyle=kind==="prey"?"#78e59c":kind==="strong"?"#f15b62":kind==="caution"?"#f3d56c":"#f7a05c";
  mc.beginPath();
  if(kind==="strong"){mc.moveTo(0,-5.5);mc.lineTo(5.5,0);mc.lineTo(0,5.5);mc.lineTo(-5.5,0);mc.closePath();}
  else if(kind==="hostile"){mc.moveTo(0,-4.5);mc.lineTo(4.5,4);mc.lineTo(-4.5,4);mc.closePath();}
  else if(kind==="caution"){mc.rect(-3.2,-3.2,6.4,6.4);}
  else{mc.arc(0,0,3.2,0,TWO);}
  mc.fill();mc.stroke();mc.restore();
 }
 for(const site of EXPLORE_SITES)if(Math.hypot(site.x-P.x,site.y-P.y)<span*.7){
  mc.fillStyle=discoveredSites.includes(site.id)?"#83e7c4":"#d5bea1";
  mc.fillRect(X(site.x)-2,Y(site.y)-2,4,4);
 }
 // Den and mission target use world coordinates and are never cached between goals.
 for(const site of denSites)if(Math.abs(site.x-P.x)<span/2&&Math.abs(site.y-P.y)<span/2){
  mc.fillStyle=site.z>0?"#e9c6ff":"#76baff";mc.beginPath();mc.arc(X(site.x),Y(site.y),3.5,0,TWO);mc.fill();
 }
 const goal=getObjective();
 if(goal){
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
 // Directional player marker (world east is right on the map).
 mc.save();mc.translate(w/2,h/2);mc.rotate(P.dir+Math.PI/2);
 mc.fillStyle="#f6fce5";mc.strokeStyle="#102a25";mc.lineWidth=1.8;
 mc.beginPath();mc.moveTo(0,-7);mc.lineTo(5,5);mc.lineTo(0,2);mc.lineTo(-5,5);mc.closePath();
 mc.fill();mc.stroke();mc.restore();
 mc.strokeStyle="#b6e1c5";mc.lineWidth=1;mc.strokeRect(.5,.5,w-1,h-1);
}
function visible(x,y,r=50){const q=project(x,y),m=Math.max(100,r*1.9);return q.x>-m&&q.x<vw+m&&q.y>-m&&q.y<vh+m}
function roadDraw(){
 ctx.fillStyle="#273639";
 for(const y of roadsY){ctx.fillRect(0,y-75,WORLD.w,150);ctx.fillStyle="#576460";ctx.fillRect(0,y-77,WORLD.w,5);ctx.fillRect(0,y+73,WORLD.w,5);ctx.fillStyle="#273639"}
 for(const x of roadsX){ctx.fillRect(x-76,0,152,WORLD.h);ctx.fillStyle="#576460";ctx.fillRect(x-78,0,5,WORLD.h);ctx.fillRect(x+74,0,5,WORLD.h);ctx.fillStyle="#273639"}
 ctx.save();ctx.setLineDash([24,22]);ctx.strokeStyle="#b1a98357";ctx.lineWidth=3;
 for(const y of roadsY){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WORLD.w,y);ctx.stroke()}
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
 if(p.type===2&&window.WildSeasonClouds?.season?.index===0)return;
 ctx.save();ctx.translate(p.x,p.y);
 let r=p.r*(p.type===2?.74:1);
 if(p.type===2){
  // Actual grass shape: long narrow pointed blades with bright midribs, not round blobs.
  ctx.fillStyle="#172820a6";ctx.beginPath();ctx.ellipse(0,9,r*1.03,r*.52,0,0,TWO);ctx.fill();
  for(let layer=0;layer<2;layer++)for(let j=0;j<12;j++){
   const n=j+layer*12,spread=(j-5.5)/5.5,baseX=spread*r*.79+Math.sin(n*3.7+p.phase)*r*.08;
   const baseY=(layer===0?3:10)+Math.cos(n*1.8)*r*.06;
   const tall=r*(.69+(n%5)*.135),bend=spread*r*.28+Math.sin(elapsed*1.6+p.phase+n)*r*.045;
   const tipX=baseX+bend,tipY=baseY-tall,half=r*(.064+(n%3)*.014);
   ctx.fillStyle=n%4===0?"#83a86a":n%3===0?"#436e47":n%2?"#527f4f":"#6c9655";
   ctx.beginPath();ctx.moveTo(baseX-half,baseY);
   ctx.quadraticCurveTo(baseX-half*1.3,baseY-tall*.62,tipX,tipY);
   ctx.quadraticCurveTo(baseX+half*1.6,baseY-tall*.52,baseX+half,baseY);
   ctx.closePath();ctx.fill();
   ctx.strokeStyle="#bad29b87";ctx.lineWidth=.85;ctx.beginPath();
   ctx.moveTo(baseX,baseY-2);ctx.quadraticCurveTo(baseX+bend*.36,baseY-tall*.62,tipX,tipY);ctx.stroke();
  }
  ctx.restore();return;
  }
  if(p.type===1){ctx.fillStyle="#4e5b4b";ctx.beginPath();ctx.ellipse(0,3,r*1.2,r*.47,.2,0,TWO);ctx.fill();
  for(let j=0;j<5;j++){let a=j*TWO/5+p.phase;ctx.strokeStyle="#78926d";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke()}
 }else{ctx.fillStyle="#0c1b1b66";ctx.beginPath();ctx.ellipse(3,7,r,r*.55,0,0,TWO);ctx.fill();
  for(let j=0;j<5;j++){let a=j*TWO/5+p.phase;ctx.fillStyle=j%2?"#315947":"#47765c";ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.42,Math.sin(a)*r*.43,r*.65,r*.43,a,0,TWO);ctx.fill()}
  ctx.fillStyle="#668a64";ctx.beginPath();ctx.arc(0,0,r*.48,0,TWO);ctx.fill()}
 ctx.restore();
}
function drawCoverForeground(p){
 if(window.WildSeasonClouds?.season?.index===0)return;
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

function drawCreature(o,isPlayer){
 const s=isPlayer?P.base:species[o.type],r=o.r,t=o.type;
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
 const lift2D=z=>ctx.translate(VIEW.c*z*.93*cameraZoom/VIEW_DET,-VIEW.a*z*.93*cameraZoom/VIEW_DET);
 const floorZ=isPlayer?(P.groundZ||0):0;
 if(floorZ>0)lift2D(floorZ);
 oval(r*.37,r*.66,r*1.32,r*.53,"#030c10a0");
 oval(r*.19,r*.32,r*.96,r*.4,"#0b1d2083");
 if(isPlayer&&P.jumpHeight>floorZ)lift2D(P.jumpHeight-floorZ);
 if(!isPlayer&&(o.evadeHeight||0)>0)lift2D(o.evadeHeight);
 if(!isPlayer&&o.type==="giantEagle")lift2D(Math.max(10,Number(o.airHeight)||125)); // Real sideways leap also clears the ground in Canvas2D.
 if(isPlayer&&P.hidden)ctx.globalAlpha*=.44;
 ctx.rotate(o.dir||0);
 if(!isPlayer&&o.resting){ctx.scale(1.07,.68);ctx.translate(0,r*.15);}
 const bound=t==="fox"?Math.abs(Math.sin(gait*1.08))*.19:t==="cat"?Math.abs(Math.sin(gait*1.46))*.13:t==="wolf"?Math.abs(Math.sin(gait*.62))*.105:Math.abs(Math.sin(gait*.9))*.09;
 ctx.translate(r*(attackReach*(t==="wolf"?.25:t==="cat"?.19:.29)-attackPrep*.12),bound*motion*r+attackPrep*r*.09);
 if(isPlayer){
  ctx.scale(1.14,1.14);
  if(P.wallKickTime>0&&t==="cat"){
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
 if(drawStrongCreature2D(o,r,fur,light,pace,oval,triangle,attackReach)){
  // Unique strong enemy silhouette.
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
 if(isPlayer){
  ctx.strokeStyle=P.inv>0?"#f5b668a8":"#b5f1c8bd";ctx.lineWidth=1.3;
  ctx.beginPath();ctx.arc(0,0,r+5,0,TWO);ctx.stroke();
  ctx.font="900 10px sans-serif";ctx.textAlign="center";ctx.fillStyle="#f5fce8";
  ctx.fillText(P.hidden?"潜伏中":"YOU",0,-r-21);
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
  ctx.closePath();ctx.clip();ctx.globalAlpha*=.25;
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
 const start=project(P.x,P.y),forward=project(P.x+ux*100,P.y+uy*100);
 const bearing=Math.atan2(forward.y-start.y,forward.x-start.x);
 if(Math.hypot(forward.x-start.x,forward.y-start.y)<8)return;
 const count=waypointDistance>=155&&goalDistance>=190?2:1;
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
 ctx.font="900 "+(vh<=520?18:21)+"px sans-serif";
 for(let i=0;i<count;i++){
  const step=Math.min(waypointDistance*.82,62+i*64);
  const pos=project(P.x+ux*step,P.y+uy*step);
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
 const b=entry.building,door={x:entry.approach.x,y:b.y-10},raw=project(door.x,door.y);
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
function drawRemainsLabels(){
 if(!P||mode!=="play")return;
 ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="900 13px sans-serif";let shown=0;
 for(const c of carcasses){
  if((c.type!=="corpse"&&c.type!=="bones")||dist(P,c)>205||!visible(c.x,c.y,65))continue;
  const p=project(c.x,c.y),y=p.y-Math.max(15,(c.r||9)*1.28)*cameraZoom-17;
  if(p.x<25||p.x>vw-25||y<20||y>vh-20)continue;
  ctx.fillStyle=c.type==="bones"?"#263330e8":"#382c29e8";ctx.fillRect(p.x-24,y-11,48,22);
  ctx.strokeStyle=c.type==="bones"?"#f1ebd8":"#e8c2a1";ctx.lineWidth=1.5;ctx.strokeRect(p.x-24,y-11,48,22);
  ctx.fillStyle=c.type==="bones"?"#fff8e8":"#ffe1c3";ctx.fillText(c.type==="bones"?"骨":"死骸",p.x,y+1);
  if(++shown>=5)break;
 }ctx.restore();
}
function drawThreatNames(){
 if(!P||mode!=="play")return;
 ctx.save();ctx.textAlign="center";ctx.font="700 10px sans-serif";
 for(const m of mobs){
  if(m.hp<=0||species[m.type].prey||dist(P,m)>280||!visible(m.x,m.y,55))continue;
  const pos=project(m.x,m.y),names={giantEagle:"強敵・大鷲",dog:"野犬",boar:"イノシシ",alpha:"強敵・アルファ",giantSnake:"強敵・大蛇",oldBear:"強敵・老熊",giantBoar:"強敵・巨大イノシシ",blackPanther:"強敵・黒豹",oneEyedWolf:"強敵・隻眼の狼",whiteTiger:"強敵・白虎",giantHyena:"強敵・巨大ハイエナ",giantCrocodile:"強敵・巨大ワニ",giantHippo:"強敵・巨大カバ",giantAnaconda:"強敵・巨大アナコンダ"},y=pos.y-(m.type==="giantEagle"?(m.airHeight||125)*.93*cameraZoom:0)-m.r*cameraZoom-35;
  ctx.globalAlpha=m.windup>0||m.alert>0?.92:.65;ctx.fillStyle="#172321";ctx.fillRect(pos.x-42,y-11,84,16);
  ctx.fillStyle=m.windup>0?"#ffad9a":"#ecdfca";ctx.fillText(names[m.type]||"危険",pos.x,y+1);
 }
 ctx.restore();
}
function drawScene(){
 const x=cam.x+(shake?rnd(-shake,shake):0),y=cam.y+(shake?rnd(-shake,shake):0);
 let use3D=false;
 if(window.Wild3D?.available)use3D=window.Wild3D.render({vw,vh,dpr,cam,VIEW,cameraZoom,buildings,plants,mobs,P,elapsed,weather,WORLD,species,carcasses,streetProps,birdFlocks,roadsX,roadsY,landmarks:EXPLORE_SITES,waterAt:waterDepth,lightProfile:dayLightProfile(elapsed),nightVision:P?nightVisionProfile():null,dens:denSites.map(site=>({x:site.x,y:site.y,z:site.z,kind:site.kind,level:denLevel,stash:denStash,type:choice}))});
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
 for(let xx=farLeft;xx<x+vw*1.8+180;xx+=180)for(let yy=farTop;yy<y+vh*2.3+180;yy+=180){
  const n=noise(xx/180,yy/180);ctx.fillStyle=n>.5?"#536a4214":"#b6a8850a";ctx.beginPath();ctx.ellipse(xx+78,yy+65,75+n*30,45+n*19,n,0,TWO);ctx.fill();
 }
 drawWater2D();
  roadDraw();
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
  if(p.type===2)for(const e of entities)if(Math.hypot(e.x-p.x,e.y-p.y)<p.r*.82){
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
   if(o===P)drawCarriedFood2D();
   for(const p of covers.get(o))drawCoverForeground(p);
  }
 }
 drawDenBedding2D(true); // Rooftop beds must be drawn above building roofs in 2D.
 for(const bird of birdFlocks)if(visible(bird.x,bird.y,90))drawFlyingBird(bird);
 drawOccludedSilhouettes(entities);
 }
 for(const m of entities){
  if(m===P||m.hp<=0||m.windup>0)continue;
  const symbol=m.resting?"Zz":(m.drinkPose||0)>0?"水":(m.scavengePose||0)>0||(m.foragePose||0)>0?"食":species[m.type].prey?(m.flee>0?"!":m.alert>0?"?":null):(m.search>0?"?":m.alert>0?"!":null);
  if(!symbol)continue;
  ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillStyle=m.resting?"#c8e7ff":(m.drinkPose||0)>0?"#b5e8f1":(m.scavengePose||0)>0||(m.foragePose||0)>0?"#d9f0b9":m.sheltered?"#a5ddec":species[m.type].prey?"#ffe4a3":symbol==="?"?"#d6e8af":"#ffad8c";
  ctx.strokeStyle="#13201a";ctx.lineWidth=3;ctx.font="900 15px sans-serif";
  const py=m.y-m.r-29;ctx.strokeText(symbol,m.x,py);ctx.fillText(symbol,m.x,py);ctx.restore();
 }
  for(const m of entities){
   if(m===P||species[m.type].prey||m.windup<=0)continue;
   ctx.save();ctx.textAlign="center";ctx.font="900 15px sans-serif";
   ctx.fillStyle=m.windup<.22?"#fff0b4":"#ffbc9c";
   ctx.fillText("!",m.x,m.y-m.r-24);ctx.restore();
  }
  if(P&&P.dashTime>0){ctx.strokeStyle="#b4f7d88b";ctx.lineWidth=4;ctx.beginPath();ctx.arc(P.x,P.y,P.r+14,0,TWO);ctx.stroke()}
 for(const q of particles){const alpha=clamp(q.life/q.max,0,1);ctx.globalAlpha=alpha;
  if(q.ring){ctx.strokeStyle=q.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(q.x,q.y,(1-alpha)*390,0,TWO);ctx.stroke()}
  else{ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,TWO);ctx.fill()}}ctx.globalAlpha=1;
 for(const f of popups){ctx.globalAlpha=clamp(f.life,0,1);ctx.font="900 14px Barlow Condensed,sans-serif";ctx.textAlign="center";ctx.shadowColor="#00100c";ctx.shadowBlur=7;ctx.fillStyle=f.color;ctx.fillText(f.t,f.x,f.y);ctx.shadowBlur=0}ctx.globalAlpha=1;
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
 if(use3D){
  for(const m of mobs){
   if(!visible(m.x,m.y,80)||species[m.type].prey||m.hp>=m.maxHp)continue;
   const pos=project(m.x,m.y),pct=clamp(m.hp/m.maxHp,0,1),barY=pos.y-m.r-39;
   ctx.fillStyle="#091517d9";ctx.fillRect(pos.x-22,barY,44,6);
   ctx.fillStyle="#ee9d79";ctx.fillRect(pos.x-22,barY,44*pct,6);
  }
 }
 if(use3D&&P){
  const pos=project(P.x,P.y);ctx.save();
  const ringY=pos.y-(P.groundZ||0)*.93*cameraZoom,headY=pos.y-(P.jumpHeight||0)*.93*cameraZoom;
  ctx.strokeStyle=P.hidden?"#a9e2ac":"#cbefd5";ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(pos.x,ringY+4,P.r*1.18,P.r*.52,0,0,TWO);ctx.stroke();
  ctx.textAlign="center";ctx.font="900 11px sans-serif";ctx.lineWidth=3;
  if(!P.hidden){
   ctx.strokeStyle="#102222";ctx.strokeText("YOU",pos.x,headY-52);
   ctx.fillStyle="#e7f7e4";ctx.fillText("YOU",pos.x,headY-52);
  }
  ctx.restore();
 }
 if(weather==="CLOUDY"||weather==="RAIN"||weather==="THUNDER"||weather==="WIND"){
  ctx.fillStyle=weather==="THUNDER"?"rgba(15,25,35,.22)":weather==="RAIN"?"rgba(26,38,47,.15)":weather==="CLOUDY"?"rgba(32,42,50,.12)":"rgba(44,48,43,.07)";
  ctx.fillRect(0,0,vw,vh);
 }
 if(weather==="RAIN"||weather==="THUNDER"){
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
 if(weather==="WIND"){
  ctx.strokeStyle="#d2c8a73b";ctx.lineWidth=1.4;ctx.beginPath();
  for(let i=0;i<22;i++){
   const y=(i*93+elapsed*49)%Math.max(1,vh),x=(i*131+elapsed*210)%Math.max(1,vw);
   ctx.moveTo(x,y);ctx.lineTo(x+24,y-6);
  }ctx.stroke();
 }
 if(thunderFlash>0&&weather==="THUNDER"){
  ctx.fillStyle="rgba(230,240,255,"+(thunderFlash*.44)+")";
  ctx.fillRect(0,0,vw,vh);
 }
 if(flash>0){ctx.fillStyle="rgba(255,97,71,"+(flash*.35)+")";ctx.fillRect(0,0,vw,vh)}
 if(P&&P.hunger<22&&mode==="play"){ctx.fillStyle="rgba(138,30,20,"+(.06+Math.sin(elapsed*5)*.03)+")";ctx.fillRect(0,0,vw,vh)}
 
 if(P&&P.hidden&&mode==="play"){
  const pos=project(P.x,P.y),labelY=pos.y-(P.jumpHeight||0)*.93*cameraZoom;ctx.save();ctx.fillStyle="#102c23e8";ctx.strokeStyle="#c5e4a8";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(pos.x-39,labelY-80,78,25,8);ctx.fill();ctx.stroke();
  ctx.fillStyle="#e9f9d9";ctx.textAlign="center";ctx.font="800 12px sans-serif";ctx.fillText("潜伏中",pos.x,labelY-62);ctx.restore();
 }

 drawMissionChevrons();drawShelterEntranceMarker();drawThreatNames();drawRemainsLabels(); // Route hint only during active objectives.
}
function loop(t){
 let dt=Math.min(.035,(t-last)/1000||.016);last=t;
 if(objectiveBannerTime>0&&t>=objectiveBannerTime){
  objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
 }
 if(huntSlowUntil>0&&(t>=huntSlowUntil+520||mode!=="play")){
  huntSlowUntil=0;$("hunt-cinematic").classList.remove("show");
 }
 if(mode==="milestone"&&t>=milestoneUntil)finishMissionMilestone();
 window.WildGamepad?.poll?.(dt);
 if(mode==="play")update(dt*(t<huntSlowUntil?.28:1));
 else huntSlowUntil=0;
 // Freeze 2D/WebGL gameplay behind achievement and tutorial.
 if((mode!=="guide"&&mode!=="milestone")||guideNeedsFrame){drawScene();guideNeedsFrame=false}
 requestAnimationFrame(loop);
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
 if(mode==="guide"){if(k==="arrowright"||k==="enter")tutorialMove(1);if(k==="arrowleft")tutorialMove(-1);if(k==="escape")closeTutorial();return}
 if(k==="shift"||k==="k")act("dash");if(k==="l")act("jump");
 if(k==="r")act("instinct");
 if(k==="e")act("eat");if(k==="g")act("carry");if(k==="h")act("den");
 if(k==="escape"&&mode==="map")toggleWorldMap();else if(k==="p"||k==="escape")togglePause();
 if(k==="f")fullScreen();if(k==="m")toggleWorldMap();if(k==="-"||k==="_")adjustZoom(-.13);if(k==="="||k==="+")adjustZoom(.13);
}
document.addEventListener("keydown",keyDown);document.addEventListener("keyup",e=>{keys.delete(e.key.toLowerCase())});
window.addEventListener("blur",()=>{
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
 keys.clear();if(P)resetRush();joy.id=null;joy.x=0;joy.y=0;gamepadAxes.x=0;gamepadAxes.y=0;
 for(const timer of touchHoldTimers.values())clearTimeout(timer);touchHoldTimers.clear();
 for(const [id,pointers] of activeTouchPointers){
  for(const pointerId of [...pointers]){try{$(id).releasePointerCapture?.(pointerId)}catch(_){}}
  pointers.clear();
 }
  for(const id of orbitPointers.keys()){try{gameSurface.releasePointerCapture?.(id)}catch(_){}}
  orbitPointers.clear();lastPinchDistance=0;
 if(knob)knob.style.transform="translate(0,0)";
 for(const id of ["attack-touch","dash-touch","jump-touch","action-touch"])$(id).classList.remove("down");
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
 const titleButton=$("menu-landscape-btn");
 if(titleButton)titleButton.textContent=document.fullscreenElement&&window.innerWidth>window.innerHeight
  ?"横画面・全画面：設定中":"横画面で全画面プレイ";
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
document.querySelectorAll(".animal-card").forEach(b=>b.addEventListener("click",()=>{choice=b.dataset.animal;document.querySelectorAll(".animal-card").forEach(c=>c.classList.toggle("selected",c===b));playEffect("menu")}));
$("start-btn").addEventListener("click",()=>{
 if(getAutoSnapshot()&&!window.confirm("保存した「続きから」のデータを上書きして、新しく始めますか？\nチェックポイントは残ります。"))return;
 clearAutoSave();start();announceObjective();
});
$("continue-btn").addEventListener("click",()=>{
 const snapshot=getAutoSnapshot();if(snapshot)restoreSnapshot(snapshot);else refreshSaveMenu();
});
$("checkpoint-menu-btn").addEventListener("click",()=>{
 const target=$("checkpoint-list"),open=target.classList.contains("hidden");
 target.classList.toggle("hidden",!open);
 $("checkpoint-menu-btn").setAttribute("aria-expanded",String(open));
});
for(let i=0;i<3;i++)$("checkpoint-slot-"+i).addEventListener("click",()=>{
 const snapshot=getCheckpoints()[i];if(snapshot)restoreSnapshot(snapshot);else refreshSaveMenu();
});
$("checkpoint-save-btn").addEventListener("click",recordCheckpoint);
$("den-inventory-btn").addEventListener("click",openDenInventory);
$("den-inventory-close").addEventListener("click",closeDenInventory);
for(const key of ["meat","berries","legacy"])$("den-eat-"+key).addEventListener("click",()=>eatFromDen(key));
$("objective-toggle").addEventListener("click",()=>openTutorial());
$("tutorial-prev").addEventListener("click",()=>tutorialMove(-1));
$("tutorial-next").addEventListener("click",()=>tutorialMove(1));
$("tutorial-close").addEventListener("click",closeTutorial);
$("mission-close").addEventListener("click",()=>{
 $("mission").classList.add("hidden");
 $("objective-toggle").setAttribute("aria-expanded","false");
 $("objective-toggle").textContent="目標を見る";
});
$("resume-btn").addEventListener("click",togglePause);
$("pause-btn").addEventListener("click",togglePause);
$("quit-btn").addEventListener("click",()=>{saveAuto();resetControls();mode="menu";$("world-map").classList.add("hidden");show("menu")});
$("retry-btn").addEventListener("click",()=>{const save=getCheckpoints().find(s=>s.player.type===P?.type);if(save&&restoreSnapshot(save)){notify("チェックポイントからリトライ");return}clearAutoSave();start();announceObjective()});
$("menu-btn").addEventListener("click",()=>{mode="menu";show("menu");$("new-game-options").open=true});
$("full-btn").addEventListener("click",fullScreen);
$("rotate-btn").addEventListener("click",rotateScreen);
$("menu-landscape-btn").addEventListener("click",()=>setFullscreenOrientation("landscape",$("menu-landscape-note")));
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
for(const [id,action] of [["action-touch","context"],["dash-touch","dash"],["jump-touch","jump"],["attack-touch","attack"]]){
 const b=$(id),pointers=new Set();activeTouchPointers.set(id,pointers);
 let longFired=false,pressStarted=0;
 b.addEventListener("pointerdown",e=>{
  if(mode!=="play"||pointers.has(e.pointerId))return;
  e.preventDefault();const first=pointers.size===0;pointers.add(e.pointerId);
  b.classList.add("down");b.setPointerCapture(e.pointerId);
  if(!first)return;
  pressStarted=performance.now();longFired=false;
  
  if(action==="jump"){act("jump");return}
  if(action==="attack"){act("attack");return}
  if(action==="dash"||action==="context"){
   const timer=setTimeout(()=>{
    touchHoldTimers.delete(id);
    if(mode!=="play"||pointers.size===0)return;
    longFired=true;
    if(action==="dash")act("instinct");else contextAction(true);
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
  
  if(mode!=="play"||longFired)return;
  const duration=performance.now()-pressStarted;
  if(action==="dash"){if(duration>=450)act("instinct");else act("dash")}
  if(action==="context")contextAction(duration>=550);
 };
 b.addEventListener("pointerup",end);b.addEventListener("pointercancel",e=>{
  if(!pointers.delete(e.pointerId)||pointers.size!==0)return;
  b.classList.remove("down");
  const timer=touchHoldTimers.get(id);if(timer!==undefined){clearTimeout(timer);touchHoldTimers.delete(id)}
  
 });
 b.addEventListener("lostpointercapture",e=>{
  if(!pointers.delete(e.pointerId)||pointers.size!==0)return;
  b.classList.remove("down");
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
   hp:active?Math.ceil(P.hp):null,denLevel,animal:animals[choice]?.name||choice
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
  if(name!==null&&!["CLEAR","CLOUDY","RAIN","THUNDER","WIND","FOG"].includes(name))return false;
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
 save(){return saveAuto();}
};

/* Gamepad adapter invokes the same gameplay and UI functions as touch/keyboard. */
window.WildGamepadBridge={
 getMode:()=>mode,
 setMove(x,y){gamepadAxes.x=clamp(Number(x)||0,-1,1);gamepadAxes.y=clamp(Number(y)||0,-1,1)},
 turnCamera(v){if(mode!=="play"||!Number.isFinite(v))return;cameraYaw=(cameraYaw+v)%TWO;updateCameraView()},
 zoom(v){if(mode==="play"&&Number.isFinite(v))adjustZoom(v)},
 action(kind,long=false){
  if(mode!=="play")return;
  if(kind==="attack")act("attack");
  else if(kind==="jump")act("jump");
  else if(kind==="pounce")act(long?"instinct":"dash");
  else if(kind==="context")contextAction(!!long);
 },
 pause(){if(mode==="play"||mode==="pause")togglePause()},
 map(){if(mode==="play"||mode==="map")toggleWorldMap()}
};
})();

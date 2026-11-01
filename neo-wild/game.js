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
 cat:{name:"ノラネコ",hp:85,speed:239,damage:16,rate:.28,r:16,color:"#abaf9d",belly:"#e7e7da",ear:"#8e998a"},
 wolf:{name:"オオカミ",hp:155,speed:175,damage:34,rate:.56,r:24,color:"#718991",belly:"#cad2c9",ear:"#546973"}
};
const species={
 rat:{hp:22,r:12,speed:105,damage:0,prey:true,xp:1,food:27,color:"#9b8b81",belly:"#d2bbb0"},
 rabbit:{hp:30,r:15,speed:150,damage:0,prey:true,xp:1,food:33,color:"#c8b899",belly:"#f0e5d5"},
 pigeon:{hp:18,r:12,speed:125,damage:0,prey:true,xp:1,food:19,color:"#738c92",belly:"#e5e4d5"},
 dog:{hp:124,r:22,speed:161,damage:16,prey:false,xp:3,food:29,color:"#9c785a",belly:"#e2c9a3"},
 boar:{hp:190,r:28,speed:122,damage:23,prey:false,xp:4,food:45,color:"#796358",belly:"#af9c87"},
 alpha:{hp:335,r:29,speed:178,damage:32,prey:false,xp:8,food:55,color:"#485b5c",belly:"#abc0b2"}
};
let vw=1,vh=1,dpr=1,cam={x:0,y:0},mode="menu",choice="fox",P=null,mobs=[],carcasses=[],plants=[],debris=[],buildings=[],lamps=[],particles=[],popups=[],birdFlocks=[],streetProps=[];
let elapsed=0,day=1,kills=0,meals=0,hiddenHold=0,expedition=1,freeStep=0,freeTarget=0,mission=0,missionComplete=false,totalScore=0,best=0,weather="CLEAR",scoreTimer=0,spawnTimer=0,uiTimer=0,shake=0,flash=0,toastTime=0,toastMessage="",last=performance.now(),rain=[],worldMade=false;
const AUTOSAVE_KEY="wild-reclaim-autosave-v2",CHECKPOINTS_KEY="wild-reclaim-checkpoints-v2",SAVE_SCHEMA=2;
let autosaveClock=0,weatherTimer=35,nextWeather=null,thunderFlash=0,thunderTimer=10,windDirection=0;
let soundEnabled=true,footstepTimer=0,audioTick=0,keys=new Set(),joy={id:null,x:0,y:0},heldDash=false,navPlansThisFrame=0,huntTarget=null,objectiveBannerTime=0,ambushTarget=null,huntSlowUntil=0,pounceStreaks=[];
const activeTouchPointers=new Map(),touchHoldTimers=new Map();
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

const SAFE_DEN={x:1860,y:1170,r:90};
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
function atDen(){return !!P&&(P.groundZ||0)===0&&dist(P,SAFE_DEN)<=denRadius()+16}
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
  if(roadCollision||nearBuilding(x+w*.5,y+h*.5,Math.min(w,h)*.35))return;
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
  if(nearBuilding(x,y,45))continue;
  const biome=regionAt(x,y),forest=biome===5,shrubs=forest?.46:biome===7?.24:.15;
  plants.push({x,y,r:Math.random()<shrubs?rnd(34,65):rnd(7,24),
   type:Math.random()<shrubs?2:Math.random()<.25?1:0,phase:rnd(0,TWO),hue:Math.random()});
 }
 for(let i=0;i<260;i++){
  const x=4200+rnd(0,WORLD.w-4320),y=90+rnd(0,2400);
  if(!nearBuilding(x,y,48))plants.push({x,y,r:rnd(8,46),type:i%5===0?2:i%3===0?1:0,phase:rnd(0,TWO),hue:Math.random()});
 }
 for(let i=0;i<520;i++){
  const x=rnd(80,WORLD.w-80),y=rnd(2500,WORLD.h-70);
  if(!nearBuilding(x,y,12))debris.push({x,y,r:rnd(2,12),a:rnd(0,TWO),kind:i%4});
 }
 for(const site of EXPLORE_SITES){
  for(let j=0;j<3;j++){
   const ang=j*TWO/3,xx=site.x+Math.cos(ang)*155,yy=site.y+Math.sin(ang)*145;
   if(!nearBuilding(xx,yy,32))plants.push({x:xx,y:yy,r:40,type:2,phase:j,hue:.3});
  }
 }
 const alley=[
  {x:1990,y:835,w:75,h:210,seed:91,kind:1,sign:false,broken:true,roofZ:0},
  {x:2185,y:835,w:75,h:210,seed:92,kind:2,sign:false,broken:true,roofZ:0},
  {x:2085,y:765,w:85,h:60,seed:93,kind:3,sign:false,broken:false,roofZ:52}
 ];
 buildings.push(...alley); // wall-kick training alley; also serves open-city roof exploration.
 for(let i=0;i<400;i++){let x=rnd(30,WORLD.w-30),y=rnd(30,WORLD.h-30);
   if(nearBuilding(x,y,28))continue;
   plants.push({x,y,r:rnd(5,17),type:Math.random()<.23?1:0,phase:rnd(0,6),hue:Math.random()});}
 for(let i=0;i<75;i++){const x=rnd(65,WORLD.w-65),y=rnd(65,WORLD.h-65);
  if(!nearBuilding(x,y,70))plants.push({x,y,r:rnd(34,67),type:2,phase:rnd(0,6)});}
 for(let i=0;i<330;i++){let x=rnd(0,WORLD.w),y=rnd(0,WORLD.h);
   if(nearBuilding(x,y,8))continue;
   debris.push({x,y,r:rnd(2,10),a:rnd(0,7),kind:i%4});}
 for(const x of roadsX)for(const y of roadsY)for(const dx of [-100,100])for(const dy of [-87,87])lamps.push({x:x+dx,y:y+dy});
 
 for(let i=0;i<72;i++){
  const along=i%3!==0,road=along?roadsY[Math.floor(i/8)%roadsY.length]:roadsX[i%roadsX.length];
  const x=along?220+(i%8)*1030+(noise(i,7)-.5)*70:road+(noise(i,7)-.5)*40;
  const y=along?road+(noise(i,3)-.5)*35:180+(i%6)*920;
  const type=["car","bicycle","car","barrier","vending","bicycle","sign"][i%7],r=type==="car"?32:13;
  if(Math.hypot(x-SAFE_DEN.x,y-SAFE_DEN.y)>210&&!nearBuilding(x,y,44))
   streetProps.push({x,y,type,r,dir:along?0:Math.PI/2,seed:i});
 }
 for(let i=0;i<20;i++)birdFlocks.push({x:160+i*380,y:290+(i%6)*850,z:55+(i%4)*23,
  dir:i%2?3.0:.13,speed:56+i%4*19,wing:i*1.7,fright:0,type:i%3===0?"crow":"pigeon"});
 for(let i=0;i<85;i++)rain.push({x:rnd(0,2000),y:rnd(0,1200),s:rnd(320,730),z:rnd(9,21)});
}
function resize(){vw=window.innerWidth;vh=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1.8);canvas.width=Math.floor(vw*dpr);canvas.height=Math.floor(vh*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(mode==="guide"||mode==="milestone")guideNeedsFrame=true;}
window.addEventListener("resize",resize,{passive:true});resize();generateWorld();
function show(id){
 for(const key of ["menu","pause","result","upgrade"])$(key).classList.toggle("hidden",key!==id);
 if(id!=="")$("nav-hud").classList.add("hidden");
 if(id==="menu")refreshSaveMenu();
}
function start(){
 autosaveClock=0;audioTick=0;startAmbient();mode="play";show("");cameraYaw=0;cameraZoom=.8;guideWisp=null;guideGoal=null;updateCameraView();$('zoom-level').textContent='80%';$("world-map").classList.add("hidden");elapsed=0;day=1;kills=0;meals=0;hiddenHold=0;expedition=1;freeStep=0;freeTarget=0;mission=0;missionComplete=false;scoreTimer=0;spawnTimer=0;ecology=initialEcology();ecologyClock=0;ecologyNews="生態系は変化し続けている";discoveredSites=[];earnedDiscoveries=[];weather=(["CLEAR","CLOUDY","RAIN","FOG","WIND","THUNDER"])[Math.floor(Math.random()*6)];weatherTimer=rnd(24,44);nextWeather=null;thunderFlash=0;thunderTimer=10;windDirection=rnd(0,TWO);shake=0;flash=0;particles=[];popups=[];mobs=[];carcasses=[];resetControls();guideCache=null;huntTarget=null;
 objectiveBannerTime=0;$("objective-banner").classList.remove("visible");tutorialSeen.clear();guideNeedsFrame=false;milestoneUntil=0;$("mission-milestone").classList.add("hidden");$("mission-milestone").classList.remove("show");$("app").classList.remove("tutorial-paused");$("tutorial-dialog").classList.add("hidden");$("den-inventory").classList.add("hidden");ambushTarget=null;huntSlowUntil=0;pounceStreaks.length=0;$("hunt-cinematic").classList.remove("show");
 const origin=START_LOCATIONS[$("start-region")?.value]||START_LOCATIONS.home;
 denLevel=loadDenLevel(choice);denStores=loadDenStores(choice);syncDenStash();territoryClaims=loadTerritoryClaims(choice);territoryLastSupply=[day,day,day];
  const a=animals[choice];P={x:origin.x,y:origin.y,dir:0,type:choice,base:a,r:a.r,hp:a.hp,maxHp:a.hp,hunger:100,sp:100,speed:a.speed,damage:a.damage,rate:a.rate,atk:0,dash:0,dashTime:0,dx:1,dy:0,inv:0,level:1,xp:0,nextXp:5,combo:0,comboTimer:0,steps:0,blood:0,eatCD:0,vx:0,vy:0,noise:0,noiseBurst:0,hidden:false,windup:0,pendingStrike:false,ambushStrike:false,revealTimer:0,abilityTime:0,instinctCD:0,pounceTime:0,pounceRemaining:0,pounceDir:0,jumpTime:0,jumpDuration:0,jumpHeight:0,jumpRemaining:0,jumpSpeed:0,jumpDir:0,jumpCD:0,jumpDive:false,jumpAmbush:false,groundZ:0,pounceDuration:0,fallTime:0,fallFromZ:0,carry:null,lastCombatAt:-100,rushStep:0,rushActiveStep:0,rushWindow:0,rushQueued:false,wallKicks:0,wallKickLast:-1,wallKickLock:0,wallKickTime:0,wallKickDir:0,jumpFromHeight:0,jumpPower:0,chargeStrike:false};
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
 syncHUD();window.WildAudio?.update({weather,area:regionAt(P.x,P.y),danger:false,mode:"play"});notify(origin.name+" / 生存開始");
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
  mobs,carcasses,plants,debris,birdFlocks,discoveredSites,earnedDiscoveries,ecology,ecologyClock,ecologyNews
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
function restoreSnapshot(snapshot){
 if(!isValidSnapshot(snapshot))return false;
 choice=snapshot.player.type;
 document.querySelectorAll(".animal-card").forEach(b=>b.classList.toggle("selected",b.dataset.animal===choice));
 start();
 const p=snapshot.player;
 P={...P,...p,base:animals[choice],type:choice};
 P.carry=normalizeCarry(P.carry); // Legacy corpse/meat/berries compatibility.
 P.x=clamp(p.x,P.r+12,WORLD.w-P.r-12);
 P.y=clamp(p.y,P.r+12,WORLD.h-P.r-12);
 const roof=roofAt(P.x,P.y);
 P.groundZ=roof;P.jumpHeight=roof;P.jumpTime=0;P.pounceTime=0;P.pounceRemaining=0;
 P.fallTime=0;P.dashTime=0;P.pendingStrike=false;P.chargeStrike=false;P.windup=0;
 P.vx=0;P.vy=0;P.jumpDive=false;P.jumpAmbush=false;P.wallKickTime=0;P.wallKicks=0;P.wallKickLast=-1;
 elapsed=snapshot.elapsed;day=Math.max(1,Math.floor(snapshot.day||1));
 kills=snapshot.kills||0;meals=snapshot.meals||0;hiddenHold=snapshot.hiddenHold||0;
 expedition=snapshot.expedition||1;freeStep=snapshot.freeStep||0;freeTarget=snapshot.freeTarget||0;
 mission=snapshot.mission||0;missionComplete=!!snapshot.missionComplete;
 totalScore=snapshot.totalScore||0;weather=["CLEAR","CLOUDY","RAIN","THUNDER","FOG","WIND"].includes(snapshot.weather)?snapshot.weather:"CLEAR";
 weatherTimer=Number.isFinite(snapshot.weatherTimer)&&snapshot.weatherTimer>0?snapshot.weatherTimer:rnd(24,45);
 nextWeather=["CLEAR","CLOUDY","RAIN","THUNDER","FOG","WIND"].includes(snapshot.nextWeather)?snapshot.nextWeather:null;
 thunderTimer=Number.isFinite(snapshot.thunderTimer)&&snapshot.thunderTimer>0?snapshot.thunderTimer:9;
 thunderFlash=0;windDirection=Number.isFinite(snapshot.windDirection)?snapshot.windDirection:0;
 scoreTimer=snapshot.scoreTimer||0;spawnTimer=snapshot.spawnTimer||0;
 denLevel=clamp(Math.floor(snapshot.denLevel||1),1,DEN_MAX_LEVEL);
 denStores=normalizeDenStores(snapshot.denStores,snapshot.denStash||0);syncDenStash();
 territoryClaims=Array.isArray(snapshot.territoryClaims)&&snapshot.territoryClaims.length===3?snapshot.territoryClaims.map(Boolean):[false,false,false];
 territoryLastSupply=Array.isArray(snapshot.territoryLastSupply)&&snapshot.territoryLastSupply.length===3?snapshot.territoryLastSupply:[day,day,day];
 mobs=snapshot.mobs;carcasses=snapshot.carcasses;
 for(const c of carcasses)normalizeRemains(c);
 for(const m of mobs){
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
 syncHUD(Math.floor((elapsed%85)/85*24));drawMini();
 saveAuto();announceObjective();notify("保存した場所から再開");
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
 else if(biome===6)type=roll<.32?"rat":roll<.62?"dog":roll<.88?"boar":"alpha";
 else if(biome===4||biome===7)type=roll<.50?"pigeon":roll<.72?"rabbit":roll<.9?"dog":"boar";
 else if(day<2)type=roll<.4?"rat":roll<.72?"rabbit":roll<.87?"pigeon":"dog";
 else if(day<3)type=roll<.28?"rat":roll<.52?"rabbit":roll<.65?"pigeon":roll<.91?"dog":"boar";
 else type=roll<.2?"rat":roll<.38?"rabbit":roll<.52?"dog":roll<.86?"boar":"alpha";
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
function collides(x,y,r,actor=null){
 if(x<r+12||y<r+12||x>WORLD.w-r-12||y>WORLD.h-r-12)return true;
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
 if(!collides(o.x+dx,o.y,o.r,o===P?o:null))o.x+=dx;
 if(!collides(o.x,o.y+dy,o.r,o===P?o:null))o.y+=dy;
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
function inCover(o){return plants.some(p=>p.type===2&&Math.hypot(p.x-o.x,p.y-o.y)<p.r*.75)}
function detectsPlayer(m,sp,d){
 const night=Math.cos((elapsed%85)/85*TWO)<-.45;
 const sightRange=(sp.prey?185:265)*(weather==="FOG"?.62:weather==="RAIN"||weather==="THUNDER"?.78:weather==="CLOUDY"?.94:1)*(night?.8:1)*(P.hidden?.29:1);
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
function getAxes(){
 let x=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0)+joy.x;
 let y=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0)+joy.y;
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
 if(sp.prey||m.scavengeNeed<.69||spotted||m.alert>0||m.flee>0||
    m.stun>0||m.windup>0||m.chargeTime>0||(m.evadeTime||0)>0||playerDistance<110)return null;
 if(mobs.some(q=>q!==m&&q.hp>0&&species[q.type].prey&&
    Math.abs(q.x-m.x)<175&&Math.abs(q.y-m.y)<175&&dist(m,q)<175))return null;
 let target=null,best=290*290;
 for(const c of carcasses){
  if(!edibleFood(c)||(c.type!=="corpse"&&c.type!=="meat"))continue;
  const dx=c.x-m.x,dy=c.y-m.y,d2=dx*dx+dy*dy;
  if(d2<best){best=d2;target=c}
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
  m.scavengeCooldown=1.8;m.scavengePose=.9;m.navPath=null;
  if(playerDistance<360)label(m.x,m.y-m.r-25,"死骸を食べる","#d9f0b9");
 }
 return {vx:0,vy:0};
}
function forageWildBerries(m,sp,dt,spotted,playerDistance){
 m.foragePose=Math.max(0,(m.foragePose||0)-dt);
 m.forageCooldown=Math.max(0,(m.forageCooldown||0)-dt);
 m.forageNeed=Number.isFinite(m.forageNeed)?
  clamp(m.forageNeed+dt*.013,0,1):clamp(.56+noise(Math.floor(m.x),Math.floor(m.y))*.30,0,1);
 if(!sp.prey||m.forageNeed<.70||spotted||m.alert>0||m.flee>0||
    m.stun>0||(m.evadeTime||0)>0||playerDistance<115||
    ((weather==="RAIN"||weather==="THUNDER")&&!insideShelter(m)))return null;
 // Feeding stops near predators; no food is consumed through walls.
 if(mobs.some(q=>q!==m&&q.hp>0&&!species[q.type].prey&&
    dist(m,q)<175&&!lineBlocked(m,q)))return null;
 let target=null,best=245*245;
 for(const c of carcasses){
  if(c.type!=="berries"||!edibleFood(c))continue;
  const dx=c.x-m.x,dy=c.y-m.y,d2=dx*dx+dy*dy;
  if(d2<best){best=d2;target=c}
 }
 if(!target)return null;
 const biteRange=m.r+(target.r||9)+12;
 if(best>biteRange*biteRange){
  m.dir=steerPursuit(m,target.x,target.y);
  return {vx:Math.cos(m.dir)*sp.speed*.48,vy:Math.sin(m.dir)*sp.speed*.48};
 }
 if(lineBlocked(m,target))return null;
 if(m.forageCooldown<=0){
  const bite=Math.min(target.amount,5);
  target.amount=Math.max(0,target.amount-bite);
  if(target.amount<=0)carcasses.splice(carcasses.indexOf(target),1);
  m.forageNeed=Math.max(0,m.forageNeed-.21);
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
 if(sp.prey&&mobs.some(q=>q!==m&&q.hp>0&&!species[q.type].prey&&
    dist(m,q)<170&&!lineBlocked(m,q)))return null;
 let goal=null,best=310*310;
 for(const site of EXPLORE_SITES){
  if(site.id!=="river"&&site.id!=="canal")continue;
  const dx=m.x-site.x,dy=m.y-site.y;
  if(Math.abs(dx)>330||Math.abs(dy)>300)continue;
  const x=clamp(m.x,site.x-175,site.x+175),y=site.y+(dy>=0?121:-121);
  const d2=(x-m.x)**2+(y-m.y)**2;
  if(d2>=best||collides(x,y,m.r+4))continue;
  goal={x,y};best=d2;
 }
 if(!goal)return null;
 if(best>(m.r+10)**2){
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
   const damage=Math.max(1,Math.round(P.damage*RUSH_POWER[P.rushActiveStep||1]*bonus*rnd(.86,1.16)));m.hp-=damage;
   if(foxBurst)P.abilityTime=0;
   m.flash=.16;m.alert=3;m.lastX=P.x;m.lastY=P.y;m.search=0;m.flee=0;
    const disrupt=species[m.type].prey||m.staggerGuard<=0||silentHit||dive;
    if(disrupt){
     m.windup=0;m.chargeTime=0;m.swing=0;
     m.stun=silentHit?.70:dive?.56:P.type==="wolf"?.40:P.type==="cat"?.16:.24;
     m.staggerGuard=species[m.type].prey?0:1.15;m.attack=Math.max(m.attack,.22);
    }else m.stun=Math.max(m.stun,.035);
    hit++;
   
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
 carcasses.push(animalRemains(m));
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
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0||(P.groundZ||0)>0){notify("地上に降りてから巣を育てる");return false}
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
 if(P.jumpTime>0||P.pounceTime>0||P.fallTime>0||(P.jumpHeight||0)>20){notify("着地してから運ぶ");return false}
 if((P.groundZ||0)>0){notify("地上で食草・肉を運ぶ");return false}
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
 P.hunger=clamp(P.hunger+gain,0,100);P.hp=clamp(P.hp+heal,0,P.maxHp);meals++;
 if(carried){c.amount=Math.max(0,c.amount-bite);if(c.amount===0)P.carry=null}
 else if(c.type==="corpse"){c.amount=Math.max(0,c.amount-bite);if(c.amount===0)toBones(c)}
 else{c.amount=Math.max(0,c.amount-bite);if(c.amount===0)carcasses.splice(carcasses.indexOf(c),1)}
 label(P.x,P.y-30,foodName(c)+" 満腹+"+gain+" 生命+"+heal,"#bfe89e");
 blood(P.x,P.y,"#d6c17f",7,45);playEffect("collect");checkMission();syncHUD();
}
function renderDenInventory(){
 if(!P)return;
 $("den-inventory-total").textContent="合計 "+denStash+" / "+denCapacity()+"pt";
 $("den-inventory-help").textContent=atDen()?"食べたい種類を選んでください。選択しなければ減りません。":"巣の外では閲覧のみ。食べるには巣へ戻ってください。";
 const canEat=atDen()&&(P.hunger<100||P.hp<P.maxHp);
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
 if(mission<=6&&!tutorialSeen.has(mission))announceObjective();
}
function eatFromDen(kind){
 if(mode!=="inventory"||!P||!atDen()||!["meat","berries","legacy"].includes(kind))return false;
 if(P.hunger>=100&&P.hp>=P.maxHp){notify("満腹で体力も最大です");return false}
 const points=Math.min(kind==="meat"?18:kind==="berries"?7:12,denStores[kind]);
 if(points<=0){notify("その食料はありません");return false}
 denStores[kind]-=points;syncDenStash();
 const heal=Math.round(points*(kind==="meat"?1/3:kind==="berries"?1/7:1/4));
 P.hunger=clamp(P.hunger+points,0,100);P.hp=clamp(P.hp+heal,0,P.maxHp);meals++;
 saveDenStash();checkMission();saveAuto();syncHUD();renderDenInventory();
 notify((kind==="meat"?"肉":kind==="berries"?"食草":"以前の備蓄")+"を食べた：満腹+"+points+"・生命+"+heal);
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
  case 1:return {stage:"チュートリアル 2 / 4",title:"身を隠せ",detail:"茂みで静止して潜伏 / C",next:"獲物を仕留めろ",progress:Math.min(1,hiddenHold/.75)};
  case 2:return {stage:"チュートリアル 3 / 4",title:"獲物を仕留めろ",detail:"獲物に近づいて攻撃 / ×・J",next:"旧新宿駅を探せ",progress:Math.min(1,kills)};
  case 3:return {stage:"チュートリアル 4 / 4",title:"旧新宿駅を探せ",detail:"廃墟を探索して旧駅に到達する",next:"巣をLV2に強化せよ",progress:clamp(1-Math.hypot(P.x-STATION.x,P.y-STATION.y)/750,0,1)};
  case 4:{
   const step=stockpileStep();
   return {stage:"生存目標 1 / 3・備蓄の練習",
    title:step.step===1?"食料をくわえて巣に持ち帰ろう":step.step===2?"食料を巣に預けよう":"備蓄で巣をLV2にしよう",
    detail:step.text+(step.step===1?"（約0.6秒）":"")+" / 備蓄 "+denStash+"/"+DEN_COSTS[2],
    next:step.step===3?"巣をLV2に強化":step.step===2?"巣で△短押し":"食料を運んで備蓄",
    progress:denLevel>=2?1:Math.min(1,denStash/DEN_COSTS[2])};
  }
  case 5:return {stage:"生存目標 2 / 3",title:"縄張りを1か所確保せよ",detail:"地図の縄張り標識で△長押し。周囲の敵に注意",next:"探索地点を2か所発見せよ",progress:Math.min(1,territoryOwned())};
  case 6:return {stage:"生存目標 3 / 3",title:"探索地点を2か所発見せよ",detail:"地図の未発見地点を訪れ、生存能力を得る",next:"自由探索で生存記録を伸ばせ",progress:Math.min(1,discoveredSites.length/2)};
  default:return freeStep===0
   ?{stage:"自由探索 / 生存 "+expedition,title:"食草・肉を補給せよ",detail:"周囲で食草・肉を確保する / △・E",next:"獲物を追い狩猟する",progress:0}
   :{stage:"自由探索 / 生存 "+expedition,title:"狩りを続けろ",detail:"周囲の気配を探り、獲物を狩る / ×・J",next:"食料を補給して探索を続ける",progress:0};
 }
}
// Two help pages only: the current mission, then an optional one-screen control reminder.
const GUIDE_GOALS=[
 {title:"食草か肉を食べる",what:"食草・肉の近くで△短押し。",how:"空腹が回復する。"},
 {title:"茂みに隠れる",what:"茂みで約1秒止まる。",how:"敵に見つかりにくくなる。"},
 {title:"獲物を狩る",what:"×で攻撃、□で飛びつき。",how:"死骸から肉を取れる。"},
 {title:"探索地点へ行く",what:"》の方向へ進んで旧駅へ。",how:"次は巣の備蓄。"},
 {title:"巣に食料を貯める",what:"食草・肉で△長押し → 巣で△。",how:"60ptで巣LV2。強化しても食料は減らない。"},
 {title:"縄張りを取る",what:"標識で△長押し。",how:"巣の安全性が上がる。"},
 {title:"探索地点を見つける",what:"未発見の地点を2か所訪れる。",how:"自由探索へ進む。"},
 {title:"自由探索",what:"狩りと食事を続けて生き残る。",how:"食料庫で備蓄を食べられる。"}
];
const TUTORIAL_PAGES=[
 null, // Page 1 always shows the CURRENT goal; not a long sequence of seven lessons.
 {stage:"操作早見表",title:"操作・食料の基本",what:"△ 食べる・運ぶ ／ × 攻撃 ／ □ 飛びつき ／ ○ ジャンプ",how:"巣で△：備蓄。手ぶらで△：食料庫。"}
];
let tutorialPage=0;const tutorialSeen=new Set();let guideNeedsFrame=false,milestoneUntil=0;
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
 tutorialPage=clamp(Math.floor(page),0,TUTORIAL_PAGES.length-1);
 if(automatic)tutorialSeen.add(mission);
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
 if(mission<=6){
  objectiveBannerTime=0;$("objective-banner").classList.remove("visible");
  if(mode==="play"&&!tutorialSeen.has(mission))openTutorial(0,true);
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
 if(!P||mode!=="play"||next!==previous+1||previous<0||previous>6)return false;
 const finishedTutorial=previous===3&&next===4;
 const duration=finishedTutorial?1000:780;
 $("mission-milestone-kicker").textContent=finishedTutorial?"TUTORIAL":previous<3?"NICE WORK":"SURVIVAL";
 $("mission-milestone-title").textContent=finishedTutorial?"COMPLETE!":"EXCELLENT!";
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
 if(mission<=6&&!tutorialSeen.has(mission))openTutorial(0,true);
 else announceObjective();
 return true;
}
function advanceMission(next){
 const previous=mission;
 mission=next;
 if(next===7){freeStep=0;freeTarget=meals+1;expedition=Math.max(1,expedition)}
 if(!showMissionMilestone(previous,next))announceObjective();
 syncHUD();
}
function checkMission(){
 if(mission===0&&meals>=1){advanceMission(1);return}
 if(mission===1&&hiddenHold>=.75){advanceMission(2);return}
 if(mission===2&&kills>=1){advanceMission(3);return}
 if(mission===3&&Math.hypot(P.x-STATION.x,P.y-STATION.y)<115){advanceMission(4);return}
 if(mission===4&&denLevel>=2){advanceMission(5);return}
 if(mission===5&&territoryOwned()>=1){advanceMission(6);return}
 if(mission===6&&discoveredSites.length>=2){advanceMission(7);return}
 if(mission===7){
  if(freeStep===0&&meals>=freeTarget){freeStep=1;freeTarget=kills+1;announceObjective();return}
  if(freeStep===1&&kills>=freeTarget){freeStep=0;freeTarget=meals+1;expedition++;announceObjective()}
 }
}
function nearestGoal(list){
 if(!P||!list.length)return null;
 let bestItem=null,bestDist=Infinity;
 for(const q of list){const d=dist(P,q);if(d<bestDist){bestDist=d;bestItem=q}}
 return bestItem;
}
function objectiveShortLabel(){
 if(mission===0||(mission===7&&freeStep===0)){const f=nearestGoal(carcasses.filter(c=>edibleFood(c)));return f?foodName(f):"食草・肉"}
 if(mission===1)return "潜伏する茂み";
 if(mission===2||(mission===7&&freeStep===1))return "獲物";
 if(mission===3)return "探索地点";
 if(mission===4){const step=stockpileStep();if(step?.step===1){const f=nearestGoal(carcasses.filter(c=>c.ttl>0&&edibleFood(c)));return f?foodName(f):"食草・肉"}return "巣"}
 if(mission===5)return "縄張り標識";
 if(mission===6)return "探索地点";
 return "目標";
}
function getObjective(){
 if(!P||mode==="menu"||mode==="over"||mode==="clear")return null;
 if(mission===1){
  const p=nearestGoal(plants.filter(p=>p.type===2));
  return p?{x:p.x,y:p.y,label:"茂みで静止 / Cで潜伏"}:null;
 }
 if(mission===3)return {x:STATION.x,y:STATION.y,label:"旧新宿駅方面"};
 if(mission===4){
  if(P.carry||denStash>=DEN_COSTS[2])return {x:SAFE_DEN.x,y:SAFE_DEN.y,label:denStash>=DEN_COSTS[2]?"巣をLV2に強化":"巣に備蓄する"};
  const food=nearestGoal(carcasses.filter(c=>c.ttl>0&&edibleFood(c)));
  if(food)return {x:food.x,y:food.y,label:foodName(food)+"を△長押しで運ぶ"};
  const prey=nearestGoal(mobs.filter(m=>m.hp>0&&species[m.type].prey));
  return prey?{x:prey.x,y:prey.y,label:"獲物を倒して食料を運ぶ"}:null;
 }
 if(mission===5){const post=nearestGoal(TERRITORY_POSTS.filter((site,i)=>!territoryClaims[i]));return post?{x:post.x,y:post.y,label:"縄張り標識で△長押し"}:null;}
 if(mission===6){const site=nearestGoal(EXPLORE_SITES.filter(site=>!discoveredSites.includes(site.id)));return site?{x:site.x,y:site.y,label:"未発見の探索地点"}:null;}
 const findFood=mission===0||(mission===7&&freeStep===0);
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
 $("result-title").textContent=won?"SURVIVED":"GAME OVER";
 $("result-title").style.color=won?"#a1edbe":"#f5ede0";
 $("result-reason").textContent=won?"生態系の頂点へ。東京に、あなたの縄張りを刻んだ。":"東京の食物連鎖に飲み込まれた。次は生き延びろ。";
 $("result-score").textContent=String(totalScore).padStart(6,"0");
 $("result-stats").innerHTML="<span>DAY "+String(day).padStart(2,"0")+"</span><span>HUNT "+String(kills).padStart(2,"0")+"</span><span>LEVEL "+String(P.level).padStart(2,"0")+"</span>";
 $("best-score").textContent="BEST SCORE "+String(best).padStart(6,"0");
 show("result");playEffect(won?"level":"death");
}
function clearStep(m,angle,step){
 const dx=Math.cos(angle),dy=Math.sin(angle);
 return !collides(m.x+dx*step*.45,m.y+dy*step*.45,m.r+4)&&!collides(m.x+dx*step,m.y+dy*step,m.r+4);
}
function chooseEscape(m,away){
 const angles=[0,.44,-.44,.88,-.88,1.35,-1.35,1.9,-1.9,2.5,-2.5];
 let best=away,bestScore=-Infinity;
 for(const off of angles){
  const angle=away+off,step=78,x=m.x+Math.cos(angle)*step,y=m.y+Math.sin(angle)*step;
  if(!clearStep(m,angle,step))continue;
  const cover=plants.some(p=>p.type===2&&Math.hypot(x-p.x,y-p.y)<p.r*.75)?1:0;
  const distance=P?Math.hypot(x-P.x,y-P.y):0;
  const coverWeight=m.type==="rat"?3.3:m.type==="rabbit"?.5:.25;
  const forwardWeight=m.type==="rabbit"?3.3:m.type==="rat"?1.65:1.55;
  const sideStep=m.type==="pigeon"?Math.sin(off)*(m.evasionSide||1)*1.35:0;
  const score=Math.cos(off)*forwardWeight+distance*.003+cover*coverWeight+sideStep-Math.abs(off)*.1;
  if(score>bestScore){bestScore=score;best=angle}
 }
 return best;
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
 const hunter=mobs.find(q=>q!==m&&q.hp>0&&!species[q.type].prey&&dist(m,q)<150&&!lineBlocked(m,q));
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
 if(Math.random()>=(m.type==="alpha"?.62:m.type==="dog"?.52:.38))return false;
 const away=Math.atan2(m.y-P.y,m.x-P.x),side=m.evasionSide||1;
 const travel=m.type==="boar"?58:m.type==="alpha"?74:67;
 for(const offset of [side*1.26,-side*1.26,side*.75,-side*.75]){
  const angle=away+offset,goal={x:m.x+Math.cos(angle)*travel,y:m.y+Math.sin(angle)*travel};
  if(collides(goal.x,goal.y,m.r+3)||!routeClear(m,goal,m.r+3))continue;
  m.evadeAngle=angle;m.evadeTime=.29;m.evadeDuration=.29;
  m.evadeRemaining=travel;m.evadeSpeed=travel/.29;
  m.evadeCooldown=3.5+rnd(0,1.2);m.evasionSide=-side;
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
 if((m.type!=="dog"&&m.type!=="alpha")||distance<115||distance>235||(prey.flee||0)<=0)return direct;
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
function steerPursuit(m,tx,ty){
 const goal={x:tx,y:ty},desired=Math.atan2(ty-m.y,tx-m.x),distance=dist(m,goal);
 const look=clamp(distance*.45,42,94);
 if(routeClear(m,goal,m.r)){m.navPath=null;return desired}
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
const WEATHER_EDGES={
 CLEAR:[["CLOUDY",56],["WIND",23],["FOG",12],["RAIN",9]],
 CLOUDY:[["CLEAR",27],["RAIN",37],["WIND",16],["FOG",12],["THUNDER",8]],
 RAIN:[["CLOUDY",46],["THUNDER",19],["CLEAR",22],["FOG",13]],
 THUNDER:[["RAIN",65],["CLOUDY",28],["CLEAR",7]],
 FOG:[["CLOUDY",43],["CLEAR",45],["RAIN",12]],
 WIND:[["CLEAR",35],["CLOUDY",46],["RAIN",14],["THUNDER",5]]
};
function rollNextWeather(current,random=Math.random()){
 const options=WEATHER_EDGES[current]||WEATHER_EDGES.CLEAR;
 let val=clamp(random,0,.999999)*options.reduce((sum,item)=>sum+item[1],0);
 for(const [name,weight] of options){val-=weight;if(val<0)return name}
 return options[options.length-1][0];
}
function maintainLocalWildlife(){
 if(!P)return;
 const hunting=mission===2||(mission===7&&freeStep===1);
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
 weatherTimer-=dt;
 if(weatherTimer<9&&!nextWeather){
  nextWeather=rollNextWeather(weather);
  if(nextWeather==="THUNDER")notify("遠雷が聞こえる / 雷雨が近づいている");
  else if(nextWeather==="RAIN")notify("空が暗くなり、雨雲が迫っている");
  else if(nextWeather==="WIND")notify("風が強まり、枝が大きく揺れ始めた");
  else if(nextWeather==="FOG")notify("遠くの景色が白く霞み始めた");
 }
 if(weatherTimer<=0){
  weather=nextWeather||rollNextWeather(weather);nextWeather=null;
  weatherTimer=rnd(28,69);windDirection=rnd(0,TWO);thunderTimer=rnd(5,11);
  notify("天候変化："+WEATHER_NAMES[weather]);
 }
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
function updateIndoorRest(m,sp,dt,spotted,d){
 if(!Number.isFinite(m.restNeed))m.restNeed=clamp(.32+noise(Math.floor(m.x),Math.floor(m.y))*.55,0,1);
 if(!Number.isFinite(m.restTime))m.restTime=0;
 if(!Number.isFinite(m.restCooldown))m.restCooldown=0;
 m.restNeed=clamp(m.restNeed+dt*.012,0,1);
 m.restCooldown=Math.max(0,m.restCooldown-dt);
 const indoors=insideShelter(m),rainy=weather==="RAIN"||weather==="THUNDER";
 const hunter=sp.prey&&mobs.some(q=>q!==m&&q.hp>0&&!species[q.type].prey&&dist(m,q)<155&&!lineBlocked(m,q));
 const danger=spotted||m.alert>0||m.flee>0||m.stun>0||m.windup>0||
  m.chargeTime>0||(m.evadeTime||0)>0||hunter||
  (d<115&&!lineBlocked(m,P));
 if(m.restTime>0&&(!indoors||!rainy||danger)){
  m.restTime=0;m.restCooldown=danger?12:5;
  m.restNeed=Math.min(m.restNeed,danger?.38:.65);
 }
 if(m.restTime<=0&&indoors&&rainy&&!danger&&m.restCooldown<=0&&m.restNeed>=.80){
  m.restTime=5+noise(Math.floor(m.x*.37),Math.floor(m.y*.29))*4;
  m.navPath=null; // Do not keep a stale walking route after waking.
 }
 m.resting=m.restTime>0;
 if(!m.resting)return false;
 m.restTime=Math.max(0,m.restTime-dt);
 m.restNeed=Math.max(0,m.restNeed-dt*.14);
 m.sheltered=true;m.vx=0;m.vy=0;m.wander=Math.max(m.wander,.4);
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
 if(dist(P,SAFE_DEN)<denRadius()&&!mobs.some(m=>m.hp>0&&!species[m.type].prey&&dist(P,m)<165))
  P.hp=Math.min(P.maxHp,P.hp+denRestRate()*dt);
 const a=getAxes(),len=Math.hypot(a.x,a.y),sneaking=keys.has("c")||keys.has("control");
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
   const target=P.speed*(sneaking?.34:1)*(P.pendingStrike?.7:1)*boost*traction;
   const dx=a.x*target-P.vx,dy=a.y*target-P.vy,length=Math.hypot(dx,dy);
   const limit=(len>.08?(P.type==="wolf"?660:P.type==="cat"?1430:foxTurbo?2150:1160):(P.type==="wolf"?900:P.type==="cat"?1720:foxTurbo?2750:1550))*dt;
   const ratio=length>limit?limit/length:1;
   P.vx+=dx*ratio;P.vy+=dy*ratio;
   const oldX=P.x,oldY=P.y;move(P,P.vx*dt,P.vy*dt);
   if(P.x===oldX)P.vx=0;if(P.y===oldY)P.vy=0;
   const speed=Math.hypot(P.vx,P.vy);
   if(speed>8){
    const facing=Math.atan2(P.vy,P.vx);
    const diff=Math.atan2(Math.sin(facing-P.dir),Math.cos(facing-P.dir));
    P.dir+=diff*Math.min(1,dt*(P.type==="wolf"?5.5:P.type==="cat"?21:P.abilityTime>0?12:11));
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
 
 P.eatCD=Math.max(0,(P.eatCD||0)-dt);
 if(P.hp<=0){P.hp=0;finish(false);return}
 const chaseRange=weather==="FOG"?195:260;
 for(const m of mobs){
  if(m.hp<=0)continue;
  const s=species[m.type];m.staggerGuard=Math.max(0,(m.staggerGuard||0)-dt);m.wander-=dt;m.attack=Math.max(0,m.attack-dt);m.swing=Math.max(0,(m.swing||0)-dt);m.flash=Math.max(0,m.flash-dt);m.stun=Math.max(0,m.stun-dt);m.escapeTimer=Math.max(0,m.escapeTimer-dt);m.evadeCooldown=Math.max(0,(m.evadeCooldown||0)-dt);if(s.prey)m.fleeEnergy=clamp(m.fleeEnergy+(m.flee>0?-dt*.32:dt*.2),0,1);
  const d=dist(P,m);
  if(d>WILDLIFE.farAI){m.vx=0;m.vy=0;m.evadeHeight=0;continue;}
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
    if(s.prey&&!spotted&&(m.escapeTimer<=0||!clearStep(m,m.dir,56))){
      m.evasionSide=-(m.evasionSide||1);
      m.dir=chooseEscape(m,Math.atan2(m.y-P.y,m.x-P.x));m.escapeTimer=m.type==="rat"?.23:m.type==="pigeon"?.32:.64;
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
      if(m.type==="dog"&&spotted&&d>120&&d<325){
       const heading=Math.hypot(P.vx,P.vy)>50?Math.atan2(P.vy,P.vx):P.dir,side=m.flankSide||1;
       const fx=P.x-Math.cos(heading)*48-Math.sin(heading)*side*82;
       const fy=P.y-Math.sin(heading)*48+Math.cos(heading)*side*82;
       if(!collides(fx,fy,m.r+5)){targetX=fx;targetY=fy}
      }
      m.dir=steerPursuit(m,targetX,targetY);vx=Math.cos(m.dir)*s.speed;vy=Math.sin(m.dir)*s.speed;
      if((m.type==="dog"||m.type==="alpha")&&spotted&&d>75&&d<205&&m.attack>.22){
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
   if(s.prey&&!spotted){
    const hunter=mobs.find(q=>q!==m&&q.hp>0&&!species[q.type].prey&&dist(q,m)<140);
    if(hunter){
     m.dir=chooseEscape(m,Math.atan2(m.y-hunter.y,m.x-hunter.x));
     m.flee=Math.max(m.flee,1);
     vx=Math.cos(m.dir)*s.speed*1.15;vy=Math.sin(m.dir)*s.speed*1.15;
    }
   }
   if(s.prey&&tryPreyFeint(m,s,d,spotted,dt))continue;
   if(!s.prey&&!spotted&&m.alert<=0&&d>140&&m.windup<=0&&m.stun<=0){
    let nearest=null,best=250;
    for(const q of mobs)if(q.hp>0&&species[q.type].prey){
     const near=dist(m,q);if(near<best&&!lineBlocked(m,q)){best=near;nearest=q}
    }
    if(nearest){
     const intercept=wildPreyInterceptPoint(m,nearest,s,best);
     m.dir=steerPursuit(m,intercept.x,intercept.y);
     vx=Math.cos(m.dir)*s.speed*.75;vy=Math.sin(m.dir)*s.speed*.75;
     m.wildTargetX=nearest.x;m.wildTargetY=nearest.y;
     if(best<m.r+nearest.r+20&&m.wildAttack<=0){
      m.wildAttack=1.8;nearest.hp-=Math.max(12,s.damage*1.4);
      nearest.flee=1.8;nearest.dir=Math.atan2(nearest.y-m.y,nearest.x-m.x);
      if(nearest.hp<=0){
       nearest.hp=0;
       carcasses.push(animalRemains(nearest));
       const zone=regionAt(nearest.x,nearest.y);
       ecology[zone].prey=Math.max(4,ecology[zone].prey-1);
      }
     }
    }
   }
   const scavenging=!s.prey?scavengeWildFood(m,s,dt,spotted,d):null;
   const foraging=s.prey?forageWildBerries(m,s,dt,spotted,d):null;
   const drinking=!scavenging&&!foraging?drinkWildWater(m,s,dt,spotted,d):null;
   if(scavenging||foraging||drinking){
    const feeding=scavenging||foraging||drinking;
    vx=feeding.vx;vy=feeding.vy;
    m.wander=Math.max(m.wander,.25);
   }
   if(weather==="RAIN"||weather==="THUNDER"){
    const calm=!spotted&&m.alert<=0&&m.flee<=0&&m.windup<=0&&m.stun<=0&&m.chargeTime<=0;
    const hunting=!!scavenging||!!foraging||(!s.prey&&mobs.some(q=>q!==m&&q.hp>0&&species[q.type].prey&&dist(m,q)<170));
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
     if((m.type==="boar"||m.type==="alpha")&&m.stun<=0){
      m.chargeTime=m.type==="alpha"?.24:.36;m.chargeDir=m.strikeDir;m.chargeHit=false;
      label(m.x,m.y-m.r-24,m.type==="alpha"?"飛びかかり！":"突進！","#ffbf81");
     }else{
      const reach=P.r+m.r+37,aim=Math.atan2(P.y-m.y,P.x-m.x);
      const delta=Math.atan2(Math.sin(aim-m.strikeDir),Math.cos(aim-m.strikeDir));
      if(m.stun<=0&&P.inv<=0&&(P.jumpHeight||0)<22&&dist(P,m)<reach&&Math.abs(delta)<.92&&!lineBlocked(m,P)){
       const damage=(P.lastCombatAt=elapsed,Math.round(s.damage*(1+Math.max(0,day-1)*.15)));
       {P.hp-=damage;interruptRush();P.inv=.42;shake=9;flash=.23;
       label(P.x,P.y-35,"-"+damage,"#ff9890");
       blood(P.x,P.y,"#eb6356",12,125);playEffect("damage");}
      }else if(dist(P,m)<reach+50){m.stun=Math.max(m.stun,.24);label(m.x,m.y-m.r-16,"空振りの隙！","#a6f5d8");}
     }
    }
   }
   const charging=!s.prey&&m.chargeTime>0&&m.stun<=0;
   const chargeSpeed=m.type==="alpha"?2.3:3.65;
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
      const damage=(P.lastCombatAt=elapsed,Math.round(s.damage*(1+Math.max(0,day-1)*.15)));
      if(damage===0){P.inv=.12;shake=3;flash=0;}
       else{P.hp-=damage;interruptRush();P.inv=.52;shake=11;flash=.27;
      label(P.x,P.y-35,"突進 -"+damage,"#ff9890");
      blood(P.x,P.y,"#eb6356",15,150);playEffect("damage");}
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
   if(!s.prey&&m.windup<=0&&m.chargeTime<=0&&m.stun<=0&&d<P.r+m.r+(m.type==="boar"?115:m.type==="alpha"?112:29)&&(spotted||m.alert>0)&&m.attack<=0&&!lineBlocked(m,P)){
    m.windupTotal=m.type==="boar"?.68:m.type==="alpha"?.60:.45;
    m.windup=m.windupTotal;P.lastCombatAt=elapsed;m.strikeDir=angle;m.attack=m.type==="boar"?1.32:m.type==="alpha"?1.42:.98;
    m.dir=angle;label(m.x,m.y-m.r-24,m.type==="boar"?"突進予兆！":m.type==="alpha"?"跳躍予兆！":"危険！","#ffb76d");
    playEffect("snarl");
   }
 }
 for(let i=mobs.length-1;i>=0;i--)if(mobs[i].hp<=0)mobs.splice(i,1); // Only dead animals are removed.
 for(let i=carcasses.length-1;i>=0;i--)if((carcasses[i].ttl-=dt)<=0){if(carcasses[i].type==="corpse")toBones(carcasses[i]);else carcasses.splice(i,1)}
 for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.life-=dt;q.x+=(q.vx||0)*dt;q.y+=(q.vy||0)*dt;if(q.life<=0)particles.splice(i,1)}
 for(let i=popups.length-1;i>=0;i--){popups[i].life-=dt;popups[i].y-=28*dt;if(popups[i].life<=0)popups.splice(i,1)}
 spawnTimer+=dt;
 if(spawnTimer>3.6){spawnTimer=0;maintainLocalWildlife();}
 territorySupply();checkMission();shake*=Math.max(0,1-dt*9);flash=Math.max(0,flash-dt);
 if(toastTime>0){toastTime-=dt;if(toastTime<=0)$("toast").classList.remove("show")}

 cam.x+=(clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw))-cam.x)*Math.min(1,dt*(P.type==="fox"&&P.abilityTime>0?11:6));
 cam.y+=(clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh))-cam.y)*Math.min(1,dt*(P.type==="fox"&&P.abilityTime>0?11:6));
 audioTick+=dt;
 if(audioTick>.35){
  audioTick=0;
  window.WildAudio?.update({weather,area:regionAt(P.x,P.y),mode:"play",
   danger:mobs.some(m=>m.hp>0&&!species[m.type].prey&&dist(P,m)<290)});
 }
 uiTimer+=dt;if(uiTimer>.14){uiTimer=0;syncHUD(hr);drawMini()}
 autosaveClock+=dt;if(autosaveClock>=4){autosaveClock=0;saveAuto();}
}
function syncHUD(hour){
 if(!P)return;
 const setBar=(name,v)=>$(name).style.width=clamp(v,0,100)+"%";
 setBar("hp-bar",P.hp/P.maxHp*100);setBar("food-bar",P.hunger);setBar("sp-bar",P.sp);
 $("hp-text").textContent=Math.ceil(P.hp)+" / "+P.maxHp;
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
 $("day-label").textContent="DAY "+String(day).padStart(2,"0")+" · "+String(hour===undefined?6:hour).padStart(2,"0")+":00 · "+WEATHER_NAMES[weather];
 const info=missionInfo();
 const stock=stockpileStep();
 const carryGuide=P.carry?(atDen()?"巣の中：△で"+foodName(P.carry)+"を備蓄":"運搬中 "+foodName(P.carry)+"：△短押し 食べる／長押し 置く／巣で備蓄"):null;
 $("stockpile-guide").classList.toggle("hidden",(!stock&&!carryGuide)||mode!=="play");
 if(carryGuide||stock)$("stockpile-guide").textContent=carryGuide||(stock.text+"（備蓄 "+denStash+"/"+DEN_COSTS[2]+"）");
 $("mission-progress").textContent=info.stage;
 $("mission-title").textContent=info.title;
 $("mission-sub").textContent=info.detail;
 $("mission-next").textContent="次の目的："+info.next;
 setBar("mission-bar",info.progress*100);
 const objective=getObjective(),waypoint=objective&&guidancePoint(objective);
 guideWisp=waypoint&&!waypoint.blocked?{x:waypoint.x,y:waypoint.y}:null;
 guideGoal=objective&&Number.isFinite(objective.x)&&Number.isFinite(objective.y)?{x:objective.x,y:objective.y,label:objectiveShortLabel()}:null;
 $("nav-distance").textContent=waypoint&&!waypoint.blocked?"目的地まで約"+Math.round(dist(P,objective))+"m":"目的地を探索中";
 const navTarget=guideWisp||guideGoal,navOn=mode==="play"&&!!navTarget;
 $("nav-hud").classList.toggle("hidden",!navOn);
 if(navOn){
  const dx=navTarget.x-P.x,dy=navTarget.y-P.y;
  const sx=VIEW.a*dx+VIEW.c*dy,sy=VIEW.b*dx+VIEW.d*dy;
  $("nav-hud-chevron").style.transform="rotate("+Math.atan2(sy,sx)+"rad)";
  $("nav-hud-label").textContent=guideGoal?.label||"目標";
  $("nav-hud-distance").textContent=Math.round(dist(P,objective))+"m";
 }
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
 const regions=[
  [0,0,1400,2600,"封鎖区","#243430"],[1400,0,1400,2600,"旧新宿","#243a32"],
  [2800,0,1400,2600,"緑化区","#1d4232"],[4200,0,2100,2600,"上野","#283b38"],
  [6300,0,2100,2600,"荒川","#1b4846"],[0,2600,2800,3400,"代々木の森","#214a31"],
  [2800,2600,2800,3400,"湾岸工業区","#39423c"],[5600,2600,2800,3400,"江東運河","#1e4244"]
 ];
 for(const [x,y,w,h,name,color] of regions){
  bm.fillStyle=color;bm.fillRect(X(x),Y(y),X(w),Y(h));
  bm.fillStyle="#d2dfd5";bm.font="10px sans-serif";bm.textAlign="center";
  bm.fillText(name,X(x+w/2),Y(y)+17);
 }
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
 bm.beginPath();bm.arc(X(SAFE_DEN.x),Y(SAFE_DEN.y),X(denRadius()),0,TWO);bm.fill();bm.stroke();
 mark(SAFE_DEN.x,SAFE_DEN.y,"#9ee5ac",8);
 mark(STATION.x,STATION.y,"#83cde3",7);
 for(let i=0;i<3;i++){
  const p=TERRITORY_POSTS[i],owned=territoryClaims[i];
  mark(p.x,p.y,owned?"#8cf3ae":"#c7a476",5);
  bm.fillStyle=owned?"#b7f6c4":"#f4d5a4";bm.font="bold 10px sans-serif";
  bm.fillText((owned?"確保 ":"未確保 ")+p.name,X(p.x)+7,Y(p.y)-8);
 }
 bm.font="bold 12px sans-serif";bm.textAlign="left";bm.fillStyle="#e9f7e3";
 bm.fillText("巣 LV"+denLevel,X(SAFE_DEN.x)+12,Y(SAFE_DEN.y)-10);
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
function drawMini(){
 if(!P)return;
 const w=mini.width,h=mini.height,span=1270;
 const X=x=>(x-P.x+span/2)/span*w,Y=y=>(y-P.y+span*h/w/2)/span*w;
 mc.fillStyle="#19332e";mc.fillRect(0,0,w,h);
 mc.fillStyle="#465553";
 for(const x of roadsX)if(Math.abs(x-P.x)<span)mc.fillRect(X(x-75),0,w*150/span,h);
 for(const y of roadsY)if(Math.abs(y-P.y)<span)mc.fillRect(0,Y(y-75),w,w*150/span);
 mc.fillStyle="#344d45";
 for(const b of buildings)if(Math.hypot(b.x+b.w/2-P.x,b.y+b.h/2-P.y)<span){
  mc.fillStyle=b.interior?"#b7d9a5":"#344d45";
  mc.fillRect(X(b.x),Y(b.y),Math.max(2,b.w/span*w),Math.max(2,b.h/span*w));
  if(b.interior){mc.fillStyle="#152d29";mc.fillRect(X(b.x+16),Y(b.y+16),Math.max(2,(b.w-32)/span*w),Math.max(2,(b.h-32)/span*w))}
 }
 for(const m of mobs)if(m.hp>0&&dist(P,m)<580){
  mc.fillStyle=species[m.type].prey?"#e4d7b5":"#f09878";
  mc.fillRect(X(m.x)-1.5,Y(m.y)-1.5,3,3);
 }
 for(const site of EXPLORE_SITES)if(Math.hypot(site.x-P.x,site.y-P.y)<span*.7){
  mc.fillStyle=discoveredSites.includes(site.id)?"#83e7c4":"#d5bea1";
  mc.fillRect(X(site.x)-2,Y(site.y)-2,4,4);
 }
 mc.fillStyle="#f6fce5";mc.beginPath();mc.arc(w/2,h/2,4,0,TWO);mc.fill();
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
 ctx.save();ctx.translate(p.x,p.y);
 let r=p.r*(p.type===2?.74:1);
 if(p.type===2){
  ctx.fillStyle="#172a22cf";ctx.beginPath();ctx.ellipse(2,7,r*1.08,r*.64,.1,0,TWO);ctx.fill();
  for(let j=0;j<17;j++){
   const a=j*TWO/17+p.phase,px=Math.cos(a)*r*.57,py=Math.sin(a)*r*.42;
   const lobe=r*(.27+.10*noise(j,p.phase)),size=r*(.23+.09*noise(j+11,p.phase));
   ctx.fillStyle=j%4===0?"#68875b":j%3?"#355c44":"#51724b";
   ctx.beginPath();ctx.ellipse(px,py,lobe,size,a*.28,0,TWO);ctx.fill();
   ctx.strokeStyle="#a0be8691";ctx.lineWidth=1;ctx.beginPath();
   ctx.moveTo(px,py+size*.65);ctx.quadraticCurveTo(px+Math.sin(elapsed*1.8+p.phase+j)*r*.045,py-size*.2,px+Math.sin(a)*lobe*.5,py-size*.7);ctx.stroke();
  }ctx.restore();return;
  }
  if(p.type===1){ctx.fillStyle="#4e5b4b";ctx.beginPath();ctx.ellipse(0,3,r*1.2,r*.47,.2,0,TWO);ctx.fill();
  for(let j=0;j<5;j++){let a=j*TWO/5+p.phase;ctx.strokeStyle="#78926d";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke()}
 }else{ctx.fillStyle="#0c1b1b66";ctx.beginPath();ctx.ellipse(3,7,r,r*.55,0,0,TWO);ctx.fill();
  for(let j=0;j<5;j++){let a=j*TWO/5+p.phase;ctx.fillStyle=j%2?"#315947":"#47765c";ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.42,Math.sin(a)*r*.43,r*.65,r*.43,a,0,TWO);ctx.fill()}
  ctx.fillStyle="#668a64";ctx.beginPath();ctx.arc(0,0,r*.48,0,TWO);ctx.fill()}
 ctx.restore();
}
function drawCoverForeground(p){
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
function drawDenBedding2D(){
 if(!P||!visible(SAFE_DEN.x,SAFE_DEN.y,135))return;
 const x=SAFE_DEN.x,y=SAFE_DEN.y,cat=P.type==="cat",fox=P.type==="fox";
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
 ctx.restore();
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
function drawCreature(o,isPlayer){
 const s=isPlayer?P.base:species[o.type],r=o.r,t=o.type;
 const hit=!isPlayer&&o.flash>0,fur=hit?"#ffe4bc":s.color,light=s.belly;
 const gait=(isPlayer?o.steps:o.step)||0;
 const motion=isPlayer&&P.dashTime>0?1.5:clamp(Math.hypot(o.vx||0,o.vy||0)/Math.max(1,s.speed),0,1.5);
 const attackPrep=isPlayer&&o.pendingStrike?clamp(1-o.windup/Math.max(.001,Math.min(.15,o.rate*.38)),0,1):(!isPlayer&&o.windup>0?clamp(1-o.windup/Math.max(.01,o.windupTotal||.53),0,1):0);
 const swingDuration=isPlayer?.18:.22,swingLeft=clamp(o.swing||0,0,swingDuration);
 const attackSnap=swingLeft>0?clamp((swingDuration-swingLeft)/.033,0,1)*clamp(swingLeft/.12,0,1):0;
 const attackLeap=isPlayer&&o.jumpDive&&o.jumpTime>0?.35:0;
 const attackCharge=!isPlayer&&(t==="boar"||t==="alpha")?clamp((o.chargeTime||0)/(t==="alpha"?.24:.36),0,1)*.55:0;
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
 if(!isPlayer&&(o.evadeHeight||0)>0)lift2D(o.evadeHeight); // Real sideways leap also clears the ground in Canvas2D.
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
 if(t==="pigeon"){
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
function drawObjectiveGlow(){
 if(!P||!guideGoal||mode!=="play")return;
 const raw=project(guideGoal.x,guideGoal.y);
 const safeX=Math.max(43,Math.min(vw*.5-8,58));
 const top=vh<=520?112:Math.min(190,vh*.24);
 const bottom=vh<=520?88:Math.min(160,vh*.2);
 const midX=vw*.5,midY=(top+(vh-bottom))*.5;
 const limX=Math.max(30,midX-safeX),limY=Math.max(28,(vh-bottom-top)*.5);
 const deltaX=raw.x-midX,deltaY=raw.y-midY;
 const ratio=Math.min(1,limX/Math.max(1,Math.abs(deltaX)),limY/Math.max(1,Math.abs(deltaY)));
 const offscreen=ratio<1,px=midX+deltaX*ratio,py=midY+deltaY*ratio;
 const near=Math.hypot(guideGoal.x-P.x,guideGoal.y-P.y)<140;
 const pulse=.5+.5*Math.sin(elapsed*4.2);
 const radius=offscreen?14:near?26:22,height=offscreen?0:near?70:55;
 ctx.save();ctx.globalCompositeOperation="source-over";
 const halo=ctx.createRadialGradient(px,py,2,px,py,offscreen?25:45);
 halo.addColorStop(0,"rgba(255,252,177,"+(.17+.07*pulse)+")");
 halo.addColorStop(.35,"rgba(199,255,199,"+(.09+.04*pulse)+")");
 halo.addColorStop(1,"rgba(175,255,199,0)");
 ctx.fillStyle=halo;ctx.beginPath();ctx.arc(px,py,offscreen?25:45,0,TWO);ctx.fill();
 if(!offscreen){
  const shaft=ctx.createLinearGradient(px,py-height,px,py+8);
  shaft.addColorStop(0,"rgba(255,250,195,0)");
  shaft.addColorStop(.62,"rgba(234,255,196,"+(.04+.03*pulse)+")");
  shaft.addColorStop(1,"rgba(255,233,138,"+(.13+.05*pulse)+")");
  ctx.fillStyle=shaft;ctx.fillRect(px-5,py-height,10,height+8);
 }
 ctx.strokeStyle="rgba(251,248,175,"+(.37+.14*pulse)+")";
 ctx.lineWidth=offscreen?2:2.5;ctx.shadowColor="#f3ff9e";ctx.shadowBlur=4;
 ctx.beginPath();ctx.ellipse(px,py+4,radius+5*pulse,(radius+5*pulse)*(offscreen?1:.48),0,0,TWO);ctx.stroke();
 ctx.restore();
 const label=(guideGoal.label||"目標")+(offscreen?"方向":""),labelY=offscreen?py-26:py-height-9;
 ctx.save();ctx.font="900 13px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.lineWidth=4.5;ctx.lineJoin="round";ctx.strokeStyle="rgba(5,23,21,.96)";
 ctx.strokeText(label,px,labelY);ctx.fillStyle="#fff6b7";ctx.fillText(label,px,labelY);ctx.restore();
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
function drawGuideWisps(){
 if(!P||!guideWisp||mode!=="play")return;
 const dx=guideWisp.x-P.x,dy=guideWisp.y-P.y;
 const sx=VIEW.a*dx+VIEW.c*dy,sy=VIEW.b*dx+VIEW.d*dy,len=Math.hypot(sx,sy);
 if(len<52)return; // The glowing target is enough at close range.
 const angle=Math.atan2(sy,sx),pos=project(P.x,P.y);
 const step=Math.min(81,Math.max(35,len*.37));
 const x=pos.x+Math.cos(angle)*step;
 const y=pos.y-(P.jumpHeight||0)*.93*cameraZoom-12+Math.sin(angle)*step;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
 ctx.font="900 29px 'Noto Sans JP',sans-serif";
 ctx.lineWidth=5;ctx.strokeStyle="rgba(6,21,18,.95)";
 ctx.strokeText("》",0,0);
 ctx.globalAlpha=.75+.22*(.5+.5*Math.sin(elapsed*4));
 ctx.fillStyle="#c9ead1";ctx.shadowColor="#d6ffc5";ctx.shadowBlur=3;
 ctx.fillText("》",0,0);ctx.restore();
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
  const pos=project(m.x,m.y),names={dog:"野犬",boar:"イノシシ",alpha:"強敵・アルファ"},y=pos.y-m.r*cameraZoom-35;
  ctx.globalAlpha=m.windup>0||m.alert>0?.92:.65;ctx.fillStyle="#172321";ctx.fillRect(pos.x-42,y-11,84,16);
  ctx.fillStyle=m.windup>0?"#ffad9a":"#ecdfca";ctx.fillText(names[m.type]||"危険",pos.x,y+1);
 }
 ctx.restore();
}
function drawScene(){
 const x=cam.x+(shake?rnd(-shake,shake):0),y=cam.y+(shake?rnd(-shake,shake):0);
 let use3D=false;
 if(window.Wild3D?.available)use3D=window.Wild3D.render({vw,vh,dpr,cam,VIEW,cameraZoom,buildings,plants,mobs,P,elapsed,weather,WORLD,species,carcasses,streetProps,birdFlocks,roadsX,roadsY,landmarks:EXPLORE_SITES,den:{x:SAFE_DEN.x,y:SAFE_DEN.y,level:denLevel,stash:denStash,type:choice}});
 if(!use3D&&mode==="play"&&!warned3DFallback){warned3DFallback=true;notify("3D描画を開始できないため2D表示中です");}
 ctx.setTransform(dpr,0,0,dpr,0,0);
 if(use3D)ctx.clearRect(0,0,vw,vh);else{ctx.fillStyle="#152423";ctx.fillRect(0,0,vw,vh)}
 const entities=mobs.filter(m=>visible(m.x,m.y,70));if(P)entities.push(P);
 ctx.save();ctx.translate(vw/2,vh/2);ctx.transform(VIEW.a,VIEW.b,VIEW.c,VIEW.d,0,0);ctx.translate(-x-vw/2,-y-vh/2);
 if(!use3D){
  const farLeft=Math.max(0,Math.floor((x-vw*.7)/180)*180-180),farTop=Math.max(0,Math.floor((y-vh*1.3)/180)*180-180);
 ctx.fillStyle="#22392f";ctx.fillRect(0,0,WORLD.w,WORLD.h);
  ctx.fillStyle="#1f4830";ctx.fillRect(0,2600,2800,WORLD.h-2600);
  ctx.fillStyle="#353f3b";ctx.fillRect(2800,2600,2800,WORLD.h-2600);
  ctx.fillStyle="#244245";ctx.fillRect(5600,2600,2800,WORLD.h-2600);
  ctx.fillStyle="#213b39";ctx.fillRect(4200,0,2100,2600);
  ctx.fillStyle="#214346";ctx.fillRect(6300,0,2100,2600);
 for(let xx=farLeft;xx<x+vw*1.8+180;xx+=180)for(let yy=farTop;yy<y+vh*2.3+180;yy+=180){
  const n=noise(xx/180,yy/180);ctx.fillStyle=n>.5?"#536a4214":"#b6a8850a";ctx.beginPath();ctx.ellipse(xx+78,yy+65,75+n*30,45+n*19,n,0,TWO);ctx.fill();
 }
 roadDraw();
 drawDenBedding2D();
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
 const dayCycle=(elapsed%85)/85,sunAmount=(Math.cos((dayCycle-.15)*TWO)+1)/2,nightAlpha=(1-sunAmount)*.47;
 if(!use3D){ctx.fillStyle="rgba(3,10,25,"+nightAlpha+")";ctx.fillRect(0,0,WORLD.w,WORLD.h)}
 if(nightAlpha>.12){ctx.save();ctx.globalCompositeOperation="screen";for(const lamp of lamps){if(!visible(lamp.x,lamp.y,170))continue;const g=ctx.createRadialGradient(lamp.x,lamp.y,2,lamp.x,lamp.y,130);g.addColorStop(0,"rgba(229,153,73,.17)");g.addColorStop(1,"rgba(229,153,73,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(lamp.x,lamp.y,130,0,TWO);ctx.fill()}ctx.restore()}
 if(weather==="FOG"){
  ctx.fillStyle="rgba(164,176,162,.20)";
  if(use3D){ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillRect(0,0,vw,vh);ctx.restore();}
  else ctx.fillRect(0,0,WORLD.w,WORLD.h);
 }
 ctx.restore();
 
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

 drawObjectiveGlow();drawShelterEntranceMarker();drawGuideWisps();drawThreatNames();drawRemainsLabels();
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
 keys.clear();if(P)resetRush();joy.id=null;joy.x=0;joy.y=0;
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
}
async function rotateScreen(){
 const target=window.innerWidth>window.innerHeight?"portrait":"landscape";
 const note=$("rotate-help");if(note)note.textContent="";
 let enteredFullscreen=false;
 try{
  if(!screen.orientation?.lock)throw Error("orientation lock unavailable");
  if(!document.fullscreenElement){
   if(!document.documentElement.requestFullscreen)throw Error("fullscreen unavailable");
   await document.documentElement.requestFullscreen();enteredFullscreen=true;
  }
  await screen.orientation.lock(target);
  if(note)note.textContent=target==="portrait"?"縦画面に切り替えました":"横画面に切り替えました";
  updateRotationButton();
 }catch(e){
  try{screen.orientation?.unlock?.()}catch(_){}
  if(enteredFullscreen)try{await document.exitFullscreen?.()}catch(_){}
  if(note)note.textContent="回転が制限されています。端末の自動回転をONにして回してください。";
 }
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
$("retry-btn").addEventListener("click",()=>{clearAutoSave();start();announceObjective()});
$("menu-btn").addEventListener("click",()=>{mode="menu";show("menu")});
$("full-btn").addEventListener("click",fullScreen);
$("rotate-btn").addEventListener("click",rotateScreen);
updateRotationButton();
$("sound-btn").addEventListener("click",()=>{
 soundEnabled=!soundEnabled;$("sound-btn").textContent=soundEnabled?"♪":"×";
 window.WildAudio?.setEnabled(soundEnabled);
 $("sound-btn").title=soundEnabled?"BGM・環境音・効果音 ON":"BGM・環境音・効果音 OFF";
});
$("map-btn").addEventListener("click",toggleWorldMap);
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
 const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2-11;
 const dx=e.clientX-cx,dy=e.clientY-cy,mag=Math.hypot(dx,dy),lim=44;
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
})();

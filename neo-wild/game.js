(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas=$("scene"),ctx=canvas.getContext("2d",{alpha:false});
const mini=$("minimap"),mc=mini.getContext("2d");
const TWO=Math.PI*2, WORLD={w:4200,h:2400};
const animals={
 fox:{name:"アカギツネ",hp:110,speed:205,damage:22,rate:.39,r:19,color:"#d97947",belly:"#f4d3a0",ear:"#c06e42"},
 cat:{name:"ノラネコ",hp:85,speed:239,damage:16,rate:.28,r:16,color:"#abaf9d",belly:"#e7e7da",ear:"#8e998a"},
 wolf:{name:"オオカミ",hp:155,speed:175,damage:34,rate:.56,r:24,color:"#718991",belly:"#cad2c9",ear:"#546973"}
};
const species={
 rat:{hp:22,r:12,speed:105,damage:0,prey:true,xp:1,food:27,color:"#9b8b81",belly:"#d2bbb0"},
 rabbit:{hp:30,r:15,speed:150,damage:0,prey:true,xp:1,food:33,color:"#c8b899",belly:"#f0e5d5"},
 pigeon:{hp:18,r:12,speed:125,damage:0,prey:true,xp:1,food:19,color:"#738c92",belly:"#e5e4d5"},
 dog:{hp:80,r:22,speed:148,damage:12,prey:false,xp:3,food:29,color:"#9c785a",belly:"#e2c9a3"},
 boar:{hp:135,r:28,speed:113,damage:18,prey:false,xp:4,food:45,color:"#796358",belly:"#af9c87"},
 alpha:{hp:235,r:29,speed:169,damage:25,prey:false,xp:8,food:55,color:"#485b5c",belly:"#abc0b2"}
};
let vw=1,vh=1,dpr=1,cam={x:0,y:0},mode="menu",choice="fox",P=null,mobs=[],carcasses=[],plants=[],debris=[],buildings=[],lamps=[],particles=[],popups=[],birdFlocks=[];
let elapsed=0,day=1,kills=0,meals=0,hiddenHold=0,expedition=1,freeStep=0,freeTarget=0,mission=0,missionComplete=false,totalScore=0,best=0,weather="CLEAR",scoreTimer=0,spawnTimer=0,uiTimer=0,shake=0,flash=0,toastTime=0,toastMessage="",last=performance.now(),rain=[],worldMade=false;
let soundEnabled=true,audio=null,keys=new Set(),joy={id:null,x:0,y:0},attackTouch=false,heldDash=false,navPlansThisFrame=0,huntTarget=null;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rnd=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const roadsX=[530,1410,2320,3270],roadsY=[465,1170,1890];
const districts=["霞ヶ関封鎖区","首都高廃線跡","旧新宿駅周辺","緑化侵食区域"];
try{best=+(localStorage.getItem("wild-reclaim-best")||0)}catch(e){}
$("best-score").textContent="BEST SCORE "+String(best).padStart(6,"0");
function noise(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
function nearBuilding(x,y,r=0){return buildings.some(b=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r)}
function generateWorld(){
 if(worldMade)return;worldMade=true;
 const xs=[80,755,1640,2570,3485],ys=[90,705,1410,2050];
 let k=0;
 for(const y of ys)for(const x of xs){const n=noise(k++,13),w=270+n*175,h=(y>1970?230:240)+noise(k,8)*110;
   buildings.push({x,y,w,h,seed:k,kind:k%4,sign:k%3===0,broken:k%5===0});}
 for(let i=0;i<400;i++){let x=rnd(30,WORLD.w-30),y=rnd(30,WORLD.h-30);
   if(nearBuilding(x,y,28))continue;
   plants.push({x,y,r:rnd(5,17),type:Math.random()<.23?1:0,phase:rnd(0,6),hue:Math.random()});}
 for(let i=0;i<75;i++){const x=rnd(65,WORLD.w-65),y=rnd(65,WORLD.h-65);
  if(!nearBuilding(x,y,70))plants.push({x,y,r:rnd(34,67),type:2,phase:rnd(0,6)});}
 for(let i=0;i<330;i++){let x=rnd(0,WORLD.w),y=rnd(0,WORLD.h);
   if(nearBuilding(x,y,8))continue;
   debris.push({x,y,r:rnd(2,10),a:rnd(0,7),kind:i%4});}
 for(const x of roadsX)for(const y of roadsY)for(const dx of [-100,100])for(const dy of [-87,87])lamps.push({x:x+dx,y:y+dy});
 for(let i=0;i<85;i++)rain.push({x:rnd(0,2000),y:rnd(0,1200),s:rnd(320,730),z:rnd(9,21)});
}
function resize(){vw=window.innerWidth;vh=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1.8);canvas.width=Math.floor(vw*dpr);canvas.height=Math.floor(vh*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
window.addEventListener("resize",resize,{passive:true});resize();generateWorld();
function show(id){for(const key of ["menu","pause","result","upgrade"])$(key).classList.toggle("hidden",key!==id)}
function start(){
 mode="play";show("");elapsed=0;day=1;kills=0;meals=0;hiddenHold=0;expedition=1;freeStep=0;freeTarget=0;mission=0;missionComplete=false;scoreTimer=0;spawnTimer=0;weather="CLEAR";shake=0;flash=0;particles=[];popups=[];mobs=[];carcasses=[];keys.clear();attackTouch=false;joy.x=0;joy.y=0;guideCache=null;huntTarget=null;
 const a=animals[choice];P={x:1860,y:1170,dir:0,type:choice,base:a,r:a.r,hp:a.hp,maxHp:a.hp,hunger:100,sp:100,speed:a.speed,damage:a.damage,rate:a.rate,atk:0,dash:0,dashTime:0,dx:1,dy:0,inv:0,sense:0,senseTime:0,level:1,xp:0,nextXp:5,combo:0,comboTimer:0,steps:0,blood:0,eatCD:0,vx:0,vy:0,noise:0,noiseBurst:0,hidden:false,windup:0,pendingStrike:false,ambushStrike:false,revealTimer:0,abilityTime:0,instinctCD:0,pounceTime:0,pounceRemaining:0,pounceDir:0};
 for(let i=0;i<26;i++)spawnMob(true);
 for(let i=0;i<17;i++)spawnFood();
 carcasses.push({x:P.x+105,y:P.y+40,r:9,amount:22,type:"berries",ttl:240,phase:0});
 if(!plants.some(q=>q.type===2&&Math.hypot(q.x-(P.x+193),q.y-(P.y+72))<48))plants.push({x:P.x+193,y:P.y+72,r:60,type:2,phase:1.3});
 cam.x=clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw));cam.y=clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh));
 syncHUD();notify("東京封鎖区 / 生存開始");
 sound(280,.14,"triangle",.07);
}
function spawnMob(initial=false){
 let tries=0,x,y;
 do{
   const a=rnd(0,TWO),rad=initial?rnd(230,1180):rnd(Math.max(vw,vh)*.55,Math.max(vw,vh)*1.15);
   x=clamp((P?P.x:1800)+Math.cos(a)*rad,40,WORLD.w-40);y=clamp((P?P.y:1170)+Math.sin(a)*rad,40,WORLD.h-40);
 }while(++tries<35&&(nearBuilding(x,y,40)||(P&&dist({x,y},P)<220)));
 if(nearBuilding(x,y,40))return;
 let roll=Math.random(),type;
 if(day<2)type=roll<.4?"rat":roll<.72?"rabbit":roll<.87?"pigeon":"dog";
 else if(day<3)type=roll<.28?"rat":roll<.52?"rabbit":roll<.65?"pigeon":roll<.91?"dog":"boar";
 else type=roll<.2?"rat":roll<.38?"rabbit":roll<.52?"dog":roll<.86?"boar":"alpha";
 const s=species[type],scale=1+Math.max(0,day-1)*.13;
 mobs.push({x,y,type,r:s.r,hp:s.hp*scale,maxHp:s.hp*scale,attack:0,vx:0,vy:0,dir:rnd(-3,3),wander:rnd(.5,3),alert:0,search:0,lastX:x,lastY:y,step:rnd(0,8),flee:0,flash:0,windup:0,windupTotal:0,strikeDir:0,stun:0,escapeTimer:0,fleeEnergy:1,evasionSide:Math.random()<.5?-1:1});
}
function spawnFood(){
 const x=rnd(70,WORLD.w-70),y=rnd(70,WORLD.h-70);
 if(collides(x,y,34))return;
 carcasses.push({x,y,r:9,amount:19,type:"berries",ttl:220,phase:rnd(0,6)});
}
function collides(x,y,r){if(x<r+12||y<r+12||x>WORLD.w-r-12||y>WORLD.h-r-12)return true;return nearBuilding(x,y,r*.8)}
function move(o,dx,dy){if(!collides(o.x+dx,o.y,o.r))o.x+=dx;if(!collides(o.x,o.y+dy,o.r))o.y+=dy;}
function lineBlocked(a,b){
 for(const box of buildings){
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
 const sightRange=(sp.prey?185:265)*(weather==="FOG"?.62:weather==="RAIN"?.82:1)*(night?.8:1)*(P.hidden?.29:1);
 const los=!lineBlocked(m,P);
 const facing=Math.atan2(P.y-m.y,P.x-m.x);
 const delta=Math.atan2(Math.sin(facing-m.dir),Math.cos(facing-m.dir));
 // Small prey have broad peripheral vision; hunters must actually face a target.
 const inSight=Math.abs(delta)<(sp.prey?2.22:1.37)||d<57;
 const visibleNow=los&&inSight&&d<Math.max(42,sightRange);
 // Sound is attenuated by buildings, but does not magically require line of sight.
 const heard=d<(los?38:24)+P.noise*(los?116:58);
 const wind=Math.sin(elapsed*.022)*Math.PI;
 const smelled=d<(weather==="RAIN"?38:75)&&Math.cos(Math.atan2(m.y-P.y,m.x-P.x)-wind)>.45;
 return visibleNow||heard||smelled||(los&&d<P.r+m.r+17);
}
function getAxes(){
 let x=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0)+joy.x;
 let y=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0)+joy.y;
 const l=Math.hypot(x,y);return l>1?{x:x/l,y:y/l}:{x,y};
}
function blood(x,y,color,count=9,speed=125){for(let i=0;i<count;i++){const a=rnd(0,TWO),v=rnd(speed*.2,speed);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(.25,.8),max:.8,size:rnd(1.6,4.4),color});}}
function label(x,y,t,color="#ffffff"){popups.push({x,y,t,color,life:1.1})}
function notify(t){toastMessage=t;toastTime=2.1;$("toast").textContent=t;$("toast").classList.add("show")}
function sound(f=350,d=.12,wave="triangle",vol=.035){
 if(!soundEnabled)return;
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();
  const o=audio.createOscillator(),g=audio.createGain();o.type=wave;o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(50,f*.63),audio.currentTime+d);
  g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);
  o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d+.02);
 }catch(e){}
}
function instinct(){
 if(mode!=="play"||P.instinctCD>0||P.sp<18)return;
 P.sp-=18;P.instinctCD=P.type==="wolf"?16:12;P.abilityTime=P.type==="cat"?3.2:4;
 if(P.type==="fox"){P.senseTime=Math.max(P.senseTime,4);notify("狐眼 / 気配が見える。次の一撃が強化");sound(660,.28,"sine",.04)}
 if(P.type==="cat"){P.dash=Math.min(P.dash,.25);notify("俊足 / 3秒間の加速と回避");sound(820,.19,"triangle",.04)}
 if(P.type==="wolf"){
  P.noiseBurst=1.8;
  for(const m of mobs){if(m.hp<=0||dist(P,m)>245||lineBlocked(P,m))continue;
   if(m.type==="alpha"||m.type==="boar"){m.alert=Math.max(m.alert,1.4);continue}
   m.flee=2.3;m.dir=Math.atan2(m.y-P.y,m.x-P.x);m.alert=0;m.search=0;}
  blood(P.x,P.y,"#dce3db",16,140);notify("咆哮 / 周囲の小動物を威圧");sound(130,.36,"sawtooth",.07);
 }
}
function combatAim(maxTurn=.56){
 // A small forward-facing correction makes a single-button attack usable on touch,
 // but never snaps to a target behind the player or through a wall.
 let best=null,bestScore=Infinity,aim=P.dir;
 for(const m of mobs){
  if(m.hp<=0||dist(P,m)>P.r+m.r+105||lineBlocked(P,m))continue;
  const angle=Math.atan2(m.y-P.y,m.x-P.x);
  const diff=Math.atan2(Math.sin(angle-P.dir),Math.cos(angle-P.dir));
  if(Math.abs(diff)>1.28)continue;
  const score=dist(P,m)+(huntTarget===m?-24:0)+Math.abs(diff)*28;
  if(score<bestScore){best=m;bestScore=score;aim=P.dir+clamp(diff,-maxTurn,maxTurn)}
 }
 if(best)P.dir=aim;
 return best;
}
function attack(){
 if(mode!=="play"||P.atk>0||P.pendingStrike)return;
 const cost=P.type==="wolf"?17:P.type==="cat"?9:12;
 if(P.sp<cost){P.atk=.18;if((P.tiredNotice||0)<=0){P.tiredNotice=1.5;notify("息切れ / 少し間合いを取れ")}return}
 P.sp-=cost;P.atk=P.rate;P.windup=Math.min(.15,P.rate*.38);P.pendingStrike=true;P.ambushStrike=P.hidden&&P.revealTimer<=0;
 const target=combatAim(P.type==="cat"?.72:P.type==="wolf"?.32:.55);
 // Fox instinct is a short, collision-safe forward pounce, not a teleport.
 if(P.type==="fox"&&P.abilityTime>0&&target){
  const distance=dist(P,target),angle=Math.atan2(target.y-P.y,target.x-P.x);
  const travel=Math.min(53,Math.max(0,distance-(P.r+target.r+30)));
  if(travel>4&&routeClear(P,{x:P.x+Math.cos(angle)*travel,y:P.y+Math.sin(angle)*travel},P.r)){
   P.pounceTime=.18;P.pounceRemaining=travel;P.pounceDir=angle;
   P.windup=Math.max(P.windup,.24);
   blood(P.x,P.y,"#ffe6a6",5,38);
  }
 }
 P.hidden=false;P.revealTimer=1.15;P.steps+=.1;
 P.noiseBurst=Math.max(P.noiseBurst,1.05);sound(260,.055,"triangle",.018);
}
function resolveAttack(){
 if(mode!=="play"||!P.pendingStrike)return;
 P.pendingStrike=false;P.swing=.18;let hit=0;const stealthHit=P.ambushStrike;P.ambushStrike=false;
 mobs.forEach(m=>{
  if(m.hp<=0)return;
  const d=dist(P,m),theta=Math.atan2(m.y-P.y,m.x-P.x),angle=Math.atan2(Math.sin(theta-P.dir),Math.cos(theta-P.dir));
  const reach=P.type==="wolf"?55:P.type==="cat"?39:51;
  const arc=P.type==="wolf"?1.18:P.type==="cat"?.95:1.03;
  // Claws cannot pass through solid buildings, even at a diagonal corner.
  if(d<P.r+m.r+reach&&Math.abs(angle)<arc&&!lineBlocked(P,m)){
   const foxBurst=P.type==="fox"&&P.abilityTime>0;
   const bonus=(foxBurst?1.7:1)*(stealthHit?1.55:1);
   const damage=Math.round(P.damage*bonus*rnd(.86,1.16));m.hp-=damage;
   if(foxBurst)P.abilityTime=0;
   m.flash=.16;m.alert=3;m.lastX=P.x;m.lastY=P.y;m.search=0;m.flee=0;
   m.windup=0;m.stun=stealthHit?.92:P.type==="wolf"?.66:P.type==="cat"?.23:.41;m.attack=Math.max(m.attack,.45);hit++;
   if(stealthHit){label(m.x,m.y-m.r-37,"奇襲！","#bdf9c7");blood(m.x,m.y,"#c7f3b7",8,90)}
   blood(m.x,m.y,m.hp>0?"#f7c77c":"#c65b4f",12,155);label(m.x,m.y-28,"-"+damage,"#ffe5b4");
   const knock=P.type==="wolf"?17:P.type==="cat"?3:8;
   move(m,Math.cos(theta)*knock,Math.sin(theta)*knock);
   if(P.type==="wolf"&&m.hp>0)label(m.x,m.y-m.r-28,"よろめき","#ffe0a6");
   if(m.hp<=0)kill(m);
  }
 });
 if(hit){shake=4;flash=.1;sound(130,.12,"sawtooth",.035)}else sound(290,.09,"triangle",.024);
}
function kill(m){
 kills++;P.combo=P.comboTimer>0?P.combo+1:1;P.comboTimer=4.5;
 carcasses.push({x:m.x,y:m.y,r:Math.max(9,m.r*.78),amount:species[m.type].food,type:"meat",ttl:42,phase:rnd(0,6)});
 P.xp+=species[m.type].xp;
 label(m.x,m.y-50,"+"+species[m.type].xp+" DNA","#9aeac7");
 if(P.xp>=P.nextXp){P.xp-=P.nextXp;P.level++;P.nextXp=Math.round(P.nextXp*1.5+2);mode="upgrade";show("upgrade");sound(720,.35,"sine",.08)}
 if(kills===3||kills===9)notify("狩猟成功 / 食物連鎖が変化する");
 checkMission();
}
function dash(){
 if(mode!=="play"||P.dash>0||P.sp<(P.type==="cat"&&P.abilityTime>0?20:28))return;
 const a=getAxes();if(Math.hypot(a.x,a.y)>.15){P.dir=Math.atan2(a.y,a.x)}
 P.dx=Math.cos(P.dir);P.dy=Math.sin(P.dir);
 const agile=P.type==="cat"&&P.abilityTime>0;
 P.sp-=agile?20:28;P.pounceTime=0;P.pounceRemaining=0;P.dashTime=P.type==="wolf"?.18:agile?.25:.21;
 P.inv=agile?.39:P.type==="wolf"?.23:.28;
 P.dash=agile?.52:P.type==="cat"?.85:P.type==="wolf"?1.2:1.05;P.vx=0;P.vy=0;P.pendingStrike=false;P.ambushStrike=false;P.revealTimer=1.15;P.windup=0;P.noiseBurst=1.5;blood(P.x,P.y,"#a6e6d4",9,45);sound(250,.22,"sine",.05);
}
function sense(){
 if(mode!=="play"||P.sense>0)return;
 P.sense=12;P.senseTime=4;particles.push({x:P.x,y:P.y,life:.85,max:.85,ring:true,r:3,color:"#82eac8"});
 notify("気配を探知 / 生命反応を表示");sound(660,.34,"sine",.035);
}
function eat(){
 if(mode!=="play")return;
 let c=null,near=65;
 for(const f of carcasses){const d=dist(P,f);if(d<near&&!lineBlocked(P,f)){near=d;c=f}}
 if(!c){notify("食べ物が近くにない");return}
 P.hunger=clamp(P.hunger+c.amount,0,100);P.hp=clamp(P.hp+(c.type==="meat"?8:3),0,P.maxHp);meals++;
 carcasses.splice(carcasses.indexOf(c),1);label(P.x,P.y-30,"+"+c.amount+" FOOD","#bfe89e");
 blood(P.x,P.y,"#d6c17f",7,45);sound(440,.13,"sine",.035);checkMission();
}
function checkMission(){
 if(mission===0&&meals>=1){mission=1;notify("食料確保！ ▲ 茂みで身を隠せ")}
 if(mission===1&&hiddenHold>=.75){mission=2;notify("潜伏成功！ ▲ 獲物を追え")}
 if(mission===2&&kills>=1){mission=3;notify("初狩猟成功！ ▲ 旧新宿駅へ向かえ")}
 if(mission===3&&Math.hypot(P.x-2460,P.y-1170)<115){mission=4;freeStep=0;freeTarget=meals+1;notify("探索区域に到着 / 新たな生存目標が始まる")}
 if(mission===4){
  if(freeStep===0&&meals>=freeTarget){freeStep=1;freeTarget=kills+1;notify("補給完了！ ▲ 次の獲物を追え")}
  else if(freeStep===1&&kills>=freeTarget){freeStep=0;freeTarget=meals+1;expedition++;notify("生存記録 "+expedition+" / ▲ 次の食料を探せ")}
 }
}
function nearestGoal(list){
 if(!P||!list.length)return null;
 let bestItem=null,bestDist=Infinity;
 for(const q of list){const d=dist(P,q);if(d<bestDist){bestDist=d;bestItem=q}}
 return bestItem;
}
function getObjective(){
 if(!P||mode==="menu"||mode==="over"||mode==="clear")return null;
 if(mission===1){
  const p=nearestGoal(plants.filter(p=>p.type===2));
  return p?{x:p.x,y:p.y,label:"茂みで静止 / Cで潜伏"}:null;
 }
 if(mission===3)return {x:2460,y:1170,label:"旧新宿駅方面"};
 const findFood=mission===0||(mission===4&&freeStep===0);
 if(findFood){
  const f=nearestGoal(carcasses.filter(q=>q.ttl>0));
  return f?{x:f.x,y:f.y,label:"食料を取る / E"}:null;
 }
 // Keep one visible hunting objective until it is lost, killed, or truly far away.
 // Otherwise the ▲ flips between different prey every few frames.
 if(!huntTarget||huntTarget.hp<=0||!mobs.includes(huntTarget)||dist(P,huntTarget)>760)
  huntTarget=nearestGoal(mobs.filter(q=>q.hp>0&&species[q.type].prey));
 if(!huntTarget)return null;
 const lead=.22,px=clamp(huntTarget.x+(huntTarget.vx||0)*lead,35,WORLD.w-35);
 const py=clamp(huntTarget.y+(huntTarget.vy||0)*lead,35,WORLD.h-35);
 const safe=!collides(px,py,P.r+5);
 return {x:safe?px:huntTarget.x,y:safe?py:huntTarget.y,label:"獲物を追う / Jで攻撃"};
}
function finish(won=false){
 if(!P)return;
 mode=won?"clear":"over";
 totalScore=Math.floor(elapsed*4+kills*88+(P.level-1)*110+(day-1)*170);
 if(totalScore>best){best=totalScore;try{localStorage.setItem("wild-reclaim-best",String(best))}catch(e){}}
 $("result-kicker").textContent=won?"TOKYO RECLAIMED":"SURVIVAL REPORT";
 $("result-title").textContent=won?"SURVIVED":"GAME OVER";
 $("result-title").style.color=won?"#a1edbe":"#f5ede0";
 $("result-reason").textContent=won?"生態系の頂点へ。東京に、あなたの縄張りを刻んだ。":"東京の食物連鎖に飲み込まれた。次は生き延びろ。";
 $("result-score").textContent=String(totalScore).padStart(6,"0");
 $("result-stats").innerHTML="<span>DAY "+String(day).padStart(2,"0")+"</span><span>HUNT "+String(kills).padStart(2,"0")+"</span><span>LEVEL "+String(P.level).padStart(2,"0")+"</span>";
 $("best-score").textContent="BEST SCORE "+String(best).padStart(6,"0");
 show("result");sound(won?700:140,.5,won?"sine":"sawtooth",.045);
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
  // Rats hide, rabbits bound in straight lines, pigeons jink sideways.
  const coverWeight=m.type==="rat"?3.3:m.type==="rabbit"?.5:.25;
  const forwardWeight=m.type==="rabbit"?3.3:m.type==="rat"?1.65:1.55;
  const sideStep=m.type==="pigeon"?Math.sin(off)*(m.evasionSide||1)*1.35:0;
  const score=Math.cos(off)*forwardWeight+distance*.003+cover*coverWeight+sideStep-Math.abs(off)*.1;
  if(score>bestScore){bestScore=score;best=angle}
 }
 return best;
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
function update(dt){
 navPlansThisFrame=0;
 elapsed+=dt;day=1+Math.floor(elapsed/85);
 const phase=elapsed%85;const hr=(6+Math.floor(phase/85*24))%24;
 const newWeather=day%4===0?"FOG":day%3===0?"RAIN":"CLEAR";if(newWeather!==weather){weather=newWeather;notify(weather==="RAIN"?"酸性雨の気配 / 視界が悪化":weather==="FOG"?"濃霧 / 視界が悪化":"空が晴れてきた")}
 const oldDay=day; // accounted above
 if(Math.floor((elapsed-dt)/85)<Math.floor(elapsed/85)){notify("DAY "+String(day).padStart(2,"0")+" / 野生はさらに凶暴になる");P.hp=Math.min(P.maxHp,P.hp+18)}
 P.atk=Math.max(0,P.atk-dt);P.dash=Math.max(0,P.dash-dt);P.dashTime=Math.max(0,P.dashTime-dt);P.inv=Math.max(0,P.inv-dt);P.sense=Math.max(0,P.sense-dt);P.senseTime=Math.max(0,P.senseTime-dt);P.revealTimer=Math.max(0,P.revealTimer-dt);P.instinctCD=Math.max(0,P.instinctCD-dt);P.abilityTime=Math.max(0,P.abilityTime-dt);P.swing=Math.max(0,(P.swing||0)-dt);P.comboTimer=Math.max(0,P.comboTimer-dt);if(P.pendingStrike){P.windup=Math.max(0,P.windup-dt);if(P.windup===0)resolveAttack()}
 P.sp=clamp(P.sp+17*dt,0,100);P.tiredNotice=Math.max(0,(P.tiredNotice||0)-dt);P.hunger=clamp(P.hunger-(.38+(day-1)*.035)*dt,0,100);
 if(P.hunger<16)P.hp-=(P.hunger===0?7:1.2)*dt;
 const a=getAxes(),len=Math.hypot(a.x,a.y),sneaking=keys.has("c")||keys.has("control");
  if(P.pounceTime>0){
   const step=Math.min(P.pounceRemaining,P.pounceRemaining/Math.max(P.pounceTime,dt)*dt);
   const ox=P.x,oy=P.y;
   move(P,Math.cos(P.pounceDir)*step,Math.sin(P.pounceDir)*step);
   const moved=Math.hypot(P.x-ox,P.y-oy);
   P.pounceRemaining=Math.max(0,P.pounceRemaining-moved);
   P.pounceTime=Math.max(0,P.pounceTime-dt);
   if(moved<step*.5||P.pounceRemaining<.5){
    P.pounceTime=0;P.pounceRemaining=0;P.vx=0;P.vy=0;
   }else{
    P.vx=(P.x-ox)/Math.max(dt,.001);P.vy=(P.y-oy)/Math.max(dt,.001);
   }
   P.steps+=moved*.052;
  }else if(P.dashTime>0){
   P.vx=0;P.vy=0;move(P,P.dx*P.speed*(P.type==="cat"?4.35:P.type==="wolf"?3.05:3.8)*dt,P.dy*P.speed*(P.type==="cat"?4.35:P.type==="wolf"?3.05:3.8)*dt);
   if(Math.random()<.7)blood(P.x,P.y,"#d5e4bb",1,25);
  }else{
   const target=P.speed*(sneaking?.34:1)*(P.pendingStrike?.7:1)*(P.type==="cat"&&P.abilityTime>0?1.48:1);
   const dx=a.x*target-P.vx,dy=a.y*target-P.vy,length=Math.hypot(dx,dy);
   const limit=(len>.08?(P.type==="wolf"?590:P.type==="cat"?1320:900):(P.type==="wolf"?760:P.type==="cat"?1640:1300))*dt;
   const ratio=length>limit?limit/length:1;
   P.vx+=dx*ratio;P.vy+=dy*ratio;
   const oldX=P.x,oldY=P.y;move(P,P.vx*dt,P.vy*dt);
   if(P.x===oldX)P.vx=0;if(P.y===oldY)P.vy=0;
   const speed=Math.hypot(P.vx,P.vy);
   if(speed>8){
    const facing=Math.atan2(P.vy,P.vx);
    const diff=Math.atan2(Math.sin(facing-P.dir),Math.cos(facing-P.dir));
    P.dir+=diff*Math.min(1,dt*(P.type==="wolf"?5.5:P.type==="cat"?19:11));
    P.steps+=speed*dt*.052;
   }
  }
  const speed=Math.hypot(P.vx,P.vy);
  P.noiseBurst=Math.max(0,P.noiseBurst-dt*1.6);
  P.noise=clamp(speed/P.speed*(sneaking?.28:.94)+P.noiseBurst,0,1.8);
  P.hidden=P.revealTimer<=0&&inCover(P)&&(sneaking||speed<P.speed*.45)&&P.dashTime<=0;hiddenHold=P.hidden?hiddenHold+dt:Math.max(0,hiddenHold-dt*.6);
  if((keys.has("j")||keys.has(" ")||attackTouch)&&P.atk<=0)attack();
 
 P.eatCD=Math.max(0,(P.eatCD||0)-dt);
 if(P.hp<=0){P.hp=0;finish(false);return}
 const chaseRange=weather==="FOG"?195:260;
 for(const m of mobs){
  if(m.hp<=0)continue;
  const s=species[m.type];m.wander-=dt;m.attack=Math.max(0,m.attack-dt);m.flash=Math.max(0,m.flash-dt);m.stun=Math.max(0,m.stun-dt);m.escapeTimer=Math.max(0,m.escapeTimer-dt);if(s.prey)m.fleeEnergy=clamp(m.fleeEnergy+(m.flee>0?-dt*.32:dt*.2),0,1);
  const d=dist(P,m),angle=Math.atan2(P.y-m.y,P.x-m.x),spotted=detectsPlayer(m,s,d);
   if(spotted){m.lastX=P.x;m.lastY=P.y;m.alert=s.prey?1.8:5.5;m.search=0}
   let vx=0,vy=0;
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
    // Suspicious prey stop and watch instead of instantly sprinting from offscreen.
    m.dir=angle;m.wander=Math.max(m.wander,.3);vx=0;vy=0;
   }else if(!s.prey&&m.alert>0){
    m.alert=Math.max(0,m.alert-dt);
    const aim=Math.atan2(m.lastY-m.y,m.lastX-m.x);
    if(!spotted&&Math.hypot(m.lastX-m.x,m.lastY-m.y)<30){m.search=Math.max(m.search,1.15);m.alert=Math.min(m.alert,1.15)}
    if(m.search>0&&!spotted){
     m.search=Math.max(0,m.search-dt);
     if(m.wander<0){m.dir=aim+rnd(-1.6,1.6);m.wander=rnd(.3,.8)}
     vx=Math.cos(m.dir)*s.speed*.32;vy=Math.sin(m.dir)*s.speed*.32;
    }else{m.dir=steerPursuit(m,m.lastX,m.lastY);vx=Math.cos(m.dir)*s.speed;vy=Math.sin(m.dir)*s.speed}
   }else{
    m.alert=Math.max(0,m.alert-dt);
    if(m.wander<0){m.dir+=rnd(-2.5,2.5);m.wander=rnd(.5,2.5)}
    vx=Math.cos(m.dir)*s.speed*.23;vy=Math.sin(m.dir)*s.speed*.23;
   }
   if(!s.prey&&m.windup>0){
     vx=0;vy=0;m.windup=Math.max(0,m.windup-dt);
     if(m.windup===0){
       const reach=P.r+m.r+37,aim=Math.atan2(P.y-m.y,P.x-m.x);
       const delta=Math.atan2(Math.sin(aim-m.strikeDir),Math.cos(aim-m.strikeDir));
       if(m.stun<=0&&P.inv<=0&&dist(P,m)<reach&&Math.abs(delta)<.92&&!lineBlocked(m,P)){
         const damage=Math.round(s.damage*(1+Math.max(0,day-1)*.15));
         P.hp-=damage;P.inv=.55;shake=9;flash=.23;
         label(P.x,P.y-35,"-"+damage,"#ff9890");
         blood(P.x,P.y,"#eb6356",12,125);sound(90,.2,"sawtooth",.08);
       }else if(dist(P,m)<reach+50)label(m.x,m.y-m.r-16,"回避！","#a6f5d8");
     }
   }
   if(m.stun>0){vx=0;vy=0}
   const ox=m.x,oy=m.y;move(m,vx*dt,vy*dt);m.vx=(m.x-ox)/Math.max(.001,dt);m.vy=(m.y-oy)/Math.max(.001,dt);m.step+=Math.hypot(m.x-ox,m.y-oy)*.05;
  if(ox===m.x&&oy===m.y){m.dir+=1.7;m.wander=0;if(!s.prey)m.avoidSide=-(m.avoidSide||1)}
  if(!s.prey&&m.windup<=0&&m.stun<=0&&d<P.r+m.r+29&&(spotted||m.alert>0)&&m.attack<=0){
   m.windupTotal=m.type==="boar"?.76:m.type==="alpha"?.58:.53;
   m.windup=m.windupTotal;m.strikeDir=angle;m.attack=1.45;
   m.dir=angle;label(m.x,m.y-m.r-24,"危険！","#ffb76d");
   sound(310,.11,"sawtooth",.03);
  }
 }
 for(let i=mobs.length-1;i>=0;i--)if(mobs[i].hp<=0||dist(mobs[i],P)>Math.max(vw,vh)*2.7)mobs.splice(i,1);
 for(let i=carcasses.length-1;i>=0;i--)if((carcasses[i].ttl-=dt)<=0)carcasses.splice(i,1);
 for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.life-=dt;q.x+=(q.vx||0)*dt;q.y+=(q.vy||0)*dt;if(q.life<=0)particles.splice(i,1)}
 for(let i=popups.length-1;i>=0;i--){popups[i].life-=dt;popups[i].y-=28*dt;if(popups[i].life<=0)popups.splice(i,1)}
 spawnTimer+=dt;if(spawnTimer>1.45){spawnTimer=0;if(mobs.length<27+day*2)spawnMob();if(carcasses.filter(c=>c.type==="berries").length<20)spawnFood()}
 checkMission();shake*=Math.max(0,1-dt*9);flash=Math.max(0,flash-dt);
 if(toastTime>0){toastTime-=dt;if(toastTime<=0)$("toast").classList.remove("show")}
 cam.x+=(clamp(P.x-vw/2,0,Math.max(0,WORLD.w-vw))-cam.x)*Math.min(1,dt*6);
 cam.y+=(clamp(P.y-vh/2,0,Math.max(0,WORLD.h-vh))-cam.y)*Math.min(1,dt*6);
 uiTimer+=dt;if(uiTimer>.14){uiTimer=0;syncHUD(hr);drawMini()}
}
function syncHUD(hour){
 if(!P)return;
 const setBar=(name,v)=>$(name).style.width=clamp(v,0,100)+"%";
 setBar("hp-bar",P.hp/P.maxHp*100);setBar("food-bar",P.hunger);setBar("sp-bar",P.sp);
 $("hp-text").textContent=Math.ceil(P.hp)+" / "+P.maxHp;
 $("food-text").textContent=Math.ceil(P.hunger)+"%";$("sp-text").textContent=Math.ceil(P.sp)+"%";
 $("level").textContent="LV "+String(P.level).padStart(2,"0");setBar("xp-bar",P.xp/P.nextXp*100);
 const zone=Math.min(3,Math.floor(P.x/(WORLD.w/4)));$("district-tag").textContent="AREA 0"+(zone+1)+" / 04";$("district").textContent=districts[zone];
 $("day-label").textContent="DAY "+String(day).padStart(2,"0")+" · "+String(hour===undefined?6:hour).padStart(2,"0")+":00 · "+({CLEAR:"晴天",RAIN:"降雨",FOG:"濃霧"}[weather]);
 const objectives=[
  ["食料を確保せよ","▲ に従って食料へ / Eで食べる",meals],
  ["身を隠せ","▲ の茂みで静止 / Cで潜伏",hiddenHold/.75],
  ["獲物を仕留めろ","▲ の獲物を追い、Jで攻撃",kills],
  ["旧新宿駅を目指せ","▲ を追って東へ進む",(P.x-1850)/540],
  freeStep===0?["食料を補給せよ","▲ の食料を探す",0]:["狩りを続けろ","▲ の獲物を追う",0]
 ];
 const ob=objectives[Math.min(mission,4)];
 $("mission-progress").textContent=mission<4?"0"+(mission+1)+" / 04":"探索 "+expedition;
 $("mission-title").textContent=ob[0];$("mission-sub").textContent=ob[1];setBar("mission-bar",mission===4?0:ob[2]*100);
 const goal=getObjective(),guide=$("mission-guide");
 const skill=$("instinct-name");if(skill)skill.textContent=P.type==="fox"?"狐眼":P.type==="cat"?"俊足":"咆哮";
 if(guide)guide.textContent=goal?"▲ "+goal.label+" · 残り"+Math.round(dist(P,goal))+(guidancePoint(goal)?.blocked?" / 経路再探索":guidancePoint(goal)?.detour?" / 迂回":""):"▲ 周囲を探索中";
 $("kill-line").textContent="HUNT "+String(kills).padStart(2,"0");
 $("score-line").textContent="SCORE "+String(Math.floor(elapsed*4+kills*88+(P.level-1)*110)).padStart(6,"0");
 $("combo-line").textContent=P.comboTimer>0&&P.combo>1?"COMBO ×"+P.combo:"";
 $("dash-touch").style.opacity=P.dash>0||P.sp<(P.type==="cat"&&P.abilityTime>0?20:28)?".5":"1";$("sense-touch").style.opacity=P.sense>0?".5":"1";$("instinct-touch").style.opacity=P.instinctCD>0||P.sp<18?".5":"1";
}
function drawMini(){
 if(!P)return;
 const w=mini.width,h=mini.height;
 mc.fillStyle="#132728";mc.fillRect(0,0,w,h);
 mc.strokeStyle="#486264";mc.lineWidth=4;
 for(const x of roadsX){mc.beginPath();mc.moveTo(x/WORLD.w*w,0);mc.lineTo(x/WORLD.w*w,h);mc.stroke()}
 for(const y of roadsY){mc.beginPath();mc.moveTo(0,y/WORLD.h*h);mc.lineTo(w,y/WORLD.h*h);mc.stroke()}
 mc.fillStyle="#3d5051";for(const b of buildings)mc.fillRect(b.x/WORLD.w*w,b.y/WORLD.h*h,b.w/WORLD.w*w,b.h/WORLD.h*h);
 for(const m of mobs){if(dist(P,m)>650&&P.senseTime<=0)continue;mc.fillStyle=species[m.type].prey?"#c4d1ab":"#f39c74";mc.fillRect(m.x/WORLD.w*w-1,m.y/WORLD.h*h-1,2.5,2.5)}
 const obj=getObjective();if(obj){const tx=obj.x/WORLD.w*w,ty=obj.y/WORLD.h*h;mc.fillStyle="#ffda82";mc.beginPath();mc.moveTo(tx,ty-5);mc.lineTo(tx-4,ty+3);mc.lineTo(tx+4,ty+3);mc.closePath();mc.fill();}
 mc.fillStyle="#fff5c4";mc.beginPath();mc.arc(P.x/WORLD.w*w,P.y/WORLD.h*h,3,0,TWO);mc.fill();
 mc.strokeStyle="#a3e7c5";mc.lineWidth=.8;mc.strokeRect(cam.x/WORLD.w*w,cam.y/WORLD.h*h,vw/WORLD.w*w,vh/WORLD.h*h);
}
function visible(x,y,r=50){return x+r>cam.x-80&&x-r<cam.x+vw+80&&y+r>cam.y-80&&y-r<cam.y+vh+80}
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
}
function drawBuilding(b){
 const x=b.x,y=b.y,w=b.w,h=b.h;
 ctx.fillStyle="#050f13ab";ctx.fillRect(x+20,y+25,w,h);
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
function drawPlant(p){
 ctx.save();ctx.translate(p.x,p.y);let r=p.r;
 if(p.type===2){
   ctx.fillStyle="#1e3424b8";ctx.beginPath();ctx.ellipse(0,5,r*1.2,r*.67,.1,0,TWO);ctx.fill();
   for(let j=0;j<9;j++){const a=j*TWO/9+p.phase,px=Math.cos(a)*r*.64,py=Math.sin(a)*r*.5;
    ctx.fillStyle=j%2?"#3d6542":"#52754c";ctx.beginPath();ctx.ellipse(px,py,r*.39,r*.27,a,0,TWO);ctx.fill()}
   ctx.restore();return;
  }
  if(p.type===1){ctx.fillStyle="#4e5b4b";ctx.beginPath();ctx.ellipse(0,3,r*1.2,r*.47,.2,0,TWO);ctx.fill();
  for(let j=0;j<5;j++){let a=j*TWO/5+p.phase;ctx.strokeStyle="#78926d";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke()}
 }else{ctx.fillStyle="#0c1b1b66";ctx.beginPath();ctx.ellipse(3,7,r,r*.55,0,0,TWO);ctx.fill();
  for(let j=0;j<5;j++){let a=j*TWO/5+p.phase;ctx.fillStyle=j%2?"#315947":"#47765c";ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.42,Math.sin(a)*r*.43,r*.65,r*.43,a,0,TWO);ctx.fill()}
  ctx.fillStyle="#668a64";ctx.beginPath();ctx.arc(0,0,r*.48,0,TWO);ctx.fill()}
 ctx.restore();
}
function drawItem(c){
 const pulse=Math.sin(elapsed*3+c.phase)*2;
 ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle="#04131590";ctx.beginPath();ctx.ellipse(2,5,17,7,0,0,TWO);ctx.fill();
 if(c.type==="meat"){ctx.fillStyle="#a75247";ctx.beginPath();ctx.ellipse(0,-2,9+pulse*.2,6,-.25,0,TWO);ctx.fill();ctx.fillStyle="#e8bdb0";ctx.fillRect(7,-6,9,3);ctx.beginPath();ctx.arc(15,-5,3,0,TWO);ctx.fill()}
 else{ctx.fillStyle="#648f66";ctx.beginPath();ctx.arc(0,0,12,0,TWO);ctx.fill();for(let i=0;i<4;i++){ctx.fillStyle=i%2?"#d6b17b":"#d77d5b";ctx.beginPath();ctx.arc(Math.sin(i*3)*6,Math.cos(i*2)*5,3,0,TWO);ctx.fill()}}
 if(P&&dist(P,c)<64){ctx.strokeStyle="#e7e1a7a6";ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,19+pulse,0,TWO);ctx.stroke()}
 ctx.restore();
}
function drawCreature(o,isPlayer){
 const s=isPlayer?P.base:species[o.type],r=o.r,t=o.type;
 const hit=!isPlayer&&o.flash>0,fur=hit?"#ffe4bc":s.color,light=s.belly;
 const gait=(isPlayer?o.steps:o.step)||0;
 const motion=isPlayer&&P.dashTime>0?1.5:clamp(Math.hypot(o.vx||0,o.vy||0)/Math.max(1,s.speed),0,1.5);
 const pace=Math.sin(gait*.9)*r*.12*motion;
 const tailSway=Math.sin(gait*.62)*r*.22*motion;
 const oval=(x,y,w,h,color,rot=0)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.5,w),Math.max(.5,h),rot,0,TWO);ctx.fill();
 };
 const triangle=(pts,color)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);
  for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);
  ctx.closePath();ctx.fill();
 };
 ctx.save();ctx.translate(o.x,o.y);
 oval(4,9,r*1.2,r*.55,"#031011a8");
 ctx.rotate(o.dir||0);
 ctx.translate(0,Math.abs(Math.sin(gait*.9))*motion*r*.045);
 if(isPlayer){ctx.scale(1.14,1.14);if(P.pounceTime>0)ctx.scale(1.16,.86)}
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
  oval(-r*.15,0,r*.82,r*.72,fur);
  oval(r*.57,0,r*.44,r*.43,fur);
  for(const sign of [-1,1]){
   oval(r*.48,sign*r*.99,r*.26,r*.69,fur,sign*.18);
   oval(r*.48,sign*r*.99,r*.11,r*.48,"#e9ada7",sign*.18);
   oval(-r*.35,sign*r*.49+pace*sign,r*.24,r*.16,"#a99b87");
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
  // 猫だけ細い身体、長く曲がる尻尾、丸い頭と小さい三角耳。
  ctx.strokeStyle=fur;ctx.lineWidth=r*.27;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-r*.7,-r*.06);ctx.bezierCurveTo(-r*1.6,-r*.7,-r*1.8,r*.68+tailSway,-r*2.25,-r*.26+tailSway);ctx.stroke();
  for(const sign of [-1,1]){
   oval(-r*.44,sign*r*.48+pace*sign,r*.2,r*.28,fur);
   oval(r*.36,sign*r*.44-pace*sign,r*.19,r*.27,fur);
  }
  oval(-r*.14,0,r*.79,r*.56,fur);
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
  // 大きい白先端のふさふさした尾と長い尖った鼻、黒脚が狐の輪郭。
  ctx.fillStyle=fur;ctx.beginPath();ctx.moveTo(-r*.55,-r*.4);ctx.bezierCurveTo(-r*1.15,-r*.79,-r*1.8,-r*.85+tailSway,-r*2.5,-r*.26+tailSway);
  ctx.bezierCurveTo(-r*2.9,r*.15+tailSway,-r*1.65,r*.71,-r*.63,r*.38);ctx.closePath();ctx.fill();
  triangle([-r*2.18,-r*.47+tailSway,-r*2.62,-r*.21+tailSway,-r*2.29,r*.15+tailSway],"#fff2d7");
  for(const side of [-1,1])for(const px of [-.47,.3]){
   oval(px*r,side*r*.52+pace*side,r*.16,r*.31,"#292a26");
  }
  oval(-r*.1,0,r*.87,r*.57,fur);
  oval(r*.23,0,r*.5,r*.4,light);
  oval(r*.62,0,r*.43,r*.46,fur);
  for(const side of [-1,1])triangle([r*.36,side*r*.34,r*.45,side*r*1.0,r*.85,side*r*.42],fur);
  triangle([r*.76,-r*.34,r*1.65,0,r*.76,r*.34],light);
  triangle([r*1.53,-r*.075,r*1.78,0,r*1.53,r*.075],"#252526");
  oval(r*.83,-r*.23,2.2,2.4,"#1a201c");oval(r*.83,r*.23,2.2,2.4,"#1a201c");
 }else{
  // 犬・狼・アルファは胴と肩が大きい。狼は立ち耳と鬣、犬は垂れ耳。
  const wolf=t==="wolf"||t==="alpha",alpha=t==="alpha";
  ctx.fillStyle=fur;ctx.beginPath();ctx.moveTo(-r*.62,-r*.31);ctx.lineTo(-r*1.54,-r*.64);ctx.lineTo(-r*1.7,-r*.33+tailSway);ctx.lineTo(-r*1.4,r*.39);ctx.lineTo(-r*.62,r*.33);ctx.fill();
  for(const side of [-1,1])for(const px of [-.44,.43])oval(px*r,side*r*.62+pace*side,r*.3,r*.35,wolf?"#4a5658":"#765d4c");
  oval(-r*.14,0,r*.99,r*.74,fur);
  oval(r*.1,-r*.04,r*.66,r*.57,wolf?"#576c73":"#8d6c51");
  if(wolf)for(const side of [-1,1])for(let k=0;k<3;k++)
   triangle([r*.01-k*r*.24,side*r*.52,-r*.08-k*r*.25,side*r*.92,r*.24-k*r*.25,side*r*.57],fur);
  oval(r*.7,0,r*.58,r*.58,fur);
  for(const side of [-1,1]){
   if(wolf)triangle([r*.38,side*r*.39,r*.49,side*r*1.03,r*.92,side*r*.44],fur);
   else oval(r*.41,side*r*.59,r*.23,r*.48,"#684d41",side*.44);
  }
  oval(r*1.03,0,r*.39,r*.23,light);oval(r*1.36,0,r*.12,r*.11,"#171d1d");
  oval(r*.9,-r*.26,2.7,2.4,alpha?"#eeaa8f":"#e1dab1");
  oval(r*.9,r*.26,2.7,2.4,alpha?"#eeaa8f":"#e1dab1");
  if(alpha){ctx.strokeStyle="#e6d5c5";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(r*.56,-r*.36);ctx.lineTo(r*.91,-r*.06);ctx.moveTo(r*.72,-r*.48);ctx.lineTo(r*1.05,-r*.19);ctx.stroke();}
 }
 if(isPlayer){
  ctx.strokeStyle=P.inv>0?"#f5b668a8":"#b5f1c8bd";ctx.lineWidth=1.3;
  ctx.beginPath();ctx.arc(0,0,r+5,0,TWO);ctx.stroke();
  ctx.font="900 10px sans-serif";ctx.textAlign="center";ctx.fillStyle="#f5fce8";
  ctx.fillText(P.hidden?"潜伏中":"YOU",0,-r-21);
  if(P.abilityTime>0){ctx.strokeStyle="#ffe0a0";ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(0,0,r+10,0,TWO);ctx.stroke();ctx.setLineDash([])}
 }
 ctx.restore();
 if(!isPlayer&&!s.prey&&o.hp<o.maxHp){ctx.fillStyle="#101719c9";ctx.fillRect(o.x-21,o.y-r-17,42,4);ctx.fillStyle="#e9a077";ctx.fillRect(o.x-21,o.y-r-17,42*o.hp/o.maxHp,4)}
 if(P&&P.senseTime>0&&!isPlayer){ctx.strokeStyle=s.prey?"#91ebbc":"#ef9274";ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,r+12+Math.sin(elapsed*8)*2,0,TWO);ctx.stroke()}
}
let guideCache=null,navGrid=new Map();
function routeClear(a,b,radius=P.r){
 // Exact swept-circle/expanded-AABB segment test, replacing per-18px sampling.
 const pad=(radius+5)*.8,border=radius+17;
 if(a.x<border||a.y<border||b.x<border||b.y<border||
    a.x>WORLD.w-border||b.x>WORLD.w-border||a.y>WORLD.h-border||b.y>WORLD.h-border)return false;
 const dx=b.x-a.x,dy=b.y-a.y;
 for(const box of buildings){
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
 // Food can sit next to a wall; direct the player to an actual reachable pickup spot.
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
function safeGuidePosition(x,y){
 const minX=39,maxX=Math.max(39,vw-39),minY=116,maxY=Math.max(116,vh-116);
 const base={x:clamp(x,minX,maxX),y:clamp(y,minY,maxY)};
 const rects=["mission","touch-layer"].map(id=>{
  const el=$(id);return el&&typeof el.getBoundingClientRect==="function"?el.getBoundingClientRect():null;
 }).filter(r=>r&&r.width>0&&r.height>0);
 const overlaps=(p,r)=>p.x>r.left-35&&p.x<r.right+35&&p.y>r.top-35&&p.y<r.bottom+52;
 let pos=base;
 for(let attempt=0;attempt<rects.length+1;attempt++){
  const r=rects.find(q=>overlaps(pos,q));if(!r)break;
  const options=[
   {x:clamp(r.right+39,minX,maxX),y:pos.y},
   {x:clamp(r.left-39,minX,maxX),y:pos.y},
   {x:pos.x,y:clamp(r.top-55,minY,maxY)},
   {x:pos.x,y:clamp(r.bottom+55,minY,maxY)}
  ].filter(p=>!rects.some(q=>overlaps(p,q)));
  if(!options.length)break;
  options.sort((a,b)=>Math.hypot(a.x-base.x,a.y-base.y)-Math.hypot(b.x-base.x,b.y-base.y));
  pos=options[0];
 }
 return pos;
}
function drawGoalGuide(){
 if(!P||mode!=="play")return;
 const goal=getObjective();if(!goal)return;
 const point=guidancePoint(goal),gx=point.x-cam.x,gy=point.y-cam.y,dx=point.x-P.x,dy=point.y-P.y;
 const angle=Math.atan2(dy,dx),range=Math.hypot(dx,dy);
 const onscreen=gx>70&&gy>110&&gx<vw-70&&gy<vh-108;
 const px=P.x-cam.x,py=P.y-cam.y;
 let x=gx,y=gy;
 if(!onscreen){
  const ux=Math.cos(angle),uy=Math.sin(angle),maxX=Math.max(70,vw*.5-90),maxY=Math.max(70,vh*.5-120);
  const radius=Math.min(maxX/Math.max(.01,Math.abs(ux)),maxY/Math.max(.01,Math.abs(uy)));
  x=clamp(px+ux*radius,70,vw-70);y=clamp(py+uy*radius,110,vh-110);
 }
 const safe=safeGuidePosition(x,y);x=safe.x;y=safe.y;
 ctx.save();ctx.translate(x,y);ctx.fillStyle="#102126e8";ctx.strokeStyle="#ffc967";ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,0,23,0,TWO);ctx.fill();ctx.stroke();
 ctx.save();ctx.rotate(angle+Math.PI/2);ctx.fillStyle="#ffe2a0";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="900 27px sans-serif";ctx.fillText("▲",0,-1);ctx.restore();
 ctx.fillStyle="#fff0ce";ctx.textAlign="center";ctx.textBaseline="top";ctx.font="800 11px sans-serif";ctx.shadowColor="#000";ctx.shadowBlur=8;
 ctx.fillText((point.blocked?"経路再探索":point.detour?"迂回 ▲ ":"▲ ")+Math.round(dist(P,goal)),0,29);ctx.restore();
}
function drawScene(){
 const x=cam.x+(shake?rnd(-shake,shake):0),y=cam.y+(shake?rnd(-shake,shake):0);
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#152423";ctx.fillRect(0,0,vw,vh);
 ctx.save();ctx.translate(-x,-y);
 const farLeft=Math.max(0,Math.floor(x/180)*180-180),farTop=Math.max(0,Math.floor(y/180)*180-180);
 ctx.fillStyle="#1d302a";ctx.fillRect(0,0,1050,WORLD.h);ctx.fillStyle="#25332d";ctx.fillRect(1050,0,1050,WORLD.h);ctx.fillStyle="#24352f";ctx.fillRect(2100,0,1050,WORLD.h);ctx.fillStyle="#203c30";ctx.fillRect(3150,0,1050,WORLD.h);
 for(let xx=farLeft;xx<x+vw+180;xx+=180)for(let yy=farTop;yy<y+vh+180;yy+=180){
  const n=noise(xx/180,yy/180);ctx.fillStyle=n>.5?"#536a4214":"#b6a8850a";ctx.beginPath();ctx.ellipse(xx+78,yy+65,75+n*30,45+n*19,n,0,TWO);ctx.fill();
 }
 roadDraw();
 for(const d of debris){if(!visible(d.x,d.y,16))continue;ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.a);ctx.fillStyle=d.kind===0?"#b5a47a45":d.kind===1?"#314945":"#66756b75";ctx.fillRect(-d.r*.5,-d.r*.2,d.r*1.8,d.r*.7);ctx.restore()}
 for(const p of plants)if(visible(p.x,p.y,35))drawPlant(p);
 for(const b of buildings)if(visible(b.x+b.w/2,b.y+b.h/2,Math.max(b.w,b.h)))drawBuilding(b);
 for(const c of carcasses)if(visible(c.x,c.y,40))drawItem(c);
 for(const lamp of lamps)if(visible(lamp.x,lamp.y,20)){
  ctx.strokeStyle="#849587";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(lamp.x,lamp.y+7);ctx.lineTo(lamp.x,lamp.y-15);ctx.stroke();ctx.fillStyle="#c8aa6f";ctx.fillRect(lamp.x-7,lamp.y-18,14,5)}
 const entities=mobs.filter(m=>visible(m.x,m.y,70));if(P)entities.push(P);
 entities.sort((a,b)=>a.y-b.y);
 for(const e of entities)drawCreature(e,e===P);
 for(const m of entities){
  if(m===P||m.hp<=0||m.windup>0)continue;
  const symbol=species[m.type].prey?(m.flee>0?"!":m.alert>0?"?":null):(m.search>0?"?":m.alert>0?"!":null);
  if(!symbol)continue;
  ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillStyle=species[m.type].prey?"#ffe4a3":symbol==="?"?"#d6e8af":"#ffad8c";
  ctx.strokeStyle="#13201a";ctx.lineWidth=3;ctx.font="900 15px sans-serif";
  const py=m.y-m.r-29;ctx.strokeText(symbol,m.x,py);ctx.fillText(symbol,m.x,py);ctx.restore();
 }
 if(P&&P.pendingStrike){
  const pct=1-P.windup/Math.max(.001,Math.min(.15,P.rate*.38));
  ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.dir);ctx.strokeStyle=P.type==="wolf"?"#ffc17f":P.type==="cat"?"#b8e8d1":"#ffe1a8";ctx.lineWidth=3+pct*3;
  const arc=P.type==="wolf"?1.18:P.type==="cat"?.95:1.03;
  ctx.beginPath();ctx.arc(0,0,P.r+(P.type==="cat"?39:P.type==="wolf"?55:51),-arc,-arc+2*arc*pct);ctx.stroke();ctx.restore();
 }
  for(const m of entities){
   if(m===P||species[m.type].prey||m.windup<=0)continue;
   const progress=1-m.windup/Math.max(.01,m.windupTotal);
   ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.strikeDir);
   ctx.fillStyle="rgba(244,75,48,"+(.11+progress*.31)+")";
   ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,m.r+P.r+37,-.92,.92);ctx.closePath();ctx.fill();
   ctx.strokeStyle=progress>.65?"#fff2aa":"#ff7758";ctx.lineWidth=3+progress*3;
   ctx.beginPath();ctx.arc(0,0,m.r+P.r+37,-.92,.92);ctx.stroke();
   ctx.restore();
   ctx.font="900 12px sans-serif";ctx.textAlign="center";ctx.fillStyle="#ffcf9c";
   ctx.fillText("!",m.x,m.y-m.r-23);
  }
 if(P&&P.swing>0){
  ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.dir);ctx.strokeStyle="rgba(253,207,141,"+(P.swing/.18)+")";ctx.lineWidth=12*P.swing/.18;ctx.lineCap="round";ctx.beginPath();ctx.arc(0,0,P.r+40,-.95,.95);ctx.stroke();ctx.strokeStyle="#fff7d6";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,P.r+47,-.75,.75);ctx.stroke();ctx.restore()}
 if(P&&P.pounceTime>0){ctx.save();ctx.strokeStyle="#ffe2a49c";ctx.lineWidth=5;ctx.beginPath();ctx.arc(P.x,P.y,P.r+12,-.8,.8);ctx.stroke();ctx.restore()}
 if(P&&P.dashTime>0){ctx.strokeStyle="#b4f7d88b";ctx.lineWidth=4;ctx.beginPath();ctx.arc(P.x,P.y,P.r+14,0,TWO);ctx.stroke()}
 for(const q of particles){const alpha=clamp(q.life/q.max,0,1);ctx.globalAlpha=alpha;
  if(q.ring){ctx.strokeStyle=q.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(q.x,q.y,(1-alpha)*390,0,TWO);ctx.stroke()}
  else{ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,TWO);ctx.fill()}}ctx.globalAlpha=1;
 for(const f of popups){ctx.globalAlpha=clamp(f.life,0,1);ctx.font="900 14px Barlow Condensed,sans-serif";ctx.textAlign="center";ctx.shadowColor="#00100c";ctx.shadowBlur=7;ctx.fillStyle=f.color;ctx.fillText(f.t,f.x,f.y);ctx.shadowBlur=0}ctx.globalAlpha=1;
 const dayCycle=(elapsed%85)/85,sunAmount=(Math.cos((dayCycle-.15)*TWO)+1)/2,nightAlpha=(1-sunAmount)*.47;
 ctx.fillStyle="rgba(3,10,25,"+nightAlpha+")";ctx.fillRect(x-1,y-1,vw+2,vh+2);
 if(nightAlpha>.12){ctx.save();ctx.globalCompositeOperation="screen";for(const lamp of lamps){if(!visible(lamp.x,lamp.y,170))continue;const g=ctx.createRadialGradient(lamp.x,lamp.y,2,lamp.x,lamp.y,130);g.addColorStop(0,"rgba(229,153,73,.17)");g.addColorStop(1,"rgba(229,153,73,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(lamp.x,lamp.y,130,0,TWO);ctx.fill()}ctx.restore()}
 if(weather==="FOG"){ctx.fillStyle="rgba(164,176,162,.11)";ctx.fillRect(x,y,vw,vh)}
 ctx.restore();
 if(weather==="RAIN"){ctx.strokeStyle="#9dc9cb5c";ctx.lineWidth=1.2;ctx.beginPath();for(const r of rain){const rx=(r.x+elapsed*r.s*.37)%vw,ry=(r.y+elapsed*r.s)%vh;ctx.moveTo(rx,ry);ctx.lineTo(rx-9,ry+r.z)}ctx.stroke()}
 if(flash>0){ctx.fillStyle="rgba(255,97,71,"+(flash*.35)+")";ctx.fillRect(0,0,vw,vh)}
 if(P&&P.hunger<22&&mode==="play"){ctx.fillStyle="rgba(138,30,20,"+(.06+Math.sin(elapsed*5)*.03)+")";ctx.fillRect(0,0,vw,vh)}
 if(P&&P.senseTime>0){ctx.strokeStyle="#89eabb74";ctx.lineWidth=1;ctx.beginPath();ctx.arc(vw/2,vh/2,78,0,TWO);ctx.stroke()}
 drawGoalGuide();
}
function loop(t){let dt=Math.min(.035,(t-last)/1000||.016);last=t;if(mode==="play")update(dt);drawScene();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
const act=code=>{if(mode!=="play")return;if(code==="dash")dash();if(code==="sense")sense();if(code==="instinct")instinct();if(code==="eat"&&P.eatCD<=0){P.eatCD=.34;eat()}if(code==="attack")attack()};
function keyDown(e){
 const k=e.key.toLowerCase();
 if(["arrowup","arrowdown","arrowleft","arrowright"," ","shift"].includes(k))e.preventDefault();
 if(e.repeat&&["shift","q","p","escape","f"].includes(k))return;
 keys.add(k);
 if(k==="shift"||k==="k")act("dash");
 if(k==="q")act("sense");if(k==="r")act("instinct");
 if(k==="e")act("eat");
 if(k==="p"||k==="escape")togglePause();
 if(k==="f")fullScreen();
}
document.addEventListener("keydown",keyDown);document.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>{keys.clear();attackTouch=false;if(mode==="play"){mode="pause";show("pause")}});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&mode==="play"){mode="pause";show("pause")}});
function togglePause(){if(mode==="play"){mode="pause";show("pause")}else if(mode==="pause"){mode="play";show("")}}
function fullScreen(){if(!document.fullscreenElement){document.documentElement.requestFullscreen?.().then(()=>{try{screen.orientation.lock("landscape").catch(()=>{})}catch(e){}}).catch(()=>{})}else document.exitFullscreen?.().catch(()=>{})}
document.querySelectorAll(".animal-card").forEach(b=>b.addEventListener("click",()=>{choice=b.dataset.animal;document.querySelectorAll(".animal-card").forEach(c=>c.classList.toggle("selected",c===b));sound(400,.08,"triangle",.025)}));
$("start-btn").addEventListener("click",start);
$("resume-btn").addEventListener("click",togglePause);
$("pause-btn").addEventListener("click",togglePause);
$("quit-btn").addEventListener("click",()=>{mode="menu";show("menu")});
$("retry-btn").addEventListener("click",start);
$("menu-btn").addEventListener("click",()=>{mode="menu";show("menu")});
$("full-btn").addEventListener("click",fullScreen);
$("sound-btn").addEventListener("click",()=>{soundEnabled=!soundEnabled;$("sound-btn").textContent=soundEnabled?"♪":"×"});
document.querySelectorAll("[data-upgrade]").forEach(b=>b.addEventListener("click",()=>{if(mode!=="upgrade")return;const up=b.dataset.upgrade;
 if(up==="fang")P.damage=Math.round(P.damage*1.25);else if(up==="fleet")P.speed=Math.round(P.speed*1.15);else{P.maxHp+=30;P.hp=Math.min(P.maxHp,P.hp+65)}
 mode="play";show("");notify("適応完了 / "+b.querySelector("b").textContent);sound(750,.26,"triangle",.05)
}));
const stick=$("joystick"),knob=$("joy-knob");
function updateStick(e){
 const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2-11;
 const dx=e.clientX-cx,dy=e.clientY-cy,mag=Math.hypot(dx,dy),lim=44;
 joy.x=clamp(dx/lim,-1,1);joy.y=clamp(dy/lim,-1,1);const l=Math.hypot(joy.x,joy.y);if(l>1){joy.x/=l;joy.y/=l}
 knob.style.transform="translate("+(joy.x*lim)+"px,"+(joy.y*lim)+"px)";
}
stick.addEventListener("pointerdown",e=>{e.preventDefault();joy.id=e.pointerId;stick.setPointerCapture(e.pointerId);updateStick(e)});
stick.addEventListener("pointermove",e=>{if(e.pointerId===joy.id)updateStick(e)});
function clearStick(e){if(e.pointerId!==joy.id)return;joy.id=null;joy.x=0;joy.y=0;knob.style.transform="translate(0,0)"}
stick.addEventListener("pointerup",clearStick);stick.addEventListener("pointercancel",clearStick);stick.addEventListener("lostpointercapture",()=>{joy.id=null;joy.x=0;joy.y=0;knob.style.transform="translate(0,0)"});
for(const [id,action] of [["attack-touch","attack"],["dash-touch","dash"],["sense-touch","sense"],["eat-touch","eat"],["instinct-touch","instinct"]]){
 const b=$(id);b.addEventListener("pointerdown",e=>{e.preventDefault();b.classList.add("down");b.setPointerCapture(e.pointerId);if(action==="attack")attackTouch=true;act(action)});
 const end=()=>{b.classList.remove("down");if(action==="attack")attackTouch=false};
 b.addEventListener("pointerup",end);b.addEventListener("pointercancel",end);b.addEventListener("lostpointercapture",end);
}
document.addEventListener("contextmenu",e=>e.preventDefault());
drawMini();
})();

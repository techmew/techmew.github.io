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
let elapsed=0,day=1,kills=0,mission=0,missionComplete=false,totalScore=0,best=0,weather="CLEAR",scoreTimer=0,spawnTimer=0,uiTimer=0,shake=0,flash=0,toastTime=0,toastMessage="",last=performance.now(),rain=[],worldMade=false;
let soundEnabled=true,audio=null,keys=new Set(),joy={id:null,x:0,y:0},attackTouch=false,heldDash=false;
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
 mode="play";show("");elapsed=0;day=1;kills=0;mission=0;missionComplete=false;scoreTimer=0;spawnTimer=0;weather="CLEAR";shake=0;flash=0;particles=[];popups=[];mobs=[];carcasses=[];keys.clear();attackTouch=false;joy.x=0;joy.y=0;
 const a=animals[choice];P={x:1860,y:1170,dir:0,type:choice,base:a,r:a.r,hp:a.hp,maxHp:a.hp,hunger:100,sp:100,speed:a.speed,damage:a.damage,rate:a.rate,atk:0,dash:0,dashTime:0,dx:1,dy:0,inv:0,sense:0,senseTime:0,level:1,xp:0,nextXp:5,combo:0,comboTimer:0,steps:0,blood:0};
 for(let i=0;i<26;i++)spawnMob(true);
 for(let i=0;i<17;i++)spawnFood();
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
 mobs.push({x,y,type,r:s.r,hp:s.hp*scale,maxHp:s.hp*scale,attack:0,vx:0,vy:0,dir:rnd(-3,3),wander:rnd(.5,3),alert:0,step:rnd(0,8),flee:0,flash:0});
}
function spawnFood(){
 const x=rnd(70,WORLD.w-70),y=rnd(70,WORLD.h-70);
 if(nearBuilding(x,y,22))return;
 carcasses.push({x,y,r:9,amount:19,type:"berries",ttl:220,phase:rnd(0,6)});
}
function collides(x,y,r){if(x<r+12||y<r+12||x>WORLD.w-r-12||y>WORLD.h-r-12)return true;return nearBuilding(x,y,r*.8)}
function move(o,dx,dy){if(!collides(o.x+dx,o.y,o.r))o.x+=dx;if(!collides(o.x,o.y+dy,o.r))o.y+=dy;}
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
function attack(){
 if(mode!=="play"||P.atk>0)return;
 P.atk=P.rate;P.steps+=.1;P.swing=.18;let hit=0;
 mobs.forEach(m=>{
  if(m.hp<=0)return;
  const d=dist(P,m),theta=Math.atan2(m.y-P.y,m.x-P.x),angle=Math.atan2(Math.sin(theta-P.dir),Math.cos(theta-P.dir));
  if(d<P.r+m.r+52&&Math.abs(angle)<1.22){
   const damage=Math.round(P.damage*rnd(.86,1.16));m.hp-=damage;m.flash=.16;m.alert=3;m.flee=0;hit++;
   blood(m.x,m.y,m.hp>0?"#f7c77c":"#c65b4f",12,155);label(m.x,m.y-28,"-"+damage,"#ffe5b4");
   m.x+=Math.cos(theta)*7;m.y+=Math.sin(theta)*7;
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
 if(mode!=="play"||P.dash>0||P.sp<28)return;
 const a=getAxes();if(Math.hypot(a.x,a.y)>.15){P.dir=Math.atan2(a.y,a.x)}
 P.dx=Math.cos(P.dir);P.dy=Math.sin(P.dir);
 P.sp-=28;P.dashTime=.21;P.inv=.28;P.dash=1.05;blood(P.x,P.y,"#a6e6d4",9,45);sound(250,.22,"sine",.05);
}
function sense(){
 if(mode!=="play"||P.sense>0)return;
 P.sense=12;P.senseTime=4;particles.push({x:P.x,y:P.y,life:.85,max:.85,ring:true,r:3,color:"#82eac8"});
 notify("気配を探知 / 生命反応を表示");sound(660,.34,"sine",.035);
}
function eat(){
 if(mode!=="play")return;
 let c=null,near=65;
 for(const f of carcasses){const d=dist(P,f);if(d<near){near=d;c=f}}
 if(!c){notify("食べ物が近くにない");return}
 P.hunger=clamp(P.hunger+c.amount,0,100);P.hp=clamp(P.hp+(c.type==="meat"?8:3),0,P.maxHp);
 carcasses.splice(carcasses.indexOf(c),1);label(P.x,P.y-30,"+"+c.amount+" FOOD","#bfe89e");
 blood(P.x,P.y,"#d6c17f",7,45);sound(440,.13,"sine",.035);
}
function checkMission(){
 if(mission===0&&kills>=3){mission=1;notify("MISSION COMPLETE / 生き延びろ");}
 if(mission===1&&day>=2){mission=2;notify("新たな縄張りへ / 旧新宿駅を目指せ");}
 if(mission===2&&P.x>2350){mission=3;notify("最終試練 / 9体を狩って3日目を迎えろ");}
 if(mission===3&&day>=3&&kills>=9&&!missionComplete){
  missionComplete=true;mode="clear";finish(true);
 }
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
function update(dt){
 elapsed+=dt;day=1+Math.floor(elapsed/85);
 const phase=elapsed%85;const hr=(6+Math.floor(phase/85*24))%24;
 const newWeather=day%4===0?"FOG":day%3===0?"RAIN":"CLEAR";if(newWeather!==weather){weather=newWeather;notify(weather==="RAIN"?"酸性雨の気配 / 視界が悪化":weather==="FOG"?"濃霧 / 視界が悪化":"空が晴れてきた")}
 const oldDay=day; // accounted above
 if(Math.floor((elapsed-dt)/85)<Math.floor(elapsed/85)){notify("DAY "+String(day).padStart(2,"0")+" / 野生はさらに凶暴になる");P.hp=Math.min(P.maxHp,P.hp+18)}
 P.atk=Math.max(0,P.atk-dt);P.dash=Math.max(0,P.dash-dt);P.dashTime=Math.max(0,P.dashTime-dt);P.inv=Math.max(0,P.inv-dt);P.sense=Math.max(0,P.sense-dt);P.senseTime=Math.max(0,P.senseTime-dt);P.swing=Math.max(0,(P.swing||0)-dt);P.comboTimer=Math.max(0,P.comboTimer-dt);
 P.sp=clamp(P.sp+17*dt,0,100);P.hunger=clamp(P.hunger-(.21+(day-1)*.025)*dt,0,100);
 if(P.hunger<16)P.hp-=(P.hunger===0?7:1.2)*dt;
 const a=getAxes(),len=Math.hypot(a.x,a.y);
 if(P.dashTime>0){move(P,P.dx*P.speed*3.8*dt,P.dy*P.speed*3.8*dt);if(Math.random()<.7)blood(P.x,P.y,"#d5e4bb",1,25)}
 else if(len>.08){P.dir=Math.atan2(a.y,a.x);P.steps+=dt*10;move(P,a.x*P.speed*dt,a.y*P.speed*dt)}
 if((keys.has("j")||keys.has(" ")||attackTouch)&&P.atk<=0)attack();
 if(keys.has("e")&&P.eatCD<=0)eat();
 P.eatCD=Math.max(0,(P.eatCD||0)-dt);
 if(P.hp<=0){P.hp=0;finish(false);return}
 const chaseRange=weather==="FOG"?195:260;
 for(const m of mobs){
  if(m.hp<=0)continue;
  const s=species[m.type];m.wander-=dt;m.attack-=dt;m.flash=Math.max(0,m.flash-dt);m.step+=dt*8;
  const d=dist(P,m),angle=Math.atan2(P.y-m.y,P.x-m.x);
  let vx=0,vy=0;
  if(s.prey&&d<170){m.flee=2;m.dir=angle+Math.PI}
  if(s.prey&&m.flee>0){m.flee-=dt;vx=Math.cos(m.dir)*s.speed*1.3;vy=Math.sin(m.dir)*s.speed*1.3}
  else if(!s.prey&&d<chaseRange+(m.alert>0?135:0)){m.alert=Math.max(m.alert,1.7);m.dir=angle;vx=Math.cos(angle)*s.speed;vy=Math.sin(angle)*s.speed}
  else {m.alert=Math.max(0,m.alert-dt);if(m.wander<0){m.dir+=rnd(-2.5,2.5);m.wander=rnd(.5,2.5)}vx=Math.cos(m.dir)*s.speed*.23;vy=Math.sin(m.dir)*s.speed*.23}
  const ox=m.x,oy=m.y;move(m,vx*dt,vy*dt);
  if(ox===m.x&&oy===m.y){m.dir+=1.7;m.wander=0}
  if(!s.prey&&d<P.r+m.r+10&&m.attack<=0&&P.inv<=0){
   P.hp-=s.damage*(1+Math.max(0,day-1)*.15);P.inv=.55;m.attack=1.3;shake=9;flash=.23;label(P.x,P.y-35,"-"+Math.round(s.damage),"#ff9890");blood(P.x,P.y,"#eb6356",12,125);sound(90,.2,"sawtooth",.08);
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
 ["食料を確保せよ","小動物を3匹狩る",kills/3],
 ["夜を越えろ","DAY 02まで生き延びる",(elapsed%85)/85],
 ["新たな縄張りへ","旧新宿駅方面へ移動する",(P.x-1850)/550],
 ["頂点を目指せ","DAY 03到達 ＋ 狩猟9体",Math.min(day/3,kills/9)]
 ];
 const ob=objectives[Math.min(mission,3)];
 $("mission-progress").textContent="0"+(Math.min(mission,3)+1)+" / 04";
 $("mission-title").textContent=ob[0];$("mission-sub").textContent=ob[1];setBar("mission-bar",ob[2]*100);
 $("kill-line").textContent="HUNT "+String(kills).padStart(2,"0");
 $("score-line").textContent="SCORE "+String(Math.floor(elapsed*4+kills*88+(P.level-1)*110)).padStart(6,"0");
 $("combo-line").textContent=P.comboTimer>0&&P.combo>1?"COMBO ×"+P.combo:"";
 $("dash-touch").style.opacity=P.dash>0||P.sp<28?".5":"1";$("sense-touch").style.opacity=P.sense>0?".5":"1";
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
 const s=isPlayer?P.base:species[o.type],r=o.r,flashHit=!isPlayer&&o.flash>0;
 ctx.save();ctx.translate(o.x,o.y);
 ctx.fillStyle="#03101194";ctx.beginPath();ctx.ellipse(4,9,r*1.1,r*.52,-.06,0,TWO);ctx.fill();
 ctx.rotate(o.dir||0);
 const step=Math.sin(o.step||0)*3,color=flashHit?"#ffdfbc":s.color,belly=s.belly;
 if(o.type==="pigeon"){
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(-3,0,r*.85,r*.65,0,0,TWO);ctx.fill();
  ctx.fillStyle="#9bb4ae";ctx.beginPath();ctx.ellipse(-3,-8+step*.35,10,4,-.35,0,TWO);ctx.ellipse(-3,8-step*.35,10,4,.35,0,TWO);ctx.fill();
  ctx.fillStyle="#e8bd74";ctx.beginPath();ctx.moveTo(r+6,0);ctx.lineTo(r-1,-4);ctx.lineTo(r-1,4);ctx.fill();
 }else{
  const legColor=o.type==="boar"?"#594f45":color;
  ctx.fillStyle=legColor;ctx.fillRect(-r*.53,-r*.79+step*.3,r*.45,r*.49);ctx.fillRect(r*.16,-r*.79-step*.3,r*.45,r*.49);
  ctx.fillRect(-r*.53,r*.29-step*.3,r*.45,r*.45);ctx.fillRect(r*.16,r*.29+step*.3,r*.45,r*.45);
  ctx.save();ctx.translate(-r*.75,0);
  ctx.fillStyle=color;ctx.beginPath();
  if(o.type==="fox"||o.type==="wolf"||o.type==="dog"||o.type==="alpha"){ctx.moveTo(0,-r*.5);ctx.quadraticCurveTo(-r*1.2,-r*.86,-r*1.45,0);ctx.quadraticCurveTo(-r*.95,r*.82,0,r*.48)}
  else{ctx.moveTo(0,-r*.22);ctx.quadraticCurveTo(-r*1.2,-r*.52,-r*1.15,0);ctx.quadraticCurveTo(-r*.65,r*.55,0,r*.22)}
  ctx.fill();ctx.restore();
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(-r*.12,0,r*.86,r*.68,0,0,TWO);ctx.fill();
  ctx.fillStyle=belly;ctx.beginPath();ctx.ellipse(r*.25,0,r*.47,r*.39,0,0,TWO);ctx.fill();
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(r*.65,0,r*.59,r*.58,0,0,TWO);ctx.fill();
  if(o.type==="boar"){ctx.fillStyle="#c8ac8a";ctx.beginPath();ctx.ellipse(r*1.18,0,r*.36,r*.28,0,0,TWO);ctx.fill();ctx.fillStyle="#efdbac";for(const z of [-1,1]){ctx.beginPath();ctx.moveTo(r*.99,z*r*.2);ctx.lineTo(r*1.35,z*r*.37);ctx.lineTo(r*1.2,z*r*.07);ctx.fill()}}
  else {
   ctx.fillStyle=color;for(const z of [-1,1]){ctx.beginPath();ctx.moveTo(r*.26,z*r*.4);ctx.lineTo(r*.64,z*r*.95);ctx.lineTo(r*.87,z*r*.35);ctx.fill()}
   ctx.fillStyle=belly;ctx.beginPath();ctx.moveTo(r*.64,-r*.25);ctx.lineTo(r*1.39,0);ctx.lineTo(r*.64,r*.25);ctx.fill();
  }
 }
 ctx.fillStyle=isPlayer?"#f4fbe2":"#fbe8ad";for(const z of [-1,1]){ctx.beginPath();ctx.arc(r*.74,z*r*.26,Math.max(1.6,r*.085),0,TWO);ctx.fill()}
 if(isPlayer){ctx.strokeStyle=P.inv>0?"#f6b969a9":"#adf3c996";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r+6,0,TWO);ctx.stroke();ctx.fillStyle="#eef7df";ctx.font="900 10px sans-serif";ctx.textAlign="center";ctx.fillText("YOU",0,-r-19)}
 ctx.restore();
 if(!isPlayer&&!s.prey&&o.hp<o.maxHp){ctx.fillStyle="#101719c9";ctx.fillRect(o.x-21,o.y-r-17,42,4);ctx.fillStyle="#e9a077";ctx.fillRect(o.x-21,o.y-r-17,42*o.hp/o.maxHp,4)}
 if(P&&P.senseTime>0&&!isPlayer){ctx.strokeStyle=s.prey?"#91ebbc":"#ef9274";ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,r+12+Math.sin(elapsed*8)*2,0,TWO);ctx.stroke()}
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
 if(P&&P.swing>0){
  ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.dir);ctx.strokeStyle="rgba(253,207,141,"+(P.swing/.18)+")";ctx.lineWidth=12*P.swing/.18;ctx.lineCap="round";ctx.beginPath();ctx.arc(0,0,P.r+40,-.95,.95);ctx.stroke();ctx.strokeStyle="#fff7d6";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,P.r+47,-.75,.75);ctx.stroke();ctx.restore()}
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
}
function loop(t){let dt=Math.min(.035,(t-last)/1000||.016);last=t;if(mode==="play")update(dt);drawScene();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
const act=code=>{if(mode!=="play")return;if(code==="dash")dash();if(code==="sense")sense();if(code==="eat"){P.eatCD=.34;eat()}if(code==="attack")attack()};
function keyDown(e){
 const k=e.key.toLowerCase();
 if(["arrowup","arrowdown","arrowleft","arrowright"," ","shift"].includes(k))e.preventDefault();
 if(e.repeat&&["shift","q","p","escape","f"].includes(k))return;
 keys.add(k);
 if(k==="shift"||k==="k")act("dash");
 if(k==="q")act("sense");
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
for(const [id,action] of [["attack-touch","attack"],["dash-touch","dash"],["sense-touch","sense"],["eat-touch","eat"]]){
 const b=$(id);b.addEventListener("pointerdown",e=>{e.preventDefault();b.classList.add("down");b.setPointerCapture(e.pointerId);if(action==="attack")attackTouch=true;act(action)});
 const end=()=>{b.classList.remove("down");if(action==="attack")attackTouch=false};
 b.addEventListener("pointerup",end);b.addEventListener("pointercancel",end);b.addEventListener("lostpointercapture",end);
}
document.addEventListener("contextmenu",e=>e.preventDefault());
drawMini();
})();

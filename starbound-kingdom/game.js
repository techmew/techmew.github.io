"use strict";
(()=>{
const C=document.getElementById("screen"),g=C.getContext("2d",{alpha:false}),W=960,H=540,T=48,GR=480,TAU=Math.PI*2,KEY="starbound_kingdom_v1";
const $=id=>document.getElementById(id);
g.imageSmoothingEnabled=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
let clock=0,cam=0,mode="menu",level=null,p=null,particles=[],shots=[],mobs=[],drops=[],coins=[],hazards=[],effects=[],shake=0,screenFlash=0,toast="",toastT=0,transition=0,checkpoint=0,lastHud=0,sfx=true,ac=null,frame=0;
let save={unlocked:1,shadow:false,shadowUnlocked:1,coins:0,lives:5,score:0,best:0,suit:"normal",inventory:[],current:1};
try{const v=JSON.parse(localStorage.getItem(KEY)||"null");if(v&&typeof v==="object")save=Object.assign(save,v)}catch(e){}
save.unlocked=clamp(+save.unlocked||1,1,32);save.shadowUnlocked=clamp(+save.shadowUnlocked||1,1,32);
const held=new Set(),touchHeld=new Set(),pad={left:false,right:false,down:false,jump:false,attack:false,extra:false};
let prevJump=false,prevAttack=false,prevExtra=false,prevEnter=false;
const input=k=>held.has(k)||touchHeld.has(k)||!!pad[k];
const palette=[
{sky:["#68c8fa","#c4f2ff"],hill:"#77b987",far:"#9fe0c0",ground:"#704b32",edge:"#57c777",stone:"#bd9065",brick:"#dc8a5b"},
{sky:["#82c7f2","#ffe4aa"],hill:"#d4a86c",far:"#f7ca81",ground:"#986341",edge:"#ddad65",stone:"#dcbe8b",brick:"#bf7f57"},
{sky:["#8db8eb","#d5f7da"],hill:"#4e9e80",far:"#a8d5ad",ground:"#604a35",edge:"#54c79d",stone:"#aac5a1",brick:"#c69b70"},
{sky:["#78bfe0","#ceefff"],hill:"#327b9e",far:"#69bed6",ground:"#495b79",edge:"#68bce7",stone:"#a2c5db",brick:"#6d9fb3"},
{sky:["#6b9ad9","#eafaff"],hill:"#88b9d8",far:"#c5e4f4",ground:"#63859b",edge:"#e8faff",stone:"#b8d6e5",brick:"#8aaeca"},
{sky:["#5185d7","#c7e2ff"],hill:"#6d9dcc",far:"#abcaf5",ground:"#686c92",edge:"#bcbde8",stone:"#a3b8d4",brick:"#8f9dbd"},
{sky:["#493a82","#ea91a8"],hill:"#634b8b",far:"#9979b2",ground:"#5a3a50",edge:"#be78ae",stone:"#9883a3",brick:"#aa718f"},
{sky:["#271c40","#b25167"],hill:"#473453",far:"#704061",ground:"#4c303a",edge:"#f47663",stone:"#9c6872",brick:"#a55557"}];
const randGen=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};
const choose=(a,r)=>a[Math.floor(r()*a.length)];
const playsound=(freq=520,dur=.08,type="square",vol=.045,end=0)=>{
 if(!sfx)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();
 const o=ac.createOscillator(),gain=ac.createGain(),t=ac.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);
 if(end)o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+dur);
 gain.gain.setValueAtTime(vol,t);gain.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(gain).connect(ac.destination);o.start(t);o.stop(t+dur+.01)}catch(e){}
};
const sound={jump:()=>playsound(410,.15,"square",.04,670),coin:()=>playsound(910,.11,"triangle",.045,1280),stomp:()=>playsound(210,.1,"square",.05,115),hurt:()=>playsound(360,.35,"sawtooth",.065,75),power:()=>playsound(450,.38,"triangle",.05,1080),shoot:()=>playsound(860,.1,"square",.035,190),break:()=>playsound(180,.18,"sawtooth",.05,55),win:()=>{playsound(550,.16);setTimeout(()=>playsound(770,.18),145);setTimeout(()=>playsound(1040,.33),310)}};
function saveNow(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}}
function labelSuit(n){return ({normal:"NORMAL",grow:"GROWN",fire:"FIRE",leaf:"GLIDE",frog:"SWIM",hammer:"HAMMER",cloak:"CLOAK",star:"STAR"})[n]||n.toUpperCase()}
function stageName(w,s){const n=["SUNLIT PRAIRIE","SANDSEA DUNES","WILDWOOD FOREST","CORAL COAST","FROST PEAKS","SKY ISLANDS","TWILIGHT VALE","EMBER CITADEL"];return n[w-1]+(s===4?" · CITADEL":s===2?" · DEPTHS":s===3?" · SKYWAY":"")}
function announce(t,d=2){toast=t;toastT=d}
function setOverlay(kicker,title,desc,buttons,grid=false){
 $("kicker").textContent=kicker;$("title").textContent=title;$("description").textContent=desc;
 $("actions").innerHTML="";$("stageGrid").hidden=!grid;
 for(const b of buttons){const el=document.createElement("button");el.className=b.alt?"secondary":"primary";el.textContent=b.text;el.addEventListener("click",b.fn);$("actions").appendChild(el)}
 $("overlay").hidden=false;
}
function hideOverlay(){$("overlay").hidden=true}
function menu(){
 mode="menu";setOverlay("CLASSIC RUN · JUMP · TRANSFORM","STARBOUND KINGDOM ∞","8 WORLDS × 4 COURSES = 32面。クリア後に裏面32面。9種類の敵、7系統の変身、城のボス、秘密の土管、操作に応じて動く歩行・攻撃アニメーション。",[
 {text:"つづきから",fn:()=>startStage(save.current||1,!!save.shadow&&!!save.mapShadow)},
 {text:"ステージ選択",fn:showMap,alt:true},
 {text:"はじめから",fn:()=>{save.lives=5;save.coins=0;save.score=0;save.suit="normal";save.inventory=[];startStage(1,false)},alt:true}
 ]);
}
function showMap(){
 mode="map";const grid=$("stageGrid");grid.innerHTML="";grid.hidden=false;
 let sh=!!save.mapShadow; if(!save.shadow)sh=false;
 for(let i=1;i<=32;i++){const b=document.createElement("button");b.textContent=Math.ceil(i/4)+"-"+((i-1)%4+1);
 b.disabled=i>(sh?save.shadowUnlocked:save.unlocked);if(i===(save.current||1))b.className="current";
 b.onclick=()=>{save.mapShadow=sh;startStage(i,sh)};grid.appendChild(b)}
 setOverlay("CHOOSE A WORLD","WORLD SELECT",sh?"裏面：敵の速度・攻撃頻度・地形を強化。":"表面：全32面を制覇して裏面を解放。",[
 {text:sh?"表面に切替":"裏面に切替",alt:true,fn:()=>{if(save.shadow){save.mapShadow=!sh;showMap()}else announce("裏面は8-4クリア後に解放")}},
 {text:"タイトル",alt:true,fn:menu}
 ],true);
}
function newGamePlayer(){
 return {x:90,y:GR-46,w:32,h:46,vx:0,vy:0,dir:1,grounded:false,age:0,air:0,coyote:0,buffer:0,invuln:1.2,starT:0,attackT:0,attackCooldown:0,suit:save.suit||"normal",run:false,duck:false,swimT:0,tailT:0,glide:0,dead:false,anim:"idle"};
}
function startStage(n,shadow=false,respawnX=0){
 n=clamp(n,1,32);save.current=n;save.mapShadow=shadow;const w=Math.ceil(n/4),s=(n-1)%4+1;
 level=generate(w,s,shadow);mobs=level.enemies;coins=level.coins;drops=level.drops;hazards=level.hazards;shots=[];particles=[];effects=[];
 p=newGamePlayer();p.suit=save.suit||"normal";p.h=p.suit==="normal"?46:60;p.y=GR-p.h;p.x=respawnX||90;cam=Math.max(0,p.x-260);checkpoint=respawnX;transition=0;mode="playing";hideOverlay();announce(stageName(w,s),2.3);saveNow();
}
function generate(w,s,sh){
 const rng=randGen(9321+w*1597+s*11319+(sh?91811:0)),mainLen=112+w*9+s*13+(sh?20:0),len=mainLen+38,type=s===4?"fort":s===2?"depth":s===3?"sky":"field";
 const map=Array.from({length:12},()=>new Uint8Array(len)),gaps=[],pipes=[],enemies=[],levelCoins=[],levelDrops=[],levelHazards=[];
 const pitAt=x=>gaps.some(q=>x>=q.x&&x<q.x+q.w);
 if(type!=="fort"){
  for(let x=15;x<mainLen-22;){x+=8+Math.floor(rng()*8);
   if(x>mainLen-22)break;const width=1+Math.floor(rng()*(sh?4:3));gaps.push({x,w:Math.min(width,3)})}
 }
 if(w===6||w===8)for(let x=30;x<mainLen-25;x+=32+Math.floor(rng()*12))if(!pitAt(x))gaps.push({x,w:2+(sh?1:0)});
 for(let x=0;x<mainLen;x++){if(pitAt(x))continue;map[10][x]=1;map[11][x]=1}
 if(type==="fort"){
  for(let x=0;x<mainLen;x++){map[0][x]=4;if(x%9<7){map[1][x]=4;map[2][x]=0}}
  for(let x=9;x<mainLen-11;x+=17){for(let q=0;q<3;q++)map[8][x+q]=4}
 }
 for(let x=10;x<mainLen-15;x+=8+Math.floor(rng()*9)){
   if(pitAt(x)||pitAt(x+1))continue;
   const y=type==="sky"?(6+Math.floor(rng()*3)):(6+Math.floor(rng()*3));
   const width=2+Math.floor(rng()*5);
   for(let i=0;i<width;i++){const tx=x+i;if(tx<mainLen-10&&!pitAt(tx)){map[y][tx]=rng()<.23?3:(type==="fort"?4:2)}}
   if(rng()<.42){for(let j=0;j<4;j++)levelCoins.push({x:(x+j)*T+24,y:(y-1)*T-4,w:20,h:23,t:0,dead:false})}
 }
 for(let x=19;x<mainLen-23;x+=13+Math.floor(rng()*12)){
  if(type==="fort"||pitAt(x)||pitAt(x+1)||pitAt(x+2))continue;
  if(rng()<.56){pipes.push({x:x*T,y:GR-(rng()<.55?96:144),w:96,h:rng()<.55?96:144,bonus:rng()<.23,entered:false});
   const last=pipes[pipes.length-1];last.h=GR-last.y;
  }
 }
 // Short stairs create spatial rhythm; all required jumps remain within the available jump arc.
 for(let x=28;x<mainLen-25;x+=37+Math.floor(rng()*13)){if(pitAt(x+1)||pitAt(x+2))continue;
  for(let z=0;z<3;z++){for(let j=0;j<=z;j++){const ty=9-j,tx=x+z;if(!map[ty][tx])map[ty][tx]=4}}
 }
 const kinds=w===1?["walker","beetle","walker","flyer"]:w===2?["walker","spike","thrower","beetle"]:w===3?["beetle","flyer","walker","thrower"]:w===4?["fish","flyer","walker","beetle"]:w===5?["spike","beetle","flyer","thrower"]:w===6?["flyer","thrower","beetle","walker"]:w===7?["ghost","thrower","spike","flyer"]:["thrower","spike","launcher","flyer"];
 for(let x=12;x<mainLen-14;x+=5+Math.floor(rng()*4)-(sh?1:0)){
  if(pitAt(x)||x>mainLen-16&&s===4)continue;
  const kind=choose(kinds,rng);
  const fly=kind==="flyer"||kind==="ghost"||kind==="fish";
  const ew=kind==="thrower"?42:kind==="launcher"?48:kind==="spike"?40:36;
  enemies.push({kind,x:x*T+10,y:fly?(260+rng()*70):GR-42,w:ew,h:kind==="thrower"?52:kind==="launcher"?52:38,
   vx:0,vy:0,dir:rng()<.5?-1:1,age:rng()*TAU,phase:0,shot:1+rng()*2,hp:kind==="thrower"?2:1,grounded:false,dead:false,home:x*T,stun:0,shell:false,alert:0});
 }
 for(const pipe of pipes){if(rng()<.45)enemies.push({kind:"plant",x:pipe.x+29,y:pipe.y-45,w:38,h:43,vx:0,vy:0,dir:1,age:0,phase:rng()*TAU,shot:2,dead:false,hp:1,home:pipe.y-45,alert:0})}
 if(s===4)enemies.push({kind:"boss",x:(mainLen-16)*T,y:GR-94,w:84,h:94,vx:0,vy:0,dir:-1,age:0,phase:0,shot:2.2,hp:w===8?(sh?12:9):(sh?7:5),grounded:false,dead:false,home:(mainLen-16)*T,stun:0,alert:0});
 for(let x=9;x<mainLen-6;x+=3+Math.floor(rng()*5)){if(!pitAt(x)&&rng()<.72)levelCoins.push({x:x*T+16,y:GR-118-Math.floor(rng()*3)*34,w:22,h:24,t:rng()*TAU,dead:false})}
 for(let x=24;x<mainLen-18;x+=26+Math.floor(rng()*9)){if(!pitAt(x)){const kinds=["grow","fire","leaf","frog","hammer","cloak","star"];
  levelDrops.push({x:x*T,y:GR-145,w:33,h:34,kind:kinds[(w+s+Math.floor(rng()*4))%kinds.length],age:rng()*6,vy:0,dead:false,float:true})}}
 for(let x=19;x<mainLen-18;x+=17+Math.floor(rng()*13)){if(pitAt(x))continue;if(rng()<.6)levelHazards.push({kind:w===8||type==="fort"?"flame":"spike",x:x*T,y:GR-(w===8?32:22),w:48,h:w===8?32:22,age:rng()*TAU,cycle:rng()*TAU})}
 // Hidden vault exists outside the public goal. Every secret pipe visits this sealed bonus chamber.
 const roomStart=(mainLen+7)*T,roomExit=(mainLen+32)*T;
 for(let x=mainLen+5;x<=mainLen+34;x++){
  map[10][x]=4;map[11][x]=4;
  if(x===mainLen+5||x===mainLen+34)for(let y=3;y<10;y++)map[y][x]=4;
  if(x!==mainLen+6&&x!==mainLen+33)map[3][x]=4;
 }
 for(let i=0;i<21;i++){
  levelCoins.push({x:roomStart+60+i*44,y:GR-110-Math.sin(i*.8)*40,w:22,h:24,t:i*.22,dead:false,secretOnly:true});
 }
 levelDrops.push({x:roomStart+800,y:GR-160,w:33,h:34,kind:"star",age:0,vy:0,dead:false,float:true,secretOnly:true});
 const bg=palette[w-1];
 return {w,s,n:(w-1)*4+s,shadow:sh,type,len,map,gaps,pipes,enemies,coins:levelCoins,drops:levelDrops,hazards:levelHazards,theme:bg,goalX:(mainLen-6)*T,roomStart,roomExit,mainLen,time:Math.max(280,390-w*9),bossCleared:s!==4,secret:false,secretT:0,secretBack:0,rng};
}
function solidRects(x,y,w,h){
 const a=[],left=clamp(Math.floor(x/T)-1,0,level.len-1),right=clamp(Math.floor((x+w)/T)+1,0,level.len-1),top=clamp(Math.floor(y/T)-1,0,11),bottom=clamp(Math.floor((y+h)/T)+1,0,11);
 for(let yy=top;yy<=bottom;yy++)for(let xx=left;xx<=right;xx++){const c=level.map[yy][xx];if(c===1||c===2||c===3||c===4||c===5)a.push({x:xx*T,y:yy*T,w:T,h:T,c,row:yy,col:xx})}
 for(const q of level.pipes){if(q.x<x+w+1&&q.x+q.w>x-1&&q.y<y+h+1&&q.y+q.h>y-1)a.push({...q,c:6})}
 return a;
}
function isSolidAt(x,y){if(x<0||x>=level.len*T)return true;const col=Math.floor(x/T),row=Math.floor(y/T);if(row>=12)return false;if(row>=0&&level.map[row][col])return true;return level.pipes.some(q=>x>=q.x&&x<q.x+q.w&&y>=q.y&&y<q.y+q.h)}
function moveBody(a,dt,player=false){
 const prevX=a.x,prevY=a.y;
 a.x+=a.vx*dt;a.x=clamp(a.x,0,level.len*T-a.w);
 if(a.vx!==0)for(const r of solidRects(a.x,a.y,a.w,a.h)){if(!hit(a,r))continue;
  if(a.vx>0&&prevX+a.w<=r.x+17){a.x=Math.min(a.x,r.x-a.w);a.vx=0;if(!player)a.dir=-1}
  else if(a.vx<0&&prevX>=r.x+r.w-17){a.x=Math.max(a.x,r.x+r.w);a.vx=0;if(!player)a.dir=1}
 }
 a.y+=a.vy*dt;a.grounded=false;
 for(const r of solidRects(a.x,a.y,a.w,a.h)){if(!hit(a,r))continue;
  if(a.vy>=0&&prevY+a.h<=r.y+18){a.y=Math.min(a.y,r.y-a.h);a.vy=0;a.grounded=true}
  else if(a.vy<0&&prevY>=r.y+r.h-18){a.y=Math.max(a.y,r.y+r.h);a.vy=0;if(player&&r.c!==6)bump(r)}
 }
}
function bump(q){
 const tx=q.col,ty=q.row,kind=q.c;
 if(kind===3){level.map[ty][tx]=5;
   const pickups=["grow","fire","leaf","frog","hammer","cloak","star"];
   const k=level.rng();
   if(k<.45){addCoin(tx*T+24,ty*T);score(100);announce("+100 COIN");sound.coin()}
   else spawnDrop(tx*T+7,ty*T-40,k<.77?pickups[(level.w+level.s+tx)%6]:"star");
   burst(tx*T+24,ty*T+12,8,"#f5d27e",170);
 }else if(kind===2){if(p.suit!=="normal"){level.map[ty][tx]=0;burst(tx*T+24,ty*T+24,14,"#e79c7d",230);score(35);sound.break()}else {sound.stomp();burst(tx*T+24,ty*T+4,3,"#fff4b1",95)}}
}
function score(n){save.score+=n;if(save.score>save.best)save.best=save.score}
function addCoin(x,y){particles.push({x,y,vx:0,vy:-210,r:9,t:0,max:.65,color:"#ffe16b",coin:true})}
function burst(x,y,n,color,power=150){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=Math.random()*power;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-45,t:0,max:.35+Math.random()*.55,r:2+Math.random()*5,color})}}
function spawnDrop(x,y,kind){drops.push({x,y,w:34,h:34,kind,age:0,vy:-140,dead:false,float:false})}
function getCoin(c){c.dead=true;save.coins++;score(100);sound.coin();burst(c.x+10,c.y+12,5,"#ffeb86",120);if(save.coins>=100){save.coins-=100;save.lives++;announce("1 UP!");sound.power()}}
function pick(d){d.dead=true;if(d.kind==="star"){p.starT=10;p.invuln=10;announce("STAR POWER · 10 SEC");sound.power();burst(p.x,p.y,24,"#ffe283",260);return}
 if(p.suit===d.kind){score(1200);announce("BONUS +1200")}else{p.suit=d.kind;p.h=d.kind==="normal"?46:60;p.y-=14;save.suit=d.kind;announce(labelSuit(d.kind)+" POWER!");score(800);sound.power();burst(p.x+16,p.y+20,17,"#a4f5ff",190)}
 save.inventory=save.inventory||[];if(save.inventory.length<3&&Math.random()<.3)save.inventory.push(d.kind);saveNow();
}
function hurt(){if(p.invuln>0||p.starT>0||p.dead||mode!=="playing")return;shake=10;screenFlash=.2;sound.hurt();
 if(p.suit!=="normal"){p.suit="normal";p.h=46;p.y+=14;save.suit="normal";p.invuln=2.1;announce("POWER DOWN!");burst(p.x+14,p.y,15,"#f4e58c",160)}
 else die();
}
function die(){if(p.dead)return;p.dead=true;p.vy=-610;p.vx=0;p.invuln=3;save.lives--;sound.hurt();announce("TRY AGAIN!",1.3);
 const gameOver=save.lives<=0,respawnX=checkpoint;
 if(gameOver){save.lives=5;save.suit="normal";save.current=level.n;saveNow()}
 setTimeout(()=>{if(p&&p.dead){if(gameOver){mode="dead";setOverlay("RETRY THE JOURNEY","CONTINUE?","残機を回復して同じコースから再挑戦。スコア・クリア状況は保存されています。",[{text:"RETRY",fn:()=>startStage(level.n,level.shadow)},{text:"MAP",alt:true,fn:showMap}])}
 else startStage(level.n,level.shadow,respawnX)}},920);
}
function fireAttack(){
 if(p.attackCooldown>0||p.dead)return;
 p.attackCooldown=p.suit==="hammer"?.31:.22;p.attackT=.24;
 const x=p.x+(p.dir>0?p.w+4:-13),y=p.y+(p.suit==="normal"?16:23);
 if(p.suit==="fire"||p.suit==="hammer"||p.starT>0){
 shots.push({kind:p.suit==="hammer"?"hammer":"fire",x,y,w:15,h:15,vx:p.dir*(p.suit==="hammer"?460:640),vy:p.suit==="hammer"?-410:0,t:0,life:1.35,enemy:false,dead:false});
 sound.shoot();burst(x,y,5,p.suit==="hammer"?"#edf4ff":"#ffb260",120);
 }else if(p.suit==="leaf"||p.suit==="cloak"){
 p.tailT=.24;playsound(280,.13,"triangle",.04,710);
 }else{p.attackCooldown=.16}
}
function useInventory(){if(!save.inventory||!save.inventory.length)return;const k=save.inventory.shift();spawnDrop(p.x+8,p.y-65,k);saveNow();announce("ITEM: "+labelSuit(k))}
function beginBonus(pipe){
 if(level.secret)return;level.secret=true;level.secretT=21;level.secretBack=p.x;p.x=level.roomStart+18;p.y=GR-p.h-22;p.vy=0;p.vx=0;cam=Math.max(0,p.x-220);
 announce("SECRET COIN VAULT · 21 SEC",2.3);sound.power();
}
function endBonus(){level.secret=false;level.secretT=0;p.x=level.secretBack;p.y=GR-p.h-20;p.vx=0;p.vy=0;cam=Math.max(0,p.x-300);announce("SECRET COMPLETE!");}
function updatePlayer(dt){
 if(p.dead){p.age+=dt;p.vy+=1850*dt;p.y+=p.vy*dt;return}
 p.age+=dt;p.attackCooldown=Math.max(0,p.attackCooldown-dt);p.attackT=Math.max(0,p.attackT-dt);p.tailT=Math.max(0,p.tailT-dt);p.invuln=Math.max(0,p.invuln-dt);p.starT=Math.max(0,p.starT-dt);
 const left=input("left"),right=input("right"),down=input("down"),jump=input("jump"),attack=input("attack"),extra=input("extra");
 const underwater=level.w===4&&p.y>270;
 p.swimT=Math.max(0,p.swimT-dt);
 if(jump&&!prevJump)p.buffer=.13;else p.buffer=Math.max(0,p.buffer-dt);prevJump=jump;
 if(attack&&!prevAttack)fireAttack();prevAttack=attack;
 if(extra&&!prevExtra)useInventory();prevExtra=extra;
 if(attack&&p.suit==="fire"&&p.attackCooldown<=0)fireAttack();
 if(attack&&p.suit==="hammer"&&p.attackCooldown<=0)fireAttack();
 const accel=p.grounded?2650:underwater?1100:1600,run=attack?430:320,max=underwater?250:run;
 if(left!==right){p.vx+= (left?-1:1)*accel*dt;p.dir=left?-1:1}
 else p.vx*=Math.pow(p.grounded?(level.w===5?.96:.74):.985,dt*60);
 p.vx=clamp(p.vx,-max,max);if(Math.abs(p.vx)<2)p.vx=0;
 p.duck=down&&p.grounded&&p.suit!=="normal";p.run=Math.abs(p.vx)>230;
 if(p.grounded)p.coyote=.11;else p.coyote=Math.max(0,p.coyote-dt);
 if(p.buffer>0&&(p.coyote>0||underwater)&&!p.duck){
  p.vy=underwater?-370:-700; p.grounded=false;p.coyote=0;p.buffer=0;p.swimT=underwater?.3:0;sound.jump();burst(p.x+17,p.y+p.h,underwater?9:5,underwater?"#b1efff":"#d5e3d9",110);
 }
 if(!jump&&p.vy< -140)p.vy+=2250*dt;
 let grav=underwater?590:1820;
 if((p.suit==="leaf"||p.suit==="cloak")&&jump&&p.vy>0){grav=270;p.vy=Math.min(p.vy,150);p.glide+=dt}else p.glide=0;
 p.vy=clamp(p.vy+grav*dt,-920,underwater?470:1100);
 moveBody(p,dt,true);
 if(level.secret){level.secretT-=dt;if(level.secretT<=0||p.x>level.roomExit-65)endBonus()}
 if(down){const pipe=level.pipes.find(q=>Math.abs(p.x+p.w/2-q.x-q.w/2)<33&&Math.abs(p.y+p.h-q.y)<10&&q.bonus&&!q.entered);
  if(pipe){pipe.entered=true;beginBonus(pipe)}}
 if(p.y>H+220)die();
 if(!level.secret&&p.x>=level.goalX&&(!level.bossCleared?mobs.every(e=>e.kind!=="boss"||e.dead):true)){clearStage()}
 if(p.tailT>0)for(const m of mobs){if(m.dead)continue;const area={x:p.dir>0?p.x+p.w-3:p.x-80,y:p.y+5,w:83,h:p.h+12};if(hit(area,m)){damageMob(m,1,p.dir*400)}}
 for(const m of mobs){if(m.dead||m.stun>0)continue;if(!hit({x:p.x+4,y:p.y+5,w:p.w-8,h:p.h-5},m))continue;
  if(p.starT>0){damageMob(m,10,p.dir*350);continue}
  if(p.vy>80&&p.y+p.h-m.y<29&&m.kind!=="spike"&&m.kind!=="plant"&&m.kind!=="ghost"){
   damageMob(m,m.kind==="boss"?1:1,p.dir*40);p.vy=-455;p.grounded=false;sound.stomp();burst(m.x+m.w/2,m.y,7,"#f5e9b2",160);
  }else hurt()}
 for(const c of coins){if(!c.dead&&(!c.secretOnly||level.secret)&&hit(p,c))getCoin(c)}
 for(const d of drops){if(!d.dead&&(!d.secretOnly||level.secret)&&hit(p,d))pick(d)}
 for(const h of hazards){const active=h.kind==="spike"||Math.sin(h.age*3.2+h.cycle)>.12;
  if(active&&hit(p,{x:h.x+8,y:h.y+3,w:h.w-16,h:h.h-5}))hurt()}
}
function damageMob(m,n,force=0){
 if(m.dead||m.stun>0)return;
 if(m.kind==="beetle"&&!m.shell){m.shell=true;m.vx=0;m.stun=.28;m.y=GR-30;m.h=30;score(100);sound.stomp();return}
 if(m.kind==="beetle"&&m.shell&&Math.abs(m.vx)<80){m.vx=force||p.dir*580;m.stun=.15;score(120);sound.stomp();return}
 m.hp-=n;m.stun=.28;m.alert=.4;shake=m.kind==="boss"?8:1;
 if(m.hp<=0){m.dead=true;score(m.kind==="boss"?6000:220);burst(m.x+m.w/2,m.y+m.h/2,m.kind==="boss"?35:15,m.kind==="boss"?"#ffc781":"#b9edff",m.kind==="boss"?360:190);
  if(m.kind==="boss"){level.bossCleared=true;announce("BOSS DEFEATED! · EXIT OPEN",3);sound.win();screenFlash=.45;spawnDrop(m.x,m.y-25,"star")}
 }else{burst(m.x+m.w/2,m.y+10,7,"#ffd68d",150);sound.stomp()}
}
function shootMob(m,kind){
 if(m.kind==="ghost")return;
 m.alert=.5;m.shot=(level.shadow?1.3:2.2)+Math.random()*1.2;
 let vx=p.x<m.x?-1:1;vx*=m.kind==="boss"?330:270;
 shots.push({kind:kind||"orb",enemy:true,x:m.x+m.w/2,y:m.y+22,w:17,h:17,vx,vy:m.kind==="thrower"?-340:m.kind==="boss"?-160:0,t:0,life:4,dead:false});
 sound.shoot();burst(m.x+m.w/2,m.y+22,5,"#ffab81",110);
}
function updateMob(m,dt){
 if(m.dead)return;
 m.age+=dt;m.stun=Math.max(0,m.stun-dt);m.alert=Math.max(0,(m.alert||0)-dt);m.shot-=dt;
 if(m.kind==="plant"){
  m.y=m.home+Math.sin(m.age*2.1+m.phase)*23;m.alert=m.shot<.5?.5:0;
  if(m.shot<=0&&Math.abs(m.x-p.x)<600)shootMob(m,"seed");
  return;
 }
 if(m.kind==="ghost"){m.x+=m.dir*(level.shadow?85:64)*dt;m.y=270+Math.sin(m.age*1.7+m.phase)*80;
 if(Math.abs(m.x-m.home)>190)m.dir*=-1;return}
 if(m.kind==="fish"){m.x+=m.dir*(level.shadow?135:90)*dt;m.y=315+Math.sin(m.age*2.5+m.phase)*66;
 if(Math.abs(m.x-m.home)>200)m.dir*=-1;return}
 if(m.kind==="flyer"){m.x+=m.dir*(level.shadow?138:100)*dt;m.y=265+Math.sin(m.age*3.1+m.phase)*60;
 if(Math.abs(m.x-m.home)>180)m.dir*=-1;return}
 if(m.kind==="launcher"){if(m.shot<=0&&Math.abs(m.x-p.x)<850)shootMob(m,"bullet");return}
 if(m.kind==="boss"){
  if(m.stun>0)return;
  m.vx=(p.x<m.x?-1:1)*(level.shadow?130:88);
  if(m.grounded&&m.shot<1.1&&Math.random()<.035)m.vy=-630;
  if(m.shot<=0&&Math.abs(m.x-p.x)<850){shootMob(m,"fire");m.shot=level.shadow?1.5:2.4}
 }else if(m.kind==="beetle"&&m.shell){
   if(Math.abs(m.vx)>80){m.vx*=.997}
 }else{
   const speed={walker:75,beetle:76,spike:85,thrower:56}[m.kind]||75;
   m.vx=m.dir*speed*(level.shadow?1.5:1);
   if(m.kind==="thrower"&&m.shot<=0&&Math.abs(p.x-m.x)<650)shootMob(m,"hammer");
 }
 if(m.kind!=="boss"&&m.kind!=="beetle"&&m.grounded){
  const ahead=m.x+m.w/2+m.dir*(m.w/2+12);
  if(!isSolidAt(ahead,m.y+m.h+9)&&m.kind!=="thrower")m.dir*=-1;
 }
 m.vy=Math.min(1050,m.vy+1800*dt);const oldV=m.vx;moveBody(m,dt);
 if(oldV&&!m.vx&&m.kind!=="boss")m.vx=m.dir*70;
 if(m.y>H+300){m.dead=true;return}
 if(m.kind==="beetle"&&m.shell&&Math.abs(m.vx)>100){for(const b of mobs){if(b!==m&&!b.dead&&hit(m,b))damageMob(b,3,m.vx)}}
}
function updateShots(dt){
 for(const s of shots){if(s.dead)continue;s.t+=dt;s.life-=dt;if(s.life<=0){s.dead=true;continue}
 s.vy+=(s.kind==="hammer"?1200:s.kind==="fire"?450:s.kind==="orb"?500:s.kind==="seed"?500:s.kind==="bullet"?0:950)*dt;
 s.x+=s.vx*dt;s.y+=s.vy*dt;
 if(s.x<0||s.x>level.len*T||s.y>H+500){s.dead=true;continue}
 if(s.enemy){if(hit(s,p)&&p.invuln<=0&&p.starT<=0){s.dead=true;hurt()}}
 else{for(const m of mobs){if(!m.dead&&hit(s,m)){s.dead=true;damageMob(m,s.kind==="hammer"?2:1,s.vx*.2);break}}}
 if(s.dead)continue;
 const tiles=solidRects(s.x,s.y,s.w,s.h);
 for(const r of tiles){if(!hit(s,r))continue;
 if(s.kind==="fire"&&!s.enemy&&s.vy>=0&&s.t<1){s.y=r.y-s.h;s.vy=-330;s.vx*=.87}else{s.dead=true;burst(s.x,s.y,5,s.enemy?"#ffa37f":"#ffcc77",100)}break}
 }
 shots=shots.filter(s=>!s.dead);
}
function updateLoose(dt){
 for(const d of drops){if(d.dead)continue;d.age+=dt;if(!d.float){d.vy+=1200*dt;d.y+=d.vy*dt;if(d.y+d.h>=GR){d.y=GR-d.h;d.vy=0}}
 else d.y+=Math.sin(d.age*2.5)*9*dt}
 for(const h of hazards)h.age+=dt;
 for(const c of coins)c.t+=dt;
 for(const v of particles){v.t+=dt;v.x+=v.vx*dt;v.y+=v.vy*dt;v.vy+=v.coin?240*dt:500*dt}
 particles=particles.filter(v=>v.t<v.max);coins=coins.filter(v=>!v.dead);drops=drops.filter(v=>!v.dead);mobs=mobs.filter(v=>!v.dead||v.kind==="boss");
 for(const v of effects)v.age+=dt;effects=effects.filter(v=>v.age<v.max);
}
function clearStage(){
 if(mode!=="playing")return;mode="clear";sound.win();score(Math.max(0,Math.floor(level.time))*12+2500);
 let n=level.n,sh=level.shadow,final=n===32;
 if(sh)save.shadowUnlocked=Math.max(save.shadowUnlocked,Math.min(32,n+1));
 else save.unlocked=Math.max(save.unlocked,Math.min(32,n+1));
 if(final&&!sh)save.shadow=true;
 save.current=final?1:n+1;save.suit=p.suit;saveNow();
 burst(p.x+18,p.y,40,"#ffec88",260);
 setOverlay(final?(sh?"COMPLETE 64 / 64":"MAIN QUEST COMPLETE"):"COURSE CLEAR",final?(sh?"LEGEND OF THE KINGDOM":"SHADOW WORLD UNLOCKED"):"COURSE "+level.w+"-"+level.s+" CLEAR!",
  final?(sh?"表32面・裏32面、全64面制覇。おめでとう。":"表面32面クリア。敵と地形が強化された裏面32面に挑戦できます。"):"SCORE +2500 / 残り時間ボーナス。次のステージへ進みます。",[
  {text:final&&!sh?"裏面へ":final?"最初から":"NEXT STAGE",fn:()=>startStage(final?1:n+1,final?true:sh)},
  {text:"ステージ選択",fn:showMap,alt:true}
 ]);
}
function pollPad(){
 for(let k of Object.keys(pad))pad[k]=false;
 try{const gp=navigator.getGamepads&&Array.from(navigator.getGamepads()).find(Boolean);if(!gp)return;
 const b=i=>!!gp.buttons[i]?.pressed;pad.left=gp.axes[0]<-.27||b(14);pad.right=gp.axes[0]>.27||b(15);
 pad.down=gp.axes[1]>.35||b(13);pad.jump=b(0)||b(3);pad.attack=b(1)||b(2)||b(5);pad.extra=b(4);
 if(b(9)&&!prevEnter){prevEnter=true;togglePause()}else if(!b(9))prevEnter=false;
 }catch(e){}
}
function update(dt){
 clock+=dt;frame++;pollPad();
 if(mode!=="playing"){if(p)p.age+=dt;return}
 if(!p||!level)return;
 level.time-=dt;shake=Math.max(0,shake-30*dt);screenFlash=Math.max(0,screenFlash-2*dt);toastT=Math.max(0,toastT-dt);
 if(level.time<=0){die();level.time=120;return}
 updatePlayer(dt);for(const m of mobs){if(Math.abs(m.x-p.x)<1300)updateMob(m,dt)}
 updateShots(dt);updateLoose(dt);
 cam=mix(cam,clamp(p.x-315,0,Math.max(0,level.len*T-W)),Math.min(1,dt*5.7));
 if(Math.abs(p.x-checkpoint)>1800&&p.x>level.goalX*.48){checkpoint=p.x;announce("CHECKPOINT SAVED")}
 if(clock-lastHud>.18){updateHud();lastHud=clock}
}
function updateHud(){
 const st=level?level.w+"-"+level.s:"1-1";$("worldLabel").textContent=st;$("modeLabel").textContent=level&&level.shadow?"SHADOW":"NORMAL";
 $("coinLabel").textContent=String(save.coins).padStart(2,"0");$("lifeLabel").textContent=String(save.lives).padStart(2,"0");
 $("scoreLabel").textContent=String(save.score).padStart(6,"0");$("timeLabel").textContent=String(Math.max(0,Math.ceil(level?.time||390)));
 $("suitLabel").textContent=labelSuit(p?.suit||"normal");
}
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function circ(x,y,r,col){g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
function line(x1,y1,x2,y2,col,width=3){g.strokeStyle=col;g.lineWidth=width;g.lineCap="round";g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function poly(points,color){g.fillStyle=color;g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.closePath();g.fill()}
function cloud(x,y,k=1,alpha=1){
 g.globalAlpha=alpha;circ(x,y,23*k,"#ffffff");circ(x+23*k,y-11*k,29*k,"#ffffff");circ(x+54*k,y,22*k,"#ffffff");rect(x-5*k,y,77*k,16*k,"#ffffff");g.globalAlpha=1;
}
function drawBackground(){
 const a=level.theme,t=clock,sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,a.sky[0]);sky.addColorStop(1,a.sky[1]);rect(0,0,W,H,sky);
 if(level.secret){
  const cave=g.createLinearGradient(0,0,0,H);cave.addColorStop(0,"#0b1934");cave.addColorStop(1,"#364979");rect(0,0,W,H,cave);
  for(let i=0;i<14;i++){const x=(i*150-cam*.17)%1100;poly([[x,-5],[x+55,0],[x+30,95+i%3*33]],"#5879a85f");circ(x+52,200+i%5*40,3+i%4,"#a9f5e3")}
  return;
 }
 if(level.shadow){rect(0,0,W,H,"#17122a54");for(let i=0;i<33;i++)circ((i*173+67)%W,(i*71)%290,1.4+i%3*.5,"#edddff")}
 const day=level.w===7||level.w===8;
 circ(760-(cam*.012)%60,105,day?48:56,day?"#ffc399":"#fff6d1");
 for(let i=-2;i<9;i++){let x=(i*260+100-cam*.13)%(W+340);if(x<-180)x+=W+340;cloud(x,80+Math.sin(i*12)*38,.64+(i%3)*.19,day?.6:.78)}
 for(let j=0;j<3;j++){g.fillStyle=j===0?a.far:j===1?a.hill:a.ground;g.globalAlpha=j===0?.26:j===1?.42:.3;
  const offset=(cam*(.16+j*.14))%300;
  for(let i=-2;i<7;i++){const x=i*300-offset,hill=140+((i*37+j*91)%80);
   g.beginPath();g.moveTo(x,H);g.quadraticCurveTo(x+155,H-hill,x+310,H);g.closePath();g.fill()}
 }g.globalAlpha=1;
 if(level.w===3){for(let i=-1;i<14;i++){const x=i*135-(cam*.35)%135;rect(x,210,26,290,"#4c715e33");circ(x+15,212,68,"#4ca27c29")}}
 if(level.w===4){rect(0,322,W,218,"#178ac02e");for(let i=0;i<16;i++){let x=(i*80-cam*.2)%1000;if(x<0)x+=1000;line(x,333+Math.sin(clock*2+i)*5,x+34,332+Math.sin(clock*2+i)*5,"#e5fbff77",2)}}
 if(level.w===8){for(let i=0;i<22;i++){const x=(i*127+Math.sin(clock+i)*30)%W,y=(i*71-clock*27)%490;circ(x,y<0?y+490:y,2+i%3,"#ffbc7777")}}
}
function drawTile(ix,iy,id){
 const a=level.theme,x=ix*T-cam,y=iy*T;
 if(x<-T||x>W+T)return;
 if(id===1){
 rect(x,y,T,T,a.ground);rect(x+3,y+8,T-6,T-12,"#00000012");
 if(iy===10||level.map[iy-1][ix]===0){rect(x,y,T,9,a.edge);rect(x,y+8,T,5,"#d7f7b055")}
 for(let k=0;k<4;k++){const rx=x+(ix*71+iy*17+k*19)%42,ry=y+17+(ix*23+iy*37+k*13)%23;rect(rx,ry,4+k%3,3,k%2?"#281d2942":"#d8b68755")}
 }else if(id===2||id===3||id===4||id===5){
 const col=id===3?"#ffce67":id===5?"#8d8ea3":id===4?level.theme.stone:level.theme.brick;
 rect(x+1,y+1,T-2,T-2,"#243149");rect(x+3,y+3,T-6,T-6,col);
 rect(x+5,y+5,T-11,6,"#ffffff44");rect(x+4,y+T-8,T-9,5,"#0000003c");
 if(id===2){line(x+3,y+25,x+45,y+25,"#663a3c88",3);line(x+20,y+5,x+20,y+25,"#663a3c88",3);line(x+32,y+25,x+32,y+45,"#663a3c88",3)}
 if(id===4){line(x+5,y+22,x+43,y+22,"#00000032",3);line(x+29,y+23,x+29,y+44,"#00000032",2)}
 if(id===3){circ(x+24,y+23,16,"#f5a943");g.font="900 30px system-ui";g.textAlign="center";g.fillStyle="#fff5c5";g.fillText("?",x+24,y+34);
 circ(x+9,y+9,3,"#fff6ca");circ(x+39,y+39,3,"#fff6ca")}
 if(id===5){rect(x+15,y+16,18,16,"#5a6276");rect(x+19,y+13,10,4,"#5a6276")}
 }
}
function drawPipes(){
 for(const q of level.pipes){const x=q.x-cam,y=q.y;if(x<-115||x>W+115)continue;
 const c=level.w===8?"#b66e72":level.w===5?"#6bb8cf":"#43b889";
 rect(x+9,y+15,q.w-18,q.h-15,"#164858");rect(x+19,y+15,q.w-28,q.h-15,c);rect(x+22,y+18,10,q.h-25,"#ffffff5c");rect(x+67,y+18,9,q.h-20,"#00000033");
 rect(x,y,q.w,28,"#143e54");rect(x+4,y+3,q.w-8,20,c);rect(x+9,y+5,13,14,"#b7ffd093");rect(x+q.w-16,y+5,10,15,"#00000033");
 if(q.bonus){g.font="bold 15px system-ui";g.textAlign="center";g.fillStyle="#fff5bc";g.fillText("▼",x+q.w/2,y-13)}
 }
 if(level.secret){const x=level.roomExit-cam;rect(x,GR-96,80,96,"#163c60");rect(x+4,GR-96,72,18,"#75d6b0");g.fillStyle="#fff0c4";g.textAlign="center";g.font="bold 21px system-ui";g.fillText("EXIT ▶",x+38,GR-116)}
}
function drawCoins(){
 for(const c of coins){if(c.secretOnly&&!level.secret)continue;const x=c.x-cam+10,y=c.y+10+Math.sin(c.t*4)*3;if(x<-30||x>W+30)continue;
 g.save();g.translate(x,y);g.scale(Math.max(.16,Math.abs(Math.cos(c.t*2.2))),1);circ(0,0,12,"#b77728");circ(-1,-2,10,"#ffdb68");rect(-2,-8,4,14,"#fff6bf");g.restore();
 }
}
function drawDrops(){
 for(const d of drops){if(d.secretOnly&&!level.secret)continue;const x=d.x-cam,y=d.y+Math.sin(d.age*3)*3;if(x<-70||x>W+70)continue;
 g.save();g.translate(x+17,y+17);
 const col={grow:"#ff866f",fire:"#ffca68",leaf:"#74d19a",frog:"#58d1bf",hammer:"#a9c0ec",cloak:"#bd9fe6",star:"#fff073"}[d.kind]||"#ffd572";
 circ(0,0,18,"#24405e");circ(0,0,15,col);circ(-5,-5,4,"#ffffff9c");
 if(d.kind==="grow"){circ(0,-3,11,"#ea596c");rect(-10,4,20,7,"#fff6da");circ(-6,-5,3,"#fff6da");circ(6,-5,3,"#fff6da")}
 if(d.kind==="leaf"){poly([[-3,12],[-10,-8],[12,-13],[8,8]],"#e3f6a0");line(-4,9,9,-10,"#387e53",2)}
 if(d.kind==="frog"){circ(-7,-5,6,"#d1fff2");circ(7,-5,6,"#d1fff2");circ(-6,-5,2,"#143a42");circ(7,-5,2,"#143a42")}
 if(d.kind==="fire"){poly([[0,-13],[10,0],[2,13],[-11,7],[-8,-5]],"#ff663f");circ(1,5,6,"#ffeaaa")}
 if(d.kind==="hammer"){g.rotate(-.5);rect(-3,-10,6,24,"#6a4e6a");rect(-13,-13,26,9,"#eaf9ff")}
 if(d.kind==="cloak"){poly([[-12,9],[0,-15],[13,10],[4,6],[-5,14]],"#f1defd")}
 if(d.kind==="star"){g.rotate(d.age);star(0,0,5,15,7,"#fff8bd")}
 g.restore();
 }
}
function star(x,y,n,ro,ri,col){g.fillStyle=col;g.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,r=i%2?ri:ro;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.fill()}
function drawHazards(){
 for(const h of hazards){const x=h.x-cam;if(x<-60||x>W+60)continue;
 if(h.kind==="spike"){for(let i=0;i<3;i++)poly([[x+i*16,h.y+h.h],[x+8+i*16,h.y],[x+16+i*16,h.y+h.h]],i%2?"#e9d2e3":"#e8ecf2");
  line(x,h.y+h.h,x+48,h.y+h.h,"#5e4d67",4)
 }else{let on=Math.sin(h.age*3.2+h.cycle)>.12;if(on){for(let i=0;i<4;i++){const yy=h.y+Math.sin(h.age*8+i)*8;poly([[x+i*12,h.y+h.h],[x+i*12+6,yy-8],[x+(i+1)*12,h.y+h.h]],i%2?"#ffdb74":"#ff7550")}}
  else rect(x,h.y+h.h-6,48,6,"#9c343f")}
 }
}
function drawGoals(){
 const x=level.goalX-cam;
 if(x<-190||x>W+200)return;
 const open=level.bossCleared;
 rect(x+16,105,7,GR-103,"#e2e9e6");circ(x+19,103,11,open?"#ffd96b":"#718a9b");
 poly([[x+23,120],[x+115,139],[x+23,164]],open?"#ff6d83":"#627685");star(x+49,141,5,11,5,"#ffecaa");
 const castleX=x+130;rect(castleX,GR-95,117,95,"#7686a3");rect(castleX+9,GR-116,27,25,"#90a2b7");rect(castleX+78,GR-116,27,25,"#90a2b7");
 for(let i=0;i<3;i++)rect(castleX+17+i*37,GR-120,21,15,"#a4b3ce");
 rect(castleX+43,GR-53,31,53,open?"#21394a":"#ee595b");
 rect(castleX+49,GR-46,19,46,open?"#102735":"#aa3554");
 if(!open){g.font="900 18px system-ui";g.textAlign="center";g.fillStyle="white";g.fillText("BOSS",x+38,82)}
}
function drawMob(m){
 if(m.dead)return;const x=m.x-cam,y=m.y;if(x<-120||x>W+120)return;
 g.save();g.translate(x+m.w/2,y+m.h/2);g.scale(m.dir,1);
 const t=m.age,walk=Math.sin(t*12)*6;
 if(m.stun>0&&Math.floor(clock*20)%2)g.globalAlpha=.5;
 if(m.kind==="walker"){
 circ(0,-4,18,"#755075");circ(-4,-6,14,"#c27983");circ(8,-3,7,"#de9da4");
 circ(-7,-9,3,"#fff");circ(5,-9,3,"#fff");circ(-5,-9,1.5,"#302643");circ(7,-9,1.5,"#302643");
 rect(-17,11+walk,14,7,"#553d57");rect(3,11-walk,14,7,"#553d57");
 }else if(m.kind==="beetle"){
 if(m.shell){g.scale(1,.73);circ(0,0,22,"#306e68");circ(0,-3,18,"#72c5a0");line(-15,-1,15,-1,"#274b61",3);rect(-20,10,42,5,"#466a65")}
 else{circ(0,-4,20,"#47737a");circ(0,-7,17,"#75ca9d");circ(6,-7,10,"#b1f5c0");circ(7,-10,3,"#132d45");line(-13,11,-15,17+walk,"#4d4f6e",6);line(12,11,14,17-walk,"#4d4f6e",6)}
 }else if(m.kind==="spike"){
 circ(0,2,18,"#bb6889");for(let i=0;i<8;i++){const a=i*TAU/8+t*.4;poly([[Math.cos(a)*13,Math.sin(a)*13],[Math.cos(a+.2)*25,Math.sin(a+.2)*25],[Math.cos(a+.4)*14,Math.sin(a+.4)*14]],"#e6e8e7")}
 circ(6,-6,4,"#fff");circ(7,-6,1.8,"#361943")
 }else if(m.kind==="flyer"){circ(0,1,15,"#5b648f");poly([[-9,0],[-35,-10-Math.sin(t*17)*12],[-22,14]],"#b2bce5");poly([[8,0],[35,-10-Math.sin(t*17)*12],[23,14]],"#b2bce5");circ(7,-5,4,"#ffe8aa");circ(9,-5,2,"#383650")}
 else if(m.kind==="fish"){poly([[-6,0],[-25,-17+Math.sin(t*9)*8],[-25,17-Math.sin(t*9)*8]],"#eab477");circ(0,0,17,"#4eacd0");circ(9,-5,4,"white");circ(11,-5,2,"#172c4a");poly([[-4,-11],[5,-24],[8,-8]],"#91e6e0")}
 else if(m.kind==="plant"){rect(-9,4,18,25,"#289a69");circ(0,-10,17,"#de7167");circ(7,-16,7,"#fff1b7");circ(8,-16,3,"#57293b");poly([[-17,-10],[-28,-17],[-20,0]],"#65b978")}
 else if(m.kind==="ghost"){g.globalAlpha=.79;circ(0,-7,21,"#e1e6ff");poly([[-21,-6],[-21,23],[-12,15],[-3,23],[5,14],[12,23],[21,16],[21,-6]],"#e1e6ff");circ(-6,-10,5,"#4b527e");circ(8,-10,5,"#4b527e");g.globalAlpha=1}
 else if(m.kind==="thrower"){line(-9,12,-12,27+walk,"#4b4761",8);line(8,12,12,27-walk,"#4b4761",8);rect(-20,-16,39,35,"#536785");circ(0,-20,15,"#e5a77d");rect(-16,-31,31,9,"#34486a");circ(7,-22,3,"#24283b");line(15,-7,25,m.alert>0?-17:2,"#dfb399",8);if(m.alert>0)circ(29,-18,5,"#ffd36a")}
 else if(m.kind==="launcher"){rect(-24,-7,48,35,"#455b75");rect(-20,-22,33,24,"#8292b2");circ(13,-13,13,"#2a334c");circ(13,-13,7,"#151c2e");rect(-19,19,13,10,"#2e3b58");rect(8,19,13,10,"#2e3b58")}
 else if(m.kind==="boss"){
 g.save();const s=1+Math.sin(t*2)*.035;g.scale(s,s);
 line(-23,18,-25,47+walk,"#472b4c",14);line(23,18,24,47-walk,"#472b4c",14);
 poly([[-35,-30],[-43,19],[-11,31],[33,23],[43,-15],[20,-44]],"#553b61");
 circ(0,-20,41,"#aa596a");poly([[-33,-49],[-22,-78],[-5,-53],[14,-82],[34,-48]],"#eab77b");
 circ(-14,-25,11,"#fff8cd");circ(17,-25,11,"#fff8cd");circ(-10,-25,4,"#242039");circ(20,-25,4,"#242039");
 poly([[-16,1],[0,11],[22,-1],[15,19],[-12,19]],"#50283d");
 line(-33,-4,-46,15+Math.sin(t*8)*11,"#a96872",16);line(32,-3,45,11-Math.sin(t*8)*11,"#a96872",16);
 g.restore();
 const full=level.w===8?(level.shadow?12:9):(level.shadow?7:5);
 rect(-35,-65,70,7,"#311e37");rect(-34,-64,68*clamp(m.hp/full,0,1),5,"#f18475");
 }
 if(m.alert>0&&m.kind!=="boss"){circ(0,-m.h*.75-5,7+Math.sin(clock*24)*2,"#ffce6b");g.font="900 11px sans-serif";g.textAlign="center";g.fillStyle="#713d48";g.fillText("!",0,-m.h*.75-1)}
 g.restore();
}
function drawPlayer(){
 if(!p)return;const x=p.x-cam+p.w/2,y=p.y+p.h;
 g.save();g.translate(x,y);g.scale(p.dir,1);
 if(p.invuln>0&&p.starT<=0&&Math.floor(clock*13)%2){g.globalAlpha=.45}
 if(p.starT>0){g.globalAlpha=.25;for(let i=0;i<6;i++){const a=clock*3+i*TAU/6;circ(Math.cos(a)*35,-28+Math.sin(a)*36,5,"#ffe99e")}g.globalAlpha=1}
 const t=p.age,run=Math.min(1,Math.abs(p.vx)/310),cycle=t*(8+run*12),stride=Math.sin(cycle)*run,
 h=p.h===46?.83:1,duck=p.duck?.65:1;
 g.scale(h,h*duck);
 if((p.suit==="leaf"||p.suit==="cloak")&&(!p.grounded||p.tailT>0)){
  poly([[-10,-33],[-44,-53+Math.sin(t*9)*10],[-36,-9]],p.suit==="leaf"?"#b8eda0":"#dabcf7");
  poly([[13,-36],[46,-54-Math.sin(t*9)*10],[41,-13]],p.suit==="leaf"?"#87cf9b":"#bca9e8");
 }
 if(p.suit==="frog"){circ(0,-29,25,"#4bb89b");circ(-13,-49,10,"#79dcb8");circ(13,-49,10,"#79dcb8");circ(-13,-51,4,"#223e58");circ(13,-51,4,"#223e58")}
 // Independent leg, knee and shoe transforms, interpolated continuously by movement speed.
 const legs=[[-10,stride],[9,-stride]];
 for(const [lx,ph] of legs){const kneeX=lx+ph*10,kneeY=-17+Math.max(0,ph)*6;
  line(lx,-29,kneeX,kneeY,"#253957",9);line(kneeX,kneeY,lx+ph*18,-4+Math.max(0,-ph)*5,"#f7dba6",7);
  g.save();g.translate(lx+ph*18,-3+Math.max(0,-ph)*5);g.rotate(ph*.15);rect(-10,-6,22,8,"#263245");rect(3,-6,8,3,"#647a8c");g.restore()}
 // Cloak and character body.
 if(p.suit==="cloak")poly([[-15,-44],[-23,-5],[21,-9],[15,-41]],"#9b76d5");
 poly([[-16,-45],[15,-45],[21,-20],[-20,-20]],p.suit==="fire"?"#f8ece3":p.suit==="hammer"?"#a9b6cd":"#dc605f");
 rect(-10,-37,21,16,p.suit==="fire"?"#f7a95f":"#4978a7");rect(-15,-32,5,12,"#e7cf8c");rect(11,-32,5,12,"#e7cf8c");
 const arms=[[-17,-stride*.7],[17,stride*.7]];
 for(const [ax,ph] of arms){const attacking=p.attackT>0||p.tailT>0;const ex=ax+(attacking&&ax>0?23:ph*11),ey=-29+(attacking&&ax>0?-8:ph*8);
  line(ax,-41,ex,ey,"#db6567",9);circ(ex,ey,7,"#fff3d9");}
 // Head and face with moving eyes and bob.
 const bob=p.grounded?Math.abs(stride)*1.3:0;
 circ(1,-53-bob,17,"#f2c39b");rect(9,-58-bob,9,6,"#efb58d");circ(9,-55-bob,2.5,"#292f42");
 rect(-15,-67-bob,28,9,"#293f65");rect(-11,-71-bob,24,10,p.suit==="fire"?"#f4f0e2":"#3bb7d4");rect(7,-64-bob,15,5,p.suit==="fire"?"#e7e2d8":"#2b92bb");
 rect(-13,-48-bob,14,4,"#4e3240");rect(1,-48-bob,6,3,"#8f5060");
 if(p.suit==="hammer"){rect(-10,-72,22,5,"#ced8e7");rect(1,-79,11,9,"#718ba8")}
 if(p.suit==="leaf"){poly([[-17,-68],[-28,-78],[-15,-85]],"#b3e7ac")}
 if(p.suit==="cloak"){poly([[-14,-69],[-16,-84],[-2,-72]],"#d5b2ef")}
 if(p.attackT>0&&p.suit==="hammer"){g.save();g.translate(31,-40);g.rotate(-.7+Math.sin(t*21)*.25);rect(-4,-16,7,38,"#6b536d");rect(-17,-19,29,13,"#e8f0fa");g.restore()}
 if(p.tailT>0){for(let i=0;i<3;i++){g.strokeStyle="#fff2ae";g.lineWidth=4;g.beginPath();g.arc(30,-31,25+i*9,-1.4,1.4);g.stroke()}}
 if(p.dead){g.globalAlpha=.6}
 g.restore();
}
function drawProjectiles(){
 for(const s of shots){const x=s.x-cam+s.w/2,y=s.y+s.h/2;if(x<-30||x>W+30)continue;
 g.save();g.translate(x,y);
 if(s.kind==="hammer"){g.rotate(s.t*12);rect(-3,-12,6,25,"#705879");rect(-11,-12,23,10,"#e6e9f9")}
 else if(s.kind==="bullet"){rect(-12,-7,24,14,"#384862");circ(10,0,7,"#eae9de");circ(11,-1,3,"#c46b74")}
 else{circ(0,0,s.enemy?9:8,s.enemy?"#ee715f":"#ffad49");circ(-3,-3,4,"#fff0b9");
 for(let i=1;i<=3;i++)circ(-s.vx/Math.abs(s.vx||1)*i*9,Math.sin(s.t*23+i)*5,3+i*.7,s.enemy?"#ffbc9c88":"#ffcc8e77")}
 g.restore()}
}
function drawParticles(){
 for(const v of particles){g.globalAlpha=Math.max(0,1-v.t/v.max);if(v.coin){circ(v.x-cam,v.y,v.r,"#ffe487");rect(v.x-cam-1,v.y-6,2,12,"#fff6ca")}else rect(v.x-cam,v.y,v.r,v.r,v.color)}g.globalAlpha=1;
}
function drawUI(){
 rect(0,0,W,53,"#122036b8");rect(0,51,W,2,"#ffffff1a");
 g.textBaseline="middle";g.textAlign="left";g.fillStyle="#f7faff";g.font="900 22px ui-monospace,monospace";
 g.fillText((level.shadow?"☾ ":"★ ")+level.w+"-"+level.s,20,26);
 g.fillStyle="#ffe48d";g.fillText("◆ "+String(save.coins).padStart(2,"0"),165,26);
 g.fillStyle="#fef5e5";g.fillText("♥ "+save.lives,280,26);
 g.fillStyle="#b9edff";g.fillText("SCORE "+String(save.score).padStart(7,"0"),398,26);
 g.fillStyle=level.time<75?"#ff7485":"#fcf0c0";g.textAlign="right";g.fillText("TIME "+Math.max(0,Math.ceil(level.time)),930,26);
 if(p){g.textAlign="left";g.font="900 13px ui-monospace,monospace";g.fillStyle="#ffffffdd";g.fillText(labelSuit(p.suit)+(p.starT>0?"  ★"+Math.ceil(p.starT):""),23,72);
 if(save.inventory?.length)g.fillText("STOCK ["+save.inventory.map(labelSuit).join(" / ")+"]  C",170,72)}
 if(toastT>0){g.globalAlpha=Math.min(1,toastT,.85);rect(W/2-290,92,580,52,"#0d253acb");g.textAlign="center";g.font="900 23px ui-monospace,monospace";g.fillStyle="#ffedbc";g.fillText(toast,W/2,118);g.globalAlpha=1}
}
function draw(){
 if(!level)return;
 g.save();g.clearRect(0,0,W,H);
 if(shake>0)g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake*.65);
 drawBackground();
 for(let yy=0;yy<12;yy++)for(let xx=clamp(Math.floor(cam/T)-2,0,level.len-1);xx<Math.min(level.len,Math.ceil((cam+W)/T)+2);xx++){
  const id=level.map[yy][xx];if(id)drawTile(xx,yy,id)}
 if(level.w===8){for(const gap of level.gaps){const x=gap.x*T-cam;if(x>W||x+gap.w*T<0)continue;rect(x,GR,gap.w*T,60,"#f64f45");for(let i=0;i<gap.w*3;i++)circ(x+i*17,GR+5+Math.sin(clock*4+i)*5,7,"#ffb359")}}
 drawPipes();drawGoals();drawHazards();drawCoins();drawDrops();
 for(const m of mobs)drawMob(m);drawProjectiles();drawPlayer();drawParticles();
 drawUI();
 if(screenFlash>0){rect(0,0,W,H,"#ffffff"+Math.round(screenFlash*140).toString(16).padStart(2,"0"))}
 g.restore();
}
function togglePause(){
 if(mode==="playing"){mode="paused";setOverlay("GAME PAUSED","PAUSE","ゲームを一時停止しました。現在のステージを続けるか、マップへ戻れます。",[
 {text:"RESUME",fn:()=>{mode="playing";hideOverlay()}},{text:"RESTART",alt:true,fn:()=>startStage(level.n,level.shadow)},{text:"MAP",alt:true,fn:showMap}])}
 else if(mode==="paused"){mode="playing";hideOverlay()}
}
function onKey(e,down){
 const k=e.code,action=k==="ArrowLeft"||k==="KeyA"?"left":k==="ArrowRight"||k==="KeyD"?"right":k==="ArrowDown"||k==="KeyS"?"down":k==="KeyZ"||k==="Space"||k==="ArrowUp"||k==="KeyW"?"jump":k==="KeyX"||k==="ShiftLeft"||k==="ShiftRight"?"attack":k==="KeyC"?"extra":null;
 if(action){e.preventDefault();if(down)held.add(action);else held.delete(action)}
 if(!down||e.repeat)return;
 if(k==="Escape"||k==="KeyP")togglePause();
 if(k==="Enter"){if(mode==="playing")togglePause();else $("actions").querySelector("button")?.click()}
}
window.addEventListener("keydown",e=>onKey(e,true),{passive:false});window.addEventListener("keyup",e=>onKey(e,false),{passive:false});
window.addEventListener("blur",()=>{held.clear();touchHeld.clear();if(mode==="playing")togglePause()});
document.querySelectorAll("[data-key]").forEach(b=>{
 const action=b.dataset.key;
 const start=e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);touchHeld.add(action);b.classList.add("down")};
 const end=e=>{e.preventDefault();touchHeld.delete(action);b.classList.remove("down")};
 b.addEventListener("pointerdown",start,{passive:false});
 b.addEventListener("pointerup",end,{passive:false});b.addEventListener("pointercancel",end,{passive:false});b.addEventListener("lostpointercapture",end);
});
$("menuBtn").onclick=()=>{if(mode==="playing")showMap();else menu()};
$("pauseBtn").onclick=togglePause;
$("soundBtn").onclick=()=>{sfx=!sfx;$("soundBtn").textContent=sfx?"♫ ON":"♫ OFF";$("soundBtn").classList.toggle("active",sfx);if(sfx)playsound(600,.1)};
$("fullBtn").onclick=()=>{const v=$("view");if(document.fullscreenElement)document.exitFullscreen?.();else v.requestFullscreen?.().catch(()=>{})};
$("startBtn")?.addEventListener("click",()=>startStage(save.current||1,false));$("mapBtn")?.addEventListener("click",showMap);
const dtTarget=1/60;let last=performance.now(),acc=0;
function loop(now){const delta=Math.min(.05,(now-last)/1000);last=now;acc+=delta;
 while(acc>=dtTarget){update(dtTarget);acc-=dtTarget}draw();requestAnimationFrame(loop)}
level=generate(1,1,false);mobs=level.enemies;coins=level.coins;drops=level.drops;hazards=level.hazards;p=newGamePlayer();updateHud();menu();requestAnimationFrame(loop);
})();
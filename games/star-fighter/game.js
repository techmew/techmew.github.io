/* STAR FIGHTER v1.0 — original canvas arcade shooter. No external dependencies. */
(()=>{'use strict';
const W=1200,H=675,TAU=Math.PI*2;
const C=document.getElementById('game'),c=C.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
const ui={overlay:$('overlay'),start:$('startBtn'),pause:$('pauseBtn'),sound:$('soundBtn'),score:$('score'),best:$('best'),mult:$('multiplier'),stage:$('stageLabel'),area:$('areaName'),progress:$('progressBar'),hp:$('hpRow'),lives:$('lives'),bombs:$('bombs'),boss:$('bossHud'),bossName:$('bossName'),bossBar:$('bossBar'),announce:$('announce'),small:$('announceSmall'),main:$('announceMain'),desc:$('announceDesc'),toast:$('toast'),meter:$('meterInfo'),upgrades:[...document.querySelectorAll('.upgrade')],equip:$('equipBtn'),pulse:$('pulseBtn')};
const NAMES=['ORBITAL FIELD','IRON CORRIDOR','DEEP NEBULA'],SUBS=['外縁軌道を突破せよ','機械要塞を突破せよ','星雲の深部を制圧せよ'],BOSSES=['BATTLE CRUISER','FORTRESS CORE','ABYSS TITAN'];
const ROUTE_OPTIONS=[[{name:'漂流船の回廊',desc:'敵が少なく物資を回収しやすい',bonus:'カプセル +1 / パルス +1',risk:0},{name:'プラズマ急流',desc:'高速の編隊が出現し敵が増える',bonus:'カプセル +2 / 撃破得点 +25%',risk:1}],[{name:'星雲の静域',desc:'敵の攻勢が穏やかになる',bonus:'カプセル +1 / パルス +1',risk:0},{name:'紅色の裂け目',desc:'精鋭編隊と高密度の敵が出現',bonus:'カプセル +2 / 撃破得点 +25%',risk:1}]];


/* Event choices are rolled from the run seed and previous branch, not visual RNG. */
const ROUTE_NAMES=[
 [['漂流船の回廊','青い残響','補給航路'],['プラズマ急流','赤い追跡線','雷光の峡谷']],
 [['星雲の静域','蒼光の水路','星屑の避難帯'],['紅色の裂け目','雷雲の回廊','深紅の追撃路']]
];
const ROUTE_EVENTS={
 safe:[
  {id:'salvage',name:'漂流物資',short:'補給ポッド×2',desc:'航行中に物資が漂着',when:21},
  {id:'beacon',name:'修復ビーコン',short:'バリア +1',desc:'防御装置の信号を受信',when:24},
  {id:'cache',name:'旧式補給庫',short:'補給ポッド×2',desc:'旧式の補給庫を発見',when:27},
  {id:'charge',name:'青い共鳴',short:'ドライブ +30',desc:'オーバードライブを充填',when:20}
 ],
 storm:[
  {id:'pursuit',name:'追撃隊の影',short:'精鋭撃破で補給',desc:'迎撃機の追撃が発生',when:21},
  {id:'flare',name:'プラズマ嵐',short:'精鋭撃破で補給',desc:'高速の旋回部隊が襲来',when:24},
  {id:'freighter',name:'武装貨物船',short:'貨物船撃破で補給',desc:'物資を載せた敵艦を迎撃',when:27},
  {id:'ambush',name:'重力の裂け目',short:'精鋭撃破で補給',desc:'重装部隊の待ち伏せ',when:20}
 ]
};
function routeOffer(stage,index){
 const previous=G.routeHistory[stage-1]?.risk??-1;
 const salt=(G.runSeed^Math.imul(previous+2,0x45d9f3b))>>>0;
 const nameRoll=mixSeed(salt,stage+11,index+3);
 const eventRoll=mixSeed(salt^0xa1f5c3d9,stage+29,index+7);
 const event=ROUTE_EVENTS[index?'storm':'safe'][eventRoll%4];
 const chain=stage>0&&previous===index;
 return {...ROUTE_OPTIONS[stage][index],name:ROUTE_NAMES[stage][index][nameRoll%3],event,chain};
}

/* Stage 1 stays neutral. Each branch changes encounter pressure, drops and tactics. */
const ROUTE_TUNING={
 normal:{spawnInterval:1,enemyHp:1,fireInterval:1,pickupRate:.24,magnet:120,bossHp:1,maxEnemies:16,score:1,speed:1},
 safe:{spawnInterval:1.16,enemyHp:.95,fireInterval:1.08,pickupRate:.35,magnet:155,bossHp:.94,maxEnemies:10,score:1,speed:.98},
 storm:{spawnInterval:.96,enemyHp:1.08,fireInterval:.96,pickupRate:.22,magnet:120,bossHp:1.12,maxEnemies:14,score:1.25,speed:1.04}
};
function routeProfile(){return G.stage===0?ROUTE_TUNING.normal:(G.routeRisk?ROUTE_TUNING.storm:ROUTE_TUNING.safe)}

/* Encounter director: bounded, deterministic pressure; never consumes RNG.
   Storms stay riskier than supply routes, while crowding and damage buy space.
   No difficulty values are added to the visible HUD. */
function encounterDirector(){
 const tune=routeProfile(),phase=cl(G.stageTime/[62,68,74][G.stage],0,1);
 const base=G.stage===0?.32:(G.routeRisk===1?.57:.27);
 const crowd=cl(G.enemies.length/tune.maxEnemies,0,1);
 const bullets=cl(G.bullets.length/55,0,1);
 const recovery=G.directorGrace>0?Math.min(.24,.10+G.directorGrace*.016):0;
 const resilience=(p.hp===3?.05:p.hp===1?-.06:0)+(G.lives===1?-.06:0);
 const pressure=cl(base+phase*.16+resilience-crowd*.22-bullets*.09-recovery,.12,.82);
 return {pressure,crowd,bullets,recovery,budget:pressure>.56?8:pressure>.34?6:4};
}
function nextWaveDelay(){
 const d=encounterDirector(),tune=routeProfile();
 const raw=(GR(3.6,5.35)-G.stage*.34)*tune.spawnInterval;
 const crowdDelay=d.crowd>0.5?(d.crowd-.5)*2.3:0;
 const recoveryDelay=G.directorGrace>0?1.15:0;
 return cl(raw*(1.08-(d.pressure-.3)*.23)+crowdDelay+recoveryDelay,2.7,8.5);
}

const MAX=[2,3,2,2,3,3],PNAMES=['BOOST','SPREAD','LASER','MISSILE','OPTION','SHIELD'];
const R=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(R(a,b+1)),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),len=(x,y)=>Math.hypot(x,y);
/* Separate encounter RNG from particles, drawing and audio. Same seed + route + inputs => same gameplay rolls. */
let encounterState=0;
function mixSeed(seed,stage,risk){
 let x=(seed^Math.imul(stage+1,0x9e3779b9)^Math.imul(risk+1,0x85ebca6b))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);
 return (x^x>>>16)>>>0;
}
function seedStage(){encounterState=mixSeed(G.runSeed,G.stage,G.routeRisk)}
function gameRandom(){
 encounterState=(encounterState+0x6d2b79f5)>>>0;
 let t=encounterState;t=Math.imul(t^(t>>>15),t|1);
 t^=t+Math.imul(t^(t>>>7),t|61);
 return ((t^(t>>>14))>>>0)/4294967296;
}
const GR=(a,b)=>a+gameRandom()*(b-a),gri=(a,b)=>Math.floor(GR(a,b+1));
function seedHex(n){return (n>>>0).toString(16).toUpperCase().padStart(8,'0')}
const seedInput=$('seedInput'),seedLabel=$('seedLabel'),seedReplay=$('seedReplay');
try{
 const q=new URLSearchParams(window.location?.search||'').get('seed');
 if(q&&/^[0-9a-f]{1,8}$/i.test(q))seedInput.value=q.toUpperCase();
}catch(e){}
seedReplay.addEventListener('click',()=>{
 if(G.mode!=='over'&&G.mode!=='win')return;
 seedInput.value=seedHex(G.runSeed);startGame();
});
function chooseSeed(){
 const typed=seedInput.value.trim().replace(/^0x/i,'');
 if(typed&&!/^[0-9a-f]{1,8}$/i.test(typed)){
  seedLabel.textContent='16進数 1〜8桁で入力';seedInput.focus();return null;
 }
 return typed?parseInt(typed,16)>>>0:Math.floor(Math.random()*4294967296)>>>0;
}

/* Safe auto-save at sector boundaries and route gates; combat state is not serialized. */
const CHECKPOINT_KEY='star_fighter_checkpoint_v1';
const continueBtn=$('continueBtn'),continueInfo=$('continueInfo');
function readCheckpoint(){
 try{
  const raw=localStorage.getItem(CHECKPOINT_KEY);if(!raw)return null;
  const d=JSON.parse(raw),int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
  if(!d||d.v!==1||!['sector','route'].includes(d.mode)||!int(d.stage,0,2)||!int(d.runSeed,0,0xffffffff)||
    !int(d.score,0,1e9)||!int(d.lives,1,3)||!int(d.pulses,0,5)||!int(d.energy,0,6)||
    !int(d.selected,0,5)||!Array.isArray(d.levels)||d.levels.length!==6||!d.levels.every((v,i)=>int(v,0,MAX[i]))||
    !Array.isArray(d.routeHistory)||d.routeHistory.length!==d.stage||!int(d.routeRisk,0,1)||
    !d.player||!int(d.player.hp,1,3)||!int(d.player.shield,0,5)||!int(d.driveCharge,0,100)||
    !int(d.grazes,0,1e7)||!int(d.maxCombo,0,1e7)||!int(d.killCount,0,1e7)||!int(d.eventCount,0,2)||
    d.routeHistory.some((r,i)=>!r||r.stage!==i+2||!int(r.risk,0,1)||typeof r.route!=='string'||r.route.length>30||
      typeof r.event!=='string'||r.event.length>30)||
    (d.stage===0&&d.routeRisk!==0)||(d.stage>0&&d.routeRisk!==d.routeHistory[d.stage-1].risk))throw Error('invalid checkpoint');
  return d;
 }catch(e){try{localStorage.removeItem(CHECKPOINT_KEY)}catch(err){}return null}
}
function updateContinueButton(){
 const d=readCheckpoint();continueBtn.hidden=!d;continueInfo.hidden=!d;
 if(d){continueBtn.textContent='CONTINUE · SECTOR 0'+(d.stage+1)+(d.mode==='route'?' / ROUTE':'')+' ▶';
  continueInfo.textContent='SEED '+seedHex(d.runSeed)+' · セクター開始地点から再開'}
}
function saveCheckpoint(mode='sector'){
 if(G.mode!=='playing'&&G.mode!=='route')return;
 const d={v:1,mode,stage:G.stage,runSeed:G.runSeed,score:Math.max(0,Math.floor(G.score)),
  lives:G.lives,pulses:G.pulses,energy:G.energy,selected:G.selected,levels:G.levels.slice(),
  routeRisk:G.routeRisk,routeHistory:G.routeHistory.map(r=>({...r})),
  player:{hp:p.hp,shield:p.shield},driveCharge:Math.floor(G.driveCharge),
  grazes:G.grazes,maxCombo:G.maxCombo,killCount:G.killCount,eventCount:G.eventCount};
 try{localStorage.setItem(CHECKPOINT_KEY,JSON.stringify(d))}catch(e){}
}
function clearCheckpoint(){try{localStorage.removeItem(CHECKPOINT_KEY)}catch(e){}updateContinueButton()}
function resumeCheckpoint(){
 const d=readCheckpoint();if(!d){updateContinueButton();showToast('セーブデータがありません');return}
 seedInput.value=seedHex(d.runSeed);startGame();if(G.mode!=='playing')return;
 G.stage=d.stage;G.score=d.score;G.lives=d.lives;G.pulses=d.pulses;G.energy=d.energy;G.selected=d.selected;
 G.levels=d.levels.slice();G.routeRisk=d.routeRisk;G.routeHistory=d.routeHistory.map(r=>({...r}));
 G.driveCharge=d.driveCharge;G.grazes=d.grazes;G.maxCombo=d.maxCombo;G.killCount=d.killCount;G.eventCount=d.eventCount;
 p.hp=d.player.hp;p.shield=d.player.shield;p.invul=3;
 G.stageTime=0;G.scroll=G.stage*1800;G.pendingWave=null;G.spawn=2*routeProfile().spawnInterval;G.directorGrace=0;G.directorWaveCount=0;
 G.activeEvent=null;G.eventTriggered=false;G.eventChain=false;
 if(G.stage>0){const prev=G.routeHistory[G.stage-1],offer=routeOffer(G.stage-1,prev.risk);
  G.activeEvent=offer.event;G.eventChain=!!prev.chain}
 seedStage();resetTerrain();G.shots=[];G.enemies=[];G.bullets=[];G.pickups=[];G.boss=null;
 G.transitioning=false;G.bossDone=false;G.transition=0;G.overdrive=0;
 if(d.mode==='route')openRoute();
 else{showAnnounce('CONTINUE / SECTOR 0'+(G.stage+1),NAMES[G.stage],'セクター開始地点から再開',2.5);saveCheckpoint()}
 updateHud();syncOrientation();
}
continueBtn.addEventListener('click',resumeCheckpoint);

const KEY={};let audio=null,bgm=null,sound=true,last=0,screenPulse=0,stickX=0,stickY=0,stickPointer=null,pausedByRotation=false;
const G={mode:'title',time:0,total:0,stage:0,stageTime:0,scroll:0,spawn:0,score:0,best:0,combo:0,comboTime:0,lives:3,pulses:2,energy:0,selected:0,levels:[0,0,0,0,0,0],boss:null,bossDone:false,transition:0,transitioning:false,shots:[],enemies:[],bullets:[],pickups:[],particles:[],rings:[],stars:[],player:null,trail:[],shake:0,announceTime:0,toastTime:0,fireTimer:0,missileTimer:0,musicTime:0,beat:0,uiTime:0,firstInput:false,driveCharge:0,overdrive:0,grazes:0,maxCombo:0,killCount:0,routeRisk:0,routeHistory:[],routeSelected:0,runSeed:0,routeOffers:[],activeEvent:null,eventTriggered:false,eventChain:false,eventCount:0,pendingWave:null,waveSerial:0,squadAttackCooldown:0,aiVolleys:0,directorGrace:0,directorWaveCount:0,terrain:null,terrainSchedule:[],terrainIndex:0};
try{G.best=Number(localStorage.getItem('star_fighter_best')||0)||0;sound=localStorage.getItem('star_fighter_sound')!=='off'}catch(e){}
ui.sound.textContent=sound?'♫ BGM ON':'♫ BGM OFF';
for(let i=0;i<170;i++)G.stars.push({x:R(0,W),y:R(0,H),z:R(.25,2.6),tw:R(0,TAU),size:R(.4,1.9)});
let p={x:215,y:337,targetX:215,targetY:337,angle:0,hp:3,invul:0,shield:0,alive:true};G.player=p;
function beginAudio(){if(!sound)return;try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();if(!bgm&&window.CyberBGM)bgm=new window.CyberBGM(audio);if(bgm){bgm.setEnabled(true);bgm.start()}}catch(e){audio=null}}
function tone(freq,dur=.08,type='sine',volume=.045,slide=0){if(!audio||!sound)return;try{const now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(30,freq),now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),now+dur);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+dur);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+dur+.01)}catch(e){}}
function melody(dt){if(sound&&bgm)bgm.update(G.stage,!!G.boss)}
function showToast(txt){ui.toast.textContent=txt;ui.toast.classList.add('show');G.toastTime=2}
function showAnnounce(head,title,sub,duration=3){ui.small.textContent=head;ui.main.textContent=title;ui.desc.textContent=sub;ui.announce.classList.add('show');G.announceTime=duration}
function hideOverlay(){ui.overlay.classList.add('hidden')}
function showOverlay(kind){ui.overlay.classList.remove('hidden');continueBtn.hidden=kind!=='title';continueInfo.hidden=kind!=='title';if(kind==='title')updateContinueButton();seedLabel.textContent=kind==='title'?'SEED — 空欄ならランダム':'SEED '+seedHex(G.runSeed);seedReplay.hidden=kind!=='win'&&kind!=='over';const inner=ui.overlay.querySelector('.overlay-inner');const eyebrow=inner.querySelector('.eyebrow'),title=inner.querySelector('.title-mark'),subtitle=inner.querySelector('.subtitle'),intro=inner.querySelector('.intro');if(kind==='pause'){eyebrow.textContent='MISSION INTERRUPTED';title.innerHTML='<span>PAUSE</span><strong>MODE</strong>';subtitle.textContent='一時停止中';intro.innerHTML='準備ができたら戦闘に戻ろう。';ui.start.innerHTML='RESUME <span>▶</span>'}else if(kind==='win'){eyebrow.textContent='ALL SECTORS CLEAR';title.innerHTML='<span>MISSION</span><strong>CLEAR</strong>';subtitle.textContent='全3ステージ突破';intro.innerHTML='SCORE '+G.score.toLocaleString()+' · MAX CHAIN '+G.maxCombo+'<br>GRAZE '+G.grazes+' · 宇宙の平和を守り抜いた！';ui.start.innerHTML='PLAY AGAIN <span>▶</span>'}else if(kind==='over'){eyebrow.textContent='SIGNAL LOST';title.innerHTML='<span>GAME</span><strong>OVER</strong>';subtitle.textContent='任務失敗';intro.innerHTML='SCORE '+G.score.toLocaleString()+' · MAX CHAIN '+G.maxCombo+'<br>GRAZE '+G.grazes+' · 再出撃して記録を更新しよう。';ui.start.innerHTML='RETRY MISSION <span>▶</span>'}else{eyebrow.textContent='NEW ARCADE EXPERIENCE / 2026';title.innerHTML='<span>STAR</span><strong>FIGHTER</strong>';subtitle.textContent='横スクロール・シューティング';intro.innerHTML='高速戦闘。装備進化。巨大戦艦との決戦。<br>シンプル操作で、撃ち抜く快感を。';ui.start.innerHTML='MISSION START <span>▶</span>'}}
function startGame(){const runSeed=chooseSeed();if(runSeed===null)return;G.mode='playing';$('sidePauseBtn').innerHTML='Ⅱ <span>一時停止</span>';stickX=stickY=0;resetStick();G.time=0;G.total=0;G.stage=0;G.stageTime=0;G.scroll=0;G.spawn=1.4;G.score=0;G.combo=0;G.comboTime=0;G.lives=3;G.pulses=2;G.energy=0;G.selected=0;G.levels=[0,0,0,0,0,0];G.shots=[];G.enemies=[];G.bullets=[];G.pickups=[];G.particles=[];G.rings=[];G.boss=null;G.bossDone=false;G.transition=0;G.transitioning=false;G.shake=0;G.fireTimer=0;G.missileTimer=0;G.beat=0;G.musicTime=0;G.firstInput=false;G.routeRisk=0;G.routeSelected=0;G.routeHistory=[];G.routeOffers=[];G.activeEvent=null;G.eventTriggered=false;G.eventChain=false;G.eventCount=0;G.pendingWave=null;G.waveSerial=0;G.squadAttackCooldown=0;G.aiVolleys=0;G.directorGrace=0;G.directorWaveCount=0;G.runSeed=runSeed;seedStage();resetTerrain();seedLabel.textContent='SEED '+seedHex(G.runSeed);$('routePanel').classList.remove('open');G.driveCharge=0;G.overdrive=0;G.grazes=0;G.maxCombo=0;G.killCount=0;G.trail=[];G.player={x:215,y:337,targetX:215,targetY:337,angle:0,hp:3,invul:2,shield:0,alive:true};p=G.player;for(let i=0;i<120;i++)G.trail.push({x:p.x-i*3.5,y:p.y});showAnnounce('MISSION 01',NAMES[0],SUBS[0],3.5);hideOverlay();beginAudio();tone(440,.25,'sawtooth',.05,620);saveCheckpoint();updateHud()}
function pause(){if(G.mode==='playing'){G.mode='paused';resetStick();showOverlay('pause');bgm?.stop()}else if(G.mode==='paused'){G.mode='playing';hideOverlay();last=performance.now();if(sound&&bgm){bgm.setEnabled(true);bgm.start()}}$('sidePauseBtn').innerHTML=G.mode==='paused'?'▶ <span>再開</span>':'Ⅱ <span>一時停止</span>'}
function endGame(victory=false){G.terrain=null;bgm?.stop();G.mode=victory?'win':'over';clearCheckpoint();if(G.score>G.best){G.best=G.score;try{localStorage.setItem('star_fighter_best',String(G.best))}catch(e){}}tone(victory?520:140,.55,'sawtooth',.08,victory?380:-110);showOverlay(G.mode);updateHud()}
ui.start.addEventListener('click',()=>{if(G.mode==='paused')pause();else if(G.mode!=='playing')startGame()});
ui.pause.addEventListener('click',pause);$('sidePauseBtn').addEventListener('click',pause);$('sidePulseBtn').addEventListener('click',pulse);$('sideEquipBtn').addEventListener('click',equip);
$('titleReturnBtn').addEventListener('click',()=>{if(G.mode==='title')return;bgm?.stop();resetStick();G.mode='title';$('sidePauseBtn').innerHTML='Ⅱ <span>一時停止</span>';$('routePanel').classList.remove('open');showOverlay('title');updateHud()});ui.sound.addEventListener('click',()=>{sound=!sound;ui.sound.textContent=sound?'♫ BGM ON':'♫ BGM OFF';try{localStorage.setItem('star_fighter_sound',sound?'on':'off')}catch(e){}if(sound){if(!bgm)beginAudio();else{audio?.resume();bgm.setEnabled(true);bgm.start()}}else bgm?.setEnabled(false)});
ui.equip.addEventListener('click',equip);ui.pulse.addEventListener('click',pulse);$('helpBtn').addEventListener('click',()=>{if(G.mode==='playing')pause();else if(G.mode==='title'){showToast('左タッチパッドをなぞって移動 / 自動射撃 / 衝撃波：SPACE')}});
ui.upgrades.forEach((b,i)=>b.addEventListener('click',()=>{G.selected=i;if(G.mode==='playing'&&G.energy>=i+1&&G.levels[i]<MAX[i])showToast('強化を押して '+PNAMES[i]+' を装備');updateHud()}));
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();KEY[k]=true;if(e.repeat)return;if(k==='p'||k==='escape'){pause();return}if(k==='m'){ui.sound.click();return}if(G.mode==='title'||G.mode==='over'||G.mode==='win'){if(k==='enter')startGame();return}if(G.mode==='route'){if(k==='1'||k==='2')chooseRoute(Number(k)-1);if(k==='arrowleft'||k==='arrowright')selectRouteCard(1-G.routeSelected);if(k==='enter')chooseRoute(G.routeSelected);return}if(G.mode!=='playing')return;if(k===' '){pulse();return}if(k==='x'||k==='tab'){if(k==='tab')e.preventDefault();G.selected=(G.selected+1)%6;updateHud();tone(550,.04,'sine',.025)}if(k==='enter'||k==='z')equip()});
window.addEventListener('keyup',e=>{KEY[e.key.toLowerCase()]=false});window.addEventListener('blur',()=>{if(G.mode==='playing')pause()});

/* Relative touchpad: pointer delta is applied immediately to the ship.
   No joystick dead zone or low-pass movement on touch; first touch never jumps. */
const pad=$('touchPad');
let padPointer=null,padLastX=0,padLastY=0;
function resetStick(){
 stickX=stickY=0;stickPointer=null;padPointer=null;
 pad?.classList.remove('touching');
}
function touchScale(){
 const width=Math.max(320,window.innerWidth||800),height=Math.max(300,window.innerHeight||480);
 return cl(Math.min(W/width,H/height)*1.4,1.15,3.3);
}
function padMove(e){
 if(G.mode!=='playing'||padPointer!==e.pointerId||!p)return;
 const events=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():null;
 const q=events&&events.length?events[events.length-1]:e;
 const dx=q.clientX-padLastX,dy=q.clientY-padLastY;
 padLastX=q.clientX;padLastY=q.clientY;
 if(!Number.isFinite(dx)||!Number.isFinite(dy))return;
 const scale=touchScale();
 const nx=cl(p.x+dx*scale,62,W-135),ny=cl(p.y+dy*scale,98,H-51);
 p.angle=cl((ny-p.y)*.025,-.22,.22);
 p.x=p.targetX=nx;p.y=p.targetY=ny;
 G.firstInput=true;
}
pad.addEventListener('pointerdown',e=>{
 if(G.mode!=='playing'||padPointer!==null)return;
 e.preventDefault();padPointer=e.pointerId;
 padLastX=e.clientX;padLastY=e.clientY;
 pad.classList.add('touching');
 try{pad.setPointerCapture(e.pointerId)}catch(_){}
});
pad.addEventListener('pointermove',e=>{if(e.pointerId===padPointer){e.preventDefault();padMove(e)}});
for(const kind of ['pointerup','pointercancel','lostpointercapture']){
 pad.addEventListener(kind,e=>{if(e.pointerId===padPointer){e.preventDefault();resetStick()}});
}
window.addEventListener('blur',resetStick);
/* Portrait is supported. Changing orientation must never auto-pause the run. */
function syncOrientation(){
 resetStick();
 last=performance.now();
}
window.addEventListener('resize',syncOrientation);
window.addEventListener('orientationchange',syncOrientation);
let dragging=false,pid=-1;
function coords(e){const b=C.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*H}}
C.addEventListener('pointerdown',e=>{if(G.mode!=='playing'||e.pointerType==='touch')return;dragging=true;pid=e.pointerId;try{C.setPointerCapture(pid)}catch(err){}const q=coords(e);G.player.targetX=cl(q.x,60,W-130);G.player.targetY=cl(q.y,88,H-52);G.firstInput=true});
C.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pid||G.mode!=='playing')return;const q=coords(e);G.player.targetX=cl(q.x,60,W-130);G.player.targetY=cl(q.y,88,H-52)});
const release=e=>{if(e.pointerId===pid){dragging=false;pid=-1}};C.addEventListener('pointerup',release);C.addEventListener('pointercancel',release);
function equip(){if(G.mode!=='playing')return;const i=G.selected,need=i+1;if(G.energy<need){showToast('カプセルが足りません');tone(150,.1,'triangle',.025);return}if(G.levels[i]>=MAX[i]){showToast('最大強化済み');return}G.energy-=need;G.levels[i]++;if(i===5)p.shield=3+G.levels[i];if(i===4)G.trail.length=0;for(let j=0;j<110;j++)G.trail.push({x:p.x-j*3,y:p.y});ring(p.x,p.y,115,'#64eaff',.65);emit(p.x,p.y,36,'#7df8ff',260);tone(430,.25,'sawtooth',.09,780);showToast(PNAMES[i]+' LEVEL '+G.levels[i]);G.selected=0;updateHud()}
function pulse(){if(G.mode!=='playing'||G.pulses<=0)return;G.pulses--;G.shake=17;screenPulse=.85;G.bullets=[];if(G.terrain?.phase==='active')G.terrain.blocks.forEach(b=>b.hp=0);p.invul=Math.max(p.invul,.65);ring(p.x,p.y,1250,'#a6faff',.75);emit(p.x,p.y,85,'#8bf4ff',460);G.enemies.forEach(e=>{e.hp-=75;emit(e.x,e.y,7,'#ffca81',160)});if(G.boss)G.boss.hp-=110;tone(120,.8,'sawtooth',.14,800);showToast('SHOCK PULSE');updateHud()}
function updateHud(){ui.score.textContent=String(G.score).padStart(8,'0');ui.best.textContent=String(Math.max(G.best,G.score)).padStart(8,'0');ui.mult.textContent='×'+(1+Math.min(3,Math.floor(G.combo/8))*.5).toFixed(1);ui.stage.textContent='SECTOR 0'+(G.stage+1);ui.area.textContent=G.stage===0?NAMES[0]:(G.routeHistory[G.stage-1]?.route||NAMES[G.stage]);ui.area.title=NAMES[G.stage]+' / '+ui.area.textContent;ui.progress.style.width=(G.bossDone?100:Math.min(100,G.stageTime/(G.stage===0?62:G.stage===1?68:74)*100))+'%';[...ui.hp.children].forEach((x,i)=>x.classList.toggle('off',i>=p.hp));ui.lives.textContent='LIVES '+String(G.lives).padStart(2,'0');ui.bombs.textContent='PULSE '+String(G.pulses).padStart(2,'0');ui.meter.textContent='CAPSULE × '+G.energy+' / 6 · '+(G.overdrive>0?'OVERDRIVE '+Math.ceil(G.overdrive)+'s':G.energy?'強化可能':'カプセルを集めよう');ui.upgrades.forEach((b,i)=>{b.classList.toggle('selected',i===G.selected);b.classList.toggle('ready',G.energy>=i+1&&G.levels[i]<MAX[i]);b.classList.toggle('maxed',G.levels[i]>=MAX[i]);b.querySelector('.u-key').textContent=G.levels[i]?'LV '+G.levels[i]:(String(i+1).padStart(2,'0'))});ui.equip.disabled=G.mode!=='playing'||G.energy<G.selected+1||G.levels[G.selected]>=MAX[G.selected];ui.pulse.disabled=G.mode!=='playing'||G.pulses===0;ui.boss.classList.toggle('active',!!G.boss);if(G.boss){ui.bossName.textContent=G.boss.name+(G.boss.phase?' · RAGE':'');ui.bossBar.style.width=cl(G.boss.hp/G.boss.maxHp*100,0,100)+'%'}}
function ring(x,y,max,color,life=.6){G.rings.push({x,y,r:4,max,color,life,t:0})}
function emit(x,y,num,color,power=160){for(let i=0;i<num;i++){const a=R(0,TAU),s=R(power*.15,power);G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:R(.2,.85),maxLife:.85,size:R(1.2,4.4),color,glow:Math.random()>.55})}}
function explosion(x,y,r=32){emit(x,y,Math.round(r*.85),'#ffb66c',r*7);emit(x,y,Math.round(r*.4),'#70dcff',r*4);ring(x,y,r*3,'#ffbd88');G.shake=Math.min(25,G.shake+r*.12);tone(R(70,115),.2,'sawtooth',.038,-50)}
function chargeDrive(amount){if(G.overdrive>0)return;G.driveCharge=Math.min(100,G.driveCharge+amount);if(G.driveCharge>=100){G.driveCharge=0;G.overdrive=8;G.shake=Math.max(G.shake,5);screenPulse=.24;ring(p.x,p.y,155,'#f7d989',.55);emit(p.x,p.y,25,'#ffe49b',180);showToast('OVERDRIVE · 8 SEC');tone(520,.28,'sawtooth',.08,720)}}
function addScore(n){G.combo++;G.maxCombo=Math.max(G.maxCombo,G.combo);G.comboTime=3.8;G.score+=Math.round(n*(1+Math.min(3,Math.floor(G.combo/8))*.5)*(G.overdrive>0?1.5:1)*routeProfile().score);if(G.score>G.best)G.best=G.score}
function pickup(x,y,forced=false){G.pickups.push({x,y,vx:-GR(35,68),phase:GR(0,TAU),t:0,type:forced?'energy':gameRandom()>.92?'pulse':'energy'})}
function enemy(type,x,y,extra={}){const tune=routeProfile();if(G.enemies.length>=tune.maxEnemies)return;
if(x>=W){for(let attempt=0;attempt<12;attempt++){
 const blocked=G.enemies.some(e=>e.x>=W-30&&Math.abs(e.x-x)<waveRadius(type)+waveRadius(e.type)+18&&Math.abs(e.y-y)<waveRadius(type)+waveRadius(e.type)+18);
 if(!blocked)break;x+=90;
}}
let hp={scout:22,dart:15,tank:125,turret:75,spinner:35,carrier:100,mine:35,interceptor:65}[type]||25;hp*=(1+G.stage*.35)*tune.enemyHp;G.enemies.push({type,x,y,hp,maxHp:hp,t:0,fire:GR(.9,1.8)*tune.fireInterval*(G.directorGrace>0?1.18:1),phase:GR(0,TAU),seed:GR(0,100),aiHomeY:y,aiPhase:0,aiWarn:0,aiVolleyArmed:false,score:type==='tank'?750:type==='carrier'?700:type==='interceptor'?540:250,...extra})}

/* Preserve a traversable lane for each announced formation at entry.
   The cue is not a shield: aimed bullets and later enemy motion still matter. */
const WAVE_LANES=[155,337,515];
function waveRadius(type){return type==='tank'||type==='carrier'?39:type==='interceptor'?29:24}
function waveClearance(type){return 145+(type==='spinner'?20:type==='interceptor'?28:0)}
function placeOutsideLane(y,lane,margin){
 y=cl(y,108,H-88);const low=lane-margin,high=lane+margin;
 if(y<=low||y>=high)return y;
 const up=low>=108?low:null,down=high<=H-88?high:null;
 if(up===null)return down;if(down===null)return up;
 return y-up<=down-y?up:down;
}
function arrangeWave(units){
 if(!units.length)return {units:[],safeY:337};
 let best=null;
 for(const lane of WAVE_LANES){
  const adjusted=units.map(u=>({...u,y:placeOutsideLane(u.y,lane,waveClearance(u.type))}));
  const move=adjusted.reduce((sum,u,i)=>sum+Math.abs(u.y-units[i].y),0);
  const cost=Math.abs(lane-p.y)*2.1+move*.23;
  if(!best||cost<best.cost)best={lane,adjusted,cost};
 }
 const placed=[];
 for(const u of best.adjusted){
  let x=u.x,rad=waveRadius(u.type);
  for(let attempt=0;attempt<14;attempt++){
   if(!placed.some(v=>Math.abs(x-v.x)<rad+waveRadius(v.type)+24&&Math.abs(u.y-v.y)<rad+waveRadius(v.type)+25))break;
   x+=92;
  }
  if(!placed.some(v=>Math.abs(x-v.x)<rad+waveRadius(v.type)+24&&Math.abs(u.y-v.y)<rad+waveRadius(v.type)+25))placed.push({...u,x});
 }
 return {units:placed,safeY:best.lane};
}
function spawnWave(){
// A terrain warning or active barrier must never share the entry window with a formation.
if(G.pendingWave||G.terrain||terrainApproaching()||terrainQueued()||G.boss||G.bossDone||G.transitioning)return false;
const director=encounterDirector();
const planned=[];function queueEnemy(type,x,y,extra={}){if(planned.length<director.budget&&G.enemies.length+planned.length<routeProfile().maxEnemies)planned.push({type,x,y,extra})}

const s=G.stage,tune=routeProfile(),risk=s>0&&G.routeRisk===1,safe=s>0&&!risk;
if(G.enemies.length>=Math.min(tune.maxEnemies-2,Math.floor(tune.maxEnemies*.78)))return false;
const safeWaves=[0,0,1,2,3,4,5,6,10,11,14],stormWaves=[1,2,3,4,5,6,7,7,8,9,11,12,13,14];
const stormPool=risk&&director.pressure<.53?[0,1,2,3,4,5,6,7,11,12,14]:stormWaves;
const w=s===0?[0,0,1,2,3,4,5,6,11,14][gri(0,9)]:(risk?stormPool[gri(0,stormPool.length-1)]:safeWaves[gri(0,safeWaves.length-1)]);
if(w===0){const yy=GR(180,465);for(let i=0;i<(safe?4:6);i++)queueEnemy('scout',W+60+i*68,cl(yy+Math.sin(i*.9)*66,122,H-70),{pattern:1})}
else if(w===1){const n=safe?3:4;for(let i=0;i<n;i++)queueEnemy('dart',W+50+i*105,145+i*390/Math.max(1,n-1),{pattern:2})}
else if(w===2){queueEnemy('tank',W+100,GR(195,490));for(let i=0;i<(safe?2:3);i++)queueEnemy('scout',W+230+i*85,GR(140,545))}
else if(w===3){for(let i=0;i<(safe?3:4);i++)queueEnemy('spinner',W+60+i*80,GR(145,540))}
else if(w===4){queueEnemy('carrier',W+70,GR(180,500));for(let i=0;i<(safe?1:2);i++)queueEnemy('scout',W+200+i*80,GR(140,540))}
else if(w===5){queueEnemy('turret',W+90,105);if(!safe){queueEnemy('turret',W+200,H-96);queueEnemy('dart',W+175,340)}}
else if(w===6){const n=safe?2:4;for(let i=0;i<n;i++)queueEnemy('mine',W+50+i*85,170+i*320/Math.max(1,n-1))}
else if(w===7){for(let i=0;i<2;i++)queueEnemy('interceptor',W+100+i*110,160+i*145,{lockY:null})}
else if(w===8){queueEnemy('tank',W+125,GR(220,440));queueEnemy('interceptor',W+310,195,{lockY:null});queueEnemy('interceptor',W+410,490,{lockY:null})}
else if(w===9){queueEnemy('carrier',W+100,GR(210,450));queueEnemy('dart',W+245,185);queueEnemy('dart',W+350,490);queueEnemy('spinner',W+450,345)}
else if(w===10){queueEnemy('carrier',W+95,GR(200,470));queueEnemy('scout',W+260,210);queueEnemy('scout',W+345,475)}
else if(w===11){const mid=GR(255,420),n=safe?4:6;for(let i=0;i<n;i++)queueEnemy('scout',W+65+i*70,cl(mid+Math.sin(i*1.15)*112,135,H-85),{pattern:3})}
else if(w===12){for(let i=0;i<3;i++){queueEnemy('dart',W+75+i*110,145+i*28,{pattern:4});queueEnemy('dart',W+125+i*110,H-145-i*28,{pattern:4})}}
else if(w===13){queueEnemy('tank',W+115,GR(245,430));for(let i=0;i<4;i++)queueEnemy('scout',W+215+i*88,175+i*97,{pattern:5})}
else if(w===14){const n=safe?4:6;for(let i=0;i<n;i++)queueEnemy('mine',W+80+i*98,i%2?H-135:135,{pattern:6})}
if(risk&&s===1&&gameRandom()>.7)queueEnemy('turret',W+420,gameRandom()>.5?125:H-110);
if(risk&&s===2&&gameRandom()>.65)queueEnemy('spinner',W+450,GR(195,480));
if(!planned.length)return false;
const names=['偵察編隊','高速突撃','重装護衛','旋回部隊','輸送護衛','砲台戦線','機雷帯','迎撃隊','重装迎撃','複合編隊','輸送船団','螺旋編隊','上下挟撃','槍型編隊','機雷の回廊'];
const arranged=arrangeWave(planned);
if(!arranged.units.length)return false;
G.pendingWave={timer:1.35,label:names[w],units:arranged.units,kind:w,safeY:arranged.safeY,id:++G.waveSerial,phase:GR(0,TAU)};
G.directorWaveCount++;
return true;
}
const MAX_HOSTILE_BULLETS=120;
function bullet(x,y,a,s=290,size=5,col='#ff8d61',damage=1){
 // Preserve a readable upper bound on projectile density, especially on mobile.
 if(G.bullets.length>=MAX_HOSTILE_BULLETS)return;
 G.bullets.push({x,y,px:x,py:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,size,life:5,color:col,damage});
}
function aim(x,y,spread=0){return Math.atan2(p.y-y,p.x-x)+spread}

/* Distinct enemy motion; synchronized wave roles are derived at spawn, not
   from frame-dependent RNG. The marked entry lane stays open until mid-screen. */
function moveEnemyAI(e,dt){
 const home=e.aiHomeY??e.y,slot=e.squadSlot||0,phase=e.aiPhase||e.phase;
 let target=home,follow=2.4;
 if(e.type==='scout'){
  if(e.pattern===3){target=home+Math.sin(e.t*2.4+slot*.66+phase)*66;follow=3.2}
  else if(e.pattern===5){target=home+Math.sin(e.t*1.6+slot*.22+phase)*23;follow=3}
  else{target=home+Math.sin(e.t*2.8+e.phase)*37;follow=3}
  if([2,4,10,13].includes(e.squadKind)){
   const flagship=G.enemies.find(v=>v.squadId===e.squadId&&(v.type==='tank'||v.type==='carrier')&&v.hp>0);
   if(flagship)target=flagship.y+cl(home-(flagship.aiHomeY??flagship.y),-125,125)*.7+Math.sin(e.t*2.5+slot*.4)*12;
  }
 }else if(e.type==='dart'){
  if(e.pattern===4){target=home+(home<H/2?1:-1)*Math.sin(Math.min(1,e.t/2.4)*Math.PI)*68;follow=3.6}
  else target=home+Math.sin(e.t*4.2+e.phase)*43;
 }else if(e.type==='spinner')target=home+Math.sin(e.t*2.9+e.phase)*67;
 else if(e.type==='carrier')target=home+Math.cos(e.t*1.4+phase)*28;
 else if(e.type==='tank')target=home+Math.sin(e.t*1.05+phase)*13;
 else if(e.type==='mine')target=home+Math.sin(e.t*1.4+slot*.9+phase)*15;
 if(e.type==='turret')return;
 target=cl(target,108,H-88);
 if(Number.isFinite(e.aiSafeY)&&e.x>540)target=placeOutsideLane(target,e.aiSafeY,105);
 e.y=cl(e.y+(target-e.y)*Math.min(1,dt*follow),100,H-75);
}
/* Locked-on squad volleys are announced for 0.92s, limited to 3 attackers.
   The warning reticle stays fixed even if the player moves. */
function coordinateVolley(e){
 if(!e.aiVolleyArmed||e.squadId===undefined||e.x>980||e.x<450||e.t<.75||(G.squadAttackCooldown>0||G.directorGrace>0))return;
 const eligible=G.enemies.filter(v=>v.squadId===e.squadId&&v.hp>0&&v.x<W-25&&v.x>130&&v.type!=='mine'&&v.type!=='interceptor').sort((a,b)=>a.squadSlot-b.squadSlot);
 if(eligible.length<2||eligible[0]!==e)return;
 const chosen=eligible.slice(0,3),targetX=cl(p.x,80,W-250),targetY=cl(p.y,105,H-75);
 for(const v of G.enemies)if(v.squadId===e.squadId)v.aiVolleyArmed=false;
 for(const v of chosen){v.aiWarn=.92;v.aiAimX=targetX;v.aiAimY=targetY;v.aiWarningLead=v===e}
 G.squadAttackCooldown=2.8;G.aiVolleys++;
}

function fireEnemy(e,target=null){if(e.type==='mine'||e.type==='interceptor')return;const a=target?Math.atan2(target.y-e.y,target.x-(e.x-30)):aim(e.x-30,e.y);const base=G.stage*22+(G.stage>0&&G.routeRisk?10:0);if(e.type==='tank'||e.type==='carrier'){for(let i=-1;i<=1;i++)bullet(e.x-42,e.y,a+i*.20,270+base,6,'#ffac71')}else if(e.type==='turret'){for(let i=-2;i<=2;i++)bullet(e.x-32,e.y,a+i*.14,260+base,5,'#ff577e')}else if(e.type==='spinner'){for(let i=0;i<6;i++)bullet(e.x,e.y,e.t*1.5+i*TAU/6,210+base,4,'#ffcc7e')}else{bullet(e.x-24,e.y,a,290+base,4,'#f9767f')}}
function spawnBoss(){G.pendingWave=null;G.terrain=null;const hp=Math.round([1900,2650,3600][G.stage]*routeProfile().bossHp);G.boss={name:BOSSES[G.stage],x:W+220,y:335,w:[250,280,300][G.stage],hp,maxHp:hp,t:0,fire:1.6,pattern:0,core:0,phase:0,charge:0,beam:0,beamY:0};G.bossDone=false;G.enemies=[];showAnnounce('WARNING / SECTOR '+String(G.stage+1).padStart(2,'0'),BOSSES[G.stage],'大型反応接近　総攻撃開始',2.4);tone(90,.9,'sawtooth',.09,170)}
function bossAttack(b){
if(b.x>980)return;
const a=aim(b.x-105,b.y),s=G.stage,angry=b.phase===1;
if(angry&&b.pattern%4===3){
b.charge=.95;b.beamY=cl(p.y,112,H-88);b.fire=2.35;b.pattern++;
tone(250,.37,'sawtooth',.06,-130);
return;
}
const count=angry?3:2;
if(b.pattern%3===0){
 for(let i=-(3+s+count);i<=3+s+count;i++)bullet(b.x-130,b.y,a+i*.12,220+s*20+(angry?35:0),5,'#ff628c')
}else if(b.pattern%3===1){
 const n=(angry?21:15)+s*4;
 for(let i=0;i<n;i++)bullet(b.x-85,b.y,i/n*TAU+b.t*.3,170+s*16,4.5,'#ffa35e')
}else{
 for(let i=0;i<(angry?6:4);i++){
  const yy=b.y-(angry?160:100)+i*(angry?64:67);
  bullet(b.x-140,yy,aim(b.x-140,yy),285+s*25,5.5,'#ff5376')
 }
}
b.pattern++;b.fire=angry?(s===2?.91:1.12):(s===2?1.24:1.48);
tone(165,.11,'triangle',.015,50)
}

/* Route gate: paused time & risk/reward choices alter subsequent encounter pacing. */

/* Navigation map: a fixed three-sector graph. Completed edges and the current
   ship position are derived only from the route history, never guessed. */
function renderRouteMap(){
 const x=[86,450,814],top=40,bottom=138,center=90;
 const at=(sector,risk)=>({x:x[sector],y:sector===0?center:(risk?bottom:top)});
 const currentRisk=G.stage===0?0:(G.routeHistory[G.stage-1]?.risk||0);
 const edges=[];
 for(let sector=1;sector<3;sector++){
  for(const sourceRisk of (sector===1?[0]:[0,1]))for(const risk of [0,1]){
   const a=at(sector-1,sourceRisk),b=at(sector,risk);
   const selected=sector<=G.stage&&G.routeHistory[sector-1]?.risk===risk&&(sector===1||G.routeHistory[sector-2]?.risk===sourceRisk);
   const offered=sector===G.stage+1&&(sector===1||sourceRisk===currentRisk);
   const cls=selected?'complete':offered?(risk?'offered risk':'offered safe'):'future';
   edges.push('<path class="map-edge '+cls+'" d="M'+a.x+' '+a.y+' C'+(a.x+140)+' '+a.y+' '+(b.x-140)+' '+b.y+' '+b.x+' '+b.y+'"/>');
  }
 }
 const nodes=[];
 for(let sector=0;sector<3;sector++){
  for(const risk of (sector===0?[0]:[0,1])){
   const pt=at(sector,risk),isCurrent=sector===G.stage&&(sector===0||risk===currentRisk);
   const completed=sector<G.stage&&(sector===0||G.routeHistory[sector-1]?.risk===risk);
   const available=sector===G.stage+1;
   const chosen=available&&G.routeSelected===risk;
   const status=isCurrent?'current':completed?'complete':available?(risk?'available risk':'available safe'):'future';
   const label=sector===0?'出撃地点':completed||isCurrent?(G.routeHistory[sector-1]?.route||'航路'):(available?(G.routeOffers[risk]?.name||'航路'):'未発見');
   nodes.push('<g class="map-node '+status+(chosen?' chosen':'')+'" transform="translate('+pt.x+' '+pt.y+')">'+
    '<circle class="map-halo" r="17"/><circle class="map-dot" r="9"/>'+
    (isCurrent?'<path class="map-ship" d="M-5 0 L5 -6 L3 0 L5 6 Z"/>':'')+
    '<text class="map-node-label" y="'+(risk===1?29:-22)+'" text-anchor="middle">'+label+'</text>'+
    (isCurrent?'<text class="map-you" y="29" text-anchor="middle">● 現在地</text>':'')+
    '</g>');
  }
 }
 const svg='<svg viewBox="0 0 900 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
  '<text class="map-sector" x="86" y="13" text-anchor="middle">SECTOR 01</text>'+
  '<text class="map-sector" x="450" y="13" text-anchor="middle">SECTOR 02</text>'+
  '<text class="map-sector" x="814" y="13" text-anchor="middle">SECTOR 03</text>'+
  edges.join('')+nodes.join('')+'</svg>';
 const current=G.stage===0?'出撃地点':G.routeHistory[G.stage-1]?.route||NAMES[G.stage];
 const next=G.routeOffers;
 const el=$('routeMap');el.innerHTML=svg;
 el.setAttribute('aria-label','航路マップ。現在地：'+current+'。次の候補：'+next.map(o=>o.name).join('、')+'。');
}
function selectRouteCard(index){
 if(G.mode!=='route'||index!==0&&index!==1)return;
 G.routeSelected=index;
 const buttons=[$('routeSafe'),$('routeRisk')];
 buttons.forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index))});
 renderRouteMap();
}

function openRoute(){
 if(G.stage>=2){endGame(true);return}
 G.mode='route';G.transitioning=false;resetStick();bgm?.stop();
 const options=G.routeOffers=[routeOffer(G.stage,0),routeOffer(G.stage,1)],panel=$('routePanel');
 $('routeHeading').textContent='次の航路を選択';
 $('routeNextSector').textContent='SECTOR 0'+(G.stage+2);$('routeSeed').textContent='SEED '+seedHex(G.runSeed);
 $('routeSafeName').textContent=options[0].name;
 $('routeSafeDesc').textContent='EVENT · '+options[0].event.name+(options[0].chain?' · 連続航路':'');
 $('routeSafeBonus').textContent=options[0].bonus+' · '+options[0].event.short;
 $('routeRiskName').textContent=options[1].name;
 $('routeRiskDesc').textContent='EVENT · '+options[1].event.name+(options[1].chain?' · 連続航路':'');
 $('routeRiskBonus').textContent=options[1].bonus+' · '+options[1].event.short;
 $('routeSafe').title=options[0].event.desc;$('routeRisk').title=options[1].event.desc;
 G.routeSelected=0;panel.classList.add('open');selectRouteCard(0);saveCheckpoint('route');tone(440,.2,'triangle',.04,210);
}
function chooseRoute(index){
 if(G.mode!=='route'||index!==0&&index!==1)return;
 const opt=G.routeOffers[index];
 G.routeRisk=opt.risk;G.routeHistory.push({stage:G.stage+2,route:opt.name,risk:opt.risk,event:opt.event.id,eventName:opt.event.name,chain:opt.chain});
 G.activeEvent=opt.event;G.eventTriggered=false;G.eventChain=opt.chain;
 G.energy=Math.min(6,G.energy+(opt.risk?2:1));
 if(opt.risk){G.score+=1000*(G.stage+1);chargeDrive(18)}else G.pulses=Math.min(5,G.pulses+1);
 $('routePanel').classList.remove('open');G.mode='playing';
 nextStage();
 if(opt.chain){if(opt.risk)chargeDrive(20);else p.shield=Math.min(5,p.shield+1)}
 saveCheckpoint();updateHud();
 if(sound&&bgm){bgm.setEnabled(true);bgm.start()}
 syncOrientation();
 showToast((opt.chain?'ROUTE CHAIN · ':'')+opt.event.name+' / '+(opt.risk?'HIGH RISK':'SUPPLY'));
}
$('routeSafe').addEventListener('click',()=>chooseRoute(0));
$('routeRisk').addEventListener('click',()=>chooseRoute(1));
$('routeSafe').addEventListener('focus',()=>selectRouteCard(0));
$('routeRisk').addEventListener('focus',()=>selectRouteCard(1));
$('routeSafe').addEventListener('pointerenter',()=>selectRouteCard(0));
$('routeRisk').addEventListener('pointerenter',()=>selectRouteCard(1));


/* One announced mid-stage event per chosen route. Events never use draw RNG. */
function triggerRouteEvent(){
 const ev=G.activeEvent;
 if(!ev||G.eventTriggered||G.mode!=='playing'||G.boss||G.pendingWave||G.terrain||terrainApproaching()||terrainQueued()||G.stageTime<ev.when)return;
 const risk=G.routeRisk===1;
 if(risk&&G.enemies.length>routeProfile().maxEnemies-4)return;
 G.eventTriggered=true;G.eventCount++;
 if(ev.id==='salvage'||ev.id==='cache'){
  pickup(W+35,215,true);pickup(W+125,455,true);
 }else if(ev.id==='beacon'){
  p.shield=Math.min(5,p.shield+1);ring(p.x,p.y,95,'#6feaff',.7);
 }else if(ev.id==='charge'){
  chargeDrive(30);ring(p.x,p.y,120,'#a9eaff',.6);
 }else if(ev.id==='pursuit'){
  enemy('interceptor',W+100,200,{lockY:null,eventDrop:true});
  enemy('interceptor',W+225,455,{lockY:null});
 }else if(ev.id==='flare'){
  enemy('spinner',W+110,235,{eventDrop:true});
  enemy('spinner',W+245,455);
 }else if(ev.id==='freighter'){
  enemy('carrier',W+130,325,{eventDrop:true});
  enemy('dart',W+275,195);
 }else if(ev.id==='ambush'){
  enemy('tank',W+125,340,{eventDrop:true});
  enemy('interceptor',W+285,500,{lockY:null});
 }
 if(risk&&G.eventChain)enemy('dart',W+400,175);
 showToast('ROUTE EVENT · '+ev.name);
 tone(risk?220:590,.25,'triangle',.04,risk?-90:280);
}

function stageClear(){G.pendingWave=null;G.terrain=null;G.boss=null;G.bossDone=true;G.transitioning=true;G.transition=3.5;G.bullets=[];G.pulses=Math.min(5,G.pulses+1);p.hp=Math.min(3,p.hp+1);G.score+=5000*(G.stage+1);chargeDrive(22);showAnnounce('SECTOR CLEAR',NAMES[G.stage],'+ BONUS 5000 · ARMOR RECOVERED',3.1);tone(470,.55,'triangle',.055,450)}
function nextStage(){G.stage++;if(G.stage>=3){endGame(true);return}G.pendingWave=null;G.waveSerial=0;G.squadAttackCooldown=0;G.directorGrace=0;G.directorWaveCount=0;seedStage();resetTerrain();G.stageTime=0;G.spawn=2*routeProfile().spawnInterval;G.transitioning=false;G.bossDone=false;G.enemies=[];G.bullets=[];G.pickups=[];p.invul=2.5;showAnnounce('MISSION 0'+(G.stage+1),NAMES[G.stage],SUBS[G.stage],3.4);tone(400,.3,'sine',.04,350)}
function hitPlayer(damage=1){if(p.invul>0||G.mode!=='playing')return;if(p.shield>0){G.directorGrace=Math.max(G.directorGrace,4.5);G.spawn=Math.max(G.spawn,3.2);p.shield--;p.invul=.7;ring(p.x,p.y,62,'#5df4ff');tone(330,.19,'triangle',.07,-200);return}G.directorGrace=Math.max(G.directorGrace,8);G.spawn=Math.max(G.spawn,4);p.hp-=damage;p.invul=1.5;G.shake=13;G.combo=0;G.driveCharge=Math.max(0,G.driveCharge-20);emit(p.x,p.y,25,'#8acbff',220);tone(190,.36,'sawtooth',.085,-160);if(p.hp<=0){G.directorGrace=12;G.spawn=Math.max(G.spawn,5.2);G.lives--;explosion(p.x,p.y,57);if(G.lives<=0){endGame(false);return}p.hp=3;p.invul=3.2;p.x=165;p.y=H/2;p.targetX=p.x;p.targetY=p.y;G.levels[0]=Math.max(0,G.levels[0]-1);G.energy=0;showToast('SHIP LOST · '+G.lives+' REMAINING')}}
function playerFire(){const l=G.levels,shotCount=l[2]>0?2:1;const speeds=G.overdrive>0?1250:950;if(l[2]>0){for(let i=0;i<shotCount;i++){let y=p.y+(i?9:-9);G.shots.push({x:p.x+42,y,px:p.x+42,py:y,vx:1200,vy:0,dmg:23+l[2]*12,pierce:3+l[2]*3,kind:'laser',life:1.5})}}else{G.shots.push({x:p.x+37,y:p.y,px:p.x+37,py:p.y,vx:speeds,vy:0,dmg:G.overdrive>0?28:19,pierce:1,kind:'shot',life:1.7})}if(l[1]){const spread=l[1]===1?[.16,-.16]:l[1]===2?[.12,-.12,.29,-.29]:[.09,-.09,.21,-.21,.35,-.35];for(let a of spread)G.shots.push({x:p.x+30,y:p.y,px:p.x+30,py:p.y,vx:890*Math.cos(a),vy:890*Math.sin(a),dmg:12+l[1]*2,pierce:1,kind:'spread',life:1.6})}const drones=l[4];for(let i=0;i<drones;i++){const tr=G.trail[Math.min(G.trail.length-1,17+i*24)]||p;G.shots.push({x:tr.x+20,y:tr.y,px:tr.x+20,py:tr.y,vx:890,vy:0,dmg:13,pierce:1,kind:'drone',life:1.7})}emit(p.x+44,p.y,3,'#6eeeff',75);tone(l[2]?680:380,.045,'triangle',.009,l[2]?350:110)}
function missileFire(){if(!G.levels[3])return;const shots=G.levels[3];for(let i=0;i<shots;i++)G.shots.push({x:p.x-6,y:p.y+22,px:p.x-6,py:p.y+22,vx:300,vy:170+i*100,dmg:35,pierce:1,kind:'missile',life:3.8})}
function circleHit(ax,ay,ar,bx,by,br){return (ax-bx)*(ax-bx)+(ay-by)*(ay-by)<(ar+br)*(ar+br)}

/* Sector terrain: seed-determined obstacles, with a clearly announced passable lane.
   One safe lane is selected nearest the ship before the warning; the other
   two lanes are blocked. No random draws occur during terrain rendering. */
const TERRAIN_LANES=[165,337,509];
function resetTerrain(){
 const salt=mixSeed(G.runSeed,G.stage+71,G.routeRisk+91);
 G.terrainSchedule=[15+salt%5,40+(salt>>>7)%5];
 G.terrainIndex=0;G.terrain=null;
}
function terrainApproaching(){
 // Reserve six seconds before each terrain encounter for a clear, dodgeable lane.
 // Existing enemies retreat and stop shooting; bullets expire naturally.
 return !G.terrain&&G.terrainIndex<2&&G.stageTime>=G.terrainSchedule[G.terrainIndex]-6&&G.stageTime<=[62,68,74][G.stage]-11;
}
function terrainQueued(){return !G.terrain&&G.terrainIndex<2&&G.stageTime>=G.terrainSchedule[G.terrainIndex]&&G.stageTime<=[62,68,74][G.stage]-11}
function planTerrain(){
 if(G.terrain||G.terrainIndex>=2||G.boss||G.bossDone||G.transitioning||G.pendingWave||G.mode!=='playing')return false;
 if(G.stageTime<G.terrainSchedule[G.terrainIndex]||G.stageTime>[62,68,74][G.stage]-11)return false;
 // The hazard occupies two lanes: do not start it while stray enemies or shots
 // could enter the one remaining escape corridor. Wait until the field is clear.
 if(G.enemies.length!==0||G.bullets.length!==0||G.directorGrace>0)return false;
 const roll=mixSeed(G.runSeed,G.stage+113,G.terrainIndex*17+G.routeRisk*7);
 const safeLane=TERRAIN_LANES.reduce((best,y,i)=>Math.abs(p.y-y)<Math.abs(p.y-TERRAIN_LANES[best])?i:best,0);
 const type=roll%2?'wreck':'ion';
 G.terrain={type,phase:'warning',timer:2.1,x:W+135,speed:215+((roll>>>4)%4)*12,
  safeLane,blocks:TERRAIN_LANES.map((y,i)=>({y,hp:i===safeLane?0:type==='wreck'?160:9999})),seed:roll};
 G.terrainIndex++;G.spawn=Math.max(G.spawn,3);
 tone(420,.16,'triangle',.045,-190);
 return true;
}
function advanceTerrain(dt){
 const t=G.terrain;
 if(!t){planTerrain();return}
 if(t.phase==='warning'){
  t.timer-=dt;
  if(t.timer<=0){t.phase='active';t.timer=0;t.x=W+135}
  return;
 }
 t.x-=t.speed*dt;
 for(const block of t.blocks){
  if(block.hp<=0)continue;
  if(Math.abs(t.x-p.x)<76&&Math.abs(block.y-p.y)<77)hitPlayer(1);
 }
 if(t.x< -145||t.blocks.every(b=>b.hp<=0))G.terrain=null;
}
function drawTerrain(){
 const t=G.terrain;if(!t||G.mode==='title')return;
 c.save();
 if(t.phase==='warning'){
  const blink=.65+.24*Math.sin(G.time*11);
  c.globalAlpha=blink;
  c.font='bold 16px ui-monospace,monospace';c.textAlign='right';c.textBaseline='middle';
  c.fillStyle='#ffe0aa';c.fillText((t.type==='wreck'?'⚠ DEBRIS':'⚠ ION FIELD')+'  '+Math.max(0,t.timer).toFixed(1)+'s',W-35,79);
  for(let i=0;i<3;i++){
   const y=TERRAIN_LANES[i],safe=i===t.safeLane;
   c.fillStyle=safe?'#35d7be':'#ff845e';c.globalAlpha=safe?.13:.2;
   c.fillRect(W-270,y-69,252,138);
   c.globalAlpha=blink;c.strokeStyle=safe?'#74ffe1':'#ffbd7b';c.lineWidth=safe?2:3;
   c.setLineDash(safe?[10,8]:[14,7]);c.beginPath();c.moveTo(W-270,y);c.lineTo(W-18,y);c.stroke();c.setLineDash([]);
   c.fillStyle=safe?'#b8ffed':'#ffe1b9';c.font='bold 13px ui-monospace,monospace';
   c.fillText(safe?'SAFE':'DANGER',W-32,y-19);
  }
 }else{
  for(const block of t.blocks){
   if(block.hp<=0)continue;
   const x=t.x,y=block.y;
   c.save();c.translate(x,y);
   if(t.type==='wreck'){
    c.rotate(Math.sin(t.seed+block.y)*.23);
    c.shadowColor='#ff8c62';c.shadowBlur=18;
    poly([-64,-18,-43,-60,14,-66,60,-32,71,17,30,63,-30,61,-70,24],
      '#644c58','#ffba87',4);
    poly([-44,-15,-12,-43,28,-23,44,19,8,43,-32,22],
      '#35465b','#ffd6a5',2);
    line(-30,-6,30,20,'#f9d6a0',3);line(12,-40,-3,5,'#ffb77d',2);
   }else{
    const glow=.6+.25*Math.sin(G.time*12+block.y);
    c.globalAlpha=.9;c.shadowColor='#ff6599';c.shadowBlur=23;
    ellipse(0,0,61,61,'#40253b','#ff86a7',4);
    c.globalAlpha=glow;
    for(let j=0;j<5;j++){
     const a=j*TAU/5+G.time*1.5;
     line(Math.cos(a)*42,Math.sin(a)*42,Math.cos(a+1.2)*50,Math.sin(a+1.2)*50,'#ffd6e4',3);
    }
    glowCircle(0,0,16,'#ffd6ec',13);
   }
   c.restore();
  }
  c.globalAlpha=.7;c.strokeStyle='#79ffe2';c.lineWidth=2;c.setLineDash([9,10]);
  const sy=TERRAIN_LANES[t.safeLane];
  c.beginPath();c.moveTo(Math.max(0,t.x-180),sy);c.lineTo(Math.min(W,t.x+130),sy);c.stroke();c.setLineDash([]);
 }
 c.restore();
}

function update(dt){G.time+=dt;G.total+=dt;G.scroll+=(120+G.stage*27)*dt;G.stageTime+=dt;G.shake*=Math.pow(.025,dt);screenPulse=Math.max(0,screenPulse-dt*2.1);p.invul=Math.max(0,p.invul-dt);if(G.toastTime>0){G.toastTime-=dt;if(G.toastTime<=0)ui.toast.classList.remove('show')}if(G.announceTime>0){G.announceTime-=dt;if(G.announceTime<=0)ui.announce.classList.remove('show')}if(G.comboTime>0){G.comboTime-=dt;if(G.comboTime<=0)G.combo=0}if(G.overdrive>0)G.overdrive=Math.max(0,G.overdrive-dt);G.squadAttackCooldown=Math.max(0,G.squadAttackCooldown-dt);G.directorGrace=Math.max(0,G.directorGrace-dt);melody(dt);
let dx=(KEY['d']||KEY['arrowright']?1:0)-(KEY['a']||KEY['arrowleft']?1:0)+stickX,dy=(KEY['s']||KEY['arrowdown']?1:0)-(KEY['w']||KEY['arrowup']?1:0)+stickY;const speed=(335+G.levels[0]*85)*(KEY['shift']?.5:1);if(dx||dy){const norm=1/Math.max(1,Math.hypot(dx,dy));p.targetX=cl(p.targetX+dx*speed*dt*norm,62,W-135);p.targetY=cl(p.targetY+dy*speed*dt*norm,98,H-51)}else if(!dragging){p.targetX=p.x;p.targetY=p.y}let ox=p.x,oy=p.y;p.x+=(p.targetX-p.x)*Math.min(1,dt*29);p.y+=(p.targetY-p.y)*Math.min(1,dt*29);p.angle=cl((p.y-oy)*.022,-.22,.22);advanceTerrain(dt);
G.trail.unshift({x:p.x,y:p.y});if(G.trail.length>140)G.trail.length=140;
if(Math.random()>.1)G.particles.push({x:p.x-37,y:p.y+R(-7,7),vx:-R(165,330),vy:R(-30,30),life:R(.15,.4),maxLife:.4,size:R(2,5),color:Math.random()>.4?'#30e6ff':'#ffce77',glow:true});
G.fireTimer-=dt;if(G.fireTimer<=0){playerFire();G.fireTimer=(G.levels[2]>0?.22:.165)*(G.overdrive>0?.59:1)}
G.missileTimer-=dt;if(G.missileTimer<=0){missileFire();G.missileTimer=G.overdrive>0?.7:1.15}
if(!G.boss&&!G.bossDone&&!G.transitioning){triggerRouteEvent();const deadline=[62,68,74][G.stage];if(G.stageTime>=deadline)spawnBoss();else{G.spawn-=dt;if(G.spawn<=0){G.spawn=G.terrain||terrainApproaching()||terrainQueued()?1.25:(spawnWave()?nextWaveDelay():1.15)}if(Math.floor((G.stageTime-dt)/9)<Math.floor(G.stageTime/9))pickup(W-20,GR(155,525),true)}}
if(G.pendingWave){G.pendingWave.timer-=dt;if(G.pendingWave.timer<=0){const wave=G.pendingWave;G.pendingWave=null;wave.units.forEach((u,i)=>enemy(u.type,u.x,u.y,{...u.extra,squadId:wave.id,squadKind:wave.kind,squadSlot:i,squadSize:wave.units.length,aiHomeY:u.y,aiPhase:wave.phase,aiSafeY:wave.safeY,aiVolleyArmed:true}))}}
if(G.transitioning){G.transition-=dt;if(G.transition<=0){openRoute();return}}
for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];e.t+=dt;let vx=({scout:190,dart:305,tank:86,turret:76,spinner:157,carrier:100,mine:125,interceptor:98}[e.type]||140)*routeProfile().speed;e.x-=(vx+(terrainApproaching()?390:0))*dt;if(e.type==='interceptor'){if(e.lockY===null&&e.x<1050){e.lockY=cl(p.y,115,H-75);if(Number.isFinite(e.aiSafeY)&&e.x>540)e.lockY=placeOutsideLane(e.lockY,e.aiSafeY,110);e.t=0}if(e.lockY!==null){if(e.t<1){e.x+=vx*dt-43*dt;e.y+=(e.lockY-e.y)*Math.min(1,dt*1.15)}else{e.x-=465*dt;e.y+=(e.lockY-e.y)*Math.min(1,dt*5)}}}if(e.type!=='interceptor')moveEnemyAI(e,dt);
if(e.aiWarn>0){e.aiWarn-=dt;if(e.aiWarn<=0&&e.hp>0&&e.x<W-35&&e.x>100){fireEnemy(e,{x:e.aiAimX,y:e.aiAimY});e.fire=Math.max(e.fire,1.35)}}
if(e.aiWarn<=0&&!terrainApproaching())coordinateVolley(e);
e.fire-=dt;
if(e.aiWarn<=0&&!terrainApproaching()&&e.fire<0&&e.x<W-35&&e.x>80){fireEnemy(e);e.fire=Math.max(.7,(GR(e.type==='turret'?.95:1.5,e.type==='turret'?1.4:2.4)-G.stage*.11)*routeProfile().fireInterval*(G.directorGrace>0?1.22:1))}if(circleHit(p.x,p.y,18,e.x,e.y,e.type==='tank'||e.type==='carrier'?36:21))hitPlayer(1);if(e.x<-140){G.enemies.splice(i,1);continue}if(e.hp<=0){destroyEnemy(i);continue}}
let b=G.boss;if(b){
b.t+=dt;b.x+=(930-b.x)*Math.min(1,dt*1.25);b.y=H/2+Math.sin(b.t*1.15)*(G.stage===2?95:68);
if(!b.phase&&b.hp<=b.maxHp*.55){
 b.phase=1;b.fire=1.35;G.bullets=[];screenPulse=.34;
 ring(b.x-75,b.y,192,'#ff94b4',.6);
 emit(b.x-80,b.y,40,'#f7a4aa',240);
 showToast('BOSS · SECOND PHASE');
 for(let i=0;i<2+G.stage;i++)enemy('dart',W+100+i*70,200+i*80);
 tone(280,.55,'sawtooth',.08,-210);
}
if(b.charge>0){b.charge-=dt;if(b.charge<=0){b.beam=.62;screenPulse=.2;tone(105,.4,'sawtooth',.07,-70)}}
if(b.beam>0){b.beam-=dt;if(p.x<b.x-75&&Math.abs(p.y-b.beamY)<27)hitPlayer(1)}
b.fire-=dt;if(b.fire<=0)bossAttack(b);
if(circleHit(p.x,p.y,19,b.x-80,b.y,75))hitPlayer(1);
if(b.hp<=0){explosion(b.x-60,b.y,170);emit(b.x,b.y,180,'#ffe3a6',800);addScore(12000*(G.stage+1));stageClear()}
}
for(let i=G.shots.length-1;i>=0;i--){const s=G.shots[i];s.px=s.x;s.py=s.y;s.life-=dt;if(s.kind==='missile'){let target=G.boss||G.enemies.filter(e=>e.x>s.x-30).sort((a,b)=>len(a.x-s.x,a.y-s.y)-len(b.x-s.x,b.y-s.y))[0];if(target){const a=Math.atan2(target.y-s.y,target.x-s.x);s.vx+=(Math.cos(a)*550-s.vx)*Math.min(1,dt*2.9);s.vy+=(Math.sin(a)*550-s.vy)*Math.min(1,dt*2.9)}else{s.vx+=(650-s.vx)*dt;s.vy*=.96}if(Math.random()>.25)G.particles.push({x:s.x-7,y:s.y,vx:-90,vy:R(-25,25),life:.3,maxLife:.3,size:3,color:'#ffbd6e',glow:true})}s.x+=s.vx*dt;s.y+=s.vy*dt;
let gone=false;for(let j=G.enemies.length-1;j>=0;j--){const e=G.enemies[j],rad=e.type==='tank'||e.type==='carrier'?39:23;if(circleHit(s.x,s.y,s.kind==='laser'?8:5,e.x,e.y,rad)){e.hp-=s.dmg;emit(s.x,s.y,3,'#8edfff',72);s.pierce--;if(e.hp<=0)destroyEnemy(j);if(s.pierce<=0){gone=true;break}}}
if(!gone&&G.terrain?.phase==='active'&&G.terrain.type==='wreck')for(const block of G.terrain.blocks){if(block.hp>0&&circleHit(s.x,s.y,s.kind==='laser'?8:5,G.terrain.x,block.y,58)){block.hp-=s.dmg;emit(s.x,s.y,3,'#ffca81',60);s.pierce--;if(block.hp<=0){explosion(G.terrain.x,block.y,42);addScore(250)}if(s.pierce<=0){gone=true;break}}}
if(!gone&&G.boss&&circleHit(s.x,s.y,7,G.boss.x-53,G.boss.y,G.stage===2?110:100)){G.boss.hp-=s.dmg;emit(s.x,s.y,ri(2,4),'#ffca82',95);s.pierce--;if(s.pierce<=0)gone=true}
if(gone||s.x>W+160||s.y<-80||s.y>H+100||s.life<=0)G.shots.splice(i,1)}
for(let i=G.bullets.length-1;i>=0;i--){const a=G.bullets[i];a.px=a.x;a.py=a.y;a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;if(circleHit(a.x,a.y,a.size,p.x,p.y,16)){hitPlayer(a.damage);ring(a.x,a.y,27,'#ffc391',.3);G.bullets.splice(i,1);continue}if(!a.grazed&&p.invul<=0&&circleHit(a.x,a.y,a.size,p.x,p.y,53)){a.grazed=true;G.grazes++;G.score+=60;chargeDrive(5);emit(a.x,a.y,2,'#f8e9a5',40);if(G.grazes%10===0)showToast('GRAZE BONUS × '+G.grazes)}if(a.x<-35||a.x>W+35||a.y<-35||a.y>H+35||a.life<=0)G.bullets.splice(i,1)}
for(let i=G.pickups.length-1;i>=0;i--){const q=G.pickups[i];q.t+=dt;q.x+=q.vx*dt;q.y+=Math.sin(q.t*2+q.phase)*17*dt;if(len(q.x-p.x,q.y-p.y)<routeProfile().magnet){const a=Math.atan2(p.y-q.y,p.x-q.x);q.x+=Math.cos(a)*250*dt;q.y+=Math.sin(a)*250*dt}if(circleHit(q.x,q.y,19,p.x,p.y,22)){if(q.type==='pulse'){G.pulses=Math.min(5,G.pulses+1);showToast('PULSE +1')}else{G.energy=Math.min(6,G.energy+1);G.selected=Math.max(0,Math.min(5,G.energy-1));showToast('POWER CAPSULE +1')}emit(q.x,q.y,15,'#fffba6',155);tone(510,.15,'triangle',.055,380);G.pickups.splice(i,1)}else if(q.x<-40)G.pickups.splice(i,1)}
for(let i=G.particles.length-1;i>=0;i--){const q=G.particles[i];q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.12,dt);q.vy*=Math.pow(.16,dt);if(q.life<=0)G.particles.splice(i,1)}if(G.particles.length>620)G.particles.splice(0,G.particles.length-620);
for(let i=G.rings.length-1;i>=0;i--){const r=G.rings[i];r.t+=dt;r.r=r.max*(r.t/r.life);if(r.t>=r.life)G.rings.splice(i,1)}
G.uiTime-=dt;if(G.uiTime<=0){updateHud();G.uiTime=.11}}
function destroyEnemy(i){const e=G.enemies[i];if(!e)return;addScore(e.score);G.killCount++;chargeDrive(e.type==='tank'||e.type==='carrier'?13:6);explosion(e.x,e.y,e.type==='tank'||e.type==='carrier'?46:21);if(e.eventDrop)pickup(e.x,e.y,true);else if(e.type==='carrier'||gameRandom()<routeProfile().pickupRate)pickup(e.x,e.y,gameRandom()>.08);G.enemies.splice(i,1)}
function poly(points,fill,stroke,width=1){c.beginPath();c.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function glowCircle(x,y,r,col,blur=16){c.save();c.shadowColor=col;c.shadowBlur=blur;c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function ellipse(x,y,rx,ry,fill,stroke,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke()}}
function line(x,y,x2,y2,color,w=1){c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()}
function drawBackground(dt){const stage=G.stage;let grad=c.createLinearGradient(0,0,0,H);if(stage===0){grad.addColorStop(0,'#070e27');grad.addColorStop(.53,'#102b48');grad.addColorStop(1,'#080e23')}else if(stage===1){grad.addColorStop(0,G.routeRisk?'#301523':'#0b2638');grad.addColorStop(.5,G.routeRisk?'#4c3040':'#1a4b60');grad.addColorStop(1,G.routeRisk?'#1c0f20':'#081a2d')}else{grad.addColorStop(0,G.routeRisk?'#3b101e':'#190d32');grad.addColorStop(.5,G.routeRisk?'#4a2735':'#12475a');grad.addColorStop(1,G.routeRisk?'#220f25':'#081c33')}c.fillStyle=grad;c.fillRect(0,0,W,H);
const neb=[[320,270,350,'#1b688a'],[850,385,260,'#524283'],[1150,170,370,'#145e83']];for(let i=0;i<3;i++){const ar=neb[i],x=((ar[0]-G.scroll*(.08+i*.05))%(W+750)+W+750)%(W+750)-250;const g=c.createRadialGradient(x,ar[1],10,x,ar[1],ar[2]);let color=stage===0?ar[3]:stage===1?['#4c375f','#784d3c','#1c5673'][i]:['#943679','#1e8b9b','#723681'][i];g.addColorStop(0,color+'99');g.addColorStop(.45,color+'44');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-ar[2],ar[1]-ar[2],ar[2]*2,ar[2]*2)}
for(const s of G.stars){let x=((s.x-G.scroll*s.z*.22)%(W+20)+W+20)%(W+20),y=s.y,a=.38+Math.sin(G.time*.8+s.tw)*.22+s.z*.11;c.globalAlpha=cl(a,0,1);c.fillStyle=s.z>1.9?'#d8faff':'#8babc6';c.fillRect(x,y,s.size*s.z*.75,s.size*s.z*.75);if(s.z>1.6)line(x+1,y,x+2+G.scroll%7*s.z,y,'#9cd9f0',.5)}c.globalAlpha=1;
if(stage===0){for(let i=0;i<13;i++){const x=((i*232-G.scroll*.6)%(W+300)+W+300)%(W+300)-120,y=100+((i*181)%520),r=14+(i*29)%65;c.save();c.translate(x,y);c.rotate(i*1.2+G.time*.03);poly([-r,0,-r*.75,-r*.65,r*.22,-r*.9,r*.9,-r*.28,r*.72,r*.7,-r*.2,r],i%2?'#172c42':'#1e394f','#315169',1.2);poly([-r*.35,-r*.2,-r*.1,-r*.46,r*.32,-r*.29,r*.4,-r*.08,r*.15,r*.13],'#35546a55');c.restore()}}
if(stage===1){for(let i=0;i<10;i++){const x=((i*235-G.scroll*.74)%(W+320)+W+320)%(W+320)-160;for(let side of [-1,1]){c.save();c.translate(x,side===-1?0:H);c.scale(1,side===-1?1:-1);poly([-130,0,136,0,108,40,95,88,-100,87], '#243045','#607286',2);c.fillStyle='#111c2b';c.fillRect(-102,24,180,37);for(let j=0;j<5;j++){c.fillStyle=(i+j)%2?'#6c798c':'#bf7d5c';c.fillRect(-92+j*35,29,13,6)}line(-106,89,106,89,'#d98959',2);c.restore()}}}
if(stage===2){for(let i=0;i<9;i++){let x=((i*196-G.scroll*.65)%(W+320)+W+320)%(W+320)-140;for(let side of [-1,1]){c.save();c.translate(x,side===-1?0:H);c.scale(1,side===-1?1:-1);c.fillStyle='#361e43';c.beginPath();c.moveTo(-120,0);c.lineTo(120,0);c.bezierCurveTo(80,110,30,78,-25,115);c.bezierCurveTo(-55,72,-100,80,-120,0);c.fill();c.strokeStyle='#a64d8277';c.lineWidth=4;c.stroke();for(let j=0;j<5;j++)glowCircle(-82+j*43,27+Math.sin(j*2+i)*23,4,'#dd60c4',10);c.restore()}}}
c.globalAlpha=.13;c.fillStyle='#9dc8e3';for(let y=0;y<H;y+=5)c.fillRect(0,y,W,.55);c.globalAlpha=1;
const outer=c.createLinearGradient(0,0,W,0);outer.addColorStop(0,'#00000033');outer.addColorStop(.5,'#00000000');outer.addColorStop(1,'#00000033');c.fillStyle=outer;c.fillRect(0,0,W,H)}
function drawShip(x,y,angle=0,invul=0){if(invul>0&&Math.sin(G.time*20)>0.55)return;c.save();c.translate(x,y);c.rotate(angle);const flame=25+Math.sin(G.time*34)*14;
const thrust=c.createLinearGradient(-flame-40,0,-22,0);thrust.addColorStop(0,'#00a5ff00');thrust.addColorStop(.75,'#56cfffad');thrust.addColorStop(1,'#c9faff');poly([-36,-7,-36-flame,0,-36,7],thrust);glowCircle(-31,0,7,'#5ef5ff',17);
poly([-33,-17,-2,-22,32,-7,50,0,32,7,-2,22,-33,17,-22,0],'#93c9e5','#d9faff',2.2);
poly([-12,-13,6,-30,21,-31,13,-8],'#2d9cc9','#72efff',1.5);poly([-12,13,6,30,21,31,13,8],'#2d9cc9','#72efff',1.5);
poly([-25,-7,8,-9,34,0,8,9,-25,7],'#173c64','#79e5fd',1.5);
poly([-5,-8,21,-5,27,0,21,5,-5,8],'#91ebff','#eafaff',1.2);
poly([28,-8,50,0,28,8,33,0],'#e6ffff');glowCircle(5,0,4,'#43dfff',12);
line(-25,-18,-7,-18,'#dafaff',1);line(-25,18,-7,18,'#dafaff',1);
if(p.shield>0){c.save();c.globalAlpha=.55+.14*Math.sin(G.time*8);c.strokeStyle='#70f9ff';c.lineWidth=2.5;c.shadowColor='#4aeaff';c.shadowBlur=22;c.beginPath();c.arc(0,0,43,0,TAU);c.stroke();for(let i=0;i<6;i++){const a=i*TAU/6+G.time*.4;line(Math.cos(a)*41,Math.sin(a)*41,Math.cos(a+.18)*43,Math.sin(a+.18)*43,'#c5fdff',2)}c.restore()}
c.restore()}
function drawDrone(x,y,i){c.save();c.translate(x,y);c.rotate(Math.sin(G.time*2+i)*.08);poly([-19,0,-4,-13,14,-7,24,0,14,7,-4,13],'#2e709e','#8bdeff',1.6);poly([-11,-5,12,0,-11,5],'#b6efff');glowCircle(10,0,3,'#3cebff',10);glowCircle(-13,0,3,'#ffa85b',8);c.restore()}
function drawEnemy(e){const {x,y,type,t}=e;c.save();c.translate(x,y);if(type==='interceptor'){c.rotate(Math.sin(t*7)*.06);poly([-40,-13,-8,-24,41,0,-8,24,-40,13,-22,0],'#5e4553','#ffb87d',2);poly([-10,-17,14,-29,14,-7],'#a85e65','#ffe1a9',1.5);poly([-10,17,14,29,14,7],'#a85e65','#ffe1a9',1.5);poly([-25,-7,35,0,-25,7],'#2d4058','#ffe4be',1.3);glowCircle(-26,0,6,'#ff9a51',13)}else if(type==='scout'||type==='dart'){c.rotate(Math.sin(t*4+e.phase)*.14);const d=type==='dart'?1.3:1;poly([-30*d,0,-2*d,-15*d,19*d,-18*d,7*d,0,19*d,18*d,-2*d,15*d],'#6c334e','#ff7083',2);poly([-17*d,-3*d,12*d,-5*d,33*d,0,12*d,5*d,-17*d,3*d],'#ac5570','#f7b4be',1);glowCircle(-17*d,0,5,'#ffb26b',12)}else if(type==='tank'||type==='carrier'){const r=type==='tank'?1:1.25;c.scale(r,r);poly([-37,-23,-15,-34,36,-28,48,0,36,28,-15,34,-37,23,-24,0],'#573846','#e29573',2);poly([-37,-16,25,-23,32,0,25,23,-37,16],'#28374d','#a9acbc',1.5);poly([-12,-19,16,-18,29,0,16,18,-12,19],'#905868','#ffb483',1.4);glowCircle(-4,0,12,'#ff9377',18);line(-12,-34,30,-27,'#c2d2e4',3);line(-12,34,30,27,'#c2d2e4',3)}else if(type==='turret'){poly([-28,-26,20,-22,31,0,20,22,-28,26],'#544466','#ff9a8c',2);ellipse(0,0,19,19,'#263c57','#d6abb4',2);poly([-35,-8,-49,-6,-49,6,-35,8],'#fd7685');glowCircle(0,0,7,'#ff7093',17)}else if(type==='spinner'){c.rotate(t*2);for(let k=0;k<4;k++){c.save();c.rotate(k*TAU/4);poly([-8,-8,7,-9,29,-27,21,8],'#9a4776','#ff8ba0',1.2);c.restore()}glowCircle(0,0,12,'#ffc17b',17)}else{c.rotate(t*.5);poly([-19,-16,2,-28,27,-8,23,20,-5,27,-28,10],'#594061','#ff957f',1.4);glowCircle(0,0,5,'#ff6f83',11)}c.restore()}
function drawBoss(b){const s=G.stage;c.save();c.translate(b.x,b.y);const q=Math.sin(b.t*3)*4;c.shadowColor=s===2?'#d03bc0':'#ff7364';c.shadowBlur=18;
if(s===0){poly([-157,-36,-118,-91,-5,-114,122,-69,151,0,122,69,-5,114,-118,91,-157,36],'#35455c','#afc5d4',3);poly([-157,-18,-80,-53,70,-47,131,0,70,47,-80,53,-157,18],'#21314b','#e5ac81',2);for(let a of [-1,1]){c.save();c.scale(1,a);poly([-80,42,-10,117,65,98,94,43],'#485673','#c5d9e6',2);poly([-85,59,29,76,41,56],'#8997b3');for(let j=0;j<3;j++)glowCircle(-44+j*38,82,5,'#ffab74',12);c.restore()}glowCircle(20,0,30+q*.3,'#ff9c70',30);ellipse(21,0,22,22,'#ffe4b0','#fffae0',2);poly([-174,-32,-124,-19,-126,18,-174,34],'#be7f72','#ffe0b0',2)}
else if(s===1){poly([-150,-68,-80,-142,64,-120,149,-42,165,55,64,120,-80,142,-150,68],'#45445c','#aaafb9',4);for(let i=0;i<9;i++){c.save();c.rotate(i*TAU/9+b.t*.07);poly([-11,-130,18,-130,38,-91,21,-68],'#6c556e','#c18c94',2);c.restore()}ellipse(-20,0,101,101,'#18283f','#a1a9c3',5);c.save();c.rotate(-b.t*.4);for(let j=0;j<8;j++){c.rotate(TAU/8);poly([-13,-94,13,-94,23,-60,-17,-60],'#b27e8d','#ffd2bd',1)}c.restore();glowCircle(-20,0,43,'#fd777f',32);ellipse(-20,0,32,32,'#ffe4aa','#fff4d0',3);for(let i of [-1,1]){glowCircle(-110,i*57,10,'#ffa36d',22)}}
else{for(let i=0;i<9;i++){const ang=i*TAU/9+b.t*.1,rx=Math.cos(ang)*115,ry=Math.sin(ang)*121;line(rx*.36,ry*.36,rx+Math.sin(b.t*2+i)*16,ry+Math.cos(b.t*2+i)*21,'#9b4e9c',20);glowCircle(rx+Math.sin(b.t*2+i)*16,ry+Math.cos(b.t*2+i)*21,12,'#e165b6',13)}ellipse(0,0,104,96,'#49305a','#e597c7',5);ellipse(12,0,82,70,'#281f48','#8ba5e5',4);for(let i=0;i<8;i++){const a=i*TAU/8+b.t*.5;glowCircle(Math.cos(a)*67,Math.sin(a)*58,7,'#f07fc5',8)}glowCircle(-34,0,42,'#d979fb',27);ellipse(-35,0,30,30,'#ffdbef','#ffffff',2);poly([-163,-32,-110,-55,-68,-27,-60,0,-68,27,-110,55,-163,32],'#794c79','#ff9dd6',3)}
c.shadowBlur=0;c.restore()}

function drawBossBeam(b){
 if(!b||b.charge<=0&&b.beam<=0)return;
 const y=b.beamY,endpoint=b.x-130,active=b.beam>0;
 c.save();
 if(active){
  c.shadowColor='#ff517f';c.shadowBlur=31;
  line(0,y,endpoint,y,'#ff426d',52);
  line(0,y,endpoint,y,'#ffc4cb',18);
  line(0,y,endpoint,y,'#ffffff',5);
  for(let i=0;i<16;i++){const x=(i*89+G.time*150)%Math.max(1,endpoint);glowCircle(x,y+Math.sin(G.time*12+i)*15,2,'#ffebef',9)}
 }else{
  c.globalAlpha=.5+.33*Math.sin(G.time*22);
  c.setLineDash([15,13]);
  line(0,y,endpoint,y,'#ff557d',4);
  c.setLineDash([]);
  c.fillStyle='#ffdce9';c.font='bold 16px ui-monospace,monospace';c.textAlign='left';
  c.fillText('⚠  BEAM INCOMING',20,y-15);
 }
 c.restore();
}


function drawSquadWarning(){
 const leader=G.enemies.find(e=>e.aiWarn>0&&e.aiWarningLead)||G.enemies.find(e=>e.aiWarn>0);
 if(!leader)return;
 const tx=leader.aiAimX,ty=leader.aiAimY;
 c.save();c.globalAlpha=.55+.3*Math.sin(G.time*16);
 c.strokeStyle='#ffb05e';c.lineWidth=2;c.setLineDash([9,8]);
 c.beginPath();c.moveTo(leader.x-22,leader.y);c.lineTo(tx,ty);c.stroke();c.setLineDash([]);
 c.beginPath();c.arc(tx,ty,20,0,TAU);c.stroke();
 line(tx-28,ty,tx-12,ty,'#ffda95',2);line(tx+12,ty,tx+28,ty,'#ffda95',2);
 line(tx,ty-28,tx,ty-12,'#ffda95',2);line(tx,ty+12,tx,ty+28,'#ffda95',2);
 for(const e of G.enemies)if(e.aiWarn>0&&e.squadId===leader.squadId){
  c.beginPath();c.arc(e.x,e.y,Math.max(24,waveRadius(e.type)+5),0,TAU);c.stroke();
 }
 c.restore();
}

function drawWaveWarning(){
const wave=G.pendingWave;if(!wave||G.mode!=='playing'&&G.mode!=='paused')return;
c.save();c.globalAlpha=.66+.23*Math.sin(G.time*12);c.textAlign='right';c.textBaseline='middle';c.fillStyle='#ffdb9d';c.font='bold 13px ui-monospace,monospace';
c.fillText('⚠ '+wave.label+' / '+Math.max(0,wave.timer).toFixed(1)+'s',W-38,90);
if(Number.isFinite(wave.safeY)){
 const y=wave.safeY;
 c.globalAlpha=.18;c.fillStyle='#59d8d2';c.fillRect(W-155,y-54,143,108);
 c.globalAlpha=.8;c.strokeStyle='#65f2db';c.lineWidth=1.5;c.setLineDash([6,7]);
 c.beginPath();c.moveTo(W-155,y);c.lineTo(W-18,y);c.stroke();c.setLineDash([]);
 c.fillStyle='#b5fff0';c.font='bold 11px ui-monospace,monospace';c.fillText('SAFE',W-22,y-17);
 c.globalAlpha=.66+.23*Math.sin(G.time*12);
}
const shown=[];for(const u of wave.units){const y=cl(u.y,108,H-70);if(shown.some(v=>Math.abs(v-y)<42))continue;shown.push(y);if(shown.length>5)break;
c.strokeStyle='#ffb96e';c.lineWidth=2;c.setLineDash([9,7]);c.beginPath();c.moveTo(W-118,y);c.lineTo(W-20,y);c.stroke();c.setLineDash([]);
c.beginPath();c.arc(W-37,y,12,0,TAU);c.stroke();c.beginPath();c.moveTo(W-50,y-5);c.lineTo(W-40,y);c.lineTo(W-50,y+5);c.stroke()}
c.restore()
}
function drawTacticalMeter(){if(G.mode!=='playing'&&G.mode!=='paused')return;const x=236,y=H-36,w=166,h=7,active=G.overdrive>0;
c.save();c.globalAlpha=.95;c.fillStyle='#071422ba';c.fillRect(x-12,y-29,w+25,56);c.font='bold 12px ui-monospace,monospace';c.textAlign='left';c.textBaseline='middle';c.fillStyle=active?'#ffe99f':'#82d6ea';c.fillText(active?'OVERDRIVE '+G.overdrive.toFixed(1)+'s':'OVERDRIVE CHARGE',x,y-10);c.fillStyle='#24425b';c.fillRect(x,y,w,h);c.fillStyle=active?'#ffdb7b':'#4cdded';c.fillRect(x,y,w*(active?G.overdrive/8:G.driveCharge/100),h);c.strokeStyle=active?'#ffe19a':'#5ccdeb';c.lineWidth=1;c.strokeRect(x,y,w,h);c.restore()}
function drawScene(){c.save();if(G.shake>.2)c.translate(R(-G.shake,G.shake),R(-G.shake,G.shake));drawBackground();if(G.mode==='title'){drawShip(274,344,0,0);for(let i=0;i<4;i++){const e={x:750+i*122,y:210+i*90,type:i%2?'scout':'spinner',t:G.time*.7,phase:i};drawEnemy(e)}}
else{for(const q of G.pickups){c.save();c.translate(q.x,q.y);c.rotate(q.t*1.5);c.shadowColor=q.type==='pulse'?'#ffcb60':'#7dfff8';c.shadowBlur=22;poly([0,-18,18,0,0,18,-18,0],q.type==='pulse'?'#9e7129':'#157881',q.type==='pulse'?'#fff3a0':'#d4fff7',2);c.font='bold 18px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f5ffff';c.rotate(-q.t*1.5);c.fillText(q.type==='pulse'?'✹':'P',0,1);c.restore()}
drawTerrain();drawWaveWarning();drawSquadWarning();
for(const e of G.enemies){if(e.type==='interceptor'&&e.lockY!==null&&e.t<1){c.save();c.globalAlpha=.6;c.setLineDash([18,12]);line(0,e.lockY,e.x-36,e.lockY,'#ffb57b',1.8);c.setLineDash([]);c.restore()}drawEnemy(e);if(e.eventDrop){c.save();c.globalAlpha=.72;c.strokeStyle='#ffec99';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,43+Math.sin(G.time*5)*3,0,TAU);c.stroke();c.restore()}}if(G.boss){drawBoss(G.boss);drawBossBeam(G.boss)}
for(const s of G.shots){c.save();c.shadowBlur=15;c.shadowColor=s.kind==='missile'?'#ffae57':'#72edff';c.lineCap='round';if(s.kind==='laser'){line(s.x-95,s.y,s.x+24,s.y,'#178fff',14);line(s.x-105,s.y,s.x+24,s.y,'#83faff',6);line(s.x-105,s.y,s.x+28,s.y,'#fff',2)}else if(s.kind==='missile'){poly([s.x+12,s.y,s.x-13,s.y-7,s.x-8,s.y,s.x-13,s.y+7],'#ffbc81','#fff1b4',1);line(s.x-28,s.y+R(-2,2),s.x-10,s.y,'#ff954d',5)}else{line(s.x-20,s.y-s.vy*.012,s.x+12,s.y+s.vy*.012,'#55d6ff',s.kind==='shot'?6:3.5);line(s.x-16,s.y,s.x+14,s.y,'#d4fbff',2)}c.restore()}
for(const a of G.bullets){c.save();c.shadowColor=a.color;c.shadowBlur=15;line(a.x-a.vx*.045,a.y-a.vy*.045,a.x,a.y,a.color,Math.max(2,a.size*1.3));glowCircle(a.x,a.y,Math.max(2,a.size*.62),'#fff0d9',6);c.restore()}
for(let i=G.levels[4]-1;i>=0;i--){let tr=G.trail[Math.min(G.trail.length-1,17+i*24)];if(tr)drawDrone(tr.x-9,tr.y,i)}drawShip(p.x,p.y,p.angle,p.invul);
for(const q of G.particles){c.save();c.globalAlpha=cl(q.life/q.maxLife,0,1);if(q.glow){c.shadowColor=q.color;c.shadowBlur=12}c.fillStyle=q.color;c.fillRect(q.x-q.size*.5,q.y-q.size*.5,q.size,q.size);c.restore()}
for(const r of G.rings){c.save();c.globalAlpha=Math.max(0,1-r.t/r.life);c.strokeStyle=r.color;c.lineWidth=Math.max(1,8*(1-r.t/r.life));c.shadowColor=r.color;c.shadowBlur=20;c.beginPath();c.arc(r.x,r.y,r.r,0,TAU);c.stroke();c.restore()}}
drawTacticalMeter();
if(screenPulse>0){c.fillStyle='rgba(197,244,255,'+(screenPulse*.25)+')';c.fillRect(0,0,W,H)}
c.restore()}
function render(ms){const dt=Math.min((ms-last)/1000||0,.034);last=ms;if(G.mode==='playing')update(dt);else{G.time+=dt;G.scroll+=30*dt}drawScene();requestAnimationFrame(render)}
const dpr=window.matchMedia?.('(pointer: coarse)').matches?1:Math.min(1.5,window.devicePixelRatio||1);C.width=W*dpr;C.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);showOverlay('title');syncOrientation();updateHud();requestAnimationFrame(render);
})();
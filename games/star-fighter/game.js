/* STAR FIGHTER v1.0 — original canvas arcade shooter. No external dependencies. */
(()=>{'use strict';
const W=1200,H=675,TAU=Math.PI*2;
const C=document.getElementById('game'),c=C.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
const ui={overlay:$('overlay'),start:$('startBtn'),pause:$('pauseBtn'),sound:$('soundBtn'),score:$('score'),best:$('best'),mult:$('multiplier'),stage:$('stageLabel'),area:$('areaName'),progress:$('progressBar'),hp:$('hpRow'),lives:$('lives'),bombs:$('bombs'),boss:$('bossHud'),bossName:$('bossName'),bossBar:$('bossBar'),announce:$('announce'),small:$('announceSmall'),main:$('announceMain'),desc:$('announceDesc'),toast:$('toast'),meter:$('meterInfo'),upgrades:[...document.querySelectorAll('.upgrade')],equip:$('equipBtn'),pulse:$('pulseBtn')};
const NAMES=['ORBITAL FIELD','IRON CORRIDOR','DEEP NEBULA'],SUBS=['外縁軌道を突破せよ','機械要塞を突破せよ','星雲の深部を制圧せよ'],BOSSES=['BATTLE CRUISER','FORTRESS CORE','ABYSS TITAN'];
const ROUTE_OPTIONS=[[{name:'漂流船の回廊',desc:'敵が少なく物資を回収しやすい',bonus:'カプセル +1 / パルス +1',risk:0},{name:'プラズマ急流',desc:'高速の編隊が出現し敵が増える',bonus:'カプセル +2 / 撃破得点 +25%',risk:1}],[{name:'星雲の静域',desc:'敵の攻勢が穏やかになる',bonus:'カプセル +1 / パルス +1',risk:0},{name:'紅色の裂け目',desc:'精鋭編隊と高密度の敵が出現',bonus:'カプセル +2 / 撃破得点 +25%',risk:1}]];

/* Stage 1 stays neutral. Each branch changes encounter pressure, drops and tactics. */
const ROUTE_TUNING={
 normal:{spawnInterval:1,enemyHp:1,fireInterval:1,pickupRate:.24,magnet:120,bossHp:1,maxEnemies:16,score:1,speed:1},
 safe:{spawnInterval:1.16,enemyHp:.95,fireInterval:1.08,pickupRate:.35,magnet:155,bossHp:.94,maxEnemies:10,score:1,speed:.98},
 storm:{spawnInterval:.96,enemyHp:1.08,fireInterval:.96,pickupRate:.22,magnet:120,bossHp:1.12,maxEnemies:14,score:1.25,speed:1.04}
};
function routeProfile(){return G.stage===0?ROUTE_TUNING.normal:(G.routeRisk?ROUTE_TUNING.storm:ROUTE_TUNING.safe)}
const MAX=[2,3,2,2,3,3],PNAMES=['BOOST','SPREAD','LASER','MISSILE','OPTION','SHIELD'];
const R=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(R(a,b+1)),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),len=(x,y)=>Math.hypot(x,y);
const KEY={};let audio=null,bgm=null,sound=true,last=0,screenPulse=0,stickX=0,stickY=0,stickPointer=null,pausedByRotation=false;
const G={mode:'title',time:0,total:0,stage:0,stageTime:0,scroll:0,spawn:0,score:0,best:0,combo:0,comboTime:0,lives:3,pulses:2,energy:0,selected:0,levels:[0,0,0,0,0,0],boss:null,bossDone:false,transition:0,transitioning:false,shots:[],enemies:[],bullets:[],pickups:[],particles:[],rings:[],stars:[],player:null,trail:[],shake:0,announceTime:0,toastTime:0,fireTimer:0,missileTimer:0,musicTime:0,beat:0,uiTime:0,firstInput:false,driveCharge:0,overdrive:0,grazes:0,maxCombo:0,killCount:0,routeRisk:0,routeHistory:[],routeSelected:0,runSeed:0};
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
function showOverlay(kind){ui.overlay.classList.remove('hidden');const inner=ui.overlay.querySelector('.overlay-inner');const eyebrow=inner.querySelector('.eyebrow'),title=inner.querySelector('.title-mark'),subtitle=inner.querySelector('.subtitle'),intro=inner.querySelector('.intro');if(kind==='pause'){eyebrow.textContent='MISSION INTERRUPTED';title.innerHTML='<span>PAUSE</span><strong>MODE</strong>';subtitle.textContent='一時停止中';intro.innerHTML='準備ができたら戦闘に戻ろう。';ui.start.innerHTML='RESUME <span>▶</span>'}else if(kind==='win'){eyebrow.textContent='ALL SECTORS CLEAR';title.innerHTML='<span>MISSION</span><strong>CLEAR</strong>';subtitle.textContent='全3ステージ突破';intro.innerHTML='SCORE '+G.score.toLocaleString()+' · MAX CHAIN '+G.maxCombo+'<br>GRAZE '+G.grazes+' · 宇宙の平和を守り抜いた！';ui.start.innerHTML='PLAY AGAIN <span>▶</span>'}else if(kind==='over'){eyebrow.textContent='SIGNAL LOST';title.innerHTML='<span>GAME</span><strong>OVER</strong>';subtitle.textContent='任務失敗';intro.innerHTML='SCORE '+G.score.toLocaleString()+' · MAX CHAIN '+G.maxCombo+'<br>GRAZE '+G.grazes+' · 再出撃して記録を更新しよう。';ui.start.innerHTML='RETRY MISSION <span>▶</span>'}else{eyebrow.textContent='NEW ARCADE EXPERIENCE / 2026';title.innerHTML='<span>STAR</span><strong>FIGHTER</strong>';subtitle.textContent='横スクロール・シューティング';intro.innerHTML='高速戦闘。装備進化。巨大戦艦との決戦。<br>シンプル操作で、撃ち抜く快感を。';ui.start.innerHTML='MISSION START <span>▶</span>'}}
function startGame(){G.mode='playing';stickX=stickY=0;resetStick();G.time=0;G.total=0;G.stage=0;G.stageTime=0;G.scroll=0;G.spawn=1.4;G.score=0;G.combo=0;G.comboTime=0;G.lives=3;G.pulses=2;G.energy=0;G.selected=0;G.levels=[0,0,0,0,0,0];G.shots=[];G.enemies=[];G.bullets=[];G.pickups=[];G.particles=[];G.rings=[];G.boss=null;G.bossDone=false;G.transition=0;G.transitioning=false;G.shake=0;G.fireTimer=0;G.missileTimer=0;G.beat=0;G.musicTime=0;G.firstInput=false;G.routeRisk=0;G.routeSelected=0;G.routeHistory=[];G.runSeed=Math.floor(Math.random()*0x7fffffff);$('routePanel').classList.remove('open');G.driveCharge=0;G.overdrive=0;G.grazes=0;G.maxCombo=0;G.killCount=0;G.trail=[];G.player={x:215,y:337,targetX:215,targetY:337,angle:0,hp:3,invul:2,shield:0,alive:true};p=G.player;for(let i=0;i<120;i++)G.trail.push({x:p.x-i*3.5,y:p.y});showAnnounce('MISSION 01',NAMES[0],SUBS[0],3.5);hideOverlay();beginAudio();tone(440,.25,'sawtooth',.05,620);updateHud()}
function pause(){if(G.mode==='playing'){G.mode='paused';showOverlay('pause');bgm?.stop()}else if(G.mode==='paused'){G.mode='playing';hideOverlay();last=performance.now();if(sound&&bgm){bgm.setEnabled(true);bgm.start()}}}
function endGame(victory=false){bgm?.stop();G.mode=victory?'win':'over';if(G.score>G.best){G.best=G.score;try{localStorage.setItem('star_fighter_best',String(G.best))}catch(e){}}tone(victory?520:140,.55,'sawtooth',.08,victory?380:-110);showOverlay(G.mode);updateHud()}
ui.start.addEventListener('click',()=>{if(G.mode==='paused')pause();else if(G.mode!=='playing')startGame()});
ui.pause.addEventListener('click',pause);ui.sound.addEventListener('click',()=>{sound=!sound;ui.sound.textContent=sound?'♫ BGM ON':'♫ BGM OFF';try{localStorage.setItem('star_fighter_sound',sound?'on':'off')}catch(e){}if(sound){if(!bgm)beginAudio();else{audio?.resume();bgm.setEnabled(true);bgm.start()}}else bgm?.setEnabled(false)});
ui.equip.addEventListener('click',equip);ui.pulse.addEventListener('click',pulse);$('helpBtn').addEventListener('click',()=>{if(G.mode==='playing')pause();else if(G.mode==='title'){showToast('移動：矢印 / WASD / ドラッグ　強化：X→Enter　衝撃波：SPACE')}});
ui.upgrades.forEach((b,i)=>b.addEventListener('click',()=>{G.selected=i;if(G.mode==='playing'&&G.energy>=i+1&&G.levels[i]<MAX[i])showToast('強化を押して '+PNAMES[i]+' を装備');updateHud()}));
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();KEY[k]=true;if(e.repeat)return;if(k==='p'||k==='escape'){pause();return}if(k==='m'){ui.sound.click();return}if(G.mode==='title'||G.mode==='over'||G.mode==='win'){if(k==='enter')startGame();return}if(G.mode==='route'){if(k==='1'||k==='2')chooseRoute(Number(k)-1);if(k==='arrowleft'||k==='arrowright')G.routeSelected=1-G.routeSelected;if(k==='enter')chooseRoute(G.routeSelected);return}if(G.mode!=='playing')return;if(k===' '){pulse();return}if(k==='x'||k==='tab'){if(k==='tab')e.preventDefault();G.selected=(G.selected+1)%6;updateHud();tone(550,.04,'sine',.025)}if(k==='enter'||k==='z')equip()});
window.addEventListener('keyup',e=>{KEY[e.key.toLowerCase()]=false});window.addEventListener('blur',()=>{if(G.mode==='playing')pause()});

/* Standard floating directional stick, separate from the ship's visual position. */
const joy=$('joystick'),joyBase=$('joystickBase'),joyKnob=$('joystickKnob');
function resetStick(){stickX=stickY=0;stickPointer=null;joyKnob.style.transform='translate(-50%,-50%)'}
function stickMove(e){
const box=joyBase.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2,max=box.width*.29;
const dx=(e.clientX-cx)/max,dy=(e.clientY-cy)/max,len=Math.hypot(dx,dy)||1,f=Math.min(1,1/len),x=dx*f,y=dy*f,mag=Math.hypot(x,y),dead=.1,v=mag<dead?0:(mag-dead)/(1-dead);
stickX=mag?x/mag*v:0;stickY=mag?y/mag*v:0;
joyKnob.style.transform='translate(calc(-50% + '+(x*max)+'px),calc(-50% + '+(y*max)+'px))';
}
joy.addEventListener('pointerdown',e=>{if(G.mode!=='playing'||stickPointer!==null)return;e.preventDefault();e.stopPropagation();stickPointer=e.pointerId;try{joy.setPointerCapture(e.pointerId)}catch(err){}stickMove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer){e.preventDefault();stickMove(e)}});
for(const kind of ['pointerup','pointercancel','lostpointercapture'])joy.addEventListener(kind,e=>{if(e.pointerId===stickPointer){e.preventDefault();resetStick()}});
function isPortraitPhone(){return window.matchMedia?window.matchMedia('(pointer: coarse) and (orientation: portrait)').matches:false}
function syncOrientation(){if(isPortraitPhone()&&G.mode==='playing'){pausedByRotation=true;G.mode='paused';bgm?.stop();resetStick()}else if(!isPortraitPhone()&&pausedByRotation){pausedByRotation=false;if(G.mode==='paused'){G.mode='playing';hideOverlay();last=performance.now();if(sound&&bgm){bgm.setEnabled(true);bgm.start()}}}}
window.addEventListener('resize',syncOrientation);window.addEventListener('orientationchange',syncOrientation);

let dragging=false,pid=-1;
function coords(e){const b=C.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*H}}
C.addEventListener('pointerdown',e=>{if(G.mode!=='playing'||e.pointerType==='touch')return;dragging=true;pid=e.pointerId;try{C.setPointerCapture(pid)}catch(err){}const q=coords(e);G.player.targetX=cl(q.x,60,W-130);G.player.targetY=cl(q.y,88,H-52);G.firstInput=true});
C.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pid||G.mode!=='playing')return;const q=coords(e);G.player.targetX=cl(q.x,60,W-130);G.player.targetY=cl(q.y,88,H-52)});
const release=e=>{if(e.pointerId===pid){dragging=false;pid=-1}};C.addEventListener('pointerup',release);C.addEventListener('pointercancel',release);
function equip(){if(G.mode!=='playing')return;const i=G.selected,need=i+1;if(G.energy<need){showToast('カプセルが足りません');tone(150,.1,'triangle',.025);return}if(G.levels[i]>=MAX[i]){showToast('最大強化済み');return}G.energy-=need;G.levels[i]++;if(i===5)p.shield=3+G.levels[i];if(i===4)G.trail.length=0;for(let j=0;j<110;j++)G.trail.push({x:p.x-j*3,y:p.y});ring(p.x,p.y,115,'#64eaff',.65);emit(p.x,p.y,36,'#7df8ff',260);tone(430,.25,'sawtooth',.09,780);showToast(PNAMES[i]+' LEVEL '+G.levels[i]);G.selected=0;updateHud()}
function pulse(){if(G.mode!=='playing'||G.pulses<=0)return;G.pulses--;G.shake=17;screenPulse=.85;G.bullets=[];p.invul=Math.max(p.invul,.65);ring(p.x,p.y,1250,'#a6faff',.75);emit(p.x,p.y,85,'#8bf4ff',460);G.enemies.forEach(e=>{e.hp-=75;emit(e.x,e.y,7,'#ffca81',160)});if(G.boss)G.boss.hp-=110;tone(120,.8,'sawtooth',.14,800);showToast('SHOCK PULSE');updateHud()}
function updateHud(){ui.score.textContent=String(G.score).padStart(8,'0');ui.best.textContent=String(Math.max(G.best,G.score)).padStart(8,'0');ui.mult.textContent='×'+(1+Math.min(3,Math.floor(G.combo/8))*.5).toFixed(1);ui.stage.textContent='SECTOR 0'+(G.stage+1);ui.area.textContent=NAMES[G.stage]+(G.stage>0?(G.routeRisk?' · STORM':' · SAFE'):'');ui.progress.style.width=(G.bossDone?100:Math.min(100,G.stageTime/(G.stage===0?62:G.stage===1?68:74)*100))+'%';[...ui.hp.children].forEach((x,i)=>x.classList.toggle('off',i>=p.hp));ui.lives.textContent='LIVES '+String(G.lives).padStart(2,'0');ui.bombs.textContent='PULSE '+String(G.pulses).padStart(2,'0');ui.meter.textContent='CAPSULE × '+G.energy+' / 6 · '+(G.overdrive>0?'OVERDRIVE '+Math.ceil(G.overdrive)+'s':G.energy?'強化可能':'カプセルを集めよう');ui.upgrades.forEach((b,i)=>{b.classList.toggle('selected',i===G.selected);b.classList.toggle('ready',G.energy>=i+1&&G.levels[i]<MAX[i]);b.classList.toggle('maxed',G.levels[i]>=MAX[i]);b.querySelector('.u-key').textContent=G.levels[i]?'LV '+G.levels[i]:(String(i+1).padStart(2,'0'))});ui.equip.disabled=G.mode!=='playing'||G.energy<G.selected+1||G.levels[G.selected]>=MAX[G.selected];ui.pulse.disabled=G.mode!=='playing'||G.pulses===0;ui.boss.classList.toggle('active',!!G.boss);if(G.boss){ui.bossName.textContent=G.boss.name+(G.boss.phase?' · RAGE':'');ui.bossBar.style.width=cl(G.boss.hp/G.boss.maxHp*100,0,100)+'%'}}
function ring(x,y,max,color,life=.6){G.rings.push({x,y,r:4,max,color,life,t:0})}
function emit(x,y,num,color,power=160){for(let i=0;i<num;i++){const a=R(0,TAU),s=R(power*.15,power);G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:R(.2,.85),maxLife:.85,size:R(1.2,4.4),color,glow:Math.random()>.55})}}
function explosion(x,y,r=32){emit(x,y,Math.round(r*.85),'#ffb66c',r*7);emit(x,y,Math.round(r*.4),'#70dcff',r*4);ring(x,y,r*3,'#ffbd88');G.shake=Math.min(25,G.shake+r*.12);tone(R(70,115),.2,'sawtooth',.038,-50)}
function chargeDrive(amount){if(G.overdrive>0)return;G.driveCharge=Math.min(100,G.driveCharge+amount);if(G.driveCharge>=100){G.driveCharge=0;G.overdrive=8;G.shake=Math.max(G.shake,5);screenPulse=.24;ring(p.x,p.y,155,'#f7d989',.55);emit(p.x,p.y,25,'#ffe49b',180);showToast('OVERDRIVE · 8 SEC');tone(520,.28,'sawtooth',.08,720)}}
function addScore(n){G.combo++;G.maxCombo=Math.max(G.maxCombo,G.combo);G.comboTime=3.8;G.score+=Math.round(n*(1+Math.min(3,Math.floor(G.combo/8))*.5)*(G.overdrive>0?1.5:1)*routeProfile().score);if(G.score>G.best)G.best=G.score}
function pickup(x,y,forced=false){G.pickups.push({x,y,vx:-R(35,68),phase:R(0,TAU),t:0,type:forced?'energy':Math.random()>.92?'pulse':'energy'})}
function enemy(type,x,y,extra={}){const tune=routeProfile();if(G.enemies.length>=tune.maxEnemies)return;let hp={scout:22,dart:15,tank:125,turret:75,spinner:35,carrier:100,mine:35,interceptor:65}[type]||25;hp*=(1+G.stage*.35)*tune.enemyHp;G.enemies.push({type,x,y,hp,maxHp:hp,t:0,fire:R(.9,1.8)*tune.fireInterval,phase:R(0,TAU),seed:R(0,100),score:type==='tank'?750:type==='carrier'?700:type==='interceptor'?540:250,...extra})}
function spawnWave(){
const s=G.stage,tune=routeProfile(),risk=s>0&&G.routeRisk===1,safe=s>0&&!risk;
if(G.enemies.length>=tune.maxEnemies-2)return;
const safeWaves=[0,0,1,2,3,4,5,6,10],stormWaves=[1,2,3,4,5,6,7,7,8,9];
const w=s===0?ri(0,6):(risk?stormWaves[ri(0,stormWaves.length-1)]:safeWaves[ri(0,safeWaves.length-1)]);
if(w===0){const yy=R(180,465);for(let i=0;i<(safe?4:6);i++)enemy('scout',W+60+i*68,cl(yy+Math.sin(i*.9)*66,122,H-70),{pattern:1})}
else if(w===1){const n=safe?3:4;for(let i=0;i<n;i++)enemy('dart',W+50+i*105,145+i*390/Math.max(1,n-1),{pattern:2})}
else if(w===2){enemy('tank',W+100,R(195,490));for(let i=0;i<(safe?2:3);i++)enemy('scout',W+230+i*85,R(140,545))}
else if(w===3){for(let i=0;i<(safe?3:4);i++)enemy('spinner',W+60+i*80,R(145,540))}
else if(w===4){enemy('carrier',W+70,R(180,500));for(let i=0;i<(safe?1:2);i++)enemy('scout',W+200+i*80,R(140,540))}
else if(w===5){enemy('turret',W+90,105);if(!safe){enemy('turret',W+200,H-96);enemy('dart',W+175,340)}}
else if(w===6){const n=safe?2:4;for(let i=0;i<n;i++)enemy('mine',W+50+i*85,170+i*320/Math.max(1,n-1))}
else if(w===7){for(let i=0;i<2;i++)enemy('interceptor',W+100+i*110,160+i*145,{lockY:null})}
else if(w===8){enemy('tank',W+125,R(220,440));enemy('interceptor',W+310,195,{lockY:null});enemy('interceptor',W+410,490,{lockY:null})}
else if(w===9){enemy('carrier',W+100,R(210,450));enemy('dart',W+245,185);enemy('dart',W+350,490);enemy('spinner',W+450,345)}
else{enemy('carrier',W+95,R(200,470));enemy('scout',W+260,210);enemy('scout',W+345,475)}
if(risk&&s===1&&Math.random()>.7)enemy('turret',W+420,Math.random()>.5?125:H-110);
if(risk&&s===2&&Math.random()>.65)enemy('spinner',W+450,R(195,480));
}
function bullet(x,y,a,s=290,size=5,col='#ff8d61',damage=1){G.bullets.push({x,y,px:x,py:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,size,life:5,color:col,damage})}
function aim(x,y,spread=0){return Math.atan2(p.y-y,p.x-x)+spread}
function fireEnemy(e){if(e.type==='mine'||e.type==='interceptor')return;const a=aim(e.x-30,e.y);const base=G.stage*22+(G.stage>0&&G.routeRisk?10:0);if(e.type==='tank'||e.type==='carrier'){for(let i=-1;i<=1;i++)bullet(e.x-42,e.y,a+i*.20,270+base,6,'#ffac71')}else if(e.type==='turret'){for(let i=-2;i<=2;i++)bullet(e.x-32,e.y,a+i*.14,260+base,5,'#ff577e')}else if(e.type==='spinner'){for(let i=0;i<6;i++)bullet(e.x,e.y,e.t*1.5+i*TAU/6,210+base,4,'#ffcc7e')}else{bullet(e.x-24,e.y,a,290+base,4,'#f9767f')}}
function spawnBoss(){const hp=Math.round([1900,2650,3600][G.stage]*routeProfile().bossHp);G.boss={name:BOSSES[G.stage],x:W+220,y:335,w:[250,280,300][G.stage],hp,maxHp:hp,t:0,fire:1.6,pattern:0,core:0,phase:0,charge:0,beam:0,beamY:0};G.bossDone=false;G.enemies=[];showAnnounce('WARNING / SECTOR '+String(G.stage+1).padStart(2,'0'),BOSSES[G.stage],'大型反応接近　総攻撃開始',2.4);tone(90,.9,'sawtooth',.09,170)}
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
function openRoute(){
 if(G.stage>=2){endGame(true);return}
 G.mode='route';G.transitioning=false;resetStick();bgm?.stop();
 const options=ROUTE_OPTIONS[G.stage],panel=$('routePanel');
 $('routeHeading').textContent='次の航路を選択';
 $('routeNextSector').textContent='SECTOR 0'+(G.stage+2);
 $('routeSafeName').textContent=options[0].name;
 $('routeSafeDesc').textContent=options[0].desc;
 $('routeSafeBonus').textContent=options[0].bonus;
 $('routeRiskName').textContent=options[1].name;
 $('routeRiskDesc').textContent=options[1].desc;
 $('routeRiskBonus').textContent=options[1].bonus;
 G.routeSelected=0;panel.classList.add('open');tone(440,.2,'triangle',.04,210);
}
function chooseRoute(index){
 if(G.mode!=='route'||index!==0&&index!==1)return;
 const opt=ROUTE_OPTIONS[G.stage][index];
 G.routeRisk=opt.risk;G.routeHistory.push({stage:G.stage+2,route:opt.name,risk:opt.risk});
 G.energy=Math.min(6,G.energy+(opt.risk?2:1));
 if(opt.risk){G.score+=1000*(G.stage+1);chargeDrive(18)}else G.pulses=Math.min(5,G.pulses+1);
 $('routePanel').classList.remove('open');G.mode='playing';
 nextStage();
 if(sound&&bgm){bgm.setEnabled(true);bgm.start()}
 syncOrientation();
 showToast(opt.risk?'HIGH RISK · REWARD UP':'SAFE ROUTE · SUPPLIES UP');
}
$('routeSafe').addEventListener('click',()=>chooseRoute(0));
$('routeRisk').addEventListener('click',()=>chooseRoute(1));

function stageClear(){G.boss=null;G.bossDone=true;G.transitioning=true;G.transition=3.5;G.bullets=[];G.pulses=Math.min(5,G.pulses+1);p.hp=Math.min(3,p.hp+1);G.score+=5000*(G.stage+1);chargeDrive(22);showAnnounce('SECTOR CLEAR',NAMES[G.stage],'+ BONUS 5000 · ARMOR RECOVERED',3.1);tone(470,.55,'triangle',.055,450)}
function nextStage(){G.stage++;if(G.stage>=3){endGame(true);return}G.stageTime=0;G.spawn=2*routeProfile().spawnInterval;G.transitioning=false;G.bossDone=false;G.enemies=[];G.bullets=[];G.pickups=[];p.invul=2.5;showAnnounce('MISSION 0'+(G.stage+1),NAMES[G.stage],SUBS[G.stage],3.4);tone(400,.3,'sine',.04,350)}
function hitPlayer(damage=1){if(p.invul>0||G.mode!=='playing')return;if(p.shield>0){p.shield--;p.invul=.7;ring(p.x,p.y,62,'#5df4ff');tone(330,.19,'triangle',.07,-200);return}p.hp-=damage;p.invul=1.5;G.shake=13;G.combo=0;G.driveCharge=Math.max(0,G.driveCharge-20);emit(p.x,p.y,25,'#8acbff',220);tone(190,.36,'sawtooth',.085,-160);if(p.hp<=0){G.lives--;explosion(p.x,p.y,57);if(G.lives<=0){endGame(false);return}p.hp=3;p.invul=3.2;p.x=165;p.y=H/2;p.targetX=p.x;p.targetY=p.y;G.levels[0]=Math.max(0,G.levels[0]-1);G.energy=0;showToast('SHIP LOST · '+G.lives+' REMAINING')}}
function playerFire(){const l=G.levels,shotCount=l[2]>0?2:1;const speeds=G.overdrive>0?1250:950;if(l[2]>0){for(let i=0;i<shotCount;i++){let y=p.y+(i?9:-9);G.shots.push({x:p.x+42,y,px:p.x+42,py:y,vx:1200,vy:0,dmg:23+l[2]*12,pierce:3+l[2]*3,kind:'laser',life:1.5})}}else{G.shots.push({x:p.x+37,y:p.y,px:p.x+37,py:p.y,vx:speeds,vy:0,dmg:G.overdrive>0?28:19,pierce:1,kind:'shot',life:1.7})}if(l[1]){const spread=l[1]===1?[.16,-.16]:l[1]===2?[.12,-.12,.29,-.29]:[.09,-.09,.21,-.21,.35,-.35];for(let a of spread)G.shots.push({x:p.x+30,y:p.y,px:p.x+30,py:p.y,vx:890*Math.cos(a),vy:890*Math.sin(a),dmg:12+l[1]*2,pierce:1,kind:'spread',life:1.6})}const drones=l[4];for(let i=0;i<drones;i++){const tr=G.trail[Math.min(G.trail.length-1,17+i*24)]||p;G.shots.push({x:tr.x+20,y:tr.y,px:tr.x+20,py:tr.y,vx:890,vy:0,dmg:13,pierce:1,kind:'drone',life:1.7})}emit(p.x+44,p.y,3,'#6eeeff',75);tone(l[2]?680:380,.045,'triangle',.009,l[2]?350:110)}
function missileFire(){if(!G.levels[3])return;const shots=G.levels[3];for(let i=0;i<shots;i++)G.shots.push({x:p.x-6,y:p.y+22,px:p.x-6,py:p.y+22,vx:300,vy:170+i*100,dmg:35,pierce:1,kind:'missile',life:3.8})}
function circleHit(ax,ay,ar,bx,by,br){return (ax-bx)*(ax-bx)+(ay-by)*(ay-by)<(ar+br)*(ar+br)}
function update(dt){G.time+=dt;G.total+=dt;G.scroll+=(120+G.stage*27)*dt;G.stageTime+=dt;G.shake*=Math.pow(.025,dt);screenPulse=Math.max(0,screenPulse-dt*2.1);p.invul=Math.max(0,p.invul-dt);if(G.toastTime>0){G.toastTime-=dt;if(G.toastTime<=0)ui.toast.classList.remove('show')}if(G.announceTime>0){G.announceTime-=dt;if(G.announceTime<=0)ui.announce.classList.remove('show')}if(G.comboTime>0){G.comboTime-=dt;if(G.comboTime<=0)G.combo=0}if(G.overdrive>0)G.overdrive=Math.max(0,G.overdrive-dt);melody(dt);
let dx=(KEY['d']||KEY['arrowright']?1:0)-(KEY['a']||KEY['arrowleft']?1:0)+stickX,dy=(KEY['s']||KEY['arrowdown']?1:0)-(KEY['w']||KEY['arrowup']?1:0)+stickY;const speed=(335+G.levels[0]*85)*(KEY['shift']?.5:1);if(dx||dy){const norm=1/Math.max(1,Math.hypot(dx,dy));p.targetX=cl(p.targetX+dx*speed*dt*norm,('ontouchstart' in window?240:62),W-135);p.targetY=cl(p.targetY+dy*speed*dt*norm,98,H-51)}else if(!dragging){p.targetX=p.x;p.targetY=p.y}let ox=p.x,oy=p.y;p.x+=(p.targetX-p.x)*Math.min(1,dt*15);p.y+=(p.targetY-p.y)*Math.min(1,dt*15);p.angle=cl((p.y-oy)*.022,-.22,.22);
G.trail.unshift({x:p.x,y:p.y});if(G.trail.length>140)G.trail.length=140;
if(Math.random()>.1)G.particles.push({x:p.x-37,y:p.y+R(-7,7),vx:-R(165,330),vy:R(-30,30),life:R(.15,.4),maxLife:.4,size:R(2,5),color:Math.random()>.4?'#30e6ff':'#ffce77',glow:true});
G.fireTimer-=dt;if(G.fireTimer<=0){playerFire();G.fireTimer=(G.levels[2]>0?.22:.165)*(G.overdrive>0?.59:1)}
G.missileTimer-=dt;if(G.missileTimer<=0){missileFire();G.missileTimer=G.overdrive>0?.7:1.15}
if(!G.boss&&!G.bossDone&&!G.transitioning){const deadline=[62,68,74][G.stage];if(G.stageTime>=deadline)spawnBoss();else{G.spawn-=dt;if(G.spawn<=0){spawnWave();G.spawn=Math.max(2.6,(R(3.5,5.5)-G.stage*.38)*routeProfile().spawnInterval)}if(Math.floor((G.stageTime-dt)/9)<Math.floor(G.stageTime/9))pickup(W-20,R(155,525),true)}}
if(G.transitioning){G.transition-=dt;if(G.transition<=0)openRoute()}
for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];e.t+=dt;let vx=({scout:190,dart:305,tank:86,turret:76,spinner:157,carrier:100,mine:125,interceptor:98}[e.type]||140)*routeProfile().speed;e.x-=vx*dt;if(e.type==='interceptor'){if(e.lockY===null&&e.x<1050){e.lockY=cl(p.y,115,H-75);e.t=0}if(e.lockY!==null){if(e.t<1){e.x+=vx*dt-43*dt;e.y+=(e.lockY-e.y)*Math.min(1,dt*1.15)}else{e.x-=465*dt;e.y+=(e.lockY-e.y)*Math.min(1,dt*5)}}}if(e.type==='scout')e.y+=Math.sin(e.t*3.8+e.phase)*63*dt;if(e.type==='dart')e.y+=Math.sin(e.t*5+e.phase)*75*dt;if(e.type==='spinner')e.y+=Math.sin(e.t*4+e.phase)*115*dt;if(e.type==='carrier')e.y+=Math.cos(e.t*1.65)*26*dt;if(e.type==='mine')e.y+=Math.sin(e.t*2+e.phase)*20*dt;e.fire-=dt;if(e.fire<0&&e.x<W-35&&e.x>80){fireEnemy(e);e.fire=Math.max(.7,(R(e.type==='turret'?.95:1.5,e.type==='turret'?1.4:2.4)-G.stage*.11)*routeProfile().fireInterval)}if(circleHit(p.x,p.y,18,e.x,e.y,e.type==='tank'||e.type==='carrier'?36:21))hitPlayer(1);if(e.x<-140){G.enemies.splice(i,1);continue}if(e.hp<=0){destroyEnemy(i);continue}}
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
if(!gone&&G.boss&&circleHit(s.x,s.y,7,G.boss.x-53,G.boss.y,G.stage===2?110:100)){G.boss.hp-=s.dmg;emit(s.x,s.y,ri(2,4),'#ffca82',95);s.pierce--;if(s.pierce<=0)gone=true}
if(gone||s.x>W+160||s.y<-80||s.y>H+100||s.life<=0)G.shots.splice(i,1)}
for(let i=G.bullets.length-1;i>=0;i--){const a=G.bullets[i];a.px=a.x;a.py=a.y;a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;if(circleHit(a.x,a.y,a.size,p.x,p.y,16)){hitPlayer(a.damage);ring(a.x,a.y,27,'#ffc391',.3);G.bullets.splice(i,1);continue}if(!a.grazed&&p.invul<=0&&circleHit(a.x,a.y,a.size,p.x,p.y,53)){a.grazed=true;G.grazes++;G.score+=60;chargeDrive(5);emit(a.x,a.y,2,'#f8e9a5',40);if(G.grazes%10===0)showToast('GRAZE BONUS × '+G.grazes)}if(a.x<-35||a.x>W+35||a.y<-35||a.y>H+35||a.life<=0)G.bullets.splice(i,1)}
for(let i=G.pickups.length-1;i>=0;i--){const q=G.pickups[i];q.t+=dt;q.x+=q.vx*dt;q.y+=Math.sin(q.t*2+q.phase)*17*dt;if(len(q.x-p.x,q.y-p.y)<routeProfile().magnet){const a=Math.atan2(p.y-q.y,p.x-q.x);q.x+=Math.cos(a)*250*dt;q.y+=Math.sin(a)*250*dt}if(circleHit(q.x,q.y,19,p.x,p.y,22)){if(q.type==='pulse'){G.pulses=Math.min(5,G.pulses+1);showToast('PULSE +1')}else{G.energy=Math.min(6,G.energy+1);G.selected=Math.max(0,Math.min(5,G.energy-1));showToast('POWER CAPSULE +1')}emit(q.x,q.y,15,'#fffba6',155);tone(510,.15,'triangle',.055,380);G.pickups.splice(i,1)}else if(q.x<-40)G.pickups.splice(i,1)}
for(let i=G.particles.length-1;i>=0;i--){const q=G.particles[i];q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.12,dt);q.vy*=Math.pow(.16,dt);if(q.life<=0)G.particles.splice(i,1)}if(G.particles.length>620)G.particles.splice(0,G.particles.length-620);
for(let i=G.rings.length-1;i>=0;i--){const r=G.rings[i];r.t+=dt;r.r=r.max*(r.t/r.life);if(r.t>=r.life)G.rings.splice(i,1)}
G.uiTime-=dt;if(G.uiTime<=0){updateHud();G.uiTime=.11}}
function destroyEnemy(i){const e=G.enemies[i];if(!e)return;addScore(e.score);G.killCount++;chargeDrive(e.type==='tank'||e.type==='carrier'?13:6);explosion(e.x,e.y,e.type==='tank'||e.type==='carrier'?46:21);if(e.type==='carrier'||Math.random()<routeProfile().pickupRate)pickup(e.x,e.y,Math.random()>.08);G.enemies.splice(i,1)}
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

function drawTacticalMeter(){if(G.mode!=='playing'&&G.mode!=='paused')return;const x=236,y=H-36,w=166,h=7,active=G.overdrive>0;
c.save();c.globalAlpha=.95;c.fillStyle='#071422ba';c.fillRect(x-12,y-29,w+25,56);c.font='bold 12px ui-monospace,monospace';c.textAlign='left';c.textBaseline='middle';c.fillStyle=active?'#ffe99f':'#82d6ea';c.fillText(active?'OVERDRIVE '+G.overdrive.toFixed(1)+'s':'OVERDRIVE CHARGE',x,y-10);c.fillStyle='#24425b';c.fillRect(x,y,w,h);c.fillStyle=active?'#ffdb7b':'#4cdded';c.fillRect(x,y,w*(active?G.overdrive/8:G.driveCharge/100),h);c.strokeStyle=active?'#ffe19a':'#5ccdeb';c.lineWidth=1;c.strokeRect(x,y,w,h);c.restore()}
function drawScene(){c.save();if(G.shake>.2)c.translate(R(-G.shake,G.shake),R(-G.shake,G.shake));drawBackground();if(G.mode==='title'){drawShip(274,344,0,0);for(let i=0;i<4;i++){const e={x:750+i*122,y:210+i*90,type:i%2?'scout':'spinner',t:G.time*.7,phase:i};drawEnemy(e)}}
else{for(const q of G.pickups){c.save();c.translate(q.x,q.y);c.rotate(q.t*1.5);c.shadowColor=q.type==='pulse'?'#ffcb60':'#7dfff8';c.shadowBlur=22;poly([0,-18,18,0,0,18,-18,0],q.type==='pulse'?'#9e7129':'#157881',q.type==='pulse'?'#fff3a0':'#d4fff7',2);c.font='bold 18px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f5ffff';c.rotate(-q.t*1.5);c.fillText(q.type==='pulse'?'✹':'P',0,1);c.restore()}
for(const e of G.enemies){if(e.type==='interceptor'&&e.lockY!==null&&e.t<1){c.save();c.globalAlpha=.6;c.setLineDash([18,12]);line(0,e.lockY,e.x-36,e.lockY,'#ffb57b',1.8);c.setLineDash([]);c.restore()}drawEnemy(e)}if(G.boss){drawBoss(G.boss);drawBossBeam(G.boss)}
for(const s of G.shots){c.save();c.shadowBlur=15;c.shadowColor=s.kind==='missile'?'#ffae57':'#72edff';c.lineCap='round';if(s.kind==='laser'){line(s.x-95,s.y,s.x+24,s.y,'#178fff',14);line(s.x-105,s.y,s.x+24,s.y,'#83faff',6);line(s.x-105,s.y,s.x+28,s.y,'#fff',2)}else if(s.kind==='missile'){poly([s.x+12,s.y,s.x-13,s.y-7,s.x-8,s.y,s.x-13,s.y+7],'#ffbc81','#fff1b4',1);line(s.x-28,s.y+R(-2,2),s.x-10,s.y,'#ff954d',5)}else{line(s.x-20,s.y-s.vy*.012,s.x+12,s.y+s.vy*.012,'#55d6ff',s.kind==='shot'?6:3.5);line(s.x-16,s.y,s.x+14,s.y,'#d4fbff',2)}c.restore()}
for(const a of G.bullets){c.save();c.shadowColor=a.color;c.shadowBlur=15;line(a.x-a.vx*.045,a.y-a.vy*.045,a.x,a.y,a.color,Math.max(2,a.size*1.3));glowCircle(a.x,a.y,Math.max(2,a.size*.62),'#fff0d9',6);c.restore()}
for(let i=G.levels[4]-1;i>=0;i--){let tr=G.trail[Math.min(G.trail.length-1,17+i*24)];if(tr)drawDrone(tr.x-9,tr.y,i)}drawShip(p.x,p.y,p.angle,p.invul);
for(const q of G.particles){c.save();c.globalAlpha=cl(q.life/q.maxLife,0,1);if(q.glow){c.shadowColor=q.color;c.shadowBlur=12}c.fillStyle=q.color;c.fillRect(q.x-q.size*.5,q.y-q.size*.5,q.size,q.size);c.restore()}
for(const r of G.rings){c.save();c.globalAlpha=Math.max(0,1-r.t/r.life);c.strokeStyle=r.color;c.lineWidth=Math.max(1,8*(1-r.t/r.life));c.shadowColor=r.color;c.shadowBlur=20;c.beginPath();c.arc(r.x,r.y,r.r,0,TAU);c.stroke();c.restore()}}
drawTacticalMeter();
if(screenPulse>0){c.fillStyle='rgba(197,244,255,'+(screenPulse*.25)+')';c.fillRect(0,0,W,H)}
c.restore()}
function render(ms){const dt=Math.min((ms-last)/1000||0,.034);last=ms;if(G.mode==='playing')update(dt);else{G.time+=dt;G.scroll+=30*dt}drawScene();requestAnimationFrame(render)}
const dpr=Math.min(2,window.devicePixelRatio||1);C.width=W*dpr;C.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);showOverlay('title');syncOrientation();updateHud();requestAnimationFrame(render);
})();
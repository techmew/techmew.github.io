/* STAR FIGHTER seed/formation safety regression.
 * Run from games/star-fighter/: node qa_100_runs.js
 * Deterministic headless tests; not a replacement for physical-device QA. */
'use strict';
function runHarness(gameSource,musicSource,extrasSource){
 const assert=(condition,message)=>{if(!condition)throw Error(message)};
 const elements=new Map();
 function el(id){
  if(elements.has(id))return elements.get(id);
  const obj={id,hidden:false,textContent:'',innerHTML:'',value:'',title:'',style:{},dataset:{},
   classList:{add(){},remove(){},toggle(){}},setAttribute(){},getAttribute(){},
   setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:200,height:180}},
   children:[{classList:{toggle(){}}},{classList:{toggle(){}}},{classList:{toggle(){}}}],
   addEventListener(type,fn){(this.handlers??={})[type]??=[];this.handlers[type].push(fn)},
   querySelector(q){return el(id+' '+q)}};
  elements.set(id,obj);return obj;
 }
 const context=new Proxy({
  createLinearGradient(){return {addColorStop(){}}},
  createRadialGradient(){return {addColorStop(){}}},
  setTransform(){},save(){},restore(){}
 },{get(target,key){return key in target?target[key]:()=>{}},set(target,key,value){target[key]=value;return true}});
 el('game').getContext=()=>context;
 const upgrades=Array.from({length:6},(_,i)=>el('upgrade'+i));
 const document={getElementById:el,querySelectorAll(q){return q==='.upgrade'?upgrades:[]},addEventListener(){}};
 const storageData=new Map([['star_fighter_sound','off']]);
 const storage={getItem:k=>storageData.get(k)||null,setItem:(k,v)=>storageData.set(k,String(v)),removeItem:k=>storageData.delete(k)};
 const audioStats={starts:0,stops:0,updates:0};
 class AudioStub{
  constructor(){this.state='running';this.destination={};this.currentTime=0}
  resume(){return Promise.resolve()}
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}}}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
 }
 const window={devicePixelRatio:2,innerWidth:390,innerHeight:840,location:{search:''},
  AudioContext:AudioStub,CyberBGM:class{
   constructor(){this.enabled=true}
   setEnabled(x){this.enabled=x}
   start(){audioStats.starts++}
   stop(){audioStats.stops++}
   update(){audioStats.updates++}
  },matchMedia(q){return {matches:q.includes('pointer: coarse')}},
  addEventListener(type,fn){(this.handlers??={})[type]??=[];this.handlers[type].push(fn)}
 };
 if(extrasSource)new Function('window',extrasSource)(window);
 // Native disabled buttons never dispatch click. Model this instead of
 // bypassing disabled as the previous headless test incorrectly did.
 const ev=(id,type,more={})=>{
  if(type==='click'&&el(id).disabled)return;
  return (el(id).handlers?.[type]||[]).forEach(fn=>fn({
  pointerId:1,clientX:80,clientY:120,preventDefault(){},stopPropagation(){},...more
 }));
 };
 let frame=null,clock=0;
 const hooked=gameSource.replace(/\}\)\(\);\s*$/,'window.__QA={G,enemy,drawEnemy,fireEnemy,seedStage,spawnWave,routeProfile,waveRadius,waveClearance,placeOutsideLane,spawnAmbient,destroyEnemy,planTerrain,advanceTerrain,resetTerrain,terrainQueued,bullet,update,spawnBoss,bossVariant,bossAttack,stageClear,openRoute,chooseRoute,drawScene,drawFlightGate,routeOffer,rewardOptions,openReward,chooseReward,hitPlayer,readCheckpoint,saveCheckpoint,chargeDrive,playerFire,missileFire,pulse,nextStage,pickupMagnetRadius,pickupPullSpeed,salvageRate,MEDALS,medalState,readMedals,unlockMedal,cycleMedal,PASSIVES,SYNERGIES,synergyActive,synergySummary,applyShotSynergy,steerDrone,renderRouteMap};})();');
 assert(hooked!==gameSource,'cannot attach QA hooks');
 new Function('window','document','localStorage','performance','requestAnimationFrame','navigator',hooked)(
  window,document,storage,{now:()=>clock},fn=>{frame=fn},{userAgent:'QA'});
 const q=window.__QA,G=q.G;
 assert(G.mode==='title','initial mode');
 ev('startBtn','click');
 assert(G.mode==='playing','start');
 const stats={seeds:100,stageCases:0,waves:0,units:0,terrains:0,warningSeconds:Infinity,
  types:new Set(),minUnits:Infinity,maxUnits:0,maxBullets:0,checks:0};
 const ok=(x,message)=>{stats.checks++;assert(x,message)};
 const seeds=Array.from({length:100},(_,i)=>(Math.imul(i+1,0x9e3779b9)^0xa5a5a5a5)>>>0);
 const stageSetup=(seed,stage,risk)=>{
  G.runSeed=seed;G.stage=stage;G.routeRisk=risk;G.stageTime=5;G.mode='playing';
  G.enemies=[];G.bullets=[];G.shots=[];G.pendingWave=null;G.terrain=null;G.terrainIndex=2;
  G.boss=null;G.bossDone=false;G.transitioning=false;G.directorGrace=0;G.waveSerial=0;G.ambientTimer=.6;
  G.player.hp=3;G.player.invul=0;G.player.shield=0;G.lives=3;
  G.player.x=215;G.player.targetX=215;G.player.y=337;G.player.targetY=337;
  G.selected=0;G.energy=0;G.pulses=2;G.pulseRecharge=0;G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
  G.fireTimer=0;G.missileTimer=0;
  q.seedStage();
 };
 function waveSignature(){
  const w=G.pendingWave;
  return [w.kind,w.safeY,...w.units.map(u=>[u.type,Math.round(u.x),Math.round(u.y)])].join('|');
 }
 function checkWave(seed,stage,risk,index){
  const w=G.pendingWave;
  ok(!!w,'no formation '+[seed,stage,risk,index]);
  ok(w.timer>=.28&&w.timer<=.4,'new waves enter promptly');
  ok(w.units.length>=1&&w.units.length<=8,'wave budget');
  ok(w.units.length<=q.routeProfile().maxEnemies,'enemy limit');
  ok([155,337,515].includes(w.safeY),'safe lane invalid');
  for(let i=0;i<w.units.length;i++){
   const u=w.units[i];
   ok(Number.isFinite(u.x)&&Number.isFinite(u.y),'invalid coordinate');
   ok(Math.abs(u.y-w.safeY)>=q.waveClearance(u.type)-.001,'safe lane invaded');
   for(let j=0;j<i;j++){
    const v=w.units[j],gap=q.waveRadius(u.type)+q.waveRadius(v.type)+24;
    ok(!(Math.abs(u.x-v.x)<gap&&Math.abs(u.y-v.y)<gap+1),'overlapping enemy entry');
   }
  }
  if(w.kind>=19)ok(stage>=w.kind-18,'stage gated unlock '+stage+'/'+w.kind);
  stats.waves++;stats.units+=w.units.length;stats.minUnits=Math.min(stats.minUnits,w.units.length);
  stats.maxUnits=Math.max(stats.maxUnits,w.units.length);stats.types.add(w.kind);
 }
 for(const seed of seeds){
  for(const stage of [0,1,2,3,4,5,6,7]){
   for(const risk of stage===0?[0]:[0,1]){
    stats.stageCases++;
    stageSetup(seed,stage,risk);
    const signatures=[];
    for(let j=0;j<16;j++){
     G.stageTime=5+j*2.4;G.player.y=[155,337,515][j%3];
     ok(q.spawnWave(),'failed to schedule wave');
     checkWave(seed,stage,risk,j);
     if(j<5)signatures.push(waveSignature());
     ok(!q.spawnWave(),'double wave scheduling');
     G.pendingWave=null;
    }
    stageSetup(seed,stage,risk);
    for(let j=0;j<5;j++){
     G.stageTime=5+j*2.4;G.player.y=[155,337,515][j%3];
     ok(q.spawnWave(),'repeat schedule');
     ok(waveSignature()===signatures[j],'seed replay diverged');
     G.pendingWave=null;
    }
    stageSetup(seed,stage,risk);
    G.terrainIndex=0;q.resetTerrain();
    for(let j=0;j<2;j++){
     G.stageTime=G.terrainSchedule[j];
     G.player.y=[165,337,509][j===0?0:2];
     ok(q.terrainQueued(),'terrain schedule missed');
     ok(q.planTerrain(),'terrain did not schedule');
     const t=G.terrain;
     stats.warningSeconds=Math.min(stats.warningSeconds,t.timer);
     ok(t.phase==='warning'&&t.timer>=2.1,'terrain warning short');
      if(stage===3)ok(t.type==='flare','stage four must have heat vent hazard');
      if(stage===4)ok(t.type===(risk?'blizzard':'ice'),'stage five terrain differs by route');
       if(stage===5)ok(t.type===(risk?'seal':'rune'),'stage six terrain differs by route');
       if(stage===6)ok(t.type===(risk?'fracture':'membrane'),'stage seven terrain differs by route');
       if(stage===7)ok(t.type===(risk?'gravity':'prism'),'stage eight terrain differs by route');
     ok(t.blocks.filter(b=>b.hp>0).length===2,'terrain should block two lanes');
     ok(t.blocks[t.safeLane].hp===0,'terrain safe lane obstructed');
     ok(q.spawnWave()&&G.pendingWave.safeY===[165,337,509][t.safeLane],'enemy squads keep terrain lane open');
     G.pendingWave=null;
     q.advanceTerrain(2.1);
     ok(t.phase==='active','terrain never activated');
     G.player.y=[165,337,509][t.safeLane];G.player.invul=0;G.player.hp=3;
     t.x=G.player.x+1;
     q.advanceTerrain(.016);
     ok(G.player.hp===3,'terrain damaged ship in safe lane');
     G.terrain=null;stats.terrains++;
    }
    G.terrainIndex=0;
    G.stageTime=G.terrainSchedule[0];
    G.enemies=[{x:1100,y:337}];G.bullets=[{x:600,y:337}];
    ok(q.planTerrain(),'terrain must start with enemies present');
    ok(G.terrain.phase==='warning','hazard preview is preserved');
    G.terrain=null;G.enemies=[];G.bullets=[];
    G.terrainIndex=2;
    G.enemies=[];G.pickups=[];
    ok(q.spawnAmbient(),'patrol should bridge quiet moments');
    ok(G.enemies.length===1&&G.enemies[0].noLoot,'background enemies must never farm power items');
    q.destroyEnemy(0);ok(G.pickups.length===0,'no increased power capsule drops');
    const max=q.routeProfile().maxEnemies;
    G.enemies=Array.from({length:max},(_,i)=>({x:1000+i*8,y:120}));
    ok(!q.spawnWave(),'formation over max enemy budget');
    G.enemies=[];
   }
  }
 }
 for(let kind=19;kind<=25;kind++)ok(stats.types.has(kind),'missing new stage wave '+kind);
 for(const config of window.StarFighterEnemyExtras.roster){
  stageSetup(seeds[0],config.unlock,0);
  G.enemies=[];G.bullets=[];G.shots=[];G.pickups=[];
  q.enemy(config.type,900,337,config.type==='lancer'?{lockY:null}:{});
  ok(G.enemies.length===1&&G.enemies[0].type===config.type,'enemy spawn '+config.type);
  const specimen=G.enemies[0];
  ok(specimen.hp>0&&specimen.hp<550,'bounded enemy HP '+config.type);
  q.drawEnemy(specimen);q.fireEnemy(specimen);
  ok(G.bullets.length<=1,'no barrage spam by special '+config.type);
  if(config.type==='bulk')ok(specimen.maxHp<60,'large target must remain weak');
 }
 ok(musicSource.includes('[142,136,112,148,124,118,106,152]'),'stage seven tempo exists');
  ok(musicSource.includes('unstable boundary'),'stage seven original theme exists');
  // Exercise original Web Audio sequencing across every normal/boss score.
  const musicWindow={};
  new Function('window',musicSource)(musicWindow);
  const gainParam=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(){}});
  const node=()=>({gain:gainParam(),connect(){},disconnect(){}});
  const mockAudio={
   sampleRate:8000,currentTime:0,destination:{},
   createGain:node,
   createDynamicsCompressor(){return {threshold:{value:0},ratio:{value:0},attack:{value:0},release:{value:0},connect(){}}},
   createDelay(){return {delayTime:{value:0,setTargetAtTime(){}},connect(){}}},
   createBuffer(ch,length){return {getChannelData(){return new Float32Array(length)}}}
  };
  const synth=new musicWindow.CyberBGM(mockAudio);
  const musicSignatures=new Set();
  for(let stage=0;stage<8;stage++)for(const boss of [false,true]){
   synth.stage=stage;synth.boss=boss;
   const notes=[];synth.note=(pitch,time,duration,type)=>notes.push([pitch,type]);
   synth.kick=()=>{};synth.noiseHit=()=>{};
   for(let i=0;i<32;i++)synth.sequence(i*.12,i);
   ok(notes.length>20,'silent original music '+stage+'/'+boss);
   const signature=JSON.stringify(notes);
   ok(!musicSignatures.has(signature),'reused identical stage/boss composition '+stage+'/'+boss);
   musicSignatures.add(signature);
  }
  ok(musicSignatures.size===16,'eight stage themes and eight boss arrangements');

 ok(musicSource.includes('ancient resonant machinery'),'stage six original composition exists');
 // Simulate all 100 seeds across all six sectors (100 complete synthetic runs).
 // The ship is invulnerable to isolate spawn safety; this is not a human win-rate test.
 const live={runs:seeds.length,stageCases:0,terrainComplete:0,missed:[],
  maxEnemies:0,maxBullets:0,overlapFrames:0,eventsTriggered:0,simulationTicks:0,quietFrames:0,maxQuietFrames:0,quietFramesCurrent:0};
 for(const seed of seeds){
  for(const stage of [0,1,2,3,4,5,6,7]){
   const risk=stage===0?0:(seed>>>stage)&1;
   stageSetup(seed,stage,risk);live.quietFramesCurrent=0;
   G.stageTime=0;G.terrainIndex=0;q.resetTerrain();G.spawn=1.4;
   G.player.invul=10000;G.activeEvent=stage===0?null:q.routeOffer(stage-1,risk).event;
   G.eventTriggered=false;G.eventChain=false;
   G.particles=[];G.rings=[];G.trail=[];G.pickups=[];G.bullets=[];G.shots=[];
   const deadline=[62,68,74,72,76,80,84,90][stage];
   let ticks=0;
   while(G.stageTime<deadline+.2&&ticks++<1900){
    q.update(.05);
    live.simulationTicks++;
    // Every real-time sector should have combat targets with no long empty stretch.
    // This is a deterministic headless metric, not actual player/device performance.
    if(G.stageTime>2&&G.stageTime<deadline-3){
     const active=G.enemies.some(e=>e.hp>0&&e.x<1200&&e.x>-60);
     if(!active){live.quietFrames++;live.quietFramesCurrent++;live.maxQuietFrames=Math.max(live.maxQuietFrames,live.quietFramesCurrent)}
     else live.quietFramesCurrent=0;
    }
    live.maxEnemies=Math.max(live.maxEnemies,G.enemies.length);
    live.maxBullets=Math.max(live.maxBullets,G.bullets.length);
    if(G.terrain&&G.pendingWave)live.overlapFrames++;
    ok(G.enemies.length<=q.routeProfile().maxEnemies,'live enemy overflow');
    ok(G.bullets.length<=100,'live bullet overflow');
    if(G.boss)break;
   }
   live.stageCases++;
   if(G.eventTriggered)live.eventsTriggered++;
   if(G.terrainIndex===2)live.terrainComplete++;
   else live.missed.push({seed,stage,terrainIndex:G.terrainIndex,time:G.stageTime});
  }
 }
 ok(live.overlapFrames>0,'terrain and hostile waves should overlap safely');
 ok(live.maxQuietFrames<=30,'combat went idle for more than 1.5s');
 ok(live.missed.length===0,'terrain encounter missing in simulated run');
 stats.liveSimulation=live;
 stageSetup(seeds[0],0,0);
 for(let i=0;i<300;i++)q.bullet(900,200,Math.PI,300,5);
 stats.maxBullets=G.bullets.length;
 ok(!gameSource.includes('function drawWaveWarning()')&&!gameSource.includes('function drawSquadWarning()'),'red navigator cannot return');
 ok(G.bullets.length===100,'hostile bullet cap');
 G.bullets=[];G.player.invul=9999;
 q.update(.016);ok(G.shots.length>0,'auto fire regression');
 // The relative pad must not read layout on each pointermove (input lag).
 const originalPadRect=el('touchPad').getBoundingClientRect;let padRectReads=0;
 el('touchPad').getBoundingClientRect=function(){padRectReads++;return originalPadRect.call(this)};
 ok(el('game').width===1200&&el('game').height===675,'coarse pointer DPR cap');
 ev('touchPad','pointerdown',{clientX:50,clientY:100});
 const before=G.player.x;
 ev('touchPad','pointermove',{clientX:52,clientY:100});
 ok(G.player.x-before>1&&G.player.x-before<10,'small swipe accurate');
 ev('touchPad','pointermove',{clientX:100,clientY:100});
 ok(G.player.x>before+40,'touchpad latency');
 for(let j=0;j<12;j++)ev('touchPad','pointermove',{clientX:102+j,clientY:100});
 ok(padRectReads===1,'pointermove forced layout: touch geometry not cached');
 ev('touchPad','pointerup',{clientX:100,clientY:100});
 const stopped=G.player.x;
 q.update(.016);ok(Math.abs(G.player.x-stopped)<1,'touch release drift');
 // Stable linear gain, instant reverse, no drift when held.
 G.player.x=G.player.targetX=220;G.player.y=G.player.targetY=337;
 ev('touchPad','pointerdown',{clientX:45,clientY:110,timeStamp:1000});
 const ax=G.player.x;
 ev('touchPad','pointermove',{clientX:48,clientY:110,timeStamp:1016});
 const small=G.player.x-ax;
 ok(small>1&&small<12,'slow swipe precision');
 ev('touchPad','pointermove',{clientX:93,clientY:110,timeStamp:1032});
 ok(G.player.x-ax-small>small*6,'fast swipe higher reach');
 const hold=G.player.x;for(let n=0;n<5;n++)q.update(.016);
 ok(Math.abs(G.player.x-hold)<.1,'no movement while finger rests');
 ev('touchPad','pointermove',{clientX:86,clientY:110,timeStamp:1048});
 ok(G.player.x<hold,'immediate reversal');
 const back=G.player.x;
 ev('touchPad','pointermove',{clientX:133,clientY:110,timeStamp:1064});
 ok(G.player.x>back,'track beyond pad border');
 ev('touchPad','pointerup',{clientX:133,clientY:110,timeStamp:1080});
 ok(!gameSource.includes('function touchGain(dx,dy,dt)'),'remove unstable speed-dependent gain');
 // Same physical swipe must have identical travel regardless of input event rate.
 G.player.x=G.player.targetX=310;G.player.y=G.player.targetY=337;
 ev('touchPad','pointerdown',{clientX:40,clientY:90,timeStamp:1000});
 ev('touchPad','pointermove',{clientX:80,clientY:90,timeStamp:1001});
 const oneEvent=G.player.x-310;
 ev('touchPad','pointerup',{clientX:80,clientY:90});
 G.player.x=G.player.targetX=310;
 ev('touchPad','pointerdown',{clientX:40,clientY:90,timeStamp:2000});
 for(let k=1;k<=40;k++)ev('touchPad','pointermove',{clientX:40+k,clientY:90,timeStamp:2000+16*k});
 const fortyEvents=G.player.x-310;
 ok(Math.abs(oneEvent-fortyEvents)<.001,'stable finger displacement independent of sample rate');
 const noJump=G.player.x;
 ev('touchPad','pointerdown',{clientX:100,clientY:110,pointerId:2});
 ev('touchPad','pointermove',{clientX:290,clientY:210,pointerId:2});
 ok(Math.abs(G.player.x-noJump)<.001,'secondary finger cannot drive ship');
 ev('touchPad','pointermove',{clientX:80,clientY:90,timeStamp:2700});
 ok(G.player.x===noJump,'held finger without delta stays still');
 ev('touchPad','pointerup',{clientX:80,clientY:90});
 // Window resize must not interrupt the active pointer (orientation changes may).
 ev('touchPad','pointerdown',{clientX:40,clientY:90,timeStamp:4000});
 const resizeX=G.player.x;
 for(const handler of window.handlers?.resize||[])handler();
 ev('touchPad','pointermove',{clientX:48,clientY:90,timeStamp:4016});
 ok(G.player.x>resizeX,'browser toolbar resize does not cancel drag');
 ev('touchPad','pointerup',{clientX:48,clientY:90});
 // Simulate narrow portrait and wide landscape pad geometry without a browser.
 for(const [width,height] of [[120,280],[320,100]]){
  el('touchPad').getBoundingClientRect=function(){return {left:0,top:0,width,height}};
  G.player.x=G.player.targetX=300;G.player.y=G.player.targetY=300;
  ev('touchPad','pointerdown',{clientX:75,clientY:95});
  ok(G.player.x===300&&G.player.y===300,'touch start must never warp '+width);
  ev('touchPad','pointermove',{clientX:77,clientY:98});
  ok(G.player.x>300&&G.player.x<315,'fine X drag '+width);
  ok(G.player.y>300&&G.player.y<313,'fine Y drag '+height);
  ev('touchPad','pointercancel',{clientX:77,clientY:98});
  const holdX=G.player.x,holdY=G.player.y;
  ev('touchPad','pointermove',{clientX:100,clientY:110});
  ok(G.player.x===holdX&&G.player.y===holdY,'pointer cancel stops movement '+width);
 }
 el('touchPad').getBoundingClientRect=originalPadRect;
 ev('sidePauseBtn','click');ok(G.mode==='paused','pause');
 ok(el('sidePauseBtn').innerHTML.includes('<span>再開</span>'),'pause label');
 ev('sidePauseBtn','click');ok(G.mode==='playing','resume');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'resume label');
 // Regression: a real Android click must still reach both visible controls.
 G.selected=0;G.energy=0;
 q.update(.016);
 ok(el('sideEquipBtn').disabled===false,'empty equip must remain tappable');
 ok(el('sidePulseBtn').disabled===false,'NOVA must remain tappable');
 ok(el('equipActionState').textContent.includes('0/1'),'equip requirement displayed before collection');
 ev('sideEquipBtn','click');
 ok(G.energy===0&&G.levels[0]===0,'no free upgrade without capsule');
 ok(el('toast').textContent.includes('カプセル不足'),'shortage tap reports requirement');
 ev('sidePulseBtn','click');ok(G.pulses===1,'NOVA first touch fires');
 ev('sidePulseBtn','click');ok(G.pulses===0,'NOVA second touch fires');
 ok(el('sidePulseBtn').disabled===false,'NOVA empty state is still tappable');
 ok(el('novaActionState').textContent.includes('補充まで'),'NOVA status shows recharge countdown');
 ev('sidePulseBtn','click');
 ok(G.pulses===0&&el('toast').textContent.includes('再充填まで'),'empty NOVA tap reports remaining time');
 G.pulses=1;G.pulseRecharge=0;q.update(.016);
 G.pulses=0;G.pulseRecharge=59.85;G.mode='playing';
 G.bossDone=true;G.transitioning=false;G.terrainIndex=2;G.terrain=null;
 G.enemies=[];G.shots=[];G.bullets=[];G.pickups=[];G.player.invul=100;
 q.update(.1);ok(G.pulses===0,'NOVA does not refill early');
 q.update(.1);ok(G.pulses===1&&G.pulseRecharge<.06,'NOVA regenerates each 60 active seconds');
 G.pulses=5;G.pulseRecharge=20;q.update(.05);
 ok(G.pulses===5&&G.pulseRecharge===0,'NOVA charge does not overflow');
 G.pulses=1;G.pulseRecharge=0;G.bossDone=false;
 G.energy=6;q.update(.016);
 ok(el('sideEquipBtn').disabled===false,'equipped upgrade tap receives native click');
 ev('sideEquipBtn','click');ok(G.levels[0]===1,'upgrade');
 ok(G.energy===5,'upgrade deducts the selected cost');
 ok(el('equipActionState').textContent.includes('5/1'),'upgrade status refreshes after purchase');
 ev('titleReturnBtn','click');ok(G.mode==='title','title');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'title label reset');
 ev('startBtn','click');ok(G.mode==='playing','restart');
 ok(G.player.hp===2&&G.lives===2&&G.pulses===1,'new run limited hull and lives');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'restart label reset');
 ev('soundBtn','click');ok(audioStats.starts>0,'BGM start');
 const priorSeed=G.runSeed;

 // Cosmetic unlocks never modify player power.
 const medalBefore=[G.player.hp,G.lives,G.pulses,G.energy,...G.levels];
 ok(q.MEDALS.length===4,'four cosmetic unlocks');
 ok(q.unlockMedal('first'),'first boss medal');
 ok(!q.unlockMedal('first'),'no duplicate medal');
 ok(!q.unlockMedal('invalid'),'invalid medal rejected');
 ok(q.unlockMedal('risk'),'risk medal');
 ok(q.unlockMedal('graze'),'graze medal');
 ok(q.readMedals().unlocked.length===3,'medals persist');
 ev('medalBtn','click');ok(q.readMedals().active==='risk','badge cycles');
 ok(JSON.stringify([G.player.hp,G.lives,G.pulses,G.energy,...G.levels])===JSON.stringify(medalBefore),'no permanent stats');
 // Rank-by-rank effect and checkpoint regression; no touchpad/HUD changes.
 G.mode='playing';G.stage=0;G.routeRisk=0;G.routeHistory=[];G.rewardHistory=[];
 G.passives=[0,0,0,0,0,0];G.bossDone=true;G.terrainIndex=2;G.terrain=null;
 G.enemies=[];G.bullets=[];G.shots=[];G.pickups=[];G.particles=[];G.rings=[];
 G.player.invul=999;G.stageTime=3;G.fireTimer=0;G.missileTimer=100;
 q.update(.016);const baseFire=G.fireTimer;
 G.passives[0]=2;G.fireTimer=0;q.update(.016);
 ok(G.fireTimer<baseFire*.8,'rapid fire rank 2');
 G.passives[1]=2;
 ok(q.pickupMagnetRadius()===q.routeProfile().magnet+140,'magnet radius');
 ok(q.pickupPullSpeed()===380,'magnet pull speed');
 G.passives[2]=2;G.driveCharge=0;G.overdrive=0;
 q.chargeDrive(10);ok(Math.abs(G.driveCharge-14.4)<.001,'capacitor drive gain');
 G.passives[3]=1;G.player.shield=0;G.stage=0;G.bossDone=true;
 q.nextStage();ok(G.player.shield===1&&G.stage===1,'plating next sector');
 G.passives[4]=2;G.pulses=2;G.enemies=[{hp:1000,x:800,y:300}];G.boss={hp:1000};
 q.pulse();ok(G.enemies[0].hp===880&&G.boss.hp===824,'pulse amplifier');
 G.boss=null;G.enemies=[];G.passives[5]=2;
 ok(Math.abs(q.salvageRate()-(q.routeProfile().pickupRate+.05))<.001,'salvage chance');
 // 15/36: weapon/passive synergy activation and bounded effects.
 G.enemies=[];G.boss=null;G.shots=[];G.bullets=[];G.particles=[];G.rings=[];
 G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
 for(const [stage,risk,rate] of [[0,0,.08],[1,0,.12],[1,1,.075]]){
  G.stage=stage;G.routeRisk=risk;
  ok(Math.abs(q.salvageRate()-rate)<.00001,'base loot chance '+stage+'/'+risk);
 }
 G.stage=0;G.routeRisk=0;
 ok(q.SYNERGIES.length>=5,'at least five unique synergies');
 for(let i=0;i<q.SYNERGIES.length;i++){
  const s=q.SYNERGIES[i];
  ok(!q.synergyActive(i),'synergy inactive '+i);
  G.levels[s.weapon]=1;ok(!q.synergyActive(i),'synergy requires passive '+i);
  G.passives[s.passive]=1;ok(q.synergyActive(i),'synergy activates '+i);
  G.levels[s.weapon]=0;ok(!q.synergyActive(i),'synergy requires weapon '+i);
  G.passives[s.passive]=0;
 }
 G.levels[1]=1;G.passives[0]=2;G.shots=[];q.playerFire();
 ok(G.shots.filter(s=>s.kind==='spread').length===4,'spread bonus two pellets');
 G.passives[0]=0;G.shots=[];q.playerFire();
 ok(G.shots.filter(s=>s.kind==='spread').length===2,'spread baseline');
 G.levels=[0,0,1,0,0,0];G.passives=[0,0,2,0,0,0];G.driveCharge=0;G.overdrive=0;
 const laser={kind:'laser',x:100,y:100};q.applyShotSynergy(laser,{});
 ok(laser.driveCharged&&Math.abs(G.driveCharge-1.4*1.44)<.001,'laser first-hit charge');
 const charged=G.driveCharge;q.applyShotSynergy(laser,{});
 ok(G.driveCharge===charged,'laser charges once per shot');
 G.levels=[0,0,0,1,0,0];G.passives=[0,0,0,0,2,0];
 G.enemies=[{x:400,y:300,hp:100},{x:440,y:315,hp:100},{x:850,y:600,hp:100}];
 const missile={kind:'missile',x:400,y:300};q.applyShotSynergy(missile,G.enemies[0]);
 ok(G.enemies[0].hp===100&&G.enemies[1].hp===74&&G.enemies[2].hp===100,'missile bounded splash');
 q.applyShotSynergy(missile,G.enemies[0]);ok(G.enemies[1].hp===74,'missile single splash');
 G.levels=[0,0,0,0,1,0];G.passives=[0,1,0,0,0,0];
 G.enemies=[{x:420,y:350,hp:100}];
 const drone={kind:'drone',x:100,y:200,vx:890,vy:0};q.steerDrone(drone,.1);
 ok(drone.vy>0&&Number.isFinite(drone.vx)&&Math.hypot(drone.vx,drone.vy)<=900,'drone bounded homing');
 G.passives[1]=0;const noTrack={kind:'drone',x:100,y:200,vx:890,vy:0};q.steerDrone(noTrack,.1);
 ok(noTrack.vy===0,'drone baseline');
 G.levels=[0,0,0,0,0,1];G.passives=[0,0,0,1,0,0];G.player.shield=2;G.player.invul=0;
 G.bullets=[{x:G.player.x+50,y:G.player.y,life:2,size:5},{x:G.player.x+300,y:G.player.y,life:2,size:5}];
 q.hitPlayer(1);
 ok(G.player.shield===1&&G.bullets[0].life===0&&G.bullets[1].life===2,'shield burst selective clear');
 G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,2];const baseSalvage=q.salvageRate();
 G.levels[0]=1;ok(Math.abs(q.salvageRate()-(baseSalvage+.04))<.001,'boost salvage bonus');
 ok(q.synergySummary().includes('加速回収'),'synergy status tooltip');
 G.levels=[0,0,0,0,0,0];ok(!q.synergySummary(),'synergy deactivation');
 G.enemies=[];G.bullets=[];G.shots=[];G.rings=[];G.particles=[];G.player.invul=999;
 G.stage=0;G.routeRisk=0;G.routeHistory=[];G.rewardHistory=[];
 G.passives=[1,2,0,1,0,2];G.player.hp=3;G.player.shield=1;
 G.mode='playing';G.driveCharge=12;G.lives=3;G.energy=0;G.pulses=2;
 G.levels=[0,0,0,0,0,0];G.eventCount=0;G.grazes=0;G.maxCombo=0;G.killCount=0;G.score=0;G.runSeed=123;
 q.saveCheckpoint('sector');const saved=q.readCheckpoint();
 ok(JSON.stringify(saved?.passives)===JSON.stringify(G.passives),'passive checkpoint');
 const legacy={...saved};delete legacy.passives;
 storage.setItem('star_fighter_checkpoint_v1',JSON.stringify(legacy));
 ok(q.readCheckpoint()?.passives===undefined,'old checkpoint accepted');
 storage.setItem('star_fighter_checkpoint_v1',JSON.stringify({...saved,passives:[9,0,0,0,0,0]}));
 ok(q.readCheckpoint()===null,'corrupt passive checkpoint rejected');
 storage.setItem('star_fighter_checkpoint_v1',JSON.stringify(saved));
 ev('titleReturnBtn','click');ev('continueBtn','click');
 ok(JSON.stringify(G.passives)===JSON.stringify(saved.passives),'passive restore');
 G.passives=[0,0,0,0,0,0];G.stage=0;G.routeRisk=0;G.routeHistory=[];G.rewardHistory=[];
 G.player.hp=3;G.player.shield=0;G.lives=3;G.energy=0;G.pulses=2;G.driveCharge=0;
 G.boss=null;G.bossDone=false;G.transitioning=false;G.terrain=null;G.terrainIndex=2;G.mode='playing';

 ok(gameSource.includes("G.stageTime-dt)/23"),'not nine second guaranteed capsules');
 ok(gameSource.includes("e.type==='carrier'?.40:salvageRate()"),'carriers not guaranteed capsules');
 const rewardTypes=new Set();
 for(let j=0;j<100;j++){
  G.runSeed=j*1234567>>>0;
  const a=q.rewardOptions(),b=q.rewardOptions();
  ok(a.length===3&&new Set(a.map(x=>x.id)).size===3,'reward uniqueness '+j);
  ok(JSON.stringify(a)===JSON.stringify(b),'reward seed determinism '+j);
  ok(a.some(o=>o.id.startsWith('passive_')),'draft passive guarantee '+j);
  for(const offer of a)rewardTypes.add(offer.id);
 }
 ok(rewardTypes.size>=5,'insufficient reward variety');
 ok(q.PASSIVES.length===6,'six passive modules');
 for(let i=0;i<6;i++){
  let found=false;
  for(let j=0;j<240;j++){
   G.passives=[0,0,0,0,0,0];G.runSeed=Math.imul(j+1,239017)>>>0;
   if(q.rewardOptions().some(o=>o.id==='passive_'+i)){found=true;break}
  }
  ok(found,'passive never offered '+i);
 }
 G.passives=[2,2,2,2,2,2];
 G.energy=6;G.pulses=5;G.player.shield=5;G.player.hp=3;G.lives=3;G.driveCharge=100;G.levels=[2,3,2,2,3,3];
 const capped=q.rewardOptions();
 ok(capped.length===3&&capped.every(o=>o.id.startsWith('score')),'capped resources must have three usable rewards');
 // 16/36: 2,000-seed per-route rarity/risk sampling and full grant effects.
 const specialSeen=new Set(),specialCounts={safe:0,storm:0};
 G.stage=1;G.passives=[0,0,0,0,0,0];G.levels=[0,0,0,0,0,0];
 G.player.hp=2;G.player.shield=2;G.lives=2;G.energy=2;G.pulses=2;G.driveCharge=10;
 for(const [risk,key] of [[0,'safe'],[1,'storm']]){
  G.routeRisk=risk;
  for(let j=0;j<2000;j++){
   G.runSeed=Math.imul(j+1,0x9e3779b9)>>>0;
   const offers=q.rewardOptions();
   ok(offers.length===3&&new Set(offers.map(o=>o.id)).size===3,'risk draft uniqueness '+key+'/'+j);
   ok(JSON.stringify(offers)===JSON.stringify(q.rewardOptions()),'risk draft deterministic '+key+'/'+j);
   ok(offers.some(o=>o.id.startsWith('passive_')),'risk draft passive '+key+'/'+j);
   const specials=offers.filter(o=>o.rarity==='rare'||o.rarity==='route');
   ok(specials.length<=1,'too many rare offers '+key+'/'+j);
   if(specials.length)specialCounts[key]++;
   for(const o of specials){
    specialSeen.add(o.id);
    ok(!(risk===0&&o.id.startsWith('storm_')),'storm reward on supply route');
    ok(!(risk===1&&o.id.startsWith('safe_')),'supply reward on storm route');
    ok(o.tradeoff===false||o.desc.includes(' / '),'rare cost not visible '+o.id);
   }
  }
 }
 stats.rewardSpecialCounts={...specialCounts};stats.specialRewardTypes=specialSeen.size;
 ok(specialCounts.storm>specialCounts.safe*1.5,'storm reward probability must exceed safe');
 ok(specialCounts.safe>=270&&specialCounts.safe<=610,'safe reward rate out of bounds');
 ok(specialCounts.storm>=680&&specialCounts.storm<=1040,'storm reward rate out of bounds');
 for(const id of ['rare_arsenal','rare_reactor','rare_rescue','rare_focus','storm_bounty','storm_gamble','safe_refit','safe_supply']){
  ok(specialSeen.has(id),'special reward unreachable '+id);
 }
 // Test each grant with a real route-gate transition and valid checkpoint.
 const expected={
  rare_arsenal:[2,1,2,2,2,0,0,0],
  rare_reactor:[0,1,2,3,2,45,0,0],
  rare_rescue:[0,2,0,2,3,0,0,0],
  rare_focus:[0,2,2,1,2,15,1,0],
  storm_bounty:[0,1,5,2,2,25,0,0],
  storm_gamble:[1,2,2,2,1,25,0,0],
  safe_refit:[0,3,2,2,3,0,0,0],
  safe_supply:[0,2,3,3,2,0,0,0]
 };
 for(const [id,want] of Object.entries(expected)){
  const risk=id.startsWith('storm_')?1:0;
  G.stage=1;G.routeRisk=risk;G.mode='reward';G.runSeed=1234;
  G.routeHistory=[{stage:2,route:'test',risk,event:'cache',eventName:'cache',chain:false}];
  G.rewardHistory=[{stage:0,id:'score',name:'score'}];
  G.player.hp=2;G.player.shield=2;G.lives=2;G.energy=2;G.pulses=2;G.driveCharge=0;G.overdrive=0;
  G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
  G.rewardOffers=[{id,name:id,levelIndex:1,passiveIndex:0}];
  q.chooseReward(0);
  ok(G.mode==='route'&&G.rewardHistory.length===2,'special claim route checkpoint '+id);
  const got=[G.levels[1],G.player.shield,G.energy,G.pulses,G.player.hp,G.driveCharge,G.passives[0],G.lives-2];
  const exp=[...want];if(id==='rare_rescue')exp[7]=1;
  ok(JSON.stringify(got)===JSON.stringify(exp),'special effect '+id+': '+JSON.stringify(got));
  ok(q.readCheckpoint()?.mode==='route','special reward checkpoint '+id);
 }
 G.stage=1;G.routeRisk=1;G.player.hp=1;G.player.shield=0;G.energy=0;G.pulses=0;
 G.passives=[2,2,2,2,2,2];G.levels=[2,3,2,2,3,3];
 for(let j=0;j<250;j++){
  G.runSeed=j+1;
  ok(!q.rewardOptions().some(o=>o.tradeoff),'unaffordable tradeoff must not be offered');
 }
 G.stage=0;G.routeRisk=0;G.routeHistory=[];G.rewardHistory=[];G.mode='playing';
 G.energy=0;G.pulses=2;G.player.shield=0;G.player.hp=3;G.lives=3;G.driveCharge=0;G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
 // The reduced hull and scarce free refills are permanent balance invariants.
 G.mode='playing';G.stage=0;G.player.hp=2;G.player.shield=0;G.pulses=1;
 q.stageClear();ok(G.player.hp===2&&G.pulses===1,'sector one no free full recovery');
 G.stage=1;G.player.hp=1;G.pulses=1;
 q.stageClear();ok(G.player.hp===2&&G.pulses===2,'critical rescue at sector two');
 G.bossDone=false;G.transitioning=false;G.mode='playing';
 G.stage=0;G.player.hp=2;G.player.shield=0;G.pulses=2;G.lives=2;G.player.invul=0;
 q.hitPlayer(1);ok(G.player.hp===1&&G.lives===2,'hull damage one');
 G.player.invul=0;q.hitPlayer(1);ok(G.player.hp===2&&G.lives===1,'lose a ship after two hits');
 G.player.invul=0;q.hitPlayer(1);G.player.invul=0;q.hitPlayer(1);
 ok(G.mode==='over','four unshielded hits end run');
 ev('startBtn','click');ok(G.mode==='playing'&&G.player.hp===2&&G.lives===2,'retry resets hull');
 // Stage eight: previous route choices affect events and final boss pressure.
 stageSetup(seeds[0],7,0);G.routeHistory=Array.from({length:7},(_,i)=>({risk:i%2,stage:i+2}));
 G.activeEvent=q.routeOffer(6,0).event;G.eventTriggered=false;G.stageTime=31;G.terrainIndex=2;
 G.player.shield=0;G.driveCharge=0;G.spawn=10;
 q.update(.016);ok(G.eventTriggered&&G.player.shield===1&&G.driveCharge>=24,'final beacon history');
 stageSetup(seeds[0],7,1);G.routeHistory=Array.from({length:7},(_,i)=>({risk:1,stage:i+2}));
 G.activeEvent=q.routeOffer(6,1).event;G.eventTriggered=false;G.stageTime=31;G.terrainIndex=2;G.spawn=10;
 q.update(.016);ok(G.eventTriggered&&G.enemies.some(e=>e.eventDrop)&&G.enemies.length>=3,'final hunters history');
 G.routeRisk=1;G.stage=7;G.boss=null;q.spawnBoss();
 const highHp=G.boss.maxHp,highLegacy=G.boss.legacyRisk;G.boss=null;
 G.routeHistory=Array.from({length:7},(_,i)=>({risk:0,stage:i+2}));q.spawnBoss();
 ok(highLegacy===7&&G.boss.legacyRisk===0&&highHp>G.boss.maxHp,'final boss history pressure');
 G.boss=null;
 stageSetup(seeds[0],0,0);q.spawnBoss();G.boss.x=930;G.boss.t=2.8;G.boss.hp=G.boss.maxHp;
 q.update(.016);ok(G.boss.weakOpen,'cruiser exposed weak point');
 G.boss.fire=9;G.shots=[{x:G.boss.x+20,y:G.boss.y,px:0,py:0,vx:0,vy:0,life:1,dmg:20,pierce:1,kind:'shot'}];
 const openHp=G.boss.hp;q.update(.016);
 ok(Math.abs(openHp-G.boss.hp-33)<.01,'cruiser weak reactor deals 65 percent extra damage');
 G.boss.t=4.5;G.boss.fire=9;q.update(.016);ok(!G.boss.weakOpen,'cruiser shutter closes');
 G.shots=[{x:G.boss.x+20,y:G.boss.y,px:0,py:0,vx:0,vy:0,life:1,dmg:20,pierce:1,kind:'shot'}];
 const closedHp=G.boss.hp;q.update(.016);
 ok(Math.abs(closedHp-G.boss.hp-20)<.01,'closed reactor no extra damage');
 G.boss=null;
 stageSetup(seeds[0],7,1);G.routeHistory=Array.from({length:7},(_,i)=>({risk:1,stage:i+2}));
 q.spawnBoss();G.boss.x=930;G.boss.hp=G.boss.maxHp*.66;G.boss.fire=9;
 q.update(.016);ok(G.boss.phase===1,'final boss phase two');
 G.boss.hp=G.boss.maxHp*.30;q.update(.016);ok(G.boss.phase===2,'final boss phase three');
 G.boss.pattern=0;G.bullets=[];q.bossAttack(G.boss);
 ok(G.bullets.length>=8&&G.bullets.length<=16,'final third phase attack density');
 G.boss.pattern=3;G.boss.charge=0;q.bossAttack(G.boss);
 ok(G.boss.charge>0,'final third phase beam warning');
 G.boss=null;G.bullets=[];
 // Stage seven route-specific events.
 stageSetup(seeds[0],6,0);G.activeEvent=q.routeOffer(5,0).event;
 G.eventTriggered=false;G.terrainIndex=2;G.stageTime=30;G.driveCharge=0;G.spawn=10;
 q.update(.016);ok(G.eventTriggered&&G.driveCharge>=18,'stage seven phase echo');
 stageSetup(seeds[0],6,1);G.activeEvent=q.routeOffer(5,1).event;
 G.eventTriggered=false;G.terrainIndex=2;G.stageTime=30;G.spawn=10;
 q.update(.016);ok(G.eventTriggered&&G.enemies.some(e=>e.eventDrop),'stage seven hunters');
 // Stage six safe route restores defense; dangerous route spawns a loot-bearing elite.
 stageSetup(seeds[0],5,0);G.activeEvent=q.routeOffer(4,0).event;
 G.eventTriggered=false;G.terrainIndex=2;G.stageTime=26;G.player.shield=0;G.driveCharge=0;G.spawn=10;
 q.update(.016);
 ok(G.eventTriggered&&G.player.shield===1&&G.driveCharge>=12,'stage six archive effect');
 stageSetup(seeds[0],5,1);G.activeEvent=q.routeOffer(4,1).event;
 G.eventTriggered=false;G.terrainIndex=2;G.stageTime=26;G.spawn=10;
 q.update(.016);
 ok(G.eventTriggered&&G.enemies.some(e=>e.eventDrop),'stage six guardian event');
 G.routeRisk=0;G.routeHistory=Array.from({length:5},(_,i)=>({stage:i+2,route:'test',risk:0,event:'archive',eventName:'古代記録庫',chain:false}));
 G.rewardHistory=[];G.eventCount=0;G.player.hp=2;G.player.shield=0;G.lives=2;G.mode='playing';
 q.saveCheckpoint('sector');ok(q.readCheckpoint()?.stage===5,'stage six checkpoint');
 ev('titleReturnBtn','click');ev('continueBtn','click');
 ok(G.mode==='playing'&&G.stage===5,'stage six continue');
 stageSetup(seeds[0],0,0);G.routeHistory=[];G.rewardHistory=[];G.mode='playing';
 // Regression lock: never remove the route-selected creature bosses.
 // Safe stage 2: mechanical octopus. Storm stage 3: armored dinosaur.
 // Both inverse routes preserve original stage bosses.
 for(const [stage,risk,variant,name] of [
  [1,0,'octopus','KRAKEN ENGINE'],[1,1,'original','FORTRESS CORE'],
  [2,1,'dinosaur','IRON TYRANT'],[2,0,'original','ABYSS TITAN'],
  [0,0,'original','BATTLE CRUISER'],[3,0,'crab','MOLTEN CRAB'],[3,1,'solarwyrm','SOLAR WYRM'],[4,0,'mammoth','FROST MAMMOTH'],[4,1,'leviathan','GLACIAL LEVIATHAN'],[5,0,'centipede','RELIC CENTIPEDE'],[5,1,'warden','OBSIDIAN WARDEN'],[6,0,'jellyfish','AETHER JELLYFISH'],[6,1,'riftmedusa','RIFT MEDUSA'],[7,0,'horizonark','HORIZON ARK'],[7,1,'singularity','SINGULARITY EMPEROR']
 ]){
  G.stage=stage;G.routeRisk=risk;G.bullets=[];G.enemies=[];
  ok(q.bossVariant()===variant,'boss route variant '+stage+'/'+risk);
  q.spawnBoss();ok(G.boss.variant===variant&&G.boss.name===name,'boss identity '+name);
  G.boss.x=930;G.boss.y=337;G.boss.t=1;
  for(let pattern=0;pattern<3;pattern++){
   G.boss.pattern=pattern;G.bullets=[];q.bossAttack(G.boss);
   ok(G.bullets.length>0&&G.bullets.length<=120,'boss pattern '+pattern+' '+name);
  }
  G.boss.phase=1;G.boss.pattern=3;G.boss.charge=0;G.boss.beam=0;
  q.bossAttack(G.boss);ok(G.boss.charge>0,'second phase beam warning '+name);
  G.boss.phase=0;G.boss.charge=0;G.boss.beam=0;
  q.drawScene();
  G.boss=null;G.bullets=[];
 }
 G.stage=0;G.routeRisk=0;G.mode='playing';G.runSeed=priorSeed;
 G.routeHistory=[];G.rewardHistory=[];G.player.y=337;G.player.targetY=337;
 for(let stage=0;stage<8;stage++){
  ok(G.stage===stage,'stage index '+stage);
  G.player.invul=999;G.enemies=[];G.bullets=[];G.terrain=null;G.pendingWave=null;
  const stopCount=audioStats.stops;
  q.spawnBoss();ok(!!G.boss,'boss spawn '+stage);
  G.boss.hp=0;q.update(.016);
  ok(G.mode==='playing'&&G.transitioning,'no turn stop after boss '+stage);
  ok(audioStats.stops===stopCount,'BGM remains active after boss '+stage);
  if(stage<7){
   ok(G.flowPhase==='reward'&&G.rewardOffers.length===3,'three rewards in flight '+stage);
   ok(q.readCheckpoint()?.mode==='reward','reward checkpoint '+stage);
   const prevRewards=G.rewardHistory.length;
   if(stage===0){
    ev('titleReturnBtn','click');ev('continueBtn','click');
    ok(G.mode==='playing'&&G.flowPhase==='reward','saved reward resumes into flight');
   }
   G.player.y=G.player.targetY=165;
   for(let i=0;i<80&&G.flowPhase==='reward';i++)q.update(.05);
   ok(G.mode==='playing'&&G.flowPhase==='route','continuous reward choice '+stage);
   ok(G.rewardHistory.length===prevRewards+1,'one award '+stage);
   ok(q.readCheckpoint()?.mode==='route','route checkpoint '+stage);
   const preserved=G.rewardHistory.length;
   if(stage===0){
    ev('titleReturnBtn','click');ev('continueBtn','click');
    ok(G.mode==='playing'&&G.flowPhase==='route'&&G.rewardHistory.length===preserved,'resume without double reward');
   }
   const risk=stage%2===0?1:0;
   G.player.y=G.player.targetY=risk?495:165;
   const continuousStops=audioStats.stops;
   for(let i=0;i<80&&G.transitioning;i++)q.update(.05);
   ok(G.mode==='playing'&&G.stage===stage+1,'no route screen '+stage);
   ok(G.routeRisk===risk,'steer into route '+stage);
   ok(G.routeHistory.length===stage+1,'history after route '+stage);
   ok(q.readCheckpoint()?.mode==='sector','next checkpoint '+stage);
   ok(audioStats.stops===continuousStops,'audio uninterrupted on route '+stage);
  }else{
   for(let i=0;i<60&&G.mode!=='win';i++)q.update(.05);
   ok(G.mode==='win','eight stage finale');
  }
 }
 ok(q.readMedals().unlocked.includes('clear'),'clear medal');
 ok(G.rewardHistory.length===7,'seven continuous rewards');
 ev('startBtn','click');ok(G.mode==='playing','new game after win');
 ok(G.passives.every(n=>n===0),'new run clears all passive ranks');
 ok(!!q.readCheckpoint(),'checkpoint exists');
 ev('titleReturnBtn','click');ok(G.mode==='title','title before continue');
 ev('continueBtn','click');ok(G.mode==='playing','checkpoint continue');
 G.player.invul=0;G.player.hp=1;G.lives=1;
 q.hitPlayer(1);ok(G.mode==='over','game over');
 ok(q.readCheckpoint()===null,'checkpoint cleared on game over');

 // 20/36: live weak-core collision and non-invulnerable shutters.
 for(const [risk,variant,coreX] of [[0,'octopus',-39],[1,'original',-20]]){
  stageSetup(seeds[4],1,risk);G.routeHistory=[{stage:2,risk,route:'test',event:'beacon',eventName:'test',chain:false}];
  q.spawnBoss();G.boss.x=930;G.boss.fire=9;G.boss.phase=0;
  G.boss.t=3.05;G.player.invul=999;G.player.x=215;G.player.y=337;
  q.update(.016);ok(G.boss.weakOpen,'second boss exposed core '+variant);
  const openHp=G.boss.hp;
  G.shots=[{x:G.boss.x+coreX,y:G.boss.y,px:0,py:0,vx:0,vy:0,life:1,dmg:20,pierce:1,kind:'shot'}];
  q.update(.016);ok(Math.abs(openHp-G.boss.hp-30)<.01,'second boss weak hit x1.5 '+variant);
  G.boss.t=5.05;G.boss.fire=9;G.shots=[];
  q.update(.016);ok(!G.boss.weakOpen,'second boss core closes '+variant);
  const closed=G.boss.hp;
  G.shots=[{x:G.boss.x+coreX,y:G.boss.y,px:0,py:0,vx:0,vy:0,life:1,dmg:20,pierce:1,kind:'shot'}];
  q.update(.016);ok(Math.abs(closed-G.boss.hp-20)<.01,'closed core still takes normal damage '+variant);
  G.boss.fire=0;G.boss.pattern=0;G.bullets=[];q.bossAttack(G.boss);
  ok(G.bullets.length>=4&&G.bullets.length<=12,'second boss readable first salvo '+variant);
  if(risk===1)ok(G.bullets.length===8,'fortress ring has four gaps');
  ok(G.boss.fire<=1.5,'second boss tempo '+variant);
  G.boss=null;G.shots=[];G.bullets=[];
 }
 // R1: Seven non-pausing route gates show boss, threat, event and reward.
 for(let stage=0;stage<7;stage++){
  const a=q.routeOffer(stage,0),b=q.routeOffer(stage,1);
  ok(a.bossName!==b.bossName,'different branch bosses '+stage);
  ok(a.threat!==b.threat,'different branch enemies and hazards '+stage);
  ok(a.event.id!==b.event.id,'different branch events '+stage);
  ok(a.bonus!==b.bonus,'different entry rewards '+stage);
  G.stage=stage;G.mode='playing';G.transitioning=true;G.flowPhase='route';
  G.routeOffers=[a,b];G.player.y=218;
  const shown=[];context.fillText=value=>shown.push(String(value));
  q.drawFlightGate();context.fillText=()=>{};
  for(const offer of [a,b]){
   ok(shown.some(s=>s.includes(offer.name)),'route name visible '+stage);
   ok(shown.some(s=>s.includes(offer.bossName)),'route boss visible '+stage);
   ok(shown.some(s=>s.includes(offer.threat)),'route threat visible '+stage);
   ok(shown.some(s=>s.includes(offer.event.short)),'route event visible '+stage);
   ok(shown.some(s=>s.includes(offer.bonus)),'route reward visible '+stage);
  }
  ok(G.mode==='playing'&&G.transitioning,'route remains live '+stage);
 }
 G.transitioning=false;G.flowPhase=null;G.routeOffers=[];
 
 // 21/36: third-stage bosses have distinct weak windows and bounded salvos.
 for(const [risk,variant,cx,cy,mult] of [[0,'original',-35,0,1.6],[1,'dinosaur',-137,-56,1.55]]){
  stageSetup(seeds[17],2,risk);
  G.routeHistory=[{stage:2,risk:0,route:'先行',event:'beacon',eventName:'先行',chain:false},
   {stage:3,risk,route:'選択',event:'beacon',eventName:'選択',chain:false}];
  G.player.invul=999;q.spawnBoss();G.boss.x=930;G.boss.fire=9;G.boss.t=1.85;
  q.update(.016);ok(G.boss.weakWarn,'third boss core telegraph '+variant);
  G.boss.t=2.8;G.boss.fire=9;q.update(.016);ok(G.boss.weakOpen,'third boss core opens '+variant);
  let hp=G.boss.hp;G.shots=[{x:G.boss.x+cx,y:G.boss.y+cy,px:0,py:0,vx:0,vy:0,life:1,dmg:20,pierce:1,kind:'shot'}];
  q.update(.016);ok(Math.abs(hp-G.boss.hp-20*mult)<.01,'third boss weak hit '+variant);
  G.boss.t=5.1;G.boss.fire=9;G.shots=[];q.update(.016);ok(!G.boss.weakOpen,'third boss core closes '+variant);
  hp=G.boss.hp;G.shots=[{x:G.boss.x+cx,y:G.boss.y+cy,px:0,py:0,vx:0,vy:0,life:1,dmg:20,pierce:1,kind:'shot'}];
  q.update(.016);ok(Math.abs(hp-G.boss.hp-20)<.01,'third boss closed core normal damage '+variant);
  for(let pattern=0;pattern<3;pattern++){
   G.boss.pattern=pattern;G.boss.phase=0;G.bullets=[];q.bossAttack(G.boss);
   ok(G.bullets.length>=4&&G.bullets.length<=10,'third boss readable salvo '+variant+'/'+pattern);
   ok(G.boss.fire>=1.1,'third boss interval '+variant+'/'+pattern);
  }
  G.boss.phase=1;G.boss.pattern=3;G.boss.charge=0;q.bossAttack(G.boss);
  ok(G.boss.charge>=.95,'third boss beam warning '+variant);
  q.drawScene();G.boss=null;G.bullets=[];G.shots=[];
 }
 // R2: 8-sector graph, 15 route nodes, 26 edges, and branch-specific save/resume.
 for(let stage=0;stage<8;stage++)for(const risk of (stage===0?[0]:[0,1])){
  const seed=seeds[(stage*11+risk)%100];stageSetup(seed,stage,risk);
  G.routeHistory=Array.from({length:stage},(_,i)=>{
   const branch=i===stage-1?risk:(i+stage)%2,offer=q.routeOffer(i,branch);
   return {stage:i+2,risk:branch,route:offer.name,event:offer.event.id,eventName:offer.event.name,chain:!!offer.chain};
  });
  G.routeRisk=stage?risk:0;G.rewardHistory=[];G.mode='playing';G.score=12345+stage;
  G.player.hp=2;G.player.shield=1;G.lives=2;G.pulses=1;G.pulseRecharge=17;G.energy=2;G.selected=1;
  G.levels=[1,1,0,0,0,0];G.passives=[0,1,0,0,0,0];G.driveCharge=36;G.grazes=0;G.maxCombo=0;G.killCount=0;G.eventCount=0;
  q.saveCheckpoint('sector');const cp=q.readCheckpoint();
  ok(cp?.stage===stage&&cp?.routeHistory.length===stage,'R2 save chain '+stage+'/'+risk);
  ev('titleReturnBtn','click');ev('continueBtn','click');
  ok(G.mode==='playing'&&G.stage===stage&&G.runSeed===seed,'R2 seed and stage resume '+stage+'/'+risk);
  ok(G.routeRisk===risk&&G.routeHistory.length===stage,'R2 route resume '+stage+'/'+risk);
  ok(G.pulses===1&&G.pulseRecharge===17&&G.energy===2,'R2 NOVA and resources resume '+stage+'/'+risk);
  ok(G.levels[0]===1&&G.passives[1]===1&&G.player.hp===2,'R2 build resume '+stage+'/'+risk);
  G.routeOffers=stage<7?[q.routeOffer(stage,0),q.routeOffer(stage,1)]:[];
  q.renderRouteMap();const map=el('routeMap').innerHTML;
  ok((map.match(/class="map-sector"/g)||[]).length===8,'R2 map sectors '+stage+'/'+risk);
  ok((map.match(/class="map-node /g)||[]).length===15,'R2 map nodes '+stage+'/'+risk);
  ok((map.match(/class="map-edge /g)||[]).length===26,'R2 map links '+stage+'/'+risk);
  ok((map.match(/class="map-node complete/g)||[]).length===stage,'R2 completed route '+stage+'/'+risk);
  if(stage<7)ok(map.includes(G.routeOffers[0].name)&&map.includes(G.routeOffers[1].name),'R2 map choices '+stage+'/'+risk);
  q.spawnBoss();ok(!!G.boss&&G.boss.name,'R2 boss after resume '+stage+'/'+risk);
  G.boss=null;G.bullets=[];G.shots=[];
 }
// 18/36: 100 deterministic builds sampled from actual projectile emission.
 // Twelve-second stationary-target expected DPS uses conservative hit weights;
 // theoretical time-to-kill is NOT measured human play or device performance.
 const builds=[];
 function estimate(levels,passives){
  G.levels=levels.slice();G.passives=passives.slice();G.stage=5;G.routeRisk=0;
  G.mode='playing';G.overdrive=0;G.shots=[];G.enemies=[];G.boss=null;
  G.trail=[{x:230,y:337}];G.player.x=G.player.targetX=230;G.player.y=G.player.targetY=337;
  q.playerFire();const primary=G.shots.slice();G.shots=[];q.missileFire();
  const missiles=G.shots.slice(),hit={shot:1,laser:.85,spread:.47,drone:.65,missile:.78};
  const weighted=arr=>arr.reduce((sum,p)=>sum+p.dmg*(hit[p.kind]||0),0);
  const interval=(levels[2]>0?.22:.165)*Math.pow(.88,passives[0]);
  const splash=q.synergyActive(2)?missiles.length*(10+8*passives[4])*.24/1.15:0;
  const dps=weighted(primary)/interval+weighted(missiles)/1.15+splash;
  return {dps,ttk6:5650/dps,projectiles:primary.length+missiles.length};
 }
 let rng=0x734b0ca5;const roll=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
 const caps=[2,3,2,2,3,3],baseline=estimate([0,0,0,0,0,0],[0,0,0,0,0,0]);
 ok(baseline.dps>100&&baseline.dps<130,'baseline DPS');
 for(let i=0;i<100;i++){
  const levels=i===0?caps.map(()=>0):i===1?caps.slice():i>=2&&i<8?caps.map((cap,j)=>j===i-2?cap:0):caps.map(cap=>roll()%(cap+1));
  const passives=i<8?caps.map(()=>0):i>=8&&i<14?caps.map((_,j)=>j===i-8?2:0):caps.map(()=>roll()%3);
  const v=estimate(levels,passives);
  ok(Number.isFinite(v.dps)&&v.dps>=baseline.dps*.96,'build lower than base '+i);
  ok(v.dps<1700&&v.ttk6>3&&v.ttk6<65,'DPS/TTK outlier '+i);
  ok(v.projectiles<=21,'projectile burst too large '+i);
  ok(Math.abs(estimate(levels,passives).dps-v.dps)<1e-8,'non-deterministic build '+i);
  for(const slot of [1,2,3,4])if(levels[slot]<caps[slot]){
   const stronger=levels.slice();stronger[slot]++;
   ok(estimate(stronger,passives).dps>=v.dps-1e-8,'upgrade reduces damage '+i+'/'+slot);
  }
  builds.push(v.dps);
 }
 builds.sort((a,b)=>a-b);
 const p10=builds[9],p50=builds[49],p90=builds[89];
 ok(p90/p10<6,'100-build power skew too high');
 ok(p50>baseline.dps*1.3,'builds not stronger than starter');
 stats.buildBalance={count:100,baseline:+baseline.dps.toFixed(1),min:+builds[0].toFixed(1),p10:+p10.toFixed(1),
  median:+p50.toFixed(1),p90:+p90.toFixed(1),max:+builds[99].toFixed(1),
  skew90to10:+(p90/p10).toFixed(2),theoreticalBoss6TtkMedian:+(5650/p50).toFixed(1),
  method:'actual projectile volleys, conservative hit weighting, 12s sustained, no overdrive'};
 G.shots=[];G.passives=[0,0,0,0,0,0];G.levels=[0,0,0,0,0,0];
 assert(stats.types.size>=13,'too few wave variants');
 return {...stats,types:stats.types.size,uniqueSeeds:seeds.length,audioStarts:audioStats.starts,
  seedRange:[seeds[0].toString(16),seeds[99].toString(16)]};
}
if(typeof module!=='undefined'&&require.main===module){
 const fs=require('node:fs');
 try{
  const result=runHarness(fs.readFileSync(__dirname+'/game.js','utf8'),fs.readFileSync(__dirname+'/music.js','utf8'),fs.readFileSync(__dirname+'/enemies_plus.js','utf8'));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
 }catch(e){process.stderr.write('FAIL '+(e.stack||e)+'\n');process.exitCode=1}
}

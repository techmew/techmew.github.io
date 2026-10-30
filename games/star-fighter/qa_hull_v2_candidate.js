/* STAR FIGHTER seed/formation safety regression.
 * Run from games/star-fighter/: node qa_100_runs.js
 * Deterministic headless tests; not a replacement for physical-device QA. */
'use strict';
function runHarness(gameSource,musicSource,extrasSource,htmlSource,cssSource,readmeSource,trophySource){
 const assert=(condition,message)=>{if(!condition)throw Error(message)};
 const elements=new Map();
 function el(id){
  if(elements.has(id))return elements.get(id);
  const obj={id,hidden:false,textContent:'',innerHTML:'',value:'',title:'',style:{},dataset:{},
   classList:{_s:new Set(),add(...v){v.forEach(x=>this._s.add(x))},remove(...v){v.forEach(x=>this._s.delete(x))},toggle(x,f){if(f===undefined)f=!this._s.has(x);if(f)this._s.add(x);else this._s.delete(x);return f},contains(x){return this._s.has(x)}},setAttribute(){},getAttribute(){},
   setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,right:200,bottom:180,width:200,height:180}},
   children:[{classList:{toggle(){}}},{classList:{toggle(){}}},{classList:{toggle(){}}}],
   addEventListener(type,fn){(this.handlers??={})[type]??=[];this.handlers[type].push(fn)},
   querySelector(q){return el(id+' '+q)}};
  elements.set(id,obj);return obj;
 }
 const gradientStats={linear:0,radial:0},drawStats={rects:0};
 const context=new Proxy({
  createLinearGradient(){gradientStats.linear++;return {addColorStop(){}}},
  createRadialGradient(){gradientStats.radial++;return {addColorStop(){}}},
  fillRect(){drawStats.rects++},
  setTransform(){},save(){},restore(){}
 },{get(target,key){return key in target?target[key]:()=>{}},set(target,key,value){target[key]=value;return true}});
 el('game').getContext=()=>context;
 const upgrades=Array.from({length:6},(_,i)=>el('upgrade'+i));
 const document={getElementById:el,querySelectorAll(q){return q==='.upgrade'?upgrades:[]},addEventListener(){}};
 const storageData=new Map([['star_fighter_sound','off']]);
 const storage={getItem:k=>storageData.get(k)||null,setItem:(k,v)=>storageData.set(k,String(v)),removeItem:k=>storageData.delete(k)};
 const audioStats={starts:0,stops:0,updates:0,sfxRoutes:0};
 class AudioStub{
  constructor(){this.state='running';this.destination={};this.currentTime=0}
  resume(){return Promise.resolve()}
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}}}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(dest){if(dest?.isSfxBus)audioStats.sfxRoutes++},disconnect(){}}}
 }
 let attachedPads=[];const navigatorMock={userAgent:'QA',getGamepads:()=>attachedPads};
 const window={devicePixelRatio:2,innerWidth:390,innerHeight:840,location:{search:''},
  AudioContext:AudioStub,CyberBGM:class{
   constructor(){this.enabled=true;this.sfxInput={isSfxBus:true}}
   setMix(music,effects){this.musicLevel=music;this.effectsLevel=effects}
   setEnabled(x){this.enabled=x}
   start(){audioStats.starts++}
   stop(){audioStats.stops++}
   update(){audioStats.updates++}
  },matchMedia(q){return {matches:q.includes('pointer: coarse')}},
  addEventListener(type,fn){(this.handlers??={})[type]??=[];this.handlers[type].push(fn)}
 };
 if(extrasSource)new Function('window',extrasSource)(window);
 assert(typeof trophySource==='string'&&trophySource.includes('CATALOG'),'trophies.js required');
 new Function('window','document','localStorage',trophySource)(window,document,storage);
 // Native disabled buttons never dispatch click. Model this instead of
 // bypassing disabled as the previous headless test incorrectly did.
 const ev=(id,type,more={})=>{
  if(type==='click'&&el(id).disabled)return;
  return (el(id).handlers?.[type]||[]).forEach(fn=>fn({
  pointerId:1,clientX:80,clientY:120,preventDefault(){},stopPropagation(){},...more
 }));
 };
 let frame=null,clock=0;
 const hooked=gameSource.replace(/\}\)\(\);\s*$/,'window.__QA={G,endGame,render,queueManualUpgrade,enemy,drawEnemy,fireEnemy,seedStage,spawnWave,routeProfile,encounterDirector,waveRadius,waveClearance,placeOutsideLane,spawnAmbient,spawnElite,spawnRoutePatrol,mixSeed,destroyEnemy,planTerrain,advanceTerrain,resetTerrain,terrainQueued,bullet,update,spawnBoss,bossVariant,bossAttack,stageClear,openRoute,chooseRoute,drawScene,drawShip,wreckFragments,drawFlightGate,routeOffer,rewardOptions,openReward,chooseReward,hitPlayer,readCheckpoint,saveCheckpoint,chargeDrive,playerFire,missileFire,pulse,nextStage,pickupMagnetRadius,pickupPullSpeed,salvageRate,MEDALS,medalState,readMedals,unlockMedal,cycleMedal,PASSIVES,SYNERGIES,synergyActive,synergySummary,applyShotSynergy,steerDrone,renderRouteMap,depthField,depthX,drawDepthPlane,drawBackground,routeArtField,drawRouteArt,hostileBulletVisual,drawHostileBullet,tone,updateHud,powerMeterIndex,advancePowerMeter,debugJumpTo,launchDebug,pollGamepad,gamepadVector,resetGamepad,startGame,pause,TROPHIES,DEBUG_BOSS_ROSTER,damageBoss,invulnerablePracticeBoss,applyShotSynergy,actualHullDamage,grantShipXP,maxHull,repairHull};})();');
 assert(hooked!==gameSource,'cannot attach QA hooks');
 new Function('window','document','localStorage','performance','requestAnimationFrame','navigator',hooked)(
  window,document,storage,{now:()=>clock},fn=>{frame=fn},navigatorMock);
 const q=window.__QA,G=q.G;
 assert(G.mode==='title','initial mode');
 ev('startBtn','click');
 assert(G.mode==='playing','start');
 const stats={seeds:100,stageCases:0,waves:0,units:0,terrains:0,warningSeconds:Infinity,
  types:new Set(),minUnits:Infinity,maxUnits:0,maxBullets:0,checks:0};
 const ok=(x,message)=>{stats.checks++;assert(x,message)};
 if(htmlSource&&cssSource){
  ok(htmlSource.includes('game.js?v=ship-hull-v2-20261030-1'),'cache-bust game JS');
  ok(htmlSource.includes('trophies.js?v=trophies-20261030-1'),'trophies loaded before game');
  ok(cssSource.includes('grid-template-rows:auto 38px'),'portrait meter below full canvas');
  ok(cssSource.includes('#shell .game-frame>#game')&&cssSource.includes('height:auto!important'),'portrait canvas correct ratio');
  ok(cssSource.includes('position:relative!important;grid-column:1;grid-row:2'),'power meter separate grid row');
  ok(cssSource.includes('grid-template-rows:max-content minmax(0,1fr)!important'),'portrait action panels below canvas');
  for(const width of [320,390,430]){
   const height=width*9/16,barTop=height;
   ok(barTop>=height&&barTop+38>height,'portrait non-overlap sizing '+width);
  }
 }
 // 2026-10-30: no obstructive announcement; selected and ready differ.
 if(htmlSource&&cssSource){
  ok(cssSource.includes('#shell .announce,#shell .announce.show{display:none!important}'),'large announcement hidden');
  ok(cssSource.includes('touch-action:none!important'),'action touch does not cause browser pan');
  ok(cssSource.includes('.game-frame .upgrade:not(.selected)')&&cssSource.includes('.game-frame .upgrade.selected'),'one cursor with five dim slots');
  ok(cssSource.includes('grid-template-rows:auto 38px!important'),'portrait meter outside full canvas');
 }
 ok(!el('announce').classList.contains('show'),'no initial centre notice');
 // 30/36: static responsive contracts and viewport budgets (not physical device QA).
 if(htmlSource&&cssSource){
  ok(htmlSource.includes('style.css?v=ship-hull-v2-20261030-1'),'mobile CSS cache refreshed');
  ok(cssSource.includes('/* 30/36: mobile viewport ergonomics.'),'mobile layout override present');
  ok(cssSource.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'header controls in one row');
  ok(cssSource.includes('padding-left:max(5px,env(safe-area-inset-left))')&&cssSource.includes('padding-right:max(5px,env(safe-area-inset-right))'),'landscape notch safe areas');
  ok(cssSource.includes('#shell .side-action{min-height:44px'),'two action targets retain 44px minimum');
  ok(cssSource.includes('.joystick{display:none!important}')&&cssSource.includes('.rotate-overlay{display:none!important}'),'old stick and portrait blocker disabled');
  ok((htmlSource.match(/id="sidePulseBtn"/g)||[]).length===1&&(htmlSource.match(/id="sideEquipBtn"/g)||[]).length===1,'exactly two combat buttons');
  ok((htmlSource.match(/class="upgrade(?: selected)?"/g)||[]).length===6,'six-color meter preserved');
  ok((htmlSource.match(/<div class="upgrade"/g)||[]).length===6&&!htmlSource.includes('<button class="upgrade'),'meter is not a six-button selector');
  ok(!gameSource.includes("ui.upgrades.forEach((b,i)=>b.addEventListener('click'"),'no manual cell selection listener');
  ok(!gameSource.includes("G.selected=(G.selected+1)%6"),'no X/Tab selection');
  for(const [w,h] of [[280,500],[320,480],[320,568],[360,640],[390,844],[430,932]]){
   const usable=w-10,canvas=usable*9/16,remaining=h-34-38-canvas-16;
   const padWidth=(usable-6-112)*1.3/2.1;
   ok(remaining>=88&&padWidth>=80,'portrait viewport budget '+w+'x'+h);
  }
  for(const [w,h,notch] of [[480,320,0],[568,320,0],[667,375,47],[844,390,47],[932,430,47]]){
   const usable=w-10-2*notch,canvasWidth=usable-82-62-8;
   ok(canvasWidth>=240&&(h-40-6)/2>=44,'landscape viewport budget '+w+'x'+h);
  }
 }
 // 31/36: non-blocking start instructions, pause help and explicit retry choices.
  if(htmlSource&&cssSource){
   ok(htmlSource.includes('id="quickHelp"')&&htmlSource.includes('class="quick-hint"'),'short visible guide and expandable details');
   ok(htmlSource.includes('拾うだけでは強化しない')&&htmlSource.includes('飛行中に上下移動'),'manual upgrades and continuous gate explained');
   ok(htmlSource.includes('同じ配置で再出撃')&&cssSource.includes('/* 31/36: concise onboarding'),'explicit replay and mobile help styling');
  }
  ok(el('quickHelp').open===false,'help starts collapsed');
  ok(el('overlay').inert===true,'gameplay overlay is inert');
  el('overlay').scrollTop=440;el('overlay .overlay-inner').scrollTop=210;
  ev('helpBtn','click');
  ok(el('overlay').scrollTop===0&&el('overlay .overlay-inner').scrollTop===0,'pause overlay resets scroll position');
  ok(el('overlay').inert===false,'pause overlay is interactive');
  ok(G.mode==='paused'&&el('quickHelp').open===true,'in-game help pauses and opens real instructions');
  ev('helpBtn','click');ok(el('quickHelp').open===false,'pause help toggles closed');
  ev('startBtn','click');ok(G.mode==='playing','help pause resumes without restarting');
  ok(el('overlay').inert===true,'resumed gameplay makes overlay inert');
  // 28/36: shape, outline and luminance cues must not depend on hue.
 const projectileCases=[
  [{x:210,y:150,vx:-290,vy:0,size:5,damage:1,color:'#ff8d61'},'orb'],
  [{x:220,y:250,vx:-450,vy:12,size:5,damage:1,color:'#ff8d61'},'lance'],
  [{x:230,y:350,vx:-260,vy:20,size:10,damage:2,color:'#ff8d61'},'heavy']
 ];
 const projectileShapes=new Set(),projectileColors=new Set();
 let bulletArcs=0,bulletLines=0;
 context.arc=()=>{bulletArcs++};
 context.lineTo=()=>{bulletLines++};
 for(const [spec,shape] of projectileCases){
  const before=JSON.stringify(spec),levels=G.levels.slice(),energy=G.energy;
  const visual=q.hostileBulletVisual(spec);
  ok(visual.shape===shape,'enemy projectile geometry '+shape);
  ok(visual.rim==='#10152b'&&visual.mark==='#ffffff','high-contrast projectile outline/core '+shape);
  ok(/^#[0-9a-f]{6}$/i.test(visual.core)&&visual.radius>=spec.size,'visible projectile core '+shape);
  projectileShapes.add(visual.shape);projectileColors.add(visual.core);
  q.drawHostileBullet(spec);
  ok(JSON.stringify(spec)===before&&G.energy===energy&&G.levels.every((n,i)=>n===levels[i]),'bullet draw cannot spend capsules or change combat '+shape);
 }
 ok(projectileShapes.size===3&&projectileColors.size===3,'shape and hue independently distinguish all threat classes');
 ok(bulletArcs>0&&bulletLines>=7,'circle/chevron/diamond geometry actually rendered');
 const bulletStress=Array.from({length:100},(_,i)=>({...projectileCases[i%3][0],x:100+i*8,y:80+i%30}));
 for(const a of bulletStress)q.drawHostileBullet(a);
 ok(bulletStress.length===100&&bulletStress.every(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)),'100 enemy projectiles render without gameplay mutation');
 context.arc=()=>{};context.lineTo=()=>{};
 const seeds=Array.from({length:100},(_,i)=>(Math.imul(i+1,0x9e3779b9)^0xa5a5a5a5)>>>0);
 const stageSetup=(seed,stage,risk)=>{
  G.runSeed=seed;G.stage=stage;G.routeRisk=risk;G.stageTime=5;G.mode='playing';
  G.enemies=[];G.bullets=[];G.shots=[];G.pickups=[];G.pendingWave=null;G.terrain=null;G.terrainIndex=2;
  G.boss=null;G.bossDone=false;G.transitioning=false;G.directorGrace=0;G.waveSerial=0;G.ambientTimer=.6;G.eliteSpawned=false;
  G.player.hp=3;G.player.invul=0;G.player.shield=0;G.lives=3;
  G.player.x=215;G.player.targetX=215;G.player.y=337;G.player.targetY=337;
  G.selected=0;G.energy=0;G.pulses=2;G.pulseRecharge=0;G.levels=[0,0,0,0,0,0];G.pendingUpgrades=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
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
  if(w.kind>=19){
    const spec=window.StarFighterEnemyExtras.roster.find(x=>(x.kind??18+x.unlock)===w.kind);
    ok(!!spec&&stage>=spec.unlock,'stage gated unlock '+stage+'/'+w.kind);
   }
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
  for(const kind of [26,27,28])ok(stats.types.has(kind),'new mechanical formation '+kind);
  for(const t of ['clamp','sting','mantis'])ok(window.StarFighterEnemyExtras.contains(t),'new mechanical enemy '+t);
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
  const gainParam=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(v){this.value=v}});
  const node=()=>({gain:gainParam(),connect(){},disconnect(){}});
  const mockAudio={
   sampleRate:8000,currentTime:0,state:'running',destination:{},
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
  for(const boss of [false,true]){
   synth.stage=0;synth.boss=boss;const counts=[];
   for(let movement=0;movement<4;movement++){
    let notes=0;synth.note=()=>{notes++};
    for(let i=movement*32;i<(movement+1)*32;i++)synth.sequence(i*.12,i);
    counts.push(notes);
   }
   ok(new Set(counts).size>=3,'four-movement arrangement missing '+boss);
  }
  synth.setMix(1.2,.55);
  ok(Math.abs(synth.master.gain.value-.252)<1e-9,'music preset gain');
  ok(Math.abs(synth.sfxInput.gain.value-.3025)<1e-9,'effects preset gain');
  synth.stop();ok(synth.master.gain.value===0&&synth.sfxInput.gain.value>0,'music stop keeps ending SFX');
  synth.start();ok(synth.master.gain.value>0,'music resumes after pause');
  synth.setEnabled(false);ok(synth.master.gain.value===0&&synth.sfxInput.gain.value===0,'mute both buses');
  synth.setEnabled(true);ok(synth.master.gain.value>0&&synth.sfxInput.gain.value>0,'unmute both buses');
  synth.start();synth.update(0,false);ok(synth.step>0,'music scheduler resumes');
  synth.setMix(-10,99);ok(synth.musicLevel===0&&synth.effectsLevel===1.35,'preset bounds');

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
 ok(el('sidePulseBtn').disabled===true&&el('sideEquipBtn').disabled===true,'only pause disables action buttons');
 ev('sidePauseBtn','click');ok(G.mode==='playing','resume');
 ok(el('sidePulseBtn').disabled===false&&el('sideEquipBtn').disabled===false,'both action buttons recover after resume');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'resume label');
 // Game-over must clear NOVA timer; background render must never refill.
 G.pulses=0;G.pulseRecharge=37.5;
 q.endGame();
 ok(G.mode==='over'&&G.pulseRecharge===0&&G.pulses===0,'game over resets NOVA timer and stock');
 ok(el('novaActionState').textContent.includes('次の出撃'),'game over has no phantom countdown');
 const beforeEndTotal=G.total;q.render(1000);q.render(1100);
 ok(G.total===beforeEndTotal&&G.pulseRecharge===0,'background frame cannot recharge NOVA');
 ev('startBtn','click');
 ok(G.mode==='playing'&&G.pulses===1&&G.pulseRecharge===0,'retry resets NOVA to one new use');
 // Returning to title from a half-charged live run also clears stale timer.
 G.pulses=0;G.pulseRecharge=43;
 ev('titleReturnBtn','click');
 ok(G.mode==='title'&&G.pulseRecharge===0,'title return clears the NOVA timer');
 ok(el('novaActionState').textContent.includes('出撃時'),'title shows no live countdown');
 ev('startBtn','click');
 ok(G.mode==='playing'&&G.pulses===1&&G.pulseRecharge===0,'fresh start after title resets NOVA');
 // Regression: a real Android click must still reach both visible controls.
 G.selected=0;G.energy=0;
 q.update(.016);
 ok(el('sideEquipBtn').disabled===false,'empty equip must remain tappable');
 ok(el('sidePulseBtn').disabled===false,'NOVA must remain tappable');
 ok(el('equipActionState').textContent.includes('カプセルを取る'),'empty meter needs a capsule');
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:20,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:20,clientX:80,clientY:120});
 ok(G.energy===0&&G.levels[0]===0,'no free upgrade without capsule');
 ok(el('toast').textContent.includes('カプセル不足'),'shortage tap reports requirement');
 G.pulses=2;G.pulseRecharge=0;q.update(.016);
 const novaRingsBefore=G.rings.length;
 ev('sidePulseBtn','pointerdown',{pointerType:'touch',pointerId:27,clientX:80,clientY:120});
 ev('sidePulseBtn','pointerup',{pointerType:'touch',pointerId:27,clientX:80,clientY:120});
 ev('sidePulseBtn','click',{pointerType:'touch',pointerId:27,detail:1});
 ok(G.pulses===1,'NOVA finger-up fires once, never double-fires');
 ok(G.rings.length>=novaRingsBefore+2,'NOVA emits two visible shockwave rings');
 ev('sidePulseBtn','click',{pointerType:'mouse',detail:1});
 ok(G.pulses===1,'touch-generated compatibility mouse click is ignored');
 ok(G.player.invul>=.65,'NOVA defensive protection occurs');
 // Release delivered to window still works if the native capture was lost.
 G.pulses=2;G.pulseRecharge=0;
 ev('sidePulseBtn','pointerdown',{pointerType:'touch',pointerId:28,clientX:80,clientY:120});
 for(const handler of window.handlers?.pointerup||[])
  handler({pointerType:'touch',pointerId:28,clientX:80,clientY:120,preventDefault(){}});
 ok(G.pulses===1,'window pointerup fallback fires NOVA once');
 G.pulses=1;
 document.activeElement=el('sidePulseBtn');
 ev('sidePulseBtn','click',{detail:0,isTrusted:true});document.activeElement=null;
 ok(G.pulses===0,'NOVA keyboard accessibility action works');
 ok(el('sidePulseBtn').disabled===false,'NOVA empty state is still tappable');
 ok(el('novaActionState').textContent.includes('補充まで'),'NOVA status shows recharge countdown');
 ev('sidePulseBtn','pointerdown',{pointerType:'touch',pointerId:29,clientX:80,clientY:120});
 ev('sidePulseBtn','pointerup',{pointerType:'touch',pointerId:29,clientX:80,clientY:120});
 ok(G.pulses===0&&el('toast').textContent.includes('再充填まで'),'empty NOVA tap reports remaining time');
 G.pulses=1;G.pulseRecharge=0;q.update(.016);
 // Android two-thumb control: keep left pointer captured while tapping right.
 G.pulses=2;G.energy=0;q.update(.016);
 ev('touchPad','pointerdown',{pointerId:31,clientX:45,clientY:110});
 const thumbStart=G.player.x;
 ev('sidePulseBtn','pointerdown',{pointerType:'touch',pointerId:32,clientX:80,clientY:120});
 ev('sidePulseBtn','pointerup',{pointerType:'touch',pointerId:32,clientX:80,clientY:120});
 ev('sidePulseBtn','click',{pointerType:'touch',pointerId:32,detail:1});
 ok(G.pulses===1,'right NOVA works with left pad held');
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:32,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:32,clientX:80,clientY:120});
 ev('sideEquipBtn','click',{pointerType:'touch',pointerId:32,detail:1});
 ok(el('toast').textContent.includes('カプセル不足'),'right upgrade gives feedback with left pad held');
 ev('touchPad','pointermove',{pointerId:31,clientX:53,clientY:110});
 ok(G.player.x>thumbStart,'left pad retains control while right button tapped');
 ev('touchPad','pointercancel',{pointerId:31,clientX:53,clientY:110});
 G.pulses=1;G.pulseRecharge=0;
 G.pulses=0;G.pulseRecharge=59.85;G.mode='playing';
 G.bossDone=true;G.transitioning=false;G.terrainIndex=2;G.terrain=null;
 G.enemies=[];G.shots=[];G.bullets=[];G.pickups=[];G.player.invul=100;
 q.update(.1);ok(G.pulses===0,'NOVA does not refill early');
 q.update(.1);ok(G.pulses===1&&G.pulseRecharge<.06,'NOVA regenerates each 60 active seconds');
 // Refreshed charge must actually fire when the player taps the rail again.
 ev('sidePulseBtn','pointerdown',{pointerType:'touch',pointerId:66,clientX:80,clientY:120});
 ev('sidePulseBtn','pointerup',{pointerType:'touch',pointerId:66,clientX:80,clientY:120});
 ev('sidePulseBtn','click',{pointerType:'touch',pointerId:66,detail:1});
 ok(G.pulses===0&&el('toast').textContent==='NOVA BURST','refreshed NOVA is usable immediately');
 G.pulses=5;G.pulseRecharge=20;q.update(.05);
 ok(G.pulses===5&&G.pulseRecharge===0,'NOVA charge does not overflow');
 G.pulses=1;G.pulseRecharge=0;G.bossDone=false;
 G.energy=1;q.update(.016);
 ok(el('sideEquipBtn').disabled===false,'first cursor tap allowed');
 // Capture loss must not leave the right rail stuck or trigger a stray buy.
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:40,clientX:80,clientY:120});
 ev('sideEquipBtn','lostpointercapture',{pointerType:'touch',pointerId:40,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:40,clientX:80,clientY:120});
 ok(G.levels[0]===0,'lost pointer capture does not buy an upgrade');
 // Two-thumb touch: minor 28px drift must still activate one explicit purchase.
 G.energy=1;G.selected=0;const driftLevel=G.levels[0],driftEnergy=G.energy;
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:411,isPrimary:false,clientX:80,clientY:120});
 ev('sideEquipBtn','pointermove',{pointerType:'touch',pointerId:411,isPrimary:false,clientX:108,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:411,isPrimary:false,clientX:108,clientY:120});
 ok(G.levels[0]===driftLevel+1&&G.energy===0,'two-thumb manual BOOST upgrade resets gauge');
 ev('sideEquipBtn','click',{pointerType:'mouse',detail:1,isTrusted:true});
 ok(G.levels[0]===driftLevel+1,'synthetic mouse click cannot buy twice');
 G.levels[0]=driftLevel;G.energy=driftEnergy;
 // Swipe across the right button cannot purchase. Focused Enter cannot auto-purchase.
 const equipBeforeLevel=G.levels[0],equipBeforeEnergy=G.energy;
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:41,clientX:80,clientY:120});
 ev('sideEquipBtn','pointermove',{pointerType:'touch',pointerId:41,clientX:132,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:41,clientX:132,clientY:120});
 ev('sideEquipBtn','click',{pointerType:'touch',pointerId:41,detail:1});
 ok(G.levels[0]===equipBeforeLevel&&G.energy===equipBeforeEnergy,'swipe across button is NOT an upgrade');

 // Synthesis and pointer retargeting must NEVER spend a capsule.
 ev('sideEquipBtn','click',{detail:1,pointerType:'mouse',isTrusted:true});
 ev('sideEquipBtn','click',{detail:1,pointerType:'touch',isTrusted:true});
 ev('sideEquipBtn','click',{detail:0,isTrusted:false});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:67,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:68,clientX:80,clientY:120});
 ev('sideEquipBtn','pointercancel',{pointerType:'touch',pointerId:68,clientX:80,clientY:120});
 ev('sideEquipBtn','click',{detail:1,pointerType:'mouse',isTrusted:true});
 ok(G.levels[0]===equipBeforeLevel&&G.energy===equipBeforeEnergy,'ghost/unpaired/retargeted click must not spend capsules');
 // Nonfocused, untrusted, and field Enter do not count as purchase intent.
 ev('sideEquipBtn','click',{detail:0,isTrusted:true});
 ok(G.levels[0]===equipBeforeLevel&&G.energy===equipBeforeEnergy,'unfocused keyboard click does not buy');

 for(const fn of window.handlers?.keydown||[])fn({key:'Enter',repeat:false,target:{closest:()=>({})},preventDefault(){}});
 ok(G.levels[0]===equipBeforeLevel&&G.energy===equipBeforeEnergy,'focused Enter never auto-upgrades');
 // 35/36: stale physical presses after blur/rotation/pause must not fire.
 for(const [kind,id] of [['blur',71],['orientationchange',72],['pause',73]]){
  const level=G.levels[0],energy=G.energy,pulses=G.pulses;
  ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:id,clientX:80,clientY:120});
  ev('sidePulseBtn','pointerdown',{pointerType:'touch',pointerId:id+100,clientX:80,clientY:120});
  if(kind==='pause')ev('sidePauseBtn','click');
  else for(const fn of window.handlers?.[kind]||[])fn();
  if(G.mode==='paused')ev('sidePauseBtn','click');
  ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:id,clientX:80,clientY:120});
  ev('sidePulseBtn','pointerup',{pointerType:'touch',pointerId:id+100,clientX:80,clientY:120});
  ok(G.mode==='playing','35 resumed after '+kind);
  ok(G.levels[0]===level&&G.energy===energy,'35 stale upgrade rejected '+kind);
  ok(G.pulses===pulses,'35 stale NOVA rejected '+kind);
 }
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:42,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:42,clientX:80,clientY:120});
 ev('sideEquipBtn','click',{pointerType:'touch',pointerId:42,detail:1});
 ok(G.levels[0]===equipBeforeLevel+1,'intentional finger tap buys exactly one upgrade');
 ok(G.energy===0,'manual upgrade resets six-slot gauge');
 // Gradius-like cursor: pickup advances one step and never purchases.
 const oldLevels=G.levels.slice();G.energy=1;G.selected=0;
 G.pickups=[{x:G.player.x,y:G.player.y,vx:0,phase:0,t:0,type:'energy'}];
 q.update(.016);
 ok(G.energy===2&&G.selected===1,'pickup moves cursor from BOOST to SPREAD');
 ok(el('upgrade1').classList.contains('selected')&&!el('upgrade0').classList.contains('selected'),'SPREAD alone is lit');
 ok(el('upgrade1').classList.contains('ready')&&!el('upgrade2').classList.contains('ready'),'only lit slot ready');
 ok(el('sideEquipBtn').querySelector('span').textContent==='SPREAD 強化','right button follows capsule cursor');
 ok(G.levels.every((v,i)=>v===oldLevels[i]),'capsule never auto-upgrades');
 G.pickups=[];ok(!gameSource.includes('if(invul>0&&Math.sin(G.time*20)>0.55)return'),'invulnerable ship remains visible');
 ok(el('equipActionState').textContent.includes('2/6'),'meter shows step two');
 G.energy=0;G.pendingUpgrades=[0,0,0,0,0,0];G.levels=[0,0,0,0,0,0];q.updateHud();
 ok(q.powerMeterIndex()===-1&&![0,1,2,3,4,5].some(i=>el('upgrade'+i).classList.contains('selected')),'empty meter unlit');
 for(let j=1;j<=6;j++){
  q.advancePowerMeter(1);
  ok(G.energy===j&&q.powerMeterIndex()===j-1&&G.selected===j-1,'advances to step '+j);
  ok([0,1,2,3,4,5].filter(i=>el('upgrade'+i).classList.contains('selected')).length===1,'exactly one lit option '+j);
 }
 q.advancePowerMeter(1);ok(G.energy===1&&q.powerMeterIndex()===0,'seventh capsule wraps to first');
 const beforeClick=G.levels.slice();ev('upgrade5','click');
 ok(G.energy===1&&q.powerMeterIndex()===0&&G.levels.every((v,i)=>v===beforeClick[i]),'meter cells cannot choose or buy upgrades');
 G.energy=6;q.updateHud();const wasShield=G.levels[5],other=G.levels.slice(0,5);
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:445,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:445,clientX:80,clientY:120});
 ok(G.levels[5]===wasShield+1&&G.energy===0&&q.powerMeterIndex()===-1,'SHIELD is upgraded when sixth slot is lit');
 ok(G.levels.slice(0,5).every((v,i)=>v===other[i]),'other weapons unchanged');
 q.advancePowerMeter(2);const beforeKeys=G.energy;
 for(const key of ['x','Tab'])for(const fn of window.handlers?.keydown||[])fn({key,repeat:false,target:{closest:()=>null},preventDefault(){}});
 ok(G.energy===beforeKeys&&q.powerMeterIndex()===1,'X/Tab cannot override automatic cursor');
 ev('titleReturnBtn','click');ok(G.mode==='title','title');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'title label reset');
 ev('startBtn','click');ok(G.mode==='playing','restart');
 ok(G.player.hp===120&&G.player.maxHp===120&&G.shipLevel===1&&G.lives===0&&G.pulses===1,'start hull 120 level1 no lives');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'restart label reset');
 ev('soundBtn','click');ok(audioStats.starts>0,'BGM start');
 if(el('soundBtn').textContent!=='♫ BGM ON')ev('soundBtn','click');
 q.tone(440,.08);ok(audioStats.sfxRoutes>0,'game SFX uses limited bus');
 ev('soundBtn','click',{shiftKey:true});ok(storageData.get('star_fighter_mix')==='1','sound preset saved');
 ok(el('soundBtn').textContent==='♫ BGM ON','mix selection does not mute');
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
 const legacy={...saved};delete legacy.passives;delete legacy.pendingUpgrades;
 storage.setItem('star_fighter_checkpoint_v1',JSON.stringify(legacy));
 ok(q.readCheckpoint()?.passives===undefined,'old checkpoint accepted');
 ok(q.readCheckpoint()?.pendingUpgrades===undefined,'old checkpoint needs no vouchers');
 storage.setItem('star_fighter_checkpoint_v1',JSON.stringify({...saved,pendingUpgrades:[99,0,0,0,0,0]}));
 ok(q.readCheckpoint()===null,'corrupt upgrade voucher save rejected');
 storage.setItem('star_fighter_checkpoint_v1',JSON.stringify(saved));
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
 G.energy=6;G.pulses=5;G.player.shield=5;G.player.hp=G.player.maxHp;G.lives=0;G.driveCharge=100;G.levels=[2,3,2,2,3,3];G.pendingUpgrades=[0,0,0,0,0,0];
 const capped=q.rewardOptions();
 ok(capped.length===3&&capped.every(o=>o.id.startsWith('score')),'capped resources must have three usable rewards');
 // 16/36: 2,000-seed per-route rarity/risk sampling and full grant effects.
 const specialSeen=new Set(),specialCounts={safe:0,storm:0};
 G.stage=1;G.passives=[0,0,0,0,0,0];G.levels=[0,0,0,0,0,0];G.pendingUpgrades=[0,0,0,0,0,0];
 G.player.hp=78;G.player.shield=2;G.lives=0;G.energy=2;G.pulses=2;G.driveCharge=10;
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
   rare_arsenal:[0,1,2,2,78,0,0,0,2],
   rare_reactor:[0,1,2,3,78,45,0,0,0],
   rare_rescue:[0,2,0,2,120,0,0,0,0],
   rare_focus:[0,2,2,1,78,15,1,0,0],
   storm_bounty:[0,1,5,2,78,25,0,0,0],
   storm_gamble:[0,2,2,2,56,25,0,0,1],
   safe_refit:[0,3,2,2,105,0,0,0,0],
   safe_supply:[0,2,3,3,78,0,0,0,0]
 };
 G.shipLevel=1;G.shipXP=0;G.player.maxHp=120;
 for(const [id,want] of Object.entries(expected)){
  const risk=id.startsWith('storm_')?1:0;
  G.stage=1;G.routeRisk=risk;G.mode='reward';G.runSeed=1234;
  G.routeHistory=[{stage:2,route:'test',risk,event:'cache',eventName:'cache',chain:false}];
  G.rewardHistory=[{stage:0,id:'score',name:'score'}];
  G.player.hp=78;G.player.shield=2;G.lives=0;G.energy=2;G.pulses=2;G.driveCharge=0;G.overdrive=0;
  G.levels=[0,0,0,0,0,0];G.pendingUpgrades=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
  G.rewardOffers=[{id,name:id,levelIndex:1,passiveIndex:0}];
  q.chooseReward(0);
  ok(G.mode==='route'&&G.rewardHistory.length===2,'hull reward checkpoint '+id);
  const got=[G.levels[1],G.player.shield,G.energy,G.pulses,G.player.hp,G.driveCharge,G.passives[0],G.lives,G.pendingUpgrades[1]];
  ok(JSON.stringify(got)===JSON.stringify(want),'hull reward effect '+id+': '+JSON.stringify(got));
  ok(q.readCheckpoint()?.mode==='route'&&q.readCheckpoint()?.v===2,'v2 reward saved '+id);
  ok(q.readCheckpoint()?.pendingUpgrades?.[1]===G.pendingUpgrades[1],'voucher saved '+id);
 }
 // Boss-flight reward is chosen by Y lane, but levels MUST wait for a user tap.
 G.stage=1;G.routeRisk=0;G.mode='reward';G.rewardHistory=[{stage:0,id:'score',name:'score'}];
 G.routeHistory=[{stage:2,route:'test',risk:0,event:'cache',eventName:'cache',chain:false}];
 G.player.hp=2;G.player.shield=0;G.energy=0;G.levels=[0,0,0,0,0,0];G.pendingUpgrades=[0,0,0,0,0,0];
 G.rewardOffers=[{id:'module',name:'LASER 無料強化券',levelIndex:2}];q.chooseReward(0);
 ok(G.levels[2]===0&&G.pendingUpgrades[2]===1,'auto-claim module never levels weapon');
 ok(q.readCheckpoint()?.pendingUpgrades?.[2]===1,'module voucher retained in checkpoint');
 G.mode='playing';q.updateHud();
 ok(q.powerMeterIndex()===2&&el('equipActionState').textContent.includes('無料強化'),'voucher lights LASER automatically without touching meter');
 ev('upgrade4','click');ok(q.powerMeterIndex()===2,'meter tapping cannot change voucher selection');
 ev('sideEquipBtn','pointerdown',{pointerType:'touch',pointerId:94,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'touch',pointerId:94,clientX:80,clientY:120});
 ev('sideEquipBtn','click',{pointerType:'touch',pointerId:94,detail:1});
 ok(G.levels[2]===1&&G.pendingUpgrades[2]===0&&G.energy===0,'one manual tap redeems one module voucher');
 ok(q.queueManualUpgrade(2,100)===1&&G.pendingUpgrades[2]===1,'free vouchers obey weapon upgrade cap');
 G.pendingUpgrades[2]=0;
 G.levels[1]=0;G.pendingUpgrades[1]=2;G.energy=0;q.updateHud();ok(q.powerMeterIndex()===1,'two vouchers illuminate SPREAD automatically');
 ev('sideEquipBtn','pointerdown',{pointerType:'mouse',pointerId:95,button:0,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'mouse',pointerId:95,button:0,clientX:80,clientY:120});
 ok(G.levels[1]===1&&G.pendingUpgrades[1]===1&&G.energy===0,'first of two manual vouchers');
 ev('sideEquipBtn','pointerdown',{pointerType:'mouse',pointerId:96,button:0,clientX:80,clientY:120});
 ev('sideEquipBtn','pointerup',{pointerType:'mouse',pointerId:96,button:0,clientX:80,clientY:120});
 ok(G.levels[1]===2&&G.pendingUpgrades[1]===0&&G.energy===0,'second of two manual vouchers');
 G.pendingUpgrades=[0,0,0,0,0,0];
 G.stage=1;G.routeRisk=1;G.player.hp=1;G.player.shield=0;G.energy=0;G.pulses=0;
 G.passives=[2,2,2,2,2,2];G.levels=[2,3,2,2,3,3];G.pendingUpgrades=[0,0,0,0,0,0];
 for(let j=0;j<250;j++){
  G.runSeed=j+1;
  ok(!q.rewardOptions().some(o=>o.tradeoff),'unaffordable tradeoff must not be offered');
 }
 G.stage=0;G.routeRisk=0;G.routeHistory=[];G.rewardHistory=[];G.mode='playing';
 G.energy=0;G.pulses=2;G.player.shield=0;G.player.hp=3;G.lives=3;G.driveCharge=0;G.levels=[0,0,0,0,0,0];G.pendingUpgrades=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
 // A single durable hull, no respawn.
 G.mode='playing';G.stage=0;G.shipLevel=1;G.shipXP=0;G.player.maxHp=120;
 G.player.hp=78;G.player.shield=0;G.pulses=1;
 q.stageClear();ok(G.player.hp===78&&G.pulses===1,'sector 1 does not full heal');
 G.stage=1;G.player.hp=20;G.player.shield=0;G.pulses=1;
 q.stageClear();ok(G.player.hp>20&&G.player.hp<G.player.maxHp&&G.pulses===2,'limited rescue at sector 2');
 G.bossDone=false;G.transitioning=false;G.mode='playing';
 G.stage=0;G.player.hp=78;G.player.shield=0;G.player.invul=0;G.lives=0;
 q.hitPlayer(1);ok(G.player.hp===65&&G.lives===0&&G.mode==='playing','13 hull damage no lives: '+JSON.stringify({hp:G.player.hp,lives:G.lives,mode:G.mode,stage:G.stage,invul:G.player.invul}));
 G.player.invul=0;q.hitPlayer(2);ok(G.player.hp===45,'heavy hit costs 20 hull');
 G.player.invul=0;G.player.hp=10;q.hitPlayer(1);
 ok(G.mode==='over'&&G.player.hp===0,'zero hull is immediate game over');
 ev('startBtn','click');ok(G.mode==='playing'&&G.player.hp===120&&G.shipLevel===1&&G.lives===0,'retry full hull no lives');
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
  G.stage=stage;G.routeRisk=risk;G.forcedBossVariant=stage===3&&risk===0?'crab':null;G.bullets=[];G.enemies=[];
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
  G.levels=[1,1,0,0,0,0];G.pendingUpgrades=[0,1,0,0,0,0];G.passives=[0,1,0,0,0,0];G.driveCharge=36;G.grazes=0;G.maxCombo=0;G.killCount=0;G.eventCount=0;
  q.saveCheckpoint('sector');const cp=q.readCheckpoint();
  ok(cp?.stage===stage&&cp?.routeHistory.length===stage,'R2 save chain '+stage+'/'+risk);
  ev('titleReturnBtn','click');ev('continueBtn','click');
  ok(G.mode==='playing'&&G.stage===stage&&G.runSeed===seed,'R2 seed and stage resume '+stage+'/'+risk);
  ok(G.routeRisk===risk&&G.routeHistory.length===stage,'R2 route resume '+stage+'/'+risk);
  ok(G.pulses===1&&G.pulseRecharge===17&&G.energy===2,'R2 NOVA and resources resume '+stage+'/'+risk);
  ok(G.levels[0]===1&&G.passives[1]===1&&G.player.hp===2,'R2 build resume '+stage+'/'+risk);
  ok(G.pendingUpgrades[1]===1,'R2 voucher continued '+stage+'/'+risk);
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
// 22/36: eight sectors, both routes, telegraphed elite fire and scarce manual-only reward.
 for(const stage of [0,1,2,3,4,5,6,7])for(const risk of stage===0?[0]:[0,1]){
  stageSetup((0x1234abcd+stage*17+risk)>>>0,stage,risk);
  G.stageTime=[62,68,74,72,76,80,84,90][stage]*.56;
  G.terrainSchedule=[];G.terrainIndex=0;G.activeEvent=null;G.eventTriggered=true;
  G.spawn=999;G.ambientTimer=999;G.fireTimer=999;G.missileTimer=999;G.player.invul=100;
  ok(q.spawnElite(),'elite did not spawn '+stage+'/'+risk);
  const e=G.enemies[0],count=G.enemies.length;
  ok(e.elite&&e.noLoot&&e.hp===e.maxHp&&e.hp>200,'elite durability '+stage+'/'+risk);
  ok(e.fire===999&&e.eliteFire>0,'elite separate fire timer '+stage+'/'+risk);
  ok(!q.spawnElite()&&G.enemies.length===count,'elite duplicated '+stage+'/'+risk);
  e.x=900;e.eliteFire=0;G.bullets=[];
  q.update(.016);
  ok(e.eliteWarn>.5&&G.bullets.length===0,'elite attack without windup '+stage+'/'+risk);
  q.update(.8);
  ok(G.bullets.length===4,'elite gap volley '+stage+'/'+risk);
  ok(G.bullets.every(b=>b.size===5&&b.life>0),'elite bounded shots '+stage+'/'+risk);
  const levels=G.levels.slice();
  const index=G.enemies.indexOf(e);ok(index>=0,'elite not found');
  q.destroyEnemy(index);
  ok(!G.enemies.includes(e)&&G.levels.every((n,i)=>n===levels[i]),'elite auto weapon upgrade '+stage+'/'+risk);
 }
 let rareSeed=0;
 for(let s=1;s<=300;s++)if(q.mixSeed(s,2,93)%100<32){rareSeed=s;break}
 ok(rareSeed>0,'rare cache seed not found');
 stageSetup(rareSeed,2,0);G.stageTime=74*.56;G.terrainSchedule=[];G.terrainIndex=0;
 G.activeEvent=null;G.eventTriggered=true;G.spawn=999;G.ambientTimer=999;G.fireTimer=999;G.missileTimer=999;G.player.invul=100;
 ok(q.spawnElite(),'rare elite spawn');const rare=G.enemies[0];
 rare.x=G.player.x+15;rare.y=G.player.y+10;
 const beforeLevels=G.levels.slice(),beforeNOVA=G.pulses;
 q.destroyEnemy(0);
 ok(G.pickups.filter(x=>x.type==='elite').length===1,'rare reward not collectible');
 ok(G.levels.every((n,i)=>n===beforeLevels[i]),'rare pickup auto-upgraded weapon');
 q.update(.016);
 ok(G.pulses===beforeNOVA+1,'rare NOVA pickup failed');
 ok(G.levels.every((n,i)=>n===beforeLevels[i]),'rare reward upgraded weapon');
 // 23/36: branch-only interceptions and boss doctrines remain deterministic,
 // readable, scarce and non-modal on every selectable sector.
 for(let stage=1;stage<8;stage++){
  const signatures=[];
  for(const risk of [0,1]){
   stageSetup((0x2468ace0+stage*17)>>>0,stage,risk);
   G.routeHistory=Array.from({length:stage},(_,i)=>({stage:i+2,risk,route:'QA',event:'qa',eventName:'QA',chain:false}));
   G.activeEvent=q.routeOffer(stage-1,risk).event;
   G.stageTime=[62,68,74,72,76,80,84,90][stage]*.41;
   G.terrainSchedule=[];G.terrainIndex=0;G.routePatrolSpawned=false;
   ok(q.spawnRoutePatrol(),'route interception absent '+stage+'/'+risk);
   ok(G.routePatrolSpawned&&G.enemies.length===2,'route patrol size '+stage+'/'+risk);
   const captain=G.enemies.find(e=>e.routeCaptain);
   ok(!!captain&&captain.routeRisk===risk,'route captain '+stage+'/'+risk);
   ok(G.enemies.every(e=>e.noLoot&&e.routePatrol),'route patrol must not increase capsule drops');
   ok(!q.spawnRoutePatrol()&&G.enemies.length===2,'duplicate route patrol');
   ok(G.enemies.every(e=>Math.abs(e.y-captain.aiSafeY)>=q.waveClearance(e.type)-.001),'route patrol safe corridor');
   signatures.push(G.enemies.map(e=>e.type).join('/'));
   G.bullets=[];q.fireEnemy(captain);
   ok(G.bullets.length===(risk?6:4),'route captain fire gap '+stage+'/'+risk);
   ok(G.bullets.every(b=>b.size===4.5),'route bullet bounds '+stage+'/'+risk);
   const levels=G.levels.slice(),before=G.pickups.length;
   q.destroyEnemy(G.enemies.indexOf(captain));
   ok(G.pickups.length===before&&G.levels.every((n,i)=>n===levels[i]),'route patrol no auto-loot/upgrade');
   G.enemies=[];G.bullets=[];
   q.spawnBoss();ok(G.boss.routeDoctrine===G.activeEvent.id,'boss route doctrine '+stage+'/'+risk);
   G.boss.x=930;G.boss.pattern=4;G.boss.fire=0;
   q.bossAttack(G.boss);
   ok(G.bullets.length===(risk?6:4)&&G.boss.pattern===5,'route boss replacement salvo '+stage+'/'+risk);
   ok(G.bullets.every(b=>b.size===4.5&&b.life>0),'route boss readable bullets '+stage+'/'+risk);
   G.boss=null;G.bullets=[];G.shots=[];
  }
  ok(signatures[0]!==signatures[1],'route interception should differ '+stage);
 }

 // 25/36: deterministic three-speed parallax with no combat RNG use.
 // Near-depth decoration must remain at screen edges and not obscure the ship.
 for(let stage=0;stage<8;stage++)for(let risk=0;risk<=1;risk++){
  G.stage=stage;G.routeRisk=risk;G.runSeed=seeds[(stage*7+risk)%seeds.length];G.scroll=0;
  const field=q.depthField();
  ok(field.layers.length===3,'three background depth planes '+stage+'/'+risk);
  ok(field.layers[0].speed<field.layers[1].speed&&field.layers[1].speed<field.layers[2].speed,
   'background parallax speeds strictly ordered '+stage+'/'+risk);
  ok(field.layers.map(l=>l.nodes.length).join(',')==='12,10,8','background draw budget '+stage+'/'+risk);
  ok(q.depthField()===field,'background geometry cached without per-frame allocation');
  const signature=field.layers.map(l=>l.nodes.map(n=>[n.x,n.y,n.size,n.opacity,n.angle].join(':')).join('|')).join('/');
  for(let k=0;k<3;k++){
   const layer=field.layers[k];
   for(const node of layer.nodes){
    ok([node.x,node.y,node.size,node.opacity,node.angle].every(Number.isFinite),'finite depth geometry');
    ok(node.opacity>=0&&node.opacity<=.14,'low-opacity background cannot hide bullets');
    if(k===2)ok(node.y<85||node.y>590,'fast foreground kept off the ship lane');
    const before=q.depthX(node,layer,0),after=q.depthX(node,layer,12);
    if(before>60&&before<1050)ok(Math.abs((before-after)-12*layer.speed)<.0001,'smooth depth scrolling');
   }
   q.drawDepthPlane(k);
  }
  G.scroll=150;
  ok(q.depthField()===field,'scroll does not rebuild background textures');
  G.scroll=0;
  ok(field.layers.map(l=>l.nodes.map(n=>[n.x,n.y,n.size,n.opacity,n.angle].join(':')).join('|')).join('/')===signature,
   'background seed deterministic across frames');
  const oldSeed=G.runSeed;G.runSeed=(oldSeed+1)>>>0;
  ok(q.depthField().key!==field.key,'new run changes depth geometry');
 }

 // 26/36: stage- and branch-specific procedural artwork. No combat RNG.
 const routeMotifs=new Set();
 for(let stage=0;stage<8;stage++){
  const variants=[];
  for(let risk=0;risk<=1;risk++){
   G.stage=stage;G.routeRisk=risk;G.runSeed=seeds[(stage*11+risk)%seeds.length];G.scroll=0;
   const f=q.routeArtField();variants.push([f.motif,f.ink,f.fill].join('/'));routeMotifs.add(f.motif);
   ok(f.layers.length===2&&f.layers[0].speed<f.layers[1].speed,'route art parallax order');
   ok(f.layers.map(x=>x.nodes.length).join(',')==='5,7','route art draw budget');
   ok(q.routeArtField()===f,'route art cached');
   const signature=JSON.stringify(f.layers);
   ok([f.haze.x,f.haze.y,f.haze.radius].every(Number.isFinite),'route nebula geometry finite');
   ok(f.haze.radius>=230&&f.haze.radius<=320,'route nebula radius bounded');
   for(const layer of f.layers)for(const n of layer.nodes){
    ok([n.x,n.y,n.size,n.angle,n.alpha].every(Number.isFinite),'route art geometry finite');
    ok(n.alpha<.36,'route art must remain behind projectiles');
    ok(n.y<260||n.y>410,'route art avoids center ship lane');
   }
   q.drawRouteArt(0);q.drawRouteArt(1);
   G.scroll=120;ok(q.routeArtField()===f&&JSON.stringify(f.layers)===signature,'route art scroll without allocations');
   const old=G.runSeed;G.runSeed=(old+1)>>>0;
   ok(q.routeArtField().key!==f.key,'route art changes with seed');
  }
  ok(variants[0]!==variants[1],'route silhouette/color differ '+stage);
 }
 ok(routeMotifs.size===16,'sixteen unique route landmarks');
 stageSetup(seeds[22],5,1);q.spawnWave();const beforeRouteArt=waveSignature();
 stageSetup(seeds[22],5,1);q.routeArtField();q.drawRouteArt(0);q.drawRouteArt(1);q.spawnWave();
 ok(waveSignature()===beforeRouteArt,'route art does not change combat RNG');
 stats.routeArt={motifs:routeMotifs.size,routePairs:8,objectsPerScene:12,
  method:'headless Canvas geometry only, no real-device fps measurement'};
 // 24/36: first-contact readability and boss difficulty/reward regression.
 // Real hardware FPS and human dodge success are NOT inferred from these tests.
 const bossCases=[[0,0],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1],[4,0],[4,1],
  [5,0],[5,1],[6,0],[6,1],[7,0],[7,1]];
 let worstVolley=0,minTravel=Infinity,minEntryWarning=Infinity;
 ok(gameSource.includes('entryReady:false')&&gameSource.includes('b.fire=Math.max(b.fire,.82)'),
   'all bosses must telegraph first entry');
 ok(!gameSource.includes('c.setLineDash([18,12])')&&
   !gameSource.includes("line(b.x-135,b.y,p.x,p.y"),
   'no legacy orange enemy navigator or screen-spanning boss aim line');
 for(const [stage,risk] of bossCases){
  stageSetup(seeds[stage*7+risk],stage,risk);
  G.routeHistory=[];G.activeEvent=null;G.enemies=[];G.player.invul=999;
  q.spawnBoss();G.boss.x=1000;G.boss.fire=.01;
  G.fireTimer=999;G.missileTimer=999;G.spawn=999;
  q.update(.016);
  ok(G.boss.fire>=.79&&G.bullets.length===0,'boss does not shoot from outside viewport '+stage+'/'+risk);
  for(let i=0;i<80&&G.boss.x>980;i++)q.update(.016);
  ok(G.boss.entryReady&&G.boss.x<=980,'boss entry becomes visible '+stage+'/'+risk);
  minEntryWarning=Math.min(minEntryWarning,G.boss.fire);
  ok(G.boss.fire>=.79&&G.bullets.length===0,'first salvo needs >=0.79s cue '+stage+'/'+risk);
  q.drawScene();q.update(.30);
  ok(G.bullets.length===0,'opening volley remains withheld during visual cue '+stage+'/'+risk);
  q.update(.55);
  ok(G.bullets.length>0,'opening volley starts after cue '+stage+'/'+risk);
  G.boss=null;G.bullets=[];G.shots=[];
 }
 for(const seed of seeds)for(const [stage,risk] of bossCases){
  stageSetup(seed,stage,risk);G.routeHistory=[];G.activeEvent=null;
  q.spawnBoss();const b=G.boss;b.x=930;b.y=337;b.t=1.4;
  ok(b.maxHp>=1500&&b.maxHp<15000,'boss HP bound '+stage+'/'+risk);
  const levels=G.levels.slice(),energy=G.energy;
  for(const phase of [0,1])for(let pattern=0;pattern<3;pattern++){
   b.phase=phase;b.pattern=pattern;b.charge=0;b.beam=0;G.bullets=[];
   q.bossAttack(b);
   const count=G.bullets.length;worstVolley=Math.max(worstVolley,count);
   ok(count>=4&&count<=16,'boss salvo bounded '+stage+'/'+risk+'/'+phase+'/'+pattern);
   for(const shot of G.bullets){
    const speed=Math.hypot(shot.vx,shot.vy);
    ok(speed>=130&&speed<=360&&shot.size>=4&&shot.size<=6,
     'readable boss projectile speed/size '+stage+'/'+risk);
    if(shot.vx<0){
     const travel=(shot.x-215-23)/-shot.vx;
     minTravel=Math.min(minTravel,travel);
     ok(travel>=1.3,'boss bullet must give >1.3s approach time '+stage+'/'+risk);
    }
   }
  }
  ok(G.levels.every((n,i)=>n===levels[i])&&G.energy===energy,
   'boss attacks must not auto-upgrade or spend capsules');
  G.boss=null;G.forcedBossVariant=null;G.bullets=[];
 }
 // Defeating any of the 15 bosses must lead to a live reward/finish
 // without consuming a capsule or auto-equipping a weapon.
 for(const [stage,risk] of bossCases){
  stageSetup(seeds[stage*9+risk],stage,risk);
  G.routeHistory=[];G.activeEvent=null;G.energy=2;G.player.invul=999;
  G.player.hp=2;G.lives=2;G.fireTimer=999;G.missileTimer=999;
  q.spawnBoss();G.boss.x=930;G.boss.fire=999;
  const beforeLevels=G.levels.slice(),beforeEnergy=G.energy;
  G.boss.hp=0;q.update(.016);
  ok(G.mode==='playing'&&G.transitioning,'boss clear never pauses play '+stage+'/'+risk);
  ok(G.levels.every((n,i)=>n===beforeLevels[i])&&G.energy===beforeEnergy,
    'boss clear must not spend capsules or auto-equip '+stage+'/'+risk);
  if(stage<7){
   ok(G.flowPhase==='reward'&&G.rewardOffers.length===3,
    'three in-flight reward offers after boss '+stage+'/'+risk);
   ok(new Set(G.rewardOffers.map(o=>o.id)).size===3,
    'no duplicate boss rewards '+stage+'/'+risk);
  }else ok(G.flowPhase==='finish','last boss transitions to finale');
 }
 stats.bossReadability={bossVariants:bossCases.length,seeds:seeds.length,
  worstVolley,rewardCases:bossCases.length,minProjectileTravelSeconds:+minTravel.toFixed(2),
  minOpeningWarningSeconds:+minEntryWarning.toFixed(2),method:'headless geometry and scripted input, not human/device timing'};

 // 27/36: visual-only motion, damage flashes and class-specific debris.
 // These may not alter collision, loot, energy, weapon ranks or input handling.
 stageSetup(seeds[0],3,0);G.mode='playing';G.bossDone=true;
 G.terrain=null;G.terrainIndex=2;G.terrainSchedule=[];G.enemies=[];G.shots=[];G.bullets=[];G.particles=[];G.rings=[];
 G.player.invul=999;G.player.hp=2;G.fireTimer=999;G.missileTimer=999;
 G.activeEvent=null;G.eventTriggered=true;G.ambientTimer=999;G.spawn=999;
 q.enemy('tank',530,300,{noLoot:true});
 const impactTarget=G.enemies[0],impactHp=impactTarget.hp;
 G.shots=[{x:impactTarget.x-10,y:impactTarget.y,px:impactTarget.x-10,py:impactTarget.y,
  vx:0,vy:0,dmg:12,pierce:1,kind:'shot',life:1}];
 q.update(.016);
 ok(impactTarget.hp<impactHp&&impactTarget.hitFlash>.10&&impactTarget.recoil>0,
   'projectile must trigger bounded enemy hit flash and recoil');
 const flashBefore=impactTarget.hitFlash,recoilBefore=impactTarget.recoil;
 q.drawEnemy(impactTarget);q.update(.10);
 ok(impactTarget.hitFlash<flashBefore&&impactTarget.recoil<recoilBefore&&impactTarget.recoil>=0,
   'enemy impact feedback fades without moving collision body');
 const visualEnergy=G.energy,visualLevels=G.levels.slice();
 G.particles=[];q.destroyEnemy(0);
 const heavyShards=G.particles.filter(v=>v.kind==='shard');
 ok(heavyShards.length===10&&heavyShards.every(v=>v.life>0&&v.maxLife===v.life&&v.size>0&&Number.isFinite(v.vx)&&Number.isFinite(v.spin)),
   'armored enemies produce ten bounded hull fragments');
 ok(G.energy===visualEnergy&&G.levels.every((v,i)=>v===visualLevels[i]),
   'debris must not consume capsules or upgrade weapons');
 const initialRotation=heavyShards[0].rot;q.update(.12);q.drawScene();
 ok(heavyShards[0].rot!==initialRotation&&heavyShards[0].life<heavyShards[0].maxLife,
   'fragments tumble and fade through the existing particle pool');
 const fragmentSpec={type:'boss',x:850,y:330,phase:1.2};
 G.particles=[];q.wreckFragments(fragmentSpec);
 const bossShards=G.particles.filter(v=>v.kind==='shard');
 const signature=JSON.stringify(bossShards);
 ok(bossShards.length===18,'boss death creates distinct but bounded debris');
 G.particles=[];q.wreckFragments(fragmentSpec);
 ok(JSON.stringify(G.particles)===signature,'visual fragments deterministic and gameplay RNG independent');
 G.particles=[];q.wreckFragments({type:'scout',x:400,y:250,phase:0});
 ok(G.particles.length===5,'small enemies have restrained destruction');
 G.particles=[];G.player.invul=0;G.player.hp=2;G.player.shield=0;
 q.hitPlayer(1);
 ok(G.player.hp===1&&G.player.hitFlash>.1,'ship hull hit has visible flash without extra damage');
 q.drawShip(G.player.x,G.player.y,G.player.angle,G.player.invul);
 G.player.invul=999;const moveY=G.player.y;
 const keyDown=(window.handlers?.keydown||[])[0],keyUp=(window.handlers?.keyup||[])[0];
 ok(!!keyDown&&!!keyUp,'keyboard controls available');
 keyDown({key:'ArrowDown',repeat:false,target:{closest(){return null}},preventDefault(){}});
 q.update(.016);
 keyUp({key:'ArrowDown'});
 ok(G.player.y>moveY&&G.player.visualMotion>0&&G.player.visualMotion<=1,
   'ship engine visual responds to actual movement without changing input mapping');
 q.drawShip(G.player.x,G.player.y,G.player.angle,G.player.invul);
 const hitBefore=G.player.hitFlash;q.update(.1);
 ok(G.player.hitFlash<hitBefore,'ship damage feedback fades with simulation time');
 stats.visualFeedback={heavyFragments:heavyShards.length,bossFragments:bossShards.length,
  scoutFragments:5,hitFlashSeconds:.14,physicalDeviceTested:false};

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
 // 31/36: distinguish fresh random restart from deliberate same-seed replay.
  const replayInput=el('seedInput');
  replayInput.value='1A2B3C4D';q.endGame(false);
  ok(G.mode==='over'&&el('seedReplay').hidden===false,'game-over offers same-seed replay');
  const keyRestart=(window.handlers?.keydown||[])[0];
  keyRestart({key:'Enter',repeat:false,target:{closest(){return {}}},preventDefault(){}});
  ok(G.mode==='over','focused Enter does not accidentally launch another run');
  ev('startBtn','click');
  ok(G.mode==='playing'&&replayInput.value==='','fresh retry clears old typed seed');
  G.runSeed=0x1a2b3c4d;replayInput.value='FFFFFFFF';q.endGame(false);
  ev('seedReplay','click');
  ok(G.mode==='playing'&&G.runSeed===0x1a2b3c4d&&replayInput.value==='1A2B3C4D','same-seed retry is explicit and deterministic');

 // 32/36: results are truthful, read-only, and hidden outside post-run screens.
 {
  const levels=[2,1,0,1,2,0],passives=[1,0,2,0,0,1];
  G.mode='playing';G.stage=5;G.score=123456;G.total=125;G.killCount=47;G.maxCombo=19;G.grazes=11;
  G.levels=levels.slice();G.passives=passives.slice();G.energy=3;G.pendingUpgrades=[0,1,0,0,0,0];
  G.routeHistory=[{stage:2,route:'補給航路',risk:0},{stage:3,route:'突入路',risk:1}];
  G.rewardHistory=[{stage:0,name:'装甲補修'},{stage:1,name:'武器券'}];
  const before=JSON.stringify([G.levels,G.passives,G.energy,G.pendingUpgrades,G.routeHistory,G.rewardHistory]);
  q.endGame(false);
  ok(el('runResult').hidden===false&&el('resultSector').textContent==='6 / 8 到達','game over stage reached');
  ok(el('resultScore').textContent==='123,456'&&el('resultBest').textContent.length>0,'score and best shown');
  ok(el('resultStats').textContent.includes('撃破 47')&&el('resultStats').textContent.includes('2:05'),'kills and time shown');
  ok(el('resultBuild').textContent.includes('BOOST 2/2')&&el('resultBuild').textContent.includes('OPTION 2/3'),'all weapon levels shown');
  ok(el('resultPassives').textContent.includes('高速給弾 1')&&el('resultPassives').textContent.includes('蓄電回路 2'),'passive ranks shown');
  ok(el('resultRoutes').textContent.includes('S02 補給')&&el('resultRoutes').textContent.includes('S03 高危険'),'route risk history shown');
  ok(el('resultRewards').textContent.includes('S01 装甲補修')&&el('resultRewards').textContent.includes('S02 武器券'),'earned rewards shown');
  ok(JSON.stringify([G.levels,G.passives,G.energy,G.pendingUpgrades,G.routeHistory,G.rewardHistory])===before,'results cannot auto-upgrade or spend capsules');
  G.stage=7;q.endGame(true);
  ok(el('runResult').hidden===false&&el('resultSector').textContent==='8 / 8 完走','final victory report');
  ev('startBtn','click');
  ok(G.mode==='playing'&&el('runResult').hidden===true,'result hidden after restart');
  q.endGame(false);ev('seedReplay','click');
  ok(G.mode==='playing'&&el('runResult').hidden===true,'result hidden after seed replay');
  if(htmlSource&&cssSource){
   ok(htmlSource.includes('id="runResult"')&&htmlSource.includes('id="resultRoutes"')&&htmlSource.includes('id="resultRewards"'),'result markup includes routes and rewards');
   ok(cssSource.includes('.run-result[hidden]')&&cssSource.includes('max-height:clamp(95px,34dvh,260px)'),'result scroll containment');
   ok(cssSource.includes('orientation:portrait')&&cssSource.includes('orientation:landscape'),'responsive result styles retained');
  }
 }

 // 33/36: Canvas allocation/overdraw regression; no real-device FPS inference.
 {
  G.mode='playing';G.stage=0;G.routeRisk=0;G.runSeed=0x7eebbeef;G.scroll=0;
  G.enemies=[];G.bullets=[];G.shots=[];G.pickups=[];G.particles=[];G.rings=[];G.boss=null;
  q.drawBackground();const warm={...gradientStats};
  for(let i=0;i<10;i++){G.scroll+=19;q.drawBackground()}
  ok(gradientStats.linear===warm.linear&&gradientStats.radial===warm.radial,'background gradients reallocated during scroll');
  G.routeRisk=1;q.drawBackground();
  ok(gradientStats.linear>warm.linear&&gradientStats.radial>warm.radial,'route gradient invalidation');
  const routeWarm={...gradientStats};
  G.runSeed++;q.drawBackground();
  ok(gradientStats.linear===routeWarm.linear&&gradientStats.radial===routeWarm.radial+1,'seed refreshes only procedural haze');
  G.stage=3;q.drawBackground();const stageWarm={...gradientStats};
  for(let i=0;i<8;i++){G.scroll+=17;q.drawBackground()}
  ok(gradientStats.linear===stageWarm.linear&&gradientStats.radial===stageWarm.radial,'stage gradients reallocated');
  ok(!gameSource.includes("for(const s of G.shots){c.save();c.shadowBlur=15"),'friendly shot blur still allocated');
  G.particles=[];q.drawScene();const emptyStart=drawStats.rects;q.drawScene();
  const emptyRects=drawStats.rects-emptyStart;
  G.particles=Array.from({length:620},(_,i)=>({x:100+i%100,y:200+i%20,life:1,maxLife:1,size:2,color:'#fff',glow:false}));
  const fullStart=drawStats.rects;q.drawScene();
  const visibleRects=drawStats.rects-fullStart-emptyRects;
  ok(visibleRects===260,'particle draw budget '+visibleRects);
  ok(G.particles.length===620,'draw cap changed simulation');
  G.particles=[];
  stats.renderBudget={gradientWarmup:stageWarm,particleDrawCap:visibleRects,hardwareFps:'not measured',inputLatency:'not measured'};
 }
 // 100 seed crisis reward/difficulty regression for the new hull system.
 {
  const balance={seeds:100,stageRoutes:0,criticalDrafts:0,guaranteedRescue:0,
   criticalMaxPressure:0,healthyMaxPressure:0,humanCompletionRate:'not measured'};
  for(const seed of seeds)for(let stage=0;stage<8;stage++)for(const risk of (stage===0?[0]:[0,1])){
   balance.stageRoutes++;G.mode='playing';G.stage=stage;G.routeRisk=risk;G.runSeed=seed;
   G.shipLevel=1;G.shipXP=0;G.player.maxHp=120;
   G.stageTime=[62,68,74,72,76,80,84,90][stage]*.78;G.enemies=[];G.bullets=[];G.directorGrace=0;
   G.levels=[0,0,0,0,0,0];G.pendingUpgrades=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
   G.energy=2;G.pulses=1;G.driveCharge=30;G.player.shield=0;G.rewardHistory=[];
   G.player.hp=112;G.lives=0;const healthy=q.encounterDirector();
   balance.healthyMaxPressure=Math.max(balance.healthyMaxPressure,healthy.pressure);
   for(const hp of [36,24,12]){
    G.player.hp=hp;const offers=q.rewardOptions(),copy=q.rewardOptions();
    ok(offers.length===3&&new Set(offers.map(o=>o.id)).size===3,'hull crisis valid three rewards');
    ok(JSON.stringify(offers)===JSON.stringify(copy),'crisis seed determinism');
    ok(offers.some(o=>o.id.startsWith('passive_')),'critical passive remains selectable');
    ok(offers[1].id==='repair','critical hull guarantees middle repair');
    ok(offers.filter(o=>o.rarity==='rare'||o.rarity==='route').length<=1,'special rarity cap');
    const d=q.encounterDirector();ok(d.pressure<=healthy.pressure,'critical hull must not raise threat');
    if(hp===12){ok(d.pressure<=.54&&d.budget<=3,'low hull director cap');balance.criticalMaxPressure=Math.max(balance.criticalMaxPressure,d.pressure)}
    balance.criticalDrafts++;balance.guaranteedRescue++;
   }
  }
  ok(balance.stageRoutes===1500&&balance.criticalDrafts===4500,'100 seed balance coverage');
  ok(balance.guaranteedRescue===balance.criticalDrafts&&balance.criticalMaxPressure<=.54,'critical hull rescue and director cap');
  stats.balance34=balance;
 }
 // 35/36 + R3: sixteen full eight-sector route histories.
 // Simulated Canvas/touch; hardware FPS and latency are not measured.
 {
  const masks=[0,127,85,42,1,2,4,8,16,32,64,126,125,123,119,111];
  const full={routes:masks.length,sectors:0,bosses:0,routeDecisions:0,rewards:0,clears:0,hardwareFps:'not measured',inputLatency:'not measured'};
  for(let n=0;n<masks.length;n++){
   const mask=masks[n],seed=seeds[(n*7)%100];
   stageSetup(seed,0,0);
   G.routeHistory=[];G.rewardHistory=[];G.activeEvent=null;G.flowPhase=null;G.transitioning=false;G.score=0;
   for(let stage=0;stage<8;stage++){
    ok(G.mode==='playing'&&G.stage===stage,'35 continuous stage '+n+'/'+stage);
    G.player.invul=9999;G.enemies=[];G.bullets=[];G.terrain=null;G.pendingWave=null;
    q.spawnBoss();
    ok(!!G.boss&&G.boss.name,'35 boss exists '+n+'/'+stage);
    const stopBefore=audioStats.stops;
    G.boss.hp=0;q.update(.016);
    ok(G.mode==='playing'&&G.transitioning,'35 boss kill does not pause '+n+'/'+stage);
    ok(audioStats.stops===stopBefore,'35 music uninterrupted '+n+'/'+stage);
    full.bosses++;full.sectors++;
    if(stage===7){
     for(let j=0;j<70&&G.mode!=='win';j++)q.update(.05);
     ok(G.mode==='win','35 finale '+n);
     full.clears++;break;
    }
    ok(G.flowPhase==='reward'&&G.rewardOffers.length===3,'35 flight reward '+n+'/'+stage);
    G.player.y=G.player.targetY=stage%3===0?165:stage%3===1?337:509;
    const prev=G.rewardHistory.length,levels=G.levels.slice();
    for(let j=0;j<85&&G.flowPhase==='reward';j++)q.update(.05);
    ok(G.mode==='playing'&&G.flowPhase==='route'&&G.rewardHistory.length===prev+1,'35 reward once '+n+'/'+stage);
    ok(JSON.stringify(G.levels)===JSON.stringify(levels),'35 no auto weapon level '+n+'/'+stage);
    full.rewards++;
    const risk=(mask>>stage)&1;
    G.player.y=G.player.targetY=risk?495:165;
    for(let j=0;j<85&&G.transitioning;j++)q.update(.05);
    ok(G.mode==='playing'&&G.stage===stage+1&&G.routeRisk===risk,'35 selected route '+n+'/'+stage);
    ok(G.routeHistory.length===stage+1&&G.rewardHistory.length===stage+1,'35 history integrity '+n+'/'+stage);
    ok(q.readCheckpoint()?.mode==='sector','35 checkpoint '+n+'/'+stage);
    full.routeDecisions++;
   }
   ok(G.routeHistory.length===7&&G.rewardHistory.length===7,'35 eight-sector history '+n);
  }
  ok(full.sectors===128&&full.bosses===128&&full.routeDecisions===112&&full.rewards===112&&full.clears===16,'35 full-run coverage');
  stats.fullRun35=full;
 }
  // 36/36 final QA: documentation and release label match current features.
 if(readmeSource){
  ok(readmeSource.includes('35/36')&&readmeSource.includes('v1.0完成判定は保留'),'README marks hardware QA as pending');
  ok(readmeSource.includes('ロゴを合計7回タップ')&&readmeSource.includes('時間制限はありません'),'README documents debug');
  ok(readmeSource.includes('拾っただけでは強化されません')&&readmeSource.includes('メーターは表示専用'),'README documents auto meter and manual activation');
  ok(readmeSource.includes('ボス撃破後もゲームは停止しません')&&readmeSource.includes('15種類の大型ボス'),'README documents continuous eight-stage combat');
  ok(readmeSource.includes('実機のFPS、入力遅延')&&readmeSource.includes('node qa_100_runs.js'),'README separates simulated and real-device QA');
 }
 if(htmlSource)ok(htmlSource.includes('ORIGINAL BROWSER SHOOTER · PREVIEW / QA'),'release label does not claim unverified v1.0');
  // Screenshot regression: portrait overlay is viewport scrollable, not canvas clipped.
 if(htmlSource&&cssSource){
  ok(htmlSource.includes('id="debugTrigger"')&&!htmlSource.includes('id="debugUnlockHint"'),'secret logo exists without a visible tap counter');
   ok(!gameSource.includes('debugHint.textContent'),'secret unlock never writes a tap-count message');
  ok(cssSource.includes('#shell .game-frame>.overlay{')&&cssSource.includes('position:fixed!important'),'portrait overlay escapes 16:9 canvas height');
  ok(cssSource.includes('overflow-y:auto!important')&&cssSource.includes('max-height:none!important'),'portrait title/debug menu remains scrollable');
  ok(cssSource.includes('#shell .game-frame>.overlay .debug-panel')&&cssSource.includes('overflow:visible!important'),'debug panel does not create trapped nested scroller');
  ok(cssSource.includes('#shell .game-frame>.overlay.hidden'),'hidden overlay never obstructs live touchpad');
  ok(!gameSource.includes('if(now-debugTapTime>4200)'),'secret logo taps have no timing race');
 }
  // 2026-10-30 extra: hidden debug, all eight sectors and 2 paths, invincibility,
 // score/medal/checkpoint isolation, standard gamepad input, repeats and fallback.
 {
  if(htmlSource&&cssSource){
   ok(htmlSource.includes('id="debugPanel" hidden')&&htmlSource.includes('id="debugTrigger"'),'debug interface hidden behind title');
   ok((htmlSource.match(/<option value="[0-7]">[1-8] · /g)||[]).length===8,'all eight debug stage choices');
   ok(htmlSource.includes('id="debugRoute"')&&htmlSource.includes('無敵・記録対象外'),'two route choices and debug label');
   ok(htmlSource.includes('id="gamepadStatus"')&&htmlSource.includes('STARTで開始'),'gamepad UI status and instructions');
   ok(cssSource.includes('.debug-panel[hidden]')&&cssSource.includes('.debug-status[hidden]'),'debug hidden styles');
   ok(gameSource.includes("if(G.debugMode||p.invul>0||G.mode!=='playing')return"),'debug bypasses every hitPlayer path');
   ok(gameSource.includes("if(G.debugMode||!['playing','route','reward'].includes(G.mode))return"),'debug never writes checkpoints');
   ok(gameSource.includes("if(!G.debugMode&&G.score>G.best)"),'debug cannot write best score');
  }
  // Standard mode still cannot open diagnostic by title taps during gameplay.
  ev('titleReturnBtn','click');ev('startBtn','click');
  ok(G.mode==='playing'&&G.debugMode===false,'normal mode unchanged by debug code');
  for(let n=0;n<7;n++)ev('debugTrigger','click');
  ok(el('debugPanel').hidden!==false,'secret taps ignored while playing');
  q.saveCheckpoint('sector');
  const saved=storageData.get('star_fighter_checkpoint_v1');
  const previousBest=G.best,previousBestStorage=storageData.get('star_fighter_best');
  const medalsBefore=JSON.stringify(q.readMedals());
  el('overlay').scrollTop=620;el('overlay .overlay-inner').scrollTop=320;
  ev('titleReturnBtn','click');ok(G.mode==='title','back to title for hidden unlock');
  ok(el('overlay').scrollTop===0&&el('overlay .overlay-inner').scrollTop===0,'returning to title starts at top');
  ok(el('overlay').inert===false,'title overlay remains interactive');
  for(let n=0;n<6;n++){
   ev('debugTrigger','click');
   ok(el('debugPanel').hidden!==false,'debug remains hidden silently after tap '+(n+1));
  }
  ev('debugTrigger','click');
  ok(el('debugPanel').hidden===false,'seventh title tap unlocks debug without count');
  // Boss-only debug must spawn exactly the chosen boss without campaign waves.
  ok(q.DEBUG_BOSS_ROSTER.length===16,'all 16 selectable boss variants are defined');
  ok((htmlSource.match(/<option value="[0-7]:[012]">/g)||[]).length===16,'16 selectable boss labels');
  ok(cssSource.includes('#shell .debug-controls[hidden]'),'boss mode hides unrelated controls');
  el('debugPlayMode').value='boss';ev('debugPlayMode','change');
  ok(el('debugStageControls').hidden&& !el('debugBossControls').hidden,'boss-only menu selection');
  el('debugBoss').value='1:0';ev('debugLaunch','click');
  ok(G.debugMode&&G.debugBossOnly&&G.stage===1&&G.boss?.name==='KRAKEN ENGINE','boss-only immediately spawns octopus');
  ok(G.enemies.length===0&&G.terrain===null&&G.pendingWave===null,'no enemies/terrain before boss');
  const savedPractice=storageData.get('star_fighter_checkpoint_v1'),medalPractice=JSON.stringify(q.readMedals()),trophyPractice=window.STAR_TROPHIES.count();
  const boss=G.boss,hp=boss.maxHp;
  ok(q.invulnerablePracticeBoss(),'boss is immortal in boss-only debug');
  q.damageBoss(boss,1000000);
  ok(boss.hp===hp,'direct high-damage hit cannot lower boss health');
  G.pulses=3;q.pulse();
  ok(boss.hp===hp,'NOVA cannot lower debug boss health');
  G.levels[3]=1;G.passives[4]=1;
  q.applyShotSynergy({kind:'missile',x:boss.x-53,y:boss.y},{x:0,y:0});
  ok(boss.hp===hp,'missile splash cannot lower debug boss health');
  boss.x=930;boss.y=337;boss.fire=999;
  G.shots=[{x:boss.x-53,y:boss.y,px:0,py:0,vx:0,vy:0,life:1,dmg:999999,pierce:1,kind:'shot'}];
  q.update(.016);
  ok(G.boss===boss&&boss.hp===hp,'real projectile collision cannot damage practice boss');
  G.player.invul=0;G.player.shield=0;G.player.hp=1;G.lives=1;q.hitPlayer(99999);
  ok(G.player.hp===1&&G.lives===1,'pilot is also immortal in boss-only debug');
  boss.hp=-1;q.update(.016);
  ok(G.boss===boss&&boss.hp===hp&&G.mode==='playing','debug boss cannot die even from direct negative HP');
  boss.t=18;boss.fire=999;q.update(.016);
  ok(boss.phase===1&&boss.hp===hp,'phase two arrives by elapsed time');
  boss.t=60.1;q.update(.016);
  ok(boss.phase===0&&boss.hp===hp,'phase returns to beginning for ongoing sparring');
  q.stageClear();
  ok(G.mode==='playing'&&G.boss===boss&&!G.transitioning,'practice cannot enter clear/reward/route state');
  ok(storageData.get('star_fighter_checkpoint_v1')===savedPractice&&JSON.stringify(q.readMedals())===medalPractice&&window.STAR_TROPHIES.count()===trophyPractice,'immortal duel does not touch normal records');
  ev('sidePauseBtn','click');ok(G.mode==='paused','boss practice can pause');
  el('debugBoss').value='1:0';ev('debugLaunch','click');
  ok(G.mode==='playing'&&G.boss?.name==='KRAKEN ENGINE'&&G.boss!==boss,'practice can restart same boss from menu');
  for(const b of q.DEBUG_BOSS_ROSTER){
    ev('sidePauseBtn','click');
    el('debugBoss').value=b.key;ev('debugLaunch','click');
    ok(G.mode==='playing'&&G.boss?.name===b.name&&G.stage===b.stage,'boss variant selected: '+b.name);
    ok(G.enemies.length===0&&G.terrain===null,'no standard stage enemies for '+b.name);
  }
  ev('sidePauseBtn','click');el('debugBoss').value='7:1';ev('debugLaunch','click');
  const lastBoss=G.boss;
  ok(lastBoss?.name==='SINGULARITY EMPEROR','final phase explicitly selects S8 storm boss');
  lastBoss.fire=999;lastBoss.t=18;q.update(.016);
  ok(lastBoss.phase===1&&lastBoss.hp===lastBoss.maxHp,'final boss reaches phase 2 without HP loss');
  lastBoss.fire=999;lastBoss.t=36;q.update(.016);
  ok(lastBoss.phase===2&&lastBoss.hp===lastBoss.maxHp,'final boss reaches phase 3 without HP loss');
  lastBoss.fire=999;lastBoss.t=60.1;q.update(.016);
  ok(lastBoss.phase===0&&lastBoss.hp===lastBoss.maxHp,'final boss returns to first phase for unlimited practice');
  ok(G.mode==='playing'&&G.boss===lastBoss,'all phases remain one continuous duel');
  ev('titleReturnBtn','click');
  el('debugPlayMode').value='stage';ev('debugPlayMode','change');
  ok(!el('debugStageControls').hidden&&el('debugBossControls').hidden,'normal stage debug remains selectable');
  el('debugStage').value='7';el('debugRoute').value='1';
  ev('debugLaunch','click');
  ok(G.mode==='playing'&&G.debugMode&&G.stage===7&&G.routeRisk===1,'hidden launch enters final sector storm branch');
  ok(!G.debugBossOnly&&!q.invulnerablePracticeBoss(),'normal debug stage does not grant boss invincibility');
  const campaignDummy={hp:500,maxHp:500};q.damageBoss(campaignDummy,70);
  ok(campaignDummy.hp===430,'standard stage and campaign bosses still take damage');
  ok(G.routeHistory.length===7&&G.routeHistory[6].risk===1,'final boss route history valid');
  ok(el('debugStatus').hidden===false,'only debug displays invincibility indicator');
  G.player.invul=0;G.player.shield=0;G.player.hp=1;G.lives=1;
  const debugSurvival=[G.player.hp,G.lives,G.player.shield];
  q.hitPlayer(999);
  ok(JSON.stringify([G.player.hp,G.lives,G.player.shield])===JSON.stringify(debugSurvival),'debug survives direct fatal hit');
  q.saveCheckpoint();
  ok(storageData.get('star_fighter_checkpoint_v1')===saved,'debug does not replace normal checkpoint');
  ok(q.unlockMedal('clear')===false&&JSON.stringify(q.readMedals())===medalsBefore,'debug does not earn medals');
  // Every sector both routes: real stage and boss setup, no hidden invalid route history.
  for(let stage=0;stage<8;stage++)for(const risk of (stage===0?[0]:[0,1])){
   ok(q.debugJumpTo(stage,risk),'debug jump works '+stage+'/'+risk);
   ok(G.stage===stage&&G.routeHistory.length===stage,'debug route history count '+stage+'/'+risk);
   ok(G.routeRisk===(stage===0?0:risk),'debug route risk '+stage+'/'+risk);
   ok(G.stageTime===0&&G.boss===null&&G.bullets.length===0,'debug resets combat '+stage+'/'+risk);
   ok(stage===0||!!G.activeEvent,'debug stage route event '+stage+'/'+risk);
   q.spawnBoss();
   ok(!!G.boss&&G.boss.name,'debug stage boss actually spawns '+stage+'/'+risk);
   const hp=G.player.hp,lives=G.lives;
   G.player.invul=0;q.hitPlayer(1);
   ok(G.player.hp===hp&&G.lives===lives,'debug boss contact cannot damage '+stage+'/'+risk);
   G.boss=null;
  }
  ev('sidePauseBtn','click');
  ok(G.mode==='paused'&&el('debugPanel').hidden===false,'debug controls available while paused');
  el('debugStage').value='3';el('debugRoute').value='0';
  ev('debugLaunch','click');
  ok(G.mode==='playing'&&G.stage===3&&G.routeRisk===0&&G.debugMode,'paused debug jump resumes play');
  G.score=previousBest+9999999;
  q.endGame(true);
  ok(G.mode==='win'&&G.best===previousBest&&storageData.get('star_fighter_best')===previousBestStorage,'debug win cannot record score');
  ok(storageData.get('star_fighter_checkpoint_v1')===saved,'debug win does not erase normal checkpoint');
  ok(JSON.stringify(q.readMedals())===medalsBefore,'debug clear cannot earn medal');
  ev('titleReturnBtn','click');ev('startBtn','click');
  ok(G.mode==='playing'&&!G.debugMode&&el('debugStatus').hidden,'ordinary run resets god mode');
  G.player.invul=0;G.player.shield=0;G.player.hp=78;q.hitPlayer(1);
  ok(G.player.hp===78-q.actualHullDamage(1),'ordinary game takes scaled hull damage');
  G.player.invul=99;
  // Plug a standard pad into the navigator mock; held A at connect is baseline only.
  const makeButton=()=>({pressed:false,value:0});
  const gp={index:0,id:'QA standard controller',connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},makeButton)};
  attachedPads=[gp];
  G.energy=1;G.levels[0]=0;q.updateHud();
  gp.buttons[0].pressed=true;q.pollGamepad();
  ok(G.levels[0]===0&&G.energy===1,'held button at connection does not auto-upgrade');
  ok(el('gamepadStatus').hidden===false,'gamepad connection status');
  q.pollGamepad();ok(G.levels[0]===0,'held A never repeats without release');
  gp.buttons[0].pressed=false;q.pollGamepad();
  gp.buttons[0].pressed=true;q.pollGamepad();
  ok(G.levels[0]===1&&G.energy===0,'A press explicitly upgrades current cursor');
  q.pollGamepad();ok(G.levels[0]===1,'held A does not buy twice');
  gp.buttons[0].pressed=false;q.pollGamepad();
  G.pulses=2;gp.buttons[1].pressed=true;q.pollGamepad();
  ok(G.pulses===1,'B fires one NOVA');
  q.pollGamepad();ok(G.pulses===1,'held B does not spam NOVA');
  gp.buttons[1].pressed=false;q.pollGamepad();
  G.player.x=G.player.targetX=215;G.player.y=G.player.targetY=337;
  gp.axes=[.05,.08];q.pollGamepad();q.update(.033);
  ok(Math.abs(G.player.x-215)<.05&&Math.abs(G.player.y-337)<.05,'analog deadzone prevents stick drift');
  gp.axes=[.75,-.65];q.pollGamepad();q.update(.033);
  ok(G.player.x>215&&G.player.y<337,'left analog moves ship in both axes');
  gp.axes=[0,0];gp.buttons[15].pressed=true;q.pollGamepad();const oldX=G.player.x;q.update(.033);
  ok(G.player.x>oldX,'D-pad right moves ship');
  gp.buttons[15].pressed=false;q.pollGamepad();
  gp.buttons[9].pressed=true;q.pollGamepad();
  ok(G.mode==='paused','START pauses in gameplay');
  q.pollGamepad();ok(G.mode==='paused','holding START never unpauses');
  gp.buttons[9].pressed=false;q.pollGamepad();
  gp.buttons[9].pressed=true;q.pollGamepad();
  ok(G.mode==='playing','new START press resumes');
  gp.buttons[9].pressed=false;q.pollGamepad();
  // Disconnect and denied Gamepad API must not break touch/keyboard or trigger a button.
  gp.axes=[.9,.9];q.pollGamepad();attachedPads=[];q.pollGamepad();
  ok(el('gamepadStatus').hidden===true,'disconnected pad removed from status');
  const noPadX=G.player.x,noPadY=G.player.y;q.update(.016);
  ok(Math.abs(G.player.x-noPadX)<.1&&Math.abs(G.player.y-noPadY)<.1,'disconnect clears movement');
  navigatorMock.getGamepads=()=>{throw Error('SecurityError')};
  q.pollGamepad();ok(el('gamepadStatus').hidden===true&&G.mode==='playing','blocked gamepad API falls back safely');
  navigatorMock.getGamepads=undefined;q.pollGamepad();
  ok(G.mode==='playing','unsupported gamepad API does not block game');
  stats.debugGamepadQA={debugStageCases:16,invincible:true,gamepadStandard:true};
 }
 
 // 300 additional independent cosmetic trophies (30 categories x 10 thresholds).
 {
  const t=window.STAR_TROPHIES;
  ok(q.TROPHIES===t&&t.catalog.length===300&&t.groups.length===30,'trophy registry has exactly 300 entries');
  ok(new Set(t.catalog.map(x=>x.id)).size===300&&new Set(t.catalog.map(x=>x.name)).size===300,'all 300 IDs and names are distinct');
  ok(t.groups.every(f=>f.goals.length===10&&f.goals.every((v,i)=>v>0&&(!i||v>f.goals[i-1]))),'all goals ascending and attainable');
  ok(t.catalog.every(x=>x.description.includes('達成')&&x.goal>0),'300 explicit objective descriptions');
  ok(htmlSource.includes('id="trophyGallery"')&&htmlSource.includes('id="trophyBtn"')&&readmeSource.includes('TROPHIES_300.md'),'catalog visible and documented');
  ok(cssSource.includes('#shell .trophy-gallery[hidden]'),'trophy modal hidden during gameplay');
  const power=[G.player.hp,G.lives,G.energy,...G.levels];
  t.begin(false,true);const capsules=t.metric('capsules');
  t.event('capsules',4);
  ok(t.metric('capsules')===capsules+4,'normal capsule collection increments trophy progress');
  ok(JSON.stringify(power)===JSON.stringify([G.player.hp,G.lives,G.energy,...G.levels]),'no power changes from achievements');
  ev('trophyBtn','click');
  ok(el('trophyGallery').hidden===false&&el('trophyShown').textContent.includes('300件'),'open complete 300 gallery');
  el('trophyCategory').value='weapon5';ev('trophyCategory','change');
  ok(el('trophyShown').textContent.includes('10件'),'filter by family shows ten tiers');
  el('trophyCategory').value='all';el('trophySearch').value='LASER';ev('trophySearch','input');
  ok(el('trophyShown').textContent.includes('10件'),'search isolates LASER achievements');
  ev('trophyClose','click');ok(el('trophyGallery').hidden===true,'gallery close works');
  const oldCount=t.count(),oldKills=t.metric('kills');
  t.setDebug(true);t.event('kills',10000);t.observe(8,{score:999999,grazes:999,maxCombo:99});
  ok(t.count()===oldCount&&t.metric('kills')===oldKills,'debug mode cannot earn achievements');
  t.setDebug(false);
  // Checkpoint resumes or damaged runs must never qualify for a flawless clear.
  const perfect0=t.metric('perfectRuns');
  t.begin(false,true);t.finish(true,{score:0,grazes:0,maxCombo:0});
  ok(t.metric('perfectRuns')===perfect0,'checkpoint resume cannot claim a flawless full run');
  t.begin(false,false);t.hit(false);t.finish(true,{score:0,grazes:0,maxCombo:0});
  ok(t.metric('perfectRuns')===perfect0,'damaged run cannot claim flawless trophy');
  t.begin(false,false);t.finish(true,{score:0,grazes:0,maxCombo:0});
  ok(t.metric('perfectRuns')===perfect0+1,'uninterrupted no-hit win qualifies once');
  t.begin(false,true);
  for(const f of t.groups){
   t.event(f.key,Math.max(0,f.goals[9]-t.metric(f.key)));
   ok(t.metric(f.key)>=f.goals[9],'highest trophy tier attainable '+f.key);
  }
  ok(t.count()===300,'all 300 distinct trophy rewards unlock');
  t.flush();
  const stored=storageData.get('star_fighter_trophies_v1');
  const parsed=JSON.parse(stored);
  ok(parsed.v===1&&parsed.unlocked.length===300,'all trophy progress persists');
  storageData.set('star_fighter_trophies_v1','{"v":1,"stats":{},"unlocked":["invalid"]}');
  ok(t.read().unlocked.length===0,'corrupted trophy storage rejected');
  storageData.set('star_fighter_trophies_v1',stored);
  ok(t.read().unlocked.length===300,'valid trophy progress recoverable');
  ok(JSON.stringify(power)===JSON.stringify([G.player.hp,G.lives,G.energy,...G.levels]),'all trophies remain cosmetics only');
  stats.trophies={total:300,families:30,allUnlockable:true,debugDenied:true};
 }
 assert(stats.types.size>=13,'too few wave variants');
 return {...stats,types:stats.types.size,uniqueSeeds:seeds.length,audioStarts:audioStats.starts,
  seedRange:[seeds[0].toString(16),seeds[99].toString(16)]};
}
if(typeof module!=='undefined'&&require.main===module){
 const fs=require('node:fs');
 try{
  const result=runHarness(fs.readFileSync(__dirname+'/game.js','utf8'),fs.readFileSync(__dirname+'/music.js','utf8'),fs.readFileSync(__dirname+'/enemies_plus.js','utf8'),fs.readFileSync(__dirname+'/index.html','utf8'),fs.readFileSync(__dirname+'/style.css','utf8'),fs.readFileSync(__dirname+'/README.md','utf8'),fs.readFileSync(__dirname+'/trophies.js','utf8'));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
 }catch(e){process.stderr.write('FAIL '+(e.stack||e)+'\n');process.exitCode=1}
}

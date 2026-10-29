/* STAR FIGHTER seed/formation safety regression.
 * Run from games/star-fighter/: node qa_100_runs.js
 * Deterministic headless tests; not a replacement for physical-device QA. */
'use strict';
function runHarness(gameSource,musicSource){
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
 const ev=(id,type,more={})=>(el(id).handlers?.[type]||[]).forEach(fn=>fn({
  pointerId:1,clientX:80,clientY:120,preventDefault(){},stopPropagation(){},...more
 }));
 let frame=null,clock=0;
 const hooked=gameSource.replace(/\}\)\(\);\s*$/,'window.__QA={G,seedStage,spawnWave,routeProfile,waveRadius,waveClearance,placeOutsideLane,planTerrain,advanceTerrain,resetTerrain,terrainQueued,bullet,update,spawnBoss,stageClear,openRoute,chooseRoute,drawScene,routeOffer,rewardOptions,openReward,chooseReward,hitPlayer,readCheckpoint,saveCheckpoint,chargeDrive,playerFire,pulse,nextStage,pickupMagnetRadius,pickupPullSpeed,salvageRate,PASSIVES,SYNERGIES,synergyActive,synergySummary,applyShotSynergy,steerDrone};})();');
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
  G.boss=null;G.bossDone=false;G.transitioning=false;G.directorGrace=0;G.waveSerial=0;
  G.player.hp=3;G.player.invul=0;G.player.shield=0;G.lives=3;
  G.player.x=215;G.player.targetX=215;G.player.y=337;G.player.targetY=337;
  G.selected=0;G.energy=0;G.pulses=2;G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
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
  ok(w.timer>=1.35,'warning shorter than 1.35s');
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
  stats.waves++;stats.units+=w.units.length;stats.minUnits=Math.min(stats.minUnits,w.units.length);
  stats.maxUnits=Math.max(stats.maxUnits,w.units.length);stats.types.add(w.kind);
 }
 for(const seed of seeds){
  for(const stage of [0,1,2]){
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
     ok(t.blocks.filter(b=>b.hp>0).length===2,'terrain should block two lanes');
     ok(t.blocks[t.safeLane].hp===0,'terrain safe lane obstructed');
     ok(!q.spawnWave() && G.pendingWave===null,'terrain allows wave overlap');
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
    G.enemies=[{x:1100,y:337}];G.bullets=[];
    ok(!q.planTerrain(),'terrain began while hostile still active');
    G.enemies=[];G.bullets=[{x:600,y:337}];
    ok(!q.planTerrain(),'terrain began while hostile bullets active');
    G.bullets=[];
    G.terrainIndex=2;
    const max=q.routeProfile().maxEnemies;
    G.enemies=Array.from({length:max},(_,i)=>({x:1000+i*8,y:120}));
    ok(!q.spawnWave(),'formation over max enemy budget');
    G.enemies=[];
   }
  }
 }
 // Simulate all 100 seeds across all three sectors (100 complete synthetic runs).
 // The ship is invulnerable to isolate spawn safety; this is not a human win-rate test.
 const live={runs:seeds.length,stageCases:0,terrainComplete:0,missed:[],
  maxEnemies:0,maxBullets:0,overlapFrames:0,eventsTriggered:0,simulationTicks:0};
 for(const seed of seeds){
  for(const stage of [0,1,2]){
   const risk=stage===0?0:(seed>>>stage)&1;
   stageSetup(seed,stage,risk);
   G.stageTime=0;G.terrainIndex=0;q.resetTerrain();G.spawn=1.4;
   G.player.invul=10000;G.activeEvent=stage===0?null:q.routeOffer(stage-1,risk).event;
   G.eventTriggered=false;G.eventChain=false;
   G.particles=[];G.rings=[];G.trail=[];G.pickups=[];G.bullets=[];G.shots=[];
   const deadline=[62,68,74][stage];
   let ticks=0;
   while(G.stageTime<deadline+.2&&ticks++<1900){
    q.update(.05);
    live.simulationTicks++;
    live.maxEnemies=Math.max(live.maxEnemies,G.enemies.length);
    live.maxBullets=Math.max(live.maxBullets,G.bullets.length);
    if(G.terrain&&G.pendingWave)live.overlapFrames++;
    ok(G.enemies.length<=q.routeProfile().maxEnemies,'live enemy overflow');
    ok(G.bullets.length<=120,'live bullet overflow');
    if(G.boss)break;
   }
   live.stageCases++;
   if(G.eventTriggered)live.eventsTriggered++;
   if(G.terrainIndex===2)live.terrainComplete++;
   else live.missed.push({seed,stage,terrainIndex:G.terrainIndex,time:G.stageTime});
  }
 }
 ok(live.overlapFrames===0,'live terrain-wave overlap');
 ok(live.missed.length===0,'terrain encounter missing in simulated run');
 stats.liveSimulation=live;
 stageSetup(seeds[0],0,0);
 for(let i=0;i<300;i++)q.bullet(900,200,Math.PI,300,5);
 stats.maxBullets=G.bullets.length;
 ok(G.bullets.length<=120,'unbounded hostile bullets');
 G.bullets=[];G.player.invul=9999;
 q.update(.016);ok(G.shots.length>0,'auto fire regression');
 ev('touchPad','pointerdown',{clientX:50,clientY:100});
 const before=G.player.x;
 ev('touchPad','pointermove',{clientX:100,clientY:100});
 ok(G.player.x>before+40,'touchpad latency');
 ev('touchPad','pointerup',{clientX:100,clientY:100});
 const stopped=G.player.x;
 q.update(.016);ok(Math.abs(G.player.x-stopped)<1,'touch release drift');
 ev('sidePauseBtn','click');ok(G.mode==='paused','pause');
 ok(el('sidePauseBtn').innerHTML.includes('<span>再開</span>'),'pause label');
 ev('sidePauseBtn','click');ok(G.mode==='playing','resume');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'resume label');
 ev('sidePulseBtn','click');ok(G.pulses===1,'pulse');
 G.energy=6;ev('sideEquipBtn','click');ok(G.levels[0]===1,'upgrade');
 ev('titleReturnBtn','click');ok(G.mode==='title','title');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'title label reset');
 ev('startBtn','click');ok(G.mode==='playing','restart');
 ok(el('sidePauseBtn').innerHTML.includes('<span>一時停止</span>'),'restart label reset');
 ev('soundBtn','click');ok(audioStats.starts>0,'BGM start');
 const priorSeed=G.runSeed;

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
 ok(Math.abs(q.salvageRate()-(q.routeProfile().pickupRate+.14))<.001,'salvage chance');
 // 15/36: weapon/passive synergy activation and bounded effects.
 G.enemies=[];G.boss=null;G.shots=[];G.bullets=[];G.particles=[];G.rings=[];
 G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
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
 G.levels[0]=1;ok(Math.abs(q.salvageRate()-(baseSalvage+.12))<.001,'boost salvage bonus');
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
 G.energy=0;G.pulses=2;G.player.shield=0;G.player.hp=3;G.lives=3;G.driveCharge=0;G.levels=[0,0,0,0,0,0];G.passives=[0,0,0,0,0,0];
 G.runSeed=priorSeed;
 q.spawnBoss();ok(!!G.boss,'boss spawn');
 G.boss.hp=0;q.update(.016);ok(G.transitioning,'boss defeated');
 for(let i=0;i<260&&G.mode!=='reward';i++)q.update(.016);
 ok(G.mode==='reward','reward draft after first boss');
 ok(G.rewardOffers.length===3&&new Set(G.rewardOffers.map(o=>o.id)).size===3,'unique 3 rewards');
 const beforeReward=q.readCheckpoint();
 ok(beforeReward?.mode==='reward','reward gate checkpoint');
 ev('titleReturnBtn','click');ev('continueBtn','click');
 ok(G.mode==='reward','reward gate resumes');
 ev('rewardCard0','click');
 ok(G.mode==='route','reward then route');
 ok(G.passives.reduce((sum,n)=>sum+n,0)===1,'first passive acquired');
 ok(q.readCheckpoint()?.mode==='route','reward claim checkpoint');
 const claimedRewards=G.rewardHistory.length,claimedPassives=G.passives.slice();
 ev('titleReturnBtn','click');ev('continueBtn','click');
 ok(G.mode==='route'&&G.rewardHistory.length===claimedRewards,'claimed reward cannot be repeated after reload');
 ok(JSON.stringify(G.passives)===JSON.stringify(claimedPassives),'passive persists through route checkpoint');
 ev('routeRisk','click');ok(G.mode==='playing'&&G.stage===1,'risk route');
 q.spawnBoss();G.boss.hp=0;q.update(.016);
 for(let i=0;i<260&&G.mode!=='reward';i++)q.update(.016);
 ok(G.mode==='reward','reward draft after second boss');
 ev('rewardCard1','click');
 ok(G.mode==='route','second reward then route');
 ev('routeSafe','click');ok(G.stage===2,'safe route');
 q.spawnBoss();G.boss.hp=0;q.update(.016);
 for(let i=0;i<260&&G.mode!=='win';i++)q.update(.016);
 ok(G.mode==='win','3-stage victory');
 ok(G.rewardHistory.length===2,'two rewards across three stages');
 ev('startBtn','click');ok(G.mode==='playing','new game after win');
 ok(G.passives.every(n=>n===0),'new run clears all passive ranks');
 ok(!!q.readCheckpoint(),'checkpoint exists');
 ev('titleReturnBtn','click');ok(G.mode==='title','title before continue');
 ev('continueBtn','click');ok(G.mode==='playing','checkpoint continue');
 G.player.invul=0;G.player.hp=1;G.lives=1;
 q.hitPlayer(1);ok(G.mode==='over','game over');
 ok(q.readCheckpoint()===null,'checkpoint cleared on game over');
 assert(stats.types.size>=13,'too few wave variants');
 return {...stats,types:stats.types.size,uniqueSeeds:seeds.length,audioStarts:audioStats.starts,
  seedRange:[seeds[0].toString(16),seeds[99].toString(16)]};
}
if(typeof module!=='undefined'&&require.main===module){
 const fs=require('node:fs');
 try{
  const result=runHarness(fs.readFileSync(__dirname+'/game.js','utf8'),fs.readFileSync(__dirname+'/music.js','utf8'));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
 }catch(e){process.stderr.write('FAIL '+(e.stack||e)+'\n');process.exitCode=1}
}

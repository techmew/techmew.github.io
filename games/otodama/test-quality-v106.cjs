// node test-quality-v106.cjs
// Source-level V8 regression; NOT Chromium/Android/Cloudflare.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script,'inline game script');new Function(script);
function part(start,end){const a=script.indexOf(start),b=script.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'segment '+start);return script.slice(a,b)}
let checks=0;function check(value,reason){assert.ok(value,reason);checks++}
const stageCode=part('function stageHazard(stage,turn)','function showStage()');
const stages=new Function('gen','hash','clamp','levelOf',stageCode+'return {stageEnemy,learningRelief,enemyAdvice};')(
 seed=>({seed,stats:[80,80,80,80,80],name:'敵',parts:{},voice:{}}),n=>n>>>0,(n,a,b)=>Math.max(a,Math.min(b,n)),()=>3);
check(stages.learningRelief(1,0)===0,'first attempt');
check(stages.learningRelief(1,1)===0,'first loss new challenger');
check(stages.learningRelief(1,2)===2,'second loss aid');
check(stages.learningRelief(1,9)===8,'aid cap');
check(stages.learningRelief(5,9)===4,'boss cap');
const foe2=stages.stageEnemy(8,{seed:2345},2),foe9=stages.stageEnemy(8,{seed:2345},9);
check(foe2.archetype===foe9.archetype,'same-role control');
check(foe2.stats.every((v,i)=>v-foe9.stats[i]===6),'aid after archetype');
check(foe2.seed!==foe9.seed,'new opponent after loss');
check(stages.stageEnemy(5,{seed:2345},0).learningRelief===0,'boss starts full strength');
check(stages.stageEnemy(5,{seed:2345},9).learningRelief===4,'boss mercy cap');
check(stages.enemyAdvice({...foe2,stage:5}).includes('ボス'),'boss advice');
check(stages.enemyAdvice({...foe2,stage:8}).length>3,'regular advice');
const timingCode=part('function trainingWindow(m)','function lifelineMitigation(');
const timings=new Function('SOULS','soulFor',timingCode+'return {trainingWindow,guardTiming,dodgeTiming,strikeTiming};')([0,1,2,3,4,5],()=>0);
const match=(stage,live=false,mode='COM MATCH')=>({stageNo:stage,live,mode,a:{}});
check(timings.trainingWindow(match(1))===.055,'stage 1 leniency');
check(timings.trainingWindow(match(4))===.025,'stage 4 leniency');
check(timings.trainingWindow(match(6))===0,'stage 6 default');
check(timings.trainingWindow(match(1,true))===0,'live unaffected');
check(timings.trainingWindow(match(1,false,'DAILY CHALLENGE'))===0,'daily unaffected');
for(const method of ['guardTiming','dodgeTiming']){
 const early=timings[method](match(1),{}),late=timings[method](match(6),{});
 check(early[0]<late[0]&&early[1]>late[1],method+' beginner window');
}
const early=timings.strikeTiming(match(1)),late=timings.strikeTiming(match(6));
check(early[0]<late[0]&&early[1]>late[1],'precision beginner window');
const live=timings.guardTiming(match(1,true),{});
check(live[0]===.20&&live[1]===.72,'live guard unchanged');
const canvasCode=part('let arenaPixelRatio=1;','const ease=');
const nodes={arenaCanvas:{width:720,height:450},lowFx:{checked:false}},transforms=[];
const configure=new Function('$','navigator','window','acv',canvasCode+'return configureBattleCanvas;')(
 id=>nodes[id],{deviceMemory:8},{devicePixelRatio:2},{setTransform:(...a)=>transforms.push(a)});
check(configure()===2&&nodes.arenaCanvas.width===1440&&nodes.arenaCanvas.height===900,'retina backing resolution');
check(transforms.length===1&&transforms[0][0]===2,'retina logical transform');
check(configure()===2&&transforms.length===1,'no redundant canvas resize');
nodes.lowFx.checked=true;check(configure()===1&&nodes.arenaCanvas.width===720,'low-FX resolution');
check(transforms.length===2&&transforms[1][0]===1,'low-FX logical transform');
const bridge=new Function(part('function musicBridge(bar,urgent,boss)','function musicTick(')+'return musicBridge;')();
check(bridge(8,false,false)&&bridge(11,false,false),'bridge starts/ends');
check(!bridge(12,false,false),'bridge stops');
check(!bridge(8,true,false),'urgent battle bypasses bridge');
check(!bridge(8,false,true),'boss bypasses bridge');
for(const marker of ['voiceCache.has(key)','OTODAMA_SAVE','次のバトルへ →','WIN❗️','id="timingCallout"','drawImpactBurst(canvas,match,ms,lowFx)','drawStageAtmosphere(canvas,biome,t,lowFx)','function receiveLiveImpact(data)','v0.10.12'])check(html.includes(marker),'preserve '+marker);
console.log('PASS: '+checks+' v0.10.8 regression assertions (source/V8 only).');

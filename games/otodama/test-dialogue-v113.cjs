// CPU victory short Japanese TTS + winner roar; simulated WebAudio and result progression.
// No actual browser, microphone, speaker or Cloudflare test.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'game JavaScript exists');new Function(script);
const start=script.indexOf('const TAUNT_PARTS='),end=script.indexOf('const AUTO_STYLES=',start);
assert.ok(start>0&&end>start,'result presentation engine');
const src=script.slice(start,end);
const isolated=src.slice(0,src.indexOf('let battleSpeechGeneration='));
const {tauntLine,TAUNT_COUNT,TAUNT_PARTS}=new Function(isolated+'return {tauntLine,TAUNT_COUNT,TAUNT_PARTS};')();
assert.equal(TAUNT_COUNT,1000);
const all=new Set();
for(const kind of ['win','lose']){
 assert.equal(TAUNT_PARTS[kind].opening.length,10);
 assert.equal(TAUNT_PARTS[kind].middle.length,10);
 assert.equal(TAUNT_PARTS[kind].ending.length,5);
 for(let i=0;i<500;i++){
  const sentence=tauntLine(kind,i);
  assert.ok(sentence.length>=17&&sentence.length<=36,'natural short Japanese result text');
  all.add(sentence);
 }
}
assert.equal(all.size,1000);
const nodes=new Map(),store=new Map(),timers=[],voices=[],actions=[],spoken=[];
const $=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,checked:false,value:12,textContent:'',
 classList:{contains:()=>true,toggle(){} }});return nodes.get(id)};
$('roarEnabled').checked=true;$('mutedCheck').checked=false;
const own={seed:11,name:'味方',voiceClip:'reviewed',voice:{pitch:58}};
const foe={seed:12,name:'相手',voice:{pitch:44}};
const first={a:own,b:foe,outcome:{winner:0},mode:'COM MATCH',done:true};
let now=1000,invisible=false,mutedOpponent=false;
const param={setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}};
const audio={currentTime:5,state:'running',
 createBufferSource(){const source={buffer:null,playbackRate:{value:1},connect(){},stop(){},start(){voices.push('recorded')}};return source},
 createGain(){return{gain:param,connect(){}}},
 createOscillator(){return{frequency:param,connect(){},start(){voices.push('synth')},stop(){}}},
 createBiquadFilter(){return{frequency:{value:0},Q:{value:0},connect(){}}}};
const synth={speaking:false,cancel(){this.speaking=false},speak(v){this.speaking=true;spoken.push(v)},getVoices(){return [{lang:'ja-JP'}]}};
const ctx={first,window:{speechSynthesis:synth,SpeechSynthesisUtterance:class{constructor(text){this.text=text}}},document:{get hidden(){return invisible}},
 localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))},
 performance:{now:()=>now},$,displayName:x=>x.name,VOLUME:()=>.12,clipData:x=>x.voiceClip||null,
 decodeVoice:async()=>({buffer:{},offset:.2,duration:.7,gain:1}),
 unlockBattleAudio:()=>audio,voiceOutput:()=>({}),trackAttackSource:()=>{},stopAttackVoices:()=>{},
 setTimeout:(fn,delay)=>{const task={fn,delay,cancelled:false};timers.push(task);return task},
 clearTimeout:t=>{if(t)t.cancelled=true},
 doCom:()=>actions.push('COM'),nextSurvivalBattle:()=>actions.push('SURVIVAL'),
 closeBattle:()=>actions.push('CLOSE'),startRandomMatch:()=>actions.push('ONLINE'),serverBase:()=>null};
const env='let match=d.first;let survivalActive=true,survivalAwaitingVisibility=false,bgmDuckUntil=0,lastSoundStatus="";'+
 'const window=d.window,document=d.document,localStorage=d.localStorage,performance=d.performance,'+
 '$=d.$,displayName=d.displayName,VOLUME=d.VOLUME,clipData=d.clipData,decodeVoice=d.decodeVoice,'+
 'unlockBattleAudio=d.unlockBattleAudio,voiceOutput=d.voiceOutput,trackAttackSource=d.trackAttackSource,'+
 'stopAttackVoices=d.stopAttackVoices,setTimeout=d.setTimeout,clearTimeout=d.clearTimeout,'+
 'doCom=d.doCom,nextSurvivalBattle=d.nextSurvivalBattle,closeBattle=d.closeBattle,'+
 'startRandomMatch=d.startRandomMatch,serverBase=d.serverBase;';
const api=new Function('d',env+src+
 'return {showBattleQuote,playVictoryRoar,scheduleNextAfterQuote,nextTaunt,advanceAfterWin,isCpuResult,'+
 'set match(v){match=v},get deferred(){return survivalAwaitingVisibility}}')(ctx);
(async()=>{
 api.showBattleQuote(first);
 await Promise.resolve();await Promise.resolve();
 assert.equal(voices.filter(v=>v==='recorded').length,2,'local winner roars using two recorded layers');
 assert.equal(spoken.length,0,'no Japanese speech synthesis of results');
 assert.ok($('battleSpeech').hidden,'player win cannot show a dialogue bubble');
 assert.equal($('battleSpeechText').textContent,'','player win is voice only');
 assert.ok(!$('repeatSpeechBtn').hidden,'replay button visible on result');
 const line=first.tauntText;
 await api.playVictoryRoar(first);
 assert.equal(voices.filter(v=>v==='recorded').length,4,'replay roar uses recording');
 api.showBattleQuote(first);
 assert.equal(first.tauntText,line,'resume does not consume another text line');
 api.scheduleNextAfterQuote(first);
 const next=timers.filter(t=>!t.cancelled).at(-1);
 assert.equal(next?.delay,3350,'win autoplay delay remains');
 now=6000;next.fn();assert.deepEqual(actions,['COM'],'COM win continues automatically');
 const lost={a:own,b:foe,outcome:{winner:1},mode:'SURVIVAL',done:true};
 api.match=lost;api.showBattleQuote(lost);
 assert.equal(voices.at(-1),'synth','CPU opponent wins with synthesized roar when no recorded clip exists');
 assert.ok(!$('battleSpeech').hidden,'CPU loss keeps dialogue text');
 assert.equal($('battleSpeechWho').textContent,'相手：');
 assert.ok(lost.tauntText.length<=18,'CPU line is a single short phrase');
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 const speakTask=timers.filter(t=>!t.cancelled).at(-1);
 assert.ok(speakTask?.delay>=100,'CPU speaks only after its victory roar');
 now+=1350;speakTask.fn();
 assert.equal(spoken.length,1,'CPU victory text read aloud');
 assert.equal(spoken[0].text,lost.tauntText,'spoken line matches on-screen text');
 assert.equal(spoken[0].lang,'ja-JP','Japanese TTS');
 const before=timers.length;api.scheduleNextAfterQuote(lost);
 assert.equal(timers.length,before,'defeat does not schedule another battle');
 const online={a:own,b:foe,outcome:{winner:1},mode:'ONLINE LIVE',live:true,done:true};
 api.match=online;const beforeOnline=voices.length;api.showBattleQuote(online);
 assert.ok($('battleSpeech').hidden,'online opponent gets NO dialogue text');
 assert.equal(online.tauntText,'','online winner has no generated dialogue');
 assert.equal(voices.length,beforeOnline,'online human without a recording must not use a synthetic voice');
 assert.equal(spoken.length,1,'online opponent must not trigger CPU TTS');
 $('muteOpponentVoice').checked=true;
 const soundCount=voices.length;await api.playVictoryRoar(online);
 assert.equal(voices.length,soundCount,'online opponent mute respected');
 $('muteOpponentVoice').checked=false;
 const onlineWin={...online,outcome:{winner:0},resultPresented:false};
 api.match=onlineWin;api.showBattleQuote(onlineWin);await Promise.resolve();await Promise.resolve();
 assert.ok($('battleSpeech').hidden,'online player win also has no dialogue bubble');
 assert.equal(voices.at(-1),'recorded','local player online win still plays local recorded voice');
 $('roarEnabled').checked=false;
 const off=voices.length;await api.playVictoryRoar(onlineWin);
 assert.equal(voices.length,off,'roar opt-out respected');
 $('roarEnabled').checked=true;
 invisible=true;const hidden={...first,resultPresented:false};
 api.match=hidden;const prior=voices.length;api.showBattleQuote(hidden);
 assert.equal(voices.length,prior,'hidden tab does not play win sound');
 invisible=false;await api.playVictoryRoar(hidden);
 assert.equal(voices.at(-1),'recorded','roar can be replayed after tab resumes');
 assert.ok(html.includes('id="roarEnabled"')&&html.includes('id="repeatSpeechBtn"'));
 assert.ok(!html.includes('id="talkEnabled"')&&!script.includes('speakBattleQuote('));
 // A microphone recording may decode after the next match starts: never play the old victory.
 let completeDecode;
 const pending={...first,resultPresented:false,roarEndsAt:0};
 const delayedCtx={...ctx,first:pending,decodeVoice:()=>new Promise(resolve=>completeDecode=resolve)};
 const delayedApi=new Function('d',env+src+'return {showBattleQuote,set match(v){match=v}}')(delayedCtx);
 const priorStale=voices.length;
 delayedApi.showBattleQuote(pending);
 delayedApi.match={...pending,done:false};
 completeDecode({buffer:{},offset:.2,duration:.7,gain:1});
 await Promise.resolve();await Promise.resolve();
 assert.equal(voices.length,priorStale,'delayed previous match audio must never play');
 // Explicit user audio interaction should recover a suspended mobile AudioContext.
 audio.state='suspended';
 audio.resume=async()=>{audio.state='running'};
 api.match=first;
 const beforeResume=voices.length;
 await api.playVictoryRoar(first);
 assert.equal(audio.state,'running','suspended context must resume');
 assert.equal(voices.length,beforeResume+2,'recovered AudioContext replays recorded victory roar');
 assert.ok(script.includes("if(won||m.live||m.mode===\'COM MATCH\')scheduleNextAfterQuote(m)"),'CPU and online advance after resolution');
 assert.ok(!html.includes('id="bowBanner"'),'no pre-fight bow');
 console.log('RESULT VOICE PASS | CPU Japanese TTS after roar, short dialogue, player/online privacy, mute, autoplay and stale async');
})().catch(error=>{console.error(error);process.exitCode=1});

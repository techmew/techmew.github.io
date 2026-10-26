// Spoken Japanese result dialogue: 1000 unique lines + mocked speech and win/loss progression.
// Run from games/otodama/: node test-dialogue-v113.cjs
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'game JavaScript exists');new Function(script);
const start=script.indexOf('const TAUNT_PARTS='),end=script.indexOf('const AUTO_STYLES=',start);
assert.ok(start>0&&end>start,'dialogue engine');
const src=script.slice(start,end);
const isolated=src.slice(0,src.indexOf('let battleSpeechGeneration='));
const {tauntLine,TAUNT_COUNT,TAUNT_PARTS}=new Function(isolated+'return {tauntLine,TAUNT_COUNT,TAUNT_PARTS};')();
assert.equal(TAUNT_COUNT,1000);
let all=[];
for(const k of ['win','lose']){
 assert.equal(TAUNT_PARTS[k].opening.length,10);
 assert.equal(TAUNT_PARTS[k].middle.length,10);
 assert.equal(TAUNT_PARTS[k].ending.length,5);
 for(let i=0;i<500;i++){
  const sentence=tauntLine(k,i);
  assert.ok(sentence.length>=24&&sentence.length<=110,'natural-length Japanese dialogue');
  all.push(sentence);
 }
}
assert.equal(new Set(all).size,1000,'exactly 1000 distinct Japanese result lines');
const nodes=new Map(),store=new Map(),timers=[],speech=[],actions=[];
const $=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,checked:false,value:12,textContent:'',
 classList:{contains:()=>true,toggle(){} }});return nodes.get(id)};
$('talkEnabled').checked=true;$('mutedCheck').checked=false;
let now=1000,invisible=false;
const first={a:{seed:11,name:'味方',voice:{pitch:58}},b:{seed:12,name:'相手',voice:{pitch:44}},
 outcome:{winner:0},mode:'COM MATCH',done:true};
let m=first;
class Utterance{constructor(text){this.text=text}}
const synth={speaking:false,paused:false,cancel(){this.speaking=false},
 getVoices(){return [{lang:'ja-JP',localService:true,name:'Japanese'}]},
 speak(u){this.speaking=true;speech.push(u)}};
const ctx={window:{speechSynthesis:synth,SpeechSynthesisUtterance:Utterance},
 document:{get hidden(){return invisible}},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))},
 performance:{now:()=>now},$,displayName:x=>x.name,
 clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
 setTimeout:(fn,delay)=>{const task={fn,delay,cancelled:false};timers.push(task);return task},
 clearTimeout:t=>{if(t)t.cancelled=true},
 doCom:()=>actions.push('COM'),nextSurvivalBattle:()=>actions.push('SURVIVAL'),
 closeBattle:()=>actions.push('CLOSE'),startRandomMatch:()=>actions.push('ONLINE'),serverBase:()=>null};
const env='let match=d.first;let survivalActive=true,survivalAwaitingVisibility=false;'+
 'const window=d.window,document=d.document,localStorage=d.localStorage,performance=d.performance,'+
 '$=d.$,displayName=d.displayName,clamp=d.clamp,setTimeout=d.setTimeout,clearTimeout=d.clearTimeout,'+
 'doCom=d.doCom,nextSurvivalBattle=d.nextSurvivalBattle,closeBattle=d.closeBattle,'+
 'startRandomMatch=d.startRandomMatch,serverBase=d.serverBase;';
const api=new Function('d',env+src+
 'return {showBattleQuote,speakBattleQuote,scheduleNextAfterQuote,stopBattleSpeech,nextTaunt,advanceAfterWin,'+
 'set match(v){match=v},get deferred(){return survivalAwaitingVisibility}}')( {...ctx,first});
api.showBattleQuote(m);
assert.equal(speech.length,1,'speech engine invoked on victory');
assert.equal(speech[0].lang,'ja-JP','Japanese locale');
assert.equal(speech[0].voice.lang,'ja-JP','Japanese TTS voice selected');
assert.ok($('battleSpeechText').textContent.includes('。'),'visible Japanese bubble');
assert.ok(!$('battleSpeech').hidden,'visible bubble after victory');
assert.ok(!/^</.test($('battleSpeechText').textContent),'plain dialogue text');
api.speakBattleQuote(m);assert.equal(speech.length,2,'replay triggers a new TTS utterance');
api.scheduleNextAfterQuote(m);
let next=timers.filter(t=>!t.cancelled).at(-1);
assert.ok(next&&next.delay===5100,'wait before auto-advance');
now=7000;synth.speaking=true;next.fn();
assert.equal(actions.length,0,'do not interrupt a spoken line');
now=9200;synth.speaking=false;next=timers.filter(t=>!t.cancelled).at(-1);next.fn();
assert.deepEqual(actions,['COM'],'victory automatically starts next COM stage');
const second={...first,outcome:{winner:1},mode:'SURVIVAL',tauntText:''};m=second;api.match=m;
api.showBattleQuote(second);
assert.ok($('battleSpeech').classList.toggle!==undefined);
assert.equal($('battleSpeechWho').textContent,'相手のセリフ','defeating opponent speaks');
const before=timers.length;api.scheduleNextAfterQuote(second);
assert.equal(timers.length,before,'defeat must never schedule another battle');
$('mutedCheck').checked=true;api.speakBattleQuote(second);
assert.ok($('battleSpeechState').textContent.includes('ミュート'));
$('mutedCheck').checked=false;$('talkEnabled').checked=false;api.speakBattleQuote(second);
assert.ok($('battleSpeechState').textContent.includes('OFF'));
const visited=new Set();
for(let i=0;i<500;i++)visited.add(api.nextTaunt('win'));
assert.equal(visited.size,500,'no duplicate spoken win line for 500 uses');
for(const id of ['battleSpeech','battleSpeechWho','battleSpeechText','repeatSpeechBtn','battleSpeechState',
 'bowBanner','talkEnabled','rematchBtn'])assert.ok(html.includes('id="'+id+'"'),'missing UI '+id);
assert.ok(script.includes('bowStartTimer=setTimeout'),'intro bow timer');
assert.ok(script.includes('if(!won)scheduleNextAfterQuote(m)')===false,'no defeat auto-next');
assert.ok(script.includes('if(won)scheduleNextAfterQuote(m)'),'win auto-next');
console.log('PASS: 1000 unique Japanese dialogue lines, TTS + replay, win auto-next, loss stop, mute and bow (mocked browser APIs)');

'use strict';
// Regression checks for visible 3-2-1 capture and exploration layout (Node/V8 mocks only).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js,{filename:'otodama-v141.js'});
const pos=id=>html.indexOf('id="'+id+'"');
assert.match(html,/id="fightBtn">▶ 探索開始<\/button>/,'start button says exploration');
assert.ok(pos('fightBtn')<pos('journeySummary')&&pos('journeySummary')<pos('survivalChallengerOptIn'),
 'exploration summary sits immediately under the start action');
assert.equal(html.split('id="journeySummary"').length-1,1,'one exploration summary');
assert.match(html,/id="evolutionCountdown"/,'evolution dialog has a dedicated time display');
assert.match(css,/#evolutionCountdown\{/,'large countdown styling');
assert.match(css,/#controlCard\.recording #countdown\{/,'birth countdown styling');
assert.match(js,/stopCaptureStream\(captureLiveStream\)/,'mic stream closed after backgrounding');
assert.match(js,/const CAPTURE_MS=2000,begin=performance\.now\(\)/,'two seconds start after mic-ready pre-roll');
const $nodes=new Map(),events=[],timers=[];
const $=id=>{if(!$nodes.has(id))$nodes.set(id,{textContent:'',hidden:true,dataset:{}});return $nodes.get(id)};
let generation=44;
const a=js.indexOf('async function waitForCaptureCountdown('),b=js.indexOf('async function startRecord(',a);
assert.ok(a>=0&&b>a);
const countdown=vm.runInNewContext(js.slice(a,b)+';({waitForCaptureCountdown,displayCaptureCountdown})',{
 $,captureIsCurrent:id=>id===generation,setTimeout(fn,ms){timers.push({fn,ms});return timers.length},
 console,Math});
(async()=>{
 const promise=countdown.waitForCaptureCountdown(44,true);
 for(let sec=3;sec>=1;sec--){
  assert.equal($('countdown').textContent,String(sec),'ready count '+sec);
  assert.equal($('evolutionCountdown').textContent,String(sec));
  const task=timers.shift();assert.equal(task.ms,330,'fast pre-roll under one second total');
  task.fn();await Promise.resolve();
 }
 assert.equal(await promise,true,'mic ready after 3-2-1');
 countdown.displayCaptureCountdown(2000,true);
 assert.equal($('countdown').textContent,'2.0 SEC','actual capture begins at full 2.0 sec');
 assert.equal($('evolutionCountdown').textContent,'2.0秒');
 countdown.displayCaptureCountdown(830,true);
 assert.equal($('evolutionCountdown').textContent,'0.8秒','remaining time updated during recording');
 const canceled=countdown.waitForCaptureCountdown(44,true);
 generation=45;timers.shift().fn();await Promise.resolve();
 assert.equal(await canceled,false,'background interrupt cancels countdown');
 // Fallback audio analysis is derived from the real decoded waveform, not empty placeholders.
 const start=js.indexOf('const DNA_FEATURE_NAMES=['),end=js.indexOf('function gen(seed,voice',start);
 assert.ok(start>=0&&end>start);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const hash=x=>{x=Math.imul(x^x>>>16,0x45d9f3b);x=Math.imul(x^x>>>16,0x45d9f3b);return(x^x>>>16)>>>0};
 const d=vm.runInNewContext(js.slice(start,end)+';({recoveredAudioFrames,analyseVoiceDNA,validAudioDNA})',{
  clamp,hash,Math,Map,Number,autocorr:()=>224});
 const sr=16000;
 const samples=Float32Array.from({length:sr*2},(_,i)=>Math.sin(i*2*Math.PI*224/sr)*.13);
 const audio={sampleRate:sr,getChannelData(){return samples}};
 const frames=d.recoveredAudioFrames(audio);
 assert.ok(frames.length>=8,'decoded 2s recording provides enough measured frames');
 const dna=d.analyseVoiceDNA(frames);
 assert.ok(d.validAudioDNA(dna),'voice gets usable 36-feature DNA despite suspended live analyser');
 const quiet=d.analyseVoiceDNA(d.recoveredAudioFrames({
  sampleRate:sr,getChannelData(){return new Float32Array(sr*2)}
 }));
 assert.equal(quiet,null,'silent audio cannot create fake voice DNA');
 console.log('EXPLORATION / CAPTURE v141 PASS | stage placement, ready 3-2-1, full 2s, cancel, real-audio DNA recovery');
})().catch(e=>{console.error(e);process.exitCode=1});

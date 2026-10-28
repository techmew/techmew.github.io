'use strict';
// WebAudio graph/mix regression using a synthetic AudioContext; not an audibility test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script);new vm.Script(script,{filename:'otodama-audio.js'});
const cut=(a,b)=>{const i=script.indexOf(a),j=script.indexOf(b,i);assert.ok(i>=0&&j>i,'audio boundary '+a);return script.slice(i,j)};
const master=cut('let voiceLimiter=null,voiceLimiterContext=null;','function trackAttackSource(');
const bgm=cut('let bgmTimer=null,bgmNext=0,bgmStep=0,bgmSession=0,bgmStartAt=0,bgmDuckUntil=0;','const MUSIC_VOLUME=');
const notes=cut('function musicNote(', 'function musicBridge(');
const toneSrc=cut('function tone(', 'function synthVoice(');
const stopSrc=cut('function stopBgm(){', 'function finishJingle(');
const impact=cut('function impactSfx(', 'let lastBattleFrame=');
let current=1000;
const flags={mutedCheck:{checked:false}};
const $=id=>flags[id]||{};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let sequence=0;
function audioParam(){return {value:0,automation:[],setValueAtTime(v,t){this.value=v;this.automation.push(['set',v,t])},
 linearRampToValueAtTime(v,t){this.value=v;this.automation.push(['linear',v,t])},
 exponentialRampToValueAtTime(v,t){this.value=v;this.automation.push(['exp',v,t])},
 setTargetAtTime(v,t,c){this.value=v;this.automation.push(['target',v,t,c])}}}
const graph=[];
function node(type){
 const n={name:type+'#'+(++sequence),type,connect(to){graph.push([this,to]);this.target=to},start(){this.started=true},stop(){this.stopped=true},
 frequency:audioParam(),gain:audioParam(),Q:{value:0},threshold:{value:0},knee:{value:0},ratio:{value:0},attack:{value:0},release:{value:0}};
 return n;
}
function audioCtx(){return {state:'running',currentTime:6,destination:node('destination'),
 createDynamicsCompressor:()=>node('compressor'),createGain:()=>node('gain'),
 createOscillator:()=>node('oscillator'),createBiquadFilter:()=>node('filter')}}
const ac=audioCtx();
const ctx={console,$,clamp,Math,performance:{now:()=>current},VOLUME:()=>.12,unlockBattleAudio:()=>ac,battleSoundCtx:ac};
const api=vm.runInNewContext(master+'\n'+bgm+'\n'+notes+'\n'+stopSrc+'\n'+toneSrc+'\n'+impact+
 ';this.mix={audioMaster,voiceOutput,bgmOutput,updateBgmDucking,musicNote,percussion,stopBgm,tone,impactSfx,setDuck(t){bgmDuckUntil=t}};this.mix',ctx);
const root=api.audioMaster(ac),voice=api.voiceOutput(ac),music=api.bgmOutput(ac);
assert.equal(api.audioMaster(ac),root,'same master for the same context');
assert.equal(api.voiceOutput(ac),voice,'reuse voice compressor');
assert.equal(api.bgmOutput(ac),music,'reuse music gain bus');
assert.equal(root.target,ac.destination,'master feeds destination');
assert.equal(voice.target,root,'voice compressor feeds shared master');
assert.equal(music.target,root,'music bus feeds shared master');
assert.equal(root.threshold.value,-24,'limit transient peaks across sources');
api.setDuck(1300);api.updateBgmDucking(ac);
assert.equal(music.gain.value,.44,'voice-triggered music duck reduces background');
api.stopBgm();assert.equal(music.gain.value,1,'victory jingle starts at full music level');
current=1500;api.updateBgmDucking(ac);
assert.equal(music.gain.value,1,'music restores after voice ends');
const beforeMusic=graph.length;
api.musicNote(ac,ac.currentTime+.05,440,.2,'melody',.006);
api.percussion(ac,ac.currentTime+.05,'kick',.004);
assert.ok(graph.length>beforeMusic,'synthesized backing sounds created');
assert.ok(graph.some(([n,out])=>n.type==='gain'&&out===music),'music and percussion use mix bus');
const beforeHit=graph.length;
api.impactSfx(27,{skill:true});
assert.ok(graph.length>beforeHit,'skill hit produces cues');
assert.ok(graph.some(([n,out])=>n.type==='gain'&&out===root),'impact cues route through master');
const beforeMute=graph.length;flags.mutedCheck.checked=true;
api.impactSfx(100,{skill:true});assert.equal(graph.length,beforeMute,'mute blocks impact');
flags.mutedCheck.checked=false;
const beforeDodge=graph.length;api.impactSfx(0,{dodge:true});
assert.ok(graph.length>beforeDodge,'dodge remains audible');
assert.match(script,/const start=ac\.currentTime\+\.018,level=Math\.min\(\.19,VOLUME\(\)\*Math\.min\(3,clip\.gain/,'voice playback gain remains capped');
assert.match(script,/source\.playbackRate\.value=1/,'recorded voice always plays at normal speed');
assert.match(script,/source\.start\(start,0\)/,'recorded voice starts at the first sample');
assert.match(script,/const seconds=Number\(clip\?\.buffer\?\.duration/,'busy window covers whole original recording');
assert.match(script,/gain\.connect\(voiceOutput\(ac\)\)/,'recorded voice uses limited safe bus, with optional inline filter');
assert.match(script,/const rush=ev\?\.rush===true/,'special remains differentiated');
assert.match(script,/const level=Math\.min\(\.19,VOLUME\(\)\*Math\.min\(3,clip\.gain/,'victory voice capped');
assert.match(script,/updateBgmDucking\(ac\);/,'music tick applies smooth ducking');
assert.match(script,/function attackVoice\(/,'recorded attack voice preserved');
assert.match(script,/function previewRecordedVoice\(/,'recording preview preserved');
console.log('AUDIO MIX PASS | shared master, music duck/recovery, impact categories, mute, recorded voice/roar caps');

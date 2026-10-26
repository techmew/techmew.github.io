// Microphone regression test: DO NOT reintroduce SpeechRecognition as a gate.
// No microphone or browser required. This exercises the actual client recording functions.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js,'embedded client JavaScript is available');
new vm.Script(js);
assert.ok(!html.includes('id="allowCloudSpeech"'),'no speech recognition consent UI');
assert.ok(!js.includes('beginSpokenWordReview('),'recording must not launch SpeechRecognition');
assert.ok(!js.includes('evaluateSpokenWordReview('),'recording must not depend on ASR approval');
assert.ok(!js.includes("voiceReview==='passed'"),'stored voice clips must not require review metadata');
assert.ok(html.includes('禁止ワードは発しないでください'),'visible caution remains');
const clipStart=js.indexOf('function clipData(cr){');
const clipEnd=js.indexOf('async function decodeVoice(',clipStart);
assert.ok(clipStart>=0&&clipEnd>clipStart,'clip availability');
const clipData=vm.runInNewContext(js.slice(clipStart,clipEnd)+';clipData');
const savedAudio='data:audio/webm;base64,QUJDRA==';
assert.equal(clipData({seed:1,voiceClip:savedAudio}),savedAudio,'old clips without review metadata are playable');
assert.equal(clipData({seed:1,voiceClip:savedAudio,voiceReview:'unverified'}),savedAudio,'review metadata never blocks voice');
assert.equal(clipData({seed:1,voiceClip:'notaudio'}),null,'invalid data URL rejected');
const start=js.indexOf('let stopCaptureNow=null'),end=js.indexOf('function saveCurrent()',start);
assert.ok(start>=0&&end>start,'full capture/stop/preview source');
const source=js.slice(start,end);
const notes=[];
function fakeRuntime(mediaRecorderEnabled){
 const nodes=new Map(),media={grants:0,stops:0},ctxRef={};
 const $=id=>{
  if(!nodes.has(id))nodes.set(id,{disabled:false,style:{display:''},textContent:'',checked:false,
   classList:{add(){},remove(){}}});
  return nodes.get(id);
 };
 class AudioContext {
  constructor(){this.state='running';this.sampleRate=11025;this.destination={}}
  createMediaStreamSource(){return {connect(){},disconnect(){}}}
  createAnalyser(){return {fftSize:2048,connect(){},getFloatTimeDomainData(buf){
   for(let i=0;i<buf.length;i++)buf[i]=Math.sin(i*.17)*.15;
  }}}
  createGain(){return {gain:{value:1},connect(){},disconnect(){}}}
  createScriptProcessor(){return ctxRef.processor={onaudioprocess:null,connect(){},disconnect(){}}}
  async decodeAudioData(){return {duration:1}}
  async close(){this.state='closed'}
 }
 class FakeRecorder {
  constructor(){this.state='inactive';this.mimeType='audio/webm'}
  static isTypeSupported(){return true}
  start(){this.state='recording'}
  stop(){this.state='inactive';this.ondataavailable?.({data:new Blob([new Uint8Array(600)],{type:'audio/webm'})});this.onstop?.()}
 }
 class FileReader{
  readAsDataURL(blob){
   blob.arrayBuffer().then(b=>{this.result='data:'+blob.type+';base64,'+Buffer.from(b).toString('base64');this.onload?.()}).catch(()=>this.onerror?.());
  }
 }
 const context={
  $,navigator:{mediaDevices:{async getUserMedia(){media.grants++;return{getTracks(){return[{stop(){media.stops++}}]}}}}},
  window:{AudioContext},MediaRecorder:mediaRecorderEnabled?FakeRecorder:undefined,
  Blob,FileReader,Buffer,Float32Array,Uint8Array,ArrayBuffer,DataView,Math,
  btoa:s=>Buffer.from(s,'binary').toString('base64'),
  setTimeout:(fn,ms)=>{if(ms>=2000&&ms<=2100)ctxRef.autoStop={fn,ms};return 1},clearTimeout(){},performance,recording:false,audioCtx:null,
  stopBattleSpeech(){},wavePaint(){},micErrorMessage:e=>String(e?.name||e),
  autocorr:()=>230,median:a=>a[0]||0,hash:n=>n>>>0,
  clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),liveWave:null,
  gen:(seed,voice)=>({seed,voice}),dnaFrame:()=>({t:0,rms:.1}),analyseVoiceDNA:()=>null,cur:{},clipData
 };
 context.setCurrent=c=>{context.cur=c;notes.push(c)};
 const api=vm.runInNewContext(source+';({startRecord,stopRecord,pcmWavDataUrl})',context);
 return{api,context,nodes,media,ctxRef};
}
async function attempt(mediaRecorderEnabled){
 const env=fakeRuntime(mediaRecorderEnabled);
 const running=env.api.startRecord();
 await env.api.startRecord(); // A rapid second tap must not request the microphone again.
 for(let i=0;i<12;i++)await Promise.resolve();
 if(!mediaRecorderEnabled){
  assert.ok(env.ctxRef.processor?.onaudioprocess,'WAV fallback processor installed');
  for(let j=0;j<4;j++){
   const input=Float32Array.from({length:4096},(_,i)=>Math.sin(i*.25)*.16);
   env.ctxRef.processor.onaudioprocess({inputBuffer:{getChannelData:()=>input}});
  }
 }
 env.api.stopRecord(); // Early tap must not shorten a fixed-duration recording.
 assert.equal(env.ctxRef.autoStop?.ms,2070,'recording ends automatically at two seconds');
 assert.equal(env.nodes.get('stopRecordBtn').disabled,true,'manual early stop disabled');
 env.ctxRef.autoStop.fn();
 await running;
 assert.equal(env.media.grants,1,'one permission request even with double tap');
 assert.equal(env.media.stops,1,'all microphone tracks closed');
 assert.ok(env.context.cur.voiceClip?.startsWith(mediaRecorderEnabled?'data:audio/webm;base64,':'data:audio/wav;base64,'),'audio saved');
 assert.equal(env.nodes.get('voicePreviewBtn').disabled,false,'preview enabled');
 assert.equal(env.nodes.get('countdown').textContent,'VOICE OK','successful capture status');
 assert.equal(env.nodes.get('stopRecordBtn').style.display,'none','capture buttons reset');
 return env.context.cur.voiceClip.length;
}
(async()=>{
 const mediaLength=await attempt(true);
 const wavLength=await attempt(false);
 assert.ok(mediaLength>100&&wavLength>100,'voice samples are not empty');
 assert.ok(html.includes('id="shareVoice" disabled')&&html.includes('id="receiveVoice" disabled'),'online live audio disabled');
 const worker=fs.readFileSync(__dirname+'/worker.js','utf8');
 assert.ok(worker.includes("type:'voice_rejected'"),'online voice uploads still rejected');
 console.log('MIC CAPTURE PASS | fixed 2-second recording, MediaRecorder/WAV, double-tap guard, preview, no ASR gate');
})().catch(e=>{console.error(e);process.exitCode=1});

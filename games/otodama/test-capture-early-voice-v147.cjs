'use strict';
// Sample-level regression for the onset of a spoken phrase at the recording cue.
// No physical microphone: demonstrates the PCM ring and WAV encoder keep early syllables.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
assert.match(js,/const pcmPreRoll=new Float32Array\(Math.round\(11025\*1\.05\)\)/,'retain more than one second before recording cue');
assert.match(js,/echoCancellation:false,noiseSuppression:false,autoGainControl:false/,'disable automatic start-of-word voice gates');
assert.match(js,/const CAPTURE_MS=2000,TAIL_MS=650/,'keep 650ms after timer');
const start=js.indexOf('pcmNode.onaudioprocess=ev=>{');
const end=js.indexOf('src.connect(pcmNode);',start);
assert.ok(start>0&&end>start,'real PCM handler is present');
const sampleRate=11025,frameSize=4096;
const env={
 pcmNode:{},Float32Array,Math,
 recordingFinishing:false,pcmSamples:[],pcmRate:sampleRate,
 pcmCarry:0,pcmSum:0,pcmCount:0,
 pcmPreRoll:new Float32Array(Math.round(sampleRate*1.05)),
 pcmPreWrite:0,pcmPreCount:0,captureStartedAt:0,recording:false,
 aud:{sampleRate}
};
vm.runInNewContext(js.slice(start,end),env);
assert.equal(typeof env.pcmNode.onaudioprocess,'function');
function feed(value){
 const chunk=Float32Array.from({length:frameSize},()=>value);
 env.pcmNode.onaudioprocess({inputBuffer:{getChannelData:()=>chunk}});
}
// The voice begins BEFORE the visible cue, while the short countdown is visible.
feed(0);feed(.22);feed(.25);
assert.equal(env.pcmSamples.length,0,'pre-cue speech held safely in ring, not yet committed');
assert.ok(env.pcmPreCount>sampleRate*.9,'pre-cue buffer spans nearly one second');
const copy=js.match(/for\(let i=0;i<pcmPreCount;i\+\+\)pcmSamples\.push\(pcmPreRoll\[\(pcmPreWrite-pcmPreCount\+i\+pcmPreRoll\.length\)%pcmPreRoll\.length\]\);/);
assert.ok(copy,'ship code copies entire ring to the final clip');
vm.runInNewContext(copy[0],env);
env.captureStartedAt=1000;env.recording=true;
const first=env.pcmSamples.slice();
assert.ok(first.some(x=>x>.17),'the first spoken sound is present BEFORE the visible recording cue');
const firstSyllable=first.findIndex(x=>x>.17);
assert.ok(firstSyllable>=0&&firstSyllable<sampleRate*.8,'onset is not lost');
feed(.30); // the vowel spoken exactly as 録音開始 appears
assert.ok(env.pcmSamples.length>first.length,'voice at the cue captured');
for(let i=0;i<6;i++)feed(.11);
assert.ok(env.pcmSamples.at(-1)>.08,'ending remains after main spoken phrase');
const waveFrom=js.indexOf('function pcmWavDataUrl('),waveTo=js.indexOf('function changeCaptureButtons(',waveFrom);
assert.ok(waveFrom>0&&waveTo>waveFrom);
const encode=vm.runInNewContext(js.slice(waveFrom,waveTo)+';pcmWavDataUrl',{
 Array,Number,Math,Uint8Array,ArrayBuffer,DataView,
 clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
 btoa:s=>Buffer.from(s,'binary').toString('base64')
});
const url=encode(env.pcmSamples,sampleRate);
assert.match(url,/^data:audio\/wav;base64,/,'guarded audio is stored in WAV without cutting');
const bytes=Buffer.from(url.split(',')[1],'base64');
const pcmOffset=44+firstSyllable*2;
assert.ok(bytes.readInt16LE(pcmOffset)>2500,'saved WAV contains the first syllable');
assert.ok(bytes.readInt16LE(bytes.length-2)>1500,'saved WAV retains its ending');
assert.ok(url.length<125000,'newborn and evolution clip both fit the updated storage limit');
assert.match(js,/clip\.length>125000/,'evolution persists the longer protected recording');
console.log('VOICE ONSET V147 PASS | 1050ms prebuffer, exact onset, uncut WAV, ending preserved, evolution clip fits');

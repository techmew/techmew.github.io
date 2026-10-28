'use strict';
// Node/V8 regression for cached voice previews; does not emulate a real phone speaker.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
const a=js.indexOf('function decodedVoiceKey(cr){'),b=js.indexOf('function playDecodedVoice(cr,side,force=false,options={})',a);
assert.ok(a>0&&b>a,'cache and decoder functions exist');
assert.match(js,/if\(decodedAudio&&compactClip===voiceClip\)cacheDecodedVoice\(/,'evolution recording reused immediately');
assert.match(js,/if\(decodedAudio\)cacheDecodedVoice\(newborn,decodedAudio\)/,'birth recording reused immediately');
let calls=0;
const samples=Float32Array.from({length:32000},(_,i)=>Math.sin(i*.08)*.07);
const sampleBuffer={sampleRate:16000,duration:2,getChannelData(){return samples}};
const voiceCache=new Map(),pendingVoice=new Map();
const cr={seed:71,voiceClip:'data:audio/wav;base64,QUJDRA=='};
const ctx={
 voiceCache,pendingVoice,Math,Map,Uint8Array,
 clipData:x=>typeof x?.voiceClip==='string'&&x.voiceClip.startsWith('data:audio/')?x.voiceClip:null,
 unlockBattleAudio:()=>({async decodeAudioData(){calls++;return sampleBuffer}}),
 atob:()=> 'ABCD',lastSoundStatus:''
};
const api=vm.runInNewContext(js.slice(a,b)+';({decodedVoiceKey,cacheDecodedVoice,decodeVoice})',ctx);
(async()=>{
 const warm=api.cacheDecodedVoice(cr,sampleBuffer);
 assert.ok(warm&&warm.gain>=.85,'already decoded microphone audio cached');
 assert.equal(voiceCache.size,1,'first recording cached');
 const first=await api.decodeVoice(cr);
 assert.strictEqual(first,warm,'preview returns same AudioBuffer immediately');
 assert.equal(calls,0,'no repeat decode on first preview click');
 const repeated=await api.decodeVoice(cr);
 assert.strictEqual(repeated,warm);
 assert.equal(calls,0,'subsequent previews also avoid decoding');
 const evolution={...cr,voiceClip:'data:audio/wav;base64,RUZHSA=='};
 assert.notEqual(api.decodedVoiceKey(cr),api.decodedVoiceKey(evolution),'new evolution voice gets separate cache key');
 const second=await api.decodeVoice(evolution);
 assert.ok(second,'uncached or restored audio still decodes correctly');
 assert.equal(calls,1,'uncached voice decodes once');
 const again=await api.decodeVoice(evolution);
 assert.strictEqual(second,again,'decoded restored voice stays cached');
 assert.equal(calls,1);
 assert.equal(api.cacheDecodedVoice({seed:5,voiceClip:''},sampleBuffer),null,'no accidental cache without recorded voice');
 console.log('VOICE LATENCY v142 PASS | hot playback cache, no double decode, evolution key isolation, restore fallback');
})().catch(e=>{console.error(e);process.exitCode=1});

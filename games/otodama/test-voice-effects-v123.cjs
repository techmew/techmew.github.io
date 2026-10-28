'use strict';
// Original recorded speech is intentionally exempt from all speed/pitch/filter presets.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
const first=js.indexOf('const VOICE_EFFECTS=['),last=js.indexOf('function previewFullVoice(',first);
assert.ok(first>0&&last>first);
const source=js.slice(first,last);
const calls=[],filters=[];
const rate=()=>({value:1,setValueAtTime(){throw Error('pitch automation forbidden for recordings')},
 exponentialRampToValueAtTime(){throw Error('pitch automation forbidden for recordings')}});
const ac={currentTime:5,
 createBufferSource:()=>({playbackRate:rate(),connect(){},start(...x){calls.push({x,rate:this.playbackRate.value})}}),
 createGain:()=>({gain:{setValueAtTime(){}},connect(){}}),
 createBiquadFilter:()=>{filters.push(1);return {connect(){}}}};
const data='data:audio/wav;base64,QUJDRA==',cr={seed:78,voiceClip:data,voice:{pitch:91,rhythm:99}};
let now=1000;
const cache=new Map();
const ctx={Math,Map,Uint8Array,performance:{now:()=>now},hash:n=>n,
 clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),match:{a:cr,b:cr,done:false,turn:1,mode:'COM MATCH'},
 $:id=>({checked:id==='voiceFxEnabled'}),VOLUME:()=>.18,
 unlockBattleAudio:()=>ac,voiceOutput:()=>({}),audioMaster:()=>({}),trackAttackSource(){},
 clipData:x=>x?.voiceClip||null,voiceCache:cache,pendingVoice:new Map(),
 lastSoundStatus:'',bgmDuckUntil:0,setVoiceEffectStatus(){},synthVoice(){throw Error('do not synthesize saved recording')}};
const api=vm.runInNewContext(source+';({VOICE_EFFECTS,voiceEffectProfile,decodedVoiceKey,playDecodedVoice,attackVoice})',ctx);
assert.equal(api.VOICE_EFFECTS.length,28,'presets still exist for other features');
cache.set(api.decodedVoiceKey(cr),{buffer:{duration:2.9},offset:.7,duration:.4,gain:1});
api.attackVoice(cr,0,{kind:'meteor',skill:true});
assert.equal(calls.length,1);
assert.equal(calls[0].x[1],0,'not cropped at strong syllable');
assert.equal(calls[0].x.length,2,'no audio duration shortening');
assert.equal(calls[0].rate,1,'normal voice pitch despite FX flag and voice pitch');
assert.equal(filters.length,0,'no bandpass/highpass voice alteration');
assert.match(html,/id="voiceFxEnabled" disabled>/,'FX control is intentionally disabled');
console.log('VOICE EFFECTS V123 PASS | original voice bypasses pitch, speed, cropping and filters');

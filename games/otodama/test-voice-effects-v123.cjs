'use strict';
// Regression: preserve the entire 28-effect bank, all attack/defense types, and
// the unmodified original recording as an always-audible foundation.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
const start=js.indexOf('const VOICE_EFFECTS=['),end=js.indexOf('function previewFullVoice(',start);
assert.ok(start>0&&end>start);
const voices=js.slice(start,end);
const calls=[],filters=[],statuses=[];
const rate=()=>({value:1,setValueAtTime(v){this.value=v},
 exponentialRampToValueAtTime(v){this.end=v}});
const ac={currentTime:8,
 createBufferSource:()=>({buffer:null,playbackRate:rate(),connect(){},start(...args){
  calls.push({args,buffer:this.buffer,rate:this.playbackRate.value,rateEnd:this.playbackRate.end})}}),
 createGain:()=>({gain:{setValueAtTime(){}},connect(){}}),
 createBiquadFilter:()=>{const o={type:'',frequency:{value:0},Q:{value:0},connect(){}};filters.push(o);return o}};
const clip='data:audio/wav;base64,QUJDRA==';
const cr={seed:77,voiceClip:clip,voice:{pitch:78,rhythm:63}};
const flags={mutedCheck:{checked:false},muteOpponentVoice:{checked:false},voiceFxEnabled:{checked:true},
 voiceFxLabel:{textContent:'',hidden:true},arenaEffect:{textContent:''}};
let now=1000;
const m={turn:1,done:false,mode:'COM MATCH',a:cr,b:cr};
const context={Math,Map,Uint8Array,Float32Array,
 $:id=>flags[id]||{checked:false},VOLUME:()=>.17,unlockBattleAudio:()=>ac,
 voiceOutput:()=>({}),audioMaster:()=>({}),trackAttackSource(){},
 setVoiceEffectStatus:fx=>statuses.push(fx),lastSoundStatus:'',
 voiceCache:new Map(),pendingVoice:new Map(),bgmDuckUntil:0,
 performance:{now:()=>now},match:m,
 hash:n=>{n=n>>>0;n=Math.imul(n^(n>>>16),0x7feb352d);return (n^(n>>>15))>>>0},
 clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
 synthVoice(){throw Error('do not synthesize when recorded clip exists')}};
const api=vm.runInNewContext(voices+
 ';({VOICE_EFFECTS,VOICE_ATTACK_VARIANTS,VOICE_REACTION_VARIANTS,VOICE_SKILL_VARIANTS,voiceEffectProfile,decodedVoiceKey,playDecodedVoice,attackVoice,reactionVoice})',context);
assert.equal(api.VOICE_EFFECTS.length,28,'original 28 patterns remain defined');
assert.ok(Object.keys(api.VOICE_ATTACK_VARIANTS).length>=10,'all attack groups remain');
assert.ok(Object.keys(api.VOICE_REACTION_VARIANTS).length>=7,'all reaction groups remain');
assert.equal(api.VOICE_SKILL_VARIANTS.length,10,'special voice variants remain');
const names=new Set();
for(let turn=0;turn<75;turn++)for(const kind of Object.keys(api.VOICE_ATTACK_VARIANTS)){
 m.turn=turn;
 names.add(api.voiceEffectProfile({...cr,seed:cr.seed+turn},0,{kind,seq:turn}).label);
}
assert.ok(names.size>=22,'attack and turn patterns still create broad variation');
const buffer={duration:3.65},original={buffer,offset:0,duration:3.65,gain:1.1};
context.voiceCache.set(api.decodedVoiceKey(cr),original);
m.turn=200;
api.attackVoice(cr,0,{kind:'meteor',skill:true});
assert.equal(calls.length,2,'one original and one processed variation');
assert.strictEqual(calls[0].buffer,buffer,'the actual recorded data is the main voice');
assert.equal(calls[0].args[1],0,'main voice begins with first syllable');
assert.equal(calls[0].args.length,2,'main voice plays through natural end');
assert.equal(calls[0].rate,1,'main voice speed is never modified');
assert.equal(calls[1].args[1],0,'processed layer also uses the whole phrase');
assert.equal(calls[1].args.length,2,'processed layer is never cropped');
assert.ok(statuses.at(-1).enabled,'style is visible in battle');
assert.ok(flags.voiceFxEnabled.checked,'styles default to enabled');
assert.match(html,/id="voiceFxEnabled" checked> 28種類の声の変化/,'style checkbox restored');
now+=7000;m.turn++;
flags.voiceFxEnabled.checked=false;
api.attackVoice(cr,0,{kind:'aerial'});
assert.equal(calls.length,3,'effects off still retains the full original only');
assert.equal(calls.at(-1).args[1],0);
assert.equal(calls.at(-1).rate,1);
assert.equal(statuses.at(-1).enabled,false,'plain mode hides effect label');
now+=7000;m.turn++;
flags.voiceFxEnabled.checked=true;
api.playDecodedVoice(cr,0,true,{full:true});
assert.equal(calls.length,4,'manual listening always uses a single original voice');
assert.equal(calls.at(-1).rate,1);
assert.equal(calls.at(-1).args.length,2);
console.log('VOICE EFFECTS V123 PASS | all 28 styles, attack/defense/special banks, 100% raw speech + layered effects, opt-out');

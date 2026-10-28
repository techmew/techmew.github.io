'use strict';
// One original uncut voice per audible attack; special animation does not chop it.
// Mock checks only, not physical mobile speaker quality.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script);new vm.Script(script);
const start=script.indexOf('function clipData(cr)'),end=script.indexOf('function previewFullVoice(',start);
assert.ok(start>0&&end>start);
const starts=[],banners=[],synthetic=[],rushHits=[];
const buffer={sampleRate:8000,duration:2.85,getChannelData(){return Float32Array.from({length:8000*2.85|0},(_,i)=>Math.sin(i*.08)*.07)}};
const ac={currentTime:7,decodeAudioData:async()=>buffer,
 createGain:()=>({gain:{setValueAtTime(){}},connect(){}}),
 createBufferSource:()=>({playbackRate:{value:1},connect(){},start(...a){starts.push({args:a,rate:this.playbackRate.value})}})};
let now=1000;
const fighter={seed:10,voiceClip:'data:audio/wav;base64,QUJDRA==',voice:{pitch:88}};
const m={a:fighter,b:{seed:20},mode:'COM MATCH',turn:1,done:false,rushEndsAt:0};
const ctx={Math,Uint8Array,Map,Float32Array,atob:()=> 'ABCD',hash:()=>0,
 $:id=>({checked:false}),VOLUME:()=>.12,
 unlockBattleAudio:()=>ac,voiceOutput:()=>({}),audioMaster:()=>({}),
 trackAttackSource(){},setVoiceEffectStatus(){},lastSoundStatus:'',
 synthVoice:(...a)=>synthetic.push(a),voiceCache:new Map(),pendingVoice:new Map(),
 performance:{now:()=>now},bgmDuckUntil:0,showRushBanner:x=>banners.push(x),playRushHitSounds:(ev,hits)=>rushHits.push(hits),match:m};
const api=vm.runInNewContext(script.slice(start,end)+';({decodeVoice,playDecodedVoice,attackVoice,maybeSpecialRush})',ctx);
(async()=>{
 const clip=await api.decodeVoice(fighter);
 assert.ok(clip,'recorded buffer decoded');
 api.attackVoice(fighter,0);
 assert.equal(starts.length,1);
 assert.equal(starts[0].args[1],0,'battle attack includes first syllable');
 assert.equal(starts[0].args.length,2,'no shortened playback duration');
 assert.equal(starts[0].rate,1,'normal pitch and speech speed');
 api.attackVoice(fighter,0,{hits:5});
 assert.equal(starts.length,1,'busy channel protects word');
 const special={skill:true,atk:0};
 assert.equal(api.maybeSpecialRush(m,special),true);
 assert.equal(starts.length,1,'special does not interrupt or overlap recorded speech');
 assert.equal(banners.length,1,'visual special still runs');
 assert.equal(rushHits.length,1,'special always schedules seven audible rush hits');
 assert.equal(rushHits[0],7,'seven audible hits are requested');
 assert.ok(m.rushEndsAt>=api.playDecodedVoice.busyUntil,'special waits for full recording');
 now=4000;m.turn++;
 api.attackVoice(fighter,0);
 assert.equal(starts.length,2,'voice returns after complete recording');
 assert.equal(starts[1].args[1],0);assert.equal(starts[1].args.length,2);
 now=7200;m.turn++;
 api.maybeSpecialRush(m,{skill:true,atk:0});
 assert.equal(starts.length,3,'special plays one full recorded voice');
 assert.equal(starts[2].args.length,2);
 m.done=true;api.attackVoice(fighter,0);
 assert.equal(starts.length,3,'no new attack speech after result');
 assert.equal(synthetic.length,0,'real voice never falls back to synthetic speech');
 console.log('VOICE RUSH PASS | full original voice, no special truncation or overlap, visual seven-hit combo');
})().catch(e=>{console.error(e);process.exitCode=1});

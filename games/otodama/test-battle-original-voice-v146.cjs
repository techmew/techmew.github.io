'use strict';
// A recorded phrase must never be reduced to its loudest 0.58s during combat.
// This is a deterministic Web Audio mock; it cannot establish real Android speaker timing.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script);new vm.Script(script,{filename:'otodama-client.js'});
const take=(a,b)=>{const i=script.indexOf(a),j=script.indexOf(b,i);assert.ok(i>=0&&j>i,'source '+a);return script.slice(i,j)};
const playbackSrc=take('function playDecodedVoice(cr,side,force=false,options={})','function previewFullVoice(');
const starts=[],sources=[],labels=[],rushBanners=[];
const gainParam=()=>({value:0,setValueAtTime(v){this.value=v},
 linearRampToValueAtTime(){throw Error('Recorded speech is not supposed to fade out early')}});
const ac={currentTime:10,
 createBufferSource(){
  const src={buffer:null,playbackRate:{value:1},connect(){},
   start(...args){starts.push({args,buffer:this.buffer,rate:this.playbackRate.value});},
   stop(){throw Error('No ongoing recorded phrase should be stopped by a special')}};
  sources.push(src);return src;
 },
 createGain:()=>({gain:gainParam(),connect(){}})};
let now=1000;
const saved={seed:87,voiceClip:'data:audio/wav;base64,ZGVtbw==',voice:{pitch:83,rhythm:75}};
const buffer={duration:2.85,sampleRate:11025};
const priorCache={buffer,offset:.62,duration:.58,gain:1.2};
const ctx={Math,Map,performance:{now:()=>now},
 $:id=>({checked:id==='voiceFxEnabled',textContent:'',hidden:true}),
 VOLUME:()=>.18,clipData:c=>c?.voiceClip||null,
 decodedVoiceKey:()=> 'voice-key',
 voiceCache:new Map([['voice-key',priorCache]]),pendingVoice:new Map(),
 unlockBattleAudio:()=>ac,voiceOutput:()=>({}),audioMaster:()=>({}),
 trackAttackSource(){},setVoiceEffectStatus:x=>labels.push(x),lastSoundStatus:'',
 synthVoice(){throw Error('Recording exists: must not synthesize instead')},
 showRushBanner:x=>rushBanners.push(x),playRushHitSounds:(ev,hits)=>rushBanners.push('sound:'+hits),
 bgmDuckUntil:0,
 match:{done:false,mode:'COM MATCH',turn:1,a:saved,b:{seed:222},rushEndsAt:0},
 voiceEffectProfile(){return {enabled:false,label:'原音',from:1,to:1,volume:1}}
};
const api=vm.runInNewContext(playbackSrc+';({playDecodedVoice,attackVoice,maybeSpecialRush,reactionVoice})',ctx);
api.attackVoice(saved,0,{kind:'aerial'});
assert.equal(starts.length,1,'one original recording for an ordinary attack');
assert.equal(starts[0].args[1],0,'attack starts at the first audio sample (not loudest excerpt)');
assert.equal(starts[0].args.length,2,'attack finishes at the natural end of original AudioBuffer');
assert.equal(starts[0].buffer,buffer,'same decoded recording as the microphone preview');
assert.equal(starts[0].rate,1,'recorded voice always uses normal playback speed');
assert.ok(api.playDecodedVoice.busyUntil>=now+2850,'whole phrase reserved without interruption');
api.attackVoice(saved,0,{kind:'combo',hits:5});
assert.equal(starts.length,1,'next attack cannot layer/cut the still-speaking phrase');
const skill={skill:true,atk:0};
assert.equal(api.maybeSpecialRush(ctx.match,skill),true,'seven-hit special remains functional');
assert.equal(starts.length,1,'special does not chop or replace the ongoing word');
assert.ok(ctx.match.rushEndsAt>=api.playDecodedVoice.busyUntil,'special timing respects last syllable');
assert.equal(rushBanners.length,2,'special has visual impact AND seven audible strikes');
assert.equal(rushBanners[1],'sound:7','rush restores seven sound hits');
now=4100;ctx.match.turn++;
api.attackVoice(saved,0,{kind:'normal'});
assert.equal(starts.length,2,'new full recording starts after previous naturally finishes');
assert.equal(starts[1].args[1],0);
assert.equal(starts[1].args.length,2);
now=7200;ctx.match.turn++;
const special2={skill:true,atk:0};
api.maybeSpecialRush(ctx.match,special2);
assert.equal(starts.length,3,'special plays one full original voice, not seven overlapping syllables');
assert.equal(starts[2].args[1],0);
assert.equal(starts[2].args.length,2);
assert.equal(starts[2].rate,1);
const previewCount=starts.length;
api.playDecodedVoice(saved,0,true,{full:true});
assert.equal(starts.length,previewCount+1,'preview also plays full original buffer');
assert.equal(starts.at(-1).args.length,2);
ctx.match.done=true;
api.attackVoice(saved,0);
assert.equal(starts.length,previewCount+1,'no new recorded voice after finish');
assert.ok(labels.every(x=>x?.enabled===false),'no FX status for original voice');
assert.match(html,/id="voiceFxEnabled" checked> 28種類の声の変化/,'voice patterns remain available');
const rushSource=take('function maybeSpecialRush(m,ev){','function primeBattleVoices(');
assert.doesNotMatch(rushSource,/stopAttackVoices\(\)/,'special must not cut live word');
const finish=take('function finishCombat(){','function updateCampaignTrack(');
assert.doesNotMatch(finish,/stopAttackVoices\(\)/,'battle finish does not cut last word');
const victory=take('async function playVictoryRoar(m){','function queueCpuTaunt(');
assert.match(victory,/source\.start\(start,0\)/,'winner recording starts at original sample zero');
assert.doesNotMatch(victory,/source\.start\(start,clip\.offset/,'winner must not use loudest-only segment');
assert.match(victory,/playDecodedVoice\.busyUntil/,'victory waits for last combat voice');
// Slow device: decoding may complete after an animation turn and the battle result.
let releaseDecoded;
const lateMatch={...ctx.match,turn:9,done:false};
const slowEnv={...ctx,match:lateMatch,voiceCache:new Map(),pendingVoice:new Map(),
 decodeVoice:()=>new Promise(resolve=>{releaseDecoded=resolve})};
const slow=vm.runInNewContext(playbackSrc+';({playDecodedVoice,attackVoice})',slowEnv);
const oldLength=starts.length;
slow.attackVoice(saved,0);
assert.equal(starts.length,oldLength,'delayed decoder still pending');
lateMatch.turn=10;lateMatch.done=true;
releaseDecoded(priorCache);
Promise.resolve().then(()=>{
 assert.equal(starts.length,oldLength+1,'pending voice survives turn advance/result');
 assert.equal(starts.at(-1).args[1],0,'delayed voice still starts at zero');
 assert.equal(starts.at(-1).args.length,2,'delayed voice still plays through its natural end');
 console.log('BATTLE ORIGINAL VOICE V146 PASS | 100% recording, rate 1, no FX, no truncation, no overlap, delayed-decoder recovery');
}).catch(e=>{console.error(e);process.exitCode=1});

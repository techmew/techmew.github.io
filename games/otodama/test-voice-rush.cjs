// Simulated Web Audio regression checks. No real microphone, speaker or Android device.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'game JavaScript missing');
new vm.Script(script,{filename:'otodama-client.js'});
assert.ok(html.includes('id="audioResumeBtn"'),'manual sound recovery button');
assert.ok(html.includes('id="rushBanner"'),'special rush overlay');
assert.ok(html.includes('id="matchIntro"'),'match counter introduction preserved');
const start=script.indexOf('function clipData(cr)'),end=script.indexOf('function previewRecordedVoice()',start);
assert.ok(start>=0&&end>start,'recorded-voice functions missing');
const calls=[],synthCalls=[],banners=[];
const ui={mutedCheck:{checked:false},muteOpponentVoice:{checked:false},arenaEffect:{textContent:''}};
const samples=Float32Array.from({length:1000},(_,i)=>i%2?.008:-.008);
const buffer={sampleRate:1000,duration:1,getChannelData(){return samples}};
const gainParam={setValueAtTime(){},linearRampToValueAtTime(){}};
const ac={currentTime:10,decodeAudioData:async()=>buffer,
 createGain:()=>({gain:gainParam,connect(){}}),
 createBufferSource:()=>({playbackRate:{value:1},connect(){},start(...args){calls.push(args)},stop(){}})};
const cr={seed:8,voiceClip:'data:audio/webm;base64,dGVzdA==',voiceReview:'passed',voice:{rhythm:30}};
const match={done:false,mode:'COM MATCH',turn:3,live:false,a:cr,b:{seed:9}};
let now=1200;
const context={
 Uint8Array,Map,Math,Float32Array,clamp:(n,a,b)=>Math.min(b,Math.max(a,n)),
 atob:()=> 'test',
 $:id=>ui[id]||{checked:false},
 VOLUME:()=>.12,voiceOutput:()=>({}),audioMaster:()=>({}),unlockBattleAudio:()=>ac,trackAttackSource:()=>{},
 synthVoice:(...args)=>synthCalls.push(args),
 voiceCache:new Map(),pendingVoice:new Map(),lastSoundStatus:'',bgmDuckUntil:0,
 performance:{now:()=>now},hash:()=>0,showRushBanner:text=>banners.push(text),
 match,
 stopAttackVoices:()=>{functions.playDecodedVoice.busyUntil=0;functions.playDecodedVoice.generation=(functions.playDecodedVoice.generation||0)+1}
};
const functions=vm.runInNewContext(script.slice(start,end)+';({decodeVoice,playDecodedVoice,attackVoice,maybeSpecialRush})',context);
async function test(){
 const clip=await functions.decodeVoice(cr);
 assert.ok(clip&&clip.gain>1&&clip.gain<=8,'quiet recording should be normalized');
 functions.attackVoice(cr,0);
 assert.equal(calls.length,1,'ordinary attacks replay recorded voice once');
 functions.attackVoice(cr,0,{kind:'combo',hits:5});
 assert.equal(calls.length,1,'replayed attack inside busy window is suppressed');
 now+=850;
 functions.attackVoice(cr,0,{kind:'combo',hits:5});
 assert.equal(calls.length,2,'normal combo replays recording once, not five times');
 now+=850;
 const special={skill:true,atk:0};
 assert.equal(functions.maybeSpecialRush(match,special),true,'occasional special rush should activate');
 assert.equal(calls.length,9,'special adds seven voiced hits');
 assert.ok(calls[8][0]>calls[2][0],'rush voices are staggered');
 assert.equal(banners.length,1,'special animation banner');
 assert.equal(match.rushEndsAt,now+1750,'special rush reserves enough time for all recorded syllables');
 assert.ok(script.includes('if(match.rushEndsAt&&performance.now()<match.rushEndsAt)return;'),'battle does not cut off the seven voices early');
 assert.ok(html.includes('},200);'),'banner hit counter follows the 200 ms recorded-hit cadence');
 assert.equal(functions.maybeSpecialRush(match,special),false,'special must not activate twice per hit');
 // Regression: the special can become active at IMPACT after an ordinary hit has blocked voice replay.
 now+=1900;
 functions.attackVoice(cr,0,{kind:'normal'});
 const beforeLate=calls.length;
 const late={skill:true,atk:0};
 assert.equal(functions.maybeSpecialRush(match,late),true,'late-armed skill must become a rush');
 assert.equal(calls.length,beforeLate+7,'late-armed rush plays all seven hits despite normal-voice busy gate');
 match.done=true;functions.attackVoice(cr,0);
 assert.equal(calls.length,17,'no attack voices after battle end');
 match.done=false;match.mode='ONLINE LIVE';ui.muteOpponentVoice.checked=true;
 functions.attackVoice(cr,1);
 assert.equal(calls.length,17,'online opponent mute respected');
 ui.muteOpponentVoice.checked=false;match.mode='COM MATCH';
 now+=1900;
 functions.attackVoice({seed:5,voiceClip:'',voice:{pitch:50}},0,{hits:4});
 assert.equal(synthCalls.length,1,'synthetic fallback when recorded voice is absent');
 assert.equal(synthCalls[0][2].hits,1,'non-rush fallback also remains one voice');
 console.log('VOICE RUSH TEST PASS | recorded speech seven hits, late-armed skill priority, busy gate, mute and battle-end');
}
test().catch(error=>{console.error(error);process.exitCode=1});

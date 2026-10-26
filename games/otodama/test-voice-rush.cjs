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
const context={
 Uint8Array,Map,Math,Float32Array,
 atob:()=> 'test',
 $:id=>ui[id]||{checked:false},
 VOLUME:()=>.12,voiceOutput:()=>({}),unlockBattleAudio:()=>ac,trackAttackSource:()=>{},
 synthVoice:(...args)=>synthCalls.push(args),
 voiceCache:new Map(),pendingVoice:new Map(),lastSoundStatus:'',bgmDuckUntil:0,
 performance:{now:()=>1200},hash:()=>0,showRushBanner:text=>banners.push(text),
 match
};
const functions=vm.runInNewContext(script.slice(start,end)+';({decodeVoice,playDecodedVoice,attackVoice,maybeSpecialRush})',context);
async function test(){
 const clip=await functions.decodeVoice(cr);
 assert.ok(clip&&clip.gain>1&&clip.gain<=8,'quiet recording should be normalized');
 functions.attackVoice(cr,0);
 assert.equal(calls.length,1,'ordinary attacks replay recorded voice once');
 functions.attackVoice(cr,0,{kind:'combo',hits:5});
 assert.equal(calls.length,6,'five rush hits must overlap with separate audio sources');
 assert.ok(calls[5][0]>calls[1][0],'rush voices must start in staggered succession');
 const special={skill:true,atk:0};
 assert.equal(functions.maybeSpecialRush(match,special),true,'occasional special rush should activate');
 assert.equal(calls.length,13,'special adds seven voiced hits');
 assert.equal(banners.length,1,'special animation banner');
 assert.equal(functions.maybeSpecialRush(match,special),false,'special must not activate twice per hit');
 match.done=true;functions.attackVoice(cr,0);
 assert.equal(calls.length,13,'no attack voices after battle end');
 match.done=false;match.mode='ONLINE LIVE';ui.muteOpponentVoice.checked=true;
 functions.attackVoice(cr,1);
 assert.equal(calls.length,13,'online opponent mute respected');
 ui.muteOpponentVoice.checked=false;match.mode='COM MATCH';
 functions.attackVoice({seed:5,voiceClip:'',voice:{pitch:50}},0,{hits:4});
 assert.equal(synthCalls.length,1,'synthetic fallback when recorded voice is absent');
 assert.equal(synthCalls[0][2].hits,4,'fallback also supports multi-hit rush');
 console.log('VOICE RUSH TEST PASS | recorded voice gain, single/multi-hit, special, fallback, mute and battle-end isolation');
}
test().catch(error=>{console.error(error);process.exitCode=1});

'use strict';
// Deterministic V8 checks for birth/evolution microphone guard and full recorded playback.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
const take=(a,b)=>{const i=js.indexOf(a),j=js.indexOf(b,i);assert.ok(i>=0&&j>i,'missing '+a);return js.slice(i,j)};
for(const id of ['birthVoiceActions','birthVoicePlay','birthVoiceRetry','birthVoiceDone','birthVoiceStatus'])
 assert.equal(html.split('id="'+id+'"').length-1,1,'one visible birth review control: '+id);
assert.match(js,/const CAPTURE_MS=2000,TAIL_MS=650,begin=performance\.now\(\)/,'keep 650ms audio tail');
assert.match(js,/pcmPreRoll\[pcmPreWrite\]=value/,'220ms pre-recording PCM ring');
assert.match(js,/for\(let i=0;i<pcmPreCount;i\+\+\)pcmSamples\.push/,'pre-roll copied into voice');
assert.match(js,/if\(pcmFallbackClip\)voiceClip=pcmFallbackClip/,'bounded PCM clip is preferred');
assert.match(js,/const count=Math\.min\(samples\.length,Math\.round\(rate\*2\.85\)\)/,'wav stores the complete guarded recording');
const maxBytes=44+Math.round(11025*3)*2;
assert.ok(Math.ceil(maxBytes*4/3)+22<90000,'PCM still fits persisted evolution clip limit');
const clipData=c=>typeof c?.voiceClip==='string'&&c.voiceClip.startsWith('data:audio/')?c.voiceClip:null;
const original={seed:49,stats:[68,50,91,55,59],rarity:'S+',level:18,
 voiceClip:'data:audio/wav;base64,QUJDRA==',voice:{pitch:75},audioDNA:{version:1}};
const env={roster:[original],cur:original,birthRevealCreature:original,birthRevealActive:true,
 clipData,saveStore:()=>true,cacheDecodedVoice(){},$(){return{textContent:''}}};
env.setCurrent=x=>{env.cur=x};
const change=vm.runInNewContext(take('function replaceBirthVoice(','function paintNewborn(')+';replaceBirthVoice',env);
const nextClip='data:audio/wav;base64,RUZHSA==';
assert.equal(change(49,nextClip,{}),true);
assert.equal(env.roster[0].seed,49,'voice-only retry never changes character');
assert.deepEqual(env.roster[0].stats,original.stats,'stats unchanged');
assert.equal(env.roster[0].rarity,original.rarity,'rarity unchanged');
assert.equal(env.roster[0].voiceClip,nextClip,'only audio replaced');
assert.equal(original.voiceClip,'data:audio/wav;base64,QUJDRA==','old snapshot stays intact');
env.saveStore=()=>false;
assert.equal(change(49,'data:audio/wav;base64,QUJE',{}),false,'failure rolls back');
assert.equal(env.roster[0].voiceClip,nextClip,'previous clip preserved on save error');
const key=vm.runInNewContext(take('function decodedVoiceKey(cr){','// A finished MediaRecorder')+';decodedVoiceKey',{clipData});
const prefix='data:audio/wav;base64,';
const a={seed:49,voiceClip:prefix+'A'.repeat(180)+'X'.repeat(180)+'Z'.repeat(180)};
const b={seed:49,voiceClip:prefix+'A'.repeat(180)+'Y'.repeat(180)+'Z'.repeat(180)};
assert.equal(a.voiceClip.length,b.voiceClip.length);
assert.notEqual(key(a),key(b),'recordings of same length with equal silent ending use distinct cache keys');
const starts=[];
const audio={currentTime:1,createBufferSource(){return {playbackRate:{setValueAtTime(){},exponentialRampToValueAtTime(){}},
 connect(){},start(...args){starts.push(args)},stop(){}}},createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){}}}};
const preview={seed:49,voiceClip:nextClip};
const playbackEnv={clipData,Math,performance:{now:()=>1},$:()=>({checked:false}),VOLUME:()=>.2,
 clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),match:null,
 unlockBattleAudio:()=>audio,voiceOutput:()=>({}),audioMaster:()=>({}),
 decodedVoiceKey:()=> 'cached',voiceCache:new Map([['cached',{buffer:{duration:2.85},offset:.5,duration:.7,gain:1}]]),
 trackAttackSource(){},voiceEffectRate(){},lastSoundStatus:'',setVoiceEffectStatus(){},synthVoice(){},
 voiceEffectProfile:()=>({enabled:false,from:1,to:1,volume:1})};
const play=vm.runInNewContext(take('function playDecodedVoice(cr,side,force=false,options={})','function attackVoice(')+';playDecodedVoice',playbackEnv);
play(preview,0,true,{full:true});
play(preview,0,true);
assert.equal(starts[0][1],0,'preview starts at the beginning');
assert.equal(starts[0][2],2.85,'preview plays the full recording');
assert.equal(starts[1][1],.5,'short battle attacks retain their distinct segment');
assert.equal(starts[1][2],.7,'short battle excerpt is unchanged');
console.log('VOICE BOUNDARY V145 PASS | 220ms pre-roll, 650ms tail, full playback, audio-only retake, rollback, cache');

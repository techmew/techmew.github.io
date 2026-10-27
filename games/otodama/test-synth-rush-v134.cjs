'use strict';
// Synthetic audio fallback and seven-hit UI cadence. Does not verify physical speaker volume.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'client JavaScript present');
new vm.Script(script,{filename:'otodama-client.js'});
const start=script.indexOf('function synthVoice('),end=script.indexOf('// 28 sound-shaping presets.',start);
assert.ok(start>=0&&end>start,'synth voice section present');
const starts=[],peaks=[],routes=[];
const master={kind:'master'},voice={kind:'voice'};
const param=()=>({value:1,setValueAtTime(v){this.value=v},exponentialRampToValueAtTime(v){this.value=v}});
const gainParam=()=>({value:1,setValueAtTime(v){this.value=v},exponentialRampToValueAtTime(v){if(v>.001)peaks.push(v)}});
const ac={currentTime:10,
 createOscillator(){return {frequency:param(),connect(){},start(t){starts.push(t)},stop(){}}},
 createGain(){return {gain:gainParam(),connect(out){routes.push(out)}}},
 createBiquadFilter(){return {frequency:{value:0},Q:{value:0},connect(){}}}};
const flags={mutedCheck:{checked:false}};
const context={Math,$:id=>flags[id]||{},VOLUME:()=>.12,unlockBattleAudio:()=>ac,
 clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),voiceOutput:()=>voice,audioMaster:()=>master,
 trackAttackSource:()=>{},setVoiceEffectStatus:()=>{},lastSoundStatus:'',
 voiceEffectProfile:()=>({from:1,to:1,volume:1,filter:'bandpass',cutoff:1100,label:'default'})};
const api=vm.runInNewContext(script.slice(start,end)+';({synthVoice})',context);
const cr={voice:{pitch:50,breath:40,res:50}},fx={from:1,to:1,volume:1,filter:'bandpass',cutoff:1100,label:'test'};
api.synthVoice(cr,0,{fx});
assert.equal(starts.length,1,'normal fallback uses one sound');
const normalPeak=peaks[0];
assert.equal(routes[0],voice,'normal fallback routes to voice bus');
api.synthVoice(cr,0,{rush:true,hits:7,fx});
assert.equal(starts.length,8,'rush fallback uses seven sounds');
for(let i=2;i<starts.length;i++)assert.ok(Math.abs(starts[i]-starts[i-1]-.2)<1e-6,'fallback hits every 200ms');
assert.ok(peaks[1]>normalPeak*1.45,'rush fallback louder than normal');
assert.ok(peaks.slice(1).every(p=>p<=.14),'each rush voice is capped');
assert.ok(routes.slice(1).every(out=>out===master),'rush uses master limiter');
flags.mutedCheck.checked=true;
api.synthVoice(cr,0,{rush:true,hits:7,fx});
assert.equal(starts.length,8,'mute blocks synthetic rush');
assert.match(script,/banner\.animate\(/,'each visual hit receives an impact pulse');
assert.match(script,/if\(match\.rushEndsAt&&performance\.now\(\)<match\.rushEndsAt\)return;/,'CPU combat waits for rush');
// Execute the actual banner timer code, including seven-hit count and reduced-motion handling.
const banner={hidden:true,textContent:'',animate(){this.pulses=(this.pulses||0)+1}};
const timers={};let nextTimer=1,reduceMotion=false;
const bannerStart=script.indexOf('let rushBannerTimer=null,rushCounterTimer=null;');
const bannerEnd=script.indexOf('let matchIntroTimer=null;',bannerStart);
assert.ok(bannerStart>=0&&bannerEnd>bannerStart,'rush banner code present');
const bannerCtx={
 Math,$:id=>id==='rushBanner'?banner:{},
 window:{matchMedia:()=>({matches:reduceMotion})},
 setInterval:(fn,delay)=>{const id=nextTimer++;timers[id]={fn,delay,kind:'interval'};return id},
 clearInterval:id=>{delete timers[id]},
 setTimeout:(fn,delay)=>{const id=nextTimer++;timers[id]={fn,delay,kind:'timeout'};return id},
 clearTimeout:id=>{delete timers[id]}
};
const bannerApi=vm.runInNewContext(script.slice(bannerStart,bannerEnd)+';({showRushBanner,hideRushBanner})',bannerCtx);
bannerApi.showRushBanner('必殺技',7);
assert.equal(banner.textContent,'必殺技　1 HIT','initial count');
const interval=Object.entries(timers).find(([,v])=>v.kind==='interval');
assert.equal(interval[1].delay,200,'visual counter is synchronized to sound');
for(let i=2;i<=7;i++){interval[1].fn();assert.equal(banner.textContent,'必殺技　'+i+' HIT','hit counter '+i)}
assert.equal(banner.pulses,7,'every hit visibly pulses');
const expiry=Object.entries(timers).find(([,v])=>v.kind==='timeout');
assert.equal(expiry[1].delay,1750,'banner remains visible throughout seven-hit rush');
expiry[1].fn();assert.equal(banner.hidden,true,'banner clears after rush');
reduceMotion=true;const pulses=banner.pulses;
bannerApi.showRushBanner('必殺技',7);
assert.equal(banner.pulses,pulses,'reduced-motion disables pulses');
bannerApi.hideRushBanner();
console.log('SYNTH RUSH PASS | 7x 200ms, boosted capped gain, master limiter, mute, visual pulse, CPU hold');

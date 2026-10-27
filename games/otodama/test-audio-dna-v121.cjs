// Audio-DNA v1 regression: real source extraction, no microphone hardware.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,'main game embedded script');
new vm.Script(js,{filename:'otodama-audio-dna.js'});
const start=js.indexOf('const DNA_FEATURE_NAMES=['),end=js.indexOf('function gen(seed,voice',start);
assert.ok(start>=0&&end>start,'AudioDNA analysis functions');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return(n^n>>>16)>>>0};
const api=vm.runInNewContext(js.slice(start,end)+';({analyseVoiceDNA,dnaFrame,dnaUnlocked,dnaGrowthIndex,validAudioDNA,DNA_FEATURE_NAMES,DNA_TRAITS})',
 {clamp,hash,Math,Map,Array,Number,levelOf:c=>Math.max(1,Math.floor(Number(c.level)||1))});
assert.equal(api.DNA_FEATURE_NAMES.length,36,'36 independently derived audio indicators');
function voice(kind,volume=1){
 return Array.from({length:83},(_,i)=>{
  const p=kind==='low'?115+Math.sin(i*.22)*23:430+Math.sin(i*.72)*81;
  const r=volume*(.055+Math.sin(i*.2+(kind==='low'?0:1))*.028);
  const center=kind==='low'?980+Math.sin(i*.34)*160:3200+Math.sin(i*.63)*370;
  return {t:i*59,rms:r,pitch:p,zc:kind==='low'?.09:.20,rough:kind==='low'?.035:.12,
   centroid:center,low:kind==='low'?.68:.15,mid:.31,high:kind==='low'?.1:.64,
   flat:kind==='low'?.25:.64,roll:kind==='low'?1800:4600,flux:kind==='low'?.22:.84};
 });
}
const low=api.analyseVoiceDNA(voice('low'));
const high=api.analyseVoiceDNA(voice('high'));
const low2=api.analyseVoiceDNA(voice('low'));
assert.ok(low&&high&&low2,'both meaningful voice patterns generate AudioDNA');
assert.deepEqual(Array.from(low.features),Array.from(low2.features),'same audio data => same features');
assert.equal(low.signature,low2.signature,'same audio => same identity');
assert.deepEqual(Array.from(low.stats),Array.from(low2.stats),'same audio => same battle strength');
assert.notEqual(low.signature,high.signature,'distinct audio => distinct DNA');
assert.notDeepEqual(Array.from(low.stats),Array.from(high.stats),'low/high voices have different combat profile');
assert.ok(low.features.length===36&&high.features.length===36);
assert.ok(low.stats.every(n=>n>=27&&n<=94)&&high.stats.every(n=>n>=27&&n<=94),'safe stat bounds');
assert.ok(low.growth.length===5&&low.growth.every(n=>n>=1&&n<=3));
assert.ok(low.traits.every(x=>Number.isInteger(x)&&x>=0&&x<8));
assert.ok(api.validAudioDNA(low),'persisted AudioDNA v1 accepted');
assert.equal(api.validAudioDNA({...low,features:[200]}),null,'corrupted DNA rejected');
assert.equal(api.validAudioDNA({...low,traits:[99]}),null,'unknown trait rejected');
assert.equal(api.analyseVoiceDNA(voice('high',0)),null,'fully silent recording does not generate fake AudioDNA');
const features=api.DNA_FEATURE_NAMES;
assert.ok(features.includes('音程の中心')&&features.includes('低域の比率')&&features.includes('拍の規則性'));
const g1=api.dnaGrowthIndex({audioDNA:low,seed:low.signature},17);
const g2=api.dnaGrowthIndex({audioDNA:low,seed:low.signature},17);
assert.equal(g1,g2,'level growth allocation deterministic');
assert.ok(g1>=0&&g1<5);
const creature={audioDNA:{...low,traits:[0,2,7]},level:1};
assert.deepEqual(Array.from(api.dnaUnlocked(creature)),[0],'advanced traits locked at level 1');
creature.level=30;
assert.deepEqual(Array.from(api.dnaUnlocked(creature)),[0,2,7],'rare latent traits unlock through leveling');
assert.deepEqual(Array.from(api.dnaUnlocked({level:30,seed:1})),[],'existing legacy character compatible');
// FFT path is exercised with a fabricated spectrum (values are amplitudes in dB).
const analyser={fftSize:2048,getFloatFrequencyData(dst){dst.fill(-100);for(let i=4;i<280;i++)dst[i]=-28-Math.abs(40-i%70)*.12}};
const spec=new Float32Array(1024),buf=new Float32Array(2048),history=new Map();
const frame=api.dnaFrame(analyser,buf,spec,48000,180,200,.11,.08,.025,history);
assert.ok(Number.isFinite(frame.centroid)&&Number.isFinite(frame.flat)&&Number.isFinite(frame.roll));
assert.ok(frame.low>=0&&frame.high>=0&&frame.flux>=0,'spectral indicators bounded');
assert.ok(js.includes('dnaFrame(an,buf,spectrum,aud.sampleRate')&&js.includes('analyseVoiceDNA(dnaFrames)'),'actual microphone wired to analyzer');
assert.ok(js.includes('dnaGrowthIndex(player,player.level)'),'actual level up respects DNA');
assert.ok(html.includes('id="dnaPanel"')&&html.includes('id="dnaTraits"'),'DNA results visible on mobile');
assert.ok(!html.includes('id="allowCloudSpeech"')&&!js.includes('beginSpokenWordReview'),'recording must not be blocked by speech recognition');
assert.ok(js.includes('function stopRecord()')&&js.includes('if(!voiceClip)voiceClip=pcmWavDataUrl'),'manual stop and WAV backup retained');
assert.ok(js.includes("if(won||m.live||m.mode==='COM MATCH')scheduleNextAfterQuote(m)"),'winner continues campaign');
console.log('AUDIO DNA PASS | 36 FFT/wave features, same-sound determinism, contrasting voices, growth, hidden traits, input validation, mic safety');

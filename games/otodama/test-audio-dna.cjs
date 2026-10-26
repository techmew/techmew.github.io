// Voice DNA regression: deterministic sound traits, backup compatibility, auto-combat passives.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js,'embedded JS');
new vm.Script(js);
function cut(a,b){const start=js.indexOf(a),end=js.indexOf(b,start+1);assert.ok(start>=0&&end>start,'source '+a);return js.slice(start,end)}
const engine=cut('const DNA_FEATURE_NAMES=','function gen(seed,voice,audioDNA=null)');
const generator=cut('function gen(seed,voice,audioDNA=null)','const SOULS=');
const combat=cut('const AUTO_STYLES=','// v0.4 kinetic');
const save=cut('function compactCreature(','function exportSave()');
const setup=`
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return(n^n>>>16)>>>0};
const getRand=seed=>{let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
const between=(rng,a,b)=>a+rng()*(b-a);
const ELEMS=['雷','炎','水','風','光','影','鋼','音','樹','霧'];
const SPECIES=Array.from({length:12},(_,i)=>'type'+i);
const generateName=seed=>'声魂'+seed;
const levelOf=c=>Math.max(1,Math.floor(Number(c.level)||1));
const elementalEdge=()=>1;
`;
const api=vm.runInNewContext(setup+engine+generator+combat+save+';({analyseVoiceDNA,validAudioDNA,dnaUnlocked,dnaGrowthIndex,DNA_FEATURE_NAMES,gen,randCombat,compactCreature,restoreCreature})',{Math,Date:{now:()=>123456789}});
assert.equal(api.DNA_FEATURE_NAMES.length,36,'36 independent features');
function voiceFrames(pitch=180,low=.5){
 return Array.from({length:88},(_,i)=>({
 t:i*55,pitch:pitch+28*Math.sin(i*.14),rms:.04+.07*Math.abs(Math.sin(i*.26)),
 zc:.08+.02*Math.sin(i*.1),rough:.02+.005*Math.sin(i*.2),
 centroid:1300+200*Math.sin(i*.19),low,mid:.37,high:Math.max(.05,.63-low),
 flat:.25,roll:2600,flux:.17+.08*Math.abs(Math.sin(i*.23))
 }));
}
const a=api.analyseVoiceDNA(voiceFrames()),a2=api.analyseVoiceDNA(voiceFrames());
const b=api.analyseVoiceDNA(voiceFrames(450,.19));
assert.ok(a&&b,'audible frames produce DNA');
assert.equal(JSON.stringify(a),JSON.stringify(a2),'same audio frames must generate identical DNA');
assert.notEqual(a.signature,b.signature,'different pitch/timbre changes signature');
assert.equal(a.features.length,36);
assert.ok(a.stats.every(v=>v>=27&&v<=94),'bounded voice stats');
assert.ok(api.validAudioDNA(a),'valid DNA round-trips');
assert.equal(api.validAudioDNA({...a,features:[1]}),null,'malformed feature array rejected');
assert.equal(api.validAudioDNA({...a,traits:[100]}),null,'unknown ability rejected');
assert.equal(api.analyseVoiceDNA([]),null,'no audio does not create fake DNA');
assert.equal(api.analyseVoiceDNA(voiceFrames().slice(0,4)),null,'short capture has no DNA');
const c=api.gen(a.signature,a.voice,a),d=api.gen(b.signature,b.voice,b);
assert.equal(JSON.stringify(c.stats),JSON.stringify(a.stats),'voice DNA determines base stats');
assert.equal(c.element,(['雷','炎','水','風','光','影','鋼','音','樹','霧'])[a.elementIndex]);
assert.ok(c.audioDNA&&d.audioDNA,'generated creature retains voice DNA');
const full={...a,traits:[0,1,2,3,4,5,6,7]};
const novice={...c,level:1,audioDNA:full},veteran={...c,level:20,audioDNA:full};
assert.equal(api.dnaUnlocked(novice).length,2,'level one abilities');
assert.equal(api.dnaUnlocked(veteran).length,8,'level 20 latent abilities');
assert.equal(api.dnaGrowthIndex(veteran,23),api.dnaGrowthIndex(veteran,23),'deterministic growth');
const backup=api.compactCreature(veteran),restored=api.restoreCreature(backup);
assert.equal(restored.audioDNA.signature,a.signature,'backup retains audio DNA');
assert.equal(restored.audioDNA.features.length,36);
const legacy=api.restoreCreature({...backup,audioDNA:undefined});
assert.ok(!legacy.audioDNA,'old backups remain supported');
const fight=api.randCombat(veteran,{...d,level:20});
assert.ok(fight.events.length>0&&fight.events.length<=52,'combat terminates');
assert.ok([0,1].includes(fight.winner),'combat has a winner');
assert.ok(fight.events.every(e=>Number.isFinite(e.damage)&&e.damage>=0&&e.hp.every(Number.isFinite)),'finite battle damage');
assert.ok(js.includes('dnaFrames.push(dnaFrame('),'recording feeds analyser');
assert.ok(js.includes('setCurrent({...gen(seed,audioDNA?.voice||v,audioDNA),voiceClip})'),'DNA drives character creation');
assert.ok(js.includes('音声特性：'),'local combat uses voice abilities');
assert.ok(js.includes('const traits=fighters.map('),'auto combat uses voice abilities');
assert.ok(js.includes('const CAPTURE_MS=2000'),'extended recording');
console.log('AUDIO DNA PASS | 36 features, deterministic generation, growth, abilities, backups, local combat, recording wiring');

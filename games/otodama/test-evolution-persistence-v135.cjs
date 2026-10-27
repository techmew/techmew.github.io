'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js);new vm.Script(js);
const start=js.indexOf('function compactCreature('),end=js.indexOf('function exportSave()',start);
assert.ok(start>0&&end>start,'isolated save/restore code');
const snippet=js.slice(start,end);
const clip='data:audio/wav;base64,QUJDRA==';
const mkVoice=()=>({vol:40,pitch:50,res:60,rhythm:70,stable:80,breath:50});
const mock={clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),levelOf:c=>c.level||1,rarityOf:c=>c.rarity||'B',
 validAudioDNA:()=>null,clipData:c=>c.voiceClip?.startsWith('data:audio/')?c.voiceClip:null,
 gen:(seed,voice)=>({seed,voice,stats:[45,46,47,48,49],level:1,type:'小動物',rank:'B'})};
const api=vm.runInNewContext(snippet+';({compactCreature,restoreCreature})',mock);
const old={seed:123456,voice:mkVoice(),stats:[51,53,55,57,59],rarity:'S+',level:30,xp:1,evolutionVoices:[
 {voice:mkVoice(),signature:10,focus:'リズム',addedAt:10,boost:[2,0,1,0,0],voiceClip:clip},
 {voice:mkVoice(),signature:20,focus:'響き',addedAt:20,boost:[0,2,0,1,0],voiceClip:clip}]};
const persisted=JSON.parse(JSON.stringify(old));
const restored=api.restoreCreature(persisted);
assert.equal(restored.evolutionVoices.length,2);
assert.equal(restored.evolutionVoices[0].voiceClip,clip,'recorded evolution voice survives browser JSON round-trip');
assert.equal(restored.evolutionVoices[1].voiceClip,clip);
assert.equal(restored.level,30);
assert.equal(restored.rarity,'S+');
assert.equal(restored.stats[0],51);
const backup=api.compactCreature(restored);
assert.ok(!backup.evolutionVoices[0].voiceClip,'downloadable backup excludes recording bytes');
const corrupt=JSON.parse(JSON.stringify(old));corrupt.evolutionVoices[0].voiceClip='https://evil.example/test';
assert.equal(api.restoreCreature(corrupt).evolutionVoices[0].voiceClip,'','reject external voice reference');
const huge=JSON.parse(JSON.stringify(old));huge.evolutionVoices[0].voiceClip='data:audio/wav;base64,'+'A'.repeat(100000);
assert.equal(api.restoreCreature(huge).evolutionVoices[0].voiceClip,'','reject oversized voice data');
assert.match(html,/オンラインへの録音声送信は停止中/);
assert.match(js,/creature:\{seed:cur\.seed,parts:cur\.parts,voice:cur\.voice,stats:cur\.stats/,'PvP sends stats preview but not recorded voice');
console.log('EVOLUTION PERSISTENCE v135 PASS | saved voices survive reload; sanitized export, corrupted URL and quota bounds');

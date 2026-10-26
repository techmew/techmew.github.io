// Normal language and existing-save compatibility regression.
// Run: node test-naming-v107.cjs
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script,'embedded JavaScript');new vm.Script(script,{filename:'index.html'});
const part=(start,end)=>{
 const a=script.indexOf(start),b=script.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'missing section '+start);return script.slice(a,b);
};
const code=part('const LEGACY_NAME_TITLES=','const ELEMS=')+
 '\n'+part('function hash(n){','function gen(');
const lib=new Function(code+'return {NAME_VARIATIONS,COMMON_NAMES,generateName,legacyGeneratedName,migrateLegacyName,displayName};')();
let checks=0;function check(cond,message){assert.ok(cond,message);checks++}
check(lib.NAME_VARIATIONS===33554432,'33,554,432 distinct possible names');
check(lib.COMMON_NAMES.length===128&&new Set(lib.COMMON_NAMES).size===128,'128 ordinary nicknames');
const found=new Set();
for(let seed=0;seed<50000;seed++){
 const full=lib.generateName(seed);
 check(/^[^\s]+ \d{6}$/.test(full),'plain nickname + individual number');
 check(!found.has(full),'no collision among first 50k seeds');
 found.add(full);
 check(lib.displayName({name:full})===full.replace(/ \d{6}$/,''),'visible short name');
}
const seed=1678719,old=lib.legacyGeneratedName(seed),modern=lib.generateName(seed);
const before={seed,name:old,level:9,xp:2,stats:[40,50,60],voiceClip:'data:audio/example'};
const after=lib.migrateLegacyName(before);
check(after!==before&&after.name===modern,'only known legacy generated name is upgraded');
check(after.voiceClip===before.voiceClip&&after.stats===before.stats&&after.level===9&&after.xp===2,'save data preserved');
check(lib.migrateLegacyName(after)===after,'one-way idempotent migration');
const custom={...before,name:'手動で付けた名前'};
check(lib.migrateLegacyName(custom)===custom,'custom names preserved');
check(lib.displayName({name:'ボス・'+modern})==='ボス・'+modern.replace(/ \d{6}$/,''),'boss displayed naturally');
const BIOMES=new Function(part('const BIOMES=','function stageBiome(')+'return BIOMES;')();
check(BIOMES.map(b=>b.name).join('|')==='空の広場|街の屋上|海の底|火山の道|夜の公園|雪の山道','six natural stage names');
const SOULS=new Function(part('const SOULS=','function soulFor(c)')+'return SOULS;')();
check(SOULS.length===6&&!SOULS.some(s=>/ラッシュ|ミラージュ|ノヴァ|ファントム|グリッチ|スパーク/.test(s.name+' '+s.skill)),'plain skill and type names');
for(const needle of ['次のバトルへ →','WIN❗️','OTODAMA_SAVE','recordBtn','stopRecordBtn','voicePreviewBtn','drawVictorySequence','migrateLegacyName(c)','displayName(cur)','data-buff="power"']){
 check(html.includes(needle),'existing gameplay feature: '+needle);
}
for(const obsolete of ['SKY BRAWL','HYPER FLIGHT','ソニック・ラッシュ','蒼天回廊','宿命のライバル']){
 // Old-name dictionaries used solely for exact save migration are excluded.
 const withoutLegacy=script.slice(script.indexOf('const ELEMS='));
 check(!withoutLegacy.includes(obsolete),'no obsolete visible naming in the new game: '+obsolete);
}
console.log('PASS '+checks+' naming/legacy-save assertions (Node only; not browser or actual microphone)');

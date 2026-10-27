'use strict';
// Node/V8 mock regression: this is not a real browser or Android test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'embedded game source');
new vm.Script(script,{filename:'otodama-game.js'});
assert.match(html,/id="rosterShowAll"/);
assert.match(css,/\.roster-lock\[aria-pressed="true"\]/);
assert.match(css,/@media\(max-width:420px\)\{\.gallerygrid\{grid-template-columns:repeat\(3/);
const extract=(first,last)=>{const a=script.indexOf(first),b=script.indexOf(last,a);assert.ok(a>=0&&b>a,'source boundary '+first);return script.slice(a,b)};
const storeFns=extract('function trimRoster(){','function renderMeter(');
const rosterFns=extract('function renderRoster(){',"let hc=$('heroCanvas')");
const saveCurrentFn=extract('function saveCurrent(){','// v0.4: decoded');
const make=(seed,locked=false)=>({seed,locked,level:1,name:'キャラ'+seed,voice:{vol:50,pitch:50,res:50,rhythm:50,stable:50,breath:50},stats:[50,50,50,50,50]});
class El{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.attrs={};this.hidden=false;this.textContent='';this.className='';this.title='';}
 append(...n){this.children.push(...n)}
 replaceChildren(...n){this.children=[...n]}
 setAttribute(k,v){this.attrs[k]=v}
 getContext(){return {}}
}
const elements=new Map(),pick=id=>{if(!elements.has(id))elements.set(id,new El());return elements.get(id)};
let saved=null,fail=false;
const ctx={console,document:{createElement:tag=>new El(tag)},$:pick,
 localStorage:{setItem(k,v){if(fail)throw Error('quota');saved={key:k,value:v}}},
 hash:n=>n>>>0,gen:seed=>make(seed),levelOf:c=>c.level||1,displayName:c=>c.name,
 drawCreature(){},setCurrent(){},trackDiscovery(){},
 roster:[],cur:make(1),rosterExpanded:false};
vm.runInNewContext(storeFns+'\n'+rosterFns+'\n'+saveCurrentFn+'\nthis.api={trimRoster,saveStore,renderRoster,saveCurrent}',ctx);
ctx.roster=[make(1,true),...Array.from({length:29},(_,i)=>make(i+2,i%6===0))];
ctx.api.renderRoster();
assert.equal(pick('roster').children.length,5,'collapsed list only draws five');
assert.equal(pick('rosterShowAll').hidden,false,'all stored creatures accessible');
assert.match(pick('rosterCount').textContent,/保護/);
pick('rosterShowAll').onclick();
assert.equal(pick('roster').children.length,30,'expanded list has all thirty');
const tile=pick('roster').children[22],lock=tile.children[1],original=ctx.roster[22].locked;
assert.equal(lock.tagName,'button','lock is a button inside a card');
assert.equal(lock.attrs['aria-pressed'],String(original),'accessible lock state');
lock.onclick();
assert.equal(ctx.roster[22].locked,!original,'lock toggle updates creature');
assert.equal(JSON.parse(saved.value)[22].locked,!original,'lock survives persistence');
fail=true;pick('roster').children[22].children[1].onclick();fail=false;
assert.equal(ctx.roster[22].locked,!original,'storage failure reverts lock state');
ctx.roster=[];ctx.cur=make(990);ctx.rosterExpanded=false;ctx.api.renderRoster();
assert.equal(pick('roster').children[0].children[1].title,'保存して保護','new character offers one-tap protection');
pick('roster').children[0].children[1].onclick();
assert.equal(ctx.roster.length,1,'one-tap protection saves character');
assert.equal(ctx.roster[0].locked,true,'newly saved character is protected');
ctx.roster=Array.from({length:30},(_,i)=>make(i+1,true));ctx.cur=make(999);ctx.api.renderRoster();
pick('roster').children[0].children[1].onclick();
assert.equal(ctx.roster.some(c=>c.seed===999),false,'all-protected roster refuses one-tap save');
const protectedSeeds=ctx.roster.filter(c=>c.locked).map(c=>c.seed);
ctx.roster.unshift(make(1001,false));ctx.api.trimRoster();
assert.equal(ctx.roster.length,30,'roster size remains capped');
assert.ok(protectedSeeds.every(id=>ctx.roster.some(c=>c.seed===id&&c.locked)),'eviction preserves every protected creature');
ctx.roster=Array.from({length:30},(_,i)=>make(i+1,true));ctx.roster.unshift(make(2000,false));
ctx.api.trimRoster();
assert.equal(ctx.roster.length,30,'fully protected roster stays at capacity');
assert.equal(ctx.roster.some(c=>c.seed===2000),false,'new unlocked entry cannot displace protected');
const merge=extract('  const keep=roster.filter(c=>c&&c.locked===true);','  const restoredDaily=');
const mergeFn=new Function('roster','nextRoster','nextCur',merge+'return {merged,restoredCurrent};');
const existing=[make(1,true),make(2,true),make(3,false)];
const incoming=[make(1,false),...Array.from({length:29},(_,i)=>make(i+4,false))];
const merged=mergeFn(existing,incoming,make(1,false));
assert.equal(merged.merged.length,30,'import respects cap');
assert.equal(merged.merged.find(c=>c.seed===1).locked,true,'import cannot unlock same-seed protected creature');
assert.equal(merged.merged.find(c=>c.seed===2).locked,true,'import cannot remove absent protected creature');
assert.equal(merged.restoredCurrent.locked,true,'selected imported creature remains protected');
const duplicates=mergeFn([make(2,true)],[make(1,false),make(1,true),make(2,false)],make(2,false));
assert.equal(duplicates.merged.length,2,'duplicate imported IDs are merged');
assert.equal(duplicates.merged.find(c=>c.seed===1).locked,true,'locked duplicate wins');
assert.equal(duplicates.merged.find(c=>c.seed===2).locked,true,'local protection wins');
const compact=extract('function compactCreature(c){','function exportSave(){');
const serializer=vm.runInNewContext('const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const validAudioDNA=()=>null;const levelOf=c=>c.level;const gen=(seed,voice)=>({...voice,seed,stats:[50,50,50,50,50]});'+compact+';({compactCreature,restoreCreature})');
assert.equal(serializer.compactCreature(make(100,true)).locked,true,'backup writes lock');
assert.equal(serializer.compactCreature(make(100,false)).locked,false,'backup writes unlocked');
assert.equal(serializer.restoreCreature(serializer.compactCreature(make(100,true))).locked,true,'backup restores lock');
const legacy=serializer.compactCreature(make(200));delete legacy.locked;
assert.equal(serializer.restoreCreature(legacy).locked,false,'old backups remain compatible');
assert.match(script,/if\(exists>=0\)\{player\.locked=roster\[exists\]\.locked===true/,'battle rewards must retain the lock');
(async()=>{
 const importSource=extract('async function importSave(file){','function renderAudioDNA(');
 const storageValues=new Map([
  ['otodama.roster','original-roster'],['otodama.progress','original-progress'],
  ['otodama.discovery','original-discovery'],['otodama.daily.clear','original-daily']
 ]);
 let failKey=null,closed=0;
 const storage={
  getItem(key){return storageValues.has(key)?storageValues.get(key):null},
  setItem(key,value){if(key===failKey){failKey=null;throw Error('quota exceeded')}storageValues.set(key,value)},
  removeItem(key){storageValues.delete(key)}
 };
 const originalRoster=[make(2,true),make(77,false)],originalCurrent=make(77);
 const importCtx={console,JSON,Map,Set,Number,Math,
  localStorage:storage,roster:originalRoster,cur:originalCurrent,
  restoreCreature:serializer.restoreCreature,
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  discoveryKey:'otodama.discovery',
  streak:4,recordStreak:8,careerWins:11,adventureStage:3,stageWins:2,stageAttempts:6,
  discovered:new Set([2]),dailyCleared:'20261026',
  closeBattle:()=>{closed++},setCurrent(){},renderCodex(){},$:pick
 };
 vm.runInNewContext(importSource+';this.runImport=importSave',importCtx);
 const data={
  format:'OTODAMA_SAVE',version:1,
  current:serializer.compactCreature(make(1,false)),
  roster:[serializer.compactCreature(make(1,false)),serializer.compactCreature(make(1,true)),serializer.compactCreature(make(2,false))],
  discovered:[0,1,1],progress:{streak:6,recordStreak:7,careerWins:8,adventureStage:9,stageWins:10,stageAttempts:11},
  dailyCleared:'20261027'
 };
 const file=()=>({size:1200,text:async()=>JSON.stringify(data)});
 failKey='otodama.progress';
 await importCtx.runImport(file());
 assert.equal(importCtx.roster,originalRoster,'failed import must not mutate active roster');
 assert.equal(importCtx.cur,originalCurrent,'failed import must not change current character');
 assert.equal(closed,0,'failed import must not close active battle');
 for(const [key,value] of [['otodama.roster','original-roster'],['otodama.progress','original-progress'],
   ['otodama.discovery','original-discovery'],['otodama.daily.clear','original-daily']]){
  assert.equal(storageValues.get(key),value,'failed import rolls back '+key);
 }
 assert.match(pick('saveNotice').textContent,/読み込み失敗/);
 await importCtx.runImport(file());
 assert.equal(closed,1,'valid import completes after storage succeeds');
 assert.equal(importCtx.roster.length,2,'import deduplicates same-seed characters');
 assert.equal(importCtx.roster.find(c=>c.seed===1).locked,true,'imported lock preserved');
 assert.equal(importCtx.roster.find(c=>c.seed===2).locked,true,'local protected character preserved');
 assert.equal(JSON.parse(storageValues.get('otodama.roster')).length,2,'persisted roster deduplicated');
 assert.equal(storageValues.get('otodama.discovery'),'[0,1]','discovery entries deduplicated');
 assert.match(pick('saveNotice').textContent,/保護キャラ1体は維持/);
 data.discovered=[99];
 await importCtx.runImport(file());
 assert.equal(closed,1,'invalid discovery must reject before mutation');
 assert.match(pick('saveNotice').textContent,/図鑑データが不正/);
 data.discovered=[0,1];
 const fullProtected=Array.from({length:30},(_,i)=>make(i+100,true));
 importCtx.roster=fullProtected;
 data.roster=Array.from({length:30},(_,i)=>serializer.compactCreature(make(i+200,true)));
 const storedBefore=storageValues.get('otodama.roster');
 await importCtx.runImport(file());
 assert.equal(importCtx.roster,fullProtected,'overflow must preserve existing 30 protected characters');
 assert.equal(storageValues.get('otodama.roster'),storedBefore,'overflow must not touch saved roster');
 assert.match(pick('saveNotice').textContent,/保護キャラが30体を超えています/);
 console.log('ROSTER LOCK PASS | 30 cards, lock rollback, one-tap, duplicate IDs, atomic import, overflow rejection, backup');
})().catch(e=>{console.error(e);process.exitCode=1});
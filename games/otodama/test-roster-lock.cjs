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
const merge=extract('  const keep=roster.filter(c=>c&&c.locked===true);','  // Persist first:');
const mergeFn=new Function('roster','nextRoster','nextCur',merge+'return {merged,restoredCurrent};');
const existing=[make(1,true),make(2,true),make(3,false)];
const incoming=[make(1,false),...Array.from({length:29},(_,i)=>make(i+4,false))];
const merged=mergeFn(existing,incoming,make(1,false));
assert.equal(merged.merged.length,30,'import respects cap');
assert.equal(merged.merged.find(c=>c.seed===1).locked,true,'import cannot unlock same-seed protected creature');
assert.equal(merged.merged.find(c=>c.seed===2).locked,true,'import cannot remove absent protected creature');
assert.equal(merged.restoredCurrent.locked,true,'selected imported creature remains protected');
const compact=extract('function compactCreature(c){','function exportSave(){');
const serializer=vm.runInNewContext('const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const validAudioDNA=()=>null;const levelOf=c=>c.level;const gen=(seed,voice)=>({...voice,seed,stats:[50,50,50,50,50]});'+compact+';({compactCreature,restoreCreature})');
assert.equal(serializer.compactCreature(make(100,true)).locked,true,'backup writes lock');
assert.equal(serializer.compactCreature(make(100,false)).locked,false,'backup writes unlocked');
assert.equal(serializer.restoreCreature(serializer.compactCreature(make(100,true))).locked,true,'backup restores lock');
const legacy=serializer.compactCreature(make(200));delete legacy.locked;
assert.equal(serializer.restoreCreature(legacy).locked,false,'old backups remain compatible');
assert.match(script,/if\(exists>=0\)\{player\.locked=roster\[exists\]\.locked===true/,'battle rewards must retain the lock');
console.log('ROSTER LOCK PASS | 30 accessible, mobile cards, persistence/rollback, eviction, import, backup/legacy');
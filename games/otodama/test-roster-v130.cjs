'use strict';
/* Ten-slot roster regression; V8/Node mocks, not a browser or microphone test. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
assert.match(html,/id="rosterCount">保存 0 \/ 10/);
assert.match(css,/\.stage>\.preview-gallery \.roster-move/);
assert.ok(html.indexOf('id="birthReveal"')>html.indexOf('<div class="listen">'));
assert.ok(html.indexOf('id="birthReveal"')<html.indexOf('id="recordBtn"'));
const extract=(a,b)=>{const i=js.indexOf(a),j=js.indexOf(b,i);assert.ok(i>=0&&j>i,a);return js.slice(i,j)};
const make=(seed,locked=false)=>({seed,locked,name:'C'+seed,level:1,xp:0,voice:{vol:50,pitch:50,res:50,rhythm:50,stable:50,breath:50},stats:[50,50,50,50,50]});
const store=new Map();let fail=false,confirm=false;
const localStorage={getItem:k=>store.get(k)??null,setItem(k,v){if(fail)throw Error('quota');store.set(k,v)},removeItem:k=>store.delete(k)};
const migCtx={roster:[],cur:make(17),localStorage,Math,JSON,Map,Set,$:()=>({}),displayName:x=>x.name,Blob:class{},URL:{},document:{},setTimeout(){}};
vm.runInNewContext(extract('const ROSTER_LIMIT=10,ROSTER_ARCHIVE_KEY=',"const DEFAULT_SERVER_URL='")+';this.api={migrateRosterToTen,archivedCreatures}',migCtx);
const initial=Array.from({length:30},(_,i)=>make(i+1,i%4===0));
migCtx.roster=initial.slice();store.set('otodama.roster',JSON.stringify(initial));store.set('otodama.lastSelected.v1',JSON.stringify({seed:17}));
assert.equal(migCtx.api.migrateRosterToTen(),true);
assert.equal(migCtx.roster.length,10);assert.equal(migCtx.api.archivedCreatures().length,20);
assert.ok(migCtx.roster.some(x=>x.seed===17));assert.equal(migCtx.roster.filter(x=>x.locked).length,8);
const original=Array.from({length:12},(_,i)=>make(i+200));migCtx.roster=original.slice();store.set('otodama.roster',JSON.stringify(original));
fail=true;assert.equal(migCtx.api.migrateRosterToTen(),false);assert.equal(migCtx.roster.length,12);assert.equal(JSON.parse(store.get('otodama.roster')).length,12);fail=false;
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.attrs={};this.dataset={};this.classList={add(){},remove(){}};this.hidden=false;this.textContent='';}
 append(...x){this.children.push(...x)} replaceChildren(...x){this.children=[...x]}
 setAttribute(k,v){this.attrs[k]=v} addEventListener(k,fn){this.listeners[k]=fn}
 getContext(){return {}} }
const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
const ctx={roster:[make(1,true),make(2),make(3)],cur:make(2),ROSTER_LIMIT:10,rosterMigrationWarning:'',archivedCreatures:()=>[],downloadArchive(){},$,localStorage,Math,JSON,Map,Set,
 window:{confirm:()=>confirm},document:{createElement:t=>new Element(t),querySelectorAll:()=>[],elementFromPoint:()=>null},
 displayName:x=>x.name,levelOf:x=>x.level,drawCreature(){},clipData:()=>false,
 cancelBirthReveal(){},trackDiscovery(){},persistSelected(){},match:null,
 gen:make,hash:n=>n>>>0,setCurrent(x){ctx.cur=x;ctx.api.renderRoster()}};
const parts=extract('function trimRoster(){','function renderMeter(')+'\n'+extract('function moveRoster(fromSeed,toSeed){',"let hc=$('heroCanvas')")+'\n'+extract('function saveNewborn(creature){','function saveCurrent(){');
vm.runInNewContext(parts+';this.api={moveRoster,saveNewborn,renderRoster,upsertCreature}',ctx);
ctx.api.renderRoster();assert.equal($('roster').children.length,3);
assert.ok($('roster').children.every(x=>x.listeners.dragstart));
assert.ok($('roster').children.every(x=>x.children.at(-1).listeners.pointerdown));
assert.equal(ctx.api.moveRoster(3,1),true);
assert.equal(ctx.roster.map(x=>x.seed).join(','),'3,1,2');
assert.equal(JSON.parse(store.get('otodama.roster'))[0].seed,3);
fail=true;assert.equal(ctx.api.moveRoster(3,2),false);assert.equal(ctx.roster.map(x=>x.seed).join(','),'3,1,2');fail=false;
ctx.roster=Array.from({length:9},(_,i)=>make(i+1));ctx.cur=make(100);
assert.equal(ctx.api.saveNewborn(ctx.cur),true);assert.equal(ctx.roster.length,10);
assert.equal(ctx.roster.at(-1).seed,100);assert.equal($('roster').children.length,10);
assert.equal(ctx.api.saveNewborn(make(101)),false);assert.equal(ctx.roster.at(-1).seed,100);
confirm=true;assert.equal(ctx.api.saveNewborn(make(101)),true);assert.equal(ctx.roster.at(-1).seed,101);
ctx.roster=Array.from({length:10},(_,i)=>make(i+1,true));
assert.equal(ctx.api.saveNewborn(make(102)),false);assert.equal(ctx.roster.length,10);
console.log('ROSTER V130 PASS: migration, archive, drag, autosave, confirmation, rollback, locks');

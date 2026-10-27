'use strict';
// Local V8/Node mock tests; not a browser, microphone or Android test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js,{filename:'otodama-preview-v129.js'});
const beforeControls=html.slice(html.indexOf('<section class="card stage">'),html.indexOf('<section class="card controls"'));
assert.ok(beforeControls.indexOf('id="heroCanvas"')>=0,'preview canvas exists');
assert.ok(beforeControls.indexOf('id="roster"')>beforeControls.indexOf('id="heroCanvas"'),'entire gallery follows preview inside stage');
assert.equal((html.match(/id="roster"/g)||[]).length,1,'single roster');
assert.doesNotMatch(html,/id="rosterShowAll"/,'no hidden extra character pages');
assert.match(css,/\.stage>\.preview-gallery \.gallerygrid/,'full roster responsive grid');
assert.match(css,/\.stage>\.preview-gallery \.roster-delete/,'delete control style');
assert.match(css,/#controlCard \.listen \.birth-reveal/,'birth overlay above microphone styled');
assert.match(css,/prefers-reduced-motion/,'motion accessibility');
const extract=(first,last)=>{const a=js.indexOf(first),b=js.indexOf(last,a);assert.ok(a>=0&&b>a,'source section '+first);return js.slice(a,b)};
const selected=extract("const lastSelectedKey='otodama.lastSelected.v1';","const DEFAULT_SERVER_URL=");
const sample=(seed)=>({seed,name:'テスト'+seed,level:1,voice:{vol:50,pitch:50,res:50,rhythm:50,stable:50,breath:50},stats:[50,50,50,50,50]});
const restore=(roster,payload)=>new Function('roster','localStorage','restoreCreature','gen',
 'let cur=gen(1678719);'+selected+'return cur;')(roster,{getItem(){return payload}},
 raw=>({...raw,restored:true}),sample);
assert.equal(restore([sample(20),sample(30)],JSON.stringify({seed:20})).seed,20,'saved fighter selected at startup');
assert.equal(restore([sample(20),sample(30)],JSON.stringify({seed:30})).seed,30,'last chosen fighter wins over roster ordering');
const snap=sample(707);
assert.equal(restore([sample(20)],JSON.stringify({seed:707,snapshot:snap})).seed,707,'unsaved generated fighter restored');
assert.equal(restore([sample(20)],JSON.stringify({seed:707,snapshot:snap,voiceClip:'data:audio/wav;base64,QUJD'})).voiceClip,'data:audio/wav;base64,QUJD','recorded clip restored in same browser');
assert.equal(restore([],JSON.stringify({seed:-1})).seed,1678719,'invalid seed ignored');
assert.equal(restore([],JSON.stringify({seed:707,snapshot:sample(7)})).seed,1678719,'mismatched snapshot rejected');
assert.equal(restore([],'not-json').seed,1678719,'corrupted last-selection storage ignored');
const persistSource=extract('function persistSelected(){','function renderMeter(');
const selections=new Map(),state={cur:sample(30),roster:[sample(30)]};
const persist=vm.runInNewContext("const lastSelectedKey='otodama.lastSelected.v1';"+persistSource+';persistSelected', {
 cur:state.cur,roster:state.roster,
 localStorage:{setItem:(key,val)=>selections.set(key,val)},
 compactCreature:x=>({...x}),clipData:x=>x.voiceClip||null
});
persist();
assert.deepEqual(Object.keys(JSON.parse(selections.get('otodama.lastSelected.v1'))),['seed'],'saved fighter stores only identifier');
const unsaved=vm.runInNewContext("const lastSelectedKey='otodama.lastSelected.v1';"+persistSource+';persistSelected', {
 cur:{...sample(708),voiceClip:'data:audio/wav;base64,QUJD'},roster:[sample(30)],
 localStorage:{setItem:(key,val)=>selections.set(key,val)},
 compactCreature:x=>({...x}),clipData:x=>x.voiceClip||null
});
unsaved();
assert.equal(JSON.parse(selections.get('otodama.lastSelected.v1')).snapshot.seed,708,'unsaved fighter snapshot persisted');
assert.match(js,/function setCurrent\(cr\)\{cancelBirthReveal\(\);cur=cr;persistSelected\(\)/,'selection saved on preview change');
const birthSource=extract('let birthRevealToken=0,birthRevealTimers=[];','function newOne(){');
const elements=new Map();
const $=id=>{if(!elements.has(id))elements.set(id,{hidden:true,dataset:{},textContent:''});return elements.get(id)};
let tasks=[],hidden=false,reduced=false;
const ctx={console,Math,$,hash:n=>n>>>0,displayName:x=>x.name,
 cur:sample(101),document:{get hidden(){return hidden}},
 window:{matchMedia:()=>({get matches(){return reduced}})},
 setTimeout:(fn,delay)=>{const task={fn,delay,canceled:false};tasks.push(task);return task},
 clearTimeout:t=>{if(t)t.canceled=true}
};
const api=vm.runInNewContext(birthSource+';({BIRTH_SCENES,startBirthReveal,cancelBirthReveal})',ctx);
assert.equal(api.BIRTH_SCENES.length,4,'four different humorous birth types');
assert.equal(new Set(Array.from(api.BIRTH_SCENES,s=>s.type)).size,4,'birth types unique');
api.startBirthReveal(ctx.cur);
assert.equal($('birthReveal').hidden,false,'birth ceremony begins over recording controls');
assert.equal($('birthReveal').dataset.phase,'charge','first phase charging');
assert.equal(tasks.length,3,'charge, hatch, reveal and cleanup scheduled');
tasks[0].fn();assert.equal($('birthReveal').dataset.phase,'hatch','middle phase works');
tasks[1].fn();assert.equal($('birthReveal').dataset.phase,'reveal','final visual reveals character');
assert.match($('birthSubline').textContent,/仲間になった/,'name shown at birth');
tasks[2].fn();assert.equal($('birthReveal').hidden,true,'overlay removed after reveal');
tasks=[];ctx.cur=sample(102);api.startBirthReveal(ctx.cur);
const oldTask=tasks[0];ctx.cur=sample(103);api.startBirthReveal(ctx.cur);
assert.equal(oldTask.canceled,true,'new character cancels stale previous birth');
oldTask.fn();assert.equal($('birthReveal').hidden,false,'stale callback cannot clear newer ceremony');
api.cancelBirthReveal();assert.equal($('birthReveal').hidden,true,'selection cancels birth safely');
tasks=[];reduced=true;ctx.cur=sample(104);api.startBirthReveal(ctx.cur);
assert.ok(tasks[2].delay<=800,'reduced-motion reveal finishes quickly');
api.cancelBirthReveal();hidden=true;api.startBirthReveal(ctx.cur);
assert.equal($('birthReveal').hidden,true,'hidden browser never animates');
assert.match(js,/setCurrent\(newborn\);saveNewborn\(newborn\);startBirthReveal\(cur\)/,'new microphone creature auto-saved before birth');
assert.doesNotMatch(extract('function newOne(){','function deleteSavedCreature(seed){'),/startBirthReveal/,'trial generator has no microphone-only ceremony');
console.log('PREVIEW/BIRTH PASS | remembered selection, all fighters shown, 4 birth scenes, stale timers, reduced motion');

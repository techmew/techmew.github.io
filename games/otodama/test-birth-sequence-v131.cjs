'use strict';
// Gacha lifecycle tests against the shipped function bodies (V8/Node mock, not a microphone test).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script);new vm.Script(script);
const record=html.indexOf('id="recordBtn"'),overlay=html.indexOf('id="birthReveal"');
const sprite=html.indexOf('id="birthCreatureCanvas"');
assert.ok(overlay>html.indexOf('<div class="listen">')&&overlay<sprite&&sprite<record,'real-character canvas is in the recording gacha overlay');
assert.match(css,/#controlCard #birthCreatureCanvas\{/,'birth canvas is styled');
assert.match(css,/data-phase="reveal"\] #birthCreatureCanvas/,'actual creature animated into the scene');
assert.match(css,/data-phase="stock"/,'stock completion gets its own state');
assert.match(script,/startBirthReveal\(newborn,\(\)=>\{setCurrent\(newborn,true\);return saveNewborn\(newborn\)\}\)/,'capture queues stock addition after reveal');
const from=script.indexOf('let birthRevealToken=0,birthRevealTimers=[],birthStockCallback=null;'),to=script.indexOf('function newOne(){',from);
assert.ok(from>0&&to>from);
const src=script.slice(from,to);
const elements=new Map(),drawn=[],events=[],tasks=[];
function $(id){
 if(!elements.has(id))elements.set(id,{hidden:true,dataset:{},textContent:'',
  width:320,height:280,getContext(){return {clearRect(){events.push('clear')}}}});
 return elements.get(id);
}
const newborn={seed:42,name:'声キャラ42',voiceClip:'data:audio/wav;base64,QUJD'};
let hidden=false;
const ctx={
 Math,$,hash:n=>n>>>0,rarityOf:()=> 'B',displayName:c=>c.name,drawCreature:(g,c)=>{drawn.push(c.seed);events.push('sprite')},
 window:{matchMedia:()=>({matches:false})},
 document:{get hidden(){return hidden}},
 roster:[],cur:newborn,clipData:c=>c?.voiceClip||null,ROSTER_LIMIT:10,recording:false,recordingRequestPending:false,
 changeCaptureButtons(active){events.push(active?'locked':'unlocked')},
 setTimeout(fn,ms){const t={fn,ms,canceled:false};tasks.push(t);return t},
 clearTimeout(t){t.canceled=true}
};
const api=vm.runInNewContext(src+';({startBirthReveal,cancelBirthReveal,getActive(){return birthRevealActive}})',ctx);
const stock=()=>{events.push('stock');ctx.roster.push(newborn);return true};
assert.equal(api.startBirthReveal(newborn,stock),true,'gacha opens after recording');
assert.equal(api.getActive(),true,'capture locked through entire ceremony');
assert.equal(ctx.roster.length,0,'not saved before gacha starts');
assert.equal($('birthCreatureCanvas').hidden,true,'real sprite hidden until hatch');
assert.equal(tasks.length,3,'hatch, reveal and stock; player closes the review');
tasks[0].fn();assert.equal($('birthReveal').dataset.phase,'hatch');assert.equal(ctx.roster.length,0);
tasks[1].fn();assert.equal($('birthReveal').dataset.phase,'reveal');
assert.equal($('birthCreatureCanvas').hidden,false,'real sprite appears in gacha overlay');
assert.deepEqual(drawn,[42],'render actual character, not a placeholder icon');
assert.equal(ctx.roster.length,0,'still no stock insertion on reveal');
tasks[2].fn();assert.equal($('birthReveal').dataset.phase,'stock');
assert.equal(ctx.roster.length,1,'stock insertion follows reveal');
assert.equal(api.getActive(),true,'recording stays locked while stock confirmation is displayed');
assert.match($('birthHeadline').textContent,/ストックに追加/);
assert.ok(events.indexOf('sprite')<events.indexOf('stock'),'real drawing precedes stock write');
assert.equal($('birthVoiceActions').hidden,false,'voice controls visible with newborn');
assert.equal($('birthVoicePlay').disabled,false,'preview button enabled');
assert.equal($('birthVoiceRetry').disabled,false,'voice-only retry available after stock commit');
assert.equal($('birthReveal').hidden,false,'birth remains visible for review');
api.cancelBirthReveal();assert.equal($('birthReveal').hidden,true,'player closes birth review');
assert.equal(api.getActive(),false,'recording unlocked only after overlay closes');
assert.equal(ctx.roster.length,1,'completion cannot double-save');
const before=tasks.length;
api.startBirthReveal({seed:43,name:'中断キャラ'},()=>{events.push('interrupted');return true});
const old=tasks[before];api.cancelBirthReveal();
assert.equal(events.filter(x=>x==='interrupted').length,1,'interrupted capture still commits character');
old.fn();assert.equal(events.filter(x=>x==='interrupted').length,1,'stale callback cannot double-commit');
hidden=true;const seen=tasks.length;
assert.equal(api.startBirthReveal({seed:44,name:'裏側キャラ'},()=>{events.push('hidden');return true}),false,'hidden page skips animation');
assert.equal(tasks.length,seen,'no invisible animation timers');
assert.equal(events.filter(x=>x==='hidden').length,1,'hidden capture safely updates stock once');
hidden=false;
api.startBirthReveal({seed:45,name:'満杯のキャラ'},()=>false);
const last=tasks.slice(-3);
last[0].fn();last[1].fn();last[2].fn();
assert.equal($('birthReveal').dataset.phase,'stock');
assert.match($('birthHeadline').textContent,/誕生/,'refused storage is not falsely announced as saved');
assert.doesNotMatch($('birthHeadline').textContent,/ストックに追加/);
api.cancelBirthReveal();
console.log('BIRTH SEQUENCE V131 PASS | record -> gacha -> actual sprite -> stock, interruption, no double-save, full capacity');

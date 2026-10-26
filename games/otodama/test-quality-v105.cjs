// Run from games/otodama: node test-quality-v105.cjs
// V8 Canvas API stubs only. This is NOT a browser, audio hardware, Android or online deployment test.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const main=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
assert.ok(main,'embedded client JavaScript must exist');
new vm.Script(main[1],{filename:'index.html#script'});
const source=main[1];
const from=source.indexOf('// Six scene-specific atmospheric layers');
const until=source.indexOf('let lastBattleFrame=0;',from);
assert.ok(from>=0&&until>from,'quality helpers present');
const helpers=source.slice(from,until);
const tones=[];
const context={tones};
vm.runInNewContext([
 'const TAU=Math.PI*2,EVENT_MS=820;',
 'const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));',
 'const guardTiming=(m,e)=>m.live?[.20,.72]:e?.tactic==="flash"?[.12,.43]:[.23,.57];',
 'const dodgeTiming=(m,e)=>m.live?[.09,.50]:e?.tactic==="flash"?[.04,.26]:[.08,.37];',
 'const strikeTiming=m=>m.live?[.30,.73]:m.nextBuff==="focus"?[.22,.74]:[.30,.66];',
 'const hash=n=>n>>>0,getRand=n=>()=>.5;',
 'const tone=(hz,duration)=>tones.push({hz,duration});',
 helpers,
 'globalThis.check={drawStageAtmosphere,drawTimingArc,drawImpactBurst,impactSfx};'
].join('\n'),context,{filename:'quality-helpers.js'});
const q=context.check;
function canvas(){
 const output={arcs:0,fills:0,strokes:0,labels:[]};
 const c={save(){},restore(){},translate(){},scale(){},beginPath(){},arc(){output.arcs++},ellipse(){},stroke(){output.strokes++},fill(){output.fills++},fillRect(){output.fills++},moveTo(){},lineTo(){},fillText(label){output.labels.push(label)}};
 return {c,output};
}
let checks=0;
function verify(predicate,label){assert.ok(predicate,label);checks++}
for(const name of ['空の広場','街の屋上','海の底','火山の道','夜の公園','雪の山道']){
 const normal=canvas(),low=canvas(),b={name,glow:'#9ddfff'};
 q.drawStageAtmosphere(normal.c,b,2.5,false);
 q.drawStageAtmosphere(low.c,b,2.5,true);
 const count=o=>o.fills+o.strokes;
 verify(count(normal.output)>0,name+' atmosphere');
 verify(count(normal.output)>=count(low.output),name+' reduced detail');
}
const m={interactive:true,live:false,done:false,pop:1000,guardUsed:false,dodgeUsed:false,dodgeCooldown:0,strikeUsed:false,turn:1,a:{seed:42},prevPos:[{x:150,y:200},{x:530,y:200}]};
const pos=[{x:150,y:200},{x:530,y:200}],attack={atk:1,resolved:false,damage:30};
let t=canvas();q.drawTimingArc(t.c,m,attack,1320,pos,false);verify(t.output.labels.includes('いまガード！'),'guard prompt window');
t=canvas();q.drawTimingArc(t.c,m,attack,1090,pos,false);verify(t.output.labels.includes('ガード')&&!t.output.labels.includes('いまガード！'),'guard too early');
m.guardUsed=true;t=canvas();q.drawTimingArc(t.c,m,attack,1320,pos,false);verify(t.output.labels.includes('入力済み'),'guard one input');m.guardUsed=false;
attack.atk=0;t=canvas();q.drawTimingArc(t.c,m,attack,1450,pos,false);verify(t.output.labels.includes('いま攻撃！'),'strike prompt');
attack.resolved=true;t=canvas();q.drawTimingArc(t.c,m,attack,1450,pos,false);verify(t.output.arcs===0,'resolved no prompts');
attack.resolved=false;m.interactive=false;t=canvas();q.drawTimingArc(t.c,m,attack,1450,pos,false);verify(t.output.arcs===0,'noninteractive no prompts');
m.interactive=true;m.current={atk:0,damage:60,impactAt:2000,impactPoint:{x:410,y:200}};
t=canvas();q.drawImpactBurst(t.c,m,2170,false);verify(t.output.fills===22,'full quality 22 shards');
t=canvas();q.drawImpactBurst(t.c,m,2170,true);verify(t.output.fills===8,'low quality eight shards');
t=canvas();q.drawImpactBurst(t.c,m,2670,false);verify(t.output.fills===0,'expired shards removed');
for(const [effect,count] of [[{dodge:true},1],[{parry:true},2],[{skill:true},2],[{strike:true},2],[{},1]]){
 const before=tones.length;q.impactSfx(33,effect);verify(tones.length-before===count,'impact SFX branch');
}
for(const feature of ['drawStageAtmosphere(canvas,biome,t,lowFx)','drawTimingArc(canvas,match,event,ms,pos,lowFx)','drawImpactBurst(canvas,match,ms,lowFx)','voiceCache.has(key)','OTODAMA_SAVE','次のバトルへ →','WIN❗️','id="timingCallout"','v0.10.']){
 verify(html.includes(feature),'preserved/integrated '+feature);
}
console.log('PASS: '+checks+' quality assertions; Canvas mocks only; Node syntax checked.');

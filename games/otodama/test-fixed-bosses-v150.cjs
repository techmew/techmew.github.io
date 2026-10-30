'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=__dirname;
const moduleBoss={exports:{}};
const bossSource=fs.readFileSync(base+'/boss-roster-v150.js','utf8');
vm.runInNewContext(bossSource,{module:moduleBoss});
const B=moduleBoss.exports,html=fs.readFileSync(base+'/index.html','utf8');
const inline=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline,'game script present');new vm.Script(inline);
assert.equal(html.includes('boss-roster-v150.js?v=150'),true,'boss data loaded before game');
assert.equal(html.includes('combat-director-v135.js?v=151'),true,'fresh combat director');
const all=Array.from({length:100},(_,i)=>B.stage(i+1));
assert.equal(all.length,100);assert.equal(new Set(all.map(x=>x.name)).size,100);
assert.equal(new Set(all.map(x=>x.seed)).size,100);
assert.equal(all.filter(x=>x.tier==='mid').length,10);
assert.equal(all.filter(x=>x.tier==='boss').length,9);
assert.equal(all.filter(x=>x.tier==='final').length,1);
for(let i=1;i<=100;i++){const s=B.stage(i);
 assert.equal(B.stage(i).name,s.name,'name deterministic');
 assert.equal(B.stage(i).seed,s.seed,'seed deterministic');
 assert.equal(s.tier,i===100?'final':i%10===0?'boss':i%10===5?'mid':'normal','correct tier');
 assert.ok(s.name.length>1&&s.area.length>1);
}
assert.equal(B.stage(100).name,'無音神 レクイエム');
assert.equal(B.stage(5).name,'鳴翼獣 スカイロア');
assert.equal(B.stage(10).name,'轟空獣 ガラノア');
for(let i=1;i<=100;i+=5){const b=B.stage(i);assert.ok(b.motif&&b.palette);}
const major=[10,20,30,40,50,60,70,80,90,100];
for(const id of major){const m=B.pickMove(id,0,1),n=B.pickMove(id,1,.25);
 assert.ok(m.name&&n.kind);assert.ok(['meteor','beam','shockwave','warp','spin','aerial','combo','uppercut','rush','counter'].includes(m.kind));
}
assert.equal(B.pickMove(100,0,1).name,'静寂侵食');
assert.equal(B.pickMove(100,0,.5).name,'崩響の獣化');
assert.equal(B.pickMove(100,0,.1).name,'終聲・無音核');
const result={max:[160,380],events:[
 {atk:0,kind:'rush',damage:24,hp:[160,330]},
 {atk:1,kind:'rush',damage:20,hp:[140,330]},
 {atk:1,kind:'rush',damage:20,hp:[120,225]},
 {atk:1,kind:'rush',damage:20,hp:[100,60]}]};
const damages=result.events.map(e=>e.damage),originalHP=result.events.map(e=>e.hp.slice());
B.decorate(result,100);
assert.deepEqual(result.events.map(e=>e.damage),damages,'visual attacks cannot falsify damage');
assert.deepEqual(result.events.map(e=>e.hp),originalHP,'visual attacks cannot overwrite combat HP');
assert.equal(result.events[0].bossMove,undefined);
assert.equal(result.events[3].bossMove,'終聲・無音核');
const fns=['save','restore','scale','rotate','translate','beginPath','closePath','moveTo','lineTo','quadraticCurveTo','ellipse','arc','fill','stroke'];
for(const id of [5,10,20,30,40,50,60,70,80,90,100]){
 const ctx={calls:0};for(const name of fns)ctx[name]=()=>{ctx.calls++};
 assert.equal(B.draw(ctx,{stageBoss:B.stage(id),seed:id},3,{lowFx:id%2===0}),true);
 assert.ok(ctx.calls>50,'complex original Canvas silhouette for STAGE '+id);
}
const ctx={};assert.equal(B.draw(ctx,{stageBoss:B.stage(1)},0),false);
const gen=seed=>({seed,stats:[55,55,55,55,55],parts:{color:0},voice:{},name:'通常敵',element:'風'});
const first=inline.indexOf('function stageEnemy('),last=inline.indexOf('function showStage()',first);
assert.ok(first>=0&&last>first);
const make=new Function('window','gen','GROWTH','hash','levelOf','clamp','isRivalStage','learningRelief',
 inline.slice(first,last)+';return stageEnemy;');
const enemy=make({OtodamaBosses:B},gen,{MAX_LEVEL:100},n=>n>>>0,c=>c.level, (v,a,b)=>Math.max(a,Math.min(b,v)),()=>false,()=>0);
for(const stage of [1,5,10,49,50,100]){
 const a=enemy(stage,{seed:12,level:60},0),b=enemy(stage,{seed:13,level:24},5);
 assert.equal(a.seed,b.seed,'fixed opponent appearance across attempts and player choices');
 assert.equal(a.name,B.stage(stage).name);
 assert.equal(a.stageBoss.tier,B.stage(stage).tier);
 assert.equal(a.stage,stage);
}
assert.ok(html.includes('window.OtodamaBosses.decorate(outcome,b.stage)'),'boss attacks connected to simulator');
assert.ok(html.includes('window.OtodamaBosses.draw(c,cr,t,'),'boss rendering connected');
assert.ok(html.includes('Lv.10〜90'),'Lv100/ten-voice rules maintained');
for(const id of ['evolveBtn','evoRecord','evoListen','evoRetry','evoConfirm','fightBtn','shareVoice','receiveVoice']){
 assert.equal(html.split('id="'+id+'"').length-1,1,'preserve game control '+id);
}
console.log('FIXED BOSS V150 PASS | 100 fixed opponents, 20 bosses, all Canvas silhouettes, 3 phases, save/voice controls, simulator linkage');

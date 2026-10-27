'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'game script');
const start=script.indexOf('function setConnectionUI(connected){');
const end=script.indexOf('function cancelRandomSearch(',start);
assert.ok(start>0&&end>start,'online handoff controller');
const nodes=new Map();
const $=id=>{
 if(!nodes.has(id))nodes.set(id,{checked:id==='survivalChallengerOptIn',hidden:true,textContent:'',style:{},classList:{toggle(){},contains(){return true}},querySelector(){return {textContent:''}}});
 return nodes.get(id);
};
let now=1500;
const calls=[],timers=[];
const cpu=mode=>({mode,done:false,live:false,turn:2,pop:1000,current:{impactAt:1200},resumeCpuTick:()=>calls.push('cpu-tick')});
const ctx={
 match:cpu('COM MATCH'),survivalActive:false,queueWs:null,ws:null,battleInterval:123,
 $: $,document:{hidden:false},performance:{now:()=>now},Date,Math,Number,JSON,console,EVENT_MS:720,
 setInterval:(fn,ms)=>{assert.equal(ms,720);calls.push('resume-interval');return 456},
 serverBase:()=> 'https://server.example',localStorage:{setItem(){}},
 clearInterval:x=>calls.push('stop-interval'),clearAutoAction:()=>calls.push('stop-auto'),hideMatchIntro:()=>calls.push('hide-intro'),
 stopBgm:()=>calls.push('stop-music'),stopAttackVoices:()=>calls.push('stop-voices'),startBgm:()=>calls.push('resume-music'),
 announceChallenger:()=>calls.push('banner'),
 roomMessage:msg=>calls.push('message'),
 leaveRoom:()=>calls.push('leave-room'),doCom:()=>calls.push('new-CPU'),
 nextSurvivalBattle:()=>calls.push('new-survival'),doDaily:()=>calls.push('new-daily'),
 cancelRandomSearch:()=>calls.push('cancel-search'),startRandomMatch:()=>calls.push('start-search'),
 setTimeout:(fn,ms)=>{const obj={fn,ms,cancelled:false};timers.push(obj);return obj},
 clearTimeout:t=>{if(t)t.cancelled=true}
};
vm.runInNewContext(script.slice(start,end)+`\n globalThis.handoff={startChallengerHandoff,restoreCpuAfterHandoff,resumeInterruptedCpu,scheduleHandoffTimeout,canSearchPvP,maybeQueuePvP,setPvPAcceptance,get active(){return challengerHandoff},get retryAt(){return lastHandoffFailure}}`,ctx);
const h=ctx.handoff;
assert.match(script,/match\.resumeCpuTick=live\?null:act/,'CPU tick retained');
assert.match(script,/if\(challengerHandoff\)\{aframe=requestAnimationFrame\(battleDraw\);return;\}/,'hit clock frozen');
assert.match(script,/if\(challengerHandoff\)restoreCpuAfterHandoff\(\);clearAutoAction/,'hidden tab abort');
const oldCpu=ctx.match;
assert.equal(h.canSearchPvP(),true,'CPU is eligible with acceptance enabled');
assert.equal(h.startChallengerHandoff(),true,'handoff starts');
assert.equal(h.active,true,'handoff pending');
assert.equal(ctx.battleInterval,null,'CPU interval stops');
assert.ok(calls.includes('stop-interval')&&calls.includes('stop-auto')&&calls.includes('banner'),'visual cut-in freezes CPU');
assert.equal(h.canSearchPvP(),false,'no second match during handoff');
h.scheduleHandoffTimeout();assert.equal(timers.at(-1).ms,17000,'handoff failure deadline');
now=6500;h.restoreCpuAfterHandoff();
assert.equal(h.active,false,'handoff cleared');
assert.equal(ctx.match,oldCpu,'same CPU fight');
assert.equal(ctx.match.pop,6000,'pause time excluded');
assert.equal(ctx.match.current.impactAt,6200,'impact time adjusted');
assert.equal(ctx.battleInterval,456,'CPU interval restored');
assert.ok(calls.includes('leave-room')&&calls.includes('resume-interval')&&calls.includes('resume-music'),'CPU resumed without reroll');
assert.equal(ctx.$('challengerBanner').hidden,true,'banner closed after failure');
ctx.battleInterval=123;ctx.match=cpu('SURVIVAL');ctx.survivalActive=true;now=7000;
assert.equal(h.startChallengerHandoff(),true);
ctx.document.hidden=true;now=8000;h.restoreCpuAfterHandoff();
assert.equal(ctx.battleInterval,null,'hidden tab does not restart battle');
assert.equal(ctx.match.mode,'SURVIVAL','survival round unchanged');
ctx.document.hidden=false;now=10000;
assert.equal(h.resumeInterruptedCpu(ctx.match),true,'foreground CPU resumes');
assert.equal(ctx.match.pop,4000,'background pause counted once');
assert.equal(ctx.battleInterval,456);
ctx.survivalActive=false;ctx.match=cpu('COM MATCH');ctx.battleInterval=123;
h.setPvPAcceptance(false);
assert.equal(ctx.$('survivalChallengerOptIn').checked,false,'home OFF');
assert.equal(ctx.$('battleChallengerOptIn').checked,false,'battle OFF synchronized');
assert.equal(h.canSearchPvP(),false,'OFF prevents searching');
h.setPvPAcceptance(true);
assert.equal(ctx.$('battleChallengerOptIn').checked,true,'battle ON synchronized');
console.log('ARCADE HANDOFF TEST PASS | CPU state preserved, time freeze, background resume, cooldown, ON/OFF');

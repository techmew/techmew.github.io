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
const calls=[],timers=[];
const ctx={
 match:{mode:'COM MATCH',done:false,live:false},survivalActive:false,queueWs:null,ws:null,battleInterval:123,
 $: $,document:{hidden:false},performance:{now:()=>1500},Date,Math,Number,JSON,console,
 serverBase:()=> 'https://server.example',localStorage:{setItem(){}},
 clearInterval:x=>calls.push('stop-interval'),clearAutoAction:()=>calls.push('stop-auto'),hideMatchIntro:()=>calls.push('hide-intro'),
 stopBgm:()=>calls.push('stop-music'),stopAttackVoices:()=>calls.push('stop-voices'),
 announceChallenger:()=>calls.push('banner'),
 roomMessage:msg=>calls.push('message'),
 leaveRoom:()=>calls.push('leave-room'),doCom:()=>calls.push('new-CPU'),
 nextSurvivalBattle:()=>calls.push('new-survival'),doDaily:()=>calls.push('new-daily'),
 cancelRandomSearch:()=>calls.push('cancel-search'),startRandomMatch:()=>calls.push('start-search'),
 setTimeout:(fn,ms)=>{const obj={fn,ms,cancelled:false};timers.push(obj);return obj},
 clearTimeout:t=>{if(t)t.cancelled=true}
};
vm.runInNewContext(script.slice(start,end)+`\n globalThis.handoff={startChallengerHandoff,restoreCpuAfterHandoff,scheduleHandoffTimeout,canSearchPvP,maybeQueuePvP,setPvPAcceptance,get active(){return challengerHandoff},get retryAt(){return lastHandoffFailure}}`,ctx);
const h=ctx.handoff;
assert.equal(h.canSearchPvP(),true,'CPU is eligible with acceptance enabled');
assert.equal(h.startChallengerHandoff(),true,'handoff starts');
assert.equal(h.active,true,'handoff pending');
assert.equal(ctx.battleInterval,null,'CPU interval stops');
assert.ok(calls.includes('stop-interval')&&calls.includes('stop-auto')&&calls.includes('banner'),'visual cut-in freezes CPU');
assert.equal(h.canSearchPvP(),false,'no second match during handoff');
h.scheduleHandoffTimeout();assert.equal(timers.at(-1).ms,17000,'handoff failure deadline');
h.restoreCpuAfterHandoff();
assert.equal(h.active,false,'handoff cleared');
assert.ok(calls.includes('leave-room')&&calls.includes('new-CPU'),'network failure falls back to CPU');
assert.equal(ctx.$('challengerBanner').hidden,true,'banner closed after failure');
ctx.match={mode:'SURVIVAL',done:false,live:false};
ctx.survivalActive=true;
assert.equal(h.startChallengerHandoff(),true);
h.restoreCpuAfterHandoff();
assert.ok(calls.includes('new-survival'),'survival resumes at current round');
ctx.survivalActive=false;ctx.match={mode:'COM MATCH',done:false,live:false};
h.setPvPAcceptance(false);
assert.equal(ctx.$('survivalChallengerOptIn').checked,false,'home OFF');
assert.equal(ctx.$('battleChallengerOptIn').checked,false,'battle OFF synchronized');
assert.equal(h.canSearchPvP(),false,'OFF prevents searching');
h.setPvPAcceptance(true);
assert.equal(ctx.$('battleChallengerOptIn').checked,true,'battle ON synchronized');
console.log('ARCADE HANDOFF TEST PASS | CPU freeze, visual cut-in, timeout, PvP exclusion, reconnect fallback, survival preservation, synchronized ON/OFF');

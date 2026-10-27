'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js);new vm.Script(js);
const paceSource=fs.readFileSync(__dirname+'/pvp-pace-v139.js','utf8'),paceModule={exports:{}};
vm.runInNewContext(paceSource,{module:paceModule});
const a=js.indexOf('let pvpPaceState=null;'),b=js.indexOf('function cancelRandomSearch(',a);
assert.ok(a>0&&b>a,'deferred challenger functions exist');
const events=[],outbox=[],timers=[],nodes=new Map();
let now=10_000_000;
class FakeDate extends Date{static now(){return now}}
const get=id=>{if(!nodes.has(id))nodes.set(id,{checked:false,hidden:true,textContent:'',classList:{contains:x=>x==='open'},style:{}});return nodes.get(id)};
get('battleModal').classList.contains=x=>x==='open';
let storage=new Map();
const ctx={Date:FakeDate,Math,JSON,console,window:{OtodamaPvpPace:paceModule.exports},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
 performance:{now:()=>now},document:{hidden:false},$:get,match:{done:false,live:false,mode:'COM MATCH',pop:7000,current:{impactAt:7300}},
 queueWs:null,ws:null,EVENT_MS:820,survivalActive:false,
 serverBase:()=> 'https://otodama.example',
 setTimeout:(fn,ms)=>{const t={fn,ms,cancelled:false};timers.push(t);return t},clearTimeout:t=>{if(t)t.cancelled=true},
 clearInterval:()=>events.push('clearInterval'),setInterval:()=>77,clearAutoAction:()=>events.push('clearAuto'),
 hideMatchIntro:()=>events.push('hideIntro'),stopBattleSpeech:()=>events.push('stopSpeech'),stopBgm:()=>events.push('stopBgm'),
 stopAttackVoices:()=>events.push('stopVoices'),startBgm:()=>events.push('startBgm'),clearResultTimers:()=>events.push('clearResult'),
 announceChallenger:()=>events.push('announce'),setConnectionUI:()=>{},
 roomMessage:msg=>events.push(msg),cancelRandomSearch:()=>events.push('cancelSearch'),
 startRandomMatch:()=>events.push('search'),leaveRoom:()=>{events.push('leaveRoom');ctx.ws=null},
 advanceAfterWin:()=>events.push('nextCpu')
};
vm.runInNewContext(js.slice(a,b)+
 ';globalThis.api={pvpPace,startChallengerHandoff,restoreCpuAfterHandoff,activatePendingChallenge,readyForDeferredChallenger,canSearchPvP,maybeQueuePvP,setPvPAcceptance,putPending:x=>pendingChallenge=x,get active(){return challengerHandoff},get retry(){return lastHandoffFailure}}',ctx);
const api=ctx.api;ctx.match.done=false;
api.setPvPAcceptance(true);
assert.equal(api.canSearchPvP(),false,'first 10min or five CPU rounds must pass');
assert.equal(api.startChallengerHandoff(),false,'cannot interrupt unfinished CPU fight');
assert.equal(events.includes('clearInterval'),false,'uninterrupted CPU interval still active');
for(let i=0;i<5;i++)api.pvpPace.completedCpu(now+i*60000);
now+=600000;
assert.equal(api.canSearchPvP(),true,'eligible after both gates');
api.maybeQueuePvP();assert.ok(events.includes('search'),'starts matchmaking only when eligible');
api.putPending({code:'ABCDEF',at:now,players:2});
ctx.ws={readyState:1,send:raw=>outbox.push(JSON.parse(raw))};
assert.equal(api.startChallengerHandoff(),false,'still cannot interrupt CPU before its result');
ctx.match.done=true;
assert.equal(api.activatePendingChallenge(ctx.match),true,'handoff starts only on completed CPU result');
assert.equal(api.active,true);
assert.equal(outbox.filter(x=>x.type==='ready').length,1,'one ready packet sent after fight');
assert.equal(api.readyForDeferredChallenger(),false,'duplicate server ready blocked');
assert.ok(timers.some(t=>t.ms===60000),'room setup time bounded');
now+=4500;
api.restoreCpuAfterHandoff();
assert.equal(api.active,false);
assert.ok(events.includes('nextCpu'),'failed handoff advances completed CPU result');
api.setPvPAcceptance(false);assert.equal(api.canSearchPvP(),false,'OFF blocks future queue');
assert.equal(get('battleChallengerOptIn').checked,false,'home and battle switches synchronized');
console.log('HANDOFF V139 PASS | true CPU completion required, deferred room READY, failure resumes next round, opt-in gate');

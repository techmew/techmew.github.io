'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'embedded game script');
new vm.Script(script);
const start=script.indexOf('function setConnectionUI(connected){');
const end=script.indexOf('function joinRoom(',start);
assert.ok(start>0&&end>start,'matchmaking controller');
const nodes=new Map();
const $=id=>{
 if(!nodes.has(id))nodes.set(id,{
  checked:id==='survivalChallengerOptIn',hidden:true,textContent:'',disabled:false,style:{},
  classList:{toggle(){},contains(name){return name==='open'}},
 });
 return nodes.get(id);
};
const timers=[];
const sockets=[];
const messages=[];
let now=500000;
class FakeDate extends Date {static now(){return now}}
class FakeSocket {
 static OPEN=1;
 constructor(url){this.url=url;this.readyState=0;this.sent=[];sockets.push(this)}
 send(data){if(this.readyState!==1)throw Error('socket not open');this.sent.push(JSON.parse(data))}
 close(){this.readyState=3;this.onclose?.()}
 open(){this.readyState=1;this.onopen?.()}
 receive(data){this.onmessage?.({data:JSON.stringify(data)})}
}
const ctx={
 match:{mode:'COM MATCH',live:false,done:false,turn:2,pop:1000,current:{impactAt:1100},resumeCpuTick(){}},
 survivalActive:false,ws:null,queueWs:null,battleInterval:123,EVENT_MS:720,
 reconnectTimer:null,resumeToken:'',reconnectCount:0,room:null,side:-1,
 autoReadyRoom:false,remoteVoiceClip:'',sentVoice:false,voiceConsentSent:false,
 $: $,document:{hidden:false},Date:FakeDate,performance:{now:()=>now},WebSocket:FakeSocket,
 setTimeout:(fn,ms)=>{const t={fn,ms,cancelled:false};timers.push(t);return t},
 clearTimeout:t=>{if(t)t.cancelled=true},
 setInterval:()=>456,clearInterval:()=>{},
 clearAutoAction:()=>{},hideMatchIntro:()=>{},stopBgm:()=>{},stopAttackVoices:()=>{},startBgm:()=>{},
 announceChallenger:()=>{},serverBase:()=> 'https://otodama-room.example',
 localStorage:{setItem(){}},roomMessage:message=>messages.push(message),
 joinRoom:()=>{throw Error('unexpected room join')},
 console,Math,Number,JSON
};
vm.runInNewContext(script.slice(start,end)+
 '\n globalThis.queueTest={startRandomMatch,setPvPAcceptance,canSearchPvP,startChallengerHandoff,maybeQueuePvP,cancelRandomSearch,get queue(){return queueWs},get pending(){return {connect:queueConnectTimer,wait:queueWaitTimer,retry:matchmakingRetryTimer}},get handoff(){return challengerHandoff}}',ctx);
const h=ctx.queueTest;
assert.equal(h.canSearchPvP(),true);
h.startRandomMatch();
assert.equal(sockets.length,1);
assert.match(sockets[0].url,/\/random$/);
assert.equal(h.pending.connect.ms,12000,'connect deadline');
sockets[0].open();
assert.deepEqual(sockets[0].sent[0],{type:'search'});
assert.equal(h.pending.connect,null,'connect deadline cleared on open');
assert.equal(h.pending.wait.ms,125000,'waiting-room deadline matches Worker 120s expiry');
const oldWait=h.pending.wait;
h.setPvPAcceptance(false);
assert.equal(h.queue,null,'OFF closes matchmaking');
assert.equal(oldWait.cancelled,true,'OFF clears queue timeout');
assert.equal(h.pending.wait,null);
h.setPvPAcceptance(true);
assert.equal(sockets.length,2,'ON restarts eligible CPU search');
const second=sockets[1];second.open();
ctx.document.hidden=true;
second.receive({type:'matched',code:'ABCDEF'});
assert.equal(h.handoff,false,'no NEW CHALLENGER while backgrounded');
assert.equal(h.queue,null,'late matched socket cleaned');
assert.equal(h.startChallengerHandoff(),false,'direct hidden cut-in denied');
ctx.document.hidden=false;
h.maybeQueuePvP();
assert.equal(sockets.length,3);
const third=sockets[2];
const connectTimeout=h.pending.connect;
connectTimeout.fn();
assert.equal(h.queue,null,'CONNECTING timeout frees queue');
assert.equal(h.pending.connect,null,'timeout cleared');
assert.ok(h.pending.retry&&h.pending.retry.ms>0&&h.pending.retry.ms<=12000,'failure cooldown before retry');
assert.equal(third.readyState,3,'stale socket closed');
assert.equal(h.canSearchPvP(),true,'CPU remains eligible after network failure');
assert.match(script,/window.addEventListener\('pagehide',[\s\S]*?cancelRandomSearch\(true\)/,'pagehide closes queue');
assert.match(script,/window.addEventListener\('pageshow',[\s\S]*?event.persisted/,'BFCache return rechecks search');
console.log('QUEUE RESILIENCE PASS: connection/wait timeout, OFF, hidden match, stale socket, cooldown, BFCache hooks');

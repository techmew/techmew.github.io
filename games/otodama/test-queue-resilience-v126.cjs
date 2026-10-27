'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(js);new vm.Script(js);
const m={exports:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/pvp-pace-v139.js','utf8'),{module:m});
const a=js.indexOf('let pvpPaceState=null;'),b=js.indexOf('function joinRoom(',a);assert.ok(a>0&&b>a);
let now=50000000;class FakeDate extends Date{static now(){return now}}
const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,{checked:false,disabled:false,style:{},value:'',textContent:'',classList:{contains:x=>x==='open'}});return nodes.get(id)};
const sockets=[],timers=[],messages=[],joined=[];
class Socket{
 static OPEN=1;
 constructor(url){this.url=url;this.readyState=0;this.sent=[];sockets.push(this)}
 send(s){assert.equal(this.readyState,1);this.sent.push(JSON.parse(s))}
 close(){this.readyState=3;this.onclose?.()}
 open(){this.readyState=1;this.onopen?.()}
 receive(packet){this.onmessage?.({data:JSON.stringify(packet)})}
}
const ctx={window:{OtodamaPvpPace:m.exports},Date:FakeDate,Math,JSON,console,WebSocket:Socket,
 performance:{now:()=>now},document:{hidden:false},$: $,
 localStorage:{getItem:()=>null,setItem(){}},
 match:{mode:'COM MATCH',done:false,live:false,current:{impactAt:99},pop:1},queueWs:null,ws:null,room:null,side:-1,EVENT_MS:820,
 survivalActive:false,battleInterval:23,reconnectTimer:null,resumeToken:'',reconnectCount:0,autoReadyRoom:false,
 remoteVoiceClip:'',sentVoice:false,voiceConsentSent:false,
 setTimeout:(fn,ms)=>{const o={fn,ms,cancelled:false};timers.push(o);return o},clearTimeout:t=>{if(t)t.cancelled=true},
 clearInterval(){},setInterval(){return 23},clearAutoAction(){},hideMatchIntro(){},stopBattleSpeech(){},clearResultTimers(){},
 stopBgm(){},stopAttackVoices(){},startBgm(){},announceChallenger(){},setConnectionUI(){},forgetRemoteVoice(){},
 serverBase:()=> 'https://otodama.example',roomMessage:s=>messages.push(s),
 joinRoom:(code,auto)=>joined.push({code,auto}),advanceAfterWin(){}
};
vm.runInNewContext(js.slice(a,b)+
 ';globalThis.q={pvpPace,setPvPAcceptance,canSearchPvP,startRandomMatch,maybeQueuePvP,cancelRandomSearch,get pending(){return pendingChallenge},get queue(){return queueWs},get connect(){return queueConnectTimer},get wait(){return queueWaitTimer},get retry(){return matchmakingRetryTimer},setSuspended:v=>pageSuspended=v}',ctx);
const q=ctx.q;q.setPvPAcceptance(true);for(let k=0;k<5;k++)q.pvpPace.completedCpu(now+k*50000);now+=600001;
assert.equal(q.canSearchPvP(),true);
q.startRandomMatch();assert.equal(sockets.length,1);
assert.match(sockets[0].url,/\/random$/);assert.equal(q.connect.ms,12000);
sockets[0].open();assert.equal(sockets[0].sent[0].type,'search');assert.equal(q.wait.ms,125000);
ctx.document.hidden=true;sockets[0].receive({type:'matched',code:'ABCDEF'});
assert.equal(joined.length,0,'backgrounded phone must not join PvP room');
assert.equal(q.pending,null,'no unfinishable background handoff');
ctx.document.hidden=false;q.startRandomMatch();const second=sockets.at(-1);
second.open();second.receive({type:'matched',code:'ABCDEF'});
assert.equal(joined.length,1,'foreground match joins room');
assert.equal(joined[0].code,'ABCDEF');
assert.equal(ctx.match.done,false,'match still playing CPU fight');
assert.ok(q.pending,'match pending, not interrupting');
q.setPvPAcceptance(false);assert.equal(q.pending,null,'OFF drops waiting match');
assert.equal(q.canSearchPvP(),false,'OFF stops all matchmaking');
q.setPvPAcceptance(true);assert.equal(q.canSearchPvP(),false,'ON requires fresh CPU and cooldown quota');
assert.match(js,/window.addEventListener\('pagehide',[\s\S]*?cancelRandomSearch\(true\)/,'pagehide closes queue');
assert.match(js,/window.addEventListener\('pageshow',[\s\S]*?event.persisted/,'BFCache resume path');
console.log('QUEUE RESILIENCE v139 PASS | CONNECT/SEARCH deadlines, mobile background race, deferred room, OFF cancellation and cooloff');

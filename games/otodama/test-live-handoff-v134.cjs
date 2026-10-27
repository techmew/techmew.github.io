'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(js);new vm.Script(js);
const pace={exports:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/pvp-pace-v139.js','utf8'),{module:pace});
const begin=js.indexOf('function setConnectionUI(connected){'),end=js.indexOf('function hydrate(obj)',begin);
assert.ok(begin>0&&end>begin);
let now=10000000;class Clock extends Date{static now(){return now}}
const sockets=[],timers=[],messages=[],begun=[],dom=new Map();
const $=id=>{if(!dom.has(id))dom.set(id,{checked:false,textContent:'',disabled:false,hidden:true,value:'',style:{},classList:{toggle(){},contains:x=>x==='open'}});return dom.get(id)};
class Socket{
 static OPEN=1;
 constructor(url){this.url=url;this.readyState=0;this.sent=[];sockets.push(this)}
 send(value){assert.equal(this.readyState,1);this.sent.push(JSON.parse(value))}
 open(){this.readyState=1;this.onopen?.()}
 recv(msg){this.onmessage?.({data:JSON.stringify(msg)})}
 close(){this.readyState=3;this.onclose?.()}
}
const ctx={window:{OtodamaPvpPace:pace.exports},Date:Clock,Math,Number,JSON,console,
 match:{mode:'COM MATCH',turn:2,done:false,live:false,pop:1000,current:null,resumeCpuTick(){}},
 ws:null,queueWs:null,room:null,side:-1,autoReadyRoom:false,remoteVoiceClip:'',sentVoice:false,voiceConsentSent:false,
 resumeToken:'',reconnectCount:0,reconnectTimer:null,battleInterval:321,survivalActive:false,EVENT_MS:820,
 $: $,document:{hidden:false},performance:{now:()=>now},WebSocket:Socket,
 setTimeout:(fn,ms)=>{const t={fn,ms,cancelled:false};timers.push(t);return t},clearTimeout:t=>{if(t)t.cancelled=true},
 setInterval:()=>334,clearInterval(){},clearAutoAction(){},hideMatchIntro(){},clearResultTimers(){},stopBattleSpeech(){},
 stopBgm(){},stopAttackVoices(){},startBgm(){},announceChallenger(){},forgetRemoteVoice(){},offerRecordedVoice(){},
 serverBase:()=> 'https://otodama-room.nekokichi005.workers.dev',
 localStorage:{getItem:()=>null,setItem(){}},roomMessage:msg=>messages.push(msg),
 beginLiveBattle:data=>{begun.push(data);ctx.match.live=true},
 sendVoiceConsent(){},receiveLiveTurn(){},receiveLiveAck(){},receiveLiveImpact(){},endLiveBattle(){},refreshRanking(){},
 clipData:()=>null,unlockBattleAudio(){},advanceAfterWin(){},
 cur:{seed:33,parts:{},voice:{},stats:[40,40,40,40,40],name:'テスト',element:'音',type:'音型',rank:'B'},rankingToken:''
};
const api=vm.runInNewContext(js.slice(begin,end)+
 ';({pvpPace,startRandomMatch,maybeQueuePvP,canSearchPvP,activatePendingChallenge,restoreCpuAfterHandoff,get waiting(){return challengerHandoff},get pending(){return pendingChallenge},get roomSocket(){return ws},get readySent(){return roomReadySent}})',ctx);
$('survivalChallengerOptIn').checked=true;
api.pvpPace.enable(now);for(let k=0;k<5;k++)api.pvpPace.completedCpu(now+k*45000);now+=600001;
assert.equal(api.canSearchPvP(),true);
api.startRandomMatch();assert.equal(sockets.length,1);
sockets[0].open();assert.equal(sockets[0].sent[0].type,'search');
sockets[0].recv({type:'matched',code:'ABCDEF'});
assert.equal(api.waiting,false,'CPU continues after discovering challenger');
assert.equal(ctx.match.done,false);assert.ok(api.pending,'room reservation stored');
assert.equal(sockets.length,2,'room connection established in background');
const room=sockets[1];room.open();assert.equal(room.sent[0].type,'join');assert.equal(room.sent[0].creature.seed,33);
room.recv({type:'session',token:'a'.repeat(32)});
room.recv({type:'state',me:0,youReady:false,players:[{name:'1'}]});
room.recv({type:'state',me:0,youReady:false,players:[{name:'1'},{name:'2'}]});
assert.equal(room.sent.filter(p=>p.type==='ready').length,0,'never ready before CPU fight ends');
assert.equal(api.waiting,false,'no battle pause during CPU');
ctx.match.done=true;assert.equal(api.activatePendingChallenge(ctx.match),true);
assert.equal(api.waiting,true,'handoff only at finished CPU');
room.recv({type:'state',me:0,youReady:false,players:[{name:'1'},{name:'2'}]});
assert.equal(room.sent.filter(p=>p.type==='ready').length,1,'one ready on CPU finish');
assert.equal(api.readySent,true);
assert.ok(timers.some(t=>t.ms===60000),'bounded handoff wait');
room.recv({type:'live_start',creatures:[{seed:33},{seed:56}],max:[140,150]});
assert.equal(begun.length,1,'real server live_start triggers game handoff');
assert.equal(api.canSearchPvP(),false,'no second queue during live fight');
assert.match(js,/if\(!m\.live&&activatePendingChallenge\(m\)\)return/);
assert.match(js,/function restoreCpuAfterHandoff\(\)/);
console.log('LIVE HANDOFF V139 PASS | CPU unbroken, delayed READY, one handshake, match starts only on server live_start');

'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js);new vm.Script(js);
const begin=js.indexOf('function setConnectionUI(connected){');
const end=js.indexOf('function hydrate(obj)',begin);
assert.ok(begin>0&&end>begin,'online client functions');
let now=500000;
const clocks=[],sockets=[],messages=[],begun=[];
class Socket{
 static OPEN=1;
 constructor(url){this.url=url;this.readyState=0;this.sent=[];sockets.push(this)}
 send(value){if(this.readyState!==1)throw Error('closed socket');this.sent.push(JSON.parse(value))}
 open(){this.readyState=1;this.onopen?.()}
 recv(msg){this.onmessage?.({data:JSON.stringify(msg)})}
 close(){this.readyState=3;this.onclose?.()}
}
const dom=new Map();
const $=id=>{
 if(!dom.has(id))dom.set(id,{checked:id==='survivalChallengerOptIn',textContent:'',disabled:false,hidden:true,value:'',
  style:{},classList:{toggle(){},contains(x){return x==='open'}}});
 return dom.get(id);
};
const ctx={
 match:{mode:'COM MATCH',turn:2,done:false,live:false,pop:1000,current:null,resumeCpuTick(){}},
 ws:null,queueWs:null,room:null,side:-1,onlineReady:false,autoReadyRoom:false,
 remoteVoiceClip:'',sentVoice:false,voiceConsentSent:false,resumeToken:'',reconnectCount:0,reconnectTimer:null,
 battleInterval:321,survivalActive:false,EVENT_MS:820,
 $: $,document:{hidden:false},Date:class extends Date{static now(){return now}},
 performance:{now:()=>now},WebSocket:Socket,Math,Number,JSON,console,
 setTimeout:(fn,ms)=>{const t={fn,ms,cancelled:false};clocks.push(t);return t},
 clearTimeout:t=>{if(t)t.cancelled=true},
 setInterval:()=>334,clearInterval:()=>{},clearAutoAction(){},hideMatchIntro(){},
 stopBgm(){},stopAttackVoices(){},startBgm(){},announceChallenger(){},
 setConnectionUI:null,
 serverBase:()=> 'https://otodama-room.nekokichi005.workers.dev',
 localStorage:{setItem(){}},roomMessage:msg=>messages.push(msg),
 beginLiveBattle:data=>{begun.push(data);ctx.match.live=true},
 sendVoiceConsent(){},receiveLiveTurn(){},receiveLiveAck(){},receiveLiveImpact(){},
 endLiveBattle(){},refreshRanking(){},clipData:()=>null,
 restoreCpuBattle:0,unlockBattleAudio(){},cur:{seed:33,parts:{},voice:{},stats:[40,40,40,40,40],name:'テスト',element:'音',type:'音型',rank:'B'},rankingToken:'',
 $readyBar:{}
};
const api=vm.runInNewContext(js.slice(begin,end)+';({startRandomMatch,maybeQueuePvP,canSearchPvP,restoreCpuAfterHandoff,get waiting(){return challengerHandoff},get roomSocket(){return ws},get readySent(){return roomReadySent}})',ctx);
assert.equal(api.canSearchPvP(),true,'CPU allows opt-in queue');
api.startRandomMatch();
assert.equal(sockets.length,1);
sockets[0].open();
assert.equal(sockets[0].sent[0].type,'search');
sockets[0].recv({type:'matched',code:'ABCDEF'});
assert.equal(api.waiting,true,'CPU paused when matched');
assert.equal(sockets.length,2,'joined matching room after search');
const room=sockets[1];room.open();
assert.equal(room.sent[0].type,'join');
assert.equal(room.sent[0].creature.seed,33,'matching room receives selected fighter');
room.recv({type:'session',token:'a'.repeat(32)});
room.recv({type:'state',me:0,youReady:false,players:[{name:'1'}]});
assert.equal(room.sent.filter(x=>x.type==='ready').length,0,'wait for second participant');
room.recv({type:'state',me:0,youReady:false,players:[{name:'1'},{name:'2'}]});
room.recv({type:'state',me:0,youReady:false,players:[{name:'1'},{name:'2'}]});
assert.equal(room.sent.filter(x=>x.type==='ready').length,1,'auto-ready is idempotent under repeated state');
assert.equal(api.readySent,true);
assert.ok(clocks.some(x=>x.ms===30000),'mobile handshake gets 30 seconds');
room.recv({type:'live_start',creatures:[{seed:33},{seed:56}],max:[140,150]});
assert.equal(begun.length,1,'online begins on server live_start');
assert.equal(api.waiting,true,'mocked battle begin does not mutate internal handoff; real begin does');
assert.equal(api.canSearchPvP(),false,'no second queue during live battle');
assert.match(js,/function restoreCpuAfterHandoff\(\)/,'failed match restores CPU');
assert.match(js,/if\(challengerHandoff&&!match\?\.live\)\{restoreCpuAfterHandoff\(\)\}/,'socket close restores CPU when waiting');
console.log('LIVE HANDOFF V134 PASS | matched room, join, both players, one ready, live_start and queue lock');


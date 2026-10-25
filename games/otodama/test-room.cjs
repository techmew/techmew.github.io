const fs=require('fs'),vm=require('vm'),assert=require('assert');
let source=fs.readFileSync(__dirname+'/worker.js','utf8').replace("import { DurableObject } from 'cloudflare:workers';",'class DurableObject {constructor(state){this.ctx=state}}')
 .replace("import { sanitizePublicName } from './moderation.js';",fs.readFileSync(__dirname+'/moderation.js','utf8').replace(/export /g,'')).replace('export default {','const defaultExport = {').replace('export class Room extends DurableObject','class Room extends DurableObject').replace('export class Matchmaker extends DurableObject','class Matchmaker extends DurableObject');
source+='\nglobalThis.testing={Room,Matchmaker,defaultExport};';
let fakeNow=Date.now();class TestDate extends Date{static now(){return fakeNow}}
const ctx={crypto:globalThis.crypto,Response:globalThis.Response,console,Math,Number,Array,JSON,Date:TestDate,Uint8Array,Set,RegExp,String};vm.runInNewContext(source,ctx);
function fake(){return {readyState:1,data:{creature:null,ready:false},messages:[],deserializeAttachment(){return this.data},serializeAttachment(obj){this.data=obj},send(message){this.messages.push(JSON.parse(message))},close(){this.readyState=3}};}
const a=fake(),b=fake(),memory=new Map();const storage={get:async key=>memory.get(key),put:async(key,value)=>memory.set(key,value),delete:async key=>memory.delete(key),setAlarm:async time=>{storage.alarmAt=time}};const room=new ctx.testing.Room({getWebSockets:()=>[a,b],storage});
const creature={name:'検証キャラ',seed:555,element:'音',type:'テスト',rank:'A',parts:{family:4},voice:{vol:40,pitch:60,res:58,rhythm:75,stable:55,breath:63},stats:[95,95,95,95,95]};
(async()=>{
 assert.equal(room.cleanCreature([]),null,'array creature accepted');
 await room.webSocketMessage(a,'null');await room.webSocketMessage(a,'[]');
 assert.equal(a.messages.filter(x=>x.type==='error').length,2,'invalid JSON primitives should be rejected');
 await room.webSocketMessage(a,JSON.stringify({type:'join',creature}));
 await room.webSocketMessage(b,JSON.stringify({type:'join',creature:{...creature,seed:556}}));
 assert.ok(a.messages.some(x=>x.type==='state'));
 const statsA=a.data.creature.stats;assert.notEqual(statsA[0],95,'raw cheating stats accepted');
 assert.equal(room.cleanCreature({...creature,name:'死ね',type:'死ね',element:'違法',rank:'S'}).name,'オトダマ-FF');
 assert.equal(room.cleanCreature({...creature,name:'死ね',type:'死ね',element:'違法',rank:'S'}).element,'音');assert.ok(statsA.every(x=>x<95));
 await room.webSocketMessage(a,JSON.stringify({type:'voice',clip:''}));
 assert.equal(b.messages.filter(x=>x.type==='voice').length,1);
 await room.webSocketMessage(a,JSON.stringify({type:'voice',clip:''}));
 assert.equal(b.messages.filter(x=>x.type==='voice').length,1,'duplicate voice forwarded');
 await room.webSocketMessage(a,JSON.stringify({type:'ready'}));
 assert.equal(a.messages.filter(x=>x.type==='battle').length,0);
 await room.webSocketMessage(b,JSON.stringify({type:'ready'}));
 const x=a.messages.find(m=>m.type==='live_start'),y=b.messages.find(m=>m.type==='live_start');
 assert.ok(x&&y,'missing authoritative live start');assert.equal(x.max[0],y.max[1]);
 const t=a.messages.find(m=>m.type==='live_turn');assert.ok(t,'missing live telegraph');
 await room.webSocketMessage(a,JSON.stringify({type:'ready'}));await room.webSocketMessage(b,JSON.stringify({type:'ready'}));
 assert.equal(a.messages.filter(m=>m.type==='live_start').length,1,'ready spam restarted live match');
 assert.equal(t.atk,0);assert.equal(b.messages.find(m=>m.type==='live_turn').atk,1,'turn orientation mismatch');
 // Defender presses guard within server-owned timing window. Attacker cannot parry own attack.
 // RTT measured by a server-issued nonce, not an untrusted client clock.
 const ping=b.messages.find(m=>m.type==='live_ping');assert.ok(ping?.nonce);
 fakeNow+=180;await room.webSocketMessage(b,JSON.stringify({type:'pong',nonce:ping.nonce}));
 assert.equal(b.data.rtt,180);
 fakeNow+=520; // 700ms after telegraph; valid only with bounded latency compensation.
 await room.webSocketMessage(a,JSON.stringify({type:'action',action:'guard',seq:0}));
 await room.webSocketMessage(b,JSON.stringify({type:'action',action:'guard',seq:0}));
 assert.equal(b.messages.find(m=>m.type==='live_ack'&&m.action==='guard').valid,true);
 await room.webSocketMessage(a,JSON.stringify({type:'action',action:'stance',value:'rush'}));
 fakeNow+=200;await room.alarm();
 const first=a.messages.find(m=>m.type==='live_impact');assert.ok(first.parry,'server parry not applied');assert.ok(first.damage<=2,'parry failed to mitigate');
 assert.ok(first.hp[0]<x.max[0],'parry reflect missing');
 fakeNow+=280;await room.alarm();
 const next=a.messages.filter(m=>m.type==='live_turn').at(-1);assert.equal(next.seq,1);assert.equal(next.atk,1);
 fakeNow+=170;await room.webSocketMessage(a,JSON.stringify({type:'action',action:'dodge',seq:1}));
 assert.equal(a.messages.filter(m=>m.type==='live_ack'&&m.action==='dodge').at(-1).valid,true);
 fakeNow+=730;await room.alarm();
 const second=a.messages.filter(m=>m.type==='live_impact').at(-1);assert.equal(second.damage,0,'server dodge failed');
 assert.equal(second.dodge,true);
 // Exhaust the 40-turn server cap with alarm callbacks (no client-supplied damage).
 for(let i=0;i<90&&!a.messages.some(m=>m.type==='live_end');i++){
   fakeNow+=900;await room.alarm();
 }
 assert.ok(a.messages.some(m=>m.type==='live_end'),'authoritative battle did not finish');
 assert.equal(a.messages.at(-1).type,'live_end');
 assert.equal(a.messages.at(-1).winner,1-b.messages.at(-1).winner,'winner orientation');
 await room.webSocketMessage(a,JSON.stringify({type:'ready'}));await room.webSocketMessage(b,JSON.stringify({type:'ready'}));
 assert.equal(a.messages.filter(m=>m.type==='live_start').length,2,'second online match did not start');
 b.close();await room.webSocketClose(b);
 assert.ok(a.messages.some(m=>m.type==='live_forfeit'),'disconnect must award remaining player');
 assert.equal(await storage.get('live'),undefined,'disconnect must clean active match');
 assert.equal(a.data.ready,false);assert.equal(b.data.ready,false);
 for(let i=0;i<35;i++)await room.webSocketMessage(a,JSON.stringify({type:'unknown'}));
 assert.equal(a.readyState,3,'rate limiter must close spam socket');
 console.log('ROOM TEST PASS | two players, anti-stat-injection, voice once, live telegraph, server guard/dodge, outcome, rate limit');
})().catch(e=>{console.error(e);process.exit(1)});

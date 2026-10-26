const fs=require('fs'),vm=require('vm'),assert=require('assert');
let source=fs.readFileSync(__dirname+'/worker.js','utf8')
 .replace("import { DurableObject } from 'cloudflare:workers';",'class DurableObject {constructor(state){this.ctx=state}}')
 .replace("import { sanitizePublicName, isForbiddenName } from './moderation.js';",fs.readFileSync(__dirname+'/moderation.js','utf8').replace(/export /g,''))
 .replace('export default {','const defaultExport = {')
 .replace('export class Room extends DurableObject','class Room extends DurableObject')
 .replace('export class Matchmaker extends DurableObject','class Matchmaker extends DurableObject').replace('export class Rankings extends DurableObject','class Rankings extends DurableObject');
source+='\nglobalThis.testing={Room,Matchmaker,defaultExport};';
let fakeNow=Date.now();class TestDate extends Date{static now(){return fakeNow}}
const ctx={crypto:globalThis.crypto,Response:globalThis.Response,WebSocketPair:class {},console,Math,Number,Array,JSON,Date:TestDate,Uint8Array,Set,RegExp,String};
vm.runInNewContext(source,ctx);
const FakeSocket=()=>({readyState:1,data:{status:'connected',time:fakeNow},messages:[],deserializeAttachment(){return this.data},serializeAttachment(obj){this.data=obj},send(message){this.messages.push(JSON.parse(message))},close(){this.readyState=3}});
const a=FakeSocket(),b=FakeSocket(),w3=FakeSocket(),sockets=[a,b,w3];
const mmStorage={alarmAt:0,setAlarm:async t=>{mmStorage.alarmAt=t}};
const mm=new ctx.testing.Matchmaker({getWebSockets:()=>sockets,storage:mmStorage});
(async()=>{
 await mm.webSocketMessage(a,'null');await mm.webSocketMessage(a,'[]');
 assert.equal(a.data.status,'connected','malformed queue message changed status');
 await mm.webSocketMessage(a,JSON.stringify({type:'search'}));
 assert.equal(a.messages.length,0);
 await mm.webSocketMessage(b,JSON.stringify({type:'search'}));
 assert.equal(a.messages[0].type,'matched');assert.equal(b.messages[0].code,a.messages[0].code);
 assert.equal(a.messages[0].code.length,6);assert.equal(a.readyState,3);assert.equal(b.readyState,3);
 await mm.webSocketMessage(w3,JSON.stringify({type:'search'}));assert.equal(w3.messages.length,0);assert.ok(mmStorage.alarmAt>=fakeNow+120000,'queue expiry alarm not scheduled');
 fakeNow+=120001;await mm.alarm();assert.equal(w3.readyState,3,'stale queue socket not expired');
 const w4=FakeSocket(),w5=FakeSocket();sockets.push(w4,w5);await mm.webSocketMessage(w4,JSON.stringify({type:'search'}));await mm.webSocketMessage(w4,JSON.stringify({type:'cancel'}));assert.equal(w4.readyState,3,'cancel did not close queued socket');
 await mm.webSocketMessage(w5,JSON.stringify({type:'search'}));assert.equal(w5.messages.length,0);fakeNow+=120001;await mm.alarm();assert.equal(w5.readyState,3,'unmatched queue not expired');
 const idle=FakeSocket();sockets.push(idle);await mm.pair();assert.equal(mmStorage.alarmAt,fakeNow+30000,'unsearched socket alarm');
 fakeNow+=30001;await mm.alarm();assert.equal(idle.readyState,3,'unsearched socket expires');
 const spam=FakeSocket();sockets.push(spam);for(let i=0;i<21;i++)await mm.webSocketMessage(spam,'{}');assert.equal(spam.readyState,3,'queue flood closes socket');
 const lone=FakeSocket();lone.data={creature:null,openedAt:fakeNow};const idleRoom=new ctx.testing.Room({getWebSockets:()=>[lone],storage:{get:async()=>null}});fakeNow+=30001;await idleRoom.alarm();assert.equal(lone.readyState,3,'room idle alarm');
 const saturated=new ctx.testing.Matchmaker({getWebSockets:()=>Array.from({length:64},FakeSocket),storage:mmStorage});
 assert.equal((await saturated.fetch()).status,503,'saturated matchmaking queue must reject new sockets');
 const room=new ctx.testing.Room({getWebSockets:()=>[]});
 const c=room.cleanCreature({name:'test',type:'声魂',seed:777,parts:{family:11,crest:29,back:15,pattern:23,legs:15},voice:{vol:90,pitch:50,res:55,rhythm:65,stable:60,breath:48},stats:[70,40,50,60,90]});
 assert.equal(c.parts.family,11);assert.equal(c.parts.crest,29);assert.notEqual(c.stats[0],70,'posted stats must be ignored');
 const fight=room.simulate(c,c);assert.ok(fight.events.length>1);
 console.log('MATCHMAKER TEST PASS | same room code:',a.messages[0].code,'| creature:',c.parts.family,'| fight turns:',fight.events.length);
})().catch(e=>{console.error(e);process.exit(1)});

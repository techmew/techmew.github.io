const fs=require('fs'),vm=require('vm'),assert=require('assert');
let source=fs.readFileSync(__dirname+'/worker.js','utf8').replace("import { DurableObject } from 'cloudflare:workers';",'class DurableObject {constructor(state){this.ctx=state}}')
 .replace("import { sanitizePublicName } from './moderation.js';",fs.readFileSync(__dirname+'/moderation.js','utf8').replace(/export /g,'')).replace('export default {','const defaultExport = {').replace('export class Room extends DurableObject','class Room extends DurableObject').replace('export class Matchmaker extends DurableObject','class Matchmaker extends DurableObject');
source+='\nglobalThis.testing={Room,Matchmaker,defaultExport};';
const ctx={crypto:globalThis.crypto,Response:globalThis.Response,console,Math,Number,Array,JSON,Date,Uint8Array,Set,RegExp,String};vm.runInNewContext(source,ctx);
function fake(){return {readyState:1,data:{creature:null,ready:false},messages:[],deserializeAttachment(){return this.data},serializeAttachment(obj){this.data=obj},send(message){this.messages.push(JSON.parse(message))},close(){this.readyState=3}};}
const a=fake(),b=fake();const room=new ctx.testing.Room({getWebSockets:()=>[a,b]});
const creature={name:'検証キャラ',seed:555,element:'音',type:'テスト',rank:'A',parts:{family:4},voice:{vol:40,pitch:60,res:58,rhythm:75,stable:55,breath:63},stats:[95,95,95,95,95]};
(async()=>{
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
 const x=a.messages.find(m=>m.type==='battle'),y=b.messages.find(m=>m.type==='battle');
 assert.ok(x&&y,'missing battle');assert.equal(x.outcome.winner,y.outcome.winner);assert.equal(x.outcome.events.length,y.outcome.events.length);
 assert.equal(a.data.ready,false);assert.equal(b.data.ready,false);
 for(let i=0;i<35;i++)await room.webSocketMessage(a,JSON.stringify({type:'unknown'}));
 assert.equal(a.readyState,3,'rate limiter must close spam socket');
 console.log('ROOM TEST PASS | two players, no stat injection, voice once, shared outcome, ready reset');
})().catch(e=>{console.error(e);process.exit(1)});

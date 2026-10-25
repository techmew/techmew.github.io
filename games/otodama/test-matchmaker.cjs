const fs=require('fs'),vm=require('vm'),assert=require('assert');
let source=fs.readFileSync(__dirname+'/worker.js','utf8')
 .replace("import { DurableObject } from 'cloudflare:workers';",'class DurableObject {constructor(state){this.ctx=state}}')
 .replace('export default {','const defaultExport = {')
 .replace('export class Room extends DurableObject','class Room extends DurableObject')
 .replace('export class Matchmaker extends DurableObject','class Matchmaker extends DurableObject');
source+='\nglobalThis.testing={Room,Matchmaker,defaultExport};';
const ctx={crypto:globalThis.crypto,Response:globalThis.Response,WebSocketPair:class {},console,Math,Number,Array,JSON,Date,Uint8Array,Set,RegExp,String};
vm.runInNewContext(source,ctx);
const FakeSocket=()=>({readyState:1,data:{status:'connected',time:0},messages:[],deserializeAttachment(){return this.data},serializeAttachment(obj){this.data=obj},send(message){this.messages.push(JSON.parse(message))},close(){this.readyState=3}});
const a=FakeSocket(),b=FakeSocket(),w3=FakeSocket(),sockets=[a,b,w3];
const mm=new ctx.testing.Matchmaker({getWebSockets:()=>sockets});
(async()=>{
 await mm.webSocketMessage(a,JSON.stringify({type:'search'}));
 assert.equal(a.messages.length,0);
 await mm.webSocketMessage(b,JSON.stringify({type:'search'}));
 assert.equal(a.messages[0].type,'matched');assert.equal(b.messages[0].code,a.messages[0].code);
 assert.equal(a.messages[0].code.length,6);assert.equal(a.readyState,3);assert.equal(b.readyState,3);
 await mm.webSocketMessage(w3,JSON.stringify({type:'search'}));assert.equal(w3.messages.length,0);
 const room=new ctx.testing.Room({getWebSockets:()=>[]});
 const c=room.cleanCreature({name:'test',parts:{family:11,crest:29,back:15,pattern:23,legs:15},voice:{vol:90},stats:[70,40,50,60,90]});
 assert.equal(c.parts.family,11);assert.equal(c.parts.crest,29);
 const fight=room.simulate(c,c);assert.ok(fight.events.length>1);
 console.log('MATCHMAKER TEST PASS | same room code:',a.messages[0].code,'| creature:',c.parts.family,'| fight turns:',fight.events.length);
})().catch(e=>{console.error(e);process.exit(1)});

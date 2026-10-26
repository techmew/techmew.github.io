// Node 22 regression: simulated browser audio and Durable Object sockets.
// No Android microphone, real speaker, Cloudflare deployment, or live browser is exercised.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {TextEncoder}=require('node:util');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const client=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
const worker=fs.readFileSync(__dirname+'/worker.js','utf8');
assert.ok(client,'embedded game JavaScript');
new vm.Script(client,{filename:'index.html'});
const slice=(start,end)=>{const a=client.indexOf(start),b=client.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'missing '+start);return client.slice(a,b)};
assert.ok(html.includes('id="matchIntro"')&&html.includes('id="campaignTrack"'),'campaign progression UI');
assert.ok(html.includes('name="viewport"')&&html.includes('id="audioResumeBtn"'),'mobile/audio controls');
assert.ok(client.includes('if(won)scheduleNextAfterQuote(m)'),'winner advances');
assert.ok(client.includes("if(!won){$('rematchBtn').textContent="),'loser stops');
assert.ok(client.includes('function pcmWavDataUrl(')&&client.includes('function stopRecord('),'record/stop retained');
assert.ok(client.includes('function exportSave(')&&client.includes('function importSave('),'save import/export retained');

const starts=[],banners=[],data='data:audio/wav;base64,ZGVtbw==';
const creature={seed:42,voiceClip:data,voice:{rhythm:40}};
const key=creature.seed+'_'+data.length+'_'+data.slice(-32);
const gainParam={setValueAtTime(){},linearRampToValueAtTime(){}};
const ac={currentTime:2,createBufferSource(){return{playbackRate:{value:1},connect(){},start(...args){starts.push(args)},stop(){}}},createGain(){return{gain:gainParam,connect(){}}}};
const battle={done:false,mode:'COM MATCH',turn:2,live:false,a:creature,b:creature};
const ui={mutedCheck:{checked:false},muteOpponentVoice:{checked:false},arenaEffect:{textContent:''}};
const soundCtx={
 match:battle,$:id=>ui[id]||{},VOLUME:()=>.18,unlockBattleAudio:()=>ac,
 voiceOutput:()=>({}),trackAttackSource:()=>{},synthVoice:()=>{},
 voiceCache:new Map([[key,{buffer:{duration:1},offset:.1,duration:.65,gain:1.8}]]),
 pendingVoice:new Map(),performance:{now:()=>1000},hash:()=>0,
 showRushBanner:x=>banners.push(x),bgmDuckUntil:0,lastSoundStatus:''
};
const sound=vm.runInNewContext(slice('function clipData(cr)','function previewRecordedVoice()')+';({attackVoice,maybeSpecialRush})',soundCtx);
sound.attackVoice(creature,0,{hits:2});
assert.equal(starts.length,2,'2-hit combo should have two voices');
assert.ok(starts[1][0]>starts[0][0],'voices must be staggered');
sound.attackVoice(creature,0,{hits:5});assert.equal(starts.length,7,'5-hit combo');
const ev={skill:true,atk:0};
assert.equal(sound.maybeSpecialRush(battle,ev),true,'special triggers on selected deterministic seed');
assert.equal(starts.length,14,'7-hit special');
assert.equal(banners.length,1,'special banner');
assert.equal(sound.maybeSpecialRush(battle,ev),false,'special once per attack');
sound.attackVoice(creature,0);assert.equal(starts.length,15,'normal single voice');
const button={textContent:''};
let testVolume=0;
const audioCtx={battleSoundCtx:{state:'running'},$:id=>id==='audioResumeBtn'?button:{checked:false},VOLUME:()=>testVolume};
const sync=vm.runInNewContext(slice('function syncAudioResumeButton(){','function unlockBattleAudio(){')+';syncAudioResumeButton',audioCtx);
sync();assert.ok(button.textContent.includes('0%'),'zero volume status');
testVolume=.18;sync();assert.ok(button.textContent.includes('音声ON'),'running audio status');
audioCtx.battleSoundCtx.state='suspended';sync();assert.ok(button.textContent.includes('声を再開'),'suspended status');

const live={live:true,done:false,turn:3,current:{seq:3,atk:0,resolved:true}};
const old=live.current;let replay=0;
const turnCtx={match:live,hideMatchIntro(){},clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),
 performance:{now:()=>100},$:()=>({textContent:''}),attackVoice(){replay++},
 updateActionHud(){},BATTLE_LABEL:{},displayName:c=>c.name};
const turn=vm.runInNewContext(slice('function receiveLiveTurn(data){','function receiveLiveAck(data){')+';receiveLiveTurn',turnCtx);
turn({seq:3,atk:0,resumed:true,duration:900});
assert.equal(live.current,old,'resumed packet must not roll back resolved hit');
assert.equal(replay,0,'resumed packet must not replay attack voice');
live.current={seq:4,atk:0,resolved:false};live.turn=4;
Object.assign(live,{hp:[100,100],max:[100,100],prevPos:[{x:1,y:2},{x:3,y:4}],charge:30,awakened:[false,false],skillsUsed:0,strikes:0});
let impacts=0;
const impactCtx={match:live,performance:{now:()=>100},$:()=>({style:{},textContent:''}),
 clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),displayName:c=>c?.name||'x',
 impactSfx(){impacts++},updateActionHud(){}};
const impact=vm.runInNewContext(slice('function receiveLiveImpact(data){','function endLiveBattle(data){')+';receiveLiveImpact',impactCtx);
const packet={seq:4,atk:0,damage:20,hp:[100,80],charge:[50,10]};
impact({...packet,atk:1});assert.equal(impacts,0,'spoofed attack side rejected');
impact({...packet,charge:[900,10]});assert.equal(impacts,1,'valid hit still processed');
assert.equal(live.charge,30,'invalid charge must not be adopted');
impact(packet);assert.equal(impacts,1,'duplicate hit rejected');

const stub=worker.replace("import { DurableObject } from 'cloudflare:workers';",
 'class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env}}')
 .replace("import { sanitizePublicName, isForbiddenName } from './moderation.js';",
 'const sanitizePublicName=x=>x,isForbiddenName=()=>false;')
 .replace('export default {','const workerDefault={')
 .replace(/export class /g,'class ');
const classes=vm.runInNewContext(stub+';({Room,Matchmaker})',{
 TextEncoder,Response,Request,URL,crypto:globalThis.crypto
});
const ctx={getWebSockets:()=>[]},room=new classes.Room(ctx,{}),mm=new classes.Matchmaker(ctx,{});
function socket(){return{readyState:1,attachment:{creature:null,ready:false,openedAt:Date.now(),status:'connected',time:Date.now()},
 closed:[],deserializeAttachment(){return this.attachment},serializeAttachment(v){this.attachment=v},
 send(){},close(code){this.closed.push(code);this.readyState=3}}}
async function testSockets(){
 const ws=socket();await room.webSocketMessage(ws,'{"type":"pong"}');
 for(let i=0;i<29;i++)await room.webSocketMessage(ws,'{');
 assert.equal(ws.attachment.rateCount,30,'malformed JSON must consume room rate limit');
 await room.webSocketMessage(ws,'{');assert.equal(ws.closed[0],1008,'room flood rejected');
 const unicode=socket();await room.webSocketMessage(unicode,JSON.stringify({type:'pong',value:'あ'.repeat(3000)}));
 assert.equal(unicode.closed[0],1009,'room UTF-8 byte limit');
 const binary=socket();await room.webSocketMessage(binary,new Uint8Array([1]));
 assert.equal(binary.closed[0],1003,'room binary packet rejected');
 const mUnicode=socket();await mm.webSocketMessage(mUnicode,JSON.stringify({type:'search',value:'あ'.repeat(90)}));
 assert.equal(mUnicode.closed[0],1009,'matchmaker UTF-8 byte limit');
 const mBinary=socket();await mm.webSocketMessage(mBinary,new Uint8Array([1]));
 assert.equal(mBinary.closed[0],1003,'matchmaker binary rejected');
 const flood=socket();for(let i=0;i<20;i++)await mm.webSocketMessage(flood,'{');
 assert.equal(flood.attachment.rateCount,20,'matchmaker rate counts malformed packets');
 await mm.webSocketMessage(flood,'{');assert.equal(flood.closed[0],1008,'matchmaker flood rejected');
 console.log('HOURLY V117 TEST PASS | voice 1/2/5/7, audio 0%/suspend, live dedup/side/charge, room/matchmaker byte/rate guards');
}
testSockets().catch(e=>{console.error(e);process.exitCode=1});

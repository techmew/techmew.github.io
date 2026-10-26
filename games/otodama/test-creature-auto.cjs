// Creature-only battles: V8 simulation + server-owned decisions. Run: node test-creature-auto.cjs
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const worker=fs.readFileSync(__dirname+'/worker.js','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'game script');new Function(script);
const start=script.indexOf('const AUTO_STYLES='),end=script.indexOf('// v0.4 kinetic airborne battle.',start);
assert.ok(start>=0&&end>start,'creature battle simulation');
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return (n^n>>>16)>>>0};
const getRand=seed=>{let x=seed>>>0;return ()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296}};
const sim=new Function('hash','levelOf','clamp','getRand','elementalEdge',
 script.slice(start,end)+'return {randCombat,specimenProfile,specimenMutation,specimenAppearance};')(
 hash,c=>c.level||1,(n,a,b)=>Math.min(b,Math.max(a,n)),getRand,()=>1);
const make=(seed,stats,level=7)=>({seed,stats,level,voice:{rhythm:60,res:60},parts:{crest:1,pattern:1,ears:1,back:1}});
assert.equal(sim.specimenMutation(make(1,[60,60,60,60,60],1)).tier,0);
assert.equal(sim.specimenMutation(make(1,[60,60,60,60,60],25)).tier,4);
let awakens=0,specials=0,rare=0,wins=[0,0];
for(let i=0;i<400;i++){
 const a=make(i+1,[60,58,56,60,57]),b=make(i+1000,[55,60,62,56,55]);
 const out=sim.randCombat(a,b);wins[out.winner]++;
 assert.ok(out.events.length>0&&out.events.length<=52,'round cap');
 assert.ok(out.events.every(e=>e.hp.length===2&&e.hp.every(h=>Number.isFinite(h)&&h>=0)),'HP validity');
 awakens+=Number(out.events.some(e=>e.awakenSide>=0));
 specials+=Number(out.events.some(e=>e.skill));
 rare+=Number(sim.specimenMutation(a).rare);
}
assert.ok(awakens>100&&specials>100&&rare>2,'battle diversity');
assert.ok(wins.every(n=>n>10),'both sides should sometimes win');
assert.ok(script.includes('if(m.spectator||!m.interactive'),'spectator timing rings disabled');
assert.ok(script.includes('autoOnly:true'),'client must opt in to creature-only online');
const source=worker.replace("import { DurableObject } from 'cloudflare:workers';",
 'class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env}}')
 .replace("import { sanitizePublicName, isForbiddenName } from './moderation.js';",
 "const sanitizePublicName=()=>'',isForbiddenName=()=>false;")
 .replace(/export default /g,'const exportedDefault = ').replace(/export class /g,'class ');
const {Room,autoRoll}=new Function(source+'return {Room,autoRoll};')();
(async()=>{
 let parries=0,dodges=0,skills=0,awakenings=0;
 for(let i=0;i<100;i++){
  const logs=[[],[]],peers=logs.map((log,seat)=>({readyState:1,
   deserializeAttachment(){return {seat,creature:{seed:seat+1}};},
   send(v){log.push(JSON.parse(v));}}));
  const storage={get:async()=>state,put:async()=>{},setAlarm:async()=>{},delete:async()=>{}};
  const room=new Room({storage,getWebSockets:()=>peers},{});
  const state={active:true,autoOnly:true,turn:i%30,atk:i%2,kind:'rush',damage:26,
   matchId:(i+1).toString(16).padStart(32,'0'),
   creatures:[{stats:[55,60,65,58,57]},{stats:[60,56,53,62,59]}],
   max:[190,190],hp:[i%3===0?60:140,i%5===0?60:140],
   charge:[70,70],stance:['balance','balance'],turnStance:['balance','balance'],
   skillArmed:[false,false],dodgeCooldown:[0,0],actions:[null,null],awakened:[false,false]};
  assert.equal(autoRoll(state,0,4),autoRoll(state,0,4),'server roll stable');
  await room.resolveLiveTurn(state,peers);
  const hit=logs[0].find(m=>m.type==='live_impact'),mirror=logs[1].find(m=>m.type==='live_impact');
  assert.ok(hit&&mirror,'both peers receive impact');
  assert.equal(hit.atk,1-mirror.atk,'seat orientation');
  assert.ok(hit.hp.every(h=>h>=0&&Number.isFinite(h)),'server HP');
  parries+=Number(hit.parry);dodges+=Number(hit.dodge);skills+=Number(hit.skill);
  awakenings+=Number(hit.awakenSide>=0);
  await room.liveAction(peers[0],{action:'strike'},peers[0].deserializeAttachment());
  assert.equal(logs[0].filter(m=>m.type==='live_ack').at(-1).reason,'creature_auto_only','client input rejected');
 }
 assert.ok(parries>0&&dodges>0&&skills>5&&awakenings>5,'auto decisions active');
 console.log('PASS: 400 COM bouts + 100 online auto turns, 2-seat packets, input rejection; Node/V8 only');
})().catch(e=>{console.error(e);process.exitCode=1});
